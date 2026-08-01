const { Lesson } = require('../models/Lesson')
const { Course } = require('../models/Course')

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
    res.status(200).json({ message: 'Lesson deleted' })
  } catch (error) {
    console.error('Delete Lesson Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = {
  getLessonsByCourse,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson
}
