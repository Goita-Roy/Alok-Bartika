const express = require('express')
const rateLimit = require('express-rate-limit')
const router = express.Router()
const { getHint, chat } = require('../controllers/aiController')
const { protect } = require('../middleware/auth')

// Server-side abuse protection for the paid-by-token AI endpoints.
// 20 requests / minute / IP across hint + chat.
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many AI requests. Please wait a moment and try again.' },
})

// Protect AI endpoints. NOTE: app.js already applies `protect` + the
// pending-feedback check at the /api/ai mount point; the per-route `protect`
// is kept as a defense-in-depth measure (it short-circuits when req.user is set).
router.post('/hint', protect, aiLimiter, getHint)
router.post('/chat', protect, aiLimiter, chat)

module.exports = { aiRouter: router }
