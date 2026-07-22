const mongoose = require('mongoose')
let mongod = null

async function connectDb(mongoUri) {
  console.log(`attempting to connect to mongo at ${mongoUri}...`)
  try {
    await mongoose.connect(mongoUri, {
      autoIndex: false,
      serverSelectionTimeoutMS: 5000,
    })
    console.log('mongo connected')
  } catch (error) {
    console.error(`connection failed: ${error.message}`)
    // Only use memory server in development if specifically allowed or if local fails
    if (process.env.NODE_ENV === 'production') {
      throw error
    }

    console.log('starting in-memory database fallback...')
    const { MongoMemoryServer } = require('mongodb-memory-server')
    mongod = await MongoMemoryServer.create()
    const uri = mongod.getUri()
    console.log(`in-memory server created at ${uri}, connecting...`)
    await mongoose.connect(uri)
    console.log(`in-memory database connected: ${uri}`)
  }
}

module.exports = { connectDb }
