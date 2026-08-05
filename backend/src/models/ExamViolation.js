const mongoose = require('mongoose')

// Reusable per-event anti-cheat log for exam monitoring.
//
// Every event records a single proctoring incident during an exam attempt:
//   - studentId  → the student who committed the event
//   - examId     → the exam being taken
//   - eventType  → the kind of event (see EVENT_TYPES)
//   - timestamp  → when it happened
//   - metadata   → free-form extra detail (e.g. copied text snippet, key combo)
//
// The monitoring module aggregates these events into per-attempt timelines,
// summary counters and count-based risk tiers. New intake paths (student
// anti-cheat hooks, sockets, etc.) can write to this collection without any
// schema change.
const EVENT_TYPES = [
  'tab_switch',
  'fullscreen_exit',
  'copy',
  'paste',
  'right_click',
  'devtools',
  'window_blur',
  'keyboard_shortcut',
  'multiple_monitor',
]

const examViolationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    eventType: {
      type: String,
      enum: EVENT_TYPES,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
)

// ── Database indexes ────────────────────────────────────────────────────────
// Monitoring reads group by student and filter by exam + time window.
examViolationSchema.index({ studentId: 1, timestamp: -1 })
examViolationSchema.index({ examId: 1, timestamp: -1 })
examViolationSchema.index({ timestamp: -1 })

const ExamViolation = mongoose.model('ExamViolation', examViolationSchema)

module.exports = { ExamViolation, EVENT_TYPES }
