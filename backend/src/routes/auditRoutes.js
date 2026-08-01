const express = require('express')
const router = express.Router()
const { protect, requireSuperAdmin } = require('../middleware/auth')
const { getAuditLogs, getAuditSummary } = require('../controllers/auditController')

// SECURITY: every audit route is private and Super Admin only. Plain admins
// and students receive 403 Forbidden here.
router.use(protect, requireSuperAdmin)

router.get('/', getAuditLogs)
router.get('/summary', getAuditSummary)

module.exports = { auditRouter: router }
