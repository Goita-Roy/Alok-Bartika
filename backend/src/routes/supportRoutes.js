const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const { supportWriteLimiter } = require('../middleware/rateLimiter')
const {
  getStudentConversation,
  createStudentConversation,
  getConversationMessages,
  sendStudentMessage,
  markMessagesRead,
} = require('../controllers/supportController')

// All support chat endpoints require JWT authentication
router.get('/conversation', protect, getStudentConversation)
router.post('/conversation', protect, supportWriteLimiter, createStudentConversation)
router.get('/messages/:conversationId', protect, getConversationMessages)
router.post('/message', protect, supportWriteLimiter, sendStudentMessage)
router.patch('/read', protect, supportWriteLimiter, markMessagesRead)

module.exports = { supportRouter: router }
