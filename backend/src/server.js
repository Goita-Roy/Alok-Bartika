const { env } = require('./config/env')
const { createApp } = require('./app')
const { connectDb } = require('./config/db')

async function bootstrap() {
  if (!env.mongoUri) {
    throw new Error('Missing MONGO_URI in environment')
  }

  await connectDb(env.mongoUri)

  const app = createApp()

  app.listen(env.port, () => {
    console.log(`running on http://localhost:${env.port}`)
  })
}

bootstrap().catch((error) => {
  console.error('[backend] startup failed', error)
  process.exit(1)
})
