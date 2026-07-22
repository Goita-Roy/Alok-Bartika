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

// Recompute & persist derived level state from canonical completedExams/courses.
async function persistLevels(userId) {
  const user = await User.findById(userId).select('completedExams completedCourses')
  if (!user) return null
  const { completedLevels, unlockedLevels } = await P.computeLevels(
    user.completedExams.map((e) => e.toString()),
    user.completedCourses.map((c) => c.toString()),
  )
  await User.updateOne(
    { _id: userId },
    { $set: { completedLevels, unlockedLevels } },
  )
  return { completedLevels, unlockedLevels }
}

// ── GET /api/progression ──────────────────────────────────────────────────────
const getProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    // Runtime validation/repair: if stored progression is not canonical, fix it
    // before returning so the client always receives consistent data.
    const needsRepair =
      !Array.isArray(user.completedLessons) ||
      user.completedLessons.some((s) => !P.SLUG_RE.test(s)) ||
      !Array.isArray(user.unlockedLessons) ||
      user.unlockedLessons.some((s) => !P.SLUG_RE.test(s))

    if (needsRepair) {
      await P.repairUser(req.user._id)
    }

    console.log('[DEBUG:GET /progression] user.completedLessons:', user.completedLessons)
    const canon = await P.canonicalize(user)
    console.log('[DEBUG:GET /progression] canon.completedLessons:', canon.completedLessons)
    // Persist derived facts so all consumers agree (single source of truth).
    await User.updateOne(
      { _id: req.user._id },
      {
        $set: {
          completedLevels: canon.completedLevels,
          unlockedLevels: canon.unlockedLevels,
          currentStage: canon.currentStage,
          progressPercentage: canon.progressPercentage,
        },
      },
    )

    const correctLevel = await P.syncLevel(req.user._id)

    // Canonical Continue Learning resolution (single source of truth, shared
    // with the dashboard) so every page resumes to the exact lesson.
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
    res.status(500).json({ message: 'Internal Server Error' })
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
      const courseLessons = await Lesson.find({ courseId: currentLesson.courseId }).sort({ order: 1 })
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

    const total = await P.getTotalLessons()
    const progressPercentage = P.progressFromCounts(projectedCount, total)

    let currentStage = user.currentStage
    let completedCourseToAdd = null
    if (courseId) {
      const normCourse = P.normalizeCourseId(courseId)
      if (normCourse) {
        const courseLessons = await Lesson.find({ courseId: normCourse }).sort({ order: 1 })
        const completedSet = alreadyCompleted
          ? user.completedLessons
          : [...user.completedLessons, slug]
        const allCourseLessonsDone = courseLessons.every((l) =>
          completedSet.includes(P.slugForLesson(l)),
        )
        const alreadyCourseDone = (user.completedCourses || []).some((c) => c.toString() === normCourse)
        if (allCourseLessonsDone && !alreadyCourseDone) {
          completedCourseToAdd = normCourse
        } else if (courseLessons.length > 0) {
          const firstUnfinished = courseLessons.find((l) => !completedSet.includes(P.slugForLesson(l)))
          if (firstUnfinished) {
            currentStage = (await Course.findById(normCourse))?.level || currentStage
          }
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

    await User.updateOne(
      { _id: req.user._id },
      {
        $addToSet: { unlockedLessons: { $each: unlockedToAdd } },
        $set: {
          currentLessonId: slug,
          lastVisitedLesson: slug,
          lastActivityTime: now,
          progressPercentage,
          currentStage,
          'learningAnalytics.lastActiveAt': now,
        },
      },
    )

    const finalUser = await User.findById(req.user._id)
    console.log('[DEBUG:POST /complete-lesson] after write — finalUser.completedLessons:', finalUser.completedLessons)
    const correctLevel = await P.syncLevel(req.user._id)

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
      data: {
        completedLessons: finalUser.completedLessons,
        unlockedLessons: finalUser.unlockedLessons,
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
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// ── POST /api/progression/complete-course ──────────────────────────────────────
const completeCourse = async (req, res) => {
  try {
    const { courseId } = req.body
    if (!courseId) return res.status(400).json({ message: 'courseId is required' })

    const normCourse = P.normalizeCourseId(courseId)
    if (!normCourse) return res.status(400).json({ message: 'Invalid courseId' })

    const snapshot = await User.findById(req.user._id)
    if (!snapshot) return res.status(404).json({ message: 'User not found' })

    if ((snapshot.completedCourses || []).some((id) => id.toString() === normCourse)) {
      return res.status(200).json({ message: 'Course already completed' })
    }

    const course = await Course.findById(normCourse)
    const total = await P.getTotalLessons()
    const progressPercentage = P.progressFromCounts(snapshot.completedLessons.length, total)

    await User.updateOne(
      { _id: req.user._id },
      {
        $addToSet: { completedCourses: new mongoose.Types.ObjectId(normCourse) },
        $set: { progressPercentage, 'learningAnalytics.lastActiveAt': new Date() },
      },
    )

    await persistLevels(req.user._id)

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
    res.status(500).json({ message: 'Internal Server Error' })
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
    res.status(500).json({ message: 'Internal Server Error' })
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
    res.status(500).json({ message: 'Internal Server Error' })
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
    res.status(500).json({ message: 'Internal Server Error' })
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
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = { getProgress, completeLesson, completeCourse, unlockCourse, saveLastVisited, saveNote, completePractice }
