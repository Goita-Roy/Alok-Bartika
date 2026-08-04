const { Course } = require('../models/Course')
const { Lesson } = require('../models/Lesson')
const { auditService } = require('../services/auditService')

// SECURITY: the ONLY fields an admin may set when creating/updating a course.
const COURSE_FIELDS = ['title', 'level', 'description', 'thumbnailUrl', 'status']

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
//   ?status=          all|draft|published (default: published — public sees published only)
//   ?sortBy=          title|level|createdAt (default: createdAt)
//   ?sortOrder=       asc|desc (default: desc)
//   ?page=&limit=     pagination (when provided, returns pagination + summary)
const getAllCourses = async (req, res) => {
  try {
    const { search, level, sortBy, sortOrder, page, limit, status } = req.query

    const ALLOWED_SORT_FIELDS = ['title', 'level', 'createdAt']
    const allowedSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt'
    const allowedSortOrder = sortOrder === 'asc' ? 1 : -1

    // Status resolution: admin may pass status=all|draft|published; otherwise
    // only published courses are exposed (public behavior).
    const statusFilter = status === 'all' || status === 'draft' || status === 'published'
      ? status
      : 'published'
    const summaryFilter = statusFilter === 'all' ? {} : { status: statusFilter }

    // Build $match stage for filtering
    const matchStage = {}

    if (level && ['beginner', 'intermediate', 'advanced'].includes(level)) {
      matchStage.level = level
    }

    if (statusFilter !== 'all') {
      matchStage.status = statusFilter
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i')
      matchStage.$or = [
        { title: regex },
        { description: regex },
      ]
    }

    // ── Pagination mode (aggregation with lookup for lessonCount) ───────────
    const hasPagination = page !== undefined && limit !== undefined

    if (hasPagination) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1)
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25))
      const skip = (pageNum - 1) * limitNum

      const [aggResult, countResult, summaryTotal, beginnerCount, intermediateCount, advancedCount] = await Promise.all([
        Course.aggregate([
          { $match: matchStage },
          { $sort: { [allowedSortBy]: allowedSortOrder } },
          { $skip: skip },
          { $limit: limitNum },
          {
            $lookup: {
              from: 'lessons',
              localField: '_id',
              foreignField: 'courseId',
              as: 'lessonCount',
            },
          },
          {
            $addFields: {
              lessonCount: { $size: '$lessonCount' },
            },
          },
        ]),
        Course.countDocuments(matchStage),
        Course.countDocuments(summaryFilter),
        Course.countDocuments({ ...summaryFilter, level: 'beginner' }),
        Course.countDocuments({ ...summaryFilter, level: 'intermediate' }),
        Course.countDocuments({ ...summaryFilter, level: 'advanced' }),
      ])

      res.status(200).json({
        data: aggResult,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: countResult,
          pages: Math.ceil(countResult / limitNum),
        },
        summary: {
          total: summaryTotal,
          beginner: beginnerCount,
          intermediate: intermediateCount,
          advanced: advancedCount,
        },
      })
    } else {
      // ── Legacy mode (no pagination — return all, but still include lessonCount) ─
      const [courses, summaryTotal, beginnerCount, intermediateCount, advancedCount] = await Promise.all([
        Course.aggregate([
          { $match: matchStage },
          { $sort: { [allowedSortBy]: allowedSortOrder } },
          {
            $lookup: {
              from: 'lessons',
              localField: '_id',
              foreignField: 'courseId',
              as: 'lessonCount',
            },
          },
          {
            $addFields: {
              lessonCount: { $size: '$lessonCount' },
            },
          },
          ]),
        Course.countDocuments(summaryFilter),
        Course.countDocuments({ ...summaryFilter, level: 'beginner' }),
        Course.countDocuments({ ...summaryFilter, level: 'intermediate' }),
        Course.countDocuments({ ...summaryFilter, level: 'advanced' }),
      ])

      res.status(200).json({
        data: courses,
        summary: {
          total: summaryTotal,
          beginner: beginnerCount,
          intermediate: intermediateCount,
          advanced: advancedCount,
        },
      })
    }
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

    // Student-facing: only published lessons are embedded. Draft lessons are
    // authored/published through the admin module.
    const lessons = await Lesson.find({ courseId: course._id, status: { $ne: 'draft' } }).sort({ order: 1 })
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

// @desc    Bulk delete courses
// @route   POST /api/courses/bulk/delete
// @access  Private/Admin
const bulkDeleteCourses = async (req, res) => {
  try {
    const { ids } = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Course IDs are required' })
    }

    const courses = await Course.find({ _id: { $in: ids } })

    await Promise.all(
      courses.map((course) => {
        auditService.logCourseCrud(req.user, 'delete', course, req)
        return Lesson.deleteMany({ courseId: course._id }).then(() => Course.findByIdAndDelete(course._id))
      })
    )

    res.json({
      message: `${courses.length} course${courses.length !== 1 ? 's' : ''} deleted successfully`,
      affected: courses.length,
    })
  } catch (error) {
    console.error('Bulk Delete Courses Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  bulkDeleteCourses,
}
