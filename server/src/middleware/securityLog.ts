import { Request, Response, NextFunction } from 'express'

export type SecurityEventType =
  | 'failed_login'
  | 'token_refresh'
  | 'token_refresh_failed'
  | 'token_revoked'
  | 'permission_denied'
  | 'rate_limited'
  | 'csrf_failed'
  | 'suspicious_activity'
  | 'account_locked'
  | 'logout'
  | 'logout_all'

interface SecurityLog {
  type: SecurityEventType
  ip?: string
  userId?: string
  email?: string
  device?: string
  detail?: string
  ts: string
}

export function logSecurity(event: Omit<SecurityLog, 'ts'>): void {
  const entry: SecurityLog = { ...event, ts: new Date().toISOString() }
  // In production this would ship to a SIEM/audit store; stdout is the minimal
  // durable sink here. Sensitive values (passwords, tokens) must never appear.
  if (process.env.NODE_ENV === 'production') {
    console.log(`[security] ${JSON.stringify(entry)}`)
  } else {
    console.log(`[security:${event.type}]`, JSON.stringify(entry))
  }
}

export function securityContext(req: Request, _res: Response, next: NextFunction): void {
  ;(req as any).securityLog = (type: SecurityEventType, extra: Partial<SecurityLog> = {}) =>
    logSecurity({
      type,
      ip: getClientIp(req),
      device: detectDevice(req.headers['user-agent']),
      ...extra,
    })
  next()
}

export function getClientIp(req: Request): string {
  const fwd = req.headers['x-forwarded-for']
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0]!.trim()
  return req.ip ?? 'unknown'
}

function detectDevice(userAgent?: string): string {
  if (!userAgent) return 'unknown'
  if (/android/i.test(userAgent)) return 'Android'
  if (/iphone|ipad|ipod/i.test(userAgent)) return 'iOS'
  if (/windows/i.test(userAgent)) return 'Windows'
  if (/macintosh/i.test(userAgent)) return 'macOS'
  if (/linux/i.test(userAgent)) return 'Linux'
  return 'unknown'
}
