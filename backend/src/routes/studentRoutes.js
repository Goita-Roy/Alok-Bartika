const express = require('express')
const router = express.Router()
const { protect, requireAdmin } = require('../middleware/auth')
const {
  getStudents, getStudent, suspendStudent, deleteStudent,
  bulkSuspendStudents, bulkDeleteStudents,
} = require('../controllers/studentController')

router.use(protect, requireAdmin)

router.get('/', getStudents)
router.post('/bulk/suspend', bulkSuspendStudents)
router.post('/bulk/delete', bulkDeleteStudents)
router.get('/:id', getStudent)
router.patch('/:id/suspend', suspendStudent)
router.delete('/:id', deleteStudent)

module.exports = { studentRouter: router }
