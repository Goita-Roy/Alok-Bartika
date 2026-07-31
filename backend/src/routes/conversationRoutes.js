const express = require('express')
const router = express.Router()
const {
  listConversations, getConversation, createConversation, updateConversation, deleteConversation, addMessage,
} = require('../controllers/conversationController')
const { protect } = require('../middleware/auth')

// Conversation memory endpoints. All routes are authenticated (`protect`); the
// controller additionally scopes every query to `req.user._id` so a user can
// only read/modify their own conversations.
// Mount this router at /api/ai (full paths: /api/ai/conversations, ...).
router.get('/conversations', protect, listConversations)
router.get('/conversations/:id', protect, getConversation)
router.post('/conversations', protect, createConversation)
router.patch('/conversations/:id', protect, updateConversation)
router.delete('/conversations/:id', protect, deleteConversation)
router.post('/conversations/:id/messages', protect, addMessage)

module.exports = { conversationRouter: router }
