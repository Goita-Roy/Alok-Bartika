const mongoose = require('mongoose')
const { Course } = require('../models/Course')
const { Lesson } = require('../models/Lesson')
const { env } = require('../config/env')

async function seed() {
  console.log('Connecting to database...')
  await mongoose.connect(env.mongoUri)
  console.log('Connected to database.')

  // 1. Create Beginner Course
  const beginnerCourse = await Course.findOneAndUpdate(
    { title: 'Computer Basics (Beginner)' },
    {
      title: 'Computer Basics (Beginner)',
      level: 'beginner',
      description: 'Start your journey with the fundamentals of computing. Learn about hardware, software, and the digital world.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    },
    { upsert: true, returnDocument: 'after' }
  )

  const beginnerLessons = [
    { title: 'Class 01: কম্পিউটারের জাদু', htmlUrl: '/capstone/beginner/class1.html', order: 1 },
    { title: 'Class 02: ইনপুট ও আউটপুট', htmlUrl: '/capstone/beginner/class2.html', order: 2 },
    { title: 'Class 03: সিপিইউ-এর কাজ', htmlUrl: '/capstone/beginner/class3.html', order: 3 },
    { title: 'Class 04: সফটওয়্যার পরিচিতি', htmlUrl: '/capstone/beginner/class4.html', order: 4 },
    { title: 'Class 05: অপারেটিং সিস্টেম', htmlUrl: '/capstone/beginner/class5.html', order: 5 },
    { title: 'Class 06: ইন্টারনেটের দুনিয়া', htmlUrl: '/capstone/beginner/class6.html', order: 6 },
    { title: 'Class 07: সাইবার নিরাপত্তা', htmlUrl: '/capstone/beginner/class7.html', order: 7 },
    { title: 'Class 08: প্রোগ্রামিং-এর হাতেখড়ি', htmlUrl: '/capstone/beginner/class8.html', order: 8 },
  ]

  for (const lessonData of beginnerLessons) {
    await Lesson.findOneAndUpdate(
      { courseId: beginnerCourse._id, title: lessonData.title },
      { ...lessonData, courseId: beginnerCourse._id },
      { upsert: true }
    )
  }
  console.log('Beginner course and lessons seeded.')

  // 2. Create Intermediate Course
  const intermediateCourse = await Course.findOneAndUpdate(
    { title: 'Programming Fundamentals (Intermediate)' },
    {
      title: 'Programming Fundamentals (Intermediate)',
      level: 'intermediate',
      description: 'Dive deeper into logic, algorithms, and the building blocks of software development.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=800&q=80',
    },
    { upsert: true, returnDocument: 'after' }
  )

  const intermediateLessons = [
    { title: 'Class 01: Algorithm (অ্যালগরিদম)', htmlUrl: '/capstone/intermediate/i_class1.html', order: 1 },
    { title: 'Class 02: Flowchart (ফ্লোচার্ট)', htmlUrl: '/capstone/intermediate/i_class2.html', order: 2 },
    { title: 'Class 03: Events (Programming Basics)', htmlUrl: '/capstone/intermediate/i_class3.html', order: 3 },
    { title: 'Class 04: Programming Logic', htmlUrl: '/capstone/intermediate/i_class4.html', order: 4 },
    { title: 'Class 05: Introduction to Loops', htmlUrl: '/capstone/intermediate/i_class5.html', order: 5 },
    { title: 'Class 06: Variables (ভ্যারিয়েবল)', htmlUrl: '/capstone/intermediate/i_class6.html', order: 6 },
    { title: 'Class 07: If-Else (সিদ্ধান্ত গ্রহণ)', order: 7 },
    { title: 'Class 08: Operators (অংক ও তুলনা)', order: 8 },
    { title: 'Class 09: Sensing (অনুভূতি ও টাচ)', order: 9 },
    { title: 'Class 10: Background & Sound', order: 10 },
    { title: 'Class 11: Mini Project (গেম তৈরি)', order: 11 },
    { title: 'Class 12: Transition to Python', order: 12 },
    { title: 'Smart City Explorer (Activity)', htmlUrl: '/capstone/intermediate/nclass.html', order: 13 },
  ]

  for (const lessonData of intermediateLessons) {
    await Lesson.findOneAndUpdate(
      { courseId: intermediateCourse._id, title: lessonData.title },
      { ...lessonData, courseId: intermediateCourse._id },
      { upsert: true }
    )
  }
  console.log('Intermediate course and lessons seeded.')

  // 3. Create Advanced Course
  const advancedCourse = await Course.findOneAndUpdate(
    { title: 'Python Programming (Advanced)' },
    {
      title: 'Python Programming (Advanced)',
      level: 'advanced',
      description: 'Master real-world Python programming with hands-on exercises across Hello World, Variables, Errors, Loops, Lists, Functions, OOP, and Modules.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    },
    { upsert: true, returnDocument: 'after' }
  )

  // Advanced course content now lives IN-APP (React course at /courses/advanced,
  // src/courses/advanced022) — no more static HTML files. Only title/order are
  // kept so the LMS progress/unlock mapping (by order) stays intact.
  const advancedLessons = [
    { title: 'Class 01: অধ্যায় ১ — হ্যালো ওয়ার্ল্ড', order: 1 },
    { title: 'Class 02: অধ্যায় ২ — ভ্যারিয়েবলস', order: 2 },
    { title: 'Class 03: অধ্যায় ৩ — ত্রুটি ও সনাক্তকরণ', order: 3 },
    { title: 'Class 04: অধ্যায় ৪ — লুপস (Loops)', order: 4 },
    { title: 'Class 05: অধ্যায় ৫ — লিস্টস (Lists)', order: 5 },
    { title: 'Class 06: অধ্যায় ৬ — ফাংশনস (Functions)', order: 6 },
    { title: 'Class 07: অধ্যায় ৭ — ক্লাস ও অবজেক্ট', order: 7 },
    { title: 'Class 08: অধ্যায় ৮ — মডিউলস (Modules)', order: 8 },
  ]

  for (const lessonData of advancedLessons) {
    await Lesson.findOneAndUpdate(
      { courseId: advancedCourse._id, title: lessonData.title },
      { ...lessonData, courseId: advancedCourse._id },
      { upsert: true }
    )
  }
  console.log('Advanced course and lessons seeded.')

  await mongoose.disconnect()
  console.log('Done.')
}

seed().catch(console.error)
