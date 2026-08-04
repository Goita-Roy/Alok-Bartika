const mongoose = require('mongoose')
const { SupportConversation } = require('../models/SupportConversation')
const { SupportMessage } = require('../models/SupportMessage')
const { getIo } = require('../socket/index')
const { sanitizeMessage } = require('../utils/sanitize')

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
      message: sanitizeMessage(trimmedMessage),
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

    // Broadcast to admin room via socket so admins receive the message in real-time
    try {
      const io = getIo()
      if (io) {
        const updatedConv = await SupportConversation.findById(conversation._id).lean()
        const broadcastPayload = {
          conversationId: conversation._id.toString(),
          studentId: conversation.student.toString(),
          message: populatedMessage.toObject ? populatedMessage.toObject() : populatedMessage,
          clientMessageId: clientMessageId || undefined,
          unreadStudent: updatedConv.unreadStudent,
          unreadAdmin: updatedConv.unreadAdmin,
        }
        io.to('admin-support').emit('receive_message', broadcastPayload)
      }
    } catch (broadcastErr) {
      console.error('broadcast receive_message error:', broadcastErr)
    }

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
// Supports searching by student name, email, and message text.
const getAdminConversations = async (req, res) => {
  try {
    const { status, search, page = '1', limit = '50' } = req.query

    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50))
    const skip = (pageNum - 1) * limitNum

    const searchTerm = search && search.trim() ? search.trim() : null

    let conversations
    let total

    if (searchTerm) {
      // Use aggregation to search across student name, email, and message text
      const matchStage = {}
      if (status && ['open', 'pending', 'resolved', 'closed'].includes(status)) {
        matchStage.status = status
      }

      const pipeline = [
        // Search messages by text and get matching conversation IDs
        {
          $lookup: {
            from: 'supportmessages',
            let: { convId: '$_id' },
            pipeline: [
              { $match: { $expr: { $eq: ['$conversation', '$$convId'] }, message: { $regex: searchTerm, $options: 'i' } } },
              { $limit: 1 },
            ],
            as: 'matchedMessages',
          },
        },
        // Also search by student name/email via lookup to User collection
        {
          $lookup: {
            from: 'users',
            localField: 'student',
            foreignField: '_id',
            as: '_student',
          },
        },
        { $unwind: { path: '$_student', preserveNullAndEmptyArrays: true } },
        {
          $match: {
            $or: [
              { 'matchedMessages.0': { $exists: true } },
              { '_student.fullName': { $regex: searchTerm, $options: 'i' } },
              { '_student.email': { $regex: searchTerm, $options: 'i' } },
            ],
            ...matchStage,
          },
        },
        // Clean up temporary fields
        { $project: { matchedMessages: 0, _student: 0 } },
        // Sort: pinned first, then by most recent activity
        { $sort: { pinned: -1, updatedAt: -1 } },
        // Get total count before pagination
        { $facet: {
          metadata: [{ $count: 'total' }],
          data: [{ $skip: skip }, { $limit: limitNum }],
        }},
      ]

      const [result] = await SupportConversation.aggregate(pipeline)
      total = result.metadata[0]?.total ?? 0
      conversations = result.data

      // Populate student and assignedAdmin
      await SupportConversation.populate(conversations, { path: 'student', model: 'User', select: 'fullName email profilePicture' })
      await SupportConversation.populate(conversations, { path: 'assignedAdmin', model: 'User', select: 'fullName email' })
    } else {
      // No search term — use simple query with status filter
      const filter = {}
      if (status && ['open', 'pending', 'resolved', 'closed'].includes(status)) {
        filter.status = status
      }

      conversations = await SupportConversation.find(filter)
        .populate('student', 'fullName email profilePicture')
        .populate('assignedAdmin', 'fullName email')
        .sort({ pinned: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean()

      total = await SupportConversation.countDocuments(filter)
    }

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

// ── PATCH /api/support/admin/conversations/:id/pin ───────────────────────
// Admin-only: toggle pin/unpin a conversation.
const toggleConversationPin = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid conversation ID' })
    }

    const conversation = await SupportConversation.findById(id)
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' })
    }

    conversation.pinned = !conversation.pinned
    await conversation.save()

    const populated = await SupportConversation.findById(id)
      .populate('student', 'fullName email profilePicture')
      .populate('assignedAdmin', 'fullName email')
      .lean()

    res.status(200).json({ conversation: populated })
  } catch (error) {
    console.error('toggleConversationPin Error:', error)
    res.status(500).json({ message: error.message || 'Internal Server Error' })
  }
}

// ── GET /api/support/admin/messages/:conversationId/search ────────────────
// Admin-only: search messages within a specific conversation.
const searchConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params
    const { q } = req.query

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversation ID' })
    }

    if (!q || !q.trim()) {
      return res.status(400).json({ message: 'Search query is required' })
    }

    const searchTerm = q.trim()

    const messages = await SupportMessage.find({
      conversation: conversationId,
      message: { $regex: searchTerm, $options: 'i' },
    })
      .populate('sender', 'fullName email role')
      .sort({ createdAt: 1 })
      .lean()

    res.status(200).json({ messages, total: messages.length })
  } catch (error) {
    console.error('searchConversationMessages Error:', error)
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
  toggleConversationPin,
  searchConversationMessages,
}
