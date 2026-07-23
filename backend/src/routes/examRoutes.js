const express = require('express')
const router = express.Router()
const {
  getExamByLevel,
  getExamById,
  submitExam,
  terminateExam,
  getUserExamAttempts,
  getExamReview,
  getFirstAttemptResults,
  createExam,
  updateExam,
} = require('../controllers/examController')
const { protect, requireAdmin } = require('../middleware/auth')

// Student routes
router.get('/level/:level', protect, getExamByLevel)
// Read-only reporting route — must be declared before '/:examId'
router.get('/results/first-attempts', protect, getFirstAttemptResults)
router.get('/:examId', protect, getExamById)
router.post('/:examId/submit', protect, submitExam)
router.post('/:examId/terminate', protect, terminateExam)
router.get('/:examId/attempts', protect, getUserExamAttempts)
router.get('/:examId/review', protect, getExamReview)

// Admin routes
router.post('/', protect, requireAdmin, createExam)
router.put('/:examId', protect, requireAdmin, updateExam)

module.exports = { examRouter: router }
