import mongoose from 'mongoose'

export async function connectMongo(uri: string): Promise<void> {
  await mongoose.connect(uri, {
    autoIndex: false,
    serverSelectionTimeoutMS: 10000,
  })
}
