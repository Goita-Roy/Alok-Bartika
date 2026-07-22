const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // Index of the correct option
})

const testSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['pre-test', 'post-test'],
      required: true,
    },
    questions: [questionSchema],
  },
  {
    timestamps: true,
  }
)

const Test = mongoose.model('Test', testSchema)

module.exports = { Test }
