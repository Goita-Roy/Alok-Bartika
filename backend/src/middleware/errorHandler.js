function errorHandler(err, _req, res, _next) {
  console.error('[backend] error', err)

  res.status(500).json({
    message: 'Internal server error',
  })
}

module.exports = { errorHandler }
