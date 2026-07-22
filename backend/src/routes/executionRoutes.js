const express = require('express')
const router = express.Router()
const { executeCode } = require('../controllers/executionController')
const { protect } = require('../middleware/auth')

// Protect execution endpoint
router.post('/', protect, executeCode)

module.exports = { executionRouter: router }
