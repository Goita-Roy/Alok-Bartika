const mongoose = require('mongoose')

// A single automated test case. `input` is piped to program stdin (or the
// function argument string), `expectedOutput` is compared (trimmed, with
// trailing-newline tolerance) against the program's stdout.
const testCaseSchema = new mongoose.Schema({
  input: { type: String, default: '' },
  expectedOutput: { type: String, default: '' },
  // Free-form description shown to the student for VISIBLE cases only.
  description: { type: String, default: '' },
}, { _id: false })

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['mcq', 'truefalse', 'code-output', 'coding'],
    default: 'mcq',
  },
  questionText: { type: String, required: true, trim: true },
  // For mcq / truefalse / code-output — options array
  options: [{ type: String, trim: true }],
  // Index into options[] for mcq/truefalse, or exact string for code-output.
  // For coding questions this field is no longer used for grading.
  correctAnswer: { type: mongoose.Schema.Types.Mixed, default: null },
  // Shown during review
  explanation: { type: String, trim: true, default: '' },

  // ── Coding-question fields (ignored for mcq / truefalse / code-output) ──
  // Programming language for this coding question.
  language: {
    type: String,
    enum: ['python', 'javascript', 'cpp', 'java', 'c'],
    default: 'python',
  },
  // Starter code shown in the editor.
  starterCode: { type: String, default: '' },
  // Reference solution (hidden — never sent to the client) used to:
  //   - validate the test-suite authoring (self-test at seed time)
  //   - provide an authored explanation of the intended approach
  solutionCode: { type: String, default: '', select: false },
  // Optional single expected output (legacy / code-output style).
  expectedOutput: { type: String, default: '' },
  // Sample I/O shown to the student as a worked example.
  sampleInput: { type: String, default: '' },
  sampleOutput: { type: String, default: '' },
  // Automated grading test cases.
  visibleTestCases: { type: [testCaseSchema], default: [] },
  hiddenTestCases: { type: [testCaseSchema], default: [] },
  // Execution constraints (overridable per question, fall back to global defaults).
  timeLimitMs: { type: Number, default: 2000, min: 100 },
  memoryLimitMb: { type: Number, default: 256, min: 16 },
  // Difficulty tag for analytics / UI.
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy',
  },

  // Point value for this question (default 1)
  points: { type: Number, default: 1, min: 1 },
})

const examSchema = new mongoose.Schema(
  {
    // Which course this exam belongs to
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    // Which level this exam unlocks/tests
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    // Percentage needed to pass (0-100)
    passingScore: { type: Number, default: 60, min: 0, max: 100 },
    // 0 means no time limit
    timeLimitMinutes: { type: Number, default: 30, min: 0 },
    questions: [questionSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

const Exam = mongoose.model('Exam', examSchema)
module.exports = { Exam }
