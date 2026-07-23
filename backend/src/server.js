const { env } = require('./config/env')
const { createApp } = require('./app')
const { connectDb } = require('./config/db')

async function bootstrap() {
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

  app.listen(env.port, () => {
    console.log(`running on http://localhost:${env.port}`)
  })
}

bootstrap().catch((error) => {
  console.error('[backend] startup failed', error)
  process.exit(1)
})
