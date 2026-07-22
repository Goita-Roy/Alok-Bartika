function isEmail(value) {
  if (typeof value !== 'string') return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function normalizePhone(value) {
  if (typeof value !== 'string') return null
  const cleaned = value.replace(/[^\d+]/g, '')
  if (cleaned.length < 8) return null
  return cleaned
}

module.exports = {
  isEmail,
  normalizePhone,
}

