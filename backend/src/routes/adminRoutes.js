const express = require('express')
const router = express.Router()
const { protect, requireSuperAdmin } = require('../middleware/auth')
const {
  createAdmin, getAdmins, getAdmin, updateAdmin, suspendAdmin, deleteAdmin,
  getSelfProfile, updateSelfProfile, changeSelfPassword,
} = require('../controllers/adminController')

router.use(protect, requireSuperAdmin)

router.get('/me', getSelfProfile)
router.put('/me', updateSelfProfile)
router.put('/change-password', changeSelfPassword)

router.post('/', createAdmin)
router.get('/', getAdmins)
router.get('/:id', getAdmin)
router.put('/:id', updateAdmin)
router.patch('/:id/suspend', suspendAdmin)
router.delete('/:id', deleteAdmin)

module.exports = { adminRouter: router }
