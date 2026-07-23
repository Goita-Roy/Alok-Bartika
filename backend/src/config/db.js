const mongoose = require('mongoose')

async function connectDb(mongoUri) {
  if (!mongoUri) {
    throw new Error('MONGO_URI is required to connect to MongoDB.')
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
