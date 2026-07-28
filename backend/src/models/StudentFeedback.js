const mongoose = require('mongoose')

const studentFeedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    courseTitle: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    examScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    // ── Feedback fields ──
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    courseExperience: {
      type: String,
      required: true,
      enum: ['অসাধারণ', 'ভালো', 'মোটামুটি', 'উন্নতির প্রয়োজন'],
    },
    learnedSomething: {
      type: String,
      required: true,
      enum: ['হ্যাঁ, অনেক কিছু শিখেছি', 'কিছুটা শিখেছি', 'খুব বেশি শিখতে পারিনি'],
    },
    lessonUnderstanding: {
      type: String,
      required: true,
      enum: ['সম্পূর্ণ বুঝেছি', 'বেশিরভাগ বুঝেছি', 'আরও সহজ করা দরকার'],
    },
    favoriteParts: {
      type: [String],
      default: [],
    },
    improvementSuggestion: {
      type: String,
      required: true,
      trim: true,
    },
    futureFeatures: {
      type: String,
      trim: true,
      default: '',
    },
    recommendation: {
      type: String,
      required: true,
      enum: ['অবশ্যই করব', 'সম্ভবত করব', 'নিশ্চিত নই', 'না, করব না'],
    },
    additionalSuggestion: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: { createdAt: 'submittedAt', updatedAt: 'updatedAt' },
  }
)

studentFeedbackSchema.index({ userId: 1, level: 1 }, { unique: true })
studentFeedbackSchema.index({ userId: 1 })
studentFeedbackSchema.index({ level: 1 })
studentFeedbackSchema.index({ rating: 1 })
studentFeedbackSchema.index({ recommendation: 1 })
studentFeedbackSchema.index({ submittedAt: -1 })

const StudentFeedback = mongoose.model('StudentFeedback', studentFeedbackSchema)

module.exports = { StudentFeedback }
