const mongoose = require('mongoose')
const dns = require('dns')

function configureDns() {
  const current = dns.getServers()
  const hasLocalhost = current.some((s) => s === '127.0.0.1' || s === 'localhost')
  if (hasLocalhost) {
    dns.setServers(['8.8.8.8', '1.1.1.1'])
    console.log('[db] DNS servers overridden: localhost detected, using 8.8.8.8 / 1.1.1.1')
  }
}

// The connection is opened with autoIndex: false (see below) so schema-level
// `index: true` and `schema.index(...)` definitions are NOT auto-created.
// We therefore build indexes explicitly after connect. createIndexes() is
// additive and idempotent — it never drops existing indexes. Kept on the
// frequently-queried collections; audit logs benefit too.
async function ensureIndexes() {
  const { User } = require('../models/User')
  const { Course } = require('../models/Course')
  const { Lesson } = require('../models/Lesson')
  const { Exam } = require('../models/Exam')
  const { AuditLog } = require('../models/AuditLog')

  const models = [User, Course, Lesson, Exam, AuditLog]
  await Promise.all(models.map((m) => m.createIndexes()))
  console.log('[db] indexes ensured for User, Course, Lesson, Exam, AuditLog')
}

async function connectDb(mongoUri) {
  if (!mongoUri) {
    throw new Error('MONGO_URI is required to connect to MongoDB.')
  }

  if (mongoUri.startsWith('mongodb+srv://')) {
    configureDns()
  }

  const safeUri = mongoUri.replace(/:([^@]+)@/, ':****@')
  console.log(`attempting to connect to mongo at ${safeUri}...`)

  try {
    await mongoose.connect(mongoUri, {
      autoIndex: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    })
    console.log('mongo connected successfully')
    try {
      await ensureIndexes()
    } catch (indexErr) {
      console.warn('[db] index creation failed (continuing):', indexErr.message)
    }
  } catch (error) {
    console.error('MongoDB Connection Failure:', error.message)
    throw new Error(`Failed to connect to MongoDB database: ${error.message}`)
  }
}

module.exports = { connectDb }
