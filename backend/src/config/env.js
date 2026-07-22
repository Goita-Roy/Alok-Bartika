const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') })

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  mongoUri: process.env.MONGO_URI || '',
  allowStartWithoutDb: process.env.ALLOW_START_WITHOUT_DB !== 'false',
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
