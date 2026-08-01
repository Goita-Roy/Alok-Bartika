const { StudentFeedback } = require('../models/StudentFeedback')
const { User } = require('../models/User')
const { Exam } = require('../models/Exam')
const { Course } = require('../models/Course')
const P = require('../services/progressService')

const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced']

function validateFeedbackBody(body) {
  const errors = []
  if (!body.rating || body.rating < 1 || body.rating > 5) {
    errors.push('Rating must be between 1 and 5')
  }
  if (!body.comment || body.comment.trim().length < 10) {
    errors.push('Comment must be at least 10 characters long')
  }
  if (body.comment && body.comment.length > 2000) {
    errors.push('Comment must not exceed 2000 characters')
  }
  if (body.suggestion && body.suggestion.length > 2000) {
    errors.push('Suggestion must not exceed 2000 characters')
  }
  return errors
}

// ==================== STUDENT FEEDBACK ====================

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

    if (!LEVEL_ORDER.includes(level)) {
      return res.status(400).json({ message: 'Invalid level' })
    }

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const exam = await Exam.findOne({ level, isActive: true })
    if (!exam) return res.status(404).json({ message: 'Exam not found for this level' })

    const examIdStr = exam._id.toString()

    const isCompleted = (user.completedExams || []).some(id => id.toString() === examIdStr)
    if (!isCompleted) {
      return res.status(403).json({ message: 'You must pass the exam before submitting feedback' })
    }

    const existing = await StudentFeedback.findOne({ userId, level })
    if (existing) {
      return res.status(409).json({ message: 'Feedback already submitted for this level' })
    }

    const attempts = (user.examAttempts && user.examAttempts.get(examIdStr)) || []
    const lastPassed = [...attempts].reverse().find(a => a.passed)
    const examScore = lastPassed ? lastPassed.score : 0

    const course = await Course.findOne({ level }).sort({ createdAt: 1 })
    const courseTitle = course ? course.title : level
    const courseId = course ? course._id : null

    const errors = []
    if (!rating || rating < 1 || rating > 5) errors.push('Rating is required and must be between 1 and 5')
    if (!courseExperience) errors.push('Course experience is required')
    if (!learnedSomething) errors.push('Learned something is required')
    if (!lessonUnderstanding) errors.push('Lesson understanding is required')
    if (!improvementSuggestion || improvementSuggestion.trim().length < 20) {
      errors.push('Improvement suggestion must be at least 20 characters')
    }
    if (!recommendation) errors.push('Recommendation is required')

    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join('. ') })
    }

    const feedback = await StudentFeedback.create({
      userId,
      studentName: user.fullName || 'Anonymous',
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

    if (!user.feedbackSubmittedLevels) user.feedbackSubmittedLevels = []
    if (!user.feedbackSubmittedLevels.includes(level)) {
      user.feedbackSubmittedLevels.push(level)
    }
    user.pendingFeedback = null
    await user.save()

    await P.repairUser(userId)
    await P.syncLevel(userId)

    const updatedUser = await User.findById(userId)
    const nextLevel = LEVEL_ORDER[LEVEL_ORDER.indexOf(level) + 1] || null
    const nextLevelUnlocked = nextLevel ? (updatedUser.unlockedLevels || []).includes(nextLevel) : false

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      nextLevelUnlocked,
      nextLevel,
    })
  } catch (err) {
    console.error('submitFeedback Error:', err)
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Feedback already submitted for this level' })
    }
    res.status(500).json({ message: 'Internal server error' })
  }
}

const getFeedbackStatus = async (req, res) => {
  try {
    const userId = req.user._id
    const { level } = req.params

    if (!LEVEL_ORDER.includes(level)) {
      return res.status(400).json({ message: 'Invalid level' })
    }

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

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
    res.status(500).json({ message: 'Internal server error' })
  }
}

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
    const feedbacks = await StudentFeedback.find(filter)
      .sort({ submittedAt: -1 })
      .skip((parseInt(page, 10) - 1) * parseInt(limit, 10))
      .limit(parseInt(limit, 10))
      .lean()

    res.json({
      feedbacks,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / Math.max(1, parseInt(limit, 10))),
    })
  } catch (err) {
    console.error('getAdminFeedbackList Error:', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

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

    const ratingDist = await StudentFeedback.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ])
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    ratingDist.forEach(r => { ratingDistribution[r._id] = r.count })

    const avgRatingResult = await StudentFeedback.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ])
    const averageRating = avgRatingResult.length > 0 ? Math.round(avgRatingResult[0].avg * 10) / 10 : 0

    const recommendTotal = await StudentFeedback.countDocuments({
      recommendation: { $in: ['Excellent', 'Very Good', 'Good'] },
    })
    const recommendationPercentage = total > 0 ? Math.round((recommendTotal / total) * 100) : 0

    const favFeatureResult = await StudentFeedback.aggregate([
      { $unwind: '$favoriteParts' },
      { $group: { _id: '$favoriteParts', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ])
    const mostFavoriteFeature = favFeatureResult.length > 0 ? favFeatureResult[0]._id : null

    const improvementResult = await StudentFeedback.aggregate([
      { $match: { improvementSuggestion: { $ne: '' } } },
      { $group: { _id: null, samples: { $push: '$improvementSuggestion' } } },
    ])

    const feedbackByCourse = await StudentFeedback.aggregate([
      { $group: { _id: { courseTitle: '$courseTitle', level: '$level' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])

    const feedbackByLevel = await StudentFeedback.aggregate([
      { $group: { _id: '$level', count: { $sum: 1 } } },
    ])
    const levelBreakdown = { beginner: 0, intermediate: 0, advanced: 0 }
    feedbackByLevel.forEach(l => { levelBreakdown[l._id] = l.count })

    const futureFeatureResult = await StudentFeedback.aggregate([
      { $match: { futureFeatures: { $ne: '' } } },
      { $group: { _id: null, samples: { $push: '$futureFeatures' } } },
    ])

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