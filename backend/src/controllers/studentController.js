const { User } = require('../models/User')
const { auditService } = require('../services/auditService')

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

// @desc    Get all students with search, filter, sort, and pagination
// @route   GET /api/students
// @access  Private/Admin
const getStudents = async (req, res) => {
  try {
    const { search, status, dateFrom, dateTo, sortBy, sortOrder, page = 1, limit = 25 } = req.query

    const filter = { role: 'student' }

    const ALLOWED_SORT_FIELDS = ['fullName', 'createdAt', 'level', 'xp', 'isActive']
    const allowedSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt'
    const allowedSortOrder = sortOrder === 'desc' ? -1 : 1
    const sort = { [allowedSortBy]: allowedSortOrder }

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

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const baseFilter = { role: 'student' }

    const [students, total, summaryTotal, activeCount, suspendedCount, new30dCount] = await Promise.all([
      User.find(filter).select('-password -resetOtp -resetOtpExpire').sort(sort).skip(skip).limit(limitNum),
      User.countDocuments(filter),
      User.countDocuments(baseFilter),
      User.countDocuments({ ...baseFilter, isActive: true }),
      User.countDocuments({ ...baseFilter, isActive: false }),
      User.countDocuments({ ...baseFilter, createdAt: { $gte: thirtyDaysAgo } }),
    ])

    res.json({
      data: students.map(sanitizeStudent),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      summary: {
        total: summaryTotal,
        active: activeCount,
        suspended: suspendedCount,
        new30d: new30dCount,
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
    auditService.logUserDeletion(req.user, user, req)
    res.json({ message: 'Student deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

// @desc    Bulk suspend / activate students
// @route   POST /api/students/bulk/suspend
// @access  Private/Admin
const bulkSuspendStudents = async (req, res) => {
  try {
    const { ids, action } = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Student IDs are required' })
    }

    const isActive = action === 'activate'

    const users = await User.find({ _id: { $in: ids }, role: 'student' })

    const updates = await Promise.all(
      users.map((u) => {
        const wasActive = u.isActive
        if (wasActive === isActive) return { _id: u._id, changed: false, student: sanitizeStudent(u) }
        u.isActive = isActive
        return u.save().then(() => ({ _id: u._id, changed: true, student: sanitizeStudent(u) }))
      })
    )

    const changedCount = updates.filter((u) => u.changed).length
    const actionLabel = isActive ? 'activated' : 'suspended'

    res.json({
      message: `${changedCount} student${changedCount !== 1 ? 's' : ''} ${actionLabel} successfully`,
      affected: changedCount,
    })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

// @desc    Bulk delete students
// @route   POST /api/students/bulk/delete
// @access  Private/Admin
const bulkDeleteStudents = async (req, res) => {
  try {
    const { ids } = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Student IDs are required' })
    }

    const users = await User.find({ _id: { $in: ids }, role: 'student' })

    await Promise.all(
      users.map((u) => {
        auditService.logUserDeletion(req.user, u, req)
        return User.findByIdAndDelete(u._id)
      })
    )

    res.json({
      message: `${users.length} student${users.length !== 1 ? 's' : ''} deleted successfully`,
      affected: users.length,
    })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = { getStudents, getStudent, suspendStudent, deleteStudent, bulkSuspendStudents, bulkDeleteStudents }
