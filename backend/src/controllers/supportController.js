const mongoose = require('mongoose')
const { SupportConversation } = require('../models/SupportConversation')
const { SupportMessage } = require('../models/SupportMessage')

function sanitizeMessage(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
}

// ── Conversation ownership validation ──────────────────────────────────
// Ensures the authenticated user owns the conversation (or is admin/super-admin).
// Returns 403 if a student tries to access another student's conversation.
const validateConversationOwnership = async (req, res, next) => {
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

    const isOwner = conversation.student.toString() === userId.toString()
    const isAdmin = userRole === 'admin' || userRole === 'super-admin'

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied: You cannot access another user\'s support conversation' })
    }

    // Attach conversation to req for downstream handlers
    req.supportConversation = conversation
    next()
  } catch (error) {
    console.error('validateConversationOwnership Error:', error)
    res.status(500).json({ message: error.message || 'Internal Server Error' })
  }
}

function sanitizeMessage(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
}

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
// Fetches all messages for a specific conversation. Ownership is validated
// by the validateConversationOwnership middleware before this handler runs.
const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params
    const userId = req.user._id
    const userRole = req.user.role

    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100)
    const before = req.query.before || null

    // Conversation was already fetched and validated by middleware
    const conversation = req.supportConversation

    // Build query filter
    const query = { conversation: conversationId }
    if (before) {
      query.createdAt = { $lt: new Date(before) }
    }

    const messages = await SupportMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'fullName email role')
      .lean()

    // Reverse so oldest messages come first (matches previous behavior)
    messages.reverse()

    // Determine if there are more older messages
    const hasMore = messages.length === limit

    res.status(200).json({ messages, conversation, hasMore })
  } catch (error) {
    console.error('getConversationMessages Error:', error)
    res.status(500).json({ message: error.message || 'Internal Server Error' })
  }
}

// ── POST /api/support/message ────────────────────────────────────────────────
// Sends a new message in the support conversation.
const sendStudentMessage = async (req, res) => {
  try {
    const { message, conversationId, clientMessageId } = req.body
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
      clientMessageId: clientMessageId || undefined,
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

// ── GET /api/support/admin/conversations ──────────────────────────────────
// Admin-only endpoint: list all support conversations with search and filter.
const getAdminConversations = async (req, res) => {
  try {
    const { status, search, page = '1', limit = '50' } = req.query

    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50))
    const skip = (pageNum - 1) * limitNum

    const filter = {}

    if (status && ['open', 'pending', 'resolved', 'closed'].includes(status)) {
      filter.status = status
    }

    if (search && search.trim()) {
      const searchTerm = search.trim()
      // Search by student name or email via population
      filter.$or = [
        { 'student.fullName': { $regex: searchTerm, $options: 'i' } },
        { 'student.email': { $regex: searchTerm, $options: 'i' } },
      ]
    }

    const conversations = await SupportConversation.find(filter)
      .populate('student', 'fullName email profilePicture')
      .populate('assignedAdmin', 'fullName email')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean()

    const total = await SupportConversation.countDocuments(filter)

    res.status(200).json({
      conversations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    console.error('getAdminConversations Error:', error)
    res.status(500).json({ message: error.message || 'Internal Server Error' })
  }
}

// ── PATCH /api/support/admin/conversations/:id/status ──────────────────────
// Admin-only: update conversation status (open/closed).
const updateConversationStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid conversation ID' })
    }

    if (!status || !['open', 'pending', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Status must be open, pending, or resolved' })
    }

    const conversation = await SupportConversation.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true },
    ).populate('student', 'fullName email')

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' })
    }

    res.status(200).json({ conversation })
  } catch (error) {
    console.error('updateConversationStatus Error:', error)
    res.status(500).json({ message: error.message || 'Internal Server Error' })
  }
}

module.exports = {
  getStudentConversation,
  createStudentConversation,
  getConversationMessages,
  sendStudentMessage,
  markMessagesRead,
  validateConversationOwnership,
  getAdminConversations,
  updateConversationStatus,
}
