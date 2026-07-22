const express = require('express')
const { authRequired, requireRole } = require('../middleware/auth')
const { mongoIsReady } = require('../config/db')
const { User } = require('../models/User')
const { Course } = require('../models/Course')
const { Lesson } = require('../models/Lesson')
const { Progress } = require('../models/Progress')
const { readDb, writeDb, makeId } = require('../storage/jsonDb')

function avg(values) {
  if (!values.length) return 0
  const total = values.reduce((a, b) => a + b, 0)
  return Math.round((total / values.length) * 100) / 100
}

function scoreFromProgress(progress) {
  const m = progress?.modes ?? {}
  const done = Number(Boolean(m.reading)) + Number(Boolean(m.video)) + Number(Boolean(m.practice))
  return Math.round((done / 3) * 100)
}

function buildAdminRouter({ jwtSecret }) {
  const router = express.Router()
  const adminOnly = [authRequired(jwtSecret), requireRole('admin')]

  router.get('/admin/students', ...adminOnly, async (_req, res) => {
    if (mongoIsReady()) {
      const students = await User.find({ role: 'student' }).sort({ createdAt: -1 }).lean()
      return res.json({
        ok: true,
        students: students.map((u) => ({
          id: String(u._id),
          fullName: u.fullName,
          email: u.email,
          phone: u.phone,
          student: u.student,
          createdAt: u.createdAt,
        })),
      })
    }
    const db = readDb()
    const students = db.users
      .filter((u) => u.role === 'student')
      .map((u) => ({
        id: String(u._id),
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        student: u.student,
        createdAt: u.createdAt ?? null,
      }))
    return res.json({ ok: true, students })
  })

  router.post('/admin/students', ...adminOnly, async (req, res) => {
    const body = req.body ?? {}
    const required = ['fullName', 'email', 'phone', 'password', 'institution', 'department', 'batch', 'roll', 'address', 'guardianName', 'guardianPhone']
    for (const key of required) {
      if (!body[key]) return res.status(400).json({ error: `${key} is required` })
    }

    const email = String(body.email).trim().toLowerCase()
    const phone = String(body.phone).trim()
    if (mongoIsReady()) {
      const existing = await User.findOne({ $or: [{ email }, { phone }] })
      if (existing) return res.status(409).json({ error: 'Student already exists' })
      const passwordHash = await User.hashPassword(String(body.password))
      const student = await User.create({
        role: 'student',
        fullName: String(body.fullName).trim(),
        email,
        phone,
        passwordHash,
        student: {
          institution: String(body.institution).trim(),
          department: String(body.department).trim(),
          batch: String(body.batch).trim(),
          roll: String(body.roll).trim(),
          address: String(body.address).trim(),
          guardianName: String(body.guardianName).trim(),
          guardianPhone: String(body.guardianPhone).trim(),
        },
      })
      return res.status(201).json({ ok: true, student: { id: String(student._id), fullName: student.fullName, email: student.email, phone: student.phone, student: student.student } })
    }

    const db = readDb()
    const existing = db.users.find((u) => u.email === email || u.phone === phone)
    if (existing) return res.status(409).json({ error: 'Student already exists' })
    const passwordHash = await User.hashPassword(String(body.password))
    const student = {
      _id: makeId('user'),
      role: 'student',
      fullName: String(body.fullName).trim(),
      email,
      phone,
      passwordHash,
      student: {
        institution: String(body.institution).trim(),
        department: String(body.department).trim(),
        batch: String(body.batch).trim(),
        roll: String(body.roll).trim(),
        address: String(body.address).trim(),
        guardianName: String(body.guardianName).trim(),
        guardianPhone: String(body.guardianPhone).trim(),
      },
      createdAt: new Date().toISOString(),
    }
    db.users.push(student)
    writeDb(db)
    return res.status(201).json({
      ok: true,
      student: { id: String(student._id), fullName: student.fullName, email: student.email, phone: student.phone, student: student.student },
    })
  })

  router.put('/admin/students/:id', ...adminOnly, async (req, res) => {
    const { id } = req.params
    const body = req.body ?? {}
    if (mongoIsReady()) {
      const update = {
        ...(body.fullName !== undefined ? { fullName: String(body.fullName).trim() } : {}),
        ...(body.email !== undefined ? { email: String(body.email).trim().toLowerCase() } : {}),
        ...(body.phone !== undefined ? { phone: String(body.phone).trim() } : {}),
      }
      const studentUpdate = {}
      const studentFields = ['institution', 'department', 'batch', 'roll', 'address', 'guardianName', 'guardianPhone']
      for (const field of studentFields) {
        if (body[field] !== undefined) studentUpdate[`student.${field}`] = String(body[field]).trim()
      }
      const doc = await User.findOneAndUpdate({ _id: id, role: 'student' }, { ...update, ...studentUpdate }, { new: true })
      if (!doc) return res.status(404).json({ error: 'Student not found' })
      return res.json({ ok: true, student: { id: String(doc._id), fullName: doc.fullName, email: doc.email, phone: doc.phone, student: doc.student } })
    }

    const db = readDb()
    const idx = db.users.findIndex((u) => String(u._id) === String(id) && u.role === 'student')
    if (idx < 0) return res.status(404).json({ error: 'Student not found' })
    db.users[idx] = {
      ...db.users[idx],
      ...(body.fullName !== undefined ? { fullName: String(body.fullName).trim() } : {}),
      ...(body.email !== undefined ? { email: String(body.email).trim().toLowerCase() } : {}),
      ...(body.phone !== undefined ? { phone: String(body.phone).trim() } : {}),
      student: {
        ...db.users[idx].student,
        ...(body.institution !== undefined ? { institution: String(body.institution).trim() } : {}),
        ...(body.department !== undefined ? { department: String(body.department).trim() } : {}),
        ...(body.batch !== undefined ? { batch: String(body.batch).trim() } : {}),
        ...(body.roll !== undefined ? { roll: String(body.roll).trim() } : {}),
        ...(body.address !== undefined ? { address: String(body.address).trim() } : {}),
        ...(body.guardianName !== undefined ? { guardianName: String(body.guardianName).trim() } : {}),
        ...(body.guardianPhone !== undefined ? { guardianPhone: String(body.guardianPhone).trim() } : {}),
      },
    }
    writeDb(db)
    const u = db.users[idx]
    return res.json({ ok: true, student: { id: String(u._id), fullName: u.fullName, email: u.email, phone: u.phone, student: u.student } })
  })

  router.delete('/admin/students/:id', ...adminOnly, async (req, res) => {
    const { id } = req.params
    if (mongoIsReady()) {
      const student = await User.findOneAndDelete({ _id: id, role: 'student' })
      if (!student) return res.status(404).json({ error: 'Student not found' })
      await Progress.deleteMany({ userId: String(id) })
      return res.json({ ok: true })
    }
    const db = readDb()
    const before = db.users.length
    db.users = db.users.filter((u) => !(String(u._id) === String(id) && u.role === 'student'))
    db.progress = db.progress.filter((p) => String(p.userId) !== String(id))
    if (db.users.length === before) return res.status(404).json({ error: 'Student not found' })
    writeDb(db)
    return res.json({ ok: true })
  })

  router.get('/admin/progress', ...adminOnly, async (_req, res) => {
    if (mongoIsReady()) {
      const [students, courses, lessons, progress] = await Promise.all([
        User.find({ role: 'student' }).lean(),
        Course.find({}).lean(),
        Lesson.find({}).lean(),
        Progress.find({}).lean(),
      ])
      const studentMap = new Map(students.map((s) => [String(s._id), s]))
      const courseMap = new Map(courses.map((c) => [String(c._id), c]))
      const lessonMap = new Map(lessons.map((l) => [String(l._id), l]))
      const rows = progress.map((p) => {
        const student = studentMap.get(String(p.userId))
        const course = courseMap.get(String(p.courseId))
        const lesson = lessonMap.get(String(p.lessonId))
        return {
          id: String(p._id),
          studentId: String(p.userId),
          studentName: student?.fullName ?? 'Unknown student',
          courseId: String(p.courseId),
          courseTitle: course?.title ?? 'Unknown course',
          lessonId: String(p.lessonId),
          lessonTitle: lesson?.title ?? 'Unknown lesson',
          modes: p.modes,
          completedAt: p.completedAt,
          score: scoreFromProgress(p),
        }
      })
      return res.json({ ok: true, progress: rows })
    }
    const db = readDb()
    const studentMap = new Map(db.users.filter((u) => u.role === 'student').map((s) => [String(s._id), s]))
    const courseMap = new Map(db.courses.map((c) => [String(c._id), c]))
    const lessonMap = new Map(db.lessons.map((l) => [String(l._id), l]))
    const rows = db.progress.map((p) => ({
      id: String(p._id),
      studentId: String(p.userId),
      studentName: studentMap.get(String(p.userId))?.fullName ?? 'Unknown student',
      courseId: String(p.courseId),
      courseTitle: courseMap.get(String(p.courseId))?.title ?? 'Unknown course',
      lessonId: String(p.lessonId),
      lessonTitle: lessonMap.get(String(p.lessonId))?.title ?? 'Unknown lesson',
      modes: p.modes ?? { reading: false, video: false, practice: false },
      completedAt: p.completedAt ?? null,
      score: scoreFromProgress(p),
    }))
    return res.json({ ok: true, progress: rows })
  })

  router.get('/admin/analytics', ...adminOnly, async (_req, res) => {
    if (mongoIsReady()) {
      const [students, lessons, progress] = await Promise.all([
        User.find({ role: 'student' }).select('_id').lean(),
        Lesson.find({}).select('_id title').lean(),
        Progress.find({}).lean(),
      ])
      const attemptMap = new Map()
      for (const p of progress) {
        const key = String(p.lessonId)
        attemptMap.set(key, (attemptMap.get(key) ?? 0) + 1)
      }
      const attempted = lessons
        .map((l) => ({ lessonId: String(l._id), title: l.title, attempts: attemptMap.get(String(l._id)) ?? 0 }))
        .sort((a, b) => b.attempts - a.attempts)
        .slice(0, 8)
      const avgScores = avg(progress.map((p) => scoreFromProgress(p)))
      return res.json({ ok: true, analytics: { totalStudents: students.length, avgScores, mostAttemptedLessons: attempted } })
    }
    const db = readDb()
    const students = db.users.filter((u) => u.role === 'student')
    const attemptMap = new Map()
    for (const p of db.progress) {
      const key = String(p.lessonId)
      attemptMap.set(key, (attemptMap.get(key) ?? 0) + 1)
    }
    const mostAttemptedLessons = db.lessons
      .map((l) => ({ lessonId: String(l._id), title: l.title, attempts: attemptMap.get(String(l._id)) ?? 0 }))
      .sort((a, b) => b.attempts - a.attempts)
      .slice(0, 8)
    const avgScores = avg(db.progress.map((p) => scoreFromProgress(p)))
    return res.json({ ok: true, analytics: { totalStudents: students.length, avgScores, mostAttemptedLessons } })
  })

  return router
}

module.exports = { buildAdminRouter }
