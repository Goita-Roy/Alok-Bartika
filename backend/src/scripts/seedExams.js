/**
 * Seed script — populate sample exams for each level.
 * Run: node backend/src/scripts/seedExams.js
 *
 * Requires MONGO_URI in .env or passed as env var.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '..', '.env') })
const mongoose = require('mongoose')
const { Exam } = require('../models/Exam')
const { Course } = require('../models/Course')

async function seed() {
  const uri = process.env.MONGO_URI || process.env.DATABASE_URL
  if (!uri) throw new Error('MONGO_URI not set in .env')
  await mongoose.connect(uri)
  console.log('Connected to MongoDB')

  // Find one course per level to attach exam to
  const [begCourse, intCourse, advCourse] = await Promise.all([
    Course.findOne({ level: 'beginner' }),
    Course.findOne({ level: 'intermediate' }),
    Course.findOne({ level: 'advanced' }),
  ])

  if (!begCourse) { console.warn('No beginner course found — skipping beginner exam'); }
  if (!intCourse) { console.warn('No intermediate course found — skipping intermediate exam'); }
  if (!advCourse) { console.warn('No advanced course found — skipping advanced exam'); }

  const exams = []

  // ── Beginner Exam ─────────────────────────────────────────────────────────
  if (begCourse) {
    exams.push({
      courseId: begCourse._id,
      level: 'beginner',
      title: 'শিক্ষানবিশ চূড়ান্ত পরীক্ষা',
      description: 'কম্পিউটার বেসিক, লজিক ও ব্লক কোডিং-এর উপর ফাইনাল পরীক্ষা।',
      passingScore: 60,
      timeLimitMinutes: 20,
      questions: [],
    })
  }

  // ── Intermediate Exam ─────────────────────────────────────────────────────
  // Removed — Intermediate content will be rebuilt from scratch.
  // if (intCourse) { ... }

  // ── Advanced Exam ─────────────────────────────────────────────────────────
  if (advCourse) {
    exams.push({
      courseId: advCourse._id,
      level: 'advanced',
      title: 'উন্নত চূড়ান্ত পরীক্ষা',
      description: 'পাইথন প্রোগ্রামিং-এর উপর চূড়ান্ত পরীক্ষা।',
      passingScore: 60,
      timeLimitMinutes: 7,
      isActive: true,
      questions: [
        // 1 — হ্যালো ওয়ার্ল্ড
        {
          type: 'mcq',
          questionText: 'print("হ্যালো ওয়ার্ল্ড") — এই লাইনটি চালালে কী ঘটবে?',
          options: [
            'একটি ভুল (error) দেখাবে',
            'স্ক্রিনে "হ্যালো ওয়ার্ল্ড" লেখা দেখাবে',
            'কম্পিউটার বন্ধ হয়ে যাবে',
            'কিছুই হবে না',
          ],
          correctAnswer: 1,
          explanation: 'print() ফাংশন উদ্ধৃতির ভিতরের লেখাটি স্ক্রিনে দেখায়, তাই "হ্যালো ওয়ার্ল্ড" প্রিন্ট হবে।',
          points: 2,
        },
        // 2 — ভেরিয়েবল
        {
          type: 'mcq',
          questionText: 'ভেরিয়েবল বলতে কী বোঝায়?',
          options: [
            'একটি ফাংশনের নাম',
            'একটি লুপের ধরন',
            'তথ্য (মান) জমা রাখার একটি নাম বা জায়গা',
            'একটি ভুল বার্তা',
          ],
          correctAnswer: 2,
          explanation: 'ভেরিয়েবল হলো এমন একটি নাম যেখানে আমরা কোনো মান (যেমন সংখ্যা বা লেখা) জমা রাখি।',
          points: 2,
        },
        // 3 — ডেটা টাইপ
        {
          type: 'mcq',
          questionText: 'age = 12 — এখানে age ভেরিয়েবলের ডেটা টাইপ কী?',
          options: [
            'string (স্ট্রিং)',
            'boolean (বুলিয়ান)',
            'float (দশমিক)',
            'integer (পূর্ণসংখ্যা)',
          ],
          correctAnswer: 3,
          explanation: '12 একটি পূর্ণসংখ্যা, তাই এর ডেটা টাইপ integer (int)।',
          points: 2,
        },
        // 4 — ইনপুট ও আউটপুট
        {
          type: 'mcq',
          questionText: 'ব্যবহারকারী input() দিয়ে যা টাইপ করে, তা Python কোন টাইপ হিসেবে গ্রহণ করে?',
          options: [
            'string (লেখা)',
            'integer (সংখ্যা)',
            'boolean',
            'list',
          ],
          correctAnswer: 0,
          explanation: 'input() সবসময় লেখা (string) হিসেবে মান ফেরত দেয়; সংখ্যা দরকার হলে int() দিয়ে রূপান্তর করতে হয়।',
          points: 2,
        },
        // 5 — শর্ত (if / else)
        {
          type: 'mcq',
          questionText: 'if শর্তটি মিথ্যা (False) হলে প্রোগ্রাম কোন অংশটি চালাবে?',
          options: [
            'for অংশ',
            'else অংশ',
            'def অংশ',
            'print অংশ',
          ],
          correctAnswer: 1,
          explanation: 'if শর্ত মিথ্যা হলে else ব্লকের কোড চালানো হয়।',
          points: 2,
        },
        // 6 — লুপ (for / while)
        {
          type: 'mcq',
          questionText: 'while লুপ কখন পর্যন্ত চলতে থাকে?',
          options: [
            'শুধু একবার',
            'ঠিক দশবার',
            'যতক্ষণ শর্তটি সত্য (True) থাকে',
            'কখনোই চলে না',
          ],
          correctAnswer: 2,
          explanation: 'while লুপ ততক্ষণ চলে যতক্ষণ তার শর্তটি সত্য থাকে; শর্ত মিথ্যা হলে থেমে যায়।',
          points: 2,
        },
        // 7 — ফাংশন
        {
          type: 'mcq',
          questionText: 'ফাংশন ব্যবহার করার প্রধান সুবিধা কী?',
          options: [
            'প্রোগ্রাম ধীর করে',
            'একই কোড বারবার না লিখে বারবার ব্যবহার করা যায়',
            'ভেরিয়েবল মুছে ফেলে',
            'ইন্টারনেট দরকার হয়',
          ],
          correctAnswer: 1,
          explanation: 'ফাংশন একবার লিখে বারবার ডাকা যায়, ফলে কোড ছোট ও পরিষ্কার হয়।',
          points: 2,
        },
        // 8 — লিস্ট
        {
          type: 'mcq',
          questionText: 'nums = [10, 20, 30, 40] — এখানে nums[2] এর মান কত?',
          options: [
            '20',
            '40',
            '10',
            '30',
          ],
          correctAnswer: 3,
          explanation: 'লিস্টের index ০ থেকে শুরু হয়, তাই nums[2] = 30 (তৃতীয় উপাদান)।',
          points: 2,
        },
        // 9 — ক্লাস ও অবজেক্ট
        {
          type: 'mcq',
          questionText: 'ক্লাস (class) কীসের মতো কাজ করে?',
          options: [
            'অবজেক্ট তৈরির একটি নকশা বা টেমপ্লেট',
            'একটি লুপ',
            'একটি সংখ্যা',
            'একটি ভুল বার্তা',
          ],
          correctAnswer: 0,
          explanation: 'ক্লাস হলো একটি নকশা (blueprint); সেই নকশা থেকে বাস্তব অবজেক্ট তৈরি করা হয়।',
          points: 2,
        },
        // 10 — মডিউল
        {
          type: 'mcq',
          questionText: 'import random লেখার উদ্দেশ্য কী?',
          options: [
            'একটি নতুন ভেরিয়েবল তৈরি করা',
            'random নামের মডিউলটি প্রোগ্রামে যুক্ত করা',
            'প্রোগ্রাম বন্ধ করা',
            'একটি লিস্ট তৈরি করা',
          ],
          correctAnswer: 1,
          explanation: 'import দিয়ে বাইরের মডিউল যুক্ত করা হয়; import random random মডিউলটি ব্যবহারযোগ্য করে।',
          points: 2,
        },

        // ── ব্যবহারিক কোডিং প্রশ্ন (IDE-তে সমাধান করতে হবে) ─────────────────────
        // এই প্রশ্নগুলো MCQ নয়। শিক্ষার্থী "IDE খুলুন" বোতামে ক্লিক করে
        // বিদ্যমান IDE-তে Python কোড লিখবে, রান করবে ও জমা দেবে।
        // এখন অটো-জাজিং নেই — শুধু শিক্ষার্থীর জমা দেওয়া কোড সংরক্ষণ করা হয়।

        // 11 — নিজের নাম প্রিন্ট করা
        {
          type: 'coding',
          questionText:
            'শিরোনাম: নিজের নাম প্রিন্ট করুন।\n\n' +
            'নির্দেশনা: print() ব্যবহার করে স্ক্রিনে আপনার নিজের নাম প্রিন্ট করুন।\n\n' +
            'প্রত্যাশিত আউটপুট:\nYour name\n\n' +
            'কাঠিন্য: সহজ (Easy)\n\n' +
            'ইঙ্গিত:\n• print("...") ফাংশনের ভিতরে উদ্ধৃতির মধ্যে আপনার নাম লিখুন।\n• উদাহরণ: print("Rahim")',
          options: [],
          starterCode: 'print("")',
          correctAnswer: 'Your name',
          explanation: 'print() ফাংশনের উদ্ধৃতির ভিতরে নিজের নাম লিখলে সেটি স্ক্রিনে দেখাবে।',
          points: 4,
        },
        // 12 — দুটি সংখ্যার যোগফল
        {
          type: 'coding',
          questionText:
            'শিরোনাম: দুটি সংখ্যা ইনপুট নিয়ে তাদের যোগফল প্রিন্ট করুন।\n\n' +
            'নির্দেশনা: ব্যবহারকারীর কাছ থেকে দুটি সংখ্যা input() দিয়ে নিন এবং তাদের যোগফল প্রিন্ট করুন।\n\n' +
            'উদাহরণ:\nInput:\n10\n20\n\nOutput:\n30\n\n' +
            'কাঠিন্য: সহজ (Easy)\n\n' +
            'ইঙ্গিত:\n• input() লেখা (string) ফেরত দেয়, তাই int() দিয়ে সংখ্যায় রূপান্তর করুন।\n• যোগফল বের করতে a + b ব্যবহার করুন এবং print() দিয়ে দেখান।',
          options: [],
          starterCode: 'a = int(input())\nb = int(input())\n',
          correctAnswer: '30',
          explanation: 'int(input()) দিয়ে দুটি সংখ্যা নিয়ে a + b যোগ করে print() দিয়ে দেখাতে হবে।',
          points: 4,
        },
        // 13 — for লুপ দিয়ে ১ থেকে ১০
        {
          type: 'coding',
          questionText:
            'শিরোনাম: for লুপ ব্যবহার করে ১ থেকে ১০ পর্যন্ত সংখ্যা প্রিন্ট করুন।\n\n' +
            'নির্দেশনা: একটি for লুপ ব্যবহার করে ১ থেকে ১০ পর্যন্ত প্রতিটি সংখ্যা আলাদা লাইনে প্রিন্ট করুন।\n\n' +
            'প্রত্যাশিত আউটপুট:\n1\n2\n3\n...\n10\n\n' +
            'কাঠিন্য: মাঝারি (Medium)\n\n' +
            'ইঙ্গিত:\n• range(1, 11) ১ থেকে ১০ পর্যন্ত সংখ্যা দেয়।\n• for i in range(1, 11): এর ভিতরে print(i) লিখুন।',
          options: [],
          starterCode: 'for ',
          correctAnswer: '1\n2\n3\n4\n5\n6\n7\n8\n9\n10',
          explanation: 'for i in range(1, 11): print(i) — এটি ১ থেকে ১০ পর্যন্ত প্রতিটি সংখ্যা প্রিন্ট করে।',
          points: 4,
        },
        // 14 — square(n) ফাংশন
        {
          type: 'coding',
          questionText:
            'শিরোনাম: square(n) নামে একটি ফাংশন তৈরি করুন যা n*n ফেরত দেয়।\n\n' +
            'নির্দেশনা: square(n) নামের একটি ফাংশন লিখুন যা n-এর বর্গ (n*n) return করবে, এবং একটি সংখ্যা দিয়ে ডেকে ফলাফল প্রিন্ট করুন।\n\n' +
            'উদাহরণ:\nInput:\n5\n\nOutput:\n25\n\n' +
            'কাঠিন্য: মাঝারি (Medium)\n\n' +
            'ইঙ্গিত:\n• return n * n ব্যবহার করে ফলাফল ফেরত দিন।\n• উদাহরণ: print(square(5)) লিখলে 25 দেখাবে।',
          options: [],
          starterCode: 'def square(n):\n    pass\n',
          correctAnswer: '25',
          explanation: 'def square(n): return n * n — এই ফাংশন n-এর বর্গ ফেরত দেয়; square(5) হলে 25।',
          points: 4,
        },
        // 15 — পাঁচটি ফলের লিস্ট
        {
          type: 'coding',
          questionText:
            'শিরোনাম: পাঁচটি ফলের একটি লিস্ট তৈরি করে লুপ দিয়ে প্রতিটি ফল প্রিন্ট করুন।\n\n' +
            'নির্দেশনা: পাঁচটি ফল নিয়ে একটি লিস্ট তৈরি করুন এবং একটি for লুপ দিয়ে প্রতিটি ফল আলাদা লাইনে প্রিন্ট করুন।\n\n' +
            'প্রত্যাশিত আউটপুট:\nApple\nBanana\nMango\nOrange\nGuava\n\n' +
            'কাঠিন্য: মাঝারি (Medium)\n\n' +
            'ইঙ্গিত:\n• লিস্টে ফলগুলো এভাবে দিন: fruits = ["Apple", "Banana", "Mango", "Orange", "Guava"]\n• for fruit in fruits: এর ভিতরে print(fruit) লিখুন।',
          options: [],
          starterCode: 'fruits = []\n',
          correctAnswer: 'Apple\nBanana\nMango\nOrange\nGuava',
          explanation: 'fruits লিস্টে পাঁচটি ফল রেখে for fruit in fruits: print(fruit) দিয়ে প্রতিটি ফল প্রিন্ট করা হয়।',
          points: 4,
        },
      ],
    })
  }

  for (const examData of exams) {
    // Advanced Final Exam is always kept up to date: if it already exists we
    // replace its data (questions + timer) in place on the SAME document,
    // otherwise it is created. This guarantees no duplicate advanced exams and
    // removes the need to manually delete MongoDB documents before re-seeding.
    if (examData.level === 'advanced') {
      // Strip immutable/reserved fields so the payload is a pure replacement
      // document (never interpreted as update modifiers).
      const { _id, __v, ...replacement } = examData
      const updated = await Exam.findOneAndReplace(
        { level: 'advanced' },
        replacement,
        { upsert: true, returnDocument: 'after' }
      )
      console.log(`✓ Upserted "${examData.title}" (${updated._id})`)
      continue
    }

    const existing = await Exam.findOne({ level: examData.level })
    if (existing) {
      console.log(`Exam for level "${examData.level}" already exists — skipping`)
      continue
    }
    await Exam.create(examData)
    console.log(`✓ Created "${examData.title}"`)
  }

  await mongoose.disconnect()
  console.log('Done.')
}

seed().catch(err => { console.error(err); process.exit(1) })
