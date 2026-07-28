const { StudentFeedback } = require('../models/StudentFeedback')
const { User } = require('../models/User')
const { Exam } = require('../models/Exam')
const { Course } = require('../models/Course')
const P = require('../services/progressService')

const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced']

// ── POST /api/feedback/submit ───────────────────────────────────────────────
const submitFeedback = async (req, res) => {
  try {
    const userId = req.user._id
    const {
      level,
      rating,
      courseExperience,
      learnedSomething,
      lessonUnderstanding,
      favoriteParts,
      improvementSuggestion,
      futureFeatures,
      recommendation,
      additionalSuggestion,
    } = req.body

    // ── Validate level ──
    if (!LEVEL_ORDER.includes(level)) {
      return res.status(400).json({ message: 'অবৈধ লেভেল' })
    }

    // ── Fetch user + exam ──
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'ব্যবহারকারী পাওয়া যায়নি' })

    const exam = await Exam.findOne({ level, isActive: true })
    if (!exam) return res.status(404).json({ message: 'এই লেভেলের জন্য কোনো পরীক্ষা পাওয়া যায়নি' })

    const examIdStr = exam._id.toString()

    // ── Verify student passed the exam ──
    const isCompleted = (user.completedExams || []).some(id => id.toString() === examIdStr)
    if (!isCompleted) {
      return res.status(403).json({ message: 'আপনি এই লেভেলের পরীক্ষা পাস করেননি' })
    }

    // ── Check duplicate ──
    const existing = await StudentFeedback.findOne({ userId, level })
    if (existing) {
      return res.status(409).json({ message: 'আপনি ইতিমধ্যে এই লেভেলের জন্য মতামত জমা দিয়েছেন' })
    }

    // ── Get exam score from last attempt ──
    const attempts = (user.examAttempts && user.examAttempts.get(examIdStr)) || []
    const lastPassed = [...attempts].reverse().find(a => a.passed)
    const examScore = lastPassed ? lastPassed.score : 0

    // ── Get course info ──
    const course = await Course.findOne({ level }).sort({ createdAt: 1 })
    const courseTitle = course ? course.title : level
    const courseId = course ? course._id : null

    // ── Validate required fields ──
    const errors = []
    if (!rating || rating < 1 || rating > 5) errors.push('রেটিং নির্বাচন করুন')
    if (!courseExperience) errors.push('আপনার অভিজ্ঞতা নির্বাচন করুন')
    if (!learnedSomething) errors.push('আপনি কিছু শিখেছেন কিনা তা নির্বাচন করুন')
    if (!lessonUnderstanding) errors.push('পাঠ বোঝার মাত্রা নির্বাচন করুন')
    if (!improvementSuggestion || improvementSuggestion.trim().length < 20) {
      errors.push('উন্নতির পরামর্শ কমপক্ষে ২০টি অক্ষর হতে হবে')
    }
    if (!recommendation) errors.push('সুপারিশ নির্বাচন করুন')

    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join('. ') })
    }

    // ── Create feedback ──
    const feedback = await StudentFeedback.create({
      userId,
      studentName: user.fullName || 'শিক্ষার্থী',
      courseId: courseId || undefined,
      courseTitle,
      level,
      examId: exam._id,
      examScore,
      rating,
      courseExperience,
      learnedSomething,
      lessonUnderstanding,
      favoriteParts: favoriteParts || [],
      improvementSuggestion: improvementSuggestion.trim(),
      futureFeatures: futureFeatures || '',
      recommendation,
      additionalSuggestion: additionalSuggestion || '',
    })

    // ── Mark feedback submitted for this level ──
    if (!user.feedbackSubmittedLevels) user.feedbackSubmittedLevels = []
    if (!user.feedbackSubmittedLevels.includes(level)) {
      user.feedbackSubmittedLevels.push(level)
    }
    // ── Clear pending feedback — user can now access other pages ──
    user.pendingFeedback = null
    await user.save()

    // ── Recompute canonical progression ──
    // Now that feedbackSubmittedLevels is updated, repairUser will unlock next level
    await P.repairUser(userId)
    await P.syncLevel(userId)

    // ── Check if next level unlocked ──
    const updatedUser = await User.findById(userId)
    const nextLevel = LEVEL_ORDER[LEVEL_ORDER.indexOf(level) + 1] || null
    const nextLevelUnlocked = nextLevel ? (updatedUser.unlockedLevels || []).includes(nextLevel) : false

    res.status(201).json({
      success: true,
      message: 'আপনার মতামত সফলভাবে সংরক্ষণ করা হয়েছে',
      nextLevelUnlocked,
      nextLevel,
    })
  } catch (err) {
    console.error('submitFeedback Error:', err)
    if (err.code === 11000) {
      return res.status(409).json({ message: 'আপনি ইতিমধ্যে এই লেভেলের জন্য মতামত জমা দিয়েছেন' })
    }
    res.status(500).json({ message: 'অভ্যন্তরীণ সার্ভার ত্রুটি' })
  }
}

// ── GET /api/feedback/status/:level ─────────────────────────────────────────
const getFeedbackStatus = async (req, res) => {
  try {
    const userId = req.user._id
    const { level } = req.params

    if (!LEVEL_ORDER.includes(level)) {
      return res.status(400).json({ message: 'অবৈধ লেভেল' })
    }

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'ব্যবহারকারী পাওয়া যায়নি' })

    const exam = await Exam.findOne({ level, isActive: true })
    const examIdStr = exam ? exam._id.toString() : null

    const passed = examIdStr ? (user.completedExams || []).some(id => id.toString() === examIdStr) : false
    const feedbackSubmitted = (user.feedbackSubmittedLevels || []).includes(level)

    let score = 0
    if (passed && examIdStr) {
      const attempts = (user.examAttempts && user.examAttempts.get(examIdStr)) || []
      const lastPassed = [...attempts].reverse().find(a => a.passed)
      if (lastPassed) score = lastPassed.score
    }

    res.json({ feedbackSubmitted, passed, score, level })
  } catch (err) {
    console.error('getFeedbackStatus Error:', err)
    res.status(500).json({ message: 'অভ্যন্তরীণ সার্ভার ত্রুটি' })
  }
}

// ── GET /api/feedback/admin/list ────────────────────────────────────────────
const getAdminFeedbackList = async (req, res) => {
  try {
    const {
      search,
      level,
      rating,
      recommendation,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
    } = req.query

    const filter = {}

    if (search) {
      filter.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { courseTitle: { $regex: search, $options: 'i' } },
      ]
    }
    if (level && LEVEL_ORDER.includes(level)) filter.level = level
    if (rating) filter.rating = parseInt(rating, 10)
    if (recommendation) filter.recommendation = recommendation
    if (dateFrom || dateTo) {
      filter.submittedAt = {}
      if (dateFrom) filter.submittedAt.$gte = new Date(dateFrom)
      if (dateTo) {
        const end = new Date(dateTo)
        end.setHours(23, 59, 59, 999)
        filter.submittedAt.$lte = end
      }
    }

    const total = await StudentFeedback.countDocuments(filter)
    const totalPages = Math.ceil(total / Math.max(1, parseInt(limit, 10)))

    const feedbacks = await StudentFeedback.find(filter)
      .sort({ submittedAt: -1 })
      .skip((parseInt(page, 10) - 1) * parseInt(limit, 10))
      .limit(parseInt(limit, 10))
      .lean()

    res.json({
      feedbacks,
      total,
      page: parseInt(page, 10),
      totalPages,
    })
  } catch (err) {
    console.error('getAdminFeedbackList Error:', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// ── GET /api/feedback/admin/analytics ───────────────────────────────────────
const getFeedbackAnalytics = async (req, res) => {
  try {
    const total = await StudentFeedback.countDocuments()

    if (total === 0) {
      return res.json({
        totalFeedback: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        recommendationPercentage: 0,
        mostFavoriteFeature: null,
        mostRequestedFeature: null,
        mostCommonImprovement: null,
        feedbackByCourse: [],
        feedbackByLevel: { beginner: 0, intermediate: 0, advanced: 0 },
      })
    }

    // Rating distribution
    const ratingDist = await StudentFeedback.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ])
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    ratingDist.forEach(r => { ratingDistribution[r._id] = r.count })

    // Average rating
    const avgRatingResult = await StudentFeedback.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ])
    const averageRating = avgRatingResult.length > 0 ? Math.round(avgRatingResult[0].avg * 10) / 10 : 0

    // Recommendation percentage
    const recommendTotal = await StudentFeedback.countDocuments({
      recommendation: { $in: ['অবশ্যই করব', 'সম্ভবত করব'] },
    })
    const recommendationPercentage = total > 0 ? Math.round((recommendTotal / total) * 100) : 0

    // Most selected favorite feature
    const favFeatureResult = await StudentFeedback.aggregate([
      { $unwind: '$favoriteParts' },
      { $group: { _id: '$favoriteParts', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ])
    const mostFavoriteFeature = favFeatureResult.length > 0 ? favFeatureResult[0]._id : null

    // Most common improvement suggestion (simple keyword extraction)
    const improvementResult = await StudentFeedback.aggregate([
      { $match: { improvementSuggestion: { $ne: '' } } },
      { $group: { _id: null, samples: { $push: '$improvementSuggestion' } } },
    ])

    // Feedback by course
    const feedbackByCourse = await StudentFeedback.aggregate([
      { $group: { _id: { courseTitle: '$courseTitle', level: '$level' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])

    // Feedback by level
    const feedbackByLevel = await StudentFeedback.aggregate([
      { $group: { _id: '$level', count: { $sum: 1 } } },
    ])
    const levelBreakdown = { beginner: 0, intermediate: 0, advanced: 0 }
    feedbackByLevel.forEach(l => { levelBreakdown[l._id] = l.count })

    // Most requested future feature (simple keyword extraction)
    const futureFeatureResult = await StudentFeedback.aggregate([
      { $match: { futureFeatures: { $ne: '' } } },
      { $group: { _id: null, samples: { $push: '$futureFeatures' } } },
    ])

    // Common words in improvement suggestions
    const mostCommonImprovement = improvementResult.length > 0
      ? extractCommonPhrase(improvementResult[0].samples)
      : null

    const mostRequestedFeature = futureFeatureResult.length > 0
      ? extractCommonPhrase(futureFeatureResult[0].samples)
      : null

    res.json({
      totalFeedback: total,
      averageRating,
      ratingDistribution,
      recommendationPercentage,
      mostFavoriteFeature,
      mostRequestedFeature,
      mostCommonImprovement,
      feedbackByCourse: feedbackByCourse.map(c => ({
        courseTitle: c._id.courseTitle,
        level: c._id.level,
        count: c.count,
      })),
      feedbackByLevel: levelBreakdown,
    })
  } catch (err) {
    console.error('getFeedbackAnalytics Error:', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

function extractCommonPhrase(samples) {
  if (!samples || samples.length === 0) return null

  const wordCount = {}
  samples.forEach(text => {
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    words.forEach(w => {
      wordCount[w] = (wordCount[w] || 0) + 1
    })
  })

  const sorted = Object.entries(wordCount).sort((a, b) => b[1] - a[1])
  if (sorted.length > 0 && sorted[0][1] > 1) {
    return sorted[0][0]
  }
  return null
}

module.exports = {
  submitFeedback,
  getFeedbackStatus,
  getAdminFeedbackList,
  getFeedbackAnalytics,
}
