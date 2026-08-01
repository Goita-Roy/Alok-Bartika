const mongoose = require('mongoose')

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    suggestion: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Reviewed', 'Resolved'],
      default: 'Pending',
      index: true,
    },
    reply: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    repliedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

feedbackSchema.index({ userId: 1, examId: 1 }, { unique: true })
feedbackSchema.index({ userId: 1, status: 1 })
feedbackSchema.index({ examId: 1, status: 1 })
feedbackSchema.index({ courseId: 1, status: 1 })
feedbackSchema.index({ level: 1, status: 1 })
feedbackSchema.index({ createdAt: -1 })

const Feedback = mongoose.model('Feedback', feedbackSchema)

module.exports = { Feedback }