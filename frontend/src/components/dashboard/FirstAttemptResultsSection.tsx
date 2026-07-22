import type { FirstAttemptResult } from '../../hooks/useFirstAttemptResults'

const BN = "'Hind Siliguri', sans-serif"

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'শিক্ষানবিশ',
  intermediate: 'মধ্যবর্তী',
  advanced: 'উন্নত',
}

const LEVEL_COLORS: Record<string, { color: string; bg: string }> = {
  beginner: { color: '#0F766E', bg: '#E7F8EE' },
  intermediate: { color: '#4F46E5', bg: '#E5EEFF' },
  advanced: { color: '#B45309', bg: '#FEF3C7' },
}

// Display-only Bangla labels for the exam type coming from the API.
// The underlying API value (r.examType) is never modified.
const EXAM_TYPE_LABELS: Record<string, string> = {
  'MCQ': 'এমসিকিউ',
  'Coding': 'কোডিং',
  'Mixed (MCQ + Coding)': 'মিশ্র (এমসিকিউ + কোডিং)',
}

function examTypeLabel(type: string): string {
  return EXAM_TYPE_LABELS[type] || type
}

// Display-only Bangla labels for exam names coming from the API.
// The underlying API value (r.examName) is never modified — this is presentation only.
const EXAM_NAME_LABELS: Record<string, string> = {
  'Beginner Level – Final Level-Up Challenge': 'শিক্ষানবিস লেভেল – চূড়ান্ত মূল্যায়ন পরীক্ষা',
  'Intermediate Level – Final Challenge': 'মধ্যবর্তী লেভেল – চূড়ান্ত মূল্যায়ন পরীক্ষা',
  'Advanced Level – Final Challenge': 'উন্নত লেভেল – চূড়ান্ত মূল্যায়ন পরীক্ষা',
  'উন্নত চূড়ান্ত পরীক্ষা': 'উন্নত লেভেল – চূড়ান্ত মূল্যায়ন পরীক্ষা',
}

// Remove leading decorative characters (emoji, symbols, medals, targets, etc.)
// shown before the exam title so the title aligns left with no leftover space.
function stripLeadingDecoration(name: string): string {
  return name
    .replace(/^[^\p{L}\p{N}]+/u, '')
    .trim()
}

function examNameLabel(name: string): string {
  const cleaned = stripLeadingDecoration(name)
  return EXAM_NAME_LABELS[name] || EXAM_NAME_LABELS[cleaned] || cleaned
}

// Bengali (Bangla) month names, indexed 0-11
const BN_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
]

// Convert any English digits in a value to Bengali digits (display only)
function toBnDigits(value: string | number): string {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
  return String(value).replace(/[0-9]/g, d => bn[Number(d)])
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const day = toBnDigits(d.getDate())
  const month = BN_MONTHS[d.getMonth()]
  const year = toBnDigits(d.getFullYear())
  return `${day} ${month} ${year}`
}

export function FirstAttemptResultsSection({ results }: { results: FirstAttemptResult[] }) {
  return (
    <section
      className="rounded-[20px] p-6 transition-all duration-200"
      style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #D4E8DE', boxShadow: '0 8px 24px rgba(15,118,110,0.08)' }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold" style={{ color: '#64748B', fontFamily: BN }}>
          প্রথম পরীক্ষার ফলাফল
        </h3>
        {results.length > 0 && (
          <span
            className="text-[11px] font-bold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: '#E7F8EE', color: '#0F766E', fontFamily: BN }}
          >
            শুধু প্রথম প্রচেষ্টা
          </span>
        )}
      </div>

      {results.length === 0 ? (
        <div
          className="rounded-[16px] p-8 text-center"
          style={{ backgroundColor: '#F8FBFA', border: '1.5px dashed #D4E8DE' }}
        >
          <p className="text-3xl mb-2">📝</p>
          <p className="text-sm font-bold" style={{ color: '#64748B', fontFamily: BN }}>
            এখনও কোনো পরীক্ষা দেওয়া হয়নি
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map(r => {
            const lc = LEVEL_COLORS[r.level] || { color: '#0F766E', bg: '#E7F8EE' }
            return (
              <div
                key={r.examId}
                className="rounded-[16px] p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between transition-all duration-200 hover:-translate-y-0.5"
                style={{ backgroundColor: '#F8FBFA', border: '1.5px solid #E2EFE9' }}
              >
                {/* Left: level + name + type + date */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span
                      className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md"
                      style={{ backgroundColor: lc.bg, color: lc.color, fontFamily: BN }}
                    >
                      {LEVEL_LABELS[r.level] || r.level}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                      style={{ backgroundColor: '#EEF2F1', color: '#64748B', fontFamily: BN }}
                    >
                      {examTypeLabel(r.examType)}
                    </span>
                  </div>
                  <p className="text-sm font-bold truncate text-left" style={{ color: '#1E293B', fontFamily: BN }}>
                    {examNameLabel(r.examName)}
                  </p>
                  <p className="text-[11px] font-semibold mt-0.5" style={{ color: '#94A3B8', fontFamily: BN }}>
                    প্রথম প্রচেষ্টার তারিখ: {formatDate(r.takenAt)}
                  </p>
                </div>

                {/* Right: score + percentage + pass/fail */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-xl font-black leading-none" style={{ color: r.passed ? '#0F766E' : '#DC2626', fontFamily: BN }}>
                      {toBnDigits(r.score)}%
                    </p>
                    {r.earnedPoints !== null && r.totalPoints !== null && (
                      <p className="text-[10px] font-bold mt-1" style={{ color: '#94A3B8', fontFamily: BN }}>
                        প্রাপ্ত নম্বর: {toBnDigits(r.earnedPoints)}/{toBnDigits(r.totalPoints)}
                      </p>
                    )}
                  </div>
                  <span
                    className="text-xs font-black px-3 py-1.5 rounded-full whitespace-nowrap"
                    style={{
                      backgroundColor: r.passed ? '#E7F8EE' : '#FEECEC',
                      color: r.passed ? '#0F766E' : '#DC2626',
                      fontFamily: BN,
                    }}
                  >
                    {r.passed ? '✅ উত্তীর্ণ' : '❌ অনুত্তীর্ণ'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
