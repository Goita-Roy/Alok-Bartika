const express = require('express')
const router = express.Router()
const { getTestById, submitTest, exportResults } = require('../controllers/testController')
const { protect, requireRole } = require('../middleware/auth')

router.use(protect)

router.get('/export', requireRole('admin'), exportResults)
router.get('/:id', getTestById)
router.post('/:id/submit', submitTest)

module.exports = { testRouter: router }
