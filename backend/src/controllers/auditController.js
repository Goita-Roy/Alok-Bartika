const mongoose = require('mongoose')
const { AuditLog } = require('../models/AuditLog')

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100
const VALID_STATUSES = new Set(['success', 'failed'])

// SECURITY: keys that are never allowed to leave the API, regardless of which
// metadata payload an action recorded. The `$lookup` below also exposes the
// full user document internally, so we project actor output field-by-field.
const SENSITIVE_KEY = /password|passwd|secret|token|otp|hash|jwt|credential|api[_ -]?key/i

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Recursively strips sensitive keys from arbitrary audit metadata. Audit
// records are written by many controllers, so never trust any metadata shape.
function sanitizeDetails(value) {
  if (Array.isArray(value)) return value.map((v) => sanitizeDetails(v))
  if (value && typeof value === 'object') {
    const out = {}
    for (const [key, val] of Object.entries(value)) {
      if (SENSITIVE_KEY.test(key)) continue
      out[key] = sanitizeDetails(val)
    }
    return out
  }
  return value
}

// Parses a positive integer query param. Returns `fallback` when omitted,
// `null` when the value is present but not a positive integer, and clamps
// oversized values to `max` so the API can never be asked for a huge page.
function parsePositiveInt(raw, fallback, max) {
  if (raw === undefined || raw === null || raw === '') return fallback
  const n = Number(raw)
  if (!Number.isInteger(n) || n < 1) return null
  return Math.min(n, max)
}

// Legacy audit entries predate the `status` field; they are all successes.
function buildStatusMatch(status) {
  if (status === 'failed') return { status: 'failed' }
  return { $or: [{ status: 'success' }, { status: { $exists: false } }] }
}

function toRegex(value) {
  return new RegExp(escapeRegex(value), 'i')
}

function formatRecord(doc) {
  const actor = doc._actorDoc
    ? {
        id: String(doc._actorDoc._id),
        fullName: doc._actorDoc.fullName || null,
        email: doc._actorDoc.email || null,
        role: doc._actorDoc.role || null,
      }
    : null

  return {
    id: String(doc._id),
    actor,
    actorRole: doc.actorRole || '',
    action: doc.action,
    category: doc.category || '',
    resource: doc.targetType || '',
    resourceId: doc.targetId ? String(doc.targetId) : null,
    status: doc.status || 'success',
    ip: doc.ip || '',
    userAgent: doc.userAgent || '',
    createdAt: doc.createdAt,
    details: sanitizeDetails(doc.metadata || {}),
  }
}

// @desc    List audit logs (newest-first) with pagination + filters
// @route   GET /api/audit
// @access  Private (Super Admin only)
const getAuditLogs = async (req, res) => {
  try {
    const q = req.query || {}

    const page = parsePositiveInt(q.page, 1, Number.MAX_SAFE_INTEGER)
    const limit = parsePositiveInt(q.limit, DEFAULT_LIMIT, MAX_LIMIT)
    if (page === null || limit === null) {
      return res.status(400).json({ message: 'page and limit must be positive integers' })
    }

    // Status filter (success / failed).
    const rawStatus = typeof q.status === 'string' ? q.status.trim().toLowerCase() : ''
    if (rawStatus && !VALID_STATUSES.has(rawStatus)) {
      return res.status(400).json({ message: 'status must be either "success" or "failed"' })
    }

    // Date range over createdAt.
    const dateRange = {}
    const startDate = typeof q.startDate === 'string' ? q.startDate.trim() : ''
    const endDate = typeof q.endDate === 'string' ? q.endDate.trim() : ''
    if (startDate) {
      const d = new Date(startDate)
      if (Number.isNaN(d.getTime())) {
        return res.status(400).json({ message: 'startDate is not a valid date' })
      }
      dateRange.$gte = d
    }
    if (endDate) {
      const d = new Date(endDate)
      if (Number.isNaN(d.getTime())) {
        return res.status(400).json({ message: 'endDate is not a valid date' })
      }
      // Include the whole end day when a bare date (YYYY-MM-DD) is passed.
      d.setHours(23, 59, 59, 999)
      dateRange.$lte = d
    }
    if (dateRange.$gte && dateRange.$lte && dateRange.$gte > dateRange.$lte) {
      return res.status(400).json({ message: 'startDate must not be after endDate' })
    }

    const search = typeof q.search === 'string' ? q.search.trim() : ''
    const action = typeof q.action === 'string' ? q.action.trim() : ''
    const resource = typeof q.resource === 'string' ? q.resource.trim() : ''
    const actor = typeof q.actor === 'string' ? q.actor.trim() : ''

    // ── Stage 1: cheap filters that need no user lookup ──────────────────
    const pre = {}
    if (rawStatus) Object.assign(pre, buildStatusMatch(rawStatus))
    if (Object.keys(dateRange).length) pre.createdAt = dateRange

    const textOr = []
    if (search) {
      const rx = toRegex(search)
      textOr.push({ action: rx }, { category: rx }, { targetType: rx }, { actorRole: rx })
    }
    if (action) {
      // `action` also matches `category` so ?action=LOGIN finds 'login'.
      const rx = toRegex(action)
      textOr.push({ action: rx }, { category: rx })
    }
    if (textOr.length) pre.$or = textOr

    if (resource) pre.targetType = toRegex(resource)

    // Direct actorId match when the query is a valid ObjectId.
    let actorTextMatch = null
    if (actor) {
      if (/^[0-9a-fA-F]{24}$/.test(actor)) {
        pre.actorId = new mongoose.Types.ObjectId(actor)
      } else {
        actorTextMatch = toRegex(actor)
      }
    }

    const pipeline = []
    if (Object.keys(pre).length) pipeline.push({ $match: pre })

    // ── Stage 2: resolve actor identities for display + name/email filter ──
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'actorId',
        foreignField: '_id',
        as: '_actor',
      },
    })
    pipeline.push({
      $addFields: { _actorDoc: { $arrayElemAt: ['$_actor', 0] } },
    })
    pipeline.push({ $project: { _actor: 0 } })

    if (actorTextMatch) {
      pipeline.push({
        $match: {
          $or: [
            { '_actorDoc.email': actorTextMatch },
            { '_actorDoc.fullName': actorTextMatch },
            { '_actorDoc.username': actorTextMatch },
          ],
        },
      })
    }

    // ── Stage 3: newest-first, then count + paginate ───────────────────────
    pipeline.push({ $sort: { createdAt: -1, _id: -1 } })
    pipeline.push({
      $facet: {
        total: [{ $count: 'count' }],
        rows: [{ $skip: (page - 1) * limit }, { $limit: limit }],
      },
    })

    const [result] = await AuditLog.aggregate(pipeline)
    const total = result?.total?.[0]?.count ?? 0
    const rows = result?.rows ?? []
    const pages = Math.max(1, Math.ceil(total / limit))

    res.json({
      success: true,
      page,
      limit,
      total,
      pages,
      data: rows.map(formatRecord),
    })
  } catch (error) {
    console.error('Get Audit Logs Error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// @desc    Dashboard aggregates + available filter options
// @route   GET /api/audit/summary
// @access  Private (Super Admin only)
const getAuditSummary = async (_req, res) => {
  try {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [totalLogs, todayEvents, failedActions, activeUsersToday, actions, resources] =
      await Promise.all([
        AuditLog.countDocuments({}),
        AuditLog.countDocuments({ createdAt: { $gte: startOfToday } }),
        AuditLog.countDocuments({ status: 'failed' }),
        AuditLog.distinct('actorId', { actorId: { $ne: null }, createdAt: { $gte: startOfToday } }),
        AuditLog.distinct('action'),
        AuditLog.distinct('targetType'),
      ])

    res.json({
      success: true,
      data: {
        totalLogs,
        todayEvents,
        failedActions,
        activeUsersToday: activeUsersToday.length,
        actions: actions.filter(Boolean).sort(),
        resources: resources.filter(Boolean).sort(),
      },
    })
  } catch (error) {
    console.error('Get Audit Summary Error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = { getAuditLogs, getAuditSummary }
