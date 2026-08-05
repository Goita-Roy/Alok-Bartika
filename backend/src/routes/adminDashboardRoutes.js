const express = require('express')
const router = express.Router()
const { protect, requireAdmin } = require('../middleware/auth')
const { getDashboardStats, getStudentProgressDistribution, getStudentRegistrationTrend, getStudentDropoutProgress, getExamPassRate, getWeakestLevel } = require('../controllers/adminDashboardController')

router.use(protect, requireAdmin)

router.get('/', getDashboardStats)
router.get('/student-progress', getStudentProgressDistribution)
router.get('/student-registration-trend', getStudentRegistrationTrend)
router.get('/student-dropout-progress', getStudentDropoutProgress)
router.get('/exam-pass-rate', getExamPassRate)
router.get('/weakest-level', getWeakestLevel)

module.exports = { adminDashboardRouter: router }
