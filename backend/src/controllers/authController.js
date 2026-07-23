const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { User } = require('../models/User')
const { sendOtpEmail } = require('../utils/email')
const { sendOtp, verifyOtp: verifyOtpToken } = require('../services/otpService')
const { OTP_TTL_MS } = require('../services/otpService')
const { admin, auth } = require('../config/firebase')

const generateUniqueUsername = async (base) => {
  let username = base
  // eslint-disable-next-line no-await-in-loop
  while (await User.findOne({ username })) {
    username = `${base}_${crypto.randomBytes(3).toString('hex')}`
  }
  return username
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret'

const generateToken = (user) => {
  return jwt.sign({ id: user._id, userId: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' })
}

const userResponse = (user) => ({
  token: generateToken(user),
  user: {
    id: user._id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    role: user.role,
    phone: user.phone,
    emailVerified: !!user.emailVerified,
    phoneVerified: !!user.phoneVerified,
    authProvider: user.authProvider || 'local',
  },
})

// @desc    Check whether email/username are available
// @route   POST /api/auth/check-availability
const checkAvailability = async (req, res) => {
  try {
    const { email, username } = req.body || {}

    const trimmedEmail = email?.trim()?.toLowerCase()
    const trimmedUsername = username?.trim()?.toLowerCase()
    const conflicts = []

    if (trimmedEmail) {
      const existingEmailUser = await User.findOne({ email: trimmedEmail })
      if (existingEmailUser) conflicts.push('email')
    }

    if (trimmedUsername) {
      const existingUsernameUser = await User.findOne({ username: trimmedUsername })
      if (existingUsernameUser) conflicts.push('username')
    }

    res.json({ available: conflicts.length === 0, conflicts })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Register new user
// @route   POST /api/auth/register
// Supports signup with email, phone, or both.
const registerUser = async (req, res) => {
  try {
    console.log('[auth] register body:', JSON.stringify(req.body, null, 2))

    const {
      fullName, username, email, password, phone, dob, gender,
      schoolName, grade, section, division, city, country,
      termsAccepted, role, studentId, interests, preferredLanguage, skillLevel,
    } = req.body

    const trimmedFullName = fullName?.trim()
    const trimmedEmail = email?.trim()?.toLowerCase()
    const rawPhone = phone?.trim()
    const trimmedPhone = rawPhone ? rawPhone.replace(/[\s-]/g, '') : ''
    const trimmedDob = dob?.trim ? dob.trim() : dob

    const validationErrors = []
    if (!trimmedFullName) validationErrors.push('Full name is required')
    if (!password || password.length < 6) validationErrors.push('Password must be at least 6 characters')
    if (!trimmedEmail && !trimmedPhone) {
      validationErrors.push('Email or phone number is required')
    }

    // Auto-generate a username when not supplied.
    let trimmedUsername = username?.trim()?.toLowerCase()
    if (!trimmedUsername) {
      const base = (trimmedEmail ? trimmedEmail.split('@')[0] : trimmedPhone).replace(/[^a-z0-9_]/g, '').toLowerCase()
      trimmedUsername = base || `user${crypto.randomBytes(3).toString('hex')}`
    }

    if (validationErrors.length > 0) {
      console.log('[auth] validation errors:', validationErrors)
      return res.status(400).json({ message: validationErrors.join('. ') })
    }

    // Only validate dob if it is provided (it is optional)
    let parsedDob
    if (dob) {
      parsedDob = new Date(dob)
      if (Number.isNaN(parsedDob.getTime())) {
        return res.status(400).json({ message: 'Invalid date of birth' })
      }
    }

    const orQuery = []
    if (trimmedEmail) orQuery.push({ email: trimmedEmail })
    orQuery.push({ username: trimmedUsername })
    if (trimmedPhone) orQuery.push({ phone: trimmedPhone })

    const existingUser = await User.findOne({ $or: orQuery })

    if (existingUser) {
      if (trimmedEmail && existingUser.email === trimmedEmail) {
        return res.status(409).json({ message: 'Email already exists', code: 'EMAIL_EXISTS' })
      }
      if (existingUser.username === trimmedUsername) {
        return res.status(409).json({ message: 'Username already exists', code: 'USERNAME_EXISTS' })
      }
      if (trimmedPhone && existingUser.phone === trimmedPhone) {
        return res.status(409).json({ message: 'Phone number already exists', code: 'PHONE_EXISTS' })
      }
    }

    const userData = {
      fullName: trimmedFullName,
      username: trimmedUsername,
      password,
      termsAccepted: termsAccepted !== false,
      role: role || 'student',
    }
    if (trimmedEmail) userData.email = trimmedEmail
    if (trimmedPhone) userData.phone = trimmedPhone

    if (parsedDob) userData.dob = parsedDob
    if (gender) userData.gender = gender
    if (schoolName?.trim()) userData.schoolName = schoolName.trim()
    if (grade?.trim()) userData.grade = grade.trim()
    if (section?.trim()) userData.section = section.trim()
    if (division?.trim()) userData.division = division.trim()
    if (city?.trim()) userData.city = city.trim()
    if (country?.trim()) userData.country = country.trim()
    if (studentId?.trim()) userData.studentId = studentId.trim()
    if (interests?.trim()) userData.interests = interests.trim()
    if (preferredLanguage?.trim()) userData.preferredLanguage = preferredLanguage.trim()
    if (skillLevel) userData.skillLevel = skillLevel

    console.log('[auth] creating user with:', JSON.stringify(userData, null, 2))
    const user = await User.create(userData)
    console.log('[auth] user created:', user._id)

    res.status(201).json(userResponse(user))
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      return res.status(400).json({ message: `${field} already exists` })
    }
    res.status(500).json({ message: error.message })
  }
}

// @desc    Auth user & get token (auto-detects email / username / phone)
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    console.log('[auth] login body:', JSON.stringify(req.body, null, 2))

    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email/Phone and password are required' })
    }

    const raw = String(email).trim()
    const isPhone = /^\+?\d{8,15}$/.test(raw.replace(/[\s-]/g, ''))
    const identifier = isPhone ? raw.replace(/[\s-]/g, '') : raw.toLowerCase()

    const query = isPhone
      ? { phone: identifier }
      : { $or: [{ email: identifier }, { username: identifier }] }

    const user = await User.findOne(query)

    if (!user) {
      return res.status(401).json({ message: 'Account not found' })
    }

    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Incorrect password' })
    }

    res.json(userResponse(user))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

<<<<<<< HEAD
// @desc    Authenticate (or auto-register) a user via Firebase Google ID token
// @route   POST /api/auth/firebase
const firebaseLogin = async (req, res) => {
  try {
    const { idToken } = req.body || {}
    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID token is required' })
    }

    let decoded
    try {
      decoded = await auth.verifyIdToken(idToken)
    } catch (err) {
      console.error('[auth] Firebase token verification failed:', err.message)
      return res.status(401).json({ message: 'Invalid Firebase token' })
    }

    if (!decoded || !decoded.email) {
      return res.status(400).json({ message: 'Firebase token has no email' })
    }

    const email = decoded.email.trim().toLowerCase()
    const firebaseUid = decoded.uid
    const fullName = (decoded.name || email.split('@')[0]).trim()
    const picture = decoded.picture || ''

    let user = await User.findOne({ firebaseUid })

    if (!user) {
      user = await User.findOne({ email })
    }

    if (user) {
      if (!user.firebaseUid) {
        user.firebaseUid = firebaseUid
        if (picture && !user.picture) user.picture = picture
        await user.save()
      }
    } else {
      const base = (email.split('@')[0] || 'user')
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 40) || 'user'
      const username = await generateUniqueUsername(base)

      user = await User.create({
        fullName,
        username,
        email,
        password: `firebase-${crypto.randomBytes(16).toString('hex')}`,
        phone: `fb-${crypto.randomBytes(6).toString('hex')}`,
        firebaseUid,
        picture,
        termsAccepted: true,
        role: 'student',
      })
=======
// @desc    Admin login — email+password with role check
// @route   POST /api/auth/admin-login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const identifier = String(email).trim().toLowerCase()
    const user = await User.findOne({ email: identifier })

    if (!user) {
      return res.status(401).json({ message: 'No account found with this email' })
    }

    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Incorrect password' })
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ code: 'NOT_ADMIN', message: 'Access denied. Admin privileges required.' })
    }

    res.json(userResponse(user))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Super Admin login — email+password with role check
// @route   POST /api/auth/super-admin-login
const superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const identifier = String(email).trim().toLowerCase()
    const user = await User.findOne({ email: identifier })

    if (!user) {
      return res.status(401).json({ message: 'No account found with this email' })
    }

    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Incorrect password' })
    }

    if (user.role !== 'super-admin') {
      return res.status(403).json({ code: 'NOT_SUPER_ADMIN', message: 'Access denied. Super Admin privileges required.' })
>>>>>>> 1dbee02a071ad2b0b2ad17a4c25a6069cc7011c1
    }

    res.json(userResponse(user))
  } catch (error) {
<<<<<<< HEAD
    console.error('[auth] firebase login failed:', error.message)
=======
>>>>>>> 1dbee02a071ad2b0b2ad17a4c25a6069cc7011c1
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    if (user) {
      res.json({
        ok: true,
        user: {
          id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
      })
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Send 6-digit OTP to email for password reset
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() })
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' })
    }

    const otp = crypto.randomInt(100000, 999999).toString()

    user.resetOtp = otp
    user.resetOtpExpire = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()

    try {
      await sendOtpEmail(user.email, otp)
      console.log(`[auth] OTP sent to ${user.email}: ${otp}`)
    } catch (mailErr) {
      console.error('[auth] Email send failed:', mailErr.message)
      user.resetOtp = undefined
      user.resetOtpExpire = undefined
      await user.save()
      return res.status(500).json({ message: 'Failed to send OTP email. Please try again later.' })
    }

    res.json({ message: 'A 6-digit OTP has been sent to your email.' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' })
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      resetOtp: otp.trim(),
      resetOtpExpire: { $gt: new Date() },
    })

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    user.resetOtp = resetToken
    // Give the user 10 more minutes to set the password
    user.resetOtpExpire = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()

    res.json({ message: 'OTP verified successfully.', resetToken })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Reset password with verified OTP
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, password } = req.body
    if (!email || !resetToken || !password) {
      return res.status(400).json({ message: 'Email, reset token, and new password are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      resetOtp: resetToken.trim(),
      resetOtpExpire: { $gt: new Date() },
    })

    if (!user) {
      return res.status(400).json({ message: 'Reset token is invalid or has expired. Please start the process again.' })
    }

    user.password = password
    user.resetOtp = undefined
    user.resetOtpExpire = undefined
    await user.save()

    res.json({ message: 'Password updated successfully. You can now log in with your new password.' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Send a signup verification OTP (email and/or phone)
// @route   POST /api/auth/send-otp
const sendSignupOtp = async (req, res) => {
  try {
    const { email, phone } = req.body || {}
    const result = await sendOtp({ email, phone, purpose: 'signup' })
    const isProd = process.env.NODE_ENV === 'production'
    res.json({
      message: `OTP sent to your ${result.channel}`,
      channel: result.channel,
      identifier: result.identifier,
      expiresInMs: result.expiresInMs,
      ...(isProd ? {} : { otp: result.otp }),
    })
  } catch (error) {
    const status = error.status || 500
    res.status(status).json({ message: error.message, retryAfterMs: error.retryAfterMs || undefined })
  }
}

// @desc    Resend a signup verification OTP
// @route   POST /api/auth/resend-otp
const resendSignupOtp = async (req, res) => {
  try {
    const { email, phone } = req.body || {}
    const result = await sendOtp({ email, phone, purpose: 'signup' })
    const isProd = process.env.NODE_ENV === 'production'
    res.json({
      message: `OTP resent to your ${result.channel}`,
      channel: result.channel,
      identifier: result.identifier,
      expiresInMs: result.expiresInMs,
      ...(isProd ? {} : { otp: result.otp }),
    })
  } catch (error) {
    const status = error.status || 500
    res.status(status).json({ message: error.message, retryAfterMs: error.retryAfterMs || undefined })
  }
}

// @desc    Verify signup OTP; create the account ONLY after success
// @route   POST /api/auth/verify-otp-signup
const verifySignupOtp = async (req, res) => {
  try {
    const {
      email, phone, otp,
      fullName, username, password, confirmPassword,
      dob, gender, schoolName, grade, section, division, city, country,
      termsAccepted, studentId, interests, preferredLanguage, skillLevel,
    } = req.body || {}

    if (!otp) return res.status(400).json({ message: 'OTP is required' })

    // STEP 1: Validate the OTP WITHOUT consuming it yet.
    // The OTP record must remain valid until the user is actually created,
    // so a later failure (e.g. duplicate) keeps the OTP usable for retry.
    let verified
    try {
      verified = await verifyOtpToken({ email, phone, otp, purpose: 'signup', consume: false })
    } catch (verr) {
      const status = verr.status || 500
      const payload = { message: verr.message }
      if (typeof verr.remainingAttempts === 'number') payload.remainingAttempts = verr.remainingAttempts
      if (verr.retryAfterMs) payload.retryAfterMs = verr.retryAfterMs
      return res.status(status).json(payload)
    }

    const trimmedEmail = verified.type === 'email' ? verified.identifier : (email || '').trim().toLowerCase()
    const trimmedPhone = verified.type === 'phone' ? verified.identifier : (phone || '').trim()

    // STEP 2: Duplicate/availability check BEFORE creating the user, and
    // WITHOUT consuming the OTP. This surfaces "already exists" clearly while
    // the OTP stays valid so the user can still sign in / retry.
    const orQuery = []
    if (trimmedEmail) orQuery.push({ email: trimmedEmail })
    if (trimmedPhone) orQuery.push({ phone: trimmedPhone })
    if (username?.trim()) orQuery.push({ username: username.trim().toLowerCase() })
    if (orQuery.length) {
      const existing = await User.findOne({ $or: orQuery })
      if (existing) {
        let code = 'CONFLICT'
        let message = 'Account already exists'
        if (trimmedEmail && existing.email === trimmedEmail) { code = 'EMAIL_EXISTS'; message = 'Email already exists' }
        else if (trimmedPhone && existing.phone === trimmedPhone) { code = 'PHONE_EXISTS'; message = 'Phone number already exists' }
        else if (username?.trim() && existing.username === username.trim().toLowerCase()) { code = 'USERNAME_EXISTS'; message = 'Username already exists' }
        // NOTE: OTP is intentionally NOT deleted here.
        return res.status(409).json({ message, code })
      }
    }

    // STEP 3: Create the user via the existing register logic.
    const registerBody = {
      fullName, username, email: trimmedEmail, phone: trimmedPhone,
      password, confirmPassword,
      dob, gender, schoolName, grade, section, division, city, country,
      termsAccepted, studentId, interests, preferredLanguage, skillLevel,
      role: 'student',
    }

    const fakeRes = {
      statusCode: 200,
      _json: null,
      status(code) { this.statusCode = code; return this },
      json(obj) { this._json = obj; return this },
    }
    await registerUser({ body: registerBody, user: undefined }, fakeRes, () => {})

    if (fakeRes.statusCode >= 400 || !fakeRes._json) {
      // User creation failed (e.g. race-condition duplicate). The OTP is still
      // valid, so the client can retry. Do NOT delete the OTP here.
      return res.status(fakeRes.statusCode || 500).json(fakeRes._json || { message: 'Registration failed' })
    }

    const created = fakeRes._json.user

    // Mark the verified channel.
    const update = {}
    if (verified.type === 'email') update.emailVerified = true
    if (verified.type === 'phone') update.phoneVerified = true
    if (Object.keys(update).length) {
      await User.findByIdAndUpdate(created.id, update)
    }

    // STEP 4: Only now — after a successful user creation — consume (delete) the OTP.
    await verifyOtpToken({ email, phone, otp, purpose: 'signup', consume: true })

    res.status(201).json(userResponse({ ...created, ...update, _id: created.id }))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  checkAvailability,
  registerUser,
  loginUser,
<<<<<<< HEAD
  firebaseLogin,
=======
  adminLogin,
  superAdminLogin,
>>>>>>> 1dbee02a071ad2b0b2ad17a4c25a6069cc7011c1
  getMe,
  forgotPassword,
  verifyOtp,
  resetPassword,
  sendSignupOtp,
  resendSignupOtp,
  verifySignupOtp,
}
