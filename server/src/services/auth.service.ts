import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { Session } from '../models/Session'
import { IUser } from '../models/User'

export interface AccessPayload {
  sub: string
  role: string
  email: string
  type: 'access'
  jti: string
  tv: number
}

export interface RefreshPayload {
  sub: string
  type: 'refresh'
  jti: string
}

function signAccess(user: { _id: unknown; role: string; email: string; tokenVersion?: number }, jti: string): string {
  const payload: AccessPayload = {
    sub: String(user._id),
    role: user.role,
    email: user.email,
    type: 'access',
    jti,
    tv: user.tokenVersion ?? 0,
  }
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtAccessExpiresIn as jwt.SignOptions['expiresIn'] })
}

function signRefresh(sub: string, jti: string): string {
  const payload: RefreshPayload = { sub, type: 'refresh', jti }
  return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpiresIn as jwt.SignOptions['expiresIn'] })
}

export function verifyAccess(token: string): AccessPayload {
  const p = jwt.verify(token, env.jwtSecret) as AccessPayload
  if (p.type !== 'access') throw new Error('Invalid token type')
  return p
}

export function verifyRefresh(token: string): RefreshPayload {
  const p = jwt.verify(token, env.jwtRefreshSecret) as RefreshPayload
  if (p.type !== 'refresh') throw new Error('Invalid token type')
  return p
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export interface IssueResult {
  accessToken: string
  refreshToken: string
  accessJti: string
  refreshJti: string
  session: InstanceType<typeof Session>
}

/**
 * Creates a new access + refresh pair and persists a revocable session row.
 * Device/IP are tracked for "logout all devices" and audit.
 */
export async function issueTokens(
  user: IUser,
  meta: { device?: string; userAgent?: string; ip?: string },
): Promise<IssueResult> {
  const accessJti = crypto.randomUUID()
  const refreshJti = crypto.randomUUID()

  const accessToken = signAccess(user, accessJti)
  const refreshToken = signRefresh(String(user._id), refreshJti)

  const refreshTokenHash = hashToken(refreshToken)
  const expiresAt = new Date(Date.now() + parseExpiry(env.jwtRefreshExpiresIn))

  const session = await Session.create({
    userId: user._id,
    refreshTokenHash,
    device: (meta.device ?? detectDevice(meta.userAgent)).slice(0, 200),
    userAgent: meta.userAgent,
    ip: meta.ip,
    expiresAt,
    revokedAt: null,
  })

  return { accessToken, refreshToken, accessJti, refreshJti, session }
}

/**
 * Rotates a refresh token: revokes the old session and issues a fresh pair.
 * This is the core of refresh-token rotation — a stolen refresh token is
 * invalidated on next use, and re-use of a rotated token can be detected.
 */
export async function rotateTokens(
  oldRefreshToken: string,
  meta: { device?: string; userAgent?: string; ip?: string },
): Promise<IssueResult> {
  const payload = verifyRefresh(oldRefreshToken)
  const refreshTokenHash = hashToken(oldRefreshToken)

  const oldSession = await Session.findOne({ refreshTokenHash, userId: payload.sub })
  if (!oldSession) {
    // Token already rotated/revoked, or never existed -> possible theft.
    throw new Error('REFRESH_TOKEN_NOT_FOUND')
  }
  if (oldSession.isRevoked()) {
    // Re-use of a revoked/rotated token -> revoke all sessions for safety.
    await Session.updateMany({ userId: payload.sub, revokedAt: null }, { $set: { revokedAt: new Date() } })
    throw new Error('REFRESH_TOKEN_REVOKED')
  }

  const user = await (require('../models/User').User as ReturnType<typeof importUser>).findById(payload.sub)
  if (!user) throw new Error('USER_NOT_FOUND')

  // Revoke the used session, then issue a fresh pair.
  oldSession.revokedAt = new Date()
  await oldSession.save()

  return issueTokens(user, meta)
}

export async function revokeSession(sessionId: string, userId: string): Promise<void> {
  await Session.updateOne({ _id: sessionId, userId }, { $set: { revokedAt: new Date() } })
}

export async function revokeAllSessions(userId: string): Promise<number> {
  const result = await Session.updateMany({ userId, revokedAt: null }, { $set: { revokedAt: new Date() } })
  // Invalidate all currently-issued access tokens immediately.
  const UserModel = require('../models/User').User
  await UserModel.updateOne({ _id: userId }, { $inc: { tokenVersion: 1 } })
  return result.modifiedCount
}

export async function listSessions(userId: string) {
  return Session.find({ userId, revokedAt: null, expiresAt: { $gt: new Date() } })
    .sort({ createdAt: -1 })
    .select('device ip createdAt expiresAt _id')
    .lean()
}

function parseExpiry(value: string): number {
  const match = /^(\d+)\s*(s|m|h|d)$/.exec(value.trim())
  if (!match) return 7 * 24 * 60 * 60 * 1000
  const n = Number(match[1])
  switch (match[2]) {
    case 's': return n * 1000
    case 'm': return n * 60 * 1000
    case 'h': return n * 60 * 60 * 1000
    case 'd': return n * 24 * 60 * 60 * 1000
    default: return n * 1000
  }
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

function importUser() {
  return require('../models/User').User
}
