const { Course } = require('../models/Course')
const { Lesson } = require('../models/Lesson')
const { auditService } = require('../services/auditService')

// SECURITY: the ONLY fields an admin may set when creating/updating a course.
const COURSE_FIELDS = ['title', 'level', 'description', 'thumbnailUrl']

function pickCourseFields(body) {
  const picked = {}
  for (const key of COURSE_FIELDS) {
    if (body[key] !== undefined) picked[key] = body[key]
  }
  return picked
}

const INTERMEDIATE_LESSON_ORDER = [
  'algorithm', 'flowchart', 'events', 'logic', 'loops',
  'variables', 'ifelse', 'operators', 'sensing', 'sound',
]
const ADVANCED_LESSON_ORDER = [
  'hello-world', 'variables', 'errors', 'loops',
  'lists', 'functions', 'class-object', 'modules',
]

// Canonical lesson slug — must match the progression controller's slugForLesson.
function slugForLesson(lesson, level) {
  const order = typeof lesson.order === 'number' ? lesson.order : null
  if (level === 'beginner') return `class-${String(order != null ? order : 0).padStart(2, '0')}`
  if (level === 'intermediate') return `intermediate-${INTERMEDIATE_LESSON_ORDER[(order || 1) - 1] || order}`
  if (level === 'advanced') return `advanced-${ADVANCED_LESSON_ORDER[(order || 1) - 1] || order}`
  return `lesson-${order != null ? order : lesson._id}`
}

// @desc    Get all courses (with optional search, filter, sorting, pagination)
// @route   GET /api/courses
// @access  Public
// Query params:
//   ?search=          text search across title + description
//   ?level=           filter by level (beginner|intermediate|advanced)
//   ?sortBy=          title|level|createdAt (default: createdAt)
//   ?sortOrder=       asc|desc (default: desc)
//   ?page=&limit=     pagination (when provided, returns pagination + summary)
const getAllCourses = async (req, res) => {
  try {
    const { search, level, sortBy, sortOrder, page, limit } = req.query

    const ALLOWED_SORT_FIELDS = ['title', 'level', 'createdAt']
    const allowedSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt'
    const allowedSortOrder = sortOrder === 'asc' ? 1 : -1
    const sort = { [allowedSortBy]: allowedSortOrder }

    // Build filter
    const filter = {}

    if (level && ['beginner', 'intermediate', 'advanced'].includes(level)) {
      filter.level = level
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i')
      filter.$or = [
        { title: regex },
        { description: regex },
      ]
    }

    // ── Pagination ────────────────────────────────────────────────────────
    // Only paginate when page/limit params are explicitly provided.
    // Without them, fall back to the legacy behaviour (return all courses).
    const hasPagination = page !== undefined && limit !== undefined
    let courses, total, pagination

    if (hasPagination) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1)
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25))
      const skip = (pageNum - 1) * limitNum

      const [coursesResult, countResult] = await Promise.all([
        Course.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
        Course.countDocuments(filter),
      ])

      courses = coursesResult
      total = countResult
      pagination = {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      }
    } else {
      courses = await Course.find(filter).sort(sort).lean()
      total = courses.length
    }

    // ── Summary (unfiltered counts — always computed regardless of filters) ─
    const [summaryTotal, beginnerCount, intermediateCount, advancedCount] =
      await Promise.all([
        Course.countDocuments({}),
        Course.countDocuments({ level: 'beginner' }),
        Course.countDocuments({ level: 'intermediate' }),
        Course.countDocuments({ level: 'advanced' }),
      ])

    const response = {
      data: courses,
      summary: {
        total: summaryTotal,
        beginner: beginnerCount,
        intermediate: intermediateCount,
        advanced: advancedCount,
      },
    }

    if (hasPagination) {
      response.pagination = pagination
    }

    res.status(200).json(response)
  } catch (error) {
    console.error('Get All Courses Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// @desc    Get single course with lessons
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }

    const lessons = await Lesson.find({ courseId: course._id }).sort({ order: 1 })
    const lessonsWithSlug = lessons.map((l) => ({
      ...l.toObject(),
      slug: slugForLesson(l, course.level),
    }))
    
    res.status(200).json({ 
      data: {
        ...course.toObject(),
        lessons: lessonsWithSlug
      } 
    })
  } catch (error) {
    console.error('Get Course Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = async (req, res) => {
  try {
    const course = new Course(pickCourseFields(req.body))
    await course.save()
    auditService.logCourseCrud(req.user, 'create', course, req)
    res.status(201).json({ message: 'Course created', data: course })
  } catch (error) {
    console.error('Create Course Error:', error)
    res.status(400).json({ message: 'Validation Error', errors: error.message })
  }
}

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = async (req, res) => {
  try {
    // SECURITY: whitelist fields — never pass req.body to findByIdAndUpdate.
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: pickCourseFields(req.body) },
      { returnDocument: 'after', runValidators: true }
    )
    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }
    auditService.logCourseCrud(req.user, 'update', course, req)
    res.status(200).json({ message: 'Course updated', data: course })
  } catch (error) {
    console.error('Update Course Error:', error)
    res.status(400).json({ message: 'Validation Error', errors: error.message })
  }
}

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id)
    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }
    // Also delete associated lessons
    await Lesson.deleteMany({ courseId: req.params.id })
    auditService.logCourseCrud(req.user, 'delete', course, req)
    res.status(200).json({ message: 'Course and lessons deleted' })
  } catch (error) {
    console.error('Delete Course Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
}
