const mongoose = require('mongoose')

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
)

const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema)
module.exports = { Course }

