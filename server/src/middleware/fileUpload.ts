import path from 'path'
import crypto from 'crypto'
import multer from 'multer'
import { Request, Response, NextFunction } from 'express'
import { env } from '../config/env'

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.txt', '.csv', '.doc', '.docx'])
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

// Magic-byte prefixes of executable / archive types we must NEVER accept.
const EXECUTABLE_SIGNATURES: Array<[string, number[]]> = [
  ['MZ', [0x4d, 0x5a]], // PE/EXE
  ['ELF', [0x7f, 0x45, 0x4c, 0x46]], // Linux ELF
  ['Mach-O', [0xcf, 0xfa, 0xed, 0xfe]],
  ['ZIP', [0x50, 0x4b, 0x03, 0x04]],
  ['RAR', [0x52, 0x61, 0x72, 0x21]],
  ['7z', [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c]],
  ['PDF-bomb-guard', [0x25, 0x50, 0x44, 0x46]], // PDF allowed but flagged below
]

const storage = multer.memoryStorage()

export const uploadSecure = multer({
  storage,
  limits: { fileSize: env.maxUploadBytes, files: 1 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (!ALLOWED_EXT.has(ext)) return cb(new Error('File type not allowed'))
    if (!ALLOWED_MIME.has(file.mimetype)) return cb(new Error('MIME type not allowed'))
    cb(null, true)
  },
})

/**
 * Deep validation AFTER multer: re-checks extension + MIME + scans the leading
 * bytes for executable/archive signatures. Files are kept in memory (never
 * written to disk unless explicitly safe) so an uploaded executable cannot be
 * executed server-side. Call this after uploadSecure.
 */
export function scanUploadedFile(req: Request, res: Response, next: NextFunction): void {
  const file = (req as any).file as Express.Multer.File | undefined
  if (!file) return next()

  const ext = path.extname(file.originalname).toLowerCase()
  if (!ALLOWED_EXT.has(ext)) {
    res.status(400).json({ error: 'File extension not allowed' })
    return
  }
  if (!ALLOWED_MIME.has(file.mimetype)) {
    res.status(400).json({ error: 'File MIME type not allowed' })
    return
  }

  const head = Array.from(file.buffer.subarray(0, 8))
  for (const [name, sig] of EXECUTABLE_SIGNATURES) {
    if (name === 'PDF-bomb-guard') continue // PDF is allowed
    if (sig.every((b, i) => head[i] === b)) {
      res.status(400).json({ error: 'Executable uploads are not permitted' })
      return
    }
  }

  // Attach a safe random filename + integrity hash for downstream storage.
  file.filename = `${crypto.randomBytes(16).toString('hex')}${ext}`
  ;(file as any).sha256 = crypto.createHash('sha256').update(file.buffer).digest('hex')
  next()
}
