const { User } = require('../models/User')
const { Course } = require('../models/Course')
const { Lesson } = require('../models/Lesson')

// Read a value from a Mongoose Map OR a plain object (examAttempts is a Map).
function mapValues(mapOrObj) {
  if (!mapOrObj) return []
  if (typeof mapOrObj.values === 'function') return Array.from(mapOrObj.values())
  return Object.values(mapOrObj)
}

async function getStats(req, res) {
  try {
    const [students, totalClasses, distinctLevels, totalLessons, examUsers] = await Promise.all([
      // Registered students (existing field — unchanged).
      User.countDocuments({ role: 'student' }),
      // Total courses (existing field — unchanged).
      Course.countDocuments(),
      // Real number of distinct learning stages/levels present in the DB. Updates
      // automatically when a new course level is added.
      Course.distinct('level'),
      // Total lessons available in the LMS (real, dynamic — updates when lessons
      // are added/removed).
      Lesson.countDocuments(),
      // Only pull the exam-attempt data needed to compute a real success rate.
      User.find({ role: 'student' }).select('examAttempts').lean(),
    ])

    // Success rate = graded (non-terminated) passed attempts / graded attempts,
    // across all students' Final Exam attempts. Never a fabricated percentage.
    let passedAttempts = 0
    let gradedAttempts = 0
    for (const u of examUsers) {
      const attemptLists = mapValues(u.examAttempts)
      for (const list of attemptLists) {
        if (!Array.isArray(list)) continue
        for (const a of list) {
          if (!a || a.terminated) continue
          gradedAttempts += 1
          if (a.passed) passedAttempts += 1
        }
      }
    }
    const successRate = gradedAttempts > 0
      ? Math.round((passedAttempts / gradedAttempts) * 100)
      : 0

    res.json({
      students,
      totalClasses,
      totalLessons,
      learningStages: distinctLevels.length,
      successRate,
      successRateAvailable: gradedAttempts > 0,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { getStats }
