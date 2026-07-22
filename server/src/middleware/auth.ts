import { Request, Response, NextFunction } from 'express'
import { verifyAccess, AccessPayload } from '../services/auth.service'
import { User } from '../models/User'

const ACCESS_COOKIE = 'access_token'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AccessPayload & { sub: string }
    }
  }
}

function extractAccessToken(req: Request): string | null {
  const cookieToken = req.cookies?.[ACCESS_COOKIE]
  if (cookieToken) return cookieToken
  const header = req.headers.authorization
  if (typeof header === 'string' && header.startsWith('Bearer ')) {
    return header.slice('Bearer '.length)
  }
  return null
}

export function authRequired() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = extractAccessToken(req)
    if (!token) return res.status(401).json({ error: 'Missing authentication' })
    let payload: AccessPayload
    try {
      payload = verifyAccess(token)
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
    // Enforce logout-all / password-change invalidation via token version.
    try {
      const user = await User.findById(payload.sub).select('tokenVersion').lean()
      if (!user) return res.status(401).json({ error: 'Invalid or expired token' })
      if ((user.tokenVersion ?? 0) !== payload.tv) {
        return res.status(401).json({ error: 'Session revoked. Please log in again.', code: 'TOKEN_REVOKED' })
      }
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
    req.user = payload as AccessPayload & { sub: string }
    return next()
  }
}

export function requireRole(role: 'student' | 'admin') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.role) return res.status(401).json({ error: 'Unauthorized' })
    if (req.user.role !== role) {
      ;(req as any).securityLog?.('permission_denied', { detail: `required ${role}` })
      return res.status(403).json({ error: 'Forbidden' })
    }
    return next()
  }
}

export { ACCESS_COOKIE }
