const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },
    firebaseUid: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },

    // Student Information
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    profilePicture: {
      type: String,
      default: '',
    },
    profile: {
      avatar: { type: String, default: '' },
      schoolName: { type: String, trim: true, default: '' },
      className: { type: String, trim: true, default: '' },
      roll: { type: String, trim: true, default: '' },
      address: { type: String, trim: true, default: '' },
      phone: { type: String, trim: true, default: '' },
      bio: { type: String, trim: true, default: '' },
      birthDate: { type: Date },
    },

    // Academic Information
    schoolName: {
      type: String,
      trim: true,
    },
    grade: {
      type: String,
      trim: true,
    },
    section: {
      type: String,
      trim: true,
    },
    studentId: {
      type: String,
      trim: true,
    },
    interests: {
      type: String,
      trim: true,
    },
    preferredLanguage: {
      type: String,
      trim: true,
    },
    skillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },

    // Location Information
    country: {
      type: String,
      default: 'Bangladesh',
    },
    division: {
      type: String,
    },
    city: {
      type: String,
    },

    // Platform State
    role: {
      type: String,
      enum: ['student', 'teacher', 'parent', 'admin'],
      default: 'student',
    },

    // Google OAuth (optional — only present for Google-created accounts)
    picture: {
      type: String,
      trim: true,
      default: '',
    },

    // Verification status (set separately depending on channel verified)
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    termsAccepted: {
      type: Boolean,
      required: true,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Password Reset (OTP)
    resetOtp: {
      type: String,
    },
    resetOtpExpire: {
      type: Date,
    },

    // Gamification & Progress
    xp: {
      type: Number,
      default: 0,
      min: 0,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    badges: [
      {
        name: { type: String },
        awardedAt: { type: Date, default: Date.now },
        icon: { type: String },
      },
    ],
    // Canonical lesson slugs ONLY (e.g. class-01, intermediate-algorithm,
    // advanced-modules). Never store ObjectIds, lesson-* ids, or duplicates.
    completedLessons: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => Array.isArray(v) && v.every((s) => /^((class-\d{2})|(intermediate-[a-z-]+)|(advanced-[a-z-]+))$/.test(s)),
        message: 'completedLessons must contain only canonical lesson slugs',
      },
    },
    unlockedLessons: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => Array.isArray(v) && v.every((s) => /^((class-\d{2})|(intermediate-[a-z-]+)|(advanced-[a-z-]+))$/.test(s)),
        message: 'unlockedLessons must contain only canonical lesson slugs',
      },
    },
    // Canonical lesson slug (string) — mirrors completedLessons storage.
    currentLessonId: {
      type: String,
      default: null,
    },
    lastActivityTime: {
      type: Date,
      default: Date.now,
    },
    // Course ObjectIds ONLY. Never lesson ids / slugs.
    completedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    unlockedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    currentStage: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    // Derived ONLY from completedExams/completedCourses (never client-set).
    completedLevels: {
      type: [String],
      enum: ['beginner', 'intermediate', 'advanced'],
      default: [],
    },
    unlockedLevels: {
      type: [String],
      enum: ['beginner', 'intermediate', 'advanced'],
      default: ['beginner'],
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastVisitedCourse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    // Canonical lesson slug (string).
    lastVisitedLesson: {
      type: String,
      default: null,
    },
    lastVisitedStage: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    examMarks: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    readingProgress: {
      type: Map,
      of: Number,
      default: {},
    },
    quizScores: {
      type: Map,
      of: Number,
      default: {},
    },
    quizScore: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Exam Progression
    completedExams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
      },
    ],
    examAttempts: {
      // key: examId string → array of attempt objects
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Practice & Quiz Completions — canonical lesson slugs ONLY.
    practiceCompleted: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => Array.isArray(v) && v.every((s) => /^((class-\d{2})|(intermediate-[a-z-]+)|(advanced-[a-z-]+))$/.test(s)),
        message: 'practiceCompleted must contain only canonical lesson slugs',
      },
    },

    // Per-practice working state — MongoDB is the single source of truth.
    // Keyed by canonical lesson slug (or a stable key like "sandbox").
    // Restores editor code/language/cursor/scroll/time-spent across refresh,
    // logout, and different devices/browsers.
    practiceProgress: {
      type: Map,
      of: new mongoose.Schema(
        {
          slug: { type: String },
          lesson: { type: String }, // canonical lesson slug
          language: { type: String, default: 'python' },
          files: [
            {
              name: { type: String },
              language: { type: String, default: 'python' },
              content: { type: String, default: '' },
            },
          ],
          activeFileId: { type: String },
          code: { type: String, default: '' }, // active file content (convenience)
          timeSpent: { type: Number, default: 0 }, // seconds
          score: { type: Number, default: 0 },
          completed: { type: Boolean, default: false },
          cursor: {
            line: { type: Number, default: 1 },
            column: { type: Number, default: 1 },
          },
          scroll: { type: Number, default: 0 },
          lastOpened: { type: Date, default: Date.now },
        },
        { _id: false },
      ),
      default: {},
    },

    // Achievements
    achievements: [
      {
        name: { type: String },
        description: { type: String },
        icon: { type: String, default: '🏅' },
        awardedAt: { type: Date, default: Date.now },
      },
    ],

    // Learning Analytics
    learningAnalytics: {
      totalMinutes: { type: Number, default: 0, min: 0 },
      weeklyMinutes: { type: Number, default: 0, min: 0 },
      lastActiveAt: { type: Date },
      dailyLogs: [
        {
          date: { type: String, required: true },
          minutes: { type: Number, default: 0, min: 0 },
          tabSwitches: { type: Number, default: 0, min: 0 },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
)

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model('User', userSchema)

module.exports = { User }
