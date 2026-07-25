/**
 * resetProgression.js
 * ---------------------------------------------------------------------------
 * Resets progression data for a user so you can re-test the full flow from
 * scratch. Clears completedLessons, completedCourses, completedExams,
 * unlockedLessons, unlockedCourses, completedLevels, unlockedLevels,
 * practiceCompleted, badges, achievements, XP — keeping the account itself.
 *
 * Usage:
 *   node backend/src/scripts/resetProgression.js <email-or-id>
 *
 * Requires MONGODB_URI in environment (or .env in the backend directory).
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') })
const mongoose = require('mongoose')
const { User } = require('../models/User')
const { connectDb } = require('../config/db')

const identifier = process.argv[2]
if (!identifier) {
  console.error('Usage: node resetProgression.js <email-or-userId>')
  process.exit(1)
}

async function main() {
  await connectDb(process.env.MONGO_URI)

  const isObjectId = mongoose.Types.ObjectId.isValid(identifier) && identifier.length === 24
  const query = isObjectId ? { _id: identifier } : { email: identifier }
  const user = await User.findOne(query)
  if (!user) {
    console.error(`User not found: ${identifier}`)
    await mongoose.disconnect()
    process.exit(1)
  }

  console.log(`\nResetting progression for: ${user.email} (${user._id})`)
  console.log(`  before — completedLessons: ${user.completedLessons.length}, completedCourses: ${(user.completedCourses || []).length}, xp: ${user.xp}`)

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        completedLessons: [],
        unlockedLessons: [],
        completedCourses: [],
        unlockedCourses: [],
        completedExams: [],
        completedLevels: [],
        unlockedLevels: [],
        practiceCompleted: [],
        badges: [],
        achievements: {},
        xp: 0,
        level: 1,
        progressPercentage: 0,
        currentStage: 'beginner',
        currentLessonId: null,
        lastVisitedCourse: null,
        lastVisitedLesson: null,
        readingProgress: {},
        quizScore: 0,
        examMarks: 0,
        quizScores: {},
        notes: {},
        examAttempts: {},
      },
    },
  )

  const after = await User.findById(user._id)
  console.log(`  after  — completedLessons: ${after.completedLessons.length}, completedCourses: ${(after.completedCourses || []).length}, xp: ${after.xp}`)
  console.log('Done.\n')

  await mongoose.disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
