const { executeCode } = require('../services/codingEvaluationService')

// Language id mapping kept for backward compatibility with the old
// /api/execute contract (Judge0-style ids). Mapped to our engine languages.
const LANG_ID_MAP = {
  71: 'python',
  63: 'javascript',
  54: 'cpp', // C++ (Judge0 g++17)
  62: 'java', // Java
  50: 'c', // C (Judge0 gcc)
}

// @desc    Execute code locally (practice IDE / quick run)
// @route   POST /api/execute
// @access  Private
// Delegates ALL execution to the centralized CodingEvaluationService so there
// is a single grading/execution engine. No duplicate logic lives here.
const executeCodeController = async (req, res) => {
  try {
    const { source_code, language_id = 71, stdin = '' } = req.body

    if (!source_code) {
      return res.status(400).json({ message: 'Source code is required' })
    }

    const language = LANG_ID_MAP[language_id] || 'python'

    const result = await executeCode({ source_code, language, stdin })

    if (res.headersSent) return
    res.status(200).json(result)
  } catch (error) {
    console.error('Execution Controller Error:', error)
    if (res.headersSent) return
    res.status(500).json({ message: 'Internal Server Error', error: error.message })
  }
}

module.exports = { executeCode: executeCodeController }
