const mongoose = require('mongoose')
const { SupportConversation } = require('../models/SupportConversation')
const { SupportMessage } = require('../models/SupportMessage')

// ── GET /api/support/conversation ───────────────────────────────────────────
// Returns the active (open) support conversation for the authenticated student.
const getStudentConversation = async (req, res) => {
  try {
    const studentId = req.user._id

    let conversation = await SupportConversation.findOne({
      student: studentId,
      status: 'open',
    }).populate('assignedAdmin', 'fullName email role')

    if (!conversation) {
      // Find latest conversation (even if closed) for context
      conversation = await SupportConversation.findOne({
        student: studentId,
      })
        .sort({ updatedAt: -1 })
        .populate('assignedAdmin', 'fullName email role')
    }

    res.status(200).json({ conversation: conversation || null })
  } catch (error) {
    console.error('getStudentConversation Error:', error)
    res.status(500).json({ message: error.message || 'Internal Server Error' })
  }
}

// ── POST /api/support/conversation ──────────────────────────────────────────
// Creates a new open support conversation for the student if none is active.
const createStudentConversation = async (req, res) => {
  try {
    const studentId = req.user._id

    let conversation = await SupportConversation.findOne({
      student: studentId,
      status: 'open',
    }).populate('assignedAdmin', 'fullName email role')

    if (!conversation) {
      conversation = await SupportConversation.create({
        student: studentId,
        status: 'open',
        lastMessage: 'Conversation started',
        lastMessageAt: new Date(),
      })
      await conversation.populate('assignedAdmin', 'fullName email role')
    }

    res.status(201).json({ conversation })
  } catch (error) {
    console.error('createStudentConversation Error:', error)
    res.status(500).json({ message: error.message || 'Internal Server Error' })
  }
}

// ── GET /api/support/messages/:conversationId ────────────────────────────────
// Fetches all messages for a specific conversation with strict ownership checks.
const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params
    const userId = req.user._id
    const userRole = req.user.role

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversation ID format' })
    }

    const conversation = await SupportConversation.findById(conversationId)
    if (!conversation) {
      return res.status(404).json({ message: 'Support conversation not found' })
    }

    // SECURITY: Students can ONLY access their own conversation.
    const isOwner = conversation.student.toString() === userId.toString()
    const isAdmin = userRole === 'admin' || userRole === 'super-admin'

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied: You cannot view another user\'s support conversation' })
    }

    const messages = await SupportMessage.find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .populate('sender', 'fullName email role')
      .lean()

    res.status(200).json({ messages, conversation })
  } catch (error) {
    console.error('getConversationMessages Error:', error)
    res.status(500).json({ message: error.message || 'Internal Server Error' })
  }
}

// ── POST /api/support/message ────────────────────────────────────────────────
// Sends a new message in the support conversation.
const sendStudentMessage = async (req, res) => {
  try {
    const { message, conversationId } = req.body
    const userId = req.user._id
    const userRole = req.user.role || 'student'

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'Message text is required' })
    }

    const trimmedMessage = message.trim()
    if (trimmedMessage.length > 3000) {
      return res.status(400).json({ message: 'Message exceeds maximum length of 3000 characters' })
    }

    let conversation = null

    if (conversationId) {
      if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        return res.status(400).json({ message: 'Invalid conversation ID' })
      }
      conversation = await SupportConversation.findById(conversationId)
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' })
      }

      // SECURITY: Validate ownership
      const isOwner = conversation.student.toString() === userId.toString()
      const isAdmin = userRole === 'admin' || userRole === 'super-admin'
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: 'Access denied: You cannot post to another user\'s conversation' })
      }
    } else {
      // Find active or create new conversation for the student
      conversation = await SupportConversation.findOne({
        student: userId,
        status: 'open',
      })

      if (!conversation) {
        conversation = await SupportConversation.create({
          student: userId,
          status: 'open',
          lastMessage: trimmedMessage,
          lastMessageAt: new Date(),
        })
      }
    }

    // Create SupportMessage
    const newMessage = await SupportMessage.create({
      conversation: conversation._id,
      sender: userId,
      senderRole: userRole,
      message: trimmedMessage,
      read: false,
    })

    // Update Conversation summary & unread count
    const isStudentSender = userRole === 'student'
    const updateOps = {
      $set: {
        lastMessage: trimmedMessage,
        lastMessageAt: new Date(),
        status: 'open', // Re-open if closed and student messages
      },
      $inc: isStudentSender ? { unreadAdmin: 1 } : { unreadStudent: 1 },
    }

    await SupportConversation.findByIdAndUpdate(conversation._id, updateOps)

    const populatedMessage = await SupportMessage.findById(newMessage._id).populate('sender', 'fullName email role')

    res.status(201).json({
      message: 'Message sent successfully',
      data: populatedMessage,
      conversationId: conversation._id.toString(),
    })
  } catch (error) {
    console.error('sendStudentMessage Error:', error)
    res.status(500).json({ message: error.message || 'Internal Server Error' })
  }
}

// ── PATCH /api/support/read ──────────────────────────────────────────────────
// Marks messages in a support conversation as read.
const markMessagesRead = async (req, res) => {
  try {
    const { conversationId } = req.body
    const userId = req.user._id
    const userRole = req.user.role || 'student'

    if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: 'Valid conversationId is required' })
    }

    const conversation = await SupportConversation.findById(conversationId)
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' })
    }

    // SECURITY: Validate ownership
    const isOwner = conversation.student.toString() === userId.toString()
    const isAdmin = userRole === 'admin' || userRole === 'super-admin'
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' })
    }

    // Mark messages as read where sender is NOT the current user
    await SupportMessage.updateMany(
      { conversation: conversationId, sender: { $ne: userId }, read: false },
      { $set: { read: true } }
    )

    // Reset unread count for current user role
    const isStudent = userRole === 'student'
    const resetField = isStudent ? { unreadStudent: 0 } : { unreadAdmin: 0 }
    await SupportConversation.findByIdAndUpdate(conversationId, { $set: resetField })

    res.status(200).json({ message: 'Messages marked as read' })
  } catch (error) {
    console.error('markMessagesRead Error:', error)
    res.status(500).json({ message: error.message || 'Internal Server Error' })
  }
}

module.exports = {
  getStudentConversation,
  createStudentConversation,
  getConversationMessages,
  sendStudentMessage,
  markMessagesRead,
}
