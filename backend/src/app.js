const path = require('path')
const express = require('express')
const cors = require('cors')
const { env } = require('./config/env')
const { errorHandler } = require('./middleware/errorHandler')
const { authRouter } = require('./routes/authRoutes')
const { userRouter } = require('./routes/userRoutes')
const { courseRouter } = require('./routes/courseRoutes')
const { lessonRouter } = require('./routes/lessonRoutes')
const { executionRouter } = require('./routes/executionRoutes')
const { aiRouter } = require('./routes/aiRoutes')
const { progressionRouter } = require('./routes/progressionRoutes')
const { testRouter } = require('./routes/testRoutes')
const { statsRouter } = require('./routes/statsRoutes')
const { dashboardRouter } = require('./routes/dashboardRoutes')
const { profileRouter } = require('./routes/profileRoutes')
const { leaderboardRouter } = require('./routes/leaderboardRoutes')
const { learningRouter } = require('./routes/learningRoutes')
const { examRouter } = require('./routes/examRoutes')
const { projectRouter } = require('./routes/projectRoutes')
const { notificationRouter } = require('./routes/notificationRoutes')
const { practiceRouter } = require('./routes/practiceRoutes')
const { adminRouter } = require('./routes/adminRoutes')
const { studentRouter } = require('./routes/studentRoutes')

function createApp() {
  const app = express()

  const allowedOrigins = env.clientOrigin
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. curl, Postman)
        if (!origin) return callback(null, true)
        if (allowedOrigins.includes(origin)) return callback(null, true)
        callback(new Error(`CORS: origin '${origin}' not allowed`))
      },
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '256kb' }))

  // Serve uploaded project files (ADDITIVE — used by the Project Submission feature)
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' })
  })
  app.use('/api/auth', authRouter)
  app.use('/api/users', userRouter)
  app.use('/api/courses', courseRouter)
  app.use('/api/lessons', lessonRouter)
  app.use('/api/execute', executionRouter)
  app.use('/api/ai', aiRouter)
  app.use('/api/progression', progressionRouter)
  app.use('/api/tests', testRouter)
  app.use('/api/stats', statsRouter)
  app.use('/api/dashboard', dashboardRouter)
  app.use('/api/profile', profileRouter)
  app.use('/api/leaderboard', leaderboardRouter)
  app.use('/api/learning', learningRouter)
  app.use('/api/exams', examRouter)
  app.use('/api/projects', projectRouter)
  app.use('/api/notifications', notificationRouter)
  app.use('/api/practice', practiceRouter)
  app.use('/api/admins', adminRouter)
  app.use('/api/students', studentRouter)

  app.use((_req, res) => {
    res.status(404).json({ message: 'Not found' })
  })

  app.use(errorHandler)
  return app
}

module.exports = { createApp }
