import helmet from 'helmet'
import { env } from '../config/env'

export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      frameAncestors: ["'none'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'"],
      mediaSrc: ["'self'"],
      workerSrc: ["'self'", 'blob:'],
      // Disallow dangerous TRUSTED_TYPES sink usage by default.
      requireTrustedTypesFor: ["'script'"],
    },
  },
  strictTransportSecurity: {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  xFrameOptions: { action: 'deny' },
  xContentTypeOptions: true,
  xPoweredBy: false,
  referrerPolicy: { policy: 'no-referrer' },
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  crossOriginEmbedderPolicy: false, // disabled for SPA asset compatibility
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  dnsPrefetchControl: { allow: false },
  // Permissions Policy: disable powerful features the LMS does not need.
  // Applied via the separate permissionsPolicy middleware below.
})

// Permissions-Policy header (helmet surface available via direct set).
export function permissionsPolicy(_req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) {
  void _req
  res.setHeader(
    'Permissions-Policy',
    [
      'accelerometer=()',
      'camera=()',
      'geolocation=()',
      'gyroscope=()',
      'magnetometer=()',
      'microphone=()',
      'payment=()',
      'usb=()',
      'interest-cohort=()',
    ].join(', '),
  )
  next()
}
