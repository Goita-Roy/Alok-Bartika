const express = require('express')
const router = express.Router()
const {
  checkAvailability, registerUser, loginUser, firebaseLogin, getMe,
  forgotPassword, verifyOtp, resetPassword,
  sendSignupOtp, resendSignupOtp, verifySignupOtp,
} = require('../controllers/authController')
const { protect } = require('../middleware/auth')

router.post('/check-availability', checkAvailability)
router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/firebase', firebaseLogin)
router.post('/send-otp', sendSignupOtp)
router.post('/resend-otp', resendSignupOtp)
router.post('/verify-otp-signup', verifySignupOtp)
router.get('/me', protect, getMe)
router.post('/forgot-password', forgotPassword)
router.post('/verify-otp', verifyOtp)
router.post('/reset-password', resetPassword)

module.exports = { authRouter: router }
