const express = require('express')
const router = express.Router()
const {
  getLessonsByCourse,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson
} = require('../controllers/lessonController')
const { protect, requireRole } = require('../middleware/auth')

// Public routes
router.get('/course/:courseId', getLessonsByCourse)
router.get('/:id', getLessonById)

// Admin only routes
router.post('/', protect, requireRole('admin'), createLesson)
router.put('/:id', protect, requireRole('admin'), updateLesson)
router.delete('/:id', protect, requireRole('admin'), deleteLesson)

module.exports = { lessonRouter: router }
