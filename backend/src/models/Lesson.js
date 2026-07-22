const mongoose = require('mongoose')

const lessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      trim: true,
    },
    videoUrl: {
      type: String,
      trim: true,
    },
    audioUrl: {
      type: String,
      trim: true,
    },
    codingProblem: {
      type: String, // This could be a description or a reference to a problem
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    level: {
      // Mirrors Course.level so the canonical slug can be derived directly from
      // the lesson without an extra populate. Beginner: "class-0N"; intermediate:
      // "intermediate-*"; advanced: "advanced-*".
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      trim: true,
      index: true,
    },
    slug: {
      // Canonical client-facing identifier for this lesson. The backend owns its
      // assignment (deterministic from `level`+`order`) so that every API,
      // browser and device agrees on ONE lesson id. Beginner: "class-01"…"class-10";
      // intermediate: "intermediate-algorithm"…; advanced: "advanced-hello-world"….
      type: String,
      trim: true,
      index: true,
    },
    htmlUrl: {
      type: String,
      trim: true,
    },
    language: {
      type: String,
      default: 'python',
      trim: true,
    },
    starterCode: {
      type: String,
      trim: true,
    },
    expectedOutput: {
      type: String,
      trim: true,
    },
    practice: {
      title: { type: String, trim: true },
      description: { type: String, trim: true },
      objectives: [{ type: String, trim: true }],
      instructions: [{ type: String, trim: true }],
      starterCode: { type: String, trim: true, default: '' },
      expectedOutput: { type: String, trim: true },
      hints: [{ type: String, trim: true }],
      difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    },
  },
  {
    timestamps: true,
  }
)

const Lesson = mongoose.model('Lesson', lessonSchema)

module.exports = { Lesson }
