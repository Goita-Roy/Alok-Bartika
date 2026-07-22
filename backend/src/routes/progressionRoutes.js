const express = require('express')
const router = express.Router()
const {
  getProgress,
  completeLesson,
  completeCourse,
  unlockCourse,
  saveLastVisited,
  saveNote,
  completePractice,
} = require('../controllers/progressionController')
const { protect } = require('../middleware/auth')

router.get('/', protect, getProgress)
router.post('/complete-lesson', protect, completeLesson)
router.post('/complete-course', protect, completeCourse)
router.post('/unlock', protect, unlockCourse)
router.post('/last-visited', protect, saveLastVisited)
router.post('/note', protect, saveNote)
router.post('/complete-practice', protect, completePractice)

module.exports = { progressionRouter: router }
