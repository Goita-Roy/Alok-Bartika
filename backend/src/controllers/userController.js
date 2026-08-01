const { User } = require('../models/User')
const { auditService } = require('../services/auditService')

// SECURITY: whitelist the public fields that may ever appear in API responses.
// Password hashes, reset OTPs/tokens, and other internal fields are never sent.
const SENSITIVE_USER_FIELDS = '-password -resetOtp -resetOtpExpire -firebaseUid -clerkId'

const sanitizeUser = (u) => ({
  id: u._id,
  _id: u._id,
  fullName: u.fullName,
  username: u.username,
  email: u.email,
  phone: u.phone,
  role: u.role,
  isActive: u.isActive,
  emailVerified: !!u.emailVerified,
  phoneVerified: !!u.phoneVerified,
  skillLevel: u.skillLevel,
  currentStage: u.currentStage,
  xp: u.xp,
  level: u.level,
  createdAt: u.createdAt,
  lastActivityTime: u.lastActivityTime,
})

// @desc    Create new user profile
// @route   POST /api/users
// @access  Private
const createProfile = async (req, res) => {
  try {
    const { name, phone, email, dob, gender, district, class: studentClass, guardianInfo } = req.body
    const clerkId = req.auth?.userId

    if (!clerkId) {
      return res.status(401).json({ message: 'Unauthorized: No clerkId found' })
    }

    // Validation
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' })
    }

    // Check for duplicate user
    let user = await User.findOne({ clerkId })
    if (user) {
      return res.status(409).json({ message: 'Profile already exists' })
    }

    // Check for duplicate email
    const emailExists = await User.findOne({ email: email.toLowerCase() })
    if (emailExists) {
      return res.status(409).json({ message: 'Email already in use' })
    }

    const emailLocalPart = String(email).split('@')[0] || 'user'
    const generatedUsername = `${emailLocalPart}-${String(clerkId).slice(-6)}`.toLowerCase()
    // SECURITY: profile creation can never assign a privileged role. Privileged
    // roles are granted exclusively via authenticated /api/admins.
    const normalizedRole = 'student'

    user = new User({
      clerkId,
      fullName: name,
      username: generatedUsername,
      email,
      // Keep password populated for schema compatibility; login auth is handled by Clerk for this flow.
      password: `clerk-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      phone: phone || 'N/A',
      dob: dob || new Date('2000-01-01'),
      gender: gender === 'prefer_not_to_say' ? 'other' : (gender || 'other'),
      schoolName: district || 'N/A',
      grade: studentClass || 'N/A',
      section: 'N/A',
      division: district || 'N/A',
      city: district || 'N/A',
      role: normalizedRole,
      termsAccepted: true,
      guardianInfo,
    })

    await user.save()

    res.status(201).json({
      message: 'Profile created successfully',
      data: sanitizeUser(user),
    })
  } catch (error) {
    console.error('Create Profile Error:', error)
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message)
      return res.status(400).json({ message: 'Validation Error', errors: messages })
    }
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
const getProfile = async (req, res) => {
  try {
    const clerkId = req.auth?.userId
    const user = await User.findOne({ clerkId }).select(SENSITIVE_USER_FIELDS)

    if (!user) {
      return res.status(404).json({ message: 'Profile not found' })
    }

    res.status(200).json({ data: sanitizeUser(user) })
  } catch (error) {
    console.error('Get Profile Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// @desc    Update current user profile
// @route   PUT /api/users/me
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const clerkId = req.auth?.userId

    // SECURITY: whitelist the editable fields. Never allow a caller to change
    // role, account status, verification state, or credentials via this route.
    const allowed = [
      'fullName', 'phone', 'dob', 'gender', 'schoolName', 'grade', 'section',
      'division', 'city', 'country', 'studentId', 'interests',
      'preferredLanguage', 'skillLevel', 'guardianInfo',
    ]
    const updates = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key]
    }

    const user = await User.findOneAndUpdate(
      { clerkId },
      { $set: updates },
      { returnDocument: 'after', runValidators: true }
    ).select(SENSITIVE_USER_FIELDS)

    if (!user) {
      return res.status(404).json({ message: 'Profile not found' })
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      data: sanitizeUser(user),
    })
  } catch (error) {
    console.error('Update Profile Error:', error)
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message)
      return res.status(400).json({ message: 'Validation Error', errors: messages })
    }
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// @desc    Delete user profile
// @route   DELETE /api/users/me
// @access  Private
const deleteProfile = async (req, res) => {
  try {
    const clerkId = req.auth?.userId
    const user = await User.findOneAndDelete({ clerkId })

    if (!user) {
      return res.status(404).json({ message: 'Profile not found' })
    }

    res.status(200).json({ message: 'Profile deleted successfully' })
  } catch (error) {
    console.error('Delete Profile Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// @desc    Get all users (Super Admin only)
// @route   GET /api/users
// @access  Private/SuperAdmin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select(SENSITIVE_USER_FIELDS)
    res.status(200).json({ data: users.map(sanitizeUser) })
  } catch (error) {
    console.error('Get All Users Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// @desc    Delete ANY user profile (Super Admin only)
// @route   DELETE /api/users/:id
// @access  Private/SuperAdmin
const deleteUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    auditService.logUserDeletion(req.user, user, req)
    res.status(200).json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Delete User Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = {
  createProfile,
  getProfile,
  updateProfile,
  deleteProfile,
  getAllUsers,
  deleteUserById,
}
