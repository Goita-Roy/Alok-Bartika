const rateLimit = require('express-rate-limit')
const { env } = require('../config/env')

// Standard JSON 429 responses. express-rate-limit still sets the
// `RateLimit-*` headers (standardHeaders) and `Retry-After`.
function jsonHandler(req, res, _next, options) {
  const retryAfter = req.rateLimit?.resetTime
    ? Math.max(1, Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000))
    : Math.ceil(options.windowMs / 1000)
  res.setHeader('Retry-After', String(retryAfter))
  res.status(options.statusCode).json({
    success: false,
    message: 'Too many requests. Please try again later.',
    retryAfter,
  })
}

function buildLimiter(windowMs, limit) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: jsonHandler,
    // When behind a proxy (Render), key off the real client IP via the
    // X-Forwarded-For chain. When not trusted, ignore that header so the
    // built-in validation never rejects requests.
    validate: { trustProxy: env.trustProxy, xForwardedForHeader: env.trustProxy },
  })
}

// ── Per-endpoint production-safe limits ────────────────────────────────────
// Credential / OTP abuse protection. Generous enough for real classrooms
// behind a shared NAT, strict enough to stop scripted brute force.

// Login attempts: 10 per 15 minutes per IP.
const loginLimiter = buildLimiter(15 * 60 * 1000, 10)

// Public signups: 5 per hour per IP (prevent spam account creation).
const registerLimiter = buildLimiter(60 * 60 * 1000, 5)

// OTP generation (send/resend/forgot-password): 5 per 15 minutes per IP —
// bounds mail/SMS costs and OTP inbox flooding.
const otpSendLimiter = buildLimiter(15 * 60 * 1000, 5)

// OTP verification: 10 per 15 minutes per IP (limit brute-force guessing).
const otpVerifyLimiter = buildLimiter(15 * 60 * 1000, 10)

// Password reset: 5 per 15 minutes per IP.
const resetPasswordLimiter = buildLimiter(15 * 60 * 1000, 5)

module.exports = {
  loginLimiter,
  registerLimiter,
  otpSendLimiter,
  otpVerifyLimiter,
  resetPasswordLimiter,
}
