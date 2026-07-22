const FORBIDDEN_KEYS = ['$where', '$regex', '$near', '$nearSphere', '$center', '$centerSphere', '$expr', '$function', '$accumulator', '$merge', '$out', '$lookup', '$unionWith']

export function sanitizeNoSql(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeNoSql)
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      // Block operator injection (keys starting with $) and prototype pollution.
      if (k.startsWith('$') || k === '__proto__' || k === 'constructor' || FORBIDDEN_KEYS.includes(k)) {
        continue
      }
      out[k] = sanitizeNoSql(v)
    }
    return out
  }
  return value
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  return sanitizeNoSql(obj) as T
}

/**
 * Sanitizes an object IN PLACE. Use this for Express 5 req.query / req.params
 * which are read-only getters and cannot be reassigned.
 */
export function sanitizeInPlace(value: unknown): void {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) sanitizeInPlace(value[i])
    return
  }
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key === '__proto__' || key === 'constructor' || FORBIDDEN_KEYS.includes(key)) {
        delete obj[key]
      } else {
        sanitizeInPlace(obj[key])
      }
    }
  }
}

/**
 * Removes __proto__/constructor from any parsed/merged object to prevent
 * prototype pollution. Throws on detection so callers can reject the request.
 */
export function assertNoPrototypePollution(obj: unknown, path = 'root'): void {
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => assertNoPrototypePollution(v, `${path}[${i}]`))
    return
  }
  if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj as Record<string, unknown>)) {
      if (key === '__proto__' || key === 'constructor') {
        throw new Error(`Prototype pollution attempt at ${path}.${key}`)
      }
      assertNoPrototypePollution((obj as Record<string, unknown>)[key], `${path}.${key}`)
    }
  }
}
