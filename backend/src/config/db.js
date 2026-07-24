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
      serverSelectionTimeoutMS: 10000,
    })
    console.log('mongo connected successfully')
  } catch (error) {
    console.error('MongoDB Connection Failure:', error.message)
    throw new Error(`Failed to connect to MongoDB database: ${error.message}`)
  }
}

module.exports = { connectDb }
