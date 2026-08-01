const express = require('express')
const router = express.Router()
const {
  createProfile,
  getProfile,
  updateProfile,
  deleteProfile,
  getAllUsers,
  deleteUserById,
} = require('../controllers/userController')
const { protect, requireSuperAdmin } = require('../middleware/auth')

// Protect all routes
router.use(protect)

router.post('/', createProfile)
router.get('/me', getProfile)
router.put('/me', updateProfile)
router.delete('/me', deleteProfile)

// Super Admin only routes — these list ALL users (incl. admins/super-admins)
// and can delete ANY account, so plain admins must not have access.
router.get('/', requireSuperAdmin, getAllUsers)
router.delete('/:id', requireSuperAdmin, deleteUserById)

module.exports = { userRouter: router }
