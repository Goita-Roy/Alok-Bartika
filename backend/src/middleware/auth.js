const jwt = require('jsonwebtoken')
const { User } = require('../models/User')

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret'

const protect = async (req, res, next) => {
  // Skip if already authenticated (e.g., from a parent middleware wrapper).
  // This avoids a redundant DB query when protect+checkPendingFeedback are
  // applied at the app level AND individual routes also call protect.
  if (req.user) return next()

  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' })
  }

  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)

    req.user = await User.findById(decoded.id).select('-password')
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' })
    }

    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please log in again' })
    }
    return res.status(401).json({ message: 'Not authorized, token failed' })
  }
}

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role ${req.user.role} is not allowed to access this resource` })
    }
    next()
  }
}

const requireStudent = requireRole('student')
const requireAdmin = requireRole('admin', 'super-admin')
const requireSuperAdmin = requireRole('super-admin')

// ── Pending feedback guard ────────────────────────────────────────────────
// Security layer that blocks LEARNING/EXAM API calls when the user has
// pending feedback.  CRITICAL: this middleware must NOT block the APIs that
// the frontend needs to detect the pending feedback state:
//   - GET  /api/auth/me       ← detects pendingFeedback
//   - GET  /api/progression   ← loads progress (including feedback status)
//   - GET  /api/notifications ← notification badges
//   - GET  /api/feedback/*    ← loads feedback form
//   - POST /api/feedback/*    ← submits feedback
//
// Those routes are whitelisted at the app.js level (they never pass through
// this middleware).  This middleware is applied ONLY to the routes that SHOULD
// be blocked: exams, practice, dashboard, learning, etc.
function checkPendingFeedback(req, res, next) {
  if (req.user && req.user.pendingFeedback) {
    const path = req.originalUrl || req.url
    const userId = req.user._id ? req.user._id.toString() : '?'
    const pending = req.user.pendingFeedback

    console.log(
      `[checkPendingFeedback] user=${userId} pendingFeedback=${pending} route=${path} decision=BLOCK`
    )
    return res.status(403).json({
      feedbackPending: true,
      pendingLevel: pending,
      message: 'অনুগ্রহ করে পূর্ববর্তী লেভেলের মতামত জমা দিন',
    })
  }
  next()
}

module.exports = { protect, requireRole, requireStudent, requireAdmin, requireSuperAdmin, checkPendingFeedback }
