const express = require('express')
const router = express.Router()
const { protect, requireSuperAdmin } = require('../middleware/auth')
const { getSettings, updateSettings } = require('../controllers/systemSettingsController')

// SECURITY: every system settings route is private and Super Admin only.
// Plain admins and students receive 403 Forbidden here.
router.use(protect, requireSuperAdmin)

router.get('/', getSettings)
router.put('/', updateSettings)

module.exports = { systemSettingsRouter: router }
