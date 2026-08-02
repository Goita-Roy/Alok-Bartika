const express = require('express')
const router = express.Router()
const { protect, requireAdmin } = require('../middleware/auth')
const {
  getReports,
  getReportById,
  reportCheatingEvent,
  updateReportStatus,
  addReportNote,
  getCheatingStats,
} = require('../controllers/cheatingReportController')

// Admin-only: list reports, get by ID, update status, add notes, stats
router.get('/reports', protect, requireAdmin, getReports)
router.get('/reports/:id', protect, requireAdmin, getReportById)
router.patch('/reports/:id/status', protect, requireAdmin, updateReportStatus)
router.post('/reports/:id/notes', protect, requireAdmin, addReportNote)
router.get('/stats', protect, requireAdmin, getCheatingStats)

// Submit a cheating event (called from student anti-cheat hooks)
router.post('/report', protect, reportCheatingEvent)

module.exports = { cheatingRouter: router }
