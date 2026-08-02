const express = require('express')
const router = express.Router()
const { protect, requireSupportRole, requireAdmin } = require('../middleware/auth')
const { supportWriteLimiter } = require('../middleware/rateLimiter')
const {
  getStudentConversation,
  createStudentConversation,
  getConversationMessages,
  sendStudentMessage,
  markMessagesRead,
  validateConversationOwnership,
  getAdminConversations,
  updateConversationStatus,
  toggleConversationPin,
} = require('../controllers/supportController')

// Student-facing support chat endpoints
router.get('/conversation', protect, requireSupportRole, getStudentConversation)
router.post('/conversation', protect, requireSupportRole, supportWriteLimiter, createStudentConversation)
router.get('/messages/:conversationId', protect, requireSupportRole, validateConversationOwnership, getConversationMessages)
router.post('/message', protect, requireSupportRole, supportWriteLimiter, sendStudentMessage)
router.patch('/read', protect, requireSupportRole, supportWriteLimiter, markMessagesRead)

// Admin-only conversation management endpoints
router.get('/admin/conversations', protect, requireAdmin, getAdminConversations)
router.patch('/admin/conversations/:id/status', protect, requireAdmin, updateConversationStatus)
router.patch('/admin/conversations/:id/pin', protect, requireAdmin, toggleConversationPin)

module.exports = { supportRouter: router }
