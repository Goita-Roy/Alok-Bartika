// AI error taxonomy.
//
// Every provider failure is normalized into an AIApiError carrying:
//   - kind:       machine-readable category (drives fallback + friendly messages)
//   - statusCode: HTTP status to return to the client
//   - message:    safe, user-facing message (never leaks provider internals)
//
// Kinds marked retryable are candidates for automatic fallback to the next
// configured provider. Non-retryable kinds indicate a config/content problem
// where trying another provider would produce the same failure.

const RETRYABLE_KINDS = new Set(['network', 'timeout', 'provider_unavailable', 'rate_limited', 'server_error'])

class AIApiError extends Error {
  constructor(message, kind = 'unknown', statusCode = 500) {
    super(message)
    this.name = 'AIApiError'
    this.kind = kind
    this.statusCode = statusCode
  }
}

function isRetryableError(err) {
  return err instanceof AIApiError && RETRYABLE_KINDS.has(err.kind)
}

module.exports = { AIApiError, isRetryableError }
