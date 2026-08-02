const mongoose = require('mongoose')

const supportConversationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['open', 'pending', 'resolved', 'closed'],
      default: 'open',
      index: true,
    },
    lastMessage: {
      type: String,
      default: '',
      trim: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    unreadStudent: {
      type: Number,
      default: 0,
      min: 0,
    },
    unreadAdmin: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
)

supportConversationSchema.index({ student: 1, status: 1 })
supportConversationSchema.index({ updatedAt: -1 })

const SupportConversation = mongoose.model('SupportConversation', supportConversationSchema)

module.exports = { SupportConversation }
