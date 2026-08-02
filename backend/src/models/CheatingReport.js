const mongoose = require('mongoose')

const violationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['tab_switch', 'window_blur', 'copy_paste', 'devtools', 'fullscreen_exit', 'multiple_devices', 'screen_capture', 'other'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
)

const cheatingReportSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SupportConversation',
      default: null,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      default: null,
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
      index: true,
    },
    cheatingScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'confirmed', 'dismissed', 'escalated'],
      default: 'pending',
      index: true,
    },
    violations: [violationSchema],
    totalViolations: {
      type: Number,
      default: 0,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    notes: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, trim: true, maxlength: 1000 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
)

cheatingReportSchema.index({ student: 1, status: 1 })
cheatingReportSchema.index({ student: 1, createdAt: -1 })
cheatingReportSchema.index({ riskLevel: 1, status: 1 })

cheatingReportSchema.pre('save', function (next) {
  this.totalViolations = this.violations.length

  // Calculate cheatingScore based on violation count and severity weights
  const severityWeights = { low: 5, medium: 15, high: 30, critical: 50 }
  let score = 0
  for (const v of this.violations) {
    score += severityWeights[v.severity] || 5
  }
  this.cheatingScore = Math.min(100, score)

  // Auto-determine riskLevel from score
  if (score >= 80) this.riskLevel = 'critical'
  else if (score >= 50) this.riskLevel = 'high'
  else if (score >= 20) this.riskLevel = 'medium'
  else this.riskLevel = 'low'

  next()
})

const CheatingReport = mongoose.model('CheatingReport', cheatingReportSchema)

module.exports = { CheatingReport }
