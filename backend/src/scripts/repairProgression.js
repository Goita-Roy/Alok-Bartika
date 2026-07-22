/**
 * repairProgression.js
 * One-time migration: normalize EVERY user's progression to the canonical
 * contract. Idempotent and safe to re-run. Reports before/after stats.
 */
require('dotenv').config()
const mongoose = require('mongoose')
const { User } = require('../models/User')
const P = require('../services/progressService')

async function main() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected. Repairing all users...')

  const users = await User.find({})
  let repaired = 0
  const report = []

  for (const u of users) {
    const before = JSON.parse(JSON.stringify({
      completedLessons: u.completedLessons,
      completedCourses: u.completedCourses,
      unlockedLessons: u.unlockedLessons,
      unlockedCourses: u.unlockedCourses,
      completedExams: u.completedExams,
      practiceCompleted: u.practiceCompleted,
      completedLevels: u.completedLevels,
      currentStage: u.currentStage,
      progressPercentage: u.progressPercentage,
    }))

    const canon = await P.repairUser(u._id)
    await P.syncLevel(u._id)

    // Also ensure XP consistency: XP must never be negative.
    await User.updateOne({ _id: u._id, xp: { $lt: 0 } }, { $set: { xp: 0 } })

    const after = await User.findById(u._id).select(
      'completedLessons completedCourses unlockedLessons unlockedCourses completedExams practiceCompleted completedLevels currentStage progressPercentage xp'
    ).lean()

    const beforeCL = (before.completedLessons || []).length
    const afterCL = (after.completedLessons || []).length
    report.push({
      user: u.username,
      beforeLessons: beforeCL,
      afterLessons: afterCL,
      dupRemoved: beforeCL - afterCL,
      beforeCourses: (before.completedCourses || []).length,
      afterCourses: (after.completedCourses || []).length,
      completedLevels: after.completedLevels,
      currentStage: after.currentStage,
      progressPercentage: after.progressPercentage,
    })
    repaired++
  }

  console.log('\n=== REPAIR REPORT ===')
  report.forEach((r) =>
    console.log(
      `${r.user}: lessons ${r.beforeLessons}->${r.afterLessons} (dupRemoved=${r.dupRemoved}), ` +
      `courses ${r.beforeCourses}->${r.afterCourses}, levels=[${r.completedLevels}], stage=${r.currentStage}, pp=${r.progressPercentage}`
    )
  )
  console.log(`\nTotal users repaired: ${repaired}`)
  await mongoose.disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
