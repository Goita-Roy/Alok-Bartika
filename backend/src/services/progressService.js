/**
 * progressService.js
 * ----------------------------------------------------------------------------
 * THE single source of truth for ALL user progression writes and reads.
 *
 * Every endpoint that touches progression data (completeLesson, completeCourse,
 * completeExam, terminateExam, completePractice, unlockCourse, saveLastVisited,
 * getProgress) MUST go through this module. No controller may write
 * completedLessons / completedCourses / unlockedLessons / unlockedCourses /
 * completedLevels / xp / badges / achievements directly.
 *
 * Canonical data contract (enforced everywhere):
 *   - completedLessons / unlockedLessons / practiceCompleted / currentLessonId /
 *     lastVisitedLesson  -> ONLY canonical lesson slugs (strings)
 *         class-01..class-10, intermediate-*, advanced-*
 *   - completedCourses / unlockedCourses -> ONLY Course ObjectIds
 *   - completedExams                     -> ONLY Exam ObjectIds
 *   - completedLevels / unlockedLevels   -> derived ONLY from completedExams +
 *                                           completedCourses (never client-set)
 *   - currentStage                      -> highest unlocked level
 *   - progressPercentage                -> completedLessons / totalLessons * 100
 *   - xp                                -> monotonic; awarded once per event
 */

const mongoose = require('mongoose')
const { User } = require('../models/User')
const { Course } = require('../models/Course')
const { Lesson } = require('../models/Lesson')
const { Exam } = require('../models/Exam')

const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced']
const NEXT_LEVEL = { beginner: 'intermediate', intermediate: 'advanced', advanced: null }

// ── Lesson order tables (canonical slug derivation) ──────────────────────────
const INTERMEDIATE_LESSON_ORDER = [
  'algorithm', 'flowchart', 'events', 'logic', 'loops',
  'variables', 'ifelse', 'operators', 'sensing', 'sound',
]
const ADVANCED_LESSON_ORDER = [
  'hello-world', 'variables', 'errors', 'loops',
  'lists', 'functions', 'class-object', 'modules',
]

// Canonical slug regex. Anything that does not match is rejected.
const SLUG_RE = /^(class-\d{2}|intermediate-[a-z-]+|advanced-[a-z-]+)$/

// ── Build _id <-> slug maps (backend owns slug assignment) ─────────────────────
let _slugMapsCache = null
let _slugMapsCacheAt = 0

async function buildSlugMaps() {
  // Short-lived in-memory cache to avoid re-querying on every call within a tick.
  const now = Date.now()
  if (_slugMapsCache && now - _slugMapsCacheAt < 5000) return _slugMapsCache

  const lessons = await Lesson.find({}).populate('courseId', 'level')
  const idToSlug = {}
  const slugToId = {}
  lessons.forEach((l) => {
    const slug = slugForLesson(l)
    const id = l._id.toString()
    idToSlug[id] = slug
    slugToId[slug] = id
  })
  _slugMapsCache = { idToSlug, slugToId }
  _slugMapsCacheAt = now
  return _slugMapsCache
}

function slugForLesson(lesson) {
  const level = lesson.level || (lesson.courseId && lesson.courseId.level)
  const order = typeof lesson.order === 'number' ? lesson.order : null
  if (level === 'beginner') {
    return `class-${String(order != null ? order : 0).padStart(2, '0')}`
  }
  if (level === 'intermediate') {
    const key = INTERMEDIATE_LESSON_ORDER[(order || 1) - 1]
    return `intermediate-${key || order}`
  }
  if (level === 'advanced') {
    const key = ADVANCED_LESSON_ORDER[(order || 1) - 1]
    return `advanced-${key || order}`
  }
  return `lesson-${order != null ? order : lesson._id}`
}

// ── Resolution helpers ────────────────────────────────────────────────────────
const _slugLessonCache = new Map()

async function resolveLessonId(raw) {
  if (!raw) return null
  if (mongoose.Types.ObjectId.isValid(raw)) {
    const { idToSlug } = await buildSlugMaps()
    return idToSlug[raw.toString()] ? raw.toString() : raw.toString()
  }
  if (_slugLessonCache.has(raw)) return _slugLessonCache.get(raw)
  const { slugToId } = await buildSlugMaps()
  if (slugToId[raw]) {
    _slugLessonCache.set(raw, slugToId[raw])
    return slugToId[raw]
  }
  return null
}

// Normalize ANY lesson identifier to its canonical slug (string). Returns the
// canonical slug, or null if it cannot be resolved / is invalid.
async function normalizeLessonId(raw) {
  if (!raw) return null
  if (typeof raw === 'string' && SLUG_RE.test(raw)) return raw
  // Legacy or ObjectId form -> resolve to _id -> slug.
  const id = await resolveLessonId(raw)
  if (!id) return null
  const { idToSlug } = await buildSlugMaps()
  return idToSlug[id] || null
}

function isCanonicalLessonSlug(v) {
  return typeof v === 'string' && SLUG_RE.test(v)
}

// Normalize an array of lesson refs/ids/slugs to a de-duplicated, canonical,
// sorted list of slugs. Drops anything that cannot be resolved.
async function normalizeLessonIds(arr) {
  if (!Array.isArray(arr)) return []
  const out = []
  const seen = new Set()
  for (const v of arr) {
    const slug = await normalizeLessonId(
      v && typeof v === 'object' ? (v._id ? v._id.toString() : v.toString()) : v
    )
    if (slug && !seen.has(slug)) {
      seen.add(slug)
      out.push(slug)
    }
  }
  return out
}

// Validate a Course id -> canonical ObjectId string, or null.
function normalizeCourseId(raw) {
  if (!raw) return null
  const s = typeof raw === 'object' && raw._id ? raw._id.toString() : String(raw)
  if (!mongoose.Types.ObjectId.isValid(s)) return null
  return s
}

function normalizeCourseIds(arr) {
  if (!Array.isArray(arr)) return []
  const out = []
  const seen = new Set()
  for (const v of arr) {
    const id = normalizeCourseId(v)
    if (id && !seen.has(id)) {
      seen.add(id)
      out.push(id)
    }
  }
  return out
}

function normalizeExamIds(arr) {
  if (!Array.isArray(arr)) return []
  const out = []
  const seen = new Set()
  for (const v of arr) {
    const id = normalizeCourseId(v) // same ObjectId validation
    if (id && !seen.has(id)) {
      seen.add(id)
      out.push(id)
    }
  }
  return out
}

// ── Level derivation (canonical, derived ONLY from completedExams/courses) ────
async function computeLevels(completedExamIds, completedCourseIds) {
  const exams = await Exam.find({ isActive: true })
  const courses = await Course.find({}).sort({ level: 1 })
  const levelExam = {}
  exams.forEach(e => { if (!levelExam[e.level]) levelExam[e.level] = e._id.toString() })
  const levelCourseIds = {}
  courses.forEach(c => { (levelCourseIds[c.level] ||= []).push(c._id.toString()) })

  const examSet = new Set(completedExamIds.map(String))
  const courseSet = new Set(completedCourseIds.map(String))

  const completedLevels = LEVEL_ORDER.filter(lvl => {
    if (levelExam[lvl]) return examSet.has(levelExam[lvl])
    const ids = levelCourseIds[lvl] || []
    return ids.length > 0 && ids.every(id => courseSet.has(id))
  })

  const unlockedLevels = LEVEL_ORDER.filter(lvl => {
    if (lvl === 'beginner') return true
    const prev = LEVEL_ORDER[LEVEL_ORDER.indexOf(lvl) - 1]
    return completedLevels.includes(prev)
  })

  return { completedLevels, unlockedLevels }
}

function highestLevel(levels) {
  for (let i = LEVEL_ORDER.length - 1; i >= 0; i--) {
    if (levels.includes(LEVEL_ORDER[i])) return LEVEL_ORDER[i]
  }
  return 'beginner'
}

let _totalLessons = null
async function getTotalLessons() {
  if (_totalLessons == null) _totalLessons = await Lesson.countDocuments()
  return _totalLessons
}

function progressFromCounts(completedCount, total) {
  return total > 0 ? Math.min(100, Math.round((completedCount / total) * 100)) : 0
}

// ── Canonical recomputation for ANY raw user document ─────────────────────────
// Returns a fully normalized progression object. This is the ONLY place that
// decides what "valid" progression looks like.
async function canonicalize(rawUser) {
  const slugMaps = await buildSlugMaps()
  const courses = await Course.find({}).sort({ level: 1 })
  const courseIdSet = new Set(courses.map((c) => c._id.toString()))

  const completedLessons = await normalizeLessonIds(rawUser.completedLessons)
  const unlockedLessons = await normalizeLessonIds(rawUser.unlockedLessons)
  const practiceCompleted = await normalizeLessonIds(rawUser.practiceCompleted)

  // lessons that are completed must also be unlocked
  const unlockedSet = new Set(unlockedLessons)
  completedLessons.forEach((s) => unlockedSet.add(s))
  // the first lesson of every course must be unlocked
  const lessons = await Lesson.find({}).populate('courseId', 'level').sort({ order: 1 })
  const byCourse = {}
  lessons.forEach((l) => {
    const cid = l.courseId && l.courseId._id ? l.courseId._id.toString() : (l.courseId ? l.courseId.toString() : null)
    if (!cid) return
    ;(byCourse[cid] ||= []).push(l)
  })
  Object.values(byCourse).forEach((list) => {
    if (list.length) unlockedSet.add(slugForLesson(list[0]))
  })
  const unlockedLessonsFinal = [...unlockedSet].sort()

  // A completedCourses entry MUST be a real Course _id — never a Lesson _id.
  // Drop anything that isn't in the Courses collection (this repairs the
  // "Lesson ObjectIds inside completedCourses" corruption).
  const completedCoursesRaw = (rawUser.completedCourses || [])
    .map((v) => (v && typeof v === 'object' && v._id ? v._id.toString() : String(v)))
    .filter((id) => courseIdSet.has(id))
  const completedCourses = [...new Set(completedCoursesRaw)]

  const unlockedCoursesRaw = (rawUser.unlockedCourses || [])
    .map((v) => (v && typeof v === 'object' && v._id ? v._id.toString() : String(v)))
    .filter((id) => courseIdSet.has(id))
  const unlockedCourses = [...new Set(unlockedCoursesRaw)]

  const completedExams = normalizeExamIds(rawUser.completedExams)

  // Ensure every course of a completed level is in completedCourses and every
  // course of an unlocked level is in unlockedCourses (recomputed from the
  // canonical level state, not from whatever was stored).
  const { completedLevels, unlockedLevels } = await computeLevels(completedExams, completedCourses)
  const courseSet = new Set(completedCourses)
  courses.forEach((c) => {
    if (completedLevels.includes(c.level)) courseSet.add(c._id.toString())
  })
  const completedCoursesFinal = [...courseSet]
  const unlockedCourseSet = new Set(unlockedCourses)
  courses.forEach((c) => {
    if (unlockedLevels.includes(c.level)) unlockedCourseSet.add(c._id.toString())
  })
  const unlockedCoursesFinal = [...unlockedCourseSet]

  const total = await getTotalLessons()
  const progressPercentage = progressFromCounts(completedLessons.length, total)
  const currentStage = highestLevel(unlockedLevels)

  return {
    completedLessons,
    unlockedLessons: unlockedLessonsFinal,
    practiceCompleted,
    completedCourses: completedCoursesFinal,
    unlockedCourses: unlockedCoursesFinal,
    completedExams,
    completedLevels,
    unlockedLevels,
    currentStage,
    progressPercentage,
  }
}

// Persist the canonicalized progression to the DB. Uses $set with de-duplicated,
// validated arrays so the stored data is always canonical.
async function repairUser(userId) {
  const user = await User.findById(userId)
  if (!user) return null
  const canon = await canonicalize(user)

  // Badges / achievements: unique by name only.
  const badges = []
  const badgeSeen = new Set()
  for (const b of (user.badges || [])) {
    if (b && b.name && !badgeSeen.has(b.name)) {
      badgeSeen.add(b.name)
      badges.push(b)
    }
  }
  const achievements = []
  const achSeen = new Set()
  for (const a of (user.achievements || [])) {
    if (a && a.name && !achSeen.has(a.name)) {
      achSeen.add(a.name)
      achievements.push(a)
    }
  }
  // XP must never be negative.
  const xp = Math.max(0, user.xp || 0)

  await User.updateOne(
    { _id: userId },
    {
      $set: {
        completedLessons: canon.completedLessons,
        unlockedLessons: canon.unlockedLessons,
        practiceCompleted: canon.practiceCompleted,
        completedCourses: canon.completedCourses.map(id => new mongoose.Types.ObjectId(id)),
        unlockedCourses: canon.unlockedCourses.map(id => new mongoose.Types.ObjectId(id)),
        completedExams: canon.completedExams.map(id => new mongoose.Types.ObjectId(id)),
        completedLevels: canon.completedLevels,
        unlockedLevels: canon.unlockedLevels,
        currentStage: canon.currentStage,
        progressPercentage: canon.progressPercentage,
        badges,
        achievements,
        xp,
      },
    }
  )
  return canon
}

// ── XP / level sync ───────────────────────────────────────────────────────────
async function syncLevel(userId) {
  const user = await User.findById(userId).select('xp level')
  if (!user) return null
  const correctLevel = Math.max(1, Math.floor((user.xp || 0) / 1000) + 1)
  if (user.level !== correctLevel) {
    await User.updateOne({ _id: userId }, { $set: { level: correctLevel } })
  }
  return correctLevel
}

// Resolve an in-progress practice (MongoDB) into a resume target for the IDE.
// Returns { url, title, description } or null.
function buildPracticeResume(user) {
  const map = user.practiceProgress
  if (!map || typeof map.get !== 'function') return null
  const entries = Array.from(map.values()).map((e) => (e.toObject ? e.toObject() : e))
  if (!entries.length) return null
  const open = entries
    .filter((e) => !e.completed)
    .sort((a, b) => new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime())
  const target = open[0]
  if (!target) return null
  const key = target.slug || target.lesson || 'sandbox'
  const title = target.lesson ? `প্র্যাকটিস: ${target.lesson}` : 'অসমাপ্ত প্র্যাকটিস'
  return {
    key,
    lesson: target.lesson || null,
    language: target.language || 'python',
    completed: false,
    url: `/practice?resume=${encodeURIComponent(key)}`,
    title,
    description: 'আপনার শেষ প্র্যাকটিস চালিয়ে যান।',
  }
}

// ── Canonical "Continue Learning" generator ─────────────────────────────────
// Single source of truth for where a student should resume.
// Priority:
//   1. Last unfinished lesson (within the last-visited course, else current level)
//   2. Last visited lesson
//   3. First unlocked lesson (beginner-first)
//   4. In-progress practice (MongoDB-backed) — see buildPracticeResume()
//   4. First lesson of the current level
// Returns a plain object with resume coordinates + a ready-to-use URL.
async function getContinueLearning(user) {
  const allLessons = await Lesson.find({}).populate('courseId', 'level title').sort({ order: 1 })
  const courses = await Course.find({}).sort({ level: 1 })
  const courseById = {}
  courses.forEach(c => { courseById[c._id.toString()] = c })

  const completedSlugs = new Set((user.completedLessons || []).map(String))
  const slugOf = (l) => slugForLesson(l)

  // Lessons grouped by course, preserving canonical order.
  const lessonsByCourse = {}
  allLessons.forEach(l => {
    const cid = l.courseId && l.courseId._id ? l.courseId._id.toString() : (l.courseId ? l.courseId.toString() : null)
    if (!cid) return
    ;(lessonsByCourse[cid] ||= []).push(l)
  })

  const firstIncompleteIn = (courseId) => {
    const list = lessonsByCourse[courseId] || []
    return list.find(l => !completedSlugs.has(slugOf(l))) || null
  }

  // Determine current/preferred level for fallback ordering.
  const { unlockedLevels } = await computeLevels(user.completedExams || [], user.completedCourses || [])
  const currentStage = user.currentStage && LEVEL_ORDER.includes(user.currentStage)
    ? user.currentStage
    : (highestLevel(unlockedLevels) || 'beginner')

  const lastVisitedCourseId = user.lastVisitedCourse
    ? (user.lastVisitedCourse._id ? user.lastVisitedCourse._id.toString() : user.lastVisitedCourse.toString())
    : null
  const lastVisitedSlug = typeof user.lastVisitedLesson === 'string' ? user.lastVisitedLesson : null

  let targetLesson = null
  let targetCourseId = null

  // 1) Resume last unfinished lesson — prefer the last-visited course, then
  //    walk the level order from the current stage upward.
  if (lastVisitedCourseId) {
    const inc = firstIncompleteIn(lastVisitedCourseId)
    if (inc) { targetLesson = inc; targetCourseId = lastVisitedCourseId }
  }
  if (!targetLesson) {
    for (const lvl of LEVEL_ORDER.slice(LEVEL_ORDER.indexOf(currentStage))) {
      const lvlCourses = courses.filter(c => c.level === lvl)
      for (const c of lvlCourses) {
        const inc = firstIncompleteIn(c._id.toString())
        if (inc) { targetLesson = inc; targetCourseId = c._id.toString(); break }
      }
      if (targetLesson) break
    }
  }

  // 2) Fallback: last visited lesson (even if completed).
  if (!targetLesson && lastVisitedSlug) {
    const l = allLessons.find(x => slugOf(x) === lastVisitedSlug)
    if (l) {
      const cid = l.courseId && l.courseId._id ? l.courseId._id.toString() : (l.courseId ? l.courseId.toString() : null)
      if (cid) { targetLesson = l; targetCourseId = cid }
    }
  }

  // 3) Fallback: first unlocked lesson (beginner-first across unlocked levels).
  if (!targetLesson) {
    for (const lvl of LEVEL_ORDER) {
      if (!unlockedLevels.includes(lvl)) continue
      const lvlCourses = courses.filter(c => c.level === lvl)
      for (const c of lvlCourses) {
        const first = (lessonsByCourse[c._id.toString()] || [])[0]
        if (first) { targetLesson = first; targetCourseId = c._id.toString(); break }
      }
      if (targetLesson) break
    }
  }

  // 4) Final fallback: first lesson of the current level.
  if (!targetLesson) {
    for (const c of courses.filter(c => c.level === currentStage)) {
      const first = (lessonsByCourse[c._id.toString()] || [])[0]
      if (first) { targetLesson = first; targetCourseId = c._id.toString(); break }
    }
  }

  // Build canonical resume coordinates. The public course pages are reached via
  // /courses/{level}, never by internal course _id, so we use the course's level.
  if (!targetLesson || !targetCourseId) {
    // No lesson to resume → fall back to an in-progress PRACTICE (single source
    // of truth = MongoDB). This makes "Continue Learning" also consider practice.
    const practiceResume = buildPracticeResume(user)
    if (practiceResume) {
      return {
        continueLevel: null,
        continueCourseId: null,
        continueLessonId: null,
        continueUrl: practiceResume.url,
        progress: 0,
        title: practiceResume.title,
        description: practiceResume.description,
        practiceResume,
      }
    }
    return {
      continueLevel: null,
      continueCourseId: null,
      continueLessonId: null,
      continueUrl: '/courses',
      progress: 0,
      title: null,
      description: null,
    }
  }

  const targetCourse = courseById[targetCourseId]
  const continueLevel = targetCourse ? targetCourse.level : (targetLesson.courseId && targetLesson.courseId.level)
  const continueLessonId = slugOf(targetLesson)
  const continueUrl = `/courses/${continueLevel}?lesson=${continueLessonId}`

  const courseLessons = lessonsByCourse[targetCourseId] || []
  const courseCompleted = courseLessons.filter(l => completedSlugs.has(slugOf(l))).length
  const progress = courseLessons.length > 0
    ? Math.round((courseCompleted / courseLessons.length) * 100)
    : 0

  const title = targetLesson.title || continueLessonId
  const description = targetCourse ? targetCourse.title : null

  return {
    continueLevel,
    continueCourseId: targetCourseId,
    continueLessonId,
    continueUrl,
    progress,
    title,
    description,
    practiceResume: buildPracticeResume(user),
  }
}

module.exports = {
  LEVEL_ORDER,
  NEXT_LEVEL,
  SLUG_RE,
  slugForLesson,
  buildSlugMaps,
  resolveLessonId,
  normalizeLessonId,
  normalizeLessonIds,
  normalizeCourseId,
  normalizeCourseIds,
  normalizeExamIds,
  computeLevels,
  highestLevel,
  canonicalize,
  repairUser,
  syncLevel,
  getContinueLearning,
  getTotalLessons,
  progressFromCounts,
}
