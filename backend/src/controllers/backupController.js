const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const mongoose = require('mongoose')
const { finished: finishedStream } = require('stream/promises')
const { Backup } = require('../models/Backup')
const { auditService } = require('../services/auditService')

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100
const RESTORE_TOKEN_BYTES = 32
const RESTORE_TOKEN_TTL_MS = 10 * 60 * 1000

// SECURITY: archives live outside the web-served /uploads tree so they can
// never be fetched by a bare URL. They are only exposed via the authenticated
// download endpoint, which resolves paths safely (basename only).
const BACKUP_DIR = path.resolve(process.env.BACKUP_DIR || path.join(__dirname, '..', '..', 'backups'))

// Collections that must never be overwritten by a restore (they are the
// platform's own infrastructure and are regenerated as needed).
const PROTECTED_COLLECTIONS = new Set(['backups', 'system.indexes'])

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true })
}

function isSafeFilename(filename) {
  const base = path.basename(String(filename || ''))
  return base && base === String(filename || '') && !base.includes('..') && !base.includes('/') && !base.includes('\\')
}

function resolveBackupPath(filename) {
  if (!isSafeFilename(filename)) return null
  const resolved = path.resolve(BACKUP_DIR, filename)
  // Defense-in-depth: resolved path must stay inside BACKUP_DIR.
  if (resolved !== path.join(BACKUP_DIR, filename) && !resolved.startsWith(BACKUP_DIR + path.sep)) return null
  return resolved
}

function parsePositiveInt(raw, fallback, max) {
  if (raw === undefined || raw === null || raw === '') return fallback
  const n = Number(raw)
  if (!Number.isInteger(n) || n < 1) return null
  return Math.min(n, max)
}

function sanitizeBackup(doc) {
  const createdBy = doc.createdBy
    ? {
        id: String(doc.createdBy._id),
        fullName: doc.createdBy.fullName || null,
        email: doc.createdBy.email || null,
        role: doc.createdBy.role || null,
      }
    : null
  const restoredBy = doc.restoredBy
    ? { id: String(doc.restoredBy._id) }
    : null
  return {
    id: String(doc._id),
    filename: doc.filename,
    originalName: doc.originalName,
    size: doc.size,
    type: doc.type,
    status: doc.status,
    checksum: doc.checksum,
    documentCount: doc.documentCount || 0,
    collectionCount: doc.collectionCount || 0,
    restoreStatus: doc.restoreStatus || null,
    notes: doc.notes || '',
    error: doc.error || null,
    restoreError: doc.restoreError || null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy,
    restoredAt: doc.restoredAt || null,
    restoredBy,
    deletedAt: doc.deletedAt || null,
  }
}

function ctxFrom(req) {
  return {
    ip: req.ip || (req.socket && req.socket.remoteAddress) || '',
    userAgent: (req.get && req.get('user-agent')) || '',
    userId: req.user ? req.user._id : null,
    userRole: req.user ? req.user.role : '',
  }
}

// Builds the archive as a single, valid JSON document using a streaming
// write so the full database never has to live in memory at once. The sha256
// is updated over each document JSON (delimiters excluded) so it can be
// recomputed during restore validation.
async function backupDb(backupDoc, filepath, ctx) {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    throw new Error('Database connection is not established')
  }
  const db = mongoose.connection.db
  const hash = crypto.createHash('sha256')
  const stream = fs.createWriteStream(filepath, { encoding: 'utf8' })

  await new Promise((resolve, reject) => {
    stream.once('open', resolve)
    stream.once('error', reject)
  })

  let totalDocs = 0
  let collCount = 0

  stream.write('{"schema":1,"createdAt":' + JSON.stringify(new Date().toISOString()))
  stream.write(',"database":' + JSON.stringify(db.databaseName))
  stream.write(',"collections":{')

  const collections = await db.listCollections({ type: 'collection' }).toArray()
  let firstColl = true
  for (const collInfo of collections) {
    const name = collInfo.name
    if (PROTECTED_COLLECTIONS.has(name)) continue

    collCount += 1
    stream.write((firstColl ? '' : ',') + JSON.stringify(name) + ':[')
    firstColl = false

    let firstDoc = true
    const cursor = db.collection(name).find({}).batchSize(1000)
    while (await cursor.hasNext()) {
      const doc = await cursor.next()
      const json = JSON.stringify(doc)
      stream.write((firstDoc ? '' : ',') + json)
      hash.update(json)
      totalDocs += 1
      firstDoc = false
    }
    stream.write(']')
  }

  stream.write('}}')

  await new Promise((resolve, reject) => {
    stream.end((err) => (err ? reject(err) : resolve()))
  })

  const checksum = hash.digest('hex')
  const stats = fs.statSync(filepath)

  await Backup.updateOne(
    { _id: backupDoc._id },
    {
      status: 'completed',
      checksum,
      size: stats.size,
      documentCount: totalDocs,
      collectionCount: collCount,
      error: null,
    }
  )

  auditService.record({
    actorId: ctx.userId,
    actorRole: ctx.userRole,
    action: 'BACKUP_CREATED',
    category: 'backup',
    status: 'success',
    targetType: 'Backup',
    targetId: backupDoc._id,
    metadata: {
      backupId: String(backupDoc._id),
      filename: backupDoc.filename,
      size: stats.size,
      documentCount: totalDocs,
      collectionCount: collCount,
      checksum,
      type: backupDoc.type,
    },
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  })
}

// Reads an archive from disk and validates it (parse + sha256 match + shape).
// Returns { schema, database, collections: { [name]: [docs] }, documentCount, collectionCount }.
async function loadAndValidateArchive(backupDoc) {
  const filepath = resolveBackupPath(backupDoc.filename)
  if (!filepath) throw Object.assign(new Error('Archive storage path is invalid'), { status: 400 })
  if (!fs.existsSync(filepath)) {
    const err = new Error('Backup archive file is missing on disk')
    err.status = 404
    throw err
  }

  const hash = crypto.createHash('sha256')
  const chunks = []
  const stream = fs.createReadStream(filepath)
  for await (const chunk of stream) {
    hash.update(chunk)
    chunks.push(chunk)
  }
  const actual = hash.digest('hex')
  if (actual !== backupDoc.checksum) {
    const err = new Error('Backup checksum mismatch — archive may be corrupted')
    err.status = 400
    throw err
  }

  let parsed
  try {
    parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch (err) {
    const e = new Error('Backup archive is not valid JSON')
    e.status = 400
    throw e
  }
  if (!parsed || typeof parsed !== 'object' || !parsed.collections || typeof parsed.collections !== 'object') {
    const err = new Error('Backup archive has an unexpected structure')
    err.status = 400
    throw err
  }

  const collectionNames = Object.keys(parsed.collections).filter((n) => !PROTECTED_COLLECTIONS.has(n))
  let documentCount = 0
  for (const name of collectionNames) {
    const docs = parsed.collections[name]
    if (!Array.isArray(docs)) {
      const err = new Error(`Backup collection '${name}' is not an array`)
      err.status = 400
      throw err
    }
    documentCount += docs.length
  }

  return {
    schema: parsed.schema,
    database: parsed.database,
    collections: collectionNames.reduce((acc, name) => {
      acc[name] = parsed.collections[name]
      return acc
    }, {}),
    documentCount,
    collectionCount: collectionNames.length,
  }
}

// Streams a snapshot of the *current* database into a separate archive so a
// successful (or failed) restore can always be rolled back.
async function takeSafetySnapshot(label) {
  ensureBackupDir()
  const filename = `safety-${label}-${Date.now()}.json`
  const filepath = path.join(BACKUP_DIR, filename)
  const db = mongoose.connection.db
  const hash = crypto.createHash('sha256')
  const stream = fs.createWriteStream(filepath, { encoding: 'utf8' })
  await new Promise((res, rej) => {
    stream.once('open', res)
    stream.once('error', rej)
  })
  let totalDocs = 0
  let collCount = 0
  stream.write('{"schema":1,"createdAt":' + JSON.stringify(new Date().toISOString()))
  stream.write(',"database":' + JSON.stringify(db.databaseName))
  stream.write(',"collections":{')
  const collections = await db.listCollections({ type: 'collection' }).toArray()
  let firstColl = true
  for (const { name } of collections) {
    if (PROTECTED_COLLECTIONS.has(name)) continue
    collCount += 1
    stream.write((firstColl ? '' : ',') + JSON.stringify(name) + ':[')
    firstColl = false
    let firstDoc = true
    const cursor = db.collection(name).find({}).batchSize(1000)
    while (await cursor.hasNext()) {
      const doc = await cursor.next()
      const json = JSON.stringify(doc)
      stream.write((firstDoc ? '' : ',') + json)
      hash.update(json)
      totalDocs += 1
      firstDoc = false
    }
    stream.write(']')
  }
  stream.write('}}')
  await new Promise((res, rej) => {
    stream.end((err) => (err ? reject(err) : res()))
  })
  const checksum = hash.digest('hex')
  const size = fs.statSync(filepath).size
  const safetyDoc = await Backup.create({
    filename,
    originalName: filename,
    size,
    type: 'safety',
    status: 'completed',
    checksum,
    documentCount: totalDocs,
    collectionCount: collCount,
    createdBy: null,
    notes: `Pre-restore safety snapshot for backup ${label}`,
  })
  return { id: String(safetyDoc._id), filename }
}

// @desc    Create a backup
// @route   POST /api/backup
const createBackup = async (req, res) => {
  try {
    const notes = req.body && typeof req.body.notes === 'string' ? req.body.notes : ''
    ensureBackupDir()
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 15)
    const filename = `backup-${timestamp}-${crypto.randomBytes(4).toString('hex')}.json`
    const filepath = path.join(BACKUP_DIR, filename)

    const backupDoc = await Backup.create({
      filename,
      originalName: filename,
      size: 0,
      status: 'pending',
      type: 'manual',
      checksum: '',
      createdBy: req.user._id,
      notes: notes.slice(0, 500),
    })

    const ctx = ctxFrom(req)
    backupDb(backupDoc, filepath, ctx).catch((err) => {
      console.error('[backup] background job failed:', err.message)
      const errMsg = String(err && err.message ? err.message : err)
      Backup.updateOne(
        { _id: backupDoc._id },
        { status: 'failed', error: errMsg, size: 0, checksum: '' }
      ).catch(() => {})
      auditService.record({
        actorId: ctx.userId,
        actorRole: ctx.userRole,
        action: 'BACKUP_CREATED',
        category: 'backup',
        status: 'failed',
        targetType: 'Backup',
        targetId: backupDoc._id,
        metadata: { backupId: String(backupDoc._id), filename, error: errMsg, type: 'manual' },
        ip: ctx.ip,
        userAgent: ctx.userAgent,
      })
    })

    res.status(202).json({
      success: true,
      message: 'Backup started. Check status in the history table.',
      data: sanitizeBackup(backupDoc),
    })
  } catch (error) {
    console.error('Create Backup Error:', error)
    res.status(500).json({ message: error.message || 'Internal server error' })
  }
}

// @desc    List backups (paginated, filterable, newest-first)
// @route   GET /api/backup
const listBackups = async (req, res) => {
  try {
    const q = req.query || {}
    const page = parsePositiveInt(q.page, 1, Number.MAX_SAFE_INTEGER)
    const limit = parsePositiveInt(q.limit, DEFAULT_LIMIT, MAX_LIMIT)
    if (page === null || limit === null) {
      return res.status(400).json({ message: 'page and limit must be positive integers' })
    }

    const match = {}
    const status = typeof q.status === 'string' ? q.status.trim() : ''
    if (status) match.status = status

    const type = typeof q.type === 'string' ? q.type.trim() : ''
    if (type) match.type = type

    // Only non-deleted backups show in the default list.
    match.deletedAt = { $exists: false }

    const search = typeof q.search === 'string' ? q.search.trim() : ''
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      match.$or = [{ filename: rx }, { originalName: rx }, { notes: rx }, { error: rx }]
    }

    const dateRange = {}
    if (typeof q.startDate === 'string' && q.startDate) {
      const d = new Date(q.startDate)
      if (Number.isNaN(d.getTime())) return res.status(400).json({ message: 'startDate is not a valid date' })
      dateRange.$gte = d
    }
    if (typeof q.endDate === 'string' && q.endDate) {
      const d = new Date(q.endDate)
      if (Number.isNaN(d.getTime())) return res.status(400).json({ message: 'endDate is not a valid date' })
      d.setHours(23, 59, 59, 999)
      dateRange.$lte = d
    }
    if (dateRange.$gte && dateRange.$lte && dateRange.$gte > dateRange.$lte) {
      return res.status(400).json({ message: 'startDate must not be after endDate' })
    }
    if (Object.keys(dateRange).length) match.createdAt = dateRange

    const [docs, total] = await Promise.all([
      Backup.find(match)
        .populate('createdBy', 'fullName email role')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Backup.countDocuments(match),
    ])

    const pages = Math.max(1, Math.ceil(total / limit))
    res.json({ success: true, page, limit, total, pages, data: docs.map(sanitizeBackup) })
  } catch (error) {
    console.error('List Backups Error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// @desc    Get a single backup record
// @route   GET /api/backup/:id
const getBackup = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid backup id' })
    const doc = await Backup.findById(id).populate('createdBy', 'fullName email role')
    if (!doc) return res.status(404).json({ message: 'Backup not found' })
    res.json({ success: true, data: sanitizeBackup(doc) })
  } catch (error) {
    console.error('Get Backup Error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// @desc    Download a backup archive
// @route   GET /api/backup/:id/download
const downloadBackup = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid backup id' })

    const doc = await Backup.findById(id).populate('createdBy', 'fullName email role')
    if (!doc) return res.status(404).json({ message: 'Backup not found' })
    if (doc.status !== 'completed' || doc.deletedAt) {
      return res.status(410).json({ message: 'Backup is not available for download' })
    }

    const filepath = resolveBackupPath(doc.filename)
    if (!filepath) return res.status(400).json({ message: 'Backup storage path is invalid' })
    if (!fs.existsSync(filepath)) return res.status(404).json({ message: 'Backup archive file is missing on disk' })

    const ctx = ctxFrom(req)
    auditService.record({
      actorId: ctx.userId,
      actorRole: ctx.userRole,
      action: 'BACKUP_DOWNLOADED',
      category: 'backup',
      status: 'success',
      targetType: 'Backup',
      targetId: doc._id,
      metadata: { backupId: String(doc._id), filename: doc.filename, originalName: doc.originalName },
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    })

    res.status(200).set({
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${doc.originalName}"`,
      'Content-Length': String(doc.size),
      'X-Backup-Checksum': doc.checksum,
      'X-Backup-Document-Count': String(doc.documentCount || 0),
    })

    const stream = fs.createReadStream(filepath)
    stream.on('error', (err) => {
      console.error('[backup] download stream error:', err.message)
      if (!res.headersSent) {
        res.status(500).json({ message: 'Failed to stream backup archive' })
      }
    })
    stream.pipe(res)
  } catch (error) {
    console.error('Download Backup Error:', error)
    if (!res.headersSent) {
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

// @desc    Produce a restore plan + single-use confirmation token
// @route   GET /api/backup/:id/restore-plan
const getRestorePlan = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid backup id' })

    const doc = await Backup.findById(id).populate('createdBy', 'fullName email role')
    if (!doc) return res.status(404).json({ message: 'Backup not found' })
    if (doc.status !== 'completed' || doc.deletedAt) {
      return res.status(410).json({ message: 'Only completed backups can be restored' })
    }

    let plan
    try {
      plan = await loadAndValidateArchive(doc)
    } catch (error) {
      return res.status(error.status || 400).json({ message: error.message })
    }

    const token = crypto.randomBytes(RESTORE_TOKEN_BYTES).toString('hex')
    doc.restoreToken = token
    doc.restoreTokenExpiry = new Date(Date.now() + RESTORE_TOKEN_TTL_MS)
    await doc.save()

    const ctx = ctxFrom(req)
    auditService.record({
      actorId: ctx.userId,
      actorRole: ctx.userRole,
      action: 'BACKUP_RESTORE_INITIATED',
      category: 'backup',
      status: 'success',
      targetType: 'Backup',
      targetId: doc._id,
      metadata: {
        backupId: String(doc._id),
        filename: doc.filename,
        collections: Object.keys(plan.collections),
        documentCount: plan.documentCount,
        collectionCount: plan.collectionCount,
      },
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    })

    res.json({
      success: true,
      data: {
        backupId: String(doc._id),
        filename: doc.filename,
        originalName: doc.originalName,
        createdAt: doc.createdAt,
        documentCount: plan.documentCount,
        collectionCount: plan.collectionCount,
        collections: Object.keys(plan.collections),
        confirmationToken: token,
        expiresIn: Math.round(RESTORE_TOKEN_TTL_MS / 1000),
      },
    })
  } catch (error) {
    console.error('Restore Plan Error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// @desc    Restore a backup (validation + safety snapshot + transactional replace)
// @route   POST /api/backup/:id/restore
const restoreBackup = async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  let safetySnapshot
  let restoreCtx
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) {
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({ message: 'Invalid backup id' })
    }
    const confirmationToken = req.body && req.body.confirmationToken
    if (!confirmationToken || typeof confirmationToken !== 'string') {
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({ message: 'confirmationToken is required' })
    }

    const doc = await Backup.findById(id).session(session)
    if (!doc) {
      await session.abortTransaction()
      session.endSession()
      return res.status(404).json({ message: 'Backup not found' })
    }
    if (doc.restoreToken !== confirmationToken || !doc.restoreTokenExpiry || doc.restoreTokenExpiry < new Date()) {
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({ message: 'Invalid or expired confirmation token' })
    }

    restoreCtx = ctxFrom(req)

    let plan
    try {
      plan = await loadAndValidateArchive(doc)
    } catch (error) {
      await Backup.updateOne(
        { _id: doc._id },
        { $set: { restoreStatus: 'failed', restoreError: error.message, restoreToken: null, restoreTokenExpiry: null } }
      )
      const auditErr = new Error(error.message)
      auditService.record({
        actorId: restoreCtx.userId,
        actorRole: restoreCtx.userRole,
        action: 'BACKUP_RESTORED',
        category: 'backup',
        status: 'failed',
        targetType: 'Backup',
        targetId: doc._id,
        metadata: { backupId: String(doc._id), filename: doc.filename, error: error.message },
        ip: restoreCtx.ip,
        userAgent: restoreCtx.userAgent,
      })
      await session.abortTransaction()
      session.endSession()
      return res.status(error.status || 400).json({ message: error.message })
    }

    await Backup.updateOne(
      { _id: doc._id },
      { $set: { restoreStatus: 'running', restoreToken: null, restoreTokenExpiry: null } }
    ).session(session)

    // Take a safety snapshot of the live DB first; if restore fails the
    // transaction aborts (live data untouched) and this snapshot is kept so the
    // operator can manually recover.
    safetySnapshot = await takeSafetySnapshot(String(doc._id))

    const db = mongoose.connection.db
    for (const [name, docs] of Object.entries(plan.collections)) {
      if (PROTECTED_COLLECTIONS.has(name)) continue
      const target = db.collection(name)
      await target.deleteMany({}, { session })
      if (docs && docs.length) {
        await target.insertMany(docs, { session, ordered: false })
      }
    }

    await session.commitTransaction()

    await Backup.updateOne(
      { _id: doc._id },
      {
        $set: {
          restoredAt: new Date(),
          restoredBy: restoreCtx.userId,
          restoreStatus: 'completed',
          restoreError: null,
        },
      }
    )

    auditService.record({
      actorId: restoreCtx.userId,
      actorRole: restoreCtx.userRole,
      action: 'BACKUP_RESTORED',
      category: 'backup',
      status: 'success',
      targetType: 'Backup',
      targetId: doc._id,
      metadata: {
        backupId: String(doc._id),
        filename: doc.filename,
        collections: Object.keys(plan.collections),
        documentCount: plan.documentCount,
        collectionCount: plan.collectionCount,
        safetySnapshot: safetySnapshot ? safetySnapshot.id : null,
      },
      ip: restoreCtx.ip,
      userAgent: restoreCtx.userAgent,
    })

    const updated = await Backup.findById(id).populate('createdBy', 'fullName email role')
    res.json({
      success: true,
      message: 'Restore completed successfully',
      data: { backup: sanitizeBackup(updated), safetySnapshot: safetySnapshot ? safetySnapshot.id : null },
    })
  } catch (error) {
    console.error('[backup] restore failed:', error)
    try {
      await session.abortTransaction()
    } catch {
      /* already aborted */
    }
    const errMsg = String(error && error.message ? error.message : error)
    if (restoreCtx) {
      auditService.record({
        actorId: restoreCtx.userId,
        actorRole: restoreCtx.userRole,
        action: 'BACKUP_RESTORED',
        category: 'backup',
        status: 'failed',
        targetType: 'Backup',
        targetId: req.params.id,
        metadata: { backupId: String(req.params.id), error: errMsg },
        ip: restoreCtx.ip,
        userAgent: restoreCtx.userAgent,
      })
    }
    res.status(500).json({ message: errMsg || 'Restore failed' })
  } finally {
    session.endSession()
  }
}

// @desc    Delete (soft) a backup archive
// @route   DELETE /api/backup/:id
const deleteBackup = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid backup id' })

    const doc = await Backup.findById(id)
    if (!doc) return res.status(404).json({ message: 'Backup not found' })
    if (doc.type === 'safety' || doc.deletedAt) {
      return res.status(400).json({ message: 'Safety snapshots and already-deleted backups cannot be deleted here' })
    }

    // Remove the archive from disk (only the basename, resolved safely).
    const filepath = resolveBackupPath(doc.filename)
    if (filepath && fs.existsSync(filepath)) {
      fs.unlinkSync(filepath)
    }

    doc.status = 'deleted'
    doc.deletedAt = new Date()
    doc.deletedBy = req.user._id
    await doc.save()

    const ctx = ctxFrom(req)
    auditService.record({
      actorId: ctx.userId,
      actorRole: ctx.userRole,
      action: 'BACKUP_DELETED',
      category: 'backup',
      status: 'success',
      targetType: 'Backup',
      targetId: doc._id,
      metadata: { backupId: String(doc._id), filename: doc.filename },
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    })

    res.json({ success: true, message: 'Backup deleted', data: sanitizeBackup(doc) })
  } catch (error) {
    console.error('Delete Backup Error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// @desc    Dashboard aggregates for the Backup & Restore page cards
// @route   GET /api/backup/summary
const getSummary = async (_req, res) => {
  try {
    const [total, latest, completed, sizeAgg, restoreCount] = await Promise.all([
      Backup.countDocuments({ deletedAt: { $exists: false } }),
      Backup.findOne({ deletedAt: { $exists: false } }).sort({ createdAt: -1 }).lean(),
      Backup.countDocuments({ status: 'completed', deletedAt: { $exists: false }, type: { $ne: 'safety' } }),
      Backup.aggregate([
        { $match: { deletedAt: { $exists: false }, type: { $ne: 'safety' } } },
        { $group: { _id: null, totalSize: { $sum: '$size' } } },
      ]),
      Backup.countDocuments({ restoreStatus: { $exists: true, $ne: null } }),
    ])
    res.json({
      success: true,
      data: {
        totalBackups: total,
        latestBackup: latest ? latest.filename : null,
        latestBackupAt: latest ? latest.createdAt : null,
        completedBackups: completed,
        totalStorageBytes: (sizeAgg[0] && sizeAgg[0].totalSize) || 0,
        restoreOperations: restoreCount,
      },
    })
  } catch (error) {
    console.error('Backup Summary Error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  createBackup,
  listBackups,
  getBackup,
  downloadBackup,
  getRestorePlan,
  restoreBackup,
  deleteBackup,
  getSummary,
}
