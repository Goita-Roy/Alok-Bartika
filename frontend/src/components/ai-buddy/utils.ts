import type { ChatTurn, GroupKey } from './types'

export const MODEL_NAME = 'llama-3.3-70b-versatile'
export const MODEL_PROVIDER = 'Groq'
export const MAX_MESSAGE_CHARS = 1000
export const STORAGE_KEY = 'ai-buddy.conversations'

const DAY = 24 * 60 * 60 * 1000

const MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
]

export function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function makeTitle(text: string): string {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (!cleaned) return 'নতুন কথোপকথন'
  return cleaned.length > 42 ? `${cleaned.slice(0, 42).trimEnd()}…` : cleaned
}

export function toFriendlyError(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const e = err as {
      response?: { status?: number; data?: { message?: string; feedbackPending?: boolean } }
    }
    const status = e.response?.status
    const data = e.response?.data
    if (status === 401) return 'সেশন শেষ হয়ে গেছে। আবার লগইন করুন।'
    if (status === 403 && data?.feedbackPending) return 'অনুগ্রহ করে আগে পূর্ববর্তী লেভেলের মতামত জমা দিন।'
    if (status === 429) return 'একটু বিরতি নিন — অনেকগুলো রিকোয়েস্ট পাঠানো হয়েছে। আবার চেষ্টা করুন।'
    if (status === 503) return data?.message || 'AI বাডি এখনো কনফিগার করা হয়নি।'
    if (status === 504) return 'AI বাডি অনেকক্ষণ ধরে ভাবছে। আবার চেষ্টা করুন।'
    if (status && status >= 500) return data?.message || 'AI সার্ভারে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।'
    if (status && status >= 400) return data?.message || 'অনুগ্রহ করে আবার চেষ্টা করুন।'
  }
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const m = (err as { message?: string }).message
    if (m && /network|failed to fetch|load failed|ERR_/i.test(m)) {
      return 'ইন্টারনেট সংযোগ সমস্যা হয়েছে। সংযোগ ঠিক করে আবার চেষ্টা করুন।'
    }
  }
  return 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।'
}

export function groupKeyOf(ts: number, now = Date.now()): GroupKey {
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const todayMs = startOfToday.getTime()
  if (ts >= todayMs) return 'Today'
  if (ts >= todayMs - DAY) return 'Yesterday'
  if (ts >= todayMs - 7 * DAY) return 'Previous 7 Days'
  return 'Previous 30 Days'
}

export const GROUP_ORDER: GroupKey[] = ['Today', 'Yesterday', 'Previous 7 Days', 'Previous 30 Days']

export const GROUP_LABELS: Record<GroupKey, string> = {
  Today: 'আজ',
  Yesterday: 'গতকাল',
  'Previous 7 Days': 'গত ৭ দিন',
  'Previous 30 Days': 'গত ৩০ দিন',
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

export function formatConversationDate(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const that = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((today.getTime() - that.getTime()) / DAY)
  if (diffDays <= 0) return `আজ ${pad(d.getHours())}:${pad(d.getMinutes())}`
  if (diffDays === 1) return 'গতকাল'
  if (diffDays < 7) return `${diffDays} দিন আগে`
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`
}

export function buildHistory(messages: ChatTurn[]): ChatTurn[] {
  return messages
    .filter((m) => m.role === 'user' || (m.role === 'assistant' && !m.error))
    .slice(-10)
}

export function formatTime(ts: number): string {
  try {
    return new Date(ts).toLocaleTimeString('bn-BD', { hour: 'numeric', minute: '2-digit' })
  } catch {
    const d = new Date(ts)
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
}

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const MAX_FILE_BYTES = 10 * 1024 * 1024

const IMAGE_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])
const SUPPORTED_FILE_EXTENSIONS = new Set(['py', 'cpp', 'c', 'java', 'js', 'ts', 'txt', 'pdf', 'zip'])

export function isSupportedImageFile(file: File): boolean {
  return IMAGE_MIME_TYPES.has(file.type) && file.size <= MAX_IMAGE_BYTES
}

export function isSupportedFile(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  return SUPPORTED_FILE_EXTENSIONS.has(ext) && file.size <= MAX_FILE_BYTES
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function loadImageFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('image load failed'))
    }
    img.src = url
  })
}

export async function compressImage(file: File, maxDimension = 1280, quality = 0.82): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  let img: HTMLImageElement
  try {
    img = await loadImageFile(file)
  } catch {
    return file
  }
  const scale = Math.min(1, maxDimension / Math.max(img.width, img.height))
  if (scale >= 1 && file.size <= MAX_IMAGE_BYTES) return file
  const w = Math.max(1, Math.round(img.width * scale))
  const h = Math.max(1, Math.round(img.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(img, 0, 0, w, h)
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
  if (!blob) return file
  const name = file.name.replace(/\.[^.]+$/, '') || 'image'
  return new File([blob], `${name}.jpg`, { type: 'image/jpeg' })
}

export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/```[a-zA-Z]*\n?/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/gm, '')
    .replace(/^\s*\|/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/(^|\s)_([^_]+)_(?=\s|$)/g, '$1$2')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\|/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const TABLE_DIVIDER_CELL_RE = /^:?-{2,}:?$/

const DIGIT_WORDS: Record<string, string> = {
  '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
  '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine',
}

function joinTokens(tokens: string[]): string {
  if (tokens.length === 0) return ''
  return tokens.join('. ')
}

function convertNumber(digits: string): string {
  if (digits.length === 1) return DIGIT_WORDS[digits] ?? digits
  return digits.split('').map((d) => DIGIT_WORDS[d] ?? d).join(' ')
}

function tokenizeLine(line: string): string[] {
  const tokens: string[] = []
  let i = 0
  while (i < line.length) {
    if (line[i] === '"') {
      tokens.push('Double quote')
      i++
      let content = ''
      while (i < line.length && line[i] !== '"') {
        content += line[i]
        i++
      }
      if (content) tokens.push(content)
      if (i < line.length && line[i] === '"') {
        tokens.push('Double quote')
        i++
      }
      continue
    }
    if (line[i] === "'") {
      tokens.push('Single quote')
      i++
      let content = ''
      while (i < line.length && line[i] !== "'") {
        content += line[i]
        i++
      }
      if (content) tokens.push(content)
      if (i < line.length && line[i] === "'") {
        tokens.push('Single quote')
        i++
      }
      continue
    }
    if (line[i] === '#' && tokens.length === 0) {
      const comment = line.slice(i + 1).trim()
      if (comment) {
        tokens.push('comment')
        tokens.push(comment)
      }
      break
    }
    if (/\s/.test(line[i])) {
      i++
      continue
    }
    const rest = line.slice(i)
    if (/^===?/.test(rest)) { tokens.push('equals'); i += (rest[1] === '=' ? 2 : 1); continue }
    if (/^!==?/.test(rest)) { tokens.push('not equals'); i += 2; continue }
    if (/^<==?/.test(rest)) { tokens.push('less than or equal'); i += 2; continue }
    if (/^>==?/.test(rest)) { tokens.push('greater than or equal'); i += 2; continue }
    if (/^&&/.test(rest)) { tokens.push('and'); i += 2; continue }
    if (/^\|\|/.test(rest)) { tokens.push('or'); i += 2; continue }
    if (/^>>/.test(rest)) { tokens.push('right shift'); i += 2; continue }
    if (/^<</.test(rest)) { tokens.push('left shift'); i += 2; continue }
    const ch = line[i]
    switch (ch) {
      case '=': tokens.push('equals'); i++; continue
      case '+': tokens.push('plus'); i++; continue
      case '-': tokens.push('minus'); i++; continue
      case '*': tokens.push('times'); i++; continue
      case '/': tokens.push('divides'); i++; continue
      case '%': tokens.push('modulo'); i++; continue
      case '<': tokens.push('less than'); i++; continue
      case '>': tokens.push('greater than'); i++; continue
      case '&': tokens.push('ampersand'); i++; continue
      case '|': tokens.push('pipe'); i++; continue
      case '^': tokens.push('caret'); i++; continue
      case '!': tokens.push('not'); i++; continue
      case '(': tokens.push('Open bracket'); i++; continue
      case ')': tokens.push('Close bracket'); i++; continue
      case '{': tokens.push('Open brace'); i++; continue
      case '}': tokens.push('Close brace'); i++; continue
      case '[': tokens.push('Open square bracket'); i++; continue
      case ']': tokens.push('Close square bracket'); i++; continue
      case ',': tokens.push('comma'); i++; continue
      case ';': tokens.push('semicolon'); i++; continue
      case ':': tokens.push('colon'); i++; continue
      case '.': tokens.push('dot'); i++; continue
      case '?': tokens.push('question mark'); i++; continue
      case '@': tokens.push('at'); i++; continue
      case '$': tokens.push('dollar'); i++; continue
      default:
        if (/\d/.test(ch)) {
          let numStr = ''
          while (i < line.length && /\d/.test(line[i])) { numStr += line[i]; i++ }
          tokens.push(convertNumber(numStr))
          continue
        }
        if (/[a-zA-Z_]/.test(ch)) {
          let word = ''
          while (i < line.length && /[a-zA-Z0-9_]/.test(line[i])) { word += line[i]; i++ }
          tokens.push(word)
          continue
        }
        i++
    }
  }
  return tokens
}

function codeToSpeechText(code: string, language?: string): string {
  const parts: string[] = []
  if (language) {
    parts.push(language + ' code')
  }
  const lines = code.split('\n')
  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue
    const tokens = tokenizeLine(line)
    if (tokens.length === 0) continue
    parts.push(joinTokens(tokens))
  }
  return parts.join('. ')
}

export function markdownToSpeechText(markdown: string): string {
  if (!markdown) return ''
  let text = markdown
  text = text.replace(/```([a-zA-Z]*)[^\n`]*\n?([\s\S]*?)```/g, (_m, lang: string, code: string) => {
    const label = lang ? ` ${lang} code ` : ' code '
    return `\n${label}${codeToSpeechText(code, lang || undefined)}\n`
  })
  text = text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/(^|\s)_([^_]+)_(?=\s|$)/g, '$1$2')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/^\s*([-*_])\s*\1\s*\1+\s*$/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
  let rowIndex = 0
  text = text
    .split('\n')
    .map((line) => {
      const trimmed = line.trim()
      if (!trimmed.startsWith('|')) return line
      const cells = trimmed
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((cell) => cell.trim())
        .filter((cell) => cell.length > 0)
      if (cells.length === 0) return ''
      if (cells.every((cell) => TABLE_DIVIDER_CELL_RE.test(cell))) return ''
      rowIndex++
      return cells.map((c) => c.replace(/\|/g, ' ')).join('. ') + '. Row ' + rowIndex + '.'
    })
    .join('\n')
  text = text
    .replace(/\|/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+|\n+$/g, '')
    .trim()
  return text
}

export function splitForSpeech(text: string, maxChars = 200): string[] {
  const chunks: string[] = []
  let rest = text.trim()
  while (rest.length > 0) {
    if (rest.length <= maxChars) {
      const trimmed = rest.trim()
      if (trimmed) chunks.push(trimmed)
      break
    }
    const low = Math.floor(maxChars * 0.55)
    const windowText = rest.slice(0, maxChars + 1)
    let cut = -1
    const sentence = Math.max(
      windowText.lastIndexOf('।'),
      windowText.lastIndexOf('.'),
      windowText.lastIndexOf('!'),
      windowText.lastIndexOf('?'),
      windowText.lastIndexOf('…'),
      windowText.lastIndexOf('\n'),
    )
    if (sentence > low) cut = sentence
    if (cut < 0) {
      const mid = Math.max(
        windowText.lastIndexOf(', '),
        windowText.lastIndexOf(';'),
        windowText.lastIndexOf(':'),
        windowText.lastIndexOf(' '),
      )
      if (mid > low) cut = mid
    }
    if (cut < 0) cut = maxChars
    const piece = rest.slice(0, cut + 1).trim()
    if (piece) chunks.push(piece)
    rest = rest.slice(cut + 1).trim()
  }
  return chunks
}

export function splitByLanguage(text: string): string[] {
  const segments: string[] = []
  let current = ''
  let currentIsBengali = false
  for (const char of text) {
    const isBengali = /[\u0980-\u09FF]/.test(char)
    if (current === '') {
      current = char
      currentIsBengali = isBengali
    } else if (isBengali === currentIsBengali) {
      current += char
    } else {
      segments.push(current)
      current = char
      currentIsBengali = isBengali
    }
  }
  if (current) segments.push(current)
  return segments
}

export function splitForSpeechByLanguage(text: string, maxChars = 200): string[] {
  const segments = splitByLanguage(text)
  const chunks: string[] = []
  for (const segment of segments) {
    const trimmed = segment.trim()
    if (!trimmed) continue
    if (trimmed.length <= maxChars) {
      chunks.push(trimmed)
      continue
    }
    const subChunks = splitForSpeech(trimmed, maxChars)
    chunks.push(...subChunks)
  }
  return chunks
}
