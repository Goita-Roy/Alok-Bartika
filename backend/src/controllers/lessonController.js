const mongoose = require('mongoose')
const { Lesson } = require('../models/Lesson')
const { Course } = require('../models/Course')
const { auditService } = require('../services/auditService')

const VALID_LEVELS = ['beginner', 'intermediate', 'advanced']
const ALLOWED_SORT_FIELDS = ['title', 'order', 'level', 'courseId', 'createdAt']

// SECURITY: the ONLY fields an admin may set when creating/updating a lesson.
const LESSON_FIELDS = [
  'courseId', 'title', 'content', 'videoUrl', 'audioUrl', 'codingProblem',
  'order', 'language', 'starterCode', 'expectedOutput', 'practice', 'status',
]

function pickLessonFields(body) {
  const picked = {}
  for (const key of LESSON_FIELDS) {
    if (body[key] !== undefined) picked[key] = body[key]
  }
  return picked
}

// Summary counts respecting the current search/filter state.
// Returns: total lessons, published, draft, and total courses (within filtered scope).
async function buildLessonSummary(filter = {}) {
  const [total, published, draft, courseCount] = await Promise.all([
    Lesson.countDocuments(filter),
    Lesson.countDocuments({ ...filter, status: 'published' }),
    Lesson.countDocuments({ ...filter, status: 'draft' }),
    Course.countDocuments(
      filter.courseId && filter.courseId.$in
        ? { _id: filter.courseId.$in }
        : filter.courseId
        ? { _id: filter.courseId }
        : {}
    ),
  ])

  return {
    total,
    published,
    draft,
    totalCourses: courseCount,
  }
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
//   ?status=          all|draft|published (default: all -> admin sees everything)
//   ?page=&limit=     pagination (when provided, returns pagination + summary)
const getAllLessons = async (req, res) => {
  try {
    const { search, courseId, level, page, limit, sortBy, sortOrder, status } = req.query

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

    if (status === 'draft' || status === 'published') {
      filter.status = status
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
         summary: await buildLessonSummary(filter),
       })
     } else {
       const lessons = await Lesson.find(filter).sort(sortObj).lean()
       res.status(200).json({
         data: lessons,
         summary: await buildLessonSummary(filter),
       })
    }
  } catch (error) {
    console.error('Get All Lessons Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// @desc    Get all lessons for a course (student-facing: published only)
// @route   GET /api/lessons/course/:courseId
// @access  Public
const getLessonsByCourse = async (req, res) => {
  try {
    const lessons = await Lesson.find({
      courseId: req.params.courseId,
      status: { $ne: 'draft' },
    }).sort({ order: 1 })
    res.status(200).json({ data: lessons })
  } catch (error) {
    console.error('Get Lessons Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// @desc    Get single lesson (student-facing: draft lessons are hidden)
// @route   GET /api/lessons/:id
// @access  Public
const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findOne({ _id: req.params.id, status: { $ne: 'draft' } })
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

// @desc    Duplicate a lesson (copies it immediately after the original and
//          renumbers the course's lesson order)
// @route   POST /api/lessons/:id/duplicate
// @access  Private/Admin
const duplicateLesson = async (req, res) => {
  try {
    const original = await Lesson.findById(req.params.id)
    if (!original) {
      return res.status(404).json({ message: 'Lesson not found' })
    }

    // Snapshot the fields an admin may set (mirrors LESSON_FIELDS whitelist).
    const copyFields = {
      courseId: original.courseId,
      title: `${original.title} (Copy)`,
      content: original.content,
      videoUrl: original.videoUrl,
      audioUrl: original.audioUrl,
      codingProblem: original.codingProblem,
      language: original.language,
      starterCode: original.starterCode,
      expectedOutput: original.expectedOutput,
      practice: original.practice,
      status: original.status,
    }

    const copy = new Lesson(copyFields)
    await copy.save()

    // All lessons in the course, ordered for stable renumbering.
    const siblings = await Lesson.find({ courseId: original.courseId }).sort({ order: 1 }).lean()

    // Build the new ordered id list with the copy inserted right after the original.
    const orderedIds = []
    for (const s of siblings) {
      if (String(s._id) === String(copy._id)) continue // skip the new copy here; it is added below
      orderedIds.push(s._id)
      if (String(s._id) === String(original._id)) {
        orderedIds.push(copy._id)
      }
    }

    // Renumber sequentially (1..N) across the whole course.
    await Lesson.bulkWrite(
      orderedIds.map((id, index) => ({
        updateOne: { filter: { _id: id }, update: { $set: { order: index + 1 } } },
      }))
    )

    auditService.logLessonCrud(req.user, 'duplicate', copy, req)
    res.status(201).json({ message: 'Lesson duplicated', data: copy })
  } catch (error) {
    console.error('Duplicate Lesson Error:', error)
    res.status(400).json({ message: 'Validation Error', errors: error.message })
  }
}

// @desc    Reorder lessons within a course (renumbers all lessons sequentially)
// @route   POST /api/lessons/reorder
// @access  Private/Admin
// Body:    { courseId: string, lessonIds: string[] }
const reorderLessons = async (req, res) => {
  const { courseId, lessonIds } = req.body || {}

  if (!courseId || !Array.isArray(lessonIds) || lessonIds.length === 0) {
    return res.status(400).json({ message: 'courseId and lessonIds are required' })
  }
  if (new Set(lessonIds.map((id) => String(id))).size !== lessonIds.length) {
    return res.status(400).json({ message: 'lessonIds must not contain duplicates' })
  }

  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const course = await Course.findById(courseId).session(session)
    if (!course) {
      await session.abortTransaction()
      session.endSession()
      return res.status(404).json({ message: 'Course not found' })
    }

    // Validate that every id belongs to the given course.
    const courseLessons = await Lesson.find({ courseId: course._id }).session(session).select({ _id: 1 }).lean()
    const validIds = new Set(courseLessons.map((l) => String(l._id)))
    for (const id of lessonIds) {
      if (!validIds.has(String(id))) {
        await session.abortTransaction()
        session.endSession()
        return res.status(400).json({ message: 'All lessonIds must belong to the given course' })
      }
    }

    // Renumber the provided lessons sequentially (1..N).
    const ops = lessonIds.map((id, index) => ({
      updateOne: { filter: { _id: id, courseId: course._id }, update: { $set: { order: index + 1 } } },
    }))

    // Append any lessons not included in the request, keeping their relative order,
    // so the whole course stays sequential with no conflicting order values.
    const excludedIds = courseLessons.filter((l) => !validIds.has(String(l._id)))
    for (let i = 0; i < excludedIds.length; i++) {
      ops.push({
        updateOne: {
          filter: { _id: excludedIds[i]._id },
          update: { $set: { order: lessonIds.length + i + 1 } },
        },
      })
    }

    await Lesson.bulkWrite(ops, { session })
    await session.commitTransaction()
    session.endSession()

    auditService.logLessonCrud(req.user, 'reorder', { _id: course._id, title: course.title, courseId: course._id }, req)

    const updated = await Lesson.find({ courseId: course._id }).sort({ order: 1 }).lean()
    res.status(200).json({ message: 'Lessons reordered', data: updated })
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    console.error('Reorder Lessons Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// @desc    Bulk update lesson status (publish/draft)
// @route   POST /api/lessons/bulk/status
// @access  Private/Admin
// Body:    { ids: string[], status: 'published' | 'draft' }
const bulkUpdateStatus = async (req, res) => {
  const { ids, status } = req.body || {}

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'ids array is required' })
  }
  if (!status || !['published', 'draft'].includes(status)) {
    return res.status(400).json({ message: "status must be 'published' or 'draft'" })
  }

  // Validate all ids are valid ObjectIds
  const objectIds = []
  for (const id of ids) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: `Invalid lesson id: ${id}` })
    }
    objectIds.push(new mongoose.Types.ObjectId(id))
  }

  try {
    const result = await Lesson.updateMany(
      { _id: { $in: objectIds } },
      { $set: { status } }
    )

    auditService.logLessonCrud(req.user, 'bulk-status', { count: result.modifiedCount, status }, req)

    res.status(200).json({
      message: 'Bulk status update complete',
      affected: result.modifiedCount,
    })
  } catch (error) {
    console.error('Bulk Status Update Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
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

// @desc    Bulk delete lessons
// @route   POST /api/lessons/bulk/delete
// @access  Private/Admin
// Body:    { ids: string[] }
const bulkDeleteLessons = async (req, res) => {
  const { ids } = req.body || {}

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'ids array is required' })
  }

  // Validate all ids are valid ObjectIds and fetch lessons
  const objectIds = []
  for (const id of ids) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: `Invalid lesson id: ${id}` })
    }
    objectIds.push(new mongoose.Types.ObjectId(id))
  }

  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    // Fetch all lessons being deleted (for audit)
    const lessonsToDelete = await Lesson.find({ _id: { $in: objectIds } }).session(session)

    // Collect unique course IDs for renumbering
    const courseIds = new Set(lessonsToDelete.map((l) => String(l.courseId)))

    // Delete the lessons
    await Lesson.deleteMany({ _id: { $in: objectIds } }).session(session)

    // Renumber lessons within each affected course
    for (const courseId of courseIds) {
      const remaining = await Lesson.find({ courseId: new mongoose.Types.ObjectId(courseId) })
        .sort({ order: 1 })
        .session(session)
        .select({ _id: 1 })
        .lean()

      await Lesson.bulkWrite(
        remaining.map((lesson, index) => ({
          updateOne: {
            filter: { _id: lesson._id },
            update: { $set: { order: index + 1 } },
          },
        })),
        { session }
      )
    }

    await session.commitTransaction()
    session.endSession()

    auditService.logLessonCrud(req.user, 'bulk-delete', { count: lessonsToDelete.length }, req)

    res.status(200).json({
      message: 'Lessons deleted successfully',
      deleted: lessonsToDelete.length,
    })
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    console.error('Bulk Delete Lessons Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = {
  getAllLessons,
  getLessonsByCourse,
  getLessonById,
  createLesson,
  updateLesson,
  duplicateLesson,
  reorderLessons,
  bulkUpdateStatus,
  bulkDeleteLessons,
  deleteLesson
}
