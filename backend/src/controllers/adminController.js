const { User } = require('../models/User')

const sanitize = (u) => ({
  id: u._id,
  fullName: u.fullName,
  username: u.username,
  email: u.email,
  role: u.role,
  phone: u.phone,
  isActive: u.isActive,
  emailVerified: !!u.emailVerified,
  createdAt: u.createdAt,
})

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
    res.json({ message: 'Admin deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = { createAdmin, getAdmins, getAdmin, updateAdmin, suspendAdmin, deleteAdmin }
