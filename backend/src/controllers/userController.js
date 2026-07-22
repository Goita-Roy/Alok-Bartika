const { User } = require('../models/User')

// @desc    Create new user profile
// @route   POST /api/users
// @access  Private
const createProfile = async (req, res) => {
  try {
    const { name, phone, email, dob, gender, district, class: studentClass, guardianInfo, role } = req.body
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
    const normalizedRole = role === 'admin' ? 'admin' : 'student'

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
      data: user,
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
    const user = await User.findOne({ clerkId })

    if (!user) {
      return res.status(404).json({ message: 'Profile not found' })
    }

    res.status(200).json({ data: user })
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
    const updates = req.body

    // Remove fields that shouldn't be updated directly via this endpoint
    delete updates.clerkId
    delete updates.email
    delete updates.xp
    delete updates.level

    const user = await User.findOneAndUpdate(
      { clerkId },
      { $set: updates },
      { returnDocument: 'after', runValidators: true }
    )

    if (!user) {
      return res.status(404).json({ message: 'Profile not found' })
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      data: user,
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

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
    res.status(200).json({ data: users })
  } catch (error) {
    console.error('Get All Users Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// @desc    Delete ANY user profile (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
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
