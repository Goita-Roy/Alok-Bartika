const express = require('express')
const router = express.Router()
const { protect, requireAdmin } = require('../middleware/auth')
const { getDashboardStats } = require('../controllers/adminDashboardController')

router.use(protect, requireAdmin)

router.get('/', getDashboardStats)

module.exports = { adminDashboardRouter: router }
