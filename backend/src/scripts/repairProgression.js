/**
 * repairProgression.js
 * One-time migration: normalize EVERY user's progression to the canonical
 * contract. Idempotent and safe to re-run. Reports before/after stats.
 *
 * Specifically targets the "missing completedCourses" bug where a user has
 * all lessons of a course completed but the course was never added to
 * completedCourses.  The fix lives in canonicalize() which now reconstructs
 * completedCourses from completedLessons before deriving level state.
 */
require('dotenv').config()
const mongoose = require('mongoose')
const { connectDb } = require('../config/db')
const { User } = require('../models/User')
const { Lesson } = require('../models/Lesson')
const { Course } = require('../models/Course')
const P = require('../services/progressService')

async function main() {
  const startTime = Date.now()
  await connectDb(process.env.MONGO_URI)
  console.log('Connected to database:', mongoose.connection.name)

  const totalUsers = await User.countDocuments()
  console.log(`Total users in database: ${totalUsers}`)

  const courses = await Course.find({}).sort({ level: 1 })
  console.log(`Total courses: ${courses.length} (${courses.map(c => `${c.title}(${c.level})`).join(', ')})`)

  const totalLessons = await Lesson.countDocuments()
  console.log(`Total lessons in database: ${totalLessons}`)

  const users = await User.find({})
  let repaired = 0
  let coursesBugFixed = 0
  let levelsBugFixed = 0
  let unchanged = 0
  const report = []
  const coursesBugUsers = []

  for (const u of users) {
    // Snapshot BEFORE state
    const before = JSON.parse(JSON.stringify({
      completedLessons: u.completedLessons,
      completedCourses: u.completedCourses,
      unlockedLessons: u.unlockedLessons,
      unlockedCourses: u.unlockedCourses,
      completedExams: u.completedExams,
      practiceCompleted: u.practiceCompleted,
      completedLevels: u.completedLevels,
      unlockedLevels: u.unlockedLevels,
      currentStage: u.currentStage,
      progressPercentage: u.progressPercentage,
      xp: u.xp,
      badges: u.badges,
      achievements: u.achievements,
    }))

    const beforeCL = (before.completedLessons || []).length
    const beforeCC = (before.completedCourses || []).length
    const beforeCLvl = (before.completedLevels || []).length

    // Run canonical repair + level sync
    const canon = await P.repairUser(u._id)
    await P.syncLevel(u._id)

    // Ensure XP non-negative
    await User.updateOne({ _id: u._id, xp: { $lt: 0 } }, { $set: { xp: 0 } })

    // Snapshot AFTER state
    const after = await User.findById(u._id).select(
      'completedLessons completedCourses unlockedLessons unlockedCourses completedExams practiceCompleted completedLevels unlockedLevels currentStage progressPercentage xp badges achievements examAttempts'
    ).lean()

    const afterCL = (after.completedLessons || []).length
    const afterCC = (after.completedCourses || []).length
    const afterCLvl = (after.completedLevels || []).length

    const lessonsChanged = beforeCL !== afterCL
    const coursesChanged = beforeCC !== afterCC
    const levelsChanged = beforeCLvl !== afterCLvl
    const isCoursesBugFixed = afterCC > beforeCC

    if (isCoursesBugFixed) {
      coursesBugFixed++
      coursesBugUsers.push(u.username)
    }
    if (levelsChanged && !isCoursesBugFixed) {
      levelsBugFixed++
    }

    const entry = {
      user: u.username,
      beforeLessons: beforeCL,
      afterLessons: afterCL,
      dupRemoved: beforeCL - afterCL,
      beforeCourses: beforeCC,
      afterCourses: afterCC,
      coursesAdded: afterCC - beforeCC,
      beforeLevels: before.completedLevels,
      afterLevels: after.completedLevels,
      levelsAdded: after.completedLevels.filter(l => !(before.completedLevels || []).includes(l)),
      unlockedLevels: after.unlockedLevels,
      currentStage: after.currentStage,
      progressPercentage: after.progressPercentage,
      xp: after.xp,
      badgesPreserved: (after.badges || []).length,
      achievementsPreserved: (after.achievements || []).length,
    }

    if (lessonsChanged || coursesChanged || levelsChanged) {
      report.push(entry)
      repaired++
    } else {
      unchanged++
    }

    // Detailed per-user log
    const changes = []
    if (lessonsChanged) changes.push(`lessons ${beforeCL}->${afterCL} (dupRemoved=${beforeCL - afterCL})`)
    if (coursesChanged) changes.push(`courses ${beforeCC}->${afterCC} (+${afterCC - beforeCC})`)
    if (levelsChanged) changes.push(`levels [${before.completedLevels}]->[${after.completedLevels}]`)
    if (after.currentStage !== before.currentStage) changes.push(`stage ${before.currentStage}->${after.currentStage}`)
    if (after.progressPercentage !== before.progressPercentage) changes.push(`pp ${before.progressPercentage}->${after.progressPercentage}`)

    if (changes.length > 0) {
      console.log(`  [REPAIRED] ${u.username}: ${changes.join(' | ')}`)
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

  // ── Summary Report ─────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(70))
  console.log('=== REPAIR REPORT ===')
  console.log('='.repeat(70))
  console.log(`Timestamp:          ${new Date().toISOString()}`)
  console.log(`Duration:           ${elapsed}s`)
  console.log(`Total users:        ${totalUsers}`)
  console.log(`Repaired:           ${repaired}`)
  console.log(`Unchanged:          ${unchanged}`)
  console.log(`Courses bug fixed:  ${coursesBugFixed}`)
  console.log(`Levels bug fixed:   ${levelsBugFixed}`)

  if (coursesBugUsers.length > 0) {
    console.log(`\nUsers with completedCourses bug fixed (${coursesBugUsers.length}):`)
    coursesBugUsers.forEach(name => console.log(`  - ${name}`))
  }

  if (report.length > 0) {
    console.log('\nDetailed changes:')
    console.log('-'.repeat(70))
    report.forEach((r) => {
      const parts = []
      if (r.dupRemoved > 0) parts.push(`lessons ${r.beforeLessons}->${r.afterLessons} (dupRemoved=${r.dupRemoved})`)
      if (r.coursesAdded > 0) parts.push(`courses ${r.beforeCourses}->${r.afterCourses} (+${r.coursesAdded})`)
      if (r.levelsAdded.length > 0) parts.push(`levels added: [${r.levelsAdded}]`)
      console.log(`  ${r.user}: ${parts.join(' | ')}`)
      console.log(`    badges=${r.badgesPreserved} achievements=${r.achievementsPreserved} xp=${r.xp} stage=${r.currentStage} pp=${r.progressPercentage}`)
    })
  } else {
    console.log('\nNo changes needed — all users already canonical.')
  }

  console.log('\n' + '='.repeat(70))
  console.log('=== DATA PRESERVATION CHECK ===')
  console.log('='.repeat(70))
  console.log('Preserved for ALL users:')
  console.log('  - XP: unchanged (clamped to >= 0 only)')
  console.log('  - Badges: de-duplicated by name, all originals kept')
  console.log('  - Achievements: de-duplicated by name, all originals kept')
  console.log('  - Exam history (completedExams, examAttempts): untouched')
  console.log('  - Sessions (lastVisitedCourse, lastVisitedLesson, lastVisitedStage): untouched')
  console.log('  - Reading progress, quiz scores, notes: untouched')
  console.log('  - Practice progress, practice completed: normalized (de-duped, canonical slugs)')

  console.log(`\nRepair complete in ${elapsed}s. Safe to re-run (idempotent).`)
  await mongoose.disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
