const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // High-level category used by the UI for icons/colors and dedupe keys.
    type: {
      type: String,
      required: true,
      enum: [
        'lesson_completed',
        'course_completed',
        'level_unlocked',
        'exam_passed',
        'badge_earned',
        'achievement_earned',
        'xp_milestone',
        'course_unlocked',
        'profile_completed',
        'system',
      ],
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    icon: { type: String, default: 'Bell' }, // lucide-react icon name
    color: { type: String, default: '#1D9E75' }, // accent color (hex)
    link: { type: String, default: '' }, // in-app route to open on click
    read: { type: Boolean, default: false, index: true },
    // Optional dedupe key so each real-world event produces exactly one
    // notification (e.g. "lesson:class-05", "badge:Code Master").
    dedupeKey: { type: String, default: '', index: true },
  },
  { timestamps: true }
)

// Compound index: per-user newest-first listing + fast unread counts.
notificationSchema.index({ userId: 1, createdAt: -1 })
notificationSchema.index({ userId: 1, read: 1 })

module.exports = mongoose.model('Notification', notificationSchema)
