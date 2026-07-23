import crypto from 'crypto'
import { Request, Response, NextFunction } from 'express'
import { env } from '../config/env'

export const CSRF_TOKEN_HEADER = 'x-csrf-token'
export const CSRF_COOKIE = 'csrf_token'
export const CSRF_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']

function makeToken(): string {
  return crypto.randomBytes(32).toString('base64url')
}

/**
 * Issues a CSRF double-submit token in a non-HttpOnly cookie. The SPA reads it
 * and echoes it back in the `x-csrf-token` header on state-changing requests.
 * The cookie is NOT HttpOnly so the SPA can read it, but it carries no auth.
 */
export function csrfTokenIssuer(req: Request, res: Response, next: NextFunction): void {
  const existing = req.cookies?.[CSRF_COOKIE]
  if (existing) {
    // Reuse the token the client already holds so the double-submit matches.
    res.locals.csrfToken = existing
  } else {
    const token = makeToken()
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false,
      secure: env.cookieSecure,
      sameSite: env.cookieSameSite,
      path: '/',
      maxAge: 1000 * 60 * 60 * 24,
    })
    res.locals.csrfToken = token
  }
  next()
}

const CSRF_EXEMPT_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/forgot-password',
  '/api/auth/verify-otp',
  '/api/auth/verify-otp-signup',
  '/api/auth/reset-password',
  '/api/auth/send-otp',
  '/api/auth/resend-otp',
]

function isCsrfExempt(path: string): boolean {
  return CSRF_EXEMPT_PATHS.some((p) => path === p || path.startsWith(p + '/'))
}

/**
 * Verifies the double-submit token for state-changing requests.
 * Excludes safe methods and authentication bootstrap endpoints (the user
 * has no session yet when logging in / registering, so CSRF cannot apply).
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  if (!env.csrfEnabled) return next()
  if (!CSRF_METHODS.includes(req.method)) return next()
  if ((req as any).skipCsrf) return next()
  if (isCsrfExempt(req.path)) return next()

  const headerToken = req.headers[CSRF_TOKEN_HEADER] as string | undefined
  const cookieToken = req.cookies?.[CSRF_COOKIE]
  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    res.status(403).json({ error: 'CSRF validation failed' })
    return
  }
  next()
}
