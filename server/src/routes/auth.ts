import express from 'express'
import { env } from '../config/env'
import { User, IUser } from '../models/User'
import {
  issueTokens,
  rotateTokens,
  revokeAllSessions,
  revokeSession,
  listSessions,
  hashToken,
} from '../services/auth.service'
import { authRequired, ACCESS_COOKIE } from '../middleware/auth'
import { isEmail, normalizePhone, passwordComplexityError, asString } from '../utils/validate'
import { assertNoPrototypePollution } from '../utils/sanitize'
import {
  checkLock,
  registerFailure,
  clearFailures,
  bruteForceGuard,
  syncDbLock,
  applyDbFailure,
  clearDbFailures,
} from '../middleware/bruteForce'
import { getClientIp, logSecurity } from '../middleware/securityLog'
import { loginLimiter, registerLimiter, passwordResetLimiter } from '../middleware/rateLimit'

const ACCESS_COOKIE_OPTS = {
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: env.cookieSameSite as 'lax' | 'strict' | 'none',
  path: '/',
}

function setAuthCookies(res: express.Response, accessToken: string, refreshToken: string) {
  res.cookie(ACCESS_COOKIE, accessToken, { ...ACCESS_COOKIE_OPTS, maxAge: 15 * 60 * 1000 })
  res.cookie('refresh_token', refreshToken, { ...ACCESS_COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 })
}

function clearAuthCookies(res: express.Response) {
  res.clearCookie(ACCESS_COOKIE, { ...ACCESS_COOKIE_OPTS, maxAge: 0 })
  res.clearCookie('refresh_token', { ...ACCESS_COOKIE_OPTS, maxAge: 0 })
}

function publicUser(u: IUser) {
  return {
    id: String(u._id),
    role: u.role,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone,
  }
}

function buildAuthRouter() {
  const router = express.Router()

  router.get('/csrf-token', (req, res) => {
    // CSRF token is issued via the global csrfTokenIssuer middleware.
    const token = (res.locals as any).csrfToken
    res.json({ csrfToken: token })
  })

  router.post('/check-availability', async (req, res) => {
    try {
      const email = asString(req.body?.email, 200).toLowerCase()
      const username = asString(req.body?.username, 60).toLowerCase()
      const conflicts: string[] = []
      if (email) {
        const existing = await User.findOne({ email })
        if (existing) conflicts.push('email')
      }
      if (username) {
        const existing = await User.findOne({ username })
        if (existing) conflicts.push('username')
      }
      return res.json({ available: conflicts.length === 0, conflicts })
    } catch (err) {
      console.error('[auth] check-availability failed:', err)
      return res.status(500).json({ error: 'Server error' })
    }
  })

  router.post('/register', registerLimiter, async (req, res) => {
    try {
      assertNoPrototypePollution(req.body)
      const body = req.body ?? {}
      const role = body.role === 'admin' ? 'admin' : 'student'
      const fullName = asString(body.fullName, 120)
      const emailRaw = asString(body.email, 200)
      const email = emailRaw.toLowerCase()
      const phone = normalizePhone(body.phone)
      const password = body.password

      const errors: Record<string, string> = {}
      if (!fullName || fullName.length < 2) errors.fullName = 'Full name is required'
      if (!isEmail(email)) errors.email = 'Valid email is required'
      if (!phone) errors.phone = 'Valid phone is required'
      const pwErr = passwordComplexityError(password)
      if (pwErr) errors.password = pwErr
      if (Object.keys(errors).length) {
        return res.status(400).json({ error: 'Validation failed', fieldErrors: errors })
      }

      const existing = await User.findOne({ $or: [{ email }, { phone }] })
      if (existing) return res.status(409).json({ error: 'User already exists' })

      const userPayload: any = {
        role,
        fullName,
        email,
        phone,
        passwordHash: await (User as any).hashPassword(password, env.bcryptCost),
      }
      const username = asString(body.username, 60).toLowerCase()
      if (username) userPayload.username = username

      const student = body.student ?? {}
      if (student && typeof student === 'object') {
        userPayload.student = {
          institution: asString(student.institution, 200),
          department: asString(student.department, 200),
          batch: asString(student.batch, 60),
          roll: asString(student.roll, 60),
          address: asString(student.address, 500),
          guardianName: asString(student.guardianName, 200),
          guardianPhone: normalizePhone(student.guardianPhone) ?? undefined,
        }
      }

      const user = await User.create(userPayload)
      const meta = { device: String(req.headers['x-device-id'] ?? ''), userAgent: req.headers['user-agent'], ip: getClientIp(req) }
      const { accessToken, refreshToken } = await issueTokens(user, meta)

      setAuthCookies(res, accessToken, refreshToken)
      logSecurity({ type: 'token_refresh', userId: String(user._id), detail: 'register issued tokens' })
      return res.status(201).json({ user: publicUser(user), accessToken })
    } catch (err) {
      if ((err as Error).name === 'ValidationError') {
        return res.status(400).json({ error: 'Validation failed', fieldErrors: (err as any).fieldErrors })
      }
      console.error('[auth] register failed:', err)
      return res.status(500).json({ error: 'Server error' })
    }
  })

  router.post('/login', loginLimiter, bruteForceGuard((r) => asString(r.body?.email ?? r.body?.emailOrPhone, 200)), async (req, res) => {
    try {
      assertNoPrototypePollution(req.body)
      const body = req.body ?? {}
      const identifier = asString(body.emailOrPhone ?? body.email ?? body.phone, 200)
      const password = typeof body.password === 'string' ? body.password : ''

      if (!identifier || !password) {
        return res.status(400).json({ error: 'emailOrPhone and password are required' })
      }

      const query = isEmail(identifier) ? { email: identifier.toLowerCase() } : { phone: normalizePhone(identifier) }
      if (!query.phone && !query.email) return res.status(400).json({ error: 'Invalid email/phone' })

      const user = await User.findOne(query).select('+passwordHash')
      if (user) {
        const lock = await syncDbLock(user)
        if (lock.locked) {
          res.set('Retry-After', String(Math.ceil(lock.retryAfterMs / 1000)))
          return res.status(429).json({ error: 'Account temporarily locked' })
        }
      }
      if (!user) {
        registerFailure(req, identifier.toLowerCase())
        logSecurity({ type: 'failed_login', email: identifier, detail: 'no such user' })
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const ok = await user.verifyPassword(password)
      if (!ok) {
        registerFailure(req, user.email)
        await applyDbFailure(user)
        logSecurity({ type: 'failed_login', userId: String(user._id), email: user.email, detail: 'bad password' })
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      await clearDbFailures(user)
      clearFailures(req, user.email)

      const meta = { device: String(req.headers['x-device-id'] ?? ''), userAgent: req.headers['user-agent'], ip: getClientIp(req) }
      const { accessToken, refreshToken } = await issueTokens(user, meta)
      setAuthCookies(res, accessToken, refreshToken)
      logSecurity({ type: 'token_refresh', userId: String(user._id), detail: 'login issued tokens' })
      return res.json({ user: publicUser(user), accessToken })
    } catch (err) {
      console.error('[auth] login failed:', err)
      return res.status(500).json({ error: 'Server error' })
    }
  })

  router.post('/refresh', async (req, res) => {
    try {
      const refreshToken = req.cookies?.refresh_token
      if (!refreshToken) return res.status(401).json({ error: 'Missing refresh token' })
      const meta = { device: String(req.headers['x-device-id'] ?? ''), userAgent: req.headers['user-agent'], ip: getClientIp(req) }
      const { accessToken, refreshToken: newRefresh } = await rotateTokens(refreshToken, meta)
      setAuthCookies(res, accessToken, newRefresh)
      logSecurity({ type: 'token_refresh', detail: 'rotated' })
      return res.json({ ok: true })
    } catch (err) {
      const message = (err as Error).message
      logSecurity({ type: 'token_refresh_failed', detail: message })
      if (message === 'REFRESH_TOKEN_REVOKED') {
        return res.status(401).json({ error: 'Session revoked. Please log in again.', code: 'TOKEN_REVOKED' })
      }
      return res.status(401).json({ error: 'Invalid refresh token' })
    }
  })

  router.post('/logout', authRequired(), async (req, res) => {
    try {
      const refreshToken = req.cookies?.refresh_token
      if (refreshToken) {
        const hash = hashToken(refreshToken)
        await Session_revokeByHash(hash, String(req.user!.sub))
      }
      clearAuthCookies(res)
      logSecurity({ type: 'logout', userId: req.user!.sub })
      return res.json({ ok: true })
    } catch (err) {
      console.error('[auth] logout failed:', err)
      clearAuthCookies(res)
      return res.json({ ok: true })
    }
  })

  router.post('/logout-all', authRequired(), async (req, res) => {
    try {
      const count = await revokeAllSessions(String(req.user!.sub))
      clearAuthCookies(res)
      logSecurity({ type: 'logout_all', userId: req.user!.sub, detail: `${count} sessions revoked` })
      return res.json({ ok: true, revoked: count })
    } catch (err) {
      console.error('[auth] logout-all failed:', err)
      clearAuthCookies(res)
      return res.json({ ok: true })
    }
  })

  router.get('/sessions', authRequired(), async (req, res) => {
    try {
      const sessions = await listSessions(String(req.user!.sub))
      return res.json({ ok: true, sessions })
    } catch (err) {
      console.error('[auth] sessions failed:', err)
      return res.status(500).json({ error: 'Server error' })
    }
  })

  router.delete('/sessions/:id', authRequired(), async (req, res) => {
    try {
      await revokeSession(String(req.params.id), String(req.user!.sub))
      return res.json({ ok: true })
    } catch (err) {
      console.error('[auth] session revoke failed:', err)
      return res.status(500).json({ error: 'Server error' })
    }
  })

  router.get('/me', authRequired(), async (req, res) => {
    try {
      const user = await User.findById(req.user!.sub).select('-passwordHash')
      if (!user) return res.status(404).json({ error: 'User not found' })
      return res.json({ ok: true, user: publicUser(user as IUser) })
    } catch (err) {
      console.error('[auth] /me failed:', err)
      return res.status(500).json({ error: 'Server error' })
    }
  })

  router.post('/forgot-password', passwordResetLimiter, async (req, res) => {
    try {
      assertNoPrototypePollution(req.body)
      const emailRaw = asString(req.body?.email, 200)
      const email = emailRaw.toLowerCase()
      if (!isEmail(email)) return res.status(400).json({ error: 'Valid email is required' })

      const user = await User.findOne({ email })
      // Always respond success to avoid user enumeration.
      if (!user) {
        logSecurity({ type: 'suspicious_activity', detail: 'forgot-password unknown email', email })
        return res.json({ message: 'If the account exists, a reset link has been sent.' })
      }
      // In production: email a time-limited, single-use reset token. We log the event.
      logSecurity({ type: 'token_revoked', userId: String(user._id), detail: 'password reset requested' })
      return res.json({ message: 'If the account exists, a reset link has been sent.' })
    } catch (err) {
      console.error('[auth] forgot-password failed:', err)
      return res.status(500).json({ error: 'Server error' })
    }
  })

  return router
}

async function Session_revokeByHash(hash: string, userId: string) {
  const { Session } = await import('../models/Session')
  await Session.updateOne({ refreshTokenHash: hash, userId }, { $set: { revokedAt: new Date() } })
}

export { buildAuthRouter }
