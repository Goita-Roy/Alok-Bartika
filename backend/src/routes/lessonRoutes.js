const express = require('express')
const router = express.Router()
const {
  getLessonsByCourse,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson
} = require('../controllers/lessonController')
const { protect, requireAdmin } = require('../middleware/auth')

// Public routes
router.get('/course/:courseId', getLessonsByCourse)
router.get('/:id', getLessonById)

// Admin only routes
router.post('/', protect, requireAdmin, createLesson)
router.put('/:id', protect, requireAdmin, updateLesson)
router.delete('/:id', protect, requireAdmin, deleteLesson)

module.exports = { lessonRouter: router }
