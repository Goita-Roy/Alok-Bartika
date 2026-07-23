const { env } = require('./config/env')
const { createApp } = require('./app')
const { connectDb } = require('./config/db')

async function bootstrap() {
  if (!env.mongoUri) {
    throw new Error(
      'MONGO_URI is not set. Create a backend/.env file (copy from backend/.env.example) ' +
      'and set MONGO_URI to your MongoDB connection string.'
    )
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
