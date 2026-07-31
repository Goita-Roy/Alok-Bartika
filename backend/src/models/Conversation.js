const mongoose = require('mongoose')

// Message subdocument — one turn in the conversation. `role` mirrors the shape
// the AI providers expect ({ role: 'user'|'assistant', content }), with
// 'system' allowed for injected system turns.
const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ['user', 'assistant', 'system'],
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
)

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: 'New Chat',
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    archived: {
      type: Boolean,
      default: false,
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
)

// Per-user newest-first listing.
conversationSchema.index({ userId: 1, updatedAt: -1 })
// Pinned section ordering + archive filtering, both newest-first.
conversationSchema.index({ userId: 1, pinned: 1, updatedAt: -1 })
conversationSchema.index({ userId: 1, archived: 1, updatedAt: -1 })

const Conversation = mongoose.model('Conversation', conversationSchema)

module.exports = { Conversation }
