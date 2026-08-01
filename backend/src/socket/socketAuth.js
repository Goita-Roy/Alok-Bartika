/**
 * Socket.IO JWT Authentication Middleware
 *
 * Reuses the same JWT_SECRET and User model as the Express `protect` middleware
 * so there is a single source of truth for auth logic.
 */

const jwt = require('jsonwebtoken')
const { env } = require('../config/env')
const { User } = require('../models/User')

const JWT_SECRET = env.jwtSecret

/**
 * Socket.IO middleware: verify JWT and attach authenticated user to socket.
 *
 * The token may arrive via:
 *   - socket.handshake.auth.token   (preferred, set by frontend socket client)
 *   - socket.handshake.query.token  (fallback, for environments that can't set auth headers)
 *
 * On success:  calls next() with socket.user populated.
 * On failure:  calls next(new Error('...')), which Socket.IO will emit as a
 *              'connect_error' event on the client and never open the connection.
 */
async function socketAuth(socket, next) {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token ||
      null

    if (!token) {
      return next(new Error('AUTH_NO_TOKEN'))
    }

    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new Error('AUTH_TOKEN_EXPIRED'))
      }
      return next(new Error('AUTH_TOKEN_INVALID'))
    }

    const user = await User.findById(decoded.id).select('-password').lean()
    if (!user) {
      return next(new Error('AUTH_USER_NOT_FOUND'))
    }

    if (user.isActive === false) {
      return next(new Error('AUTH_ACCOUNT_SUSPENDED'))
    }

    // Attach authenticated user to the socket instance
    socket.user = {
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    }

    next()
  } catch (error) {
    console.error('[socketAuth] Unexpected error:', error.message)
    next(new Error('AUTH_INTERNAL_ERROR'))
  }
}

module.exports = { socketAuth }
