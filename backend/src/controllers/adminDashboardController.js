const { User } = require('../models/User')
const { Course } = require('../models/Course')
const { Lesson } = require('../models/Lesson')
const { Exam } = require('../models/Exam')
const Notification = require('../models/Notification')
const { StudentFeedback } = require('../models/StudentFeedback')

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const sanitizeStudent = (u) => ({
  id: u._id,
  fullName: u.fullName,
  username: u.username,
  email: u.email,
  phone: u.phone,
  isActive: u.isActive,
  createdAt: u.createdAt,
})

const getDashboardStats = async (_req, res) => {
  try {
    const [
      totalStudents,
      activeStudents,
      totalCourses,
      totalLessons,
      totalExams,
      totalNotices,
      totalFeedback,
      averageRating,
      recentStudents,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', isActive: true }),
      Course.countDocuments(),
      Lesson.countDocuments(),
      Exam.countDocuments(),
      Notification.countDocuments(),
      StudentFeedback.countDocuments(),
      StudentFeedback.aggregate([
        { $group: { _id: null, avg: { $avg: '$rating' } } },
      ]),
      User.find({ role: 'student' })
        .select('-password -resetOtp -resetOtpExpire')
        .sort({ createdAt: -1 })
        .limit(10),
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
        totalFeedback,
        averageRating: averageRating.length > 0 ? Math.round(averageRating[0].avg * 10) / 10 : 0,
        recentStudents: recentStudents.map(sanitizeStudent),
      },
    })
  } catch (error) {
    console.error('Admin Dashboard Stats Error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = { getDashboardStats }
