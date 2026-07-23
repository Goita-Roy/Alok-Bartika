import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

const envPath = path.resolve(process.cwd(), '.env')

if (!fs.existsSync(envPath)) {
  console.error(`[env] .env file not found at: ${envPath}`)
  console.error('[env] Copy .env.example to .env and fill in the required values:')
  console.error(`[env]   cp server/.env.example server/.env`)
}

dotenv.config({ path: envPath })

function bool(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback
  return value === 'true' || value === '1'
}

function list(value: string | undefined, fallback: string[]): string[] {
  if (!value) return fallback
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProd: (process.env.NODE_ENV ?? 'development') === 'production',
  port: Number(process.env.PORT ?? 5000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  clientOrigins: list(process.env.CLIENT_ORIGINS, [process.env.CLIENT_ORIGIN ?? 'http://localhost:5173']),
  mongoUri: process.env.MONGO_URI ?? '',
  allowStartWithoutDb: process.env.ALLOW_START_WITHOUT_DB !== 'false',

  jwtSecret: process.env.JWT_SECRET ?? 'dev_secret_change_me',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET ?? 'dev_refresh_secret_change_me',
  bcryptCost: Number(process.env.BCRYPT_COST ?? '12'),

  cookieSecure: bool(process.env.COOKIE_SECURE, (process.env.NODE_ENV ?? 'development') === 'production'),
  cookieSameSite: (process.env.COOKIE_SAMESITE as 'lax' | 'strict' | 'none') ?? 'lax',

  maxLoginAttempts: Number(process.env.MAX_LOGIN_ATTEMPTS ?? '5'),
  loginLockMs: Number(process.env.LOGIN_LOCK_MS ?? String(15 * 60 * 1000)),

  rateLimitGeneral: Number(process.env.RATE_LIMIT_GENERAL ?? '120'),
  rateLimitLogin: Number(process.env.RATE_LIMIT_LOGIN ?? '10'),
  rateLimitRegister: Number(process.env.RATE_LIMIT_REGISTER ?? '5'),
  rateLimitPasswordReset: Number(process.env.RATE_LIMIT_PASSWORD_RESET ?? '5'),
  rateLimitExam: Number(process.env.RATE_LIMIT_EXAM ?? '30'),
  rateLimitPractice: Number(process.env.RATE_LIMIT_PRACTICE ?? '60'),
  rateLimitNotifications: Number(process.env.RATE_LIMIT_NOTIFICATIONS ?? '60'),
  rateLimitProfile: Number(process.env.RATE_LIMIT_PROFILE ?? '30'),
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? String(60 * 1000)),

  csrfEnabled: bool(process.env.CSRF_ENABLED, true),

  maxUploadBytes: Number(process.env.MAX_UPLOAD_BYTES ?? String(5 * 1024 * 1024)),

  trustProxy: bool(process.env.TRUST_PROXY, (process.env.NODE_ENV ?? 'development') === 'production'),
}

export function optionalEnv(key: string, fallback = ''): string {
  const v = process.env[key]
  return v === undefined || v === '' ? fallback : v
}
