const { User } = require('../models/User')
const { Course } = require('../models/Course')
const { Exam } = require('../models/Exam')
const { Project } = require('../models/Project')

const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced']

const LEVEL_RANK = { beginner: 1, intermediate: 2, advanced: 3, '': 0 }

// Read a value from a Mongoose Map OR a plain object (examAttempts is a Map).
function mapGet(mapOrObj, key) {
  if (!mapOrObj) return undefined
  if (typeof mapOrObj.get === 'function') return mapOrObj.get(key)
  return mapOrObj[key]
}

// Derive the set of COMPLETED levels for a user using ONLY existing completion
// data — identical to the rule in progressionController.getProgress:
//   a level is "completed" when its active Final Exam is in user.completedExams
//   (fallback: if a level has no active exam, when all its courses are completed).
// Failing an exam never adds it to completedExams, so the level cannot increase.
// This does NOT read current lesson / current page / active tab / current course.
function computeCompletedLevels(user, levelExamMap, levelCourseIds) {
  const completedExamIds = new Set(
    (user.completedExams || []).map(e => (e && e._id ? e._id.toString() : e.toString()))
  )
  const completedCourseIds = new Set(
    (user.completedCourses || []).map(c => (c && c._id ? c._id.toString() : c.toString()))
  )

  return LEVEL_ORDER.filter(lvl => {
    const lvlExamId = levelExamMap[lvl]
    if (lvlExamId) {
      return completedExamIds.has(lvlExamId)
    }
    const courseIds = levelCourseIds[lvl] || []
    return courseIds.length > 0 && courseIds.every(id => completedCourseIds.has(id))
  })
}

// The highest completed level following the canonical order ('' if none).
function highestOf(completedLevels) {
  for (let i = LEVEL_ORDER.length - 1; i >= 0; i--) {
    if (completedLevels.includes(LEVEL_ORDER[i])) return LEVEL_ORDER[i]
  }
  return ''
}

// Final Exam marks = the user's REAL FIRST-ATTEMPT score for the Final Exam of
// their highest completed level, read from the existing examAttempts data
// (attempts[0].score). Never generated or estimated. Also returns the earliest
// first-attempt completion time across completed-level exams for tie-breaking.
function computeFinalExamMarks(user, completedLevels, levelExamMap) {
  const highest = highestOf(completedLevels)
  let finalMarks = 0
  let earliestCompletionAt = null

  completedLevels.forEach(lvl => {
    const examId = levelExamMap[lvl]
    if (!examId) return
    const rawAttempts = mapGet(user.examAttempts, examId)
    if (!Array.isArray(rawAttempts) || rawAttempts.length === 0) return
    // Terminated (rule-violation) records are not real attempts — ignore them so
    // the FIRST real graded attempt is used, exactly as before.
    const attempts = rawAttempts.filter(a => !a || !a.terminated)
    if (attempts.length === 0) return
    const first = attempts[0]
    if (first && first.takenAt) {
      const t = new Date(first.takenAt).getTime()
      if (earliestCompletionAt === null || t < earliestCompletionAt) earliestCompletionAt = t
    }
    if (lvl === highest && first && typeof first.score === 'number') {
      finalMarks = first.score
    }
  })

  return { finalMarks, earliestCompletionAt }
}

// @desc    Get leaderboard ranked by exam marks, projects, progress
// @route   GET /api/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
  try {
    // Existing completion sources — same models the progression logic uses.
    const [activeExams, allCourses, submittedProjects] = await Promise.all([
      Exam.find({ isActive: true }).select('level'),
      Course.find({}).select('level'),
      // Real submitted (personal) projects — used for the project count/list and
      // as an ADDITIVE tie-breaker. Existing ranking factors are unchanged.
      Project.find({ officialProject: false }).select('studentId title createdAt'),
    ])
    const levelExamMap = {}
    activeExams.forEach(e => { if (!levelExamMap[e.level]) levelExamMap[e.level] = e._id.toString() })
    const levelCourseIds = {}
    allCourses.forEach(c => {
      if (!levelCourseIds[c.level]) levelCourseIds[c.level] = []
      levelCourseIds[c.level].push(c._id.toString())
    })

    // Group real submitted projects by student for count + title list.
    const projectsByUser = new Map()
    submittedProjects.forEach(p => {
      const key = p.studentId ? p.studentId.toString() : ''
      if (!key) return
      if (!projectsByUser.has(key)) projectsByUser.set(key, [])
      projectsByUser.get(key).push({ id: p._id, title: p.title || 'Untitled Project' })
    })

    const users = await User.find({
      role: 'student',
      lastActivityTime: { $exists: true, $ne: null },
    })
      .populate('completedExams', 'title level passingScore')
      .select('fullName profilePicture profile xp level examMarks completedCourses badges progressPercentage completedExams examAttempts practiceCompleted lastActivityTime schoolName skillLevel')

    const sorted = users
      .filter(u => (u.completedCourses || []).length > 0)
      .map(u => {
        // Real submitted projects from the Project collection (ADDITIVE).
        const projects = projectsByUser.get(u._id.toString()) || []
        const completedLevels = computeCompletedLevels(u, levelExamMap, levelCourseIds)
        const highestCompletedLevel = highestOf(completedLevels)
        const { finalMarks, earliestCompletionAt } = computeFinalExamMarks(u, completedLevels, levelExamMap)
        return {
          _id: u._id,
          fullName: u.fullName,
          avatar: u.profilePicture || u.profile?.avatar || '',
          level: String(u.level),
          xp: u.xp || 0,
          examMarks: finalMarks,
          completedCourses: u.completedCourses?.length || 0,
          badges: (u.badges || []).map(b => ({
            name: b.name || 'Badge',
            icon: b.icon || '🏅',
            awardedAt: b.awardedAt || null,
          })),
          badgesCount: (u.badges || []).length,
          school: u.profile?.schoolName || u.schoolName || '',
          progressPercentage: u.progressPercentage || 0,
          completedExamsCount: (u.completedExams || []).length,
          exams: (u.completedExams || []).map(e => ({
            id: e._id,
            title: e.title,
            level: e.level,
          })),
          projectsSubmitted: projects.length,
          projectCount: projects.length,
          projects,
          skillLevel: u.skillLevel || '',
          highestCompletedLevel,
          earliestCompletionAt,
          lastActiveAt: u.lastActivityTime || u.updatedAt || null,
        }
      })
      // Ranking priority (all from real DB data):
      //   1) Total XP (highest first)
      //   2) Highest Completed Level
      //   3) Final Exam Marks (real first-attempt score)
      //   4) Real submitted Project Count (more projects ranks higher) — ADDITIVE
      //   5) Earliest completion time (if available)
      .sort((a, b) => {
        if (b.xp !== a.xp) return b.xp - a.xp
        const lr = (LEVEL_RANK[b.highestCompletedLevel] || 0) - (LEVEL_RANK[a.highestCompletedLevel] || 0)
        if (lr !== 0) return lr
        if (b.examMarks !== a.examMarks) return b.examMarks - a.examMarks
        if (b.projectCount !== a.projectCount) return b.projectCount - a.projectCount
        const at = a.earliestCompletionAt
        const bt = b.earliestCompletionAt
        if (at !== null && bt !== null && at !== bt) return at - bt
        if (at !== null && bt === null) return -1
        if (at === null && bt !== null) return 1
        return 0
      })
      .slice(0, 50)
      .map((entry, i) => ({
        rank: i + 1,
        id: entry._id,
        name: entry.fullName,
        avatar: entry.avatar,
        level: entry.level,
        xp: entry.xp,
        examMarks: entry.examMarks,
        completedCourses: entry.completedCourses,
        badges: entry.badges,
        badgesCount: entry.badgesCount,
        school: entry.school,
        progressPercentage: entry.progressPercentage,
        completedExamsCount: entry.completedExamsCount,
        exams: entry.exams,
        projectsSubmitted: entry.projectsSubmitted,
        projects: entry.projects,
        skillLevel: entry.skillLevel,
        highestCompletedLevel: entry.highestCompletedLevel,
        lastActiveAt: entry.lastActiveAt,
        isCurrentUser: entry._id.toString() === req.user._id.toString(),
      }))

    res.json({ leaderboard: sorted })
  } catch (error) {
    console.error('Leaderboard Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = { getLeaderboard }
