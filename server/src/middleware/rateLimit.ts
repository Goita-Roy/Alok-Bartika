import rateLimit from 'express-rate-limit'
import { env } from '../config/env'
import { getClientIp } from './securityLog'

function make(limit: number, label: string) {
  return rateLimit({
    windowMs: env.rateLimitWindowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => `${label}:${getClientIp(req)}`,
    handler: (req, res) => {
      ;(req as any).securityLog?.('rate_limited', { detail: label })
      res.status(429).json({ error: 'Too many requests, please try again later.' })
    },
  })
}

export const generalLimiter = make(env.rateLimitGeneral, 'general')
export const loginLimiter = make(env.rateLimitLogin, 'login')
export const registerLimiter = make(env.rateLimitRegister, 'register')
export const passwordResetLimiter = make(env.rateLimitPasswordReset, 'password_reset')
export const examLimiter = make(env.rateLimitExam, 'exam')
export const practiceLimiter = make(env.rateLimitPractice, 'practice')
export const notificationsLimiter = make(env.rateLimitNotifications, 'notifications')
export const profileLimiter = make(env.rateLimitProfile, 'profile')
