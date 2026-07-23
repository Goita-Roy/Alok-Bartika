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
const { protect, requireAdmin } = require('../middleware/auth')

// Protect all routes
router.use(protect)

router.post('/', createProfile)
router.get('/me', getProfile)
router.put('/me', updateProfile)
router.delete('/me', deleteProfile)

// Admin only routes
router.get('/', requireAdmin, getAllUsers)
router.delete('/:id', requireAdmin, deleteUserById)

module.exports = { userRouter: router }
