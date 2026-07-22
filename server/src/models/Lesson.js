const mongoose = require('mongoose')

const LessonSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    order: { type: Number, default: 0, index: true },
    reading: {
      markdown: { type: String, required: true },
    },
    video: {
      url: { type: String, default: '' },
    },
    practice: {
      prompt: { type: String, required: true },
      starterCode: { type: String, default: '' },
    },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
)

LessonSchema.index({ courseId: 1, slug: 1 }, { unique: true })

const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', LessonSchema)
module.exports = { Lesson }

