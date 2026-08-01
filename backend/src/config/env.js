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
  allowStartWithoutDb: process.env.ALLOW_START_WITHOUT_DB === 'true',
  // SECURITY: JWT signing/verification secret. There is intentionally NO
  // fallback here — a missing value must fail startup, never sign tokens
  // with a well-known default.
  jwtSecret: process.env.JWT_SECRET || '',
  // SECURITY: whether the app sits behind a single reverse proxy (Render).
  // Required so rate limiting keys off the real client IP from the
  // X-Forwarded-For chain instead of the proxy's socket address. Enabled by
  // default in production; override with TRUST_PROXY=true|false.
  trustProxy: process.env.TRUST_PROXY
    ? process.env.TRUST_PROXY === 'true' || process.env.TRUST_PROXY === '1'
    : nodeEnv === 'production',
  clerkSecretKey: process.env.CLERK_SECRET_KEY || '',
  smsProvider: process.env.SMS_PROVIDER || '',
  smsApiKey: process.env.SMS_API_KEY || '',
  smsApiSecret: process.env.SMS_API_SECRET || '',
  smsSenderId: process.env.SMS_SENDER_ID || '',
  smsBaseUrl: process.env.SMS_BASE_URL || '',
  judge0Host: process.env.JUDGE0_HOST || 'judge0-ce.p.rapidapi.com',
  judge0Key: process.env.JUDGE0_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  aiProvider: process.env.AI_PROVIDER || 'groq',
  groqApiKey: process.env.GROQ_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openrouterApiKey: process.env.OPENROUTER_API_KEY || '',
  aiTimeoutMs: Number(process.env.AI_TIMEOUT_MS || 30000),
  emailHost: process.env.EMAIL_HOST || 'smtp.gmail.com',
  emailPort: Number(process.env.EMAIL_PORT || 587),
  emailUser: process.env.EMAIL_USER || '',
  emailPass: process.env.EMAIL_PASS || '',
  emailFrom: process.env.EMAIL_FROM || 'noreply@alokbartika.com',
}

// Validate required environment variables at startup (fail fast, never fall
// back to insecure defaults).
function validateEnv() {
  const errors = []

  if (!env.jwtSecret) {
    errors.push('JWT_SECRET is required. Set it in backend/.env (generate one, e.g. `openssl rand -hex 32`).')
  }

  if (!env.mongoUri && !env.allowStartWithoutDb) {
    errors.push('MONGO_URI is required. Set it in backend/.env (or set ALLOW_START_WITHOUT_DB=true for local dev without a database).')
  }

  if (errors.length > 0) {
    const message = `[env] Invalid environment configuration:\n  - ${errors.join('\n  - ')}`
    console.error(message)
    throw new Error(message)
  }

  return env
}

module.exports = { env, validateEnv }
