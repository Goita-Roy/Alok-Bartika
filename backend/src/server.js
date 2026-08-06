const http = require('http')
const { env, validateEnv } = require('./config/env')
const { createApp } = require('./app')
const { connectDb } = require('./config/db')
const { initSocket } = require('./socket')

async function bootstrap() {
  // Fail fast if required env vars are missing — never run with a fallback
  // JWT secret or an unconfigured database.
  validateEnv()
  
  console.log('[backend] ═════════════════════════════════════════════════════════')
  console.log('[backend] Starting Alokbartika Backend Server')
  console.log('[backend] ═════════════════════════════════════════════════════════')
  console.log('[backend] Environment:', env.nodeEnv)
  console.log('[backend] Port:', env.port)
  console.log('[backend] MongoDB URI configured:', !!env.mongoUri)
  console.log('[backend] Allow start without DB:', env.allowStartWithoutDb)
  console.log('[backend] ═════════════════════════════════════════════════════════')
  
  if (env.mongoUri) {
    try {
      await connectDb(env.mongoUri)
      console.log('[backend] ✓ Database connection established')
    } catch (error) {
      if (env.allowStartWithoutDb) {
        console.warn('[backend] ⚠ MongoDB unavailable, continuing without DB:', error.message)
        console.warn('[backend] ⚠ Features requiring database will not function')
      } else {
        throw error
      }
    }
  } else if (!env.allowStartWithoutDb) {
    throw new Error(
      'MONGO_URI is not set. Create a backend/.env file (copy from backend/.env.example) ' +
      'and set MONGO_URI to your MongoDB connection string.'
    )
  } else {
    console.warn('[backend] ⚠ MONGO_URI is not set. Starting without database.')
    console.warn('[backend] ⚠ Features requiring database will not function')
  }

  const app = createApp()

  // Wrap Express app in a plain Node HTTP server so Socket.IO can share the
  // same port as the REST API without needing a second server process.
  const httpServer = http.createServer(app)

  // Parse the allowed origins from env so Socket.IO CORS mirrors Express CORS.
  const allowedOrigins = env.clientOrigin
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)

  console.log('[backend] Allowed CORS origins:', allowedOrigins)

  // Attach Socket.IO to the HTTP server (JWT auth + event handlers wired inside)
  initSocket(httpServer, allowedOrigins)

  httpServer.listen(env.port, () => {
    console.log('[backend] ═════════════════════════════════════════════════════════')
    console.log(`[backend] ✓ Server running on http://localhost:${env.port}`)
    console.log('[backend] ═════════════════════════════════════════════════════════')
  })
}

bootstrap().catch((error) => {
  console.error('[backend] ═════════════════════════════════════════════════════════')
  console.error('[backend] CRITICAL: Backend startup failed')
  console.error('[backend] ═════════════════════════════════════════════════════════')
  console.error('[backend] Error details:')
  console.error('[backend]', error.message)
  
  if (error.originalError) {
    console.error('[backend] Original MongoDB error:', error.originalError.message)
  }
  if (error.hostname) {
    console.error('[backend] Failed hostname:', error.hostname)
  }
  if (error.attempts) {
    console.error('[backend] Connection attempts made:', error.attempts)
  }
  
  console.error('[backend] ═════════════════════════════════════════════════════════')
  console.error('[backend] Troubleshooting steps:')
  console.error('[backend] 1. Check network connectivity')
  console.error('[backend] 2. Verify MongoDB Atlas cluster is active')
  console.error('[backend] 3. Check Atlas IP Access List (whitelist your IP)')
  console.error('[backend] 4. Verify username/password in MONGO_URI')
  console.error('[backend] 5. Ensure credentials are URL-encoded if needed')
  console.error('[backend] 6. Check database name in connection string')
  console.error('[backend] 7. Try local MongoDB: mongod --dbpath ./data')
  console.error('[backend] ═════════════════════════════════════════════════════════')
  
  process.exit(1)
})
