const mongoose = require('mongoose')
const { complete } = require('../services/ai')
const { AIApiError } = require('../services/ai/errors')
const { CHAT_SYSTEM_PROMPT, HINT_SYSTEM_PROMPT } = require('../services/ai/prompts')
const { Conversation } = require('../models/Conversation')

// ── Input guards ──────────────────────────────────────────────────────
// Cap every text field so a single request can't blow up token cost.
const MAX_CODE_LENGTH = 5000
const MAX_PROBLEM_LENGTH = 2000
const MAX_MESSAGE_LENGTH = 1000
const MAX_HISTORY_LENGTH = 20
const MAX_HINT_TOKENS = 150
const MAX_CHAT_TOKENS = 500
const DEFAULT_TITLE = 'New Chat'
const MAX_TITLE_LENGTH = 80

// Strip control characters (keeps prompts clean) and clamp length.
function sanitizeText(value, maxLen) {
  if (typeof value !== 'string') return ''
  const cleaned = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim()
  return cleaned.slice(0, maxLen)
}

function handleAIError(err, res) {
  if (err instanceof AIApiError) {
    return res.status(err.statusCode || 500).json({ message: err.message })
  }
  console.error('[ai] controller error:', err)
  return res.status(500).json({ message: 'AI service error. Please try again.' })
}

// @desc    Get AI hint for a coding problem
// @route   POST /api/ai/hint
// @access  Private
const getHint = async (req, res) => {
  try {
    const code = sanitizeText(req.body && req.body.code, MAX_CODE_LENGTH)
    const error = sanitizeText(req.body && req.body.error, MAX_CODE_LENGTH)
    const problemDescription = sanitizeText(req.body && req.body.problemDescription, MAX_PROBLEM_LENGTH)

    if (!code && !problemDescription) {
      return res.status(400).json({ message: 'Please provide your code or a problem description' })
    }

    const userPrompt = `Problem Description: ${problemDescription || 'None'}
My Code:
${code || 'None'}

Error Message: ${error || 'None'}

Can you give me a hint on what might be wrong or what I should do next?`

    const hint = await complete({
      system: HINT_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
      maxTokens: MAX_HINT_TOKENS,
      temperature: 0.7,
    })

    res.status(200).json({ hint })
  } catch (err) {
    handleAIError(err, res)
  }
}

// @desc    Chat with the AI Buddy
// @route   POST /api/ai/chat
// @access  Private
const chat = async (req, res) => {
  try {
    const message = sanitizeText(req.body && req.body.message, MAX_MESSAGE_LENGTH)
    if (!message) {
      return res.status(400).json({ message: 'Please enter a message' })
    }

    // Optional conversation history — replayed for context, capped & sanitized.
    // Kept identical so existing /api/ai/chat clients keep working.
    const messages = []
    const rawHistory = Array.isArray(req.body && req.body.history) ? req.body.history : []
    for (const item of rawHistory.slice(0, MAX_HISTORY_LENGTH)) {
      const role = item && (item.role === 'user' ? 'user' : item.role === 'assistant' ? 'assistant' : null)
      const content = sanitizeText(item && item.content, MAX_MESSAGE_LENGTH)
      if (role && content) messages.push({ role, content })
    }
    messages.push({ role: 'user', content: message })

    // ── Conversation memory ────────────────────────────────────────────────
    // Resolve the conversation this turn belongs to: an explicitly requested
    // (and owned) conversation, otherwise the user's most recent active
    // conversation, otherwise a brand-new auto-created one.
    const userId = req.user._id
    const body = req.body || {}
    let conversation = null
    if (body.conversationId) {
      if (!mongoose.Types.ObjectId.isValid(body.conversationId)) {
        return res.status(404).json({ message: 'Conversation not found' })
      }
      conversation = await Conversation.findOne({ _id: body.conversationId, userId })
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' })
      }
    } else {
      conversation = await Conversation.findOne({ userId, archived: false }).sort({ updatedAt: -1 })
      if (!conversation) {
        conversation = await Conversation.create({ userId, title: DEFAULT_TITLE })
      }
    }

    const hadMessages = conversation.messages.length > 0

    // Persist the user message (timestamps bump `updatedAt` automatically).
    conversation = await Conversation.findByIdAndUpdate(
      conversation._id,
      { $push: { messages: { role: 'user', content: message } } },
      { new: true },
    )

    const content = await complete({
      system: CHAT_SYSTEM_PROMPT,
      messages,
      maxTokens: MAX_CHAT_TOKENS,
      temperature: 0.7,
    })

    // Persist the AI reply.
    conversation = await Conversation.findByIdAndUpdate(
      conversation._id,
      { $push: { messages: { role: 'assistant', content } } },
      { new: true },
    )

    // Auto-generate the title from the first user message.
    if (!hadMessages && conversation.title === DEFAULT_TITLE) {
      conversation.title = message.slice(0, MAX_TITLE_LENGTH)
      await conversation.save()
    }

    res.status(200).json({ content, conversationId: String(conversation._id), conversation })
  } catch (err) {
    handleAIError(err, res)
  }
}

module.exports = { getHint, chat }
