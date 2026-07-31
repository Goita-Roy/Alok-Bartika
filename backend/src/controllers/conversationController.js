const mongoose = require('mongoose')
const { Conversation } = require('../models/Conversation')

const DEFAULT_TITLE = 'New Chat'
const MAX_TITLE_LENGTH = 80
const ALLOWED_ROLES = ['user', 'assistant', 'system']

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id)
}

// GET /api/ai/conversations — list the authenticated user's conversations,
// newest first, without the full message bodies.
const listConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .select('-messages')
      .lean()
    res.json({ conversations })
  } catch (err) {
    console.error('listConversations Error:', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// GET /api/ai/conversations/:id — a single conversation including its messages.
const getConversation = async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidId(id)) return res.status(404).json({ message: 'Conversation not found' })
    const conversation = await Conversation.findOne({ _id: id, userId: req.user._id })
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' })
    res.json({ conversation })
  } catch (err) {
    console.error('getConversation Error:', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// POST /api/ai/conversations — create a new empty conversation for the user.
const createConversation = async (req, res) => {
  try {
    const rawTitle = req.body && req.body.title
    const title = (typeof rawTitle === 'string' ? rawTitle.trim() : '') || DEFAULT_TITLE
    const conversation = await Conversation.create({
      userId: req.user._id,
      title: title.slice(0, MAX_TITLE_LENGTH),
    })
    res.status(201).json({ conversation })
  } catch (err) {
    console.error('createConversation Error:', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// PATCH /api/ai/conversations/:id — update title / pinned / archived.
const updateConversation = async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidId(id)) return res.status(404).json({ message: 'Conversation not found' })
    const body = req.body || {}
    const patch = {}
    if (typeof body.title === 'string') {
      const trimmed = body.title.trim()
      patch.title = trimmed ? trimmed.slice(0, MAX_TITLE_LENGTH) : DEFAULT_TITLE
    }
    if (typeof body.pinned === 'boolean') patch.pinned = body.pinned
    if (typeof body.archived === 'boolean') patch.archived = body.archived

    const conversation = await Conversation.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: patch },
      { new: true, runValidators: true },
    )
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' })
    res.json({ conversation })
  } catch (err) {
    console.error('updateConversation Error:', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// DELETE /api/ai/conversations/:id
const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidId(id)) return res.status(404).json({ message: 'Conversation not found' })
    const deleted = await Conversation.findOneAndDelete({ _id: id, userId: req.user._id })
    if (!deleted) return res.status(404).json({ message: 'Conversation not found' })
    res.json({ message: 'Conversation deleted' })
  } catch (err) {
    console.error('deleteConversation Error:', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// POST /api/ai/conversations/:id/messages — append a message turn.
const addMessage = async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidId(id)) return res.status(404).json({ message: 'Conversation not found' })

    const body = req.body || {}
    const role = body.role || 'user'
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid message role' })
    }
    const content = typeof body.content === 'string' ? body.content.trim() : ''
    if (!content) return res.status(400).json({ message: 'Message content is required' })

    const conversation = await Conversation.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $push: { messages: { role, content } } },
      { new: true, runValidators: true },
    )
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' })

    // Auto-title from the first message when no custom title was set.
    if (conversation.messages.length === 1 && conversation.title === DEFAULT_TITLE) {
      conversation.title = content.slice(0, MAX_TITLE_LENGTH)
      await conversation.save()
    }

    res.status(201).json({ conversation })
  } catch (err) {
    console.error('addMessage Error:', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = {
  listConversations,
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation,
  addMessage,
}
