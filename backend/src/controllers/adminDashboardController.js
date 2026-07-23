const { User } = require('../models/User')
const { Course } = require('../models/Course')
const { Lesson } = require('../models/Lesson')
const { Exam } = require('../models/Exam')
const Notification = require('../models/Notification')

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (_req, res) => {
  try {
    const [
      totalStudents,
      activeStudents,
      totalCourses,
      totalLessons,
      totalExams,
      totalNotices,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', isActive: true }),
      Course.countDocuments(),
      Lesson.countDocuments(),
      Exam.countDocuments(),
      Notification.countDocuments(),
    ])

    res.json({
      data: {
        totalStudents,
        activeStudents,
        inactiveStudents: totalStudents - activeStudents,
        totalCourses,
        totalLessons,
        totalExams,
        totalNotices,
      },
    })
  } catch (error) {
    console.error('Admin Dashboard Stats Error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = { getDashboardStats }
