const { User } = require('../models/User')
const { Course } = require('../models/Course')
const { Lesson } = require('../models/Lesson')
const { Exam } = require('../models/Exam')
const Notification = require('../models/Notification')
const { StudentFeedback } = require('../models/StudentFeedback')
const { LEVEL_ORDER } = require('../services/progressService')

// Read values from a Mongoose Map OR a plain object (examAttempts is a Map).
const mapValues = (mapOrObj) => {
  if (!mapOrObj) return []
  if (typeof mapOrObj.values === 'function') return Array.from(mapOrObj.values())
  return Object.values(mapOrObj)
}

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

// @desc    Get student progress distribution by learning stage
// @route   GET /api/admin/dashboard/student-progress
// @access  Private/Admin
// Buckets students by the highest stage they have completed along the learning
// flow. A level counts as completed using the SAME canonical rule as the rest
// of the app (progressService.computeLevels): the level's active exam has been
// passed, or every course of that level has been completed.
const getStudentProgressDistribution = async (_req, res) => {
  try {
    const [exams, courses, students] = await Promise.all([
      Exam.find({ isActive: true }).select('level').lean(),
      Course.find({}).select('level').lean(),
      User.find({ role: 'student' })
        .select('completedExams completedCourses progressPercentage')
        .lean(),
    ])

    // Level -> the single active exam id for that level (mirrors computeLevels).
    const levelExamId = {}
    exams.forEach((e) => {
      if (!levelExamId[e.level]) levelExamId[e.level] = e._id.toString()
    })

    // Level -> all course ids of that level.
    const levelCourseIds = {}
    courses.forEach((c) => {
      ;(levelCourseIds[c.level] ||= []).push(c._id.toString())
    })

    const buckets = {
      notStarted: 0,
      completedBeginner: 0,
      completedIntermediate: 0,
      completedAll: 0,
    }
    let totalProgress = 0

    students.forEach((s) => {
      const completedExamIds = new Set((s.completedExams || []).map(String))
      const completedCourseIds = new Set((s.completedCourses || []).map(String))
      const completedLevels = LEVEL_ORDER.filter((lvl) => {
        if (levelExamId[lvl]) return completedExamIds.has(levelExamId[lvl])
        const ids = levelCourseIds[lvl] || []
        return ids.length > 0 && ids.every((id) => completedCourseIds.has(id))
      })

      if (completedLevels.includes('advanced')) buckets.completedAll += 1
      else if (completedLevels.includes('intermediate'))
        buckets.completedIntermediate += 1
      else if (completedLevels.includes('beginner')) buckets.completedBeginner += 1
      else buckets.notStarted += 1

      totalProgress += Number(s.progressPercentage) || 0
    })

    const totalStudents = students.length
    const completedAll = buckets.completedAll
    const completionRate =
      totalStudents > 0 ? Math.round((completedAll / totalStudents) * 1000) / 10 : 0
    const averageProgress =
      totalStudents > 0 ? Math.round((totalProgress / totalStudents) * 10) / 10 : 0

    res.json({
      data: {
        totalStudents,
        buckets,
        completedAll,
        completionRate,
        averageProgress,
      },
    })
  } catch (error) {
    console.error('Student Progress Distribution Error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// @desc    Get student registration trend grouped by month (last 12 months)
// @route   GET /api/admin/dashboard/student-registration-trend
// @access  Private/Admin
// Counts only users with role="student" using their createdAt. Returns the last
// 12 calendar months (including the current one), with months that had no
// registrations reported as 0.
const getStudentRegistrationTrend = async (_req, res) => {
  try {
    const now = new Date()
    const firstMonth = new Date(now.getFullYear(), now.getMonth() - 11, 1)

    const [totalStudents, students] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.find({ role: 'student', createdAt: { $gte: firstMonth } })
        .select('createdAt')
        .lean(),
    ])

    // Bucket keys: "YYYY-M" (month is 0-indexed) for last 12 months.
    const months = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleString('en-US', { month: 'short' }),
      })
    }

    const counts = {}
    months.forEach((m) => {
      counts[m.key] = 0
    })

    students.forEach((s) => {
      const created = new Date(s.createdAt)
      const key = `${created.getFullYear()}-${created.getMonth()}`
      if (key in counts) counts[key] += 1
    })

    const data = months.map((m) => ({ month: m.label, students: counts[m.key] }))

    const current = counts[months[months.length - 1].key]
    const previous = counts[months[months.length - 2].key]
    const growthRate =
      previous === 0
        ? current > 0
          ? 100
          : 0
        : Math.round(((current - previous) / previous) * 1000) / 10

    res.json({
      data: {
        totalStudents,
        growthRate,
        data,
      },
    })
  } catch (error) {
    console.error('Student Registration Trend Error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// @desc    Get student dropout progress (active / at risk / dropout)
// @route   GET /api/admin/dashboard/student-dropout-progress
// @access  Private/Admin
// Classifies every role="student" user by days since their last login
// (lastLogin is the primary signal, with fallbacks for users that predate it:
// lastActivityTime -> learningAnalytics.lastActiveAt -> createdAt). A level
// counts as completed using the SAME canonical rule as the rest of the app
// (progressService.computeLevels).
const getStudentDropoutProgress = async (_req, res) => {
  try {
    const [exams, courses, students] = await Promise.all([
      Exam.find({ isActive: true }).select('level').lean(),
      Course.find({}).select('level').lean(),
      User.find({ role: 'student' })
        .select('createdAt lastLogin lastActivityTime learningAnalytics completedExams completedCourses')
        .lean(),
    ])

    // Level -> the single active exam id for that level (mirrors computeLevels).
    const levelExamId = {}
    exams.forEach((e) => {
      if (!levelExamId[e.level]) levelExamId[e.level] = e._id.toString()
    })

    // Level -> all course ids of that level.
    const levelCourseIds = {}
    courses.forEach((c) => {
      ;(levelCourseIds[c.level] ||= []).push(c._id.toString())
    })

    const DAY_MS = 24 * 60 * 60 * 1000
    const now = Date.now()
    const daysSince = (ts) => (ts > 0 ? Math.floor((now - ts) / DAY_MS) : Infinity)

    let active = 0
    let atRisk = 0
    let dropout = 0

    students.forEach((s) => {
      const createdAt = s.createdAt ? new Date(s.createdAt).getTime() : now
      const lastLogin = s.lastLogin ? new Date(s.lastLogin).getTime() : 0
      const lastActivity = s.lastActivityTime ? new Date(s.lastActivityTime).getTime() : 0
      const lastActiveAt =
        s.learningAnalytics && s.learningAnalytics.lastActiveAt
          ? new Date(s.learningAnalytics.lastActiveAt).getTime()
          : 0

      // Latest login signal — lastLogin is primary, older users fall back to
      // lastActivityTime, then learningAnalytics.lastActiveAt, then createdAt.
      // lastLogin may be null for pre-migration users; this never crashes.
      const lastSeen = lastLogin || lastActivity || lastActiveAt || createdAt
      const daysSinceSeen = daysSince(lastSeen)
      const daysSinceReg = daysSince(createdAt)

      const completedExamIds = new Set((s.completedExams || []).map(String))
      const completedCourseIds = new Set((s.completedCourses || []).map(String))
      const completedLevels = LEVEL_ORDER.filter((lvl) => {
        if (levelExamId[lvl]) return completedExamIds.has(levelExamId[lvl])
        const ids = levelCourseIds[lvl] || []
        return ids.length > 0 && ids.every((id) => completedCourseIds.has(id))
      })
      const completedBeginner = completedLevels.includes('beginner')

      // Active: last seen within the last 7 days.
      // At Risk: last seen 8-30 days ago, or registered more than 14 days ago
      //          without completing the Beginner level.
      // Dropout: not seen for more than 30 days.
      if (daysSinceSeen > 30) {
        dropout += 1
      } else if (daysSinceSeen <= 7 && (completedBeginner || daysSinceReg <= 14)) {
        active += 1
      } else {
        atRisk += 1
      }
    })

    const totalStudents = students.length
    const pct = (n) =>
      totalStudents > 0 ? Math.round((n / totalStudents) * 1000) / 10 : 0

    res.json({
      data: {
        totalStudents,
        active,
        atRisk,
        dropout,
        activePercentage: pct(active),
        atRiskPercentage: pct(atRisk),
        dropoutPercentage: pct(dropout),
      },
    })
  } catch (error) {
    console.error('Student Dropout Progress Error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// @desc    Get exam pass vs fail rate across all completed attempts
// @route   GET /api/admin/dashboard/exam-pass-rate
// @access  Private/Admin
// Counts every completed exam attempt across all students. Terminated (early /
// abandoned) attempts are not completed and are excluded. Passed/failed use the
// graded result stored on each attempt (percentage >= that exam's passingScore).
const getExamPassRate = async (_req, res) => {
  try {
    const users = await User.find({ role: 'student' }).select('examAttempts').lean()

    let totalAttempts = 0
    let passed = 0
    let scoreSum = 0

    users.forEach((u) => {
      mapValues(u.examAttempts).forEach((list) => {
        if (!Array.isArray(list)) return
        list.forEach((a) => {
          if (!a || a.terminated) return
          totalAttempts += 1
          if (a.passed) passed += 1
          if (typeof a.score === 'number') scoreSum += a.score
        })
      })
    })

    const failed = totalAttempts - passed
    const passRate =
      totalAttempts > 0 ? Math.round((passed / totalAttempts) * 1000) / 10 : 0
    const averageScore =
      totalAttempts > 0 ? Math.round((scoreSum / totalAttempts) * 10) / 10 : 0

    res.json({
      data: {
        totalAttempts,
        passed,
        failed,
        passRate,
        averageScore,
      },
    })
  } catch (error) {
    console.error('Exam Pass Rate Error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// @desc    Get failure rate per exam level and the weakest level
// @route   GET /api/admin/dashboard/weakest-level
// @access  Private/Admin
// Groups every completed exam attempt by its exam's level (Beginner /
// Intermediate / Advanced) and reports attempts / passed / failed / failure
// rate per level. weakestLevel is the level with the highest failure rate; it
// is null when no level has failing attempts.
const getWeakestLevel = async (_req, res) => {
  try {
    const [users, exams] = await Promise.all([
      User.find({ role: 'student' }).select('examAttempts').lean(),
      Exam.find({}).select('_id level').lean(),
    ])

    const examLevel = {}
    exams.forEach((e) => {
      examLevel[e._id.toString()] = e.level
    })

    const stats = {
      beginner: { attempts: 0, passed: 0 },
      intermediate: { attempts: 0, passed: 0 },
      advanced: { attempts: 0, passed: 0 },
    }

    users.forEach((u) => {
      const entries =
        u.examAttempts && typeof u.examAttempts.entries === 'function'
          ? Array.from(u.examAttempts.entries())
          : Object.entries(u.examAttempts || {})
      entries.forEach(([examId, list]) => {
        if (!Array.isArray(list)) return
        const level = examLevel[String(examId)]
        if (!level || !stats[level]) return
        list.forEach((a) => {
          if (!a || a.terminated) return
          stats[level].attempts += 1
          if (a.passed) stats[level].passed += 1
        })
      })
    })

    const levels = ['beginner', 'intermediate', 'advanced'].map((level) => {
      const { attempts, passed } = stats[level]
      const failed = attempts - passed
      const failureRate =
        attempts > 0 ? Math.round((failed / attempts) * 1000) / 10 : 0
      return { level, attempts, passed, failed, failureRate }
    })

    let weakestLevel = null
    let highestRate = 0
    levels.forEach((l) => {
      if (l.attempts > 0 && l.failureRate > highestRate) {
        highestRate = l.failureRate
        weakestLevel = l.level
      }
    })

    res.json({
      data: {
        levels,
        weakestLevel,
      },
    })
  } catch (error) {
    console.error('Weakest Level Error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getDashboardStats,
  getStudentProgressDistribution,
  getStudentRegistrationTrend,
  getStudentDropoutProgress,
  getExamPassRate,
  getWeakestLevel,
}
