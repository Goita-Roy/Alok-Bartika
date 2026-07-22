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
const { protect } = require('../middleware/auth')

// Helper for role check
const requireRole = (role) => (req, res, next) => {
  if (req.user && req.user.role === role) {
    next()
  } else {
    res.status(403).json({ message: 'Forbidden: Insufficient permissions' })
  }
}

// Protect all routes
router.use(protect)

router.post('/', createProfile)
router.get('/me', getProfile)
router.put('/me', updateProfile)
router.delete('/me', deleteProfile)

// Admin only routes
router.get('/', requireRole('admin'), getAllUsers)
router.delete('/:id', requireRole('admin'), deleteUserById)

module.exports = { userRouter: router }
