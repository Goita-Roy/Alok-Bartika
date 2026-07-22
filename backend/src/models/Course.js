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
  },
  {
    timestamps: true,
  }
)

const Course = mongoose.model('Course', courseSchema)

module.exports = { Course }
