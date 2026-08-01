function errorHandler(err, _req, res, _next) {
  const isProd = process.env.NODE_ENV === 'production'
  const statusCode = err.statusCode || err.status || 500

  // Always log the full error server-side; never leak internals to clients.
  console.error('[backend] error', err)

  const message =
    statusCode >= 500
      ? isProd
        ? 'Internal server error'
        : err.message || 'Internal server error'
      : err.message || 'Request failed'

  const payload = {
    success: false,
    message,
  }

  // Development only: attach diagnostics to help debugging.
  if (!isProd) {
    payload.error = err.message || String(err)
    payload.stack = err.stack
  }

  res.status(statusCode).json(payload)
}

module.exports = { errorHandler }
