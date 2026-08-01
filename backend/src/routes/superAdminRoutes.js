const express = require('express')
const router = express.Router()
const { protect, requireSuperAdmin } = require('../middleware/auth')
const {
    getSelfProfile,
    updateSelfProfile,
    changeSelfPassword,
} = require('../controllers/adminController')

router.use(protect, requireSuperAdmin)

router.get('/profile', getSelfProfile)
router.put('/profile', updateSelfProfile)
router.put('/profile/password', changeSelfPassword)

module.exports = { superAdminRouter: router }
