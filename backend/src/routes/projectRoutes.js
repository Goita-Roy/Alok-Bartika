const express = require('express')
const router = express.Router()
const {
  projectUpload,
  submitProject,
  getMyProjects,
  getOfficialProjects,
  createOfficialProject,
  getProjectCounts,
} = require('../controllers/projectController')
const { protect, requireRole } = require('../middleware/auth')

// Student routes
router.get('/mine', protect, getMyProjects)
router.get('/official', protect, getOfficialProjects)
router.post('/', protect, projectUpload, submitProject)

// Admin / instructor routes
router.get('/counts', protect, requireRole('admin', 'instructor'), getProjectCounts)
router.post('/official', protect, requireRole('admin', 'instructor'), projectUpload, createOfficialProject)

module.exports = { projectRouter: router }
