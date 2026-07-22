const { Course } = require('../models/Course')
const { Lesson } = require('../models/Lesson')

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

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({})
    res.status(200).json({ data: courses })
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
    const { title, level, description, thumbnailUrl } = req.body
    const course = new Course({ title, level, description, thumbnailUrl })
    await course.save()
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
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true })
    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }
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
