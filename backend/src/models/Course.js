const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    description: {
      type: String,
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
)

// ── Database indexes ────────────────────────────────────────────────────────
// Courses are listed/filtered by level (dashboard course map, admin screens):
// Course.find({}).sort({ level: 1 }) and Course.find({ level }).
courseSchema.index({ level: 1 })

const Course = mongoose.model('Course', courseSchema)

module.exports = { Course }
