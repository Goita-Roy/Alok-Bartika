/**
 * Seed script — populate sample exams for each level.
 * Run: npm run seed:exams   (from backend/)
 *
 * Uses the same connectDb helper as the server so DNS/_srv quirks are handled.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '..', '.env') })
const mongoose = require('mongoose')
const { connectDb } = require('../config/db')
const { Exam } = require('../models/Exam')
const { Course } = require('../models/Course')

async function seed() {
  const uri = process.env.MONGO_URI || process.env.DATABASE_URL
  if (!uri) throw new Error('MONGO_URI not set in .env')

  await connectDb(uri)
  console.log(`Connected to database: ${mongoose.connection.name}`)

  // Find one course per level to attach exam to
  const [begCourse, intCourse, advCourse] = await Promise.all([
    Course.findOne({ level: 'beginner' }),
    Course.findOne({ level: 'intermediate' }),
    Course.findOne({ level: 'advanced' }),
  ])

  // Fail loudly if a level has no Course document — the exam cannot be linked.
  const missing = []
  if (!begCourse) missing.push('beginner')
  if (!intCourse) missing.push('intermediate')
  if (!advCourse) missing.push('advanced')
  if (missing.length) {
    console.error(`\n✗ Cannot seed exams — missing Course documents for: ${missing.join(', ')}`)
    console.error('  Create the missing courses first, then re-run this script.\n')
    await mongoose.disconnect()
    process.exit(1)
  }

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
      isActive: true,
      questions: [
        // 1 — কম্পিউটার পরিচিতি (class-01)
        {
          type: 'mcq',
          questionText: 'কম্পিউটার মূলত কী করে?',
          options: [
            'শুধুমাত্র ছবি দেখায়',
            'তথ্য প্রক্রিয়াকরণ (data processing) করে',
            'শুধুমাত্র গান বাজায়',
            'ইন্টারনেট চালায়',
          ],
          correctAnswer: 1,
          explanation: 'কম্পিউটার হলো একটি ইলেকট্রনিক যন্ত্র যা input নিয়ে প্রক্রিয়াকরণ করে এবং output দেয়।',
          points: 2,
        },
        // 2 — সিপিইউ (class-02)
        {
          type: 'mcq',
          questionText: 'সিপিইউ (CPU) কম্পিউটারের কোন অংশের সাথে সবে বেশি মিল?',
          options: [
            'হৃদয়',
            'মস্তিষ্ক',
            'চোখ',
            'হাত',
          ],
          correctAnswer: 1,
          explanation: 'সিপিইউ হলো কম্পিউটারের "মস্তিষ্ক" — এটিই সব গণনা ও নির্দেশনা প্রক্রিয়াকরণ করে।',
          points: 2,
        },
        // 3 — র‍্যাম (class-03)
        {
          type: 'mcq',
          questionText: 'র‍্যাম (RAM) কোন ধরনের মেমোরি?',
          options: [
            'স্থায়ী (non-volatile)',
            'অস্থায়ী (volatile)',
            'বাইরের (external)',
            'অপটিক্যাল',
          ],
          correctAnswer: 1,
          explanation: 'র‍্যাম হলো অস্থায়ী মেমোরি — কম্পিউটার বন্ধ হলে তাতে থাকা তথ্য মিয়ে যায়।',
          points: 2,
        },
        // 4 — স্টোরেজ (class-04)
        {
          type: 'mcq',
          questionText: 'নিচের কোনটি স্থায়ী (non-volatile) স্টোরেজ?',
          options: [
            'র‍্যাম (RAM)',
            'ক্যাশ মেমোরি',
            'হার্ড ডিস্ক ড্রাইভ (HDD)',
            'রেজিস্টার',
          ],
          correctAnswer: 2,
          explanation: 'হার্ড ডিস্ক ড্রাইভ (HDD) একটি স্থায়ী স্টোরেজ — কম্পিউটার বন্ধ হলেও তথ্য থাকে।',
          points: 2,
        },
        // 5 — ইনপুট ডিভাইস (class-05)
        {
          type: 'mcq',
          questionText: 'নিচের কোনটি একটি ইনপুট ডিভাইস?',
          options: [
            'প্রিন্টার',
            'মনিটর',
            'কীবোর্ড',
            'স্পিকার',
          ],
          correctAnswer: 2,
          explanation: 'কীবোর্ড একটি ইনপুট ডিভাইস — এটি দিয়ে আমরা কম্পিউটারে তথ্য প্রবেশ করাই।',
          points: 2,
        },
        // 6 — আউটপুট ডিভাইস (class-06)
        {
          type: 'mcq',
          questionText: 'নিচের কোনটি একটি আউটপুট ডিভাইস?',
          options: [
            'মাউস',
            'স্ক্যানার',
            'মনিটর',
            'মাইক্রোফোন',
          ],
          correctAnswer: 2,
          explanation: 'মনিটর একটি আউটপুট ডিভাইস — এটি কম্পিউটারের ফলাফল দেখায়।',
          points: 2,
        },
        // 7 — সফটওয়্যার (class-07)
        {
          type: 'mcq',
          questionText: 'সফটওয়্যার বলতে কী বোঝায়?',
          options: [
            'কম্পিউটারের শারীরিক অংশ',
            'নির্দেশনা ও প্রোগ্রামের সমন্বয়',
            'ইলেকট্রিক সার্কিট',
            'কম্পিউটারের তার',
          ],
          correctAnswer: 1,
          explanation: 'সফটওয়্যার হলো প্রোগ্রাম ও নির্দেশনার সমন্বয় যা হার্ডওয়্যারকে চালায়।',
          points: 2,
        },
        // 8 — অপারেটিং সিস্টেম (class-08)
        {
          type: 'mcq',
          questionText: 'অপারেটিং সিস্টেম (OS) এর প্রধান কাজ কী?',
          options: [
            'গান প্লে করা',
            'হার্ডওয়্যার ও সফটওয়্যারের মধ্যে সমন্বয় করা',
            'ইমেইল পাঠানো',
            'ছবি আঁকা',
          ],
          correctAnswer: 1,
          explanation: 'অপারেটিং সিস্টেম হলো কম্পিউটারের "ম্যানেজার" — এটি হার্ডওয়্যার ও সফটওয়্যারের মধ্যে সমন্বয় করে।',
          points: 2,
        },
        // 9 — ইন্টারনেট (class-09)
        {
          type: 'mcq',
          questionText: 'ইন্টারনেট কী?',
          options: [
            'একটি হার্ডওয়্যার',
            'বিশ্বব্যাপী কম্পিউটার নেটওয়ার্কের সংযোগ',
            'একটি অপারেটিং সিস্টেম',
            'একটি প্রিন্টার',
          ],
          correctAnswer: 1,
          explanation: 'ইন্টারনেট হলো বিশ্বব্যাপী কম্পিউটার নেটওয়ার্ক যা বিভিন্ন ডিভাইসকে পরস্পর সংযুক্ত করে।',
          points: 2,
        },
        // 10 — সাইবার নিরাপত্তা (class-10)
        {
          type: 'mcq',
          questionText: 'পাসওয়ার্ড কেন শক্তিশালী রাখা উচিত?',
          options: [
            'কারণ এটি সুন্দর দেখায়',
            'অননুমোদিত প্রবেশ থেকে অ্যাকাউন্ট রক্ষা করতে',
            'কারণ সবাই এটি জানে',
            'কারণ কম্পিউটার এটি চায়',
          ],
          correctAnswer: 1,
          explanation: 'শক্তিশালী পাসওয়ার্ড আপনার অ্যাকাউন্টকে হ্যাকার ও অননুমোদিত প্রবেশ থেকে রক্ষা করে।',
          points: 2,
        },
        // 11 — লজিক: বাইনারি
        {
          type: 'mcq',
          questionText: 'কম্পিউটার মূলত কোন সংখ্যা পদ্ধতি ব্যবহার করে?',
          options: [
            'দশমিক (decimal)',
            'দ্বিমিক (binary)',
            'ষোড়শ (hexadecimal)',
            'অক্টাল (octal)',
          ],
          correctAnswer: 1,
          explanation: 'কম্পিউটার বিট (0 ও 1) দিয়ে কাজ করে, তাই দ্বিমিক (binary) সংখ্যা পদ্ধতি ব্যবহার করে।',
          points: 2,
        },
        // 12 — লজিক: গেট
        {
          type: 'mcq',
          questionText: 'AND গেটে উভয় ইনপুট true (1) হলে আউটপুট কী হবে?',
          options: [
            '0 (false)',
            '1 (true)',
            'undefined',
            'null',
          ],
          correctAnswer: 1,
          explanation: 'AND গেটে দুটি ইনপুটই true হলেই আউটপুট true হয়।',
          points: 2,
        },
        // 13 — লজিক: অ্যালগরিদম
        {
          type: 'mcq',
          questionText: 'অ্যালগরিদম বলতে কী বোঝায়?',
          options: [
            'একটি প্রোগ্রামিং ভাষা',
            'কোনো সমস্যা সমাধানের পদ্ধতিগত ধাপ',
            'একটি হার্ডওয়্যার ডিভাইস',
            'একটি ওয়েবসাইট',
          ],
          correctAnswer: 1,
          explanation: 'অ্যালগরিদম হলো কোনো কাজ সম্পন্ন করার পদ্ধতিগত ধাপের সমন্বয়।',
          points: 2,
        },
        // 14 — লজিক: লুপ
        {
          type: 'mcq',
          questionText: 'একটি loop (যেমন for loop) কখন ব্যবহার করা হয়?',
          options: [
            'একটি বার কাজ করতে হলে',
            'একই কাজ বারবার করতে হলে',
            'ডেটা মুছে ফেলতে হলে',
            'নতুন ভেরিয়েবল তৈরি করতে হলে',
          ],
          correctAnswer: 1,
          explanation: 'loop বা লুপ ব্যবহার করা হয় যখন একই কাজ একাধিক বার পুনরাবৃত্তি করতে হয়।',
          points: 2,
        },
        // 15 — লজিক: ভেরিয়েবল
        {
          type: 'mcq',
          questionText: 'একটি variable (ধ্রুবক) কীসের জন্য ব্যবহৃত হয়?',
          options: [
            'প্রোগ্রাম বন্ধ করার জন্য',
            'মান বা তথ্য সাময়িকভাবে সংরক্ষণ করার জন্য',
            'ইন্টারনেট সংযোগ স্থাপন করার জন্য',
            'প্রিন্টার চালানোর জন্য',
          ],
          correctAnswer: 1,
          explanation: 'variable হলো একটি নামযুক্ত জায়গা যেখানে মান (সংখ্যা, লেখা ইত্যাদি) সাময়িকভাবে সংরক্ষণ করা হয়।',
          points: 2,
        },
      ],
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
    // Each level exam is always kept up to date: if it already exists we
    // replace its data (questions + timer) in place on the SAME document,
    // otherwise it is created. This guarantees no duplicate exams and
    // removes the need to manually delete MongoDB documents before re-seeding.
    const { _id, __v, ...replacement } = examData
    const updated = await Exam.findOneAndReplace(
      { level: examData.level },
      replacement,
      { upsert: true, returnDocument: 'after' }
    )
    console.log(`✓ Upserted "${examData.title}" (${updated._id})`)
  }

  await mongoose.disconnect()
  console.log('Done.')
}

seed().catch(err => { console.error(err); process.exit(1) })
