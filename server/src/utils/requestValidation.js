function asTrimmedString(value, maxLen = 1000) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLen)
}

function cleanMultilineText(value, maxLen = 5000) {
  if (typeof value !== 'string') return ''
  return value.replace(/\r\n/g, '\n').replace(/\0/g, '').slice(0, maxLen)
}

function safeBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return fallback
}

function safeNumber(value, fallback = 0, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

module.exports = {
  asTrimmedString,
  cleanMultilineText,
  safeBoolean,
  safeNumber,
}
