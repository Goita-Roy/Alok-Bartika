const express = require('express')
const router = express.Router()
const { protect, requireAdmin, requireSuperAdmin } = require('../middleware/auth')
const {
  createAdmin, getAdmins, getAdmin, updateAdmin, suspendAdmin, deleteAdmin,
  getSelfProfile, updateSelfProfile, changeSelfPassword,
} = require('../controllers/adminController')

router.use(protect)

router.get('/me', requireAdmin, getSelfProfile)
router.put('/me', requireAdmin, updateSelfProfile)
router.put('/change-password', requireAdmin, changeSelfPassword)

router.post('/', requireSuperAdmin, createAdmin)
router.get('/', requireSuperAdmin, getAdmins)
router.get('/:id', requireSuperAdmin, getAdmin)
router.put('/:id', requireSuperAdmin, updateAdmin)
router.patch('/:id/suspend', requireSuperAdmin, suspendAdmin)
router.delete('/:id', requireSuperAdmin, deleteAdmin)

module.exports = { adminRouter: router }