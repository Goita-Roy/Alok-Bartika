const mongoose = require('mongoose')
const { User } = require('../models/User')
const { Course } = require('../models/Course')
const { Lesson } = require('../models/Lesson')
const P = require('../services/progressService')
const N = require('../services/notificationService')

const LEVEL_ORDER = P.LEVEL_ORDER
const XP_PER_LESSON = 100
const XP_PER_PRACTICE = 25

// Fire-and-forget notification helper — must never throw into the request flow.
function notify(opts) {
  N.createNotification(opts).catch(() => {})
}

// ── Helpers ───────────────────────────────────────────────────────────────────
async function toClientLessonId(slug) {
  return slug || null
}

// ── GET /api/progression ──────────────────────────────────────────────────────
const getProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    // computeUserProgression is THE single source of truth: it validates,
    // canonicalizes, persists ALL derived fields, and returns the canonical state.
    const canon = await P.computeUserProgression(req.user._id)
    if (!canon) return res.status(500).json({ message: 'Failed to compute progression' })

    const correctLevel = await P.syncLevel(req.user._id)

    // Canonical Continue Learning resolution
    const continueLearning = await P.getContinueLearning(user)

    res.json({
      completedLessons: canon.completedLessons,
      completedCourses: canon.completedCourses.map((c) => (c._id ? c._id.toString() : c.toString())),
      unlockedCourses: canon.unlockedCourses.map((c) => (c._id ? c._id.toString() : c.toString())),
      completedLevels: canon.completedLevels,
      unlockedLevels: canon.unlockedLevels,
      currentStage: canon.currentStage,
      progressPercentage: canon.progressPercentage,
      xp: user.xp,
      level: correctLevel,
      badges: user.badges,
      currentLevelXP: (user.xp || 0) % 1000,
      nextLevelXP: 1000,
      lastVisitedCourse: user.lastVisitedCourse,
      lastVisitedLesson: user.lastVisitedLesson,
      lastVisitedStage: user.lastVisitedStage,
      readingProgress: user.readingProgress || {},
      quizScore: user.quizScore || user.examMarks || 0,
      quizScores: user.quizScores || {},
      lastActiveAt: user.learningAnalytics?.lastActiveAt || user.updatedAt,
      notes: user.notes || {},
      completedExams: user.completedExams || [],
      examAttempts: user.examAttempts || {},
      achievements: user.achievements || {},
      practiceCompleted: canon.practiceCompleted,
      unlockedLessons: canon.unlockedLessons,
      currentLessonId: user.currentLessonId || null,
      lastActivityTime: user.lastActivityTime || null,
      continueLearning,
    })
  } catch (error) {
    console.error('Get Progress Error:', error)
    res.status(500).json({ message: error.message || 'Internal Server Error', error: error.stack })
  }
}

// ── POST /api/progression/complete-lesson ──────────────────────────────────────
const completeLesson = async (req, res) => {
  try {
    const { lessonId: rawLessonId, courseId } = req.body
    if (!rawLessonId) return res.status(400).json({ message: 'lessonId is required' })

    const slug = await P.normalizeLessonId(rawLessonId)
    if (!slug) return res.status(400).json({ message: 'Invalid lessonId: could not resolve to a valid lesson' })

    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    // Resolve the lesson _id (for course/next-lesson logic).
    const lessonId = await P.resolveLessonId(rawLessonId)
    const alreadyCompleted = (user.completedLessons || []).some((s) => s === slug)

    const unlockedToAdd = []
    if (!user.unlockedLessons.includes(slug)) unlockedToAdd.push(slug)

    const currentLesson = await Lesson.findById(lessonId)
    if (currentLesson) {
      const courseLessons = await Lesson.find({ courseId: currentLesson.courseId }).populate('courseId', 'level').sort({ order: 1 })
      const idx = courseLessons.findIndex((l) => l._id.toString() === lessonId)
      if (idx >= 0 && idx < courseLessons.length - 1) {
        const nextLesson = courseLessons[idx + 1]
        const nextSlug = P.slugForLesson(nextLesson)
        if (!user.unlockedLessons.includes(nextSlug)) unlockedToAdd.push(nextSlug)
      }
    }

    const projectedCount = alreadyCompleted
      ? user.completedLessons.length
      : user.completedLessons.length + 1

    const newBadges = []
    if (projectedCount === 1) newBadges.push({ name: 'First Steps', icon: '🌱' })
    if (projectedCount === 5) newBadges.push({ name: 'Striver', icon: '🔥' })
    if (projectedCount === 10) newBadges.push({ name: 'Code Master', icon: '🏆' })

    let completedCourseToAdd = null
    const effectiveCourseId = courseId || (currentLesson?.courseId ? currentLesson.courseId.toString() : null)
    if (effectiveCourseId) {
      const normCourse = P.normalizeCourseId(effectiveCourseId)
      if (normCourse) {
        const courseLessons = await Lesson.find({ courseId: normCourse }).populate('courseId', 'level').sort({ order: 1 })
        const completedSet = alreadyCompleted
          ? user.completedLessons
          : [...user.completedLessons, slug]
        const allCourseLessonsDone = courseLessons.every((l) =>
          completedSet.includes(P.slugForLesson(l)),
        )
        const alreadyCourseDone = (user.completedCourses || []).some((c) => c.toString() === normCourse)
        if (allCourseLessonsDone && !alreadyCourseDone) {
          completedCourseToAdd = normCourse
        }
      }
    }

    const now = new Date()

    // Atomic, idempotent award — single $addToSet keeps completedLessons +
    // completedCourses together (no duplicate-key overwrite bug).
    if (!alreadyCompleted) {
      const addToSet = { completedLessons: slug }
      if (completedCourseToAdd) addToSet.completedCourses = new mongoose.Types.ObjectId(completedCourseToAdd)
      await User.updateOne(
        { _id: req.user._id, completedLessons: { $ne: slug } },
        {
          $addToSet: addToSet,
          $inc: { xp: XP_PER_LESSON },
          $push: { badges: { $each: newBadges } },
        },
      )
    } else if (completedCourseToAdd) {
      await User.updateOne(
        { _id: req.user._id },
        { $addToSet: { completedCourses: new mongoose.Types.ObjectId(completedCourseToAdd) } },
      )
    }

    // Unlock the current lesson (if not already) and the next sequential lesson
    // BEFORE the canonical recompute, so computeUserProgression sees them in the
    // user document and preserves them through its own $set of unlockedLessons.
    await User.updateOne(
      { _id: req.user._id },
      { $addToSet: { unlockedLessons: { $each: unlockedToAdd } } },
    )

    // Always recompute & persist the full canonical state after EVERY lesson
    // completion — this ensures completedLevels, unlockedLevels, currentStage,
    // completedCourses, etc. are always in sync, whether or not a course boundary
    // was crossed.
    await P.computeUserProgression(req.user._id)

    await User.updateOne(
      { _id: req.user._id },
      {
        $set: {
          currentLessonId: slug,
          lastVisitedLesson: slug,
          lastActivityTime: now,
          'learningAnalytics.lastActiveAt': now,
        },
      },
    )

    const finalUser = await User.findById(req.user._id)
    const correctLevel = await P.syncLevel(req.user._id)

    // ── Diagnostic log (structured, single line per completion) ──
    console.log(`[completeLesson] user=${req.user._id} slug=${slug} alreadyCompleted=${alreadyCompleted} courseCompleted=${!!completedCourseToAdd} completedLessons=${finalUser.completedLessons.length} completedCourses=${(finalUser.completedCourses || []).length} completedLevels=${(finalUser.completedLevels || [])} unlockedLevels=${(finalUser.unlockedLevels || [])}`)

    // ── Automatic notifications (one per real event, deduped) ──
    if (!alreadyCompleted) {
      notify({
        userId: req.user._id,
        type: 'lesson_completed',
        title: 'পাঠ সম্পন্ন হয়েছে',
        message: currentLesson ? `“${currentLesson.title}” পাঠটি সফলভাবে সম্পন্ন করেছেন।` : 'আপনি একটি পাঠ সম্পন্ন করেছেন।',
        icon: 'CheckCircle2',
        color: '#1D9E75',
        link: '/dashboard',
        dedupeKey: `lesson:${slug}`,
      })
    }
    if (completedCourseToAdd) {
      const course = await Course.findById(completedCourseToAdd)
      notify({
        userId: req.user._id,
        type: 'course_completed',
        title: 'কোর্স সম্পন্ন হয়েছে',
        message: course ? `অভিনন্দন! “${course.title}” কোর্সটি সম্পন্ন করেছেন।` : 'আপনি একটি কোর্স সম্পন্ন করেছেন।',
        icon: 'GraduationCap',
        color: '#7C5CFC',
        link: '/dashboard',
        dedupeKey: `course:${completedCourseToAdd}`,
      })
    }
    for (const b of newBadges) {
      notify({
        userId: req.user._id,
        type: 'badge_earned',
        title: 'নতুন ব্যাজ অর্জিত',
        message: `“${b.name}” ব্যাজ অর্জন করেছেন! ${b.icon || ''}`,
        icon: 'Award',
        color: '#F59E0B',
        link: '/profile',
        dedupeKey: `badge:${b.name}`,
      })
    }

    res.status(200).json({
      message: 'Lesson completed',
      leveledUp: correctLevel > user.level,
      awardedBadges: alreadyCompleted ? [] : newBadges,
      courseCompleted: !!completedCourseToAdd,
      data: {
        completedLessons: finalUser.completedLessons,
        unlockedLessons: finalUser.unlockedLessons,
        completedCourses: (finalUser.completedCourses || []).map((c) => c.toString()),
        completedLevels: finalUser.completedLevels || [],
        unlockedLevels: finalUser.unlockedLevels || [],
        currentLessonId: finalUser.currentLessonId,
        lastActivityTime: finalUser.lastActivityTime,
        xp: finalUser.xp,
        level: correctLevel,
        progressPercentage: finalUser.progressPercentage,
        currentStage: finalUser.currentStage,
        badges: finalUser.badges,
      },
    })
  } catch (error) {
    console.error('Complete Lesson Error:', error)
    res.status(500).json({ message: error.message || 'Internal Server Error', error: error.stack })
  }
}

// ── POST /api/progression/complete-course ──────────────────────────────────────
const completeCourse = async (req, res) => {
  try {
    const { courseId, level } = req.body
    let normCourse = courseId ? P.normalizeCourseId(courseId) : null
    if (!normCourse && level) {
      const courseObj = await Course.findOne({ level })
      if (courseObj) normCourse = courseObj._id.toString()
      else console.warn(`[completeCourse] No Course document found for level="${level}"`)
    }
    if (!normCourse) return res.status(400).json({ message: 'courseId or level is required and no Course document exists for this level' })

    const snapshot = await User.findById(req.user._id)
    if (!snapshot) return res.status(404).json({ message: 'User not found' })

    if ((snapshot.completedCourses || []).some((id) => id.toString() === normCourse)) {
      return res.status(200).json({ message: 'Course already completed' })
    }

    const course = await Course.findById(normCourse)

    await User.updateOne(
      { _id: req.user._id },
      {
        $addToSet: { completedCourses: new mongoose.Types.ObjectId(normCourse) },
        $set: { 'learningAnalytics.lastActiveAt': new Date() },
      },
    )

    await P.computeUserProgression(req.user._id)

    notify({
      userId: req.user._id,
      type: 'course_completed',
      title: 'কোর্স সম্পন্ন হয়েছে',
      message: course ? `অভিনন্দন! “${course.title}” কোর্সটি সম্পন্ন করেছেন।` : 'আপনি একটি কোর্স সম্পন্ন করেছেন।',
      icon: 'GraduationCap',
      color: '#7C5CFC',
      link: '/dashboard',
      dedupeKey: `course:${normCourse}`,
    })

    res.status(200).json({ message: 'Course completed', currentStage: snapshot.currentStage })
  } catch (error) {
    console.error('Complete Course Error:', error)
    res.status(500).json({ message: error.message || 'Internal Server Error', error: error.stack })
  }
}

// ── POST /api/progression/unlock ───────────────────────────────────────────────
const unlockCourse = async (req, res) => {
  try {
    const { courseId } = req.body
    const snapshot = await User.findById(req.user._id)
    if (!snapshot) return res.status(404).json({ message: 'User not found' })

    if (courseId) {
      const normCourse = P.normalizeCourseId(courseId)
      if (!normCourse) return res.status(400).json({ message: 'Invalid courseId' })
      if ((snapshot.unlockedCourses || []).some((id) => id.toString() === normCourse)) {
        return res.status(200).json({ message: 'Course already unlocked' })
      }
      await User.updateOne(
        { _id: req.user._id },
        { $addToSet: { unlockedCourses: new mongoose.Types.ObjectId(normCourse) } },
      )
    } else {
      const beginnerCourse = await Course.findOne({ level: 'beginner' })
      if (beginnerCourse && !(snapshot.unlockedCourses || []).some((id) => id.toString() === beginnerCourse._id.toString())) {
        await User.updateOne(
          { _id: req.user._id },
          { $addToSet: { unlockedCourses: beginnerCourse._id } },
        )
      }
    }

    const updated = await User.findById(req.user._id)
    res.status(200).json({ message: 'Course unlocked', unlockedCourses: updated.unlockedCourses })
  } catch (error) {
    console.error('Unlock Course Error:', error)
    res.status(500).json({ message: error.message || 'Internal Server Error', error: error.stack })
  }
}

// ── POST /api/progression/last-visited ─────────────────────────────────────────
const saveLastVisited = async (req, res) => {
  try {
    const { courseId, lessonId: rawLessonId, stage, readingProgress, quizScore, quizScores, xp } = req.body
    const snapshot = await User.findById(req.user._id)
    if (!snapshot) return res.status(404).json({ message: 'User not found' })

    const slug = rawLessonId ? await P.normalizeLessonId(rawLessonId) : null

    const setOps = {}
    if (courseId) setOps.lastVisitedCourse = P.normalizeCourseId(courseId)
    if (slug) {
      setOps.lastVisitedLesson = slug
      setOps.currentLessonId = slug
    }
    if (stage) setOps.lastVisitedStage = stage
    if (xp !== undefined) setOps.xp = xp

    setOps.lastActivityTime = new Date()
    setOps['learningAnalytics.lastActiveAt'] = new Date()

    if (readingProgress && typeof readingProgress === 'object') {
      Object.entries(readingProgress).forEach(([k, v]) => { setOps[`readingProgress.${k}`] = Number(v) })
    }
    if (quizScore !== undefined) {
      setOps.quizScore = Number(quizScore)
      setOps.examMarks = Number(quizScore)
    }
    if (quizScores && typeof quizScores === 'object') {
      Object.entries(quizScores).forEach(([k, v]) => { setOps[`quizScores.${k}`] = Number(v) })
    }

    const updated = await User.findByIdAndUpdate(req.user._id, { $set: setOps }, { returnDocument: 'after' })
    if (!updated) return res.status(404).json({ message: 'User not found' })

    res.status(200).json({
      message: 'Progress saved',
      data: {
        lastVisitedCourse: updated.lastVisitedCourse,
        lastVisitedLesson: updated.lastVisitedLesson,
        currentLessonId: updated.currentLessonId,
        lastActivityTime: updated.lastActivityTime,
        lastVisitedStage: updated.lastVisitedStage,
        readingProgress: updated.readingProgress || {},
        quizScore: updated.quizScore || updated.examMarks || 0,
        quizScores: updated.quizScores || {},
        xp: updated.xp,
        lastActiveAt: updated.learningAnalytics?.lastActiveAt,
      },
    })
  } catch (error) {
    console.error('Save Last Visited Error:', error)
    res.status(500).json({ message: error.message || 'Internal Server Error', error: error.stack })
  }
}

const saveNote = async (req, res) => {
  try {
    const { lessonId, content } = req.body
    if (!lessonId) return res.status(400).json({ message: 'lessonId is required' })

    let updated
    if (content === null || content === undefined || content.trim() === '') {
      updated = await User.findByIdAndUpdate(req.user._id, { $unset: { [`notes.${lessonId}`]: '' } }, { returnDocument: 'after' })
    } else {
      updated = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { [`notes.${lessonId}`]: { content, updatedAt: new Date() } } },
        { returnDocument: 'after' },
      )
    }
    if (!updated) return res.status(404).json({ message: 'User not found' })
    res.status(200).json({ message: 'Note saved successfully', notes: updated.notes })
  } catch (error) {
    console.error('Save Note Error:', error)
    res.status(500).json({ message: error.message || 'Internal Server Error', error: error.stack })
  }
}

// ── POST /api/progression/complete-practice ────────────────────────────────────
// Delegates to the centralized Practice Service so practice progress is fully
// persisted (code/time/score), XP is awarded once, the next lesson is unlocked,
// analytics updated, and a notification is created — all in one place.
const completePractice = async (req, res) => {
  try {
    const { lessonId: rawLessonId } = req.body
    if (!rawLessonId) return res.status(400).json({ message: 'lessonId is required' })

    const slug = await P.normalizeLessonId(rawLessonId)
    if (!slug) return res.status(400).json({ message: 'Invalid lessonId: could not resolve to a valid lesson' })

    const result = await require('../services/practiceService').completePractice(
      req.user._id,
      slug,
      { lesson: slug, language: req.body.language, files: req.body.files, code: req.body.code, timeSpent: req.body.timeSpent, score: req.body.score },
    )
    if (result.error) return res.status(404).json({ message: 'User not found' })

    res.json({
      message: result.message,
      practiceCompleted: result.practiceCompleted,
      xp: result.xp,
    })
  } catch (error) {
    console.error('completePractice Error:', error)
    res.status(500).json({ message: error.message || 'Internal Server Error', error: error.stack })
  }
}

module.exports = { getProgress, completeLesson, completeCourse, unlockCourse, saveLastVisited, saveNote, completePractice }
