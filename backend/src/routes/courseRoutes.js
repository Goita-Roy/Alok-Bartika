const express = require('express')
const router = express.Router()
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  bulkDeleteCourses
} = require('../controllers/courseController')
const { protect, requireAdmin } = require('../middleware/auth')

// Public routes
router.get('/', getAllCourses)
router.get('/:id', getCourseById)

// Admin only routes
router.post('/', protect, requireAdmin, createCourse)
router.post('/bulk/delete', protect, requireAdmin, bulkDeleteCourses)
router.put('/:id', protect, requireAdmin, updateCourse)
router.delete('/:id', protect, requireAdmin, deleteCourse)

module.exports = { courseRouter: router }
