const { StudentFeedback } = require('../models/StudentFeedback')
const { Feedback } = require('../models/Feedback')
const { User } = require('../models/User')
const { Exam } = require('../models/Exam')
const { Course } = require('../models/Course')
const { auditService } = require('../services/auditService')
const P = require('../services/progressService')

const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced']

function sanitizeFeedback(f) {
  return {
    id: f._id,
    userId: f.userId,
    examId: f.examId,
    courseId: f.courseId,
    level: f.level,
    rating: f.rating,
    comment: f.comment,
    suggestion: f.suggestion,
    status: f.status,
    reply: f.reply,
    repliedBy: f.repliedBy,
    repliedAt: f.repliedAt,
    createdAt: f.createdAt,
    updatedAt: f.updatedAt,
  }
}

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
  if (body.reply && body.reply.length > 2000) {
    errors.push('Reply must not exceed 2000 characters')
  }
  if (body.status && !['Pending', 'Reviewed', 'Resolved'].includes(body.status)) {
    errors.push('Status must be one of: Pending, Reviewed, Resolved')
  }
  return errors
}

// ==================== EXAM FEEDBACK ====================

// @desc    Submit exam feedback
// @route   POST /api/feedback/exam
// @access  Private/Student
const submitExamFeedback = async (req, res) => {
  try {
    const userId = req.user._id
    const { examId, rating, comment, suggestion } = req.body

    if (!examId) {
      return res.status(400).json({ message: 'examId is required' })
    }

    const exam = await Exam.findById(examId)
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const examIdStr = exam._id.toString()

    const isCompleted = (user.completedExams || []).some(id => id.toString() === examIdStr)
    if (!isCompleted) {
      return res.status(403).json({ message: 'You must pass the exam before submitting feedback' })
    }

    const existing = await Feedback.findOne({ userId, examId })
    if (existing) {
      return res.status(409).json({ message: 'Feedback already submitted for this exam' })
    }

    const course = await Course.findById(exam.courseId)
    const courseTitle = course ? course.title : exam.level
    const courseId = course ? course._id : null

    const errors = validateFeedbackBody({ rating, comment, suggestion })
    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join('. ') })
    }

    const feedback = await Feedback.create({
      userId,
      examId,
      courseId: courseId || undefined,
      level: exam.level,
      rating,
      comment: comment.trim(),
      suggestion: (suggestation || '').trim(),
      status: 'Pending',
    })

    auditService.record({
      actorId: userId,
      actorRole: req.user.role,
      action: 'feedback.create',
      category: 'feedback',
      targetType: 'Feedback',
      targetId: feedback._id,
      metadata: { examId, level: exam.level, rating },
      ip: req.ip,
      userAgent: req.get('user-agent'),
    })

    res.status(201).json({
      success: true,
      message: 'Exam feedback submitted successfully',
      data: sanitizeFeedback(feedback),
    })
  } catch (err) {
    console.error('submitExamFeedback Error:', err)
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Feedback already submitted for this exam' })
    }
    res.status(500).json({ message: 'Internal server error' })
  }
}

// @desc    Get my exam feedback
// @route   GET /api/feedback/exam/my
// @access  Private/Student
const getMyExamFeedback = async (req, res) => {
  try {
    const userId = req.user._id
    const { page = 1, limit = 20, status } = req.query

    const filter = { userId }
    if (status && ['Pending', 'Reviewed', 'Resolved'].includes(status)) {
      filter.status = status
    }

    const total = await Feedback.countDocuments(filter)
    const feedbacks = await Feedback.find(filter)
      .populate('examId', 'title level')
      .populate('courseId', 'title')
      .sort({ createdAt: -1 })
      .skip((parseInt(page, 10) - 1) * parseInt(limit, 10))
      .limit(Math.min(100, parseInt(limit, 10)))
      .lean()

    res.json({
      feedbacks,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / Math.max(1, parseInt(limit, 10))),
    })
  } catch (err) {
    console.error('getMyExamFeedback Error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// @desc    Get single exam feedback (admin/super-admin)
// @route   GET /api/feedback/exam/:id
// @access  Private/Admin
const getExamFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('userId', 'fullName username email')
      .populate('examId', 'title level courseId')
      .populate('courseId', 'title')
      .populate('repliedBy', 'fullName username')
      .lean()

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' })
    }

    res.json({ data: feedback })
  } catch (err) {
    console.error('getExamFeedbackById Error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// @desc    Update exam feedback (admin: reply, status change)
// @route   PUT /api/feedback/exam/:id
// @access  Private/Admin
const updateExamFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' })
    }

    const { reply, status } = req.body
    const updateFields = {}

    if (reply !== undefined) {
      if (typeof reply !== 'string' || reply.trim().length === 0) {
        return res.status(400).json({ message: 'Reply must be a non-empty string' })
      }
      if (reply.length > 2000) {
        return res.status(400).json({ message: 'Reply must not exceed 2000 characters' })
      }
      updateFields.reply = reply.trim()
      updateFields.repliedBy = req.user._id
      updateFields.repliedAt = new Date()
    }

    if (status !== undefined) {
      if (!['Pending', 'Reviewed', 'Resolved'].includes(status)) {
        return res.status(400).json({ message: 'Status must be one of: Pending, Reviewed, Resolved' })
      }
      updateFields.status = status
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' })
    }

    const updated = await Feedback.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('repliedBy', 'fullName username')

    const statusChanged = status && status !== feedback.status.toString()

    auditService.record({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: statusChanged ? 'feedback.status_change' : 'feedback.update',
      category: 'feedback',
      targetType: 'Feedback',
      targetId: feedback._id,
      metadata: {
        examId: feedback.examId,
        level: feedback.level,
        previousStatus: feedback.status,
        newStatus: status || feedback.status,
        hasReply: !!updateFields.reply,
      },
      ip: req.ip,
      userAgent: req.get('user-agent'),
    })

    res.json({
      success: true,
      message: 'Feedback updated successfully',
      data: sanitizeFeedback(updated),
    })
  } catch (err) {
    console.error('updateExamFeedback Error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// @desc    Delete exam feedback (super-admin only)
// @route   DELETE /api/feedback/exam/:id
// @access  Private/SuperAdmin
const deleteExamFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' })
    }

    await Feedback.findByIdAndDelete(req.params.id)

    auditService.record({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'feedback.delete',
      category: 'feedback',
      targetType: 'Feedback',
      targetId: feedback._id,
      metadata: {
        examId: feedback.examId,
        level: feedback.level,
        userId: feedback.userId,
      },
      ip: req.ip,
      userAgent: req.get('user-agent'),
    })

    res.json({ message: 'Feedback deleted successfully' })
  } catch (err) {
    console.error('deleteExamFeedback Error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// @desc    Admin list exam feedback with filters
// @route   GET /api/feedback/exam/admin/list
// @access  Private/Admin
const getAdminExamFeedbackList = async (req, res) => {
  try {
    const {
      search,
      level,
      status,
      rating,
      userId,
      examId,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
    } = req.query

    const filter = {}

    if (search) {
      filter.$or = [
        { comment: { $regex: search, $options: 'i' } },
        { suggestion: { $regex: search, $options: 'i' } },
        { reply: { $regex: search, $options: 'i' } },
      ]
    }
    if (level && LEVEL_ORDER.includes(level)) filter.level = level
    if (status && ['Pending', 'Reviewed', 'Resolved'].includes(status)) filter.status = status
    if (rating) filter.rating = parseInt(rating, 10)
    if (userId) filter.userId = userId
    if (examId) filter.examId = examId
    if (dateFrom || dateTo) {
      filter.createdAt = {}
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom)
      if (dateTo) {
        const end = new Date(dateTo)
        end.setHours(23, 59, 59, 999)
        filter.createdAt.$lte = end
      }
    }

    const total = await Feedback.countDocuments(filter)
    const feedbacks = await Feedback.find(filter)
      .populate('userId', 'fullName username email')
      .populate('examId', 'title level')
      .populate('courseId', 'title')
      .sort({ createdAt: -1 })
      .skip((parseInt(page, 10) - 1) * parseInt(limit, 10))
      .limit(Math.min(100, parseInt(limit, 10)))
      .lean()

    res.json({
      feedbacks,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / Math.max(1, parseInt(limit, 10))),
    })
  } catch (err) {
    console.error('getAdminExamFeedbackList Error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// @desc    Admin exam feedback analytics
// @route   GET /api/feedback/exam/admin/analytics
// @access  Private/Admin
const getAdminExamFeedbackAnalytics = async (req, res) => {
  try {
    const total = await Feedback.countDocuments()

    if (total === 0) {
      return res.json({
        totalFeedback: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        statusDistribution: { Pending: 0, Reviewed: 0, Resolved: 0 },
        feedbackByLevel: { beginner: 0, intermediate: 0, advanced: 0 },
        feedbackByCourse: [],
      })
    }

    const ratingDist = await Feedback.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ])
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    ratingDist.forEach(r => { ratingDistribution[r._id] = r.count })

    const avgRatingResult = await Feedback.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ])
    const averageRating = avgRatingResult.length > 0
      ? Math.round(avgRatingResult[0].avg * 10) / 10 : 0

    const statusDist = await Feedback.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])
    const statusDistribution = { Pending: 0, Reviewed: 0, Resolved: 0 }
    statusDist.forEach(s => { statusDistribution[s._id] = s.count })

    const feedbackByLevel = await Feedback.aggregate([
      { $group: { _id: '$level', count: { $sum: 1 } } },
    ])
    const levelBreakdown = { beginner: 0, intermediate: 0, advanced: 0 }
    feedbackByLevel.forEach(l => { levelBreakdown[l._id] = l.count })

    const feedbackByCourse = await Feedback.aggregate([
      { $group: { _id: '$courseId', count: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])

    res.json({
      totalFeedback: total,
      averageRating,
      ratingDistribution,
      statusDistribution,
      feedbackByLevel: levelBreakdown,
      feedbackByCourse: feedbackByCourse.map(c => ({
        courseId: c._id,
        count: c.count,
        averageRating: Math.round(c.avgRating * 10) / 10,
      })),
    })
  } catch (err) {
    console.error('getAdminExamFeedbackAnalytics Error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ==================== PRESERVE EXISTING STUDENT FEEDBACK ====================

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
  submitExamFeedback,
  getMyExamFeedback,
  getExamFeedbackById,
  updateExamFeedback,
  deleteExamFeedback,
  getAdminExamFeedbackList,
  getAdminExamFeedbackAnalytics,
}