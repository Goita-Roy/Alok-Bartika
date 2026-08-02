const mongoose = require('mongoose')
const { CheatingReport } = require('../models/CheatingReport')

const VALID_VIOLATION_TYPES = [
  'tab_switch', 'window_blur', 'copy_paste', 'devtools',
  'fullscreen_exit', 'multiple_devices', 'screen_capture', 'other',
]
const VALID_SEVERITIES = ['low', 'medium', 'high', 'critical']
const VALID_REPORT_STATUSES = ['pending', 'reviewing', 'confirmed', 'dismissed', 'escalated']

// ── GET /api/cheating/reports ────────────────────────────────────────────────
// Admin-only: list all cheating reports with filters.
const getReports = async (req, res) => {
  try {
    const { status, riskLevel, studentId, page = '1', limit = '50' } = req.query

    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50))
    const skip = (pageNum - 1) * limitNum

    const filter = {}
    if (status && VALID_REPORT_STATUSES.includes(status)) filter.status = status
    if (riskLevel && ['low', 'medium', 'high', 'critical'].includes(riskLevel)) filter.riskLevel = riskLevel
    if (studentId && mongoose.Types.ObjectId.isValid(studentId)) filter.student = studentId

    const [reports, total] = await Promise.all([
      CheatingReport.find(filter)
        .populate('student', 'fullName email profilePicture')
        .populate('conversation', 'status lastMessage')
        .populate('resolvedBy', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      CheatingReport.countDocuments(filter),
    ])

    res.status(200).json({
      reports,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    console.error('getReports Error:', error)
    res.status(500).json({ message: error.message || 'Internal Server Error' })
  }
}

// ── GET /api/cheating/reports/:id ────────────────────────────────────────────
const getReportById = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid report ID' })
    }

    const report = await CheatingReport.findById(id)
      .populate('student', 'fullName email profilePicture')
      .populate('conversation', 'status lastMessage')
      .populate('resolvedBy', 'fullName email')
      .populate('notes.author', 'fullName email')
      .lean()

    if (!report) {
      return res.status(404).json({ message: 'Report not found' })
    }

    res.status(200).json({ report })
  } catch (error) {
    console.error('getReportById Error:', error)
    res.status(500).json({ message: error.message || 'Internal Server Error' })
  }
}

// ── POST /api/cheating/report ────────────────────────────────────────────────
// Accepts a violation event and upserts into an existing or new report.
const reportCheatingEvent = async (req, res) => {
  try {
    const { studentId, conversationId, examId, violations } = req.body

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: 'Valid studentId is required' })
    }

    if (!violations || !Array.isArray(violations) || violations.length === 0) {
      return res.status(400).json({ message: 'At least one violation is required' })
    }

    // Validate each violation
    for (const v of violations) {
      if (!v.type || !VALID_VIOLATION_TYPES.includes(v.type)) {
        return res.status(400).json({ message: `Invalid violation type: ${v.type}` })
      }
      if (v.severity && !VALID_SEVERITIES.includes(v.severity)) {
        return res.status(400).json({ message: `Invalid severity: ${v.severity}` })
      }
    }

    // Find or create a pending report for this student
    let report = await CheatingReport.findOne({
      student: studentId,
      status: { $in: ['pending', 'reviewing'] },
    })

    if (report) {
      // Append violations to existing report
      report.violations.push(...violations)
      if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
        report.conversation = conversationId
      }
      if (examId && mongoose.Types.ObjectId.isValid(examId)) {
        report.exam = examId
      }
      await report.save()
    } else {
      // Create new report
      report = await CheatingReport.create({
        student: studentId,
        conversation: conversationId || null,
        exam: examId || null,
        violations,
        status: 'pending',
      })
    }

    const populated = await CheatingReport.findById(report._id)
      .populate('student', 'fullName email profilePicture')
      .populate('conversation', 'status lastMessage')
      .lean()

    res.status(201).json({ report: populated })
  } catch (error) {
    console.error('reportCheatingEvent Error:', error)
    res.status(500).json({ message: error.message || 'Internal Server Error' })
  }
}

// ── PATCH /api/cheating/reports/:id/status ───────────────────────────────────
// Admin-only: update report status and optionally resolve it.
const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, notes } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid report ID' })
    }

    if (!status || !VALID_REPORT_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${VALID_REPORT_STATUSES.join(', ')}` })
    }

    const update = { status }
    if (['confirmed', 'dismissed', 'escalated'].includes(status)) {
      update.resolvedBy = req.user._id
      update.resolvedAt = new Date()
    }

    const report = await CheatingReport.findByIdAndUpdate(id, { $set: update }, { new: true })
      .populate('student', 'fullName email profilePicture')
      .populate('conversation', 'status lastMessage')
      .populate('resolvedBy', 'fullName email')
      .lean()

    if (!report) {
      return res.status(404).json({ message: 'Report not found' })
    }

    // Add initial note if provided
    if (notes && typeof notes === 'string' && notes.trim()) {
      await CheatingReport.findByIdAndUpdate(id, {
        $push: {
          notes: {
            author: req.user._id,
            text: notes.trim(),
            createdAt: new Date(),
          },
        },
      })
      report.notes = report.notes || []
      report.notes.push({ author: { _id: req.user._id }, text: notes.trim(), createdAt: new Date() })
    }

    res.status(200).json({ report })
  } catch (error) {
    console.error('updateReportStatus Error:', error)
    res.status(500).json({ message: error.message || 'Internal Server Error' })
  }
}

// ── POST /api/cheating/reports/:id/notes ─────────────────────────────────────
// Admin-only: add a note to a report.
const addReportNote = async (req, res) => {
  try {
    const { id } = req.params
    const { text } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid report ID' })
    }

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ message: 'Note text is required' })
    }

    const note = {
      author: req.user._id,
      text: text.trim(),
      createdAt: new Date(),
    }

    const report = await CheatingReport.findByIdAndUpdate(
      id,
      { $push: { notes: note } },
      { new: true },
    )
      .populate('notes.author', 'fullName email')
      .lean()

    if (!report) {
      return res.status(404).json({ message: 'Report not found' })
    }

    res.status(200).json({ report })
  } catch (error) {
    console.error('addReportNote Error:', error)
    res.status(500).json({ message: error.message || 'Internal Server Error' })
  }
}

// ── GET /api/cheating/stats ──────────────────────────────────────────────────
// Admin-only: summary statistics for the dashboard.
const getCheatingStats = async (req, res) => {
  try {
    const [stats] = await CheatingReport.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ],
          byRisk: [
            { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
          ],
          unresolvedCount: [
            { $match: { status: { $in: ['pending', 'reviewing'] } } },
            { $count: 'count' },
          ],
        },
      },
    ])

    res.status(200).json({
      total: stats.total[0]?.count ?? 0,
      unresolved: stats.unresolvedCount[0]?.count ?? 0,
      byStatus: stats.byStatus,
      byRisk: stats.byRisk,
    })
  } catch (error) {
    console.error('getCheatingStats Error:', error)
    res.status(500).json({ message: error.message || 'Internal Server Error' })
  }
}

module.exports = {
  getReports,
  getReportById,
  reportCheatingEvent,
  updateReportStatus,
  addReportNote,
  getCheatingStats,
}
