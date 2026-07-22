const mongoose = require('mongoose')

const HintLogSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    lessonId: { type: String, default: '' },
    sourceCode: { type: String, required: true },
    errorOutput: { type: String, required: true },
    explanation: { type: String, required: true },
    suggestedFix: { type: String, required: true },
    beginnerGuidance: { type: String, required: true },
    model: { type: String, default: '' },
    latencyMs: { type: Number, default: 0 },
  },
  { timestamps: true },
)

const HintLog = mongoose.models.HintLog || mongoose.model('HintLog', HintLogSchema)
module.exports = { HintLog }
