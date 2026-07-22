const { env } = require('./config/env')
const { createApp } = require('./app')
const { connectDb } = require('./config/db')

async function bootstrap() {
  if (!env.mongoUri) {
    throw new Error('Missing MONGO_URI in environment')
  }

  try {
    await connectDb(env.mongoUri)
  } catch (error) {
    if (env.nodeEnv === 'production' || !env.allowStartWithoutDb) {
      throw error
    }
    console.warn('mongo unavailable, continuing in degraded mode')
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
