const mongoose = require('mongoose')
const { Course } = require('./src/models/Course')
const { Lesson } = require('./src/models/Lesson')
const { env } = require('./src/config/env')

async function check() {
  await mongoose.connect(env.mongoUri)
  const courses = await Course.find()
  console.log('Courses count:', courses.length)
  for (const c of courses) {
    const lessons = await Lesson.find({ courseId: c._id })
    console.log(`Course: ${c.title} (${c.level}) - Lessons: ${lessons.length}`)
  }
  await mongoose.disconnect()
}

check().catch(console.error)
