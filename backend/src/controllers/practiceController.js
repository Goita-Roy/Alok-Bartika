const PS = require('../services/practiceService')

// POST /api/practice/start  { key?, language?, lesson? }
const startPractice = async (req, res) => {
  try {
    const { key, language, lesson } = req.body || {}
    const state = await PS.startPractice(req.user._id, key || lesson || 'sandbox', { language, lesson })
    if (!state) return res.status(404).json({ message: 'User not found' })
    res.json({ message: 'started', state })
  } catch (err) {
    console.error('startPractice Error:', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// POST /api/practice/save  { key?, files?, language?, lesson?, code?, timeSpent?, score?, cursor?, scroll?, completed? }
const savePractice = async (req, res) => {
  try {
    const b = req.body || {}
    const key = b.key || b.lesson || 'sandbox'
    const saved = await PS.savePractice(req.user._id, key, {
      files: b.files,
      language: b.language,
      lesson: b.lesson,
      code: b.code,
      timeSpent: b.timeSpent,
      score: b.score,
      cursor: b.cursor,
      scroll: b.scroll,
      completed: b.completed,
      activeFileId: b.activeFileId,
    })
    if (!saved) return res.status(404).json({ message: 'User not found' })
    res.json({ message: 'saved', state: saved })
  } catch (err) {
    console.error('savePractice Error:', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// POST /api/practice/complete  { key?, lesson?, language?, files?, code?, timeSpent?, score? }
const completePractice = async (req, res) => {
  try {
    const b = req.body || {}
    const key = b.key || b.lesson || 'sandbox'
    const result = await PS.completePractice(req.user._id, key, {
      lesson: b.lesson,
      language: b.language,
      files: b.files,
      code: b.code,
      timeSpent: b.timeSpent,
      score: b.score,
      activeFileId: b.activeFileId,
    })
    if (result.error) return res.status(404).json({ message: 'User not found' })
    res.json(result)
  } catch (err) {
    console.error('completePractice Error:', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// GET /api/practice/:key
const getPractice = async (req, res) => {
  try {
    const state = await PS.getPractice(req.user._id, req.params.key)
    res.json({ state })
  } catch (err) {
    console.error('getPractice Error:', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// GET /api/practice/resume  -> most recent unfinished practice
const resumePractice = async (req, res) => {
  try {
    const state = await PS.resumePractice(req.user._id)
    res.json({ state })
  } catch (err) {
    console.error('resumePractice Error:', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// GET /api/practice/summary  -> dashboard counts
const getSummary = async (req, res) => {
  try {
    const summary = await PS.getSummary(req.user._id)
    res.json(summary)
  } catch (err) {
    console.error('getPracticeSummary Error:', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = {
  startPractice, savePractice, completePractice, getPractice, resumePractice, getSummary,
}
