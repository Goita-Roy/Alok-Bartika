const express = require('express')
const { authRequired, requireRole } = require('../middleware/auth')

function levelFromXp(xp) {
  const safe = Math.max(0, Number(xp) || 0)
  const level = Math.floor(safe / 500) + 1
  const nextLevelXp = level * 500
  const prevLevelXp = (level - 1) * 500
  const intoLevel = safe - prevLevelXp
  const levelSpan = nextLevelXp - prevLevelXp
  const progress01 = levelSpan === 0 ? 0 : intoLevel / levelSpan
  return { xp: safe, level, nextLevelXp, progress01 }
}

function buildStudentRouter({ jwtSecret }) {
  const router = express.Router()

  router.get(
    '/dashboard',
    authRequired(jwtSecret),
    requireRole('student'),
    (req, res) => {
      // For now we return demo data keyed off the JWT identity.
      // Later this can be backed by Mongo collections.
      const seed = String(req.user?.sub ?? 'student')
      const lessonsCompleted = (seed.length * 3) % 24
      const totalLessons = 24
      const xp = 250 + lessonsCompleted * 35
      const levelInfo = levelFromXp(xp)

      const recommended = {
        id: 'lesson-strings-01',
        title: 'Fun with Strings',
        level: 'Beginner',
        durationMin: 12,
        description: 'Learn string basics with quick games and examples.',
      }

      const courses = [
        {
          level: 'Beginner',
          color: 'green',
          items: [
            { id: 'b1', title: 'Intro to Computers', lessons: 8, done: Math.min(lessonsCompleted, 8) },
            { id: 'b2', title: 'Typing & Basics', lessons: 8, done: Math.max(0, Math.min(lessonsCompleted - 8, 8)) },
          ],
        },
        {
          level: 'Intermediate',
          color: 'amber',
          items: [{ id: 'i1', title: 'Logic & Patterns', lessons: 8, done: Math.max(0, Math.min(lessonsCompleted - 16, 8)) }],
        },
        {
          level: 'Advanced',
          color: 'violet',
          items: [{ id: 'a1', title: 'Mini Projects', lessons: 6, done: 0 }],
        },
      ]

      const quiz = {
        next: {
          id: 'quiz-01',
          title: 'Quick Quiz: Basics',
          questions: 8,
          estMin: 6,
        },
        lastScore: 78,
      }

      const performance = {
        streakDays: 3,
        accuracy: 0.82,
        avgSessionMin: 18,
      }

      res.json({
        ok: true,
        progress: {
          lessonsCompleted,
          totalLessons,
          percent: totalLessons ? Math.round((lessonsCompleted / totalLessons) * 100) : 0,
        },
        xp: levelInfo,
        recommended,
        courses,
        quiz,
        performance,
      })
    },
  )

  return router
}

module.exports = { buildStudentRouter }

