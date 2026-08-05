const express = require('express')
const router = express.Router()
const { protect, requireSuperAdmin } = require('../middleware/auth')
const { getPlatformAnalytics } = require('../controllers/platformAnalyticsController')

router.use(protect, requireSuperAdmin)

router.get('/analytics/platform', getPlatformAnalytics)

module.exports = { superAdminAnalyticsRouter: router }
