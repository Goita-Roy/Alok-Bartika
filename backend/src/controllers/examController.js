const { Exam } = require('../models/Exam')
const { User } = require('../models/User')
const { Course } = require('../models/Course')
const P = require('../services/progressService')
const N = require('../services/notificationService')
const { gradeCodingQuestion } = require('../services/codingEvaluationService')

// Maximum points a single coding question can contribute when ALL its tests pass.
// (The question's own `points` field governs weighting; the judge returns 0-100
// which we scale into that point budget.)
const CODING_FULL_MARKS = 100

const LEVEL_ORDER = P.LEVEL_ORDER
const NEXT_LEVEL = P.NEXT_LEVEL

// ── Exam access control ───────────────────────────────────────────────────────
// The backend is the authority on which Final Exams a student may attempt.
// A level's exam is accessible when:
//   - the level is in the student's unlockedLevels (progression-based), OR
//   - the level is already in completedLevels (allows retakes).
// Beginner is always unlocked. Intermediate requires Beginner completed
// (exam passed); Advanced requires Intermediate completed.
// Returns { ok: true } or { ok: false, status, message }.
async function checkExamAccess(user, level) {
  if (!LEVEL_ORDER.includes(level)) {
    return { ok: false, status: 400, message: 'Invalid level' }
  }

  // Recompute authoritatively from the user's exam/course progression so we
  // never trust potentially stale stored arrays.
  const { completedLevels, unlockedLevels } = await P.computeLevels(
    user.completedExams || [],
    user.completedCourses || [],
  )

  const accessible = unlockedLevels.includes(level) || completedLevels.includes(level)
  if (!accessible) {
    const prev = LEVEL_ORDER[LEVEL_ORDER.indexOf(level) - 1]
    return {
      ok: false,
      status: 403,
      message: 'This Final Exam is locked. Complete and pass the previous level first.',
      requiredLevel: prev || null,
    }
  }
  return { ok: true }
}

// XP awards
const XP_EXAM_PASS = 500
const XP_EXAM_FAIL = 50

// Badge definitions
const EXAM_BADGES = {
  beginner:     { name: 'Beginner Graduate', icon: '🎓', description: 'Passed the Beginner Final Exam' },
  intermediate: { name: 'Intermediate Master', icon: '🏆', description: 'Passed the Intermediate Final Exam' },
  advanced:     { name: 'Advanced Expert', icon: '🚀', description: 'Passed the Advanced Final Exam — Course Complete!' },
}

// Achievement definitions
const EXAM_ACHIEVEMENTS = {
  beginner: {
    name: 'First Step',
    description: 'Completed the Beginner level and passed the final exam.',
    icon: '🌱',
  },
  intermediate: {
    name: 'Rising Star',
    description: 'Completed the Intermediate level and passed the final exam.',
    icon: '⭐',
  },
  advanced: {
    name: 'Code Master',
    description: 'Completed the Advanced level — full course mastered!',
    icon: '👑',
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
// Fire-and-forget; must never throw into the request flow.
function notify(opts) {
  N.createNotification(opts).catch(() => {})
}

async function notifyExamPass(userId, exam, newBadge, newAchievement, nextLevelUnlocked) {
  notify({
    userId,
    type: 'exam_passed',
    title: 'পরীক্ষায় উত্তীর্ণ',
    message: `“${exam.title}” পরীক্ষায় উত্তীর্ণ হয়েছেন! +${XP_EXAM_PASS} XP।`,
    icon: 'Trophy',
    color: '#1D9E75',
    link: '/dashboard',
    dedupeKey: `exam:${exam._id}`,
  })
  if (newBadge) {
    notify({
      userId,
      type: 'badge_earned',
      title: 'নতুন ব্যাজ অর্জিত',
      message: `“${newBadge.name}” ব্যাজ অর্জন করেছেন! ${newBadge.icon || ''}`,
      icon: 'Award',
      color: '#F59E0B',
      link: '/profile',
      dedupeKey: `badge:${newBadge.name}`,
    })
  }
  if (newAchievement) {
    notify({
      userId,
      type: 'achievement_earned',
      title: 'নতুন অর্জন',
      message: `“${newAchievement.name}” — ${newAchievement.description || ''}`,
      icon: 'Star',
      color: '#7C5CFC',
      link: '/profile',
      dedupeKey: `achievement:${newAchievement.name}`,
    })
  }
  if (nextLevelUnlocked) {
    const next = NEXT_LEVEL[exam.level]
    notify({
      userId,
      type: 'level_unlocked',
      title: 'নতুন লেভেল আনলক',
      message: next ? `অভিনন্দন! “${next}” লেভেল আনলক হয়েছে।` : 'নতুন লেভেল আনলক হয়েছে।',
      icon: 'Unlock',
      color: '#0EA5E9',
      link: '/dashboard',
      dedupeKey: `level:${exam.level}`,
    })
  }
}

// Grade an exam. Coding questions are graded EXCLUSIVELY by the centralized
// CodingEvaluationService — there is no inline grading fallback here.
// `ctx` carries { userId, examId } so the service can attribute its logs.
async function gradeExam(exam, answers, ctx = {}) {
  let earnedPoints = 0
  let totalPoints = 0
  const questionResults = []
  const codingTasks = []

  exam.questions.forEach((q, idx) => {
    const pts = q.points || 1
    totalPoints += pts
    const given = answers[idx]

    if (q.type === 'mcq' || q.type === 'truefalse') {
      const correct = given === q.correctAnswer
      if (correct) earnedPoints += pts
      questionResults.push({
        questionIdx: idx,
        questionText: q.questionText,
        type: q.type,
        options: q.options,
        given,
        correct,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        points: pts,
      })
    } else if (q.type === 'code-output') {
      const correct =
        String(given || '').trim().toLowerCase() === String(q.correctAnswer || '').trim().toLowerCase()
      if (correct) earnedPoints += pts
      questionResults.push({
        questionIdx: idx,
        questionText: q.questionText,
        type: q.type,
        options: q.options,
        given,
        correct,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        points: pts,
      })
    } else if (q.type === 'coding') {
      // Defer to the centralized engine. We capture the question, the student's
      // code, and the point budget, then resolve after all async grades finish.
      codingTasks.push(
        gradeCodingQuestion(q, typeof given === 'string' ? given : '', {
          userId: ctx.userId,
          examId: ctx.examId,
          questionId: q._id,
          questionIndex: idx,
        }).then((judge) => {
          // Scale the 0-100 judge score into this question's point budget.
          const scaled = Math.round((judge.score || 0) * (pts / CODING_FULL_MARKS))
          earnedPoints += scaled
          questionResults.push({
            questionIdx: idx,
            questionText: q.questionText,
            type: q.type,
            options: q.options,
            language: q.language,
            given,
            correct: judge.score >= 100,
            // Only VISIBLE test summary + safe feedback are returned to the UI.
            // Hidden case counts and solution code are never exposed.
            judge: {
              status: judge.status,
              score: judge.score,
              passedTests: judge.passedTests,
              failedTests: judge.failedTests,
              totalTests: judge.totalTests,
              visible: judge.visible,
              executionTimeMs: judge.executionTimeMs,
              memoryUsedMb: judge.memoryUsedMb,
              compileError: judge.compileError || '',
              runtimeError: judge.runtimeError || '',
              timeout: !!judge.timeout,
              feedback: judge.feedback || '',
              antiCheat: judge.antiCheat || '',
            },
            correctAnswer: null,
            explanation: q.explanation,
            points: pts,
          })
        })
      )
    }
  })

  // Await all coding evaluations before computing the final percentage.
  await Promise.all(codingTasks)

  const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
  const passed = percentage >= exam.passingScore

  return { earnedPoints, totalPoints, percentage, passed, questionResults }
}

// ── @route GET /api/exams/level/:level ───────────────────────────────────────
const getExamByLevel = async (req, res) => {
  try {
    const { level } = req.params

    const access = await checkExamAccess(req.user, level)
    if (!access.ok) {
      return res.status(access.status).json({ message: access.message, requiredLevel: access.requiredLevel })
    }

    const exam = await Exam.findOne({ level, isActive: true })
    if (!exam) return res.status(404).json({ message: 'No exam found for this level' })

    const safeQuestions = exam.questions.map(q => ({
      _id: q._id,
      type: q.type,
      questionText: q.questionText,
      options: q.options,
      starterCode: q.starterCode,
      points: q.points,
    }))

    res.json({
      _id: exam._id,
      level: exam.level,
      title: exam.title,
      description: exam.description,
      passingScore: exam.passingScore,
      timeLimitMinutes: exam.timeLimitMinutes,
      questionCount: exam.questions.length,
      questions: safeQuestions,
    })
  } catch (err) {
    console.error('getExamByLevel Error:', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// ── @route GET /api/exams/:examId ────────────────────────────────────────────
const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId)
    if (!exam) return res.status(404).json({ message: 'Exam not found' })

    const safeQuestions = exam.questions.map(q => ({
      _id: q._id,
      type: q.type,
      questionText: q.questionText,
      options: q.options,
      starterCode: q.starterCode,
      points: q.points,
    }))

    res.json({
      _id: exam._id,
      level: exam.level,
      title: exam.title,
      description: exam.description,
      passingScore: exam.passingScore,
      timeLimitMinutes: exam.timeLimitMinutes,
      questionCount: exam.questions.length,
      questions: safeQuestions,
    })
  } catch (err) {
    console.error('getExamById Error:', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// ── @route POST /api/exams/:examId/submit ────────────────────────────────────
const submitExam = async (req, res) => {
  try {
    const { answers, timeTakenSeconds } = req.body
    const { examId } = req.params

    const [exam, user] = await Promise.all([
      Exam.findById(examId),
      User.findById(req.user._id),
    ])

    if (!exam) return res.status(404).json({ message: 'Exam not found' })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const access = await checkExamAccess(user, exam.level)
    if (!access.ok) {
      return res.status(access.status).json({ message: access.message, requiredLevel: access.requiredLevel })
    }

    const { earnedPoints, totalPoints, percentage, passed, questionResults } = await gradeExam(
      exam,
      answers,
      { userId: req.user._id, examId }
    )

    const attempt = {
      score: percentage,
      earnedPoints,
      totalPoints,
      passed,
      timeTakenSeconds: timeTakenSeconds || 0,
      takenAt: new Date(),
      answers,
      questionResults,
    }

    if (!user.examAttempts) user.examAttempts = new Map()
    const prevAttempts = user.examAttempts.get(examId) || []
    user.examAttempts.set(examId, [...prevAttempts, attempt])

    let newBadge = null
    let newAchievement = null
    let nextLevelUnlocked = false

    if (passed) {
      user.xp = (user.xp || 0) + XP_EXAM_PASS

      const alreadyCompleted = (user.completedExams || []).some((id) => id.toString() === examId)
      if (!alreadyCompleted) {
        user.completedExams = [...(user.completedExams || []), exam._id]

        const badgeDef = EXAM_BADGES[exam.level]
        if (badgeDef) {
          const hasBadge = (user.badges || []).some((b) => b.name === badgeDef.name)
          if (!hasBadge) {
            newBadge = { ...badgeDef, awardedAt: new Date() }
            user.badges = [...(user.badges || []), newBadge]
          }
        }

        const achDef = EXAM_ACHIEVEMENTS[exam.level]
        if (achDef) {
          const hasAch = (user.achievements || []).some((a) => a.name === achDef.name)
          if (!hasAch) {
            newAchievement = { ...achDef, awardedAt: new Date() }
            user.achievements = [...(user.achievements || []), newAchievement]
          }
        }
      }

      const nextLevel = NEXT_LEVEL[exam.level]
      if (nextLevel) nextLevelUnlocked = true
    } else {
      user.xp = (user.xp || 0) + XP_EXAM_FAIL
    }

    if (!user.learningAnalytics) user.learningAnalytics = {}
    user.learningAnalytics.lastActiveAt = new Date()

    if (user.examAttempts && typeof user.examAttempts.markModified === 'function') {
      user.examAttempts.markModified('examAttempts')
    } else {
      user.markModified('examAttempts')
    }

    await user.save()

    // ── Canonical recompute via the shared service (single source of truth) ──
    // Rebuilds completedCourses (course ids only), completedLevels,
    // unlockedLevels, currentStage, progressPercentage, and unlockedCourses
    // from the now-updated completedExams. No duplicated progression logic.
    const canon = await P.repairUser(req.user._id)
    await P.syncLevel(req.user._id)

    // ── Automatic notifications (one per real event, deduped) ──
    if (passed) {
      notifyExamPass(req.user._id, exam, newBadge, newAchievement, nextLevelUnlocked)
    }

    res.json({
      passed,
      score: percentage,
      earnedPoints,
      totalPoints,
      passingScore: exam.passingScore,
      attemptNumber: prevAttempts.length + 1,
      xpAwarded: passed ? XP_EXAM_PASS : XP_EXAM_FAIL,
      newBadge,
      newAchievement,
      nextLevelUnlocked,
      nextLevel: passed ? NEXT_LEVEL[exam.level] : null,
      questionResults,
    })
  } catch (err) {
    console.error('submitExam Error:', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// ── @route POST /api/exams/:examId/terminate ─────────────────────────────────
const terminateExam = async (req, res) => {
  try {
    const { examId } = req.params
    const { reason, timeTakenSeconds } = req.body || {}

    const [exam, user] = await Promise.all([
      Exam.findById(examId),
      User.findById(req.user._id),
    ])

    if (!exam) return res.status(404).json({ message: 'Exam not found' })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const totalPoints = (exam.questions || []).reduce((sum, q) => sum + (q.points || 1), 0)

    const attempt = {
      score: 0,
      earnedPoints: 0,
      totalPoints,
      passed: false,
      terminated: true,
      terminationReason: reason || 'পরীক্ষার নিয়ম ভঙ্গ',
      timeTakenSeconds: timeTakenSeconds || 0,
      takenAt: new Date(),
      answers: [],
      questionResults: [],
    }

    if (!user.examAttempts) user.examAttempts = new Map()
    const prevAttempts = user.examAttempts.get(examId) || []
    user.examAttempts.set(examId, [...prevAttempts, attempt])

    if (!user.learningAnalytics) user.learningAnalytics = {}
    user.learningAnalytics.lastActiveAt = new Date()

    if (user.examAttempts && typeof user.examAttempts.markModified === 'function') {
      user.examAttempts.markModified('examAttempts')
    } else {
      user.markModified('examAttempts')
    }

    await user.save()

    res.json({ terminated: true, attemptNumber: prevAttempts.length + 1 })
  } catch (err) {
    console.error('terminateExam Error:', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// ── @route GET /api/exams/:examId/attempts ───────────────────────────────────
const getUserExamAttempts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const attempts = user.examAttempts?.get(req.params.examId) || []
    const bestAttempt = attempts.reduce((best, a) => (!best || a.score > best.score ? a : best), null)

    res.json({
      attempts,
      attemptCount: attempts.length,
      bestScore: bestAttempt?.score || 0,
      passed: attempts.some((a) => a.passed),
    })
  } catch (err) {
    console.error('getUserExamAttempts Error:', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// ── @route GET /api/exams/:examId/review ─────────────────────────────────────
const getExamReview = async (req, res) => {
  try {
    const { examId } = req.params
    const [exam, user] = await Promise.all([
      Exam.findById(examId),
      User.findById(req.user._id),
    ])

    if (!exam) return res.status(404).json({ message: 'Exam not found' })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const attempts = user.examAttempts?.get(examId) || []
    const gradedAttempts = attempts.filter((a) => !a.terminated)
    if (gradedAttempts.length === 0) return res.status(404).json({ message: 'No attempts found for this exam' })

    const latestAttempt = gradedAttempts[gradedAttempts.length - 1]
    const fullQuestions = exam.questions.map(q => ({
      _id: q._id,
      type: q.type,
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      starterCode: q.starterCode,
      points: q.points,
    }))

    res.json({
      exam: {
        _id: exam._id,
        level: exam.level,
        title: exam.title,
        description: exam.description,
        passingScore: exam.passingScore,
        timeLimitMinutes: exam.timeLimitMinutes,
        questionCount: exam.questions.length,
        questions: fullQuestions,
      },
      attempt: {
        score: latestAttempt.score,
        earnedPoints: latestAttempt.earnedPoints,
        totalPoints: latestAttempt.totalPoints,
        passed: latestAttempt.passed,
        timeTakenSeconds: latestAttempt.timeTakenSeconds,
        takenAt: latestAttempt.takenAt,
        answers: latestAttempt.answers,
        attemptNumber: gradedAttempts.length,
        questionResults: latestAttempt.questionResults || [],
      },
      attemptCount: gradedAttempts.length,
      bestScore: Math.max(...gradedAttempts.map((a) => a.score)),
    })
  } catch (err) {
    console.error('getExamReview Error:', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// ── @route GET /api/exams/results/first-attempts ─────────────────────────────
const getFirstAttemptResults = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const attemptsMap = user.examAttempts || new Map()
    const examIds = Array.from(attemptsMap.keys())
    if (examIds.length === 0) return res.json({ results: [] })

    const exams = await Exam.find({ _id: { $in: examIds } })
    const examById = new Map(exams.map((e) => [e._id.toString(), e]))

    const results = examIds
      .map((examId) => {
        const attempts = attemptsMap.get(examId) || []
        const gradedAttempts = attempts.filter((a) => !a.terminated)
        if (gradedAttempts.length === 0) return null
        const firstAttempt = gradedAttempts[0]
        const exam = examById.get(examId.toString())

        let examType = 'MCQ'
        if (exam && Array.isArray(exam.questions) && exam.questions.length > 0) {
          const types = new Set(exam.questions.map((q) => q.type))
          const hasCoding = types.has('coding') || types.has('code-output')
          const hasChoice = types.has('mcq') || types.has('truefalse')
          if (hasCoding && hasChoice) examType = 'Mixed (MCQ + Coding)'
          else if (hasCoding) examType = 'Coding'
          else examType = 'MCQ'
        }

        return {
          examId: examId.toString(),
          level: exam ? exam.level : 'unknown',
          examName: exam ? exam.title : 'Exam',
          examType,
          score: firstAttempt.score,
          earnedPoints: firstAttempt.earnedPoints ?? null,
          totalPoints: firstAttempt.totalPoints ?? null,
          passed: !!firstAttempt.passed,
          takenAt: firstAttempt.takenAt || null,
        }
      })
      .filter(Boolean)

    const levelRank = { beginner: 0, intermediate: 1, advanced: 2 }
    results.sort((a, b) => (levelRank[a.level] ?? 99) - (levelRank[b.level] ?? 99))
    res.json({ results })
  } catch (err) {
    console.error('getFirstAttemptResults Error:', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// ── Admin: Create exam ────────────────────────────────────────────────────────
const createExam = async (req, res) => {
  try {
    const { courseId, level, title, description, passingScore, timeLimitMinutes, questions } = req.body
    const exam = await Exam.create({ courseId, level, title, description, passingScore, timeLimitMinutes, questions })
    res.status(201).json({ message: 'Exam created', data: exam })
  } catch (err) {
    console.error('createExam Error:', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// ── Admin: Update exam ────────────────────────────────────────────────────────
const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.examId, req.body, { returnDocument: 'after' })
    if (!exam) return res.status(404).json({ message: 'Exam not found' })
    res.json({ message: 'Exam updated', data: exam })
  } catch (err) {
    console.error('updateExam Error:', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = { getExamByLevel, getExamById, submitExam, terminateExam, getUserExamAttempts, getExamReview, getFirstAttemptResults, createExam, updateExam, gradeExam }
