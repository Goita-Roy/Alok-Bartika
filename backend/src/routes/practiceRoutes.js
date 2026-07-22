const express = require('express')
const router = express.Router()
const {
  startPractice, savePractice, completePractice, getPractice, resumePractice, getSummary,
} = require('../controllers/practiceController')
const { protect } = require('../middleware/auth')

// All practice endpoints are authenticated; MongoDB is the single source of truth.
router.post('/start', protect, startPractice)
router.post('/save', protect, savePractice)
router.post('/complete', protect, completePractice)
router.get('/resume', protect, resumePractice)
router.get('/summary', protect, getSummary)
router.get('/:key', protect, getPractice)

module.exports = { practiceRouter: router }
