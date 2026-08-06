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
  const { ExamViolation } = require('../models/ExamViolation')

  const models = [User, Course, Lesson, Exam, AuditLog, ExamViolation]
  await Promise.all(models.map((m) => m.createIndexes()))
  console.log('[db] indexes ensured for User, Course, Lesson, Exam, AuditLog, ExamViolation')
}

// Extract hostname from MongoDB URI for better error reporting
function extractHostname(uri) {
  try {
    if (uri.startsWith('mongodb+srv://')) {
      const match = uri.match(/@([^/]+)/)
      return match ? match[1] : 'unknown'
    }
    const match = uri.match(/@([^:]+):/)
    return match ? match[1] : 'localhost'
  } catch (e) {
    return 'unknown'
  }
}

// Sleep utility for retry delays
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Check if local MongoDB is available
async function checkLocalMongo() {
  const localUri = 'mongodb://localhost:27017/alokbartika'
  console.log('[db] Attempting fallback to local MongoDB at localhost:27017...')
  
  try {
    await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 5000,
      family: 4,
    })
    console.log('[db] ✓ Successfully connected to local MongoDB fallback')
    return true
  } catch (error) {
    console.log('[db] ✗ Local MongoDB unavailable:', error.message)
    await mongoose.disconnect()
    return false
  }
}

// Enhanced connection with retry logic and fallback
async function connectDb(mongoUri) {
  if (!mongoUri) {
    throw new Error('MONGO_URI is required to connect to MongoDB.')
  }

  const safeUri = mongoUri.replace(/:([^@]+)@/, ':****@')
  const hostname = extractHostname(mongoUri)
  const maxRetries = 5
  const baseDelay = 2000 // 2 seconds base delay

  console.log(`[db] Connection attempt configuration:`)
  console.log(`[db]   - Target: ${safeUri}`)
  console.log(`[db]   - Hostname: ${hostname}`)
  console.log(`[db]   - Max retries: ${maxRetries}`)
  console.log(`[db]   - Base delay: ${baseDelay}ms (exponential backoff)`)

  if (mongoUri.startsWith('mongodb+srv://')) {
    configureDns()
    
    // Test DNS resolution using SRV record lookup for mongodb+srv
    console.log(`[db] Testing DNS resolution for ${hostname}...`)
    try {
      await dns.promises.resolveSrv(`_mongodb._tcp.${hostname}`)
      console.log(`[db] ✓ DNS resolution successful for ${hostname}`)
    } catch (dnsError) {
      console.error(`[db] ✗ DNS resolution failed for ${hostname}:`, dnsError.message)
      console.log('[db] This may indicate network issues or incorrect hostname')
      console.log('[db] Connection will still be attempted as SRV lookup may work via MongoDB driver')
    }
  }

  // Retry loop with exponential backoff
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const retryDelay = baseDelay * Math.pow(2, attempt - 1)
    
    console.log(`[db] Connection attempt ${attempt}/${maxRetries}...`)
    
    try {
      await mongoose.connect(mongoUri, {
        autoIndex: false,
        serverSelectionTimeoutMS: 10000, // Increased from 5000ms
        socketTimeoutMS: 45000,
        family: 4, // Force IPv4
        connectTimeoutMS: 10000,
      })
      
      console.log('[db] ✓ MongoDB connected successfully')
      console.log(`[db]   - Connected to: ${hostname}`)
      console.log(`[db]   - Database: ${mongoose.connection.name}`)
      console.log(`[db]   - State: ${mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'}`)
      
      // Ensure indexes
      try {
        await ensureIndexes()
      } catch (indexErr) {
        console.warn('[db] ⚠ Index creation failed (continuing):', indexErr.message)
      }
      
      return // Success - exit the retry loop
      
    } catch (error) {
      const errorMessage = error.message || 'Unknown error'
      const errorName = error.name || 'UnknownError'
      
      console.error(`[db] ✗ Connection attempt ${attempt} failed:`)
      console.error(`[db]   - Error type: ${errorName}`)
      console.error(`[db]   - Error message: ${errorMessage}`)
      
      // Log specific MongoDB driver errors if available
      if (error.reason) {
        console.error(`[db]   - Driver reason: ${error.reason}`)
      }
      if (error.code) {
        console.error(`[db]   - Error code: ${error.code}`)
      }
      
      // If this is the last attempt, try local fallback
      if (attempt === maxRetries) {
        console.log(`[db] All ${maxRetries} connection attempts exhausted`)
        console.log('[db] Attempting fallback to local MongoDB...')
        
        const localSuccess = await checkLocalMongo()
        if (localSuccess) {
          try {
            await ensureIndexes()
          } catch (indexErr) {
            console.warn('[db] ⚠ Index creation failed on local MongoDB (continuing):', indexErr.message)
          }
          return
        }
        
        // If local fallback also fails, throw comprehensive error
        const finalError = new Error(
          `Failed to connect to MongoDB after ${maxRetries} attempts. ` +
          `Atlas error: ${errorMessage}. ` +
          `Local MongoDB also unavailable. ` +
          `Please check: network connectivity, Atlas IP whitelist, credentials, and local MongoDB service.`
        )
        finalError.originalError = error
        finalError.hostname = hostname
        finalError.attempts = maxRetries
        throw finalError
      }
      
      // Wait before retry (exponential backoff)
      console.log(`[db] Waiting ${retryDelay}ms before retry...`)
      await sleep(retryDelay)
    }
  }
}

module.exports = { connectDb }
