const express = require('express')
const router = express.Router()
const {
<<<<<<< HEAD
  checkAvailability, registerUser, loginUser, firebaseLogin, getMe,
  forgotPassword, verifyOtp, resetPassword,
=======
  checkAvailability, registerUser, loginUser, adminLogin, superAdminLogin, getMe,
  forgotPassword, verifyOtp, resetPassword, googleLogin,
>>>>>>> 1dbee02a071ad2b0b2ad17a4c25a6069cc7011c1
  sendSignupOtp, resendSignupOtp, verifySignupOtp,
} = require('../controllers/authController')
const { protect } = require('../middleware/auth')

router.post('/check-availability', checkAvailability)
router.post('/register', registerUser)
router.post('/login', loginUser)
<<<<<<< HEAD
router.post('/firebase', firebaseLogin)
=======
router.post('/admin-login', adminLogin)
router.post('/super-admin-login', superAdminLogin)
router.post('/google', googleLogin)
>>>>>>> 1dbee02a071ad2b0b2ad17a4c25a6069cc7011c1
router.post('/send-otp', sendSignupOtp)
router.post('/resend-otp', resendSignupOtp)
router.post('/verify-otp-signup', verifySignupOtp)
router.get('/me', protect, getMe)
router.post('/forgot-password', forgotPassword)
router.post('/verify-otp', verifyOtp)
router.post('/reset-password', resetPassword)

module.exports = { authRouter: router }
