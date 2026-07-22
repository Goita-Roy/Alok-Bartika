const express = require('express')
const router = express.Router()
const { getProfile, updateProfile, uploadAvatar, changePassword } = require('../controllers/profileController')
const { protect } = require('../middleware/auth')

router.get('/', protect, getProfile)
router.put('/', protect, updateProfile)
router.post('/upload', protect, uploadAvatar)
router.post('/avatar', protect, uploadAvatar)
router.put('/change-password', protect, changePassword)

module.exports = { profileRouter: router }
