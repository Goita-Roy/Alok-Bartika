const path = require('path')
const express = require('express')
const cors = require('cors')
const { env } = require('./config/env')
const { errorHandler } = require('./middleware/errorHandler')
const { protect, checkPendingFeedback } = require('./middleware/auth')
const { authRouter } = require('./routes/authRoutes')
const { userRouter } = require('./routes/userRoutes')
const { courseRouter } = require('./routes/courseRoutes')
const { lessonRouter } = require('./routes/lessonRoutes')
const { executionRouter } = require('./routes/executionRoutes')
const { aiRouter } = require('./routes/aiRoutes')
const { conversationRouter } = require('./routes/conversationRoutes')
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
const { adminDashboardRouter } = require('./routes/adminDashboardRoutes')
const { feedbackRouter } = require('./routes/feedbackRoutes')
const { systemSettingsRouter } = require('./routes/systemSettingsRoutes')
const { auditRouter } = require('./routes/auditRoutes')
const { backupRouter } = require('./routes/backupRoutes')
const { superAdminRouter } = require('./routes/superAdminRoutes')

function createApp() {
  const app = express()

  // SECURITY: when behind a single reverse proxy (Render), trust it so that
  // rate limiting and req.ip reflect the real client IP from the
  // X-Forwarded-For chain rather than the proxy's socket address.
  if (env.trustProxy) {
    app.set('trust proxy', 1)
  }

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
  // ── Route registration ───────────────────────────────────────────────────
  //
  //  ROUTES NEVER SUBJECT TO THE PENDING-FEEDBACK CHECK
  //  ────────────────────────────────────────────────
  //  These are needed for app initialization, auth, and feedback submission.
  //  The frontend handles the redirect via ProtectedRoute.
  app.use('/api/auth', authRouter)
  app.use('/api/feedback', feedbackRouter)
  app.use('/api/progression', progressionRouter)     // frontend loads progress on mount
  app.use('/api/notifications', notificationRouter)   // notification badge counts
  app.use('/api/profile', profileRouter)               // user profile page
  app.use('/api/users', userRouter)                    // user CRUD

  //  ROUTES WITH MIXED PUBLIC / PRIVATE ENDPOINTS
  //  ──────────────────────────────────────────────
  //  These have public GET routes (no `protect`).  Don't blanket-apply
  //  `protect` here or those public routes break with 401.  The frontend
  //  ProtectedRoute handles redirect when feedback is pending.
  app.use('/api/courses', courseRouter)   // GET / and /:id are public
  app.use('/api/lessons', lessonRouter)   // GET /course/:courseId and /:id are public

  //  ROUTES THAT SHOULD BE BLOCKED WHEN FEEDBACK IS PENDING
  //  ────────────────────────────────────────────────────────
  //  All routes in these routers already have `protect` applied per-route.
  //  We add `checkPendingFeedback` as a secondary security layer.  The
  //  `protect` middleware here skips if `req.user` is already set (avoiding
  //  redundant DB queries), and `checkPendingFeedback` blocks the request.
  const blockOnPending = [protect, checkPendingFeedback]
  app.use('/api/exams', ...blockOnPending, examRouter)
  app.use('/api/practice', ...blockOnPending, practiceRouter)
  app.use('/api/dashboard', ...blockOnPending, dashboardRouter)
  app.use('/api/learning', ...blockOnPending, learningRouter)
  app.use('/api/ai', ...blockOnPending, aiRouter, conversationRouter)

  //  REMAINING ROUTES — no pending-feedback block needed
  app.use('/api/execute', executionRouter)
  app.use('/api/tests', testRouter)
  app.use('/api/stats', statsRouter)
  app.use('/api/leaderboard', leaderboardRouter)
  app.use('/api/projects', projectRouter)
  app.use('/api/admins', adminRouter)
  app.use('/api/students', studentRouter)
  app.use('/api/admin/dashboard', adminDashboardRouter)
  app.use('/api/system/settings', systemSettingsRouter)
  app.use('/api/audit', auditRouter)
  app.use('/api/backup', backupRouter)
  app.use('/api/super-admin', superAdminRouter)

  app.use((_req, res) => {
    res.status(404).json({ message: 'Not found' })
  })

  app.use(errorHandler)
  return app
}

module.exports = { createApp }
