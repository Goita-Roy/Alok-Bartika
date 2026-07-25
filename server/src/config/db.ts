import mongoose from 'mongoose'
import dns from 'dns'

function configureDns(): void {
  const current = dns.getServers()
  const hasLocalhost = current.some((s) => s === '127.0.0.1' || s === 'localhost')
  if (hasLocalhost) {
    dns.setServers(['8.8.8.8', '1.1.1.1'])
    console.log('[db] DNS servers overridden: localhost detected, using 8.8.8.8 / 1.1.1.1')
  }
}

export async function connectMongo(uri: string): Promise<void> {
  if (uri.startsWith('mongodb+srv://')) {
    configureDns()
  }

  const safeUri = uri.replace(/:([^@]+)@/, ':****@')
  console.log(`attempting to connect to mongo at ${safeUri}...`)

  try {
    await mongoose.connect(uri, {
      autoIndex: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    })
    console.log('mongo connected successfully')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('MongoDB Connection Failure:', message)
    throw new Error(`Failed to connect to MongoDB database: ${message}`)
  }
}
