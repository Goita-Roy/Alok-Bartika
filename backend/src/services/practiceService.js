const mongoose = require('mongoose')
const { User } = require('../models/User')
const { Lesson } = require('../models/Lesson')
const { Course } = require('../models/Course')
const P = require('./progressService')
const N = require('./notificationService')

const XP_PER_PRACTICE = 25

// Practice progress is keyed in `user.practiceProgress` (a Map) by a stable
// key: a canonical lesson slug, or "sandbox" for the free playground.
// MongoDB is the ONLY persistent store — no localStorage for practice state.

const KEY_RE = /^[a-z0-9_-]{1,80}$/i

function normalizeKey(key) {
  if (!key || typeof key !== 'string') return null
  const k = key.trim()
  if (!KEY_RE.test(k)) return null
  return k
}

// Resolve a lesson slug → its course + the next lesson slug (for unlocking).
async function resolveNextLessonSlug(slug) {
  const lesson = await Lesson.findOne({ slug })
  if (!lesson) return null
  const courseLessons = await Lesson.find({ courseId: lesson.courseId }).sort({ order: 1 })
  const idx = courseLessons.findIndex((l) => P.slugForLesson(l) === slug)
  if (idx < 0 || idx >= courseLessons.length - 1) return null
  return P.slugForLesson(courseLessons[idx + 1])
}

// ── startPractice ─────────────────────────────────────────────────────────────
// Ensure a practice entry exists and stamp lastOpened. Returns current state.
async function startPractice(userId, rawKey, opts = {}) {
  const key = normalizeKey(rawKey) || 'sandbox'
  const user = await User.findById(userId)
  if (!user) return null

  const existing = user.practiceProgress && user.practiceProgress.get(key)
  const patch = { lastOpened: new Date() }
  if (opts.language) patch.language = opts.language
  if (opts.lesson) patch.lesson = opts.lesson
  if (!existing) {
    patch.slug = key
    patch.completed = false
    patch.timeSpent = 0
    patch.score = 0
  }

  await User.updateOne(
    { _id: userId },
    { $set: { [`practiceProgress.${key}`]: { ...(existing ? existing.toObject() : {}), ...patch } } },
  )

  const updated = await User.findById(userId)
  const entry = updated.practiceProgress && updated.practiceProgress.get(key)
  return entry ? entry.toObject() : null
}

// ── savePractice ───────────────────────────────────────────────────────────────
// Upsert the working state. Idempotent; merges provided fields only.
async function savePractice(userId, rawKey, data = {}) {
  const key = normalizeKey(rawKey) || 'sandbox'
  const user = await User.findById(userId)
  if (!user) return null

  const existing = (user.practiceProgress && user.practiceProgress.get(key)) || {}
  const prev = existing.toObject ? existing.toObject() : existing

  const next = {
    ...prev,
    slug: key,
    lesson: data.lesson ?? prev.lesson ?? null,
    language: data.language ?? prev.language ?? 'python',
    files: data.files ?? prev.files ?? [],
    activeFileId: data.activeFileId ?? prev.activeFileId ?? (data.files && data.files[0] ? data.files[0].name : null),
    code: data.code ?? prev.code ?? '',
    timeSpent: typeof data.timeSpent === 'number' ? data.timeSpent : (prev.timeSpent || 0),
    score: typeof data.score === 'number' ? data.score : (prev.score || 0),
    completed: typeof data.completed === 'boolean' ? data.completed : (prev.completed || false),
    cursor: data.cursor ?? prev.cursor ?? { line: 1, column: 1 },
    scroll: typeof data.scroll === 'number' ? data.scroll : (prev.scroll || 0),
    lastOpened: new Date(),
  }

  await User.updateOne(
    { _id: userId },
    { $set: { [`practiceProgress.${key}`]: next } },
  )

  return next
}

// ── completePractice ────────────────────────────────────────────────────────────
// Mark a practice complete: persist state, award XP (once), unlock next lesson,
// create notification, update analytics, sync level. Returns a summary.
async function completePractice(userId, rawKey, data = {}) {
  const key = normalizeKey(rawKey) || 'sandbox'
  const user = await User.findById(userId)
  if (!user) return { error: 'user_not_found' }

  // Persist the latest working state and mark completed in the progress map.
  await savePractice(userId, key, {
    ...data,
    completed: true,
    lastOpened: Date.now(),
  })

  // Award XP + add to practiceCompleted (idempotent via $ne filter).
  const alreadyCompleted = (user.practiceCompleted || []).some((s) => s === key)
  const updateOps = {
    $addToSet: { practiceCompleted: key },
    $set: { 'learningAnalytics.lastActiveAt': new Date() },
  }
  if (!alreadyCompleted) updateOps.$inc = { xp: XP_PER_PRACTICE }

  // Accumulate practice time into analytics.
  const minutes = Math.max(0, Math.round((data.timeSpent || 0) / 60))
  if (minutes > 0) {
    updateOps.$inc = updateOps.$inc || {}
    updateOps.$inc['learningAnalytics.totalMinutes'] = minutes
    updateOps.$inc['learningAnalytics.weeklyMinutes'] = minutes
  }

  const updated = await User.findOneAndUpdate(
    { _id: userId, practiceCompleted: { $ne: key } },
    updateOps,
    { returnDocument: 'after' },
  ).catch(() => null)

  const finalUser = updated || (await User.findById(userId))
  const wasAlreadyDone = Boolean(updated) === false && alreadyCompleted

  // Unlock the current lesson (if slug is a lesson) + the next lesson.
  const slug = data.lesson || key
  const lessonSlug = /^((class-\d{2})|(intermediate-[a-z-]+)|(advanced-[a-z-]+))$/.test(slug) ? slug : null
  if (lessonSlug) {
    const unlock = [lessonSlug]
    const nextSlug = await resolveNextLessonSlug(lessonSlug)
    if (nextSlug) unlock.push(nextSlug)
    await User.updateOne(
      { _id: userId },
      { $addToSet: { unlockedLessons: { $each: unlock } } },
    )
  }

  await P.syncLevel(userId)

  if (!alreadyCompleted) {
    N.createNotification({
      userId,
      type: 'lesson_completed',
      title: 'অনুশীলন সম্পন্ন',
      message: 'আপনি একটি অনুশীলন সফলভাবে সম্পন্ন করেছেন।',
      icon: 'Dumbbell',
      color: '#0EA5E9',
      link: '/dashboard',
      dedupeKey: `practice:${key}`,
    }).catch(() => {})
  }

  return {
    message: alreadyCompleted ? 'Practice already marked complete' : 'Practice marked complete',
    completed: true,
    practiceCompleted: finalUser.practiceCompleted,
    xp: finalUser.xp,
    newlyAwarded: !alreadyCompleted,
  }
}

// ── getPractice ──────────────────────────────────────────────────────────────
async function getPractice(userId, rawKey) {
  const key = normalizeKey(rawKey) || 'sandbox'
  const user = await User.findById(userId).select(`practiceProgress.${key}`)
  if (!user) return null
  const entry = user.practiceProgress && user.practiceProgress.get(key)
  return entry ? entry.toObject() : null
}

// ── resumePractice ──────────────────────────────────────────────────────────
// Return the most-recently opened practice that is NOT yet completed, plus its
// saved state (so the IDE can restore code/cursor/scroll). Null if none.
async function resumePractice(userId) {
  const user = await User.findById(userId).select('practiceProgress')
  if (!user || !user.practiceProgress) return null
  const entries = Array.from(user.practiceProgress.values()).map((e) => (e.toObject ? e.toObject() : e))
  if (!entries.length) return null

  const open = entries
    .filter((e) => !e.completed)
    .sort((a, b) => new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime())
  const target = open[0] || entries.sort((a, b) => new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime())[0]
  if (!target) return null
  return target
}

// ── summary ───────────────────────────────────────────────────────────────────
// For the dashboard: counts + recent in-progress entries.
async function getSummary(userId) {
  const user = await User.findById(userId).select('practiceProgress practiceCompleted')
  if (!user) return { completedCount: 0, inProgressCount: 0, totalTimeSpent: 0, recent: [] }
  const entries = user.practiceProgress
    ? Array.from(user.practiceProgress.values()).map((e) => (e.toObject ? e.toObject() : e))
    : []
  const completedCount = user.practiceCompleted?.length || 0
  const inProgress = entries.filter((e) => !e.completed)
  const totalTimeSpent = entries.reduce((sum, e) => sum + (e.timeSpent || 0), 0)
  const recent = entries
    .sort((a, b) => new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime())
    .slice(0, 5)
    .map((e) => ({
      key: e.slug,
      lesson: e.lesson,
      language: e.language,
      completed: e.completed,
      score: e.score,
      timeSpent: e.timeSpent,
      lastOpened: e.lastOpened,
    }))
  return { completedCount, inProgressCount: inProgress.length, totalTimeSpent, recent }
}

module.exports = {
  XP_PER_PRACTICE,
  startPractice,
  savePractice,
  completePractice,
  getPractice,
  resumePractice,
  getSummary,
}
