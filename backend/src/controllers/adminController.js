const { User } = require('../models/User')
const { auditService } = require('../services/auditService')

const sanitize = (u) => ({
  id: u._id,
  fullName: u.fullName,
  username: u.username,
  email: u.email,
  role: u.role,
  phone: u.phone || '',
  avatar: u.profilePicture || (u.profile && u.profile.avatar) || '',
  isActive: u.isActive,
  emailVerified: !!u.emailVerified,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
  lastLogin: u.lastLogin || u.lastActivityTime || null,
})

// Helper for password strength validation
function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters long'
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter'
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter'
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number'
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return 'Password must contain at least one special character'
  return null
}

// @desc    Get current logged in Super Admin profile
// @route   GET /api/admins/me
// @access  Private/SuperAdmin
const getSelfProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' })
    }
    res.json({
      success: true,
      data: sanitize(user),
    })
  } catch (error) {
    console.error('Get Self Profile Error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// @desc    Update current logged in Super Admin profile
// @route   PUT /api/admins/me
// @access  Private/SuperAdmin
const updateSelfProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' })
    }

    const allowedFields = ['fullName', 'username', 'phone', 'avatar']
    const unknownFields = Object.keys(req.body || {}).filter((key) => !allowedFields.includes(key))
    if (unknownFields.length > 0) {
      return res.status(400).json({ message: 'Unknown fields provided', errors: unknownFields })
    }

    const { fullName, username, phone, avatar } = req.body || {}
    const updatedFields = []

    if (fullName !== undefined) {
      const trimmedName = String(fullName).trim()
      if (!trimmedName || trimmedName.length < 2) {
        return res.status(400).json({ message: 'Full name must be at least 2 characters long' })
      }
      if (trimmedName !== user.fullName) {
        user.fullName = trimmedName
        updatedFields.push('fullName')
      }
    }

    if (username !== undefined) {
      const trimmedUsername = String(username || '').trim().toLowerCase()
      if (!trimmedUsername) {
        return res.status(400).json({ message: 'Username is required' })
      }
      if (trimmedUsername.length < 3) {
        return res.status(400).json({ message: 'Username must be at least 3 characters long' })
      }
      if (trimmedUsername !== user.username) {
        const existing = await User.findOne({ username: trimmedUsername, _id: { $ne: user._id } })
        if (existing) {
          return res.status(409).json({ message: 'Username already exists' })
        }
        user.username = trimmedUsername
        updatedFields.push('username')
      }
    }

    if (phone !== undefined) {
      const trimmedPhone = String(phone || '').trim()
      if (trimmedPhone && trimmedPhone !== (user.phone || '')) {
        const existing = await User.findOne({ phone: trimmedPhone, _id: { $ne: user._id } })
        if (existing) {
          return res.status(409).json({ message: 'Phone already exists' })
        }
      }
      if (trimmedPhone !== (user.phone || '')) {
        user.phone = trimmedPhone || undefined
        updatedFields.push('phone')
      }
    }

    if (avatar !== undefined) {
      const trimmedAvatar = String(avatar || '').trim()
      if (trimmedAvatar !== (user.profilePicture || '')) {
        user.profilePicture = trimmedAvatar
        if (!user.profile) user.profile = {}
        user.profile.avatar = trimmedAvatar
        updatedFields.push('avatar')
      }
    }

    if (updatedFields.length === 0) {
      return res.status(200).json({ success: true, message: 'No changes were made', data: sanitize(user) })
    }

    await user.save()

    const ctx = {
      ip: req.ip || (req.socket && req.socket.remoteAddress) || '',
      userAgent: (req.get && req.get('user-agent')) || '',
    }

    auditService.record({
      actorId: user._id,
      actorRole: user.role,
      action: 'PROFILE_UPDATED',
      category: 'admin',
      status: 'success',
      targetType: 'User',
      targetId: user._id,
      metadata: { changedFields: updatedFields },
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    })

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: sanitize(user),
    })
  } catch (error) {
    console.error('Update Self Profile Error:', error)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0]
      return res.status(409).json({ message: `${field} already exists` })
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((v) => v.message)
      return res.status(400).json({ message: 'Validation error', errors: messages })
    }
    res.status(500).json({ message: 'Internal server error' })
  }
}

// @desc    Change current logged in Super Admin password
// @route   PUT /api/admins/change-password
// @access  Private/SuperAdmin
const changeSelfPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body || {}

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Current password, new password, and confirmation password are required' })
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New password and confirmation password do not match' })
    }

    const strengthError = validatePasswordStrength(newPassword)
    if (strengthError) {
      return res.status(400).json({ message: strengthError })
    }

    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' })
    }

    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      const ctx = {
        ip: req.ip || (req.socket && req.socket.remoteAddress) || '',
        userAgent: (req.get && req.get('user-agent')) || '',
      }
      auditService.record({
        actorId: user._id,
        actorRole: user.role,
        action: 'PASSWORD_CHANGED_FAILED',
        category: 'admin',
        status: 'failed',
        targetType: 'User',
        targetId: user._id,
        metadata: { reason: 'Incorrect current password' },
        ip: ctx.ip,
        userAgent: ctx.userAgent,
      })
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    const isSamePassword = await user.comparePassword(newPassword)
    if (isSamePassword) {
      return res.status(400).json({ message: 'New password must be different from current password' })
    }

    user.password = newPassword
    await user.save()

    const ctx = {
      ip: req.ip || (req.socket && req.socket.remoteAddress) || '',
      userAgent: (req.get && req.get('user-agent')) || '',
    }
    auditService.record({
      actorId: user._id,
      actorRole: user.role,
      action: 'PASSWORD_CHANGED',
      category: 'admin',
      status: 'success',
      targetType: 'User',
      targetId: user._id,
      metadata: { changedFields: ['password'] },
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    })

    res.json({
      success: true,
      message: 'Password changed successfully',
    })
  } catch (error) {
    console.error('Change Self Password Error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// @desc    Create a new admin
// @route   POST /api/admins
// @access  Private/SuperAdmin
const createAdmin = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Full name, email, and password are required' })
    }

    const trimmedEmail = email.trim().toLowerCase()

    const existing = await User.findOne({ email: trimmedEmail })
    if (existing) {
      return res.status(409).json({ message: 'Email already exists' })
    }

    const username = trimmedEmail.split('@')[0].replace(/[^a-z0-9_]/g, '').slice(0, 40) || `admin-${Date.now()}`

    let uniqueUsername = username
    let counter = 1
    // eslint-disable-next-line no-constant-condition
    while (await User.findOne({ username: uniqueUsername })) {
      uniqueUsername = `${username}${counter}`
      counter++
    }

    const user = await User.create({
      fullName: fullName.trim(),
      username: uniqueUsername,
      email: trimmedEmail,
      password,
      phone: phone?.trim() || undefined,
      role: 'admin',
      termsAccepted: true,
      isVerified: true,
      emailVerified: true,
      isActive: true,
    })

    auditService.logRoleChange(req.user, user, null, 'admin', req)
    res.status(201).json({ message: 'Admin created successfully', data: sanitize(user) })
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      return res.status(400).json({ message: `${field} already exists` })
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((v) => v.message)
      return res.status(400).json({ message: 'Validation error', errors: messages })
    }
    res.status(500).json({ message: 'Internal server error' })
  }
}

// @desc    Get all admins
// @route   GET /api/admins
// @access  Private/SuperAdmin
const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password').sort({ createdAt: -1 })
    res.json({ data: admins.map(sanitize) })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

// @desc    Get single admin by ID
// @route   GET /api/admins/:id
// @access  Private/SuperAdmin
const getAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user || user.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found' })
    }
    res.json({ data: sanitize(user) })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

// @desc    Update admin details
// @route   PUT /api/admins/:id
// @access  Private/SuperAdmin
const updateAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user || user.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found' })
    }

    const { fullName, email, phone, password } = req.body

    if (fullName) user.fullName = fullName.trim()
    if (phone !== undefined) user.phone = phone?.trim() || undefined

    if (email) {
      const trimmedEmail = email.trim().toLowerCase()
      if (trimmedEmail !== user.email) {
        const exists = await User.findOne({ email: trimmedEmail })
        if (exists) {
          return res.status(409).json({ message: 'Email already exists' })
        }
        user.email = trimmedEmail
      }
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' })
      }
      user.password = password
    }

    await user.save()
    res.json({ message: 'Admin updated successfully', data: sanitize(user) })
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      return res.status(400).json({ message: `${field} already exists` })
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((v) => v.message)
      return res.status(400).json({ message: 'Validation error', errors: messages })
    }
    res.status(500).json({ message: 'Internal server error' })
  }
}

// @desc    Suspend / reactivate an admin
// @route   PATCH /api/admins/:id/suspend
// @access  Private/SuperAdmin
const suspendAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user || user.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found' })
    }

    user.isActive = !user.isActive
    await user.save()

    const action = user.isActive ? 'reactivated' : 'suspended'
    res.json({ message: `Admin ${action} successfully`, data: sanitize(user) })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

// @desc    Delete an admin
// @route   DELETE /api/admins/:id
// @access  Private/SuperAdmin
const deleteAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user || user.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found' })
    }
    auditService.logUserDeletion(req.user, user, req)
    res.json({ message: 'Admin deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  createAdmin,
  getAdmins,
  getAdmin,
  updateAdmin,
  suspendAdmin,
  deleteAdmin,
  getSelfProfile,
  updateSelfProfile,
  changeSelfPassword,
}
