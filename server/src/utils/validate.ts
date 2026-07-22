export class ValidationError extends Error {
  fieldErrors: Record<string, string>
  constructor(fieldErrors: Record<string, string>) {
    super('Validation failed')
    this.name = 'ValidationError'
    this.fieldErrors = fieldErrors
  }
}

export function isEmail(value: unknown): value is string {
  if (typeof value !== 'string') return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function normalizePhone(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const cleaned = value.replace(/[^\d+]/g, '')
  if (cleaned.length < 8) return null
  return cleaned
}

const COMPLEXITY = {
  minLength: 8,
  requireUpper: true,
  requireLower: true,
  requireNumber: true,
  requireSpecial: true,
}

export function passwordComplexityError(password: unknown): string | null {
  if (typeof password !== 'string') return 'Password is required'
  if (password.length < COMPLEXITY.minLength) return `Password must be at least ${COMPLEXITY.minLength} characters`
  if (COMPLEXITY.requireUpper && !/[A-Z]/.test(password)) return 'Password must contain an uppercase letter'
  if (COMPLEXITY.requireLower && !/[a-z]/.test(password)) return 'Password must contain a lowercase letter'
  if (COMPLEXITY.requireNumber && !/\d/.test(password)) return 'Password must contain a number'
  if (COMPLEXITY.requireSpecial && !/[^A-Za-z0-9]/.test(password)) return 'Password must contain a special character'
  // Reject obviously common/sequential patterns.
  if (/^(.)\1+$/.test(password)) return 'Password is too repetitive'
  return null
}

export function asString(value: unknown, maxLen = 1000): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLen) : ''
}
