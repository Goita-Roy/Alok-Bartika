const mongoose = require('mongoose')

const ProgressSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    courseId: { type: String, required: true, index: true },
    lessonId: { type: String, required: true, index: true },
    completedAt: { type: Date, default: null },
    modes: {
      reading: { type: Boolean, default: false },
      video: { type: Boolean, default: false },
      practice: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
)

ProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true })

const Progress = mongoose.models.Progress || mongoose.model('Progress', ProgressSchema)
module.exports = { Progress }

