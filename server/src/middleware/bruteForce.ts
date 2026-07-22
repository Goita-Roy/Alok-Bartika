import { Request, Response, NextFunction } from 'express'
import { env } from '../config/env'
import { getClientIp } from './securityLog'
import { IUser } from '../models/User'
import { logSecurity } from './securityLog'

// In-memory lock tracking keyed by IP / email / device fingerprint.
// For multi-instance production this should be shared (Redis); in-memory is
// adequate for a single Node process and survives restarts via the DB lock too.
interface LockRecord {
  count: number
  until: number
}

const ipLocks = new Map<string, LockRecord>()
const emailLocks = new Map<string, LockRecord>()
const deviceLocks = new Map<string, LockRecord>()

function deviceKey(req: Request): string {
  const ua = String(req.headers['user-agent'] ?? 'unknown')
  return `${getClientIp(req)}|${ua.slice(0, 80)}`
}

export function checkLock(req: Request, email?: string): { locked: boolean; retryAfterMs: number } {
  const now = Date.now()
  const keys = [getClientIp(req), email?.toLowerCase(), deviceKey(req)].filter(Boolean) as string[]
  for (const k of keys) {
    const rec = (emailLocks.get(k) ?? ipLocks.get(k) ?? deviceLocks.get(k))
    if (rec && rec.until > now) {
      return { locked: true, retryAfterMs: rec.until - now }
    }
  }
  return { locked: false, retryAfterMs: 0 }
}

export function registerFailure(req: Request, email?: string): void {
  const now = Date.now()
  const bump = (m: Map<string, LockRecord>, k: string) => {
    const rec = m.get(k)
    if (!rec || rec.until < now) m.set(k, { count: 1, until: now + env.loginLockMs })
    else {
      rec.count += 1
      if (rec.count >= env.maxLoginAttempts) rec.until = now + env.loginLockMs
    }
  }
  const ip = getClientIp(req)
  const dk = deviceKey(req)
  bump(ipLocks, ip)
  bump(deviceLocks, dk)
  if (email) {
    bump(emailLocks, email.toLowerCase())
    if ((emailLocks.get(email.toLowerCase())?.count ?? 0) >= env.maxLoginAttempts) {
      logSecurity({ type: 'account_locked', email, ip, detail: `${env.maxLoginAttempts} failed attempts` })
    }
  }
}

export function clearFailures(req: Request, email?: string): void {
  const ip = getClientIp(req)
  ipLocks.delete(ip)
  deviceLocks.delete(deviceKey(req))
  if (email) emailLocks.delete(email.toLowerCase())
}

export function bruteForceGuard(getEmail?: (req: Request) => string | undefined) {
  return (req: Request, res: Response, next: NextFunction) => {
    const email = getEmail?.(req)
    const { locked, retryAfterMs } = checkLock(req, email)
    if (locked) {
      res.set('Retry-After', String(Math.ceil(retryAfterMs / 1000)))
      return res.status(429).json({ error: 'Too many failed attempts. Account temporarily locked.', retryAfterMs })
    }
    next()
  }
}

// Keep the DB-level lock in sync for Mongo-backed users.
export async function syncDbLock(user: IUser): Promise<{ locked: boolean; retryAfterMs: number }> {
  const now = Date.now()
  if (user.lockUntil && user.lockUntil.getTime() > now) {
    return { locked: true, retryAfterMs: user.lockUntil.getTime() - now }
  }
  return { locked: false, retryAfterMs: 0 }
}

export async function applyDbFailure(user: IUser): Promise<void> {
  user.failedLoginAttempts = (user.failedLoginAttempts ?? 0) + 1
  if (user.failedLoginAttempts >= env.maxLoginAttempts) {
    user.lockUntil = new Date(Date.now() + env.loginLockMs)
  }
  await user.save()
}

export async function clearDbFailures(user: IUser): Promise<void> {
  user.failedLoginAttempts = 0
  user.lockUntil = null
  user.lastLoginAt = new Date()
  await user.save()
}
