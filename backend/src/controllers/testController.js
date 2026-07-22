const { Test } = require('../models/Test')
const { User } = require('../models/User')

// @desc    Get test by ID
// @route   GET /api/tests/:id
const getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
    if (!test) return res.status(404).json({ message: 'Test not found' })
    res.status(200).json({ data: test })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching test' })
  }
}

// @desc    Submit test answers
// @route   POST /api/tests/:id/submit
const submitTest = async (req, res) => {
  try {
    const { answers } = req.body // Array of selected option indices
    const clerkId = req.auth?.userId

    const test = await Test.findById(req.params.id)
    if (!test) return res.status(404).json({ message: 'Test not found' })

    const user = await User.findOne({ clerkId })
    if (!user) return res.status(404).json({ message: 'User not found' })

    // Calculate score
    let score = 0
    test.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        score++
      }
    })

    // Save result
    user.testResults.push({
      courseId: test.courseId,
      testId: test._id,
      type: test.type,
      score,
      totalQuestions: test.questions.length,
    })

    // Award XP for taking a test
    user.xp += 200 
    await user.save()

    res.status(200).json({ 
      message: 'Test submitted', 
      score, 
      total: test.questions.length,
      data: user 
    })
  } catch (error) {
    console.error('Submit Test Error:', error)
    res.status(500).json({ message: 'Error submitting test' })
  }
}

// @desc    Export results as CSV (Admin only)
// @route   GET /api/tests/export
const exportResults = async (req, res) => {
  try {
    const users = await User.find({}).populate('testResults.courseId', 'title')
    
    let csv = 'Student Name,Email,Course,Test Type,Score,Total,Date\n'
    
    users.forEach(user => {
      user.testResults.forEach(result => {
        csv += `${user.name},${user.email},${result.courseId?.title || 'Unknown'},${result.type},${result.score},${result.totalQuestions},${result.takenAt.toISOString()}\n`
      })
    })

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=test_results.csv')
    res.status(200).send(csv)
  } catch (error) {
    console.error('Export Error:', error)
    res.status(500).json({ message: 'Error exporting results' })
  }
}

module.exports = {
  getTestById,
  submitTest,
  exportResults,
}
