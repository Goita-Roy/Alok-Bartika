const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')

const envPath = path.resolve(__dirname, '..', '..', '.env')

if (!fs.existsSync(envPath)) {
  console.error(`[env] .env file not found at: ${envPath}`)
  console.error('[env] Copy .env.example to .env and fill in the required values:')
  console.error(`[env]   cp backend/.env.example backend/.env`)
}

dotenv.config({ path: envPath })

const nodeEnv = process.env.NODE_ENV || 'development'
const mongoUri = process.env.MONGO_URI || ''
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://localhost:5174,https://alok-bartika-frontend.vercel.app,https://alokbartika.vercel.app'

const env = {
  nodeEnv,
  port: Number(process.env.PORT || 5000),
  clientOrigin,
  mongoUri,
  clerkSecretKey: process.env.CLERK_SECRET_KEY || '',
  smsProvider: process.env.SMS_PROVIDER || '',
  smsApiKey: process.env.SMS_API_KEY || '',
  smsApiSecret: process.env.SMS_API_SECRET || '',
  smsSenderId: process.env.SMS_SENDER_ID || '',
  smsBaseUrl: process.env.SMS_BASE_URL || '',
  judge0Host: process.env.JUDGE0_HOST || 'judge0-ce.p.rapidapi.com',
  judge0Key: process.env.JUDGE0_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  emailHost: process.env.EMAIL_HOST || 'smtp.gmail.com',
  emailPort: Number(process.env.EMAIL_PORT || 587),
  emailUser: process.env.EMAIL_USER || '',
  emailPass: process.env.EMAIL_PASS || '',
  emailFrom: process.env.EMAIL_FROM || 'noreply@alokbartika.com',
}

module.exports = { env }
