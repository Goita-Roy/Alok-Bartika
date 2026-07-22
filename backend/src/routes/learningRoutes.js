const express = require('express')
const router = express.Router()
const { tickMinutes, getLearningStats } = require('../controllers/learningController')
const { protect } = require('../middleware/auth')

router.patch('/tick', protect, tickMinutes)
router.get('/stats', protect, getLearningStats)

module.exports = { learningRouter: router }
