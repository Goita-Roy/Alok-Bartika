const express = require('express')
const router = express.Router()
const { protect, requireAdmin } = require('../middleware/auth')
const {
  getStudents, getStudent, suspendStudent, deleteStudent,
} = require('../controllers/studentController')

router.use(protect, requireAdmin)

router.get('/', getStudents)
router.get('/:id', getStudent)
router.patch('/:id/suspend', suspendStudent)
router.delete('/:id', deleteStudent)

module.exports = { studentRouter: router }
