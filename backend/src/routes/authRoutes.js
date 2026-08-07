const express = require('express')
const router = express.Router()
const {
  checkAvailability, registerUser, loginUser, firebaseLogin, adminLogin, superAdminLogin,
  superAdminSetup, superAdminSetupStatus, getMe,
  forgotPassword, verifyOtp, resetPassword,
  sendSignupOtp, resendSignupOtp, verifySignupOtp,
} = require('../controllers/authController')
const { protect } = require('../middleware/auth')
const {
  loginLimiter, registerLimiter, otpSendLimiter, otpVerifyLimiter, resetPasswordLimiter,
} = require('../middleware/rateLimiter')

router.post('/check-availability', checkAvailability)
router.post('/register', registerLimiter, registerUser)
router.post('/login', loginLimiter, loginUser)
router.post('/firebase', firebaseLogin)
router.post('/admin-login', loginLimiter, adminLogin)
router.post('/super-admin-login', loginLimiter, superAdminLogin)
router.get('/super-admin/setup-status', superAdminSetupStatus)
router.post('/super-admin/setup', loginLimiter, superAdminSetup)
router.post('/send-otp', otpSendLimiter, sendSignupOtp)
router.post('/resend-otp', otpSendLimiter, resendSignupOtp)
router.post('/verify-otp-signup', otpVerifyLimiter, verifySignupOtp)
router.get('/me', protect, getMe)
router.post('/forgot-password', otpSendLimiter, forgotPassword)
router.post('/verify-otp', otpVerifyLimiter, verifyOtp)
router.post('/reset-password', resetPasswordLimiter, resetPassword)

module.exports = { authRouter: router }
