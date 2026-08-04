const express = require('express')
const router = express.Router()
const {
  getAllLessons,
  getLessonsByCourse,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  duplicateLesson,
  reorderLessons,
  bulkUpdateStatus,
  bulkDeleteLessons
} = require('../controllers/lessonController')
const { protect, requireAdmin } = require('../middleware/auth')

// Public routes
router.get('/', getAllLessons)
router.get('/course/:courseId', getLessonsByCourse)
router.get('/:id', getLessonById)

// Admin only routes
router.post('/', protect, requireAdmin, createLesson)
router.post('/reorder', protect, requireAdmin, reorderLessons)
router.post('/bulk/status', protect, requireAdmin, bulkUpdateStatus)
router.post('/bulk/delete', protect, requireAdmin, bulkDeleteLessons)
router.post('/:id/duplicate', protect, requireAdmin, duplicateLesson)
router.put('/:id', protect, requireAdmin, updateLesson)
router.delete('/:id', protect, requireAdmin, deleteLesson)

module.exports = { lessonRouter: router }
