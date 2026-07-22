const mongoose = require('mongoose')

// Persistent, append-only log of every coding-submission evaluation.
// Stored (not returned to the client) so admins can audit scores, execution
// metrics and failures without coupling to the User.examAttempts document.
const codingSubmissionLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', index: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, index: true },
    // Question index within the exam (stable ordering for review).
    questionIndex: { type: Number },
    language: { type: String },
    // Submission timestamp (set explicitly so we can index/sort reliably).
    submissionTime: { type: Date, default: Date.now, index: true },

    // Judge result (see CodingEvaluationService JUDGE_STATUS).
    status: { type: String }, // e.g. accepted, partial, wrong_answer, ...
    score: { type: Number, default: 0 },
    passedTests: { type: Number, default: 0 },
    failedTests: { type: Number, default: 0 },
    totalTests: { type: Number, default: 0 },

    executionTimeMs: { type: Number, default: 0 },
    memoryUsedMb: { type: Number, default: 0 },

    compileError: { type: String, default: '' },
    runtimeError: { type: String, default: '' },
    timeout: { type: Boolean, default: false },
    memoryExceeded: { type: Boolean, default: false },

    // Anti-cheat signal: e.g. 'empty', 'whitespace_only', 'comments_only',
    // 'hardcoded_sample', 'random_text'. Empty string == genuine code.
    antiCheatFlag: { type: String, default: '' },
    // True when the submission was rejected (did not earn any credit).
    rejected: { type: Boolean, default: false },
  },
  { timestamps: true }
)

const CodingSubmissionLog = mongoose.model('CodingSubmissionLog', codingSubmissionLogSchema)
module.exports = { CodingSubmissionLog }
