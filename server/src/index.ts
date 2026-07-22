import { connectMongo } from './config/db'
import { env } from './config/env'
import { createApp } from './app'

async function bootstrap(): Promise<void> {
  if (!env.mongoUri) {
    throw new Error('Missing MONGO_URI in environment')
  }

  try {
    await connectMongo(env.mongoUri)
    console.log('[api] mongo connected')
  } catch (error) {
    if (env.nodeEnv === 'production' || !env.allowStartWithoutDb) {
      throw error
    }
    console.warn('[api] mongo unavailable, starting in degraded mode')
  }

  const app = createApp()

  app.listen(env.port, () => {
    console.log(`[api] running on http://localhost:${env.port}`)
  })
}

bootstrap().catch((error: unknown) => {
  console.error('[api] failed to start', error)
  process.exit(1)
})
