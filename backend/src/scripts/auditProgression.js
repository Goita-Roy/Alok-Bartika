/**
 * auditProgression.js
 * Final integrity audit. Verifies EVERY user against the canonical contract.
 * Exits 0 (PASS) or 1 (FAIL).
 */
require('dotenv').config()
const mongoose = require('mongoose')
const { User } = require('../models/User')
const { Lesson } = require('../models/Lesson')
const { Course } = require('../models/Course')
const { Exam } = require('../models/Exam')
const P = require('../services/progressService')

const SLUG_RE = P.SLUG_RE

async function main() {
  await mongoose.connect(process.env.MONGO_URI)
  const totalLessons = await Lesson.countDocuments()
  const courses = await Course.find({}).sort({ level: 1 })
  const exams = await Exam.find({ isActive: true })
  const levelExam = {}
  exams.forEach((e) => { if (!levelExam[e.level]) levelExam[e.level] = e._id.toString() })
  const levelCourseIds = {}
  courses.forEach((c) => { (levelCourseIds[c.level] ||= []).push(c._id.toString()) })

  const users = await User.find({}).lean()
  let pass = true
  const failures = []

  for (const u of users) {
    const issues = []
    const cl = u.completedLessons || []
    const ul = u.unlockedLessons || []
    const cc = (u.completedCourses || []).map((x) => x.toString())
    const uc = (u.unlockedCourses || []).map((x) => x.toString())
    const ce = (u.completedExams || []).map((x) => x.toString())
    const pc = u.practiceCompleted || []
    const clSet = new Set(cl)
    const ulSet = new Set(ul)
    const ccSet = new Set(cc)
    const ucSet = new Set(uc)

    // 1. completedLessons: only canonical slugs, no dups, no objectids
    if (cl.length !== clSet.size) issues.push('duplicate completedLessons')
    cl.forEach((s) => { if (!SLUG_RE.test(s)) issues.push(`invalid completedLesson id: ${s}`) })
    // no lesson-* / legacy / objectid forms
    cl.forEach((s) => { if (/^lesson-/.test(s) || /^[0-9a-f]{24}$/.test(s)) issues.push(`non-canonical completedLesson: ${s}`) })

    // 2. completedCourses: only valid Course ObjectIds
    if (cc.length !== ccSet.size) issues.push('duplicate completedCourses')
    cc.forEach((id) => {
      if (!mongoose.Types.ObjectId.isValid(id)) issues.push(`invalid completedCourse id: ${id}`)
    })
    // completedCourses must NOT contain a Lesson ObjectId -> we can't distinguish, but ensure each is a real Course
    const courseIds = new Set(courses.map((c) => c._id.toString()))
    cc.forEach((id) => { if (!courseIds.has(id)) issues.push(`completedCourse is not a Course: ${id}`) })

    // 3. unlockedLessons: only canonical slugs, no dups
    if (ul.length !== ulSet.size) issues.push('duplicate unlockedLessons')
    ul.forEach((s) => { if (!SLUG_RE.test(s)) issues.push(`invalid unlockedLesson id: ${s}`) })
    // completed lessons must be unlocked
    cl.forEach((s) => { if (!ulSet.has(s)) issues.push(`completed lesson not in unlockedLessons: ${s}`) })

    // 4. unlockedCourses: only valid Course ObjectIds
    if (uc.length !== ucSet.size) issues.push('duplicate unlockedCourses')
    uc.forEach((id) => { if (!courseIds.has(id)) issues.push(`unlockedCourse is not a Course: ${id}`) })

    // 5. completedLevels derived ONLY from completedExams/completedCourses
    const expectedLevels = ['beginner', 'intermediate', 'advanced'].filter((lvl) => {
      if (levelExam[lvl]) return ce.includes(levelExam[lvl])
      const ids = levelCourseIds[lvl] || []
      return ids.length > 0 && ids.every((id) => ccSet.has(id))
    })
    const clvl = u.completedLevels || []
    if (clvl.length !== expectedLevels.length || !expectedLevels.every((l) => clvl.includes(l))) {
      issues.push(`completedLevels mismatch: have=[${clvl}], expected=[${expectedLevels}]`)
    }

    // 6. currentStage == highest unlocked level
    const unlockedLevels = ['beginner', 'intermediate', 'advanced'].filter((lvl) => {
      if (lvl === 'beginner') return true
      const prev = ['beginner', 'intermediate', 'advanced'][['beginner', 'intermediate', 'advanced'].indexOf(lvl) - 1]
      return expectedLevels.includes(prev)
    })
    const highest = unlockedLevels[unlockedLevels.length - 1] || 'beginner'
    if (u.currentStage !== highest) issues.push(`currentStage mismatch: ${u.currentStage} != ${highest}`)

    // 7. progressPercentage canonical
    const expectedPP = totalLessons > 0 ? Math.min(100, Math.round((cl.length / totalLessons) * 100)) : 0
    if (u.progressPercentage !== expectedPP) issues.push(`progressPercentage mismatch: ${u.progressPercentage} != ${expectedPP}`)

    // 8. xp non-negative
    if ((u.xp || 0) < 0) issues.push('negative xp')

    // 9. badges/achievements unique by name
    const badgeNames = new Set((u.badges || []).map((b) => b.name))
    if ((u.badges || []).length !== badgeNames.size) issues.push('duplicate badges')
    const achNames = new Set((u.achievements || []).map((a) => a.name))
    if ((u.achievements || []).length !== achNames.size) issues.push('duplicate achievements')

    if (issues.length > 0) {
      pass = false
      failures.push({ user: u.username, issues })
    }
  }

  console.log(`\n=== INTEGRITY AUDIT (${users.length} users) ===`)
  if (pass) {
    console.log('RESULT: PASS ✅ — all users canonical')
  } else {
    console.log('RESULT: FAIL ❌')
    failures.forEach((f) => console.log(`  ${f.user}: ${f.issues.join('; ')}`))
  }
  await mongoose.disconnect()
  process.exit(pass ? 0 : 1)
}

main().catch((e) => { console.error(e); process.exit(1) })
