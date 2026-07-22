const express = require('express')
const { authRequired, requireRole } = require('../middleware/auth')
const { mongoIsReady } = require('../config/db')
const { Course } = require('../models/Course')
const { Lesson } = require('../models/Lesson')
const { Progress } = require('../models/Progress')
const { readDb, writeDb, makeId } = require('../storage/jsonDb')
const { asTrimmedString, cleanMultilineText, safeBoolean, safeNumber } = require('../utils/requestValidation')

function sortByOrder(a, b) {
  return (a.order ?? 0) - (b.order ?? 0)
}

function buildCourseRouter({ jwtSecret }) {
  const router = express.Router()

  // -------- Admin CRUD (Mongo if available; else JSON persistence) --------
  router.get('/admin/courses', authRequired(jwtSecret), requireRole('admin'), async (_req, res) => {
    if (mongoIsReady()) {
      const courses = await Course.find({}).sort({ order: 1, createdAt: 1 }).lean()
      return res.json({ ok: true, courses })
    }
    const db = readDb()
    return res.json({ ok: true, courses: db.courses.sort(sortByOrder) })
  })

  router.post('/admin/courses', authRequired(jwtSecret), requireRole('admin'), async (req, res) => {
    const title = asTrimmedString(req.body?.title, 120)
    const description = cleanMultilineText(req.body?.description, 2000)
    const level = asTrimmedString(req.body?.level, 32)
    const order = safeNumber(req.body?.order, 0, 0, 100000)
    const published = safeBoolean(req.body?.published, true)
    if (!title || !description || !level) return res.status(400).json({ error: 'title, description, level required' })
    if (!['Beginner', 'Intermediate', 'Advanced'].includes(level)) return res.status(400).json({ error: 'Invalid level' })

    if (mongoIsReady()) {
      const course = await Course.create({ title, description, level, order, published })
      return res.status(201).json({ ok: true, course })
    }
    const db = readDb()
    const course = { _id: makeId('course'), title, description, level, order, published, createdAt: new Date().toISOString() }
    db.courses.push(course)
    writeDb(db)
    return res.status(201).json({ ok: true, course })
  })

  router.put('/admin/courses/:id', authRequired(jwtSecret), requireRole('admin'), async (req, res) => {
    const { id } = req.params
    if (mongoIsReady()) {
      const course = await Course.findByIdAndUpdate(id, req.body ?? {}, { new: true })
      if (!course) return res.status(404).json({ error: 'Not found' })
      return res.json({ ok: true, course })
    }
    const db = readDb()
    const idx = db.courses.findIndex((c) => String(c._id) === String(id))
    if (idx < 0) return res.status(404).json({ error: 'Not found' })
    db.courses[idx] = { ...db.courses[idx], ...(req.body ?? {}) }
    writeDb(db)
    return res.json({ ok: true, course: db.courses[idx] })
  })

  router.delete('/admin/courses/:id', authRequired(jwtSecret), requireRole('admin'), async (req, res) => {
    const { id } = req.params
    if (mongoIsReady()) {
      await Lesson.deleteMany({ courseId: id })
      await Course.findByIdAndDelete(id)
      return res.json({ ok: true })
    }
    const db = readDb()
    db.courses = db.courses.filter((c) => String(c._id) !== String(id))
    db.lessons = db.lessons.filter((l) => String(l.courseId) !== String(id))
    db.progress = db.progress.filter((p) => String(p.courseId) !== String(id))
    writeDb(db)
    return res.json({ ok: true })
  })

  // Lessons CRUD (admin)
  router.get('/admin/lessons', authRequired(jwtSecret), requireRole('admin'), async (req, res) => {
    const courseId = req.query.courseId ? String(req.query.courseId) : null
    if (mongoIsReady()) {
      const query = courseId ? { courseId } : {}
      const lessons = await Lesson.find(query).sort({ order: 1, createdAt: 1 }).lean()
      return res.json({ ok: true, lessons })
    }
    const db = readDb()
    const lessons = (courseId ? db.lessons.filter((l) => String(l.courseId) === courseId) : db.lessons).sort(sortByOrder)
    return res.json({ ok: true, lessons })
  })

  router.post('/admin/lessons', authRequired(jwtSecret), requireRole('admin'), async (req, res) => {
    const courseId = asTrimmedString(req.body?.courseId, 100)
    const title = asTrimmedString(req.body?.title, 160)
    const slug = asTrimmedString(req.body?.slug, 120)
    const order = safeNumber(req.body?.order, 0, 0, 100000)
    const readingMarkdown = cleanMultilineText(req.body?.reading?.markdown ?? '', 20000)
    const videoUrl = asTrimmedString(req.body?.video?.url ?? '', 500)
    const practicePrompt = cleanMultilineText(req.body?.practice?.prompt ?? '', 4000)
    const starterCode = cleanMultilineText(req.body?.practice?.starterCode ?? '', 20000)
    const published = safeBoolean(req.body?.published, true)

    if (!courseId || !title || !slug || !practicePrompt) return res.status(400).json({ error: 'courseId, title, slug and practice.prompt are required' })

    if (mongoIsReady()) {
      const lesson = await Lesson.create({
        courseId,
        title,
        slug,
        order,
        reading: { markdown: readingMarkdown },
        video: { url: videoUrl },
        practice: { prompt: practicePrompt, starterCode },
        published,
      })
      return res.status(201).json({ ok: true, lesson })
    }

    const db = readDb()
    const lesson = {
      _id: makeId('lesson'),
      courseId,
      title,
      slug,
      order,
      reading: { markdown: readingMarkdown },
      video: { url: videoUrl },
      practice: { prompt: practicePrompt, starterCode },
      published,
      createdAt: new Date().toISOString(),
    }
    db.lessons.push(lesson)
    writeDb(db)
    return res.status(201).json({ ok: true, lesson })
  })

  router.put('/admin/lessons/:id', authRequired(jwtSecret), requireRole('admin'), async (req, res) => {
    const { id } = req.params
    if (mongoIsReady()) {
      const lesson = await Lesson.findByIdAndUpdate(id, req.body ?? {}, { new: true })
      if (!lesson) return res.status(404).json({ error: 'Not found' })
      return res.json({ ok: true, lesson })
    }
    const db = readDb()
    const idx = db.lessons.findIndex((l) => String(l._id) === String(id))
    if (idx < 0) return res.status(404).json({ error: 'Not found' })
    db.lessons[idx] = { ...db.lessons[idx], ...(req.body ?? {}) }
    writeDb(db)
    return res.json({ ok: true, lesson: db.lessons[idx] })
  })

  router.delete('/admin/lessons/:id', authRequired(jwtSecret), requireRole('admin'), async (req, res) => {
    const { id } = req.params
    if (mongoIsReady()) {
      await Lesson.findByIdAndDelete(id)
      await Progress.deleteMany({ lessonId: id })
      return res.json({ ok: true })
    }
    const db = readDb()
    const lesson = db.lessons.find((l) => String(l._id) === String(id))
    db.lessons = db.lessons.filter((l) => String(l._id) !== String(id))
    if (lesson) db.progress = db.progress.filter((p) => String(p.lessonId) !== String(id))
    writeDb(db)
    return res.json({ ok: true })
  })

  // -------- Student endpoints (locking enforced) --------
  router.get('/courses', authRequired(jwtSecret), requireRole('student'), async (_req, res) => {
    if (mongoIsReady()) {
      const courses = await Course.find({ published: true }).sort({ order: 1, createdAt: 1 }).lean()
      return res.json({ ok: true, courses })
    }
    const db = readDb()
    return res.json({ ok: true, courses: db.courses.filter((c) => c.published).sort(sortByOrder) })
  })

  router.get('/courses/:courseId/lessons', authRequired(jwtSecret), requireRole('student'), async (req, res) => {
    const { courseId } = req.params
    const userId = String(req.user.sub)

    let lessons
    let progress
    if (mongoIsReady()) {
      lessons = await Lesson.find({ courseId, published: true }).sort({ order: 1, createdAt: 1 }).lean()
      progress = await Progress.find({ userId, courseId: String(courseId) }).lean()
    } else {
      const db = readDb()
      lessons = db.lessons.filter((l) => String(l.courseId) === String(courseId) && l.published).sort(sortByOrder)
      progress = db.progress.filter((p) => p.userId === userId && String(p.courseId) === String(courseId))
    }

    const completedSet = new Set(progress.filter((p) => p.completedAt).map((p) => String(p.lessonId)))
    const out = lessons.map((l, idx) => {
      const prev = idx > 0 ? lessons[idx - 1] : null
      const unlocked = idx === 0 || (prev ? completedSet.has(String(prev._id)) : true)
      return {
        id: String(l._id),
        title: l.title,
        order: l.order ?? 0,
        locked: !unlocked,
        completed: completedSet.has(String(l._id)),
      }
    })

    return res.json({ ok: true, lessons: out })
  })

  router.get('/lessons/:lessonId', authRequired(jwtSecret), requireRole('student'), async (req, res) => {
    const { lessonId } = req.params
    const userId = String(req.user.sub)

    let lesson
    if (mongoIsReady()) {
      lesson = await Lesson.findById(lessonId).lean()
    } else {
      const db = readDb()
      lesson = db.lessons.find((l) => String(l._id) === String(lessonId)) ?? null
    }
    if (!lesson || !lesson.published) return res.status(404).json({ error: 'Not found' })

    // Lock check: previous lesson in same course must be completed
    let lessonsInCourse
    let progress
    const courseId = String(lesson.courseId)
    if (mongoIsReady()) {
      lessonsInCourse = await Lesson.find({ courseId, published: true }).sort({ order: 1, createdAt: 1 }).lean()
      progress = await Progress.find({ userId, courseId }).lean()
    } else {
      const db = readDb()
      lessonsInCourse = db.lessons.filter((l) => String(l.courseId) === courseId && l.published).sort(sortByOrder)
      progress = db.progress.filter((p) => p.userId === userId && String(p.courseId) === courseId)
    }

    const idx = lessonsInCourse.findIndex((l) => String(l._id) === String(lessonId))
    const completedSet = new Set(progress.filter((p) => p.completedAt).map((p) => String(p.lessonId)))
    const prev = idx > 0 ? lessonsInCourse[idx - 1] : null
    const unlocked = idx === 0 || (prev ? completedSet.has(String(prev._id)) : true)
    if (!unlocked) return res.status(403).json({ error: 'Lesson locked' })

    // Return modes
    return res.json({
      ok: true,
      lesson: {
        id: String(lesson._id),
        courseId,
        title: lesson.title,
        reading: lesson.reading,
        video: lesson.video,
        practice: lesson.practice,
      },
    })
  })

  router.post('/progress/complete', authRequired(jwtSecret), requireRole('student'), async (req, res) => {
    const userId = String(req.user.sub)
    const { courseId, lessonId, mode } = req.body ?? {}
    if (!courseId || !lessonId) return res.status(400).json({ error: 'courseId and lessonId required' })
    if (mode && !['reading', 'video', 'practice'].includes(mode)) return res.status(400).json({ error: 'Invalid mode' })

    const now = new Date()
    if (mongoIsReady()) {
      const update = { $setOnInsert: { userId, courseId: String(courseId), lessonId: String(lessonId) } }
      if (mode) update.$set = { [`modes.${mode}`]: true }
      const doc = await Progress.findOneAndUpdate(
        { userId, lessonId: String(lessonId) },
        update,
        { new: true, upsert: true },
      )
      // Complete if all modes done (or if caller sends mode=null, mark all)
      const modes = doc.modes ?? {}
      const allDone = mode ? (modes.reading && modes.video && modes.practice) : true
      if (allDone && !doc.completedAt) {
        doc.completedAt = now
        await doc.save()
      }
      return res.json({ ok: true, progress: doc })
    }

    const db = readDb()
    const key = String(lessonId)
    let p = db.progress.find((x) => x.userId === userId && String(x.lessonId) === key) ?? null
    if (!p) {
      p = {
        _id: makeId('prog'),
        userId,
        courseId: String(courseId),
        lessonId: key,
        completedAt: null,
        modes: { reading: false, video: false, practice: false },
        createdAt: now.toISOString(),
      }
      db.progress.push(p)
    }
    if (mode) p.modes[mode] = true
    const allDone = mode ? (p.modes.reading && p.modes.video && p.modes.practice) : true
    if (allDone && !p.completedAt) p.completedAt = now.toISOString()
    writeDb(db)
    return res.json({ ok: true, progress: p })
  })

  return router
}

module.exports = { buildCourseRouter }

