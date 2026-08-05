const express = require('express')
const router = express.Router()
const { protect, requireAdmin } = require('../middleware/auth')
const {
  getExamMonitoringOverview,
  getExamMonitoringActivities,
  getExamMonitoringActivityDetail,
  exportExamMonitoring,
  ingestExamViolation,
} = require('../controllers/examMonitoringController')

router.use(protect)

// Reusable proctoring-event intake — any authenticated user (e.g. a future
// student anti-cheat hook) can write events. Kept separate from the admin-only
// read endpoints below.
router.post('/violations', ingestExamViolation)

router.use(requireAdmin)

router.get('/overview', getExamMonitoringOverview)
router.get('/activities', getExamMonitoringActivities)
router.get('/activities/:id', getExamMonitoringActivityDetail)
router.get('/export', exportExamMonitoring)

module.exports = { examMonitoringRouter: router }
