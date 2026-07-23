const express = require('express')
const router = express.Router()
const { getTestById, submitTest, exportResults } = require('../controllers/testController')
const { protect, requireAdmin } = require('../middleware/auth')

router.use(protect)

router.get('/export', requireAdmin, exportResults)
router.get('/:id', getTestById)
router.post('/:id/submit', submitTest)

module.exports = { testRouter: router }
