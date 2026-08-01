const { Router } = require('express')
const { protect, requireAdmin, requireSuperAdmin } = require('../middleware/auth')
const {
  submitFeedback,
  getFeedbackStatus,
  getAdminFeedbackList,
  getFeedbackAnalytics,
  submitExamFeedback,
  getMyExamFeedback,
  getExamFeedbackById,
  updateExamFeedback,
  deleteExamFeedback,
  getAdminExamFeedbackList,
  getAdminExamFeedbackAnalytics,
} = require('../controllers/feedbackController')

const router = Router()

router.post('/submit', protect, submitFeedback)
router.get('/status/:level', protect, getFeedbackStatus)

router.get('/admin/list', protect, requireAdmin, getAdminFeedbackList)
router.get('/admin/analytics', protect, requireAdmin, getFeedbackAnalytics)

router.post('/exam', protect, submitExamFeedback)
router.get('/exam/my', protect, getMyExamFeedback)
router.get('/exam/:id', protect, requireAdmin, getExamFeedbackById)
router.put('/exam/:id', protect, requireAdmin, updateExamFeedback)
router.delete('/exam/:id', protect, requireSuperAdmin, deleteExamFeedback)

router.get('/exam/admin/list', protect, requireAdmin, getAdminExamFeedbackList)
router.get('/exam/admin/analytics', protect, requireAdmin, getAdminExamFeedbackAnalytics)

module.exports = { feedbackRouter: router }
