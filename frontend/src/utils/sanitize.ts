/**
 * sanitizeText — client-side XSS protection for defense-in-depth.
 *
 * React already escapes text content when rendering via {msg.message},
 * but this utility provides an additional safety layer against any
 * accidental use of dangerouslySetInnerHTML or similar patterns.
 *
 * The backend also sanitizes messages before saving (backend/src/utils/sanitize.js).
 */

export function sanitizeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
}
