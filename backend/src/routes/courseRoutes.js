const express = require('express')
const router = express.Router()
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courseController')
const { protect, requireRole } = require('../middleware/auth')

// Public routes
router.get('/', getAllCourses)
router.get('/:id', getCourseById)

// Admin only routes
router.post('/', protect, requireRole('admin'), createCourse)
router.put('/:id', protect, requireRole('admin'), updateCourse)
router.delete('/:id', protect, requireRole('admin'), deleteCourse)

module.exports = { courseRouter: router }
