const mongoose = require('mongoose')
const { Lesson } = require('../models/Lesson')
const { Course } = require('../models/Course')
const { auditService } = require('../services/auditService')

const VALID_LEVELS = ['beginner', 'intermediate', 'advanced']
const ALLOWED_SORT_FIELDS = ['title', 'order', 'level', 'courseId', 'createdAt']

// SECURITY: the ONLY fields an admin may set when creating/updating a lesson.
const LESSON_FIELDS = [
  'courseId', 'title', 'content', 'videoUrl', 'audioUrl', 'codingProblem',
  'order', 'language', 'starterCode', 'expectedOutput', 'practice',
]

function pickLessonFields(body) {
  const picked = {}
  for (const key of LESSON_FIELDS) {
    if (body[key] !== undefined) picked[key] = body[key]
  }
  return picked
}

// Summary counts by course level. lesson.level is not reliably populated, so the
// parent course is the source of truth for beginner/intermediate/advanced totals.
async function buildLessonSummary() {
  const courses = await Course.find({}, { _id: 1, level: 1 }).lean()
  const idsByLevel = { beginner: [], intermediate: [], advanced: [] }
  for (const c of courses) {
    if (idsByLevel[c.level]) idsByLevel[c.level].push(c._id)
  }
  const [total, beginner, intermediate, advanced] = await Promise.all([
    Lesson.countDocuments({}),
    Lesson.countDocuments({ courseId: { $in: idsByLevel.beginner } }),
    Lesson.countDocuments({ courseId: { $in: idsByLevel.intermediate } }),
    Lesson.countDocuments({ courseId: { $in: idsByLevel.advanced } }),
  ])
  return { total, beginner, intermediate, advanced }
}

// @desc    Get all lessons (search, course, level filters + pagination)
// @route   GET /api/lessons
// @access  Public
// Query params:
//   ?search=          text search across title + content
//   ?courseId=        filter by course
//   ?level=           filter by course level (beginner|intermediate|advanced)
//   ?sortBy=          title|order|level|courseId|createdAt (default: order)
//   ?sortOrder=       asc|desc (default: asc)
//   ?page=&limit=     pagination (when provided, returns pagination + summary)
const getAllLessons = async (req, res) => {
  try {
    const { search, courseId, level, page, limit, sortBy, sortOrder } = req.query

    const allowedSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'order'
    const allowedSortOrder = sortOrder === 'desc' ? -1 : 1

    // Resolve level filter to the set of course _ids at that level.
    let levelCourseIds = null
    if (level && VALID_LEVELS.includes(level)) {
      const levelCourses = await Course.find({ level }, { _id: 1 }).lean()
      levelCourseIds = levelCourses.map((c) => c._id)
    }

    const filter = {}

    if (courseId) {
      filter.courseId = mongoose.Types.ObjectId.isValid(courseId)
        ? new mongoose.Types.ObjectId(courseId)
        : new mongoose.Types.ObjectId()
    }

    if (levelCourseIds) {
      if (filter.courseId) {
        if (!levelCourseIds.some((id) => id.equals(filter.courseId))) {
          // The selected course is not at the selected level → no results.
          filter._id = { $in: [] }
        }
      } else {
        filter.courseId = { $in: levelCourseIds }
      }
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i')
      filter.$or = [{ title: regex }, { content: regex }]
    }

    const sortObj = { [allowedSortBy]: allowedSortOrder }

    const hasPagination = page !== undefined && limit !== undefined

    if (hasPagination) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1)
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25))
      const skip = (pageNum - 1) * limitNum

      const [data, total] = await Promise.all([
        Lesson.find(filter).sort(sortObj).skip(skip).limit(limitNum).lean(),
        Lesson.countDocuments(filter),
      ])

      res.status(200).json({
        data,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
        summary: await buildLessonSummary(),
      })
    } else {
      const lessons = await Lesson.find(filter).sort(sortObj).lean()
      res.status(200).json({
        data: lessons,
        summary: await buildLessonSummary(),
      })
    }
  } catch (error) {
    console.error('Get All Lessons Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// @desc    Get all lessons for a course
// @route   GET /api/lessons/course/:courseId
// @access  Public
const getLessonsByCourse = async (req, res) => {
  try {
    const lessons = await Lesson.find({ courseId: req.params.courseId }).sort({ order: 1 })
    res.status(200).json({ data: lessons })
  } catch (error) {
    console.error('Get Lessons Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// @desc    Get single lesson
// @route   GET /api/lessons/:id
// @access  Public
const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' })
    }
    res.status(200).json({ data: lesson })
  } catch (error) {
    console.error('Get Lesson Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// @desc    Create a lesson
// @route   POST /api/lessons
// @access  Private/Admin
const createLesson = async (req, res) => {
  try {
    const lesson = new Lesson(pickLessonFields(req.body))

    // Verify course exists
    if (!lesson.courseId) {
      return res.status(400).json({ message: 'courseId is required' })
    }
    const course = await Course.findById(lesson.courseId)
    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }

    await lesson.save()
    auditService.logLessonCrud(req.user, 'create', lesson, req)
    res.status(201).json({ message: 'Lesson created', data: lesson })
  } catch (error) {
    console.error('Create Lesson Error:', error)
    res.status(400).json({ message: 'Validation Error', errors: error.message })
  }
}

// @desc    Update a lesson
// @route   PUT /api/lessons/:id
// @access  Private/Admin
const updateLesson = async (req, res) => {
  try {
    // SECURITY: whitelist fields — never pass req.body to findByIdAndUpdate.
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { $set: pickLessonFields(req.body) },
      { returnDocument: 'after', runValidators: true }
    )
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' })
    }
    auditService.logLessonCrud(req.user, 'update', lesson, req)
    res.status(200).json({ message: 'Lesson updated', data: lesson })
  } catch (error) {
    console.error('Update Lesson Error:', error)
    res.status(400).json({ message: 'Validation Error', errors: error.message })
  }
}

// @desc    Delete a lesson
// @route   DELETE /api/lessons/:id
// @access  Private/Admin
const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id)
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' })
    }
    auditService.logLessonCrud(req.user, 'delete', lesson, req)
    res.status(200).json({ message: 'Lesson deleted' })
  } catch (error) {
    console.error('Delete Lesson Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = {
  getAllLessons,
  getLessonsByCourse,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson
}
