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
