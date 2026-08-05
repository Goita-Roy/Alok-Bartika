const { User } = require('../models/User')
const { Exam } = require('../models/Exam')
const { ExamViolation, EVENT_TYPES } = require('../models/ExamViolation')

// ── Display labels / categories ─────────────────────────────────────────────
const EVENT_LABELS = {
  tab_switch: 'Tab switched',
  fullscreen_exit: 'Fullscreen exited',
  copy: 'Copy attempted',
  paste: 'Paste attempted',
  right_click: 'Right click attempted',
  devtools: 'DevTools opened',
  window_blur: 'Window blurred',
  keyboard_shortcut: 'Keyboard shortcut attempted',
  multiple_monitor: 'Multiple monitors detected',
}

const SUMMARY_DEFS = [
  { key: 'tabSwitch', event: 'tab_switch', label: 'Tab Switches' },
  { key: 'fullscreenExit', event: 'fullscreen_exit', label: 'Fullscreen Exits' },
  { key: 'copy', event: 'copy', label: 'Copy Attempts' },
  { key: 'paste', event: 'paste', label: 'Paste Attempts' },
  { key: 'rightClick', event: 'right_click', label: 'Right Click Attempts' },
  { key: 'windowBlur', event: 'window_blur', label: 'Window Blur' },
  { key: 'devtools', event: 'devtools', label: 'DevTools Detection' },
  { key: 'keyboardShortcut', event: 'keyboard_shortcut', label: 'Keyboard Shortcut Attempts' },
  { key: 'multipleMonitor', event: 'multiple_monitor', label: 'Multiple Monitor' },
]

// ── Weighted risk scoring (single source of truth) ──────────────────────────
// Every event type carries a severity weight. A student's Total Risk Score is
// the sum of the weights of all their events; the risk level is derived from
// that score, not from the raw event count. All consumers (overview, activities,
// detail and export) reuse computeRisk() — logic is never duplicated.
const EVENT_WEIGHTS = {
  right_click: 1,
  keyboard_shortcut: 2,
  copy: 2,
  paste: 2,
  tab_switch: 3,
  window_blur: 3,
  fullscreen_exit: 4,
  devtools: 5,
  multiple_monitor: 8,
}
const weightOf = (eventType) => EVENT_WEIGHTS[eventType] || 1

// Risk levels by Total Risk Score: 0 Clean, 1-9 Low, 10-19 Medium, 20+ High.
const riskTier = (score) => {
  if (score === 0) return 'clean'
  if (score <= 9) return 'low'
  if (score <= 19) return 'medium'
  return 'high'
}

const RISK_BADGES = {
  clean: 'Clean',
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
}

const computeRisk = (events) => {
  const totalScore = events.reduce((sum, e) => sum + weightOf(e.eventType), 0)
  const level = riskTier(totalScore)
  return {
    violationsCount: events.length,
    totalScore,
    riskScore: Math.min(100, totalScore),
    risk: level,
    riskBadge: RISK_BADGES[level],
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const mapEntries = (mapOrObj) => {
  if (!mapOrObj) return []
  if (typeof mapOrObj.entries === 'function') return Array.from(mapOrObj.entries())
  return Object.entries(mapOrObj)
}

const timeOf = (doc) => {
  if (!doc) return Date.now()
  if (doc.timestamp) return new Date(doc.timestamp).getTime()
  if (doc.takenAt) return new Date(doc.takenAt).getTime()
  return Date.now()
}

const formatDuration = (seconds) => {
  const s = Math.max(0, Math.floor(Number(seconds) || 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  if (h > 0) return `${h}h ${m}m ${r}s`
  if (m > 0) return `${m}m ${r}s`
  return `${r}s`
}

const formatTime = (date) => {
  const d = date ? new Date(date) : new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// Time window (ms) an attempt occupies, used to attribute violation events to
// the right attempt. Falls back to the exam's time limit, then 2 hours.
const windowFor = (attempt, exam) => {
  const duration = Number(attempt && attempt.timeTakenSeconds)
  if (duration > 0) return duration * 1000
  const limit = Number(exam && exam.timeLimitMinutes)
  if (limit > 0) return limit * 60 * 1000
  return 2 * 60 * 60 * 1000
}

const normalizeEvent = (v) => ({
  timestamp: v.timestamp || null,
  eventType: v.eventType,
  eventLabel: EVENT_LABELS[v.eventType] || v.eventType,
  timeLabel: formatTime(v.timestamp),
  severity: weightOf(v.eventType),
  metadata: v.metadata && typeof v.metadata === 'object' ? v.metadata : {},
})

const buildActivity = (student, exam, attempt, events, index) => {
  const submittedMs = timeOf(attempt)
  const submittedAt = new Date(submittedMs)
  const durationSeconds =
    Number(attempt.timeTakenSeconds) > 0 ? Math.round(attempt.timeTakenSeconds) : 0
  const startedAt = new Date(submittedMs - windowFor(attempt, exam))
  const score = typeof attempt.score === 'number' ? attempt.score : 0
  const terminated = attempt.terminated === true
  const { violationsCount, riskScore, risk, riskBadge } = computeRisk(events)

  return {
    id: `${student._id}~${exam._id}~${submittedMs}~${index}`,
    student: {
      id: student._id,
      fullName: student.fullName,
      email: student.email,
      profilePicture: student.profilePicture || null,
    },
    exam: { id: exam._id, title: exam.title, level: exam.level },
    level: exam.level,
    startedAt: startedAt.toISOString(),
    submittedAt: submittedAt.toISOString(),
    durationSeconds,
    durationLabel: formatDuration(durationSeconds),
    score,
    passed: attempt.passed === true,
    status: terminated ? 'terminated' : 'completed',
    terminationReason: attempt.terminationReason || null,
    violationsCount,
    risk,
    riskScore,
    riskBadge,
    events: events.map(normalizeEvent),
  }
}

// Loads every student attempt plus its attributed cheating events, and returns
// a flat list of monitoring rows. Violation events are attributed to the
// attempt whose time window contains them; unclaimed events go to the student's
// most recent attempt for that exam so nothing is ever dropped.
async function buildActivityContext() {
  const [students, exams, violations] = await Promise.all([
    User.find({ role: 'student' })
      .select('fullName email username phone profilePicture createdAt examAttempts')
      .lean(),
    Exam.find({})
      .select('title level passingScore timeLimitMinutes description')
      .lean(),
    ExamViolation.find({}).sort({ timestamp: 1 }).lean(),
  ])

  const examMap = new Map(exams.map((e) => [e._id.toString(), e]))
  const violationByStudent = new Map()
  for (const v of violations) {
    const key = v.studentId ? v.studentId.toString() : ''
    if (!key) continue
    if (!violationByStudent.has(key)) violationByStudent.set(key, [])
    violationByStudent.get(key).push(v)
  }

  const activities = []

  for (const student of students) {
    const studentViolations = violationByStudent.get(student._id.toString()) || []

    for (const [examIdStr, list] of mapEntries(student.examAttempts)) {
      if (!Array.isArray(list)) continue
      // Attempts are mandatory rows: never hide one, even if its exam was
      // deleted from the exams collection. Fall back to placeholder exam info.
      const exam = examMap.get(String(examIdStr)) || {
        _id: examIdStr,
        title: 'Deleted exam',
        level: 'unknown',
        passingScore: 60,
        timeLimitMinutes: 60,
        description: '',
      }

      const examViolations = studentViolations
        .filter((v) => v.examId && String(v.examId) === String(examIdStr))
        .sort((a, b) => timeOf(a) - timeOf(b))

      // Attribute events to attempts by time window; leftover → latest attempt.
      let remaining = [...examViolations]
      const indexed = list
        .map((a, i) => ({ a, i }))
        .filter((x) => x.a && typeof x.a === 'object')
      const sorted = [...indexed].sort((x, y) => timeOf(x.a) - timeOf(y.a))
      const assigned = new Map()

      for (const { a, i } of sorted) {
        const submittedMs = timeOf(a)
        const startMs = submittedMs - windowFor(a, exam)
        const mine = []
        const rest = []
        for (const v of remaining) {
          const t = timeOf(v)
          if (t >= startMs && t <= submittedMs) mine.push(v)
          else rest.push(v)
        }
        assigned.set(i, mine)
        remaining = rest
      }

      if (remaining.length > 0 && sorted.length > 0) {
        const lastIndex = sorted[sorted.length - 1].i
        assigned.set(lastIndex, [...(assigned.get(lastIndex) || []), ...remaining])
      }

      for (const { a, i } of indexed) {
        activities.push(buildActivity(student, exam, a, assigned.get(i) || [], i))
      }
    }
  }

  return { activities }
}

const applyFilters = (activities, query) => {
  const {
    search,
    status,
    level,
    risk,
    dateFrom,
    dateTo,
  } = query || {}

  let filtered = activities

  if (search && String(search).trim()) {
    const q = String(search).trim().toLowerCase()
    filtered = filtered.filter(
      (a) =>
        (a.student.fullName && a.student.fullName.toLowerCase().includes(q)) ||
        (a.student.email && a.student.email.toLowerCase().includes(q))
    )
  }

  if (status && status !== 'all') {
    if (status === 'flagged') filtered = filtered.filter((a) => a.violationsCount > 0)
    else if (status === 'running') filtered = filtered.filter((a) => a.status === 'running')
    else filtered = filtered.filter((a) => a.status === status)
  }

  if (level && level !== 'all') {
    filtered = filtered.filter((a) => a.level === level)
  }

  if (risk && risk !== 'all') {
    filtered = filtered.filter((a) => a.risk === risk)
  }

  if (dateFrom) {
    const from = new Date(dateFrom)
    from.setHours(0, 0, 0, 0)
    filtered = filtered.filter((a) => new Date(a.submittedAt).getTime() >= from.getTime())
  }

  if (dateTo) {
    const to = new Date(dateTo)
    to.setHours(23, 59, 59, 999)
    filtered = filtered.filter((a) => new Date(a.submittedAt).getTime() <= to.getTime())
  }

  return filtered
}

// ── GET /api/admin/exam-monitoring/overview ─────────────────────────────────
const getExamMonitoringOverview = async (_req, res) => {
  try {
    // Attempts are the mandatory source of truth; violations are optional and
    // only raise the flag/risk counts. No violations ⇒ 0 flagged, 0 high risk.
    const { activities } = await buildActivityContext()

    const totalAttempts = activities.length
    const running = activities.filter((a) => a.status === 'running').length

    // Flagged = students with Low/Medium/High risk; High Risk = students whose
    // risk is High only.
    const flaggedStudents = new Set()
    const highRiskStudents = new Set()
    activities.forEach((a) => {
      if (a.risk !== 'clean') flaggedStudents.add(a.student.id)
      if (a.risk === 'high') highRiskStudents.add(a.student.id)
    })

    res.json({
      data: {
        totalAttempts,
        running,
        flagged: flaggedStudents.size,
        highRisk: highRiskStudents.size,
      },
    })
  } catch (error) {
    console.error('Exam Monitoring Overview Error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ── GET /api/admin/exam-monitoring/activities ───────────────────────────────
const getExamMonitoringActivities = async (req, res) => {
  try {
    const { page = '1', limit = '25' } = req.query
    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25))

    const { activities } = await buildActivityContext()
    const filtered = applyFilters(activities, req.query)

    filtered.sort((a, b) => {
      const d = new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      if (d !== 0) return d
      return (a.student.fullName || '').localeCompare(b.student.fullName || '')
    })

    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / limitNum))
    const safePage = Math.min(pageNum, totalPages)
    const skip = (safePage - 1) * limitNum
    const rows = filtered.slice(skip, skip + limitNum).map(({ events, ...rest }) => rest)

    res.json({
      data: {
        activities: rows,
        pagination: {
          page: safePage,
          limit: limitNum,
          total,
          pages: totalPages,
        },
      },
    })
  } catch (error) {
    console.error('Exam Monitoring Activities Error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ── GET /api/admin/exam-monitoring/activities/:id ───────────────────────────
const getExamMonitoringActivityDetail = async (req, res) => {
  try {
    const { id } = req.params
    const parts = String(id || '').split('~')
    const [studentId, examId, takenAtMs, index] = parts

    const { activities } = await buildActivityContext()
    const activity = activities.find(
      (a) =>
        String(a.student.id) === String(studentId) &&
        String(a.exam.id) === String(examId) &&
        String(new Date(a.submittedAt).getTime()) === String(takenAtMs) &&
        String(a.id.split('~')[3]) === String(index)
    )

    if (!activity) {
      return res.status(404).json({ message: 'Exam activity not found' })
    }

    const exam = await Exam.findById(activity.exam.id).lean()
    const student = await User.findById(activity.student.id)
      .select('fullName email username phone profilePicture createdAt')
      .lean()

    const summary = {}
    SUMMARY_DEFS.forEach((d) => {
      summary[d.key] = activity.events.filter((e) => e.eventType === d.event).length
    })

    res.json({
      data: {
        activity: {
          ...activity,
          student: {
            id: student._id,
            fullName: student.fullName,
            email: student.email,
            username: student.username || '',
            phone: student.phone || '',
            profilePicture: student.profilePicture || null,
            createdAt: student.createdAt || null,
          },
          exam: {
            id: exam._id,
            title: exam.title,
            level: exam.level,
            passingScore: exam.passingScore,
            timeLimitMinutes: exam.timeLimitMinutes,
            description: exam.description || '',
            questionsCount: Array.isArray(exam.questions) ? exam.questions.length : 0,
          },
          risk: {
            level: activity.risk,
            badge: activity.riskBadge,
            score: activity.riskScore,
            count: activity.violationsCount,
          },
          summary,
          events: activity.events,
        },
      },
    })
  } catch (error) {
    console.error('Exam Monitoring Activity Detail Error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ── GET /api/admin/exam-monitoring/export?format=csv|xls ────────────────────
const exportExamMonitoring = async (req, res) => {
  try {
    const format = req.query.format === 'xls' ? 'xls' : 'csv'
    const { activities } = await buildActivityContext()
    const filtered = applyFilters(activities, req.query)
    filtered.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())

    const esc = (value) => {
      const s = value == null ? '' : String(value)
      return `"${s.replace(/"/g, '""')}"`
    }

    const header = [
      'Student', 'Email', 'Exam', 'Level', 'Started At', 'Submitted At',
      'Duration', 'Score', 'Result', 'Status', 'Violations', 'Risk',
    ].map(esc).join(',')

    const lines = filtered.map((a) =>
      [
        a.student.fullName || '',
        a.student.email || '',
        a.exam.title || '',
        a.level || '',
        a.startedAt ? new Date(a.startedAt).toLocaleString() : '',
        a.submittedAt ? new Date(a.submittedAt).toLocaleString() : '',
        a.durationLabel,
        a.score,
        a.passed ? 'Pass' : 'Fail',
        a.status,
        a.violationsCount,
        a.riskBadge,
      ].map(esc).join(',')
    )

    const csv = [header, ...lines].join('\r\n')
    const safeDate = new Date().toISOString().slice(0, 10)

    if (format === 'xls') {
      res.setHeader('Content-Type', 'application/vnd.ms-excel; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="exam-monitoring-${safeDate}.xls"`)
      return res.send('\uFEFF' + csv)
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="exam-monitoring-${safeDate}.csv"`)
    res.send(csv)
  } catch (error) {
    console.error('Exam Monitoring Export Error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ── POST /api/admin/exam-monitoring/violations ──────────────────────────────
// Reusable intake for proctoring events. Kept independent of the student exam
// flow so future anti-cheat hooks / sockets can write to ExamViolation without
// touching existing exam functionality.
const ingestExamViolation = async (req, res) => {
  try {
    const { studentId, examId, eventType, timestamp, metadata } = req.body || {}

    if (!studentId || !examId || !eventType) {
      return res.status(400).json({ message: 'studentId, examId and eventType are required' })
    }
    if (!EVENT_TYPES.includes(eventType)) {
      return res.status(400).json({ message: `eventType must be one of: ${EVENT_TYPES.join(', ')}` })
    }

    const doc = await ExamViolation.create({
      studentId,
      examId,
      eventType,
      timestamp: timestamp ? new Date(timestamp) : undefined,
      metadata: metadata && typeof metadata === 'object' ? metadata : {},
    })

    res.status(201).json({ data: doc })
  } catch (error) {
    console.error('Exam Violation Ingest Error:', error)
    res.status(500).json({ message: error.message || 'Internal server error' })
  }
}

module.exports = {
  getExamMonitoringOverview,
  getExamMonitoringActivities,
  getExamMonitoringActivityDetail,
  exportExamMonitoring,
  ingestExamViolation,
}
