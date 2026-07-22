import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { env } from './config/env'
import { errorHandler } from './middleware/error.middleware'
import { notFoundHandler } from './middleware/notFound.middleware'
import { helmetMiddleware, permissionsPolicy } from './middleware/helmetConfig'
import { securityContext, getClientIp } from './middleware/securityLog'
import { csrfTokenIssuer, csrfProtection } from './middleware/csrf'
import { sanitizeNoSql, sanitizeInPlace, assertNoPrototypePollution } from './utils/sanitize'
import { ValidationError } from './utils/validate'
import { healthRouter } from './routes/v1/health.route'
import { buildAuthRouter } from './routes/auth'

export function createApp() {
  const app = express()

  if (env.trustProxy) app.set('trust proxy', 1)
  app.disable('x-powered-by')

  app.use(helmetMiddleware)
  app.use(permissionsPolicy)
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'))
  app.use(
    rateLimit({
      windowMs: env.rateLimitWindowMs,
      limit: env.rateLimitGeneral,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => `general:${getClientIp(req)}`,
      handler: (req, res) => {
        ;(req as any).securityLog?.('rate_limited', { detail: 'general' })
        res.status(429).json({ error: 'Too many requests, please try again later.' })
      },
    }),
  )
  app.use(
    cors({
      origin: env.clientOrigins,
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '256kb' }))
  app.use(express.urlencoded({ extended: false, limit: '256kb' }))
  app.use(cookieParser())

  // Sanitize all incoming bodies/query/params against NoSQL operator & prototype pollution.
  app.use((req, _res, next) => {
    try {
      if (req.body && typeof req.body === 'object') {
        assertNoPrototypePollution(req.body)
        req.body = sanitizeNoSql(req.body)
      }
      if (req.query && typeof req.query === 'object') sanitizeInPlace(req.query)
      if (req.params && typeof req.params === 'object') sanitizeInPlace(req.params)
      next()
    } catch (err) {
      next(err)
    }
  })

  app.use(securityContext)
  app.use(csrfTokenIssuer)
  app.use(csrfProtection)

  app.get('/', (_req, res) => {
    res.status(200).json({ service: 'alokbartika-api', version: 'v1' })
  })

  app.use('/api/v1', healthRouter)
  app.use('/api/auth', buildAuthRouter())

  // Example of applying per-resource rate limits on mounted routers:
  // app.use('/api/exam', examLimiter, examRouter)
  // app.use('/api/practice', practiceLimiter, practiceRouter)
  // app.use('/api/notifications', notificationsLimiter, notificationsRouter)
  // app.use('/api/profile', profileLimiter, profileRouter)

  app.use(notFoundHandler)
  app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: 'Validation failed', fieldErrors: err.fieldErrors })
    }
    if ((err as Error).message === 'CSRF validation failed') {
      ;(req as any).securityLog?.('csrf_failed')
      return res.status(403).json({ error: 'CSRF validation failed' })
    }
    if ((err as Error).message?.includes('not allowed')) {
      return res.status(400).json({ error: (err as Error).message })
    }
    errorHandler(err, req, res, next)
  })

  return app
}
