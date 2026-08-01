const { Router } = require('express')
const { protect, requireAdmin } = require('../middleware/auth')
const {
  submitFeedback,
  getFeedbackStatus,
  getAdminFeedbackList,
  getFeedbackAnalytics,
} = require('../controllers/feedbackController')

const router = Router()

router.post('/submit', protect, submitFeedback)
router.get('/status/:level', protect, getFeedbackStatus)

router.get('/admin/list', protect, requireAdmin, getAdminFeedbackList)
router.get('/admin/analytics', protect, requireAdmin, getFeedbackAnalytics)

module.exports = { feedbackRouter: router }