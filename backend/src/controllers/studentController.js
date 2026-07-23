const { User } = require('../models/User')

const sanitizeStudent = (u) => ({
  id: u._id,
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
  badges: u.badges?.length || 0,
  completedLessons: u.completedLessons?.length || 0,
  createdAt: u.createdAt,
  lastActivityTime: u.lastActivityTime,
})

// @desc    Get all students with search, filter, and pagination
// @route   GET /api/students
// @access  Private/Admin
const getStudents = async (req, res) => {
  try {
    const { search, status, dateFrom, dateTo, page = 1, limit = 25 } = req.query

    const filter = { role: 'student' }

    if (search) {
      const regex = new RegExp(search.trim(), 'i')
      filter.$or = [
        { fullName: regex },
        { email: regex },
        { username: regex },
        { phone: regex },
      ]
    }

    if (status === 'active') filter.isActive = true
    else if (status === 'suspended') filter.isActive = false

    if (dateFrom || dateTo) {
      filter.createdAt = {}
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom)
      if (dateTo) {
        const end = new Date(dateTo)
        end.setUTCHours(23, 59, 59, 999)
        filter.createdAt.$lte = end
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25))
    const skip = (pageNum - 1) * limitNum

    const [students, total] = await Promise.all([
      User.find(filter).select('-password -resetOtp -resetOtpExpire').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(filter),
    ])

    res.json({
      data: students.map(sanitizeStudent),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Private/Admin
const getStudent = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -resetOtp -resetOtpExpire')
    if (!user || user.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' })
    }
    res.json({ data: sanitizeStudent(user) })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

// @desc    Suspend / reactivate a student
// @route   PATCH /api/students/:id/suspend
// @access  Private/Admin
const suspendStudent = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user || user.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' })
    }

    user.isActive = !user.isActive
    await user.save()

    const action = user.isActive ? 'reactivated' : 'suspended'
    res.json({ message: `Student ${action} successfully`, data: sanitizeStudent(user) })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Private/Admin
const deleteStudent = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user || user.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' })
    }
    res.json({ message: 'Student deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = { getStudents, getStudent, suspendStudent, deleteStudent }
