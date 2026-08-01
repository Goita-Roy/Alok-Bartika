const express = require('express')
const router = express.Router()
const { protect, requireSuperAdmin } = require('../middleware/auth')
const {
  createBackup,
  listBackups,
  getBackup,
  downloadBackup,
  getRestorePlan,
  restoreBackup,
  deleteBackup,
  getSummary,
} = require('../controllers/backupController')

// SECURITY: every backup route is private and Super Admin only. Any attempt by
// an admin or student is rejected with 403 before reaching a controller.
router.use(protect, requireSuperAdmin)

router.post('/', createBackup)
router.get('/', listBackups)
router.get('/summary', getSummary)
router.get('/:id', getBackup)
router.get('/:id/download', downloadBackup)
router.get('/:id/restore-plan', getRestorePlan)
router.post('/:id/restore', restoreBackup)
router.delete('/:id', deleteBackup)

module.exports = { backupRouter: router }
