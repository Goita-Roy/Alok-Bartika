const http = require('http')
const { env, validateEnv } = require('./config/env')
const { createApp } = require('./app')
const { connectDb } = require('./config/db')
const { initSocket } = require('./socket')

async function bootstrap() {
  // Fail fast if required env vars are missing — never run with a fallback
  // JWT secret or an unconfigured database.
  validateEnv()
  if (env.mongoUri) {
    try {
      await connectDb(env.mongoUri)
    } catch (error) {
      if (env.allowStartWithoutDb) {
        console.warn('[backend] MongoDB unavailable, continuing without DB:', error.message)
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
    console.warn('[backend] MONGO_URI is not set. Starting without database.')
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

  // Attach Socket.IO to the HTTP server (JWT auth + event handlers wired inside)
  initSocket(httpServer, allowedOrigins)

  httpServer.listen(env.port, () => {
    console.log(`running on http://localhost:${env.port}`)
  })
}

bootstrap().catch((error) => {
  console.error('[backend] startup failed', error)
  process.exit(1)
})
