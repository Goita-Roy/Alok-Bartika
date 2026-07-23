function errorHandler(err, _req, res, _next) {
  console.error('[backend] error', err)

  const statusCode = err.statusCode || err.status || 500
  res.status(statusCode).json({
    message: err.message || 'Internal server error',
    error: err.stack || err.toString(),
  })
}

module.exports = { errorHandler }
