/**
 * Safe access helpers for the dashboard.
 *
 * The dashboard must NEVER white-screen because an API response is missing a
 * field or is shaped differently than expected. These helpers read nested
 * values defensively and always return a sane default, so a partial / malformed
 * response degrades gracefully instead of throwing.
 */

type Fn<T> = () => T

/** Read a value from a (possibly undefined) object path with a fallback. */
export function get<T>(obj: any, path: string, fallback: T): T {
  if (obj == null) return fallback
  const parts = path.split('.')
  let cur: any = obj
  for (const p of parts) {
    if (cur == null) return fallback
    cur = cur[p]
  }
  return (cur === undefined || cur === null) ? fallback : (cur as T)
}

/** Coerce anything into a number (default 0). */
export function toNumber(v: any, fallback = 0): number {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : fallback
}

/** Coerce anything into a string (default ''). */
export function toStr(v: any, fallback = ''): string {
  if (v === null || v === undefined) return fallback
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  try { return JSON.stringify(v) } catch { return fallback }
}

/** Coerce anything into a boolean (default false). */
export function toBool(v: any, fallback = false): boolean {
  return typeof v === 'boolean' ? v : fallback
}

/** Ensure the value is an array; returns fallback (default []) otherwise. */
export function toArray<T>(v: any, fallback: T[] = []): T[] {
  return Array.isArray(v) ? (v as T[]) : fallback
}

/** Safely map an array, dropping any element that throws. */
export function safeMap<T, R>(arr: any, fn: (item: T, i: number) => R, fallback: R[] = []): R[] {
  if (!Array.isArray(arr)) return fallback
  const out: R[] = []
  for (let i = 0; i < arr.length; i++) {
    try {
      out.push(fn(arr[i] as T, i))
    } catch {
      // skip a malformed item rather than crashing the whole list
    }
  }
  return out
}

/** Run a parser that may throw; return fallback on any error. */
export function safeParse<T>(fn: Fn<T>, fallback: T): T {
  try {
    const v = fn()
    return v === undefined || v === null ? fallback : v
  } catch {
    return fallback
  }
}
