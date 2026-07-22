const { User } = require('../models/User')

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getWeekStart() {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  return monday
}

// PATCH /api/learning/tick — called every ~60s
async function tickMinutes(req, res) {
  try {
    const { minutes, tabSwitches } = req.body
    const m = Math.max(0, Math.round(minutes || 0))
    const ts = Math.max(0, Math.round(tabSwitches || 0))
    if (m <= 0 && ts <= 0) return res.status(200).json({ ok: true })

    const userId = req.user._id
    const today = todayStr()
    const now = new Date()

    // Accumulate totals + activity timestamp atomically. The daily-log entry is
    // updated via a positional update when today's entry already exists; if not,
    // it is pushed (capped to the last 90 days). These atomic writes operate on
    // the current DB state, so concurrent progression saves no longer cause a
    // Mongoose VersionError on this same User document.
    const incBase = {
      'learningAnalytics.totalMinutes': m,
      'learningAnalytics.weeklyMinutes': m,
    }

    const existing = await User.updateOne(
      { _id: userId, 'learningAnalytics.dailyLogs.date': today },
      {
        $inc: { ...incBase, 'learningAnalytics.dailyLogs.$.minutes': m, 'learningAnalytics.dailyLogs.$.tabSwitches': ts },
        $set: { 'learningAnalytics.lastActiveAt': now },
      }
    )

    if (existing.matchedCount === 0) {
      await User.updateOne(
        { _id: userId },
        {
          $inc: incBase,
          $set: { 'learningAnalytics.lastActiveAt': now },
          $push: {
            'learningAnalytics.dailyLogs': {
              $each: [{ date: today, minutes: m, tabSwitches: ts }],
              $slice: -90,
            },
          },
        }
      )
    }

    const user = await User.findById(userId).select('learningAnalytics')
    if (!user) return res.status(404).json({ message: 'User not found' })

    const la = user.learningAnalytics || {}
    const entry = Array.isArray(la.dailyLogs) ? la.dailyLogs.find(d => d.date === today) : null

    res.status(200).json({
      totalMinutes: la.totalMinutes || 0,
      weeklyMinutes: la.weeklyMinutes || 0,
      todayMinutes: entry?.minutes || 0,
      todayTabSwitches: entry?.tabSwitches || 0,
      dailyLogs: la.dailyLogs,
      lastActiveAt: la.lastActiveAt,
    })
  } catch (err) {
    console.error('[learning/tick]', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/learning/stats
async function getLearningStats(req, res) {
  try {
    const userId = req.user._id
    const user = await User.findById(userId).select('learningAnalytics')
    if (!user) return res.status(404).json({ message: 'User not found' })

    const la = user.learningAnalytics || {}
    const today = todayStr()
    const todayLog = Array.isArray(la.dailyLogs) ? la.dailyLogs.find(d => d.date === today) : null

    res.status(200).json({
      totalMinutes: la.totalMinutes || 0,
      weeklyMinutes: la.weeklyMinutes || 0,
      todayMinutes: todayLog?.minutes || 0,
      todayTabSwitches: todayLog?.tabSwitches || 0,
      dailyLogs: (la.dailyLogs || []).slice(-14),
      lastActiveAt: la.lastActiveAt || null,
    })
  } catch (err) {
    console.error('[learning/stats]', err)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { tickMinutes, getLearningStats }
