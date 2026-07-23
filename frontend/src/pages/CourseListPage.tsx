import { useQuery } from '@tanstack/react-query'
import { useMemo, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Trophy, Lock, CheckCircle2, ChevronRight, Sparkles, FileText, RefreshCw } from 'lucide-react'
import { API_BASE_URL } from '../config/api'
import { ClassCard } from '../components/course/ClassCard'
import { useCourseProgress } from '../hooks/useCourseProgress'
import { useFirstAttemptResults } from '../hooks/useFirstAttemptResults'
import { lessonClasses } from '../components/beginner-content/lessonConfig'
import { ProjectSubmissionSection } from '../components/project/ProjectSubmissionSection'

// ── Color tokens ──────────────────────────────────────────────────────────────
const C = {
  accent:   'var(--color-accent)',
  hover:    'var(--color-accent-light)',
  lockedBg: 'var(--color-accent-pale)',
  cardBg:   'var(--color-white)',
  warn:     'var(--color-warn)',
  text:     'var(--color-text)',
  secondary:'var(--color-text-muted)',
  muted:    'var(--color-text-muted)',
  border:   'var(--color-border)',
  bg:       'var(--color-bg)',
}

const BN_LEVELS: Record<string, string> = {
  beginner:     'শিক্ষানবিশ',
  intermediate: 'মধ্যবর্তী',
  advanced:     'উন্নত',
}

// Intermediate lessons are completed/tracked under stable mock IDs
// (e.g. "intermediate-algorithm") by IntermediateCoursePage and the backend —
// NOT under their MongoDB _id. Map each API lesson back to that mock ID so the
// Course List reflects the exact same completion / unlock state.
const INTERMEDIATE_LESSON_ORDER = [
  'algorithm', 'flowchart', 'events', 'logic', 'loops',
  'variables', 'ifelse', 'operators', 'sensing', 'sound',
]
// The Intermediate course in the database contains extra non-core lessons
// (e.g. "Mini Project", "Transition to Python", "Smart City Explorer") that the
// frontend does not track. Progress and the Final Exam unlock must be based only
// on the 10 core lessons the student actually completes.
const INTERMEDIATE_TRACKED_IDS = INTERMEDIATE_LESSON_ORDER.map(s => `intermediate-${s}`)
export function toIntermediateMockId(lesson: Lesson, idx: number): string {
  const order = typeof lesson.order === 'number' ? lesson.order : idx + 1
  const lid = INTERMEDIATE_LESSON_ORDER[order - 1]
  return lid ? `intermediate-${lid}` : `intermediate-${idx + 1}`
}

// Advanced lessons are completed/tracked under stable mock IDs
// (e.g. "advanced-hello-world") by AdvancedCoursePage — NOT under their MongoDB
// _id. Order matches the 8 core Python lessons defined in AdvancedCoursePage.
const ADVANCED_LESSON_ORDER = [
  'hello-world', 'variables', 'errors', 'loops',
  'lists', 'functions', 'class-object', 'modules',
]
const ADVANCED_TRACKED_IDS = ADVANCED_LESSON_ORDER.map(s => `advanced-${s}`)
export function toAdvancedMockId(lesson: Lesson, idx: number): string {
  const order = typeof lesson.order === 'number' ? lesson.order : idx + 1
  const lid = ADVANCED_LESSON_ORDER[order - 1]
  return lid ? `advanced-${lid}` : `advanced-${idx + 1}`
}

// ── Interfaces (unchanged) ────────────────────────────────────────────────────
interface Lesson {
  _id: string; title: string; content?: string
  videoUrl?: string; htmlUrl?: string; order?: number; slug: string
}
interface Course {
  _id: string; title: string
  level: 'beginner' | 'intermediate' | 'advanced'
  description?: string; thumbnailUrl?: string
}

// ── Animated counter (logic unchanged) ───────────────────────────────────────
function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (value === 0) { setDisplay(0); return }
    let start = 0
    const step = Math.max(1, Math.floor(value / 20))
    const timer = setInterval(() => {
      start += step
      if (start >= value) { setDisplay(value); clearInterval(timer) }
      else setDisplay(start)
    }, 30)
    return () => clearInterval(timer)
  }, [value])
  return <>{display}</>
}

// ── Level type ────────────────────────────────────────────────────────────────
type Level = 'beginner' | 'intermediate' | 'advanced'

// ── Level section header ──────────────────────────────────────────────────────
interface LevelHeaderProps {
  icon: string; label: string; stage: string
  progress: number; isCompleted: boolean; isLocked: boolean
  canComplete: boolean; onComplete: () => void
  hideCompleteButton?: boolean
}

function LevelHeader({ icon, label, stage, progress, isCompleted, isLocked, canComplete, onComplete, hideCompleteButton }: LevelHeaderProps) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 rounded-2xl p-5"
      style={{
        backgroundColor: C.cardBg,
        border: `1.5px solid ${C.border}`,
        borderRadius: '20px',
        boxShadow: '0 2px 10px rgba(29,158,117,0.07)',
      }}
    >
      {/* Left: icon + title */}
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
          style={{ backgroundColor: isLocked ? C.lockedBg : 'rgba(29,158,117,0.10)', border: `1.5px solid ${C.border}` }}
        >
          {icon}
        </div>
        <div>
          <h2
            className="font-black tracking-tight"
            style={{ fontSize: '28px', color: isLocked ? C.muted : C.text, fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            {label}
          </h2>
          <p
            className="font-bold uppercase tracking-widest mt-0.5"
            style={{ fontSize: '13px', color: C.muted, fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            {stage}
          </p>
        </div>
      </div>

      {/* Right: progress + badge */}
      <div className="flex items-center gap-4 sm:text-right">
        <div className="flex flex-col items-end gap-1.5 min-w-[140px]">
          <div className="flex items-center justify-between w-full">
            <span
              className="font-bold"
              style={{ fontSize: '15px', color: C.muted, fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              {progress}% সম্পন্ন
            </span>
            {isCompleted && (
              <span
                className="inline-flex items-center gap-1 font-black rounded-full px-2.5 py-0.5"
                style={{ fontSize: '13px', backgroundColor: 'rgba(29,158,117,0.12)', color: C.accent, fontFamily: "'Hind Siliguri', sans-serif" }}
              >
                <CheckCircle2 size={12} /> শেষ
              </span>
            )}
          </div>
          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: C.border }}>
            <div
              className="h-2.5 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%`, backgroundColor: C.accent }}
            />
          </div>
        </div>

        {/* Status badge / button */}
        {isLocked ? (
          <span
            className="inline-flex items-center gap-2 font-bold rounded-2xl px-4 py-2.5 shrink-0"
            style={{ fontSize: '15px', backgroundColor: C.lockedBg, color: C.muted, border: `1px solid ${C.border}`, fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            <Lock size={15} /> লক
          </span>
        ) : isCompleted || hideCompleteButton ? null : (
          <button
            type="button"
            disabled={!canComplete}
            onClick={onComplete}
            className="inline-flex items-center gap-2 font-bold rounded-2xl px-4 py-2.5 shrink-0 transition-all duration-200"
            style={{
              fontSize: '15px',
              backgroundColor: canComplete ? 'rgba(29,158,117,0.10)' : C.lockedBg,
              color: canComplete ? C.accent : C.muted,
              border: `1.5px solid ${canComplete ? C.hover : C.border}`,
              cursor: canComplete ? 'pointer' : 'not-allowed',
              fontFamily: "'Hind Siliguri', sans-serif",
            }}
            onMouseEnter={e => { if (canComplete) { (e.currentTarget as HTMLElement).style.backgroundColor = C.hover; (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)' } }}
            onMouseLeave={e => { if (canComplete) { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(29,158,117,0.10)'; (e.currentTarget as HTMLElement).style.transform = 'scale(1)' } }}
          >
            <Trophy size={15} /> লেভেল শেষ করুন
          </button>
        )}
      </div>
    </div>
  )
}

// ── Locked section placeholder ────────────────────────────────────────────────
function LockedSection({ message }: { message: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-5 py-16 px-6 text-center"
      style={{ backgroundColor: C.lockedBg, border: `1.5px dashed ${C.hover}`, borderRadius: '20px' }}
    >
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
        style={{ backgroundColor: C.cardBg, border: `1.5px solid ${C.border}`, boxShadow: '0 4px 14px rgba(29,158,117,0.10)' }}
      >
        🔒
      </div>
      <div className="space-y-2">
        <h3
          className="font-black"
          style={{ fontSize: '22px', color: C.text, fontFamily: "'Hind Siliguri', sans-serif" }}
        >
          এই বিভাগটি লক করা আছে
        </h3>
        <p
          className="font-medium leading-relaxed max-w-sm mx-auto"
          style={{ fontSize: '17px', color: C.secondary, fontFamily: "'Hind Siliguri', sans-serif" }}
        >
          {message}
        </p>
      </div>
      <span
        className="inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded-2xl"
        style={{ fontSize: '15px', backgroundColor: 'rgba(29,158,117,0.10)', color: C.accent, border: `1px solid ${C.border}`, fontFamily: "'Hind Siliguri', sans-serif" }}
      >
        <Lock size={15} /> আগের বিভাগ সম্পন্ন করুন
      </span>
    </div>
  )
}

// ── Descriptions ──────────────────────────────────────────────────────────────
const ADVANCED_DESCS = [
  'Hello World — পাইথনের সাথে প্রথম পরিচয়।',
  'ভ্যারিয়েবলস — ডেটা সংরক্ষণ ও পরিচালনা।',
  'ত্রুটি সনাক্তকরণ ও সমাধান শেখো।',
  'Loops — কোড পুনরাবৃত্তি করার শক্তি।',
  'Lists — একসাথে অনেক ডেটা সংরক্ষণ।',
  'Functions — কোড পুনর্ব্যবহারযোগ্য করো।',
  'Class ও Object — OOP-এর দুনিয়ায় প্রবেশ।',
  'Modules — বড় প্রজেক্ট তৈরির রহস্য।',
]

const INTERMEDIATE_DESCS = [
  'অ্যালগরিদম কী — সমস্যা সমাধানের ধাপে ধাপে পদ্ধতি শেখো।',
  'ফ্লোচার্টের মাধ্যমে লজিক প্রবাহ দৃশ্যায়ন করতে শেখো।',
  'ইভেন্ট কী — ব্যবহারকারীর কর্মকাণ্ডে সাড়া দিতে শেখো।',
  'প্রোগ্রামিং লজিক — ক্রম, শর্ত ও পুনরাবৃত্তির নিয়ম।',
  'লুপের মাধ্যমে একই কাজ বারবার করার উপায় শেখো।',
  'ভেরিয়েবলে ডেটা সংরক্ষণ ও পরিবর্তন করতে শেখো।',
  'If-Else শর্ত — সিদ্ধান্ত গ্রহণের প্রোগ্রামিং কৌশল।',
  'অপারেটর দিয়ে গাণিতিক ও যৌক্তিক হিসাব শেখো।',
  'সেন্সিং — প্রোগ্রামকে পরিবেশ সম্পর্কে সচেতন করো।',
  'সাউন্ড ও ব্যাকগ্রাউন্ড — মাল্টিমিডিয়া যোগ করার পদ্ধতি।',
]

const BEGINNER_DESCS = [
  'কম্পিউটার কী, এর ইতিহাস, প্রকারভেদ ও ব্যবহার সম্পর্কে জানুন।',
  'CPU কীভাবে কম্পিউটারের মস্তিষ্ক হিসেবে কাজ করে তা শিখুন।',
  'RAM কীভাবে অস্থায়ী ডেটা সংরক্ষণ করে তা বুঝুন।',
  'স্টোরেজ ডিভাইসে স্থায়ীভাবে ডেটা সংরক্ষণের পদ্ধতি জানুন।',
  'কীবোর্ড, মাউস ও স্ক্যানারের মতো ইনপুট ডিভাইস শিখুন।',
  'মনিটর, প্রিন্টার ও স্পিকারের মতো আউটপুট ডিভাইস জানুন।',
  'সফটওয়্যারের প্রকারভেদ ও গুরুত্ব সম্পর্কে জানুন।',
  'অপারেটিং সিস্টেম কীভাবে কম্পিউটার পরিচালনা করে তা শিখুন।',
  'ইন্টারনেটের কাজের পদ্ধতি ও তথ্যের জগৎ সম্পর্কে জানুন।',
  'সাইবার নিরাপত্তা ও অনলাইনে সুরক্ষিত থাকার উপায় শিখুন।',
]

 const MOCK_BEGINNER_LESSONS: Lesson[] = lessonClasses.map((lesson) => ({
  _id: lesson.id,
  title: lesson.title,
  slug: lesson.id,
}))

const MOCK_INTERMEDIATE_LESSONS: Lesson[] = [
  { _id: 'intermediate-algorithm', title: 'Algorithm (অ্যালগরিদম)', slug: 'intermediate-algorithm' },
  { _id: 'intermediate-flowchart', title: 'Flowchart (ফ্লোচার্ট)', slug: 'intermediate-flowchart' },
  { _id: 'intermediate-events',    title: 'Events (ইভেন্ট)', slug: 'intermediate-events' },
  { _id: 'intermediate-logic',     title: 'Programming Logic (প্রোগ্রামিং লজিক)', slug: 'intermediate-logic' },
  { _id: 'intermediate-loops',     title: 'Loops (লুপ)', slug: 'intermediate-loops' },
  { _id: 'intermediate-variables', title: 'Variables (ভেরিয়েবল)', slug: 'intermediate-variables' },
  { _id: 'intermediate-ifelse',    title: 'If-Else (ইফ-এলস)', slug: 'intermediate-ifelse' },
  { _id: 'intermediate-operators', title: 'Operators (অপারেটর)', slug: 'intermediate-operators' },
  { _id: 'intermediate-sensing',   title: 'Sensing (সেন্সিং)', slug: 'intermediate-sensing' },
  { _id: 'intermediate-sound',     title: 'Sound & Background (সাউন্ড ও ব্যাকগ্রাউন্ড)', slug: 'intermediate-sound' },
]

const MOCK_ADVANCED_LESSONS: Lesson[] = [
  { _id: 'advanced-hello-world',  title: 'Class 01: অধ্যায় ১ — হ্যালো ওয়ার্ল্ড', slug: 'advanced-hello-world' },
  { _id: 'advanced-variables',    title: 'Class 02: অধ্যায় ২ — ভ্যারিয়েবলস', slug: 'advanced-variables' },
  { _id: 'advanced-errors',       title: 'Class 03: অধ্যায় ৩ — ত্রুটি ও সনাক্তকরণ', slug: 'advanced-errors' },
  { _id: 'advanced-loops',        title: 'Class 04: অধ্যায় ৪ — লুপস (Loops)', slug: 'advanced-loops' },
  { _id: 'advanced-lists',        title: 'Class 05: অধ্যায় ৫ — লিস্টস (Lists)', slug: 'advanced-lists' },
  { _id: 'advanced-functions',    title: 'Class 06: অধ্যায় ৬ — ফাংশনস (Functions)', slug: 'advanced-functions' },
  { _id: 'advanced-class-object', title: 'Class 07: অধ্যায় ৭ — ক্লাস ও অবজেক্ট', slug: 'advanced-class-object' },
  { _id: 'advanced-modules',      title: 'Class 08: অধ্যায় ৮ — মডিউলস (Modules)', slug: 'advanced-modules' },
]

// ── Main page ─────────────────────────────────────────────────────────────────
export function CourseListPage() {
  // ── Active tab state (reads ?level= from URL, defaults to beginner) ─────────
  const [searchParams] = useSearchParams()
  const initialLevel = (searchParams.get('level') as Level) || 'beginner'
  const [activeTab, setActiveTab] = useState<Level>(initialLevel)

  // ── Data fetching (completely unchanged) ───────────────────────────────────
  const { data: coursesData, isLoading: coursesLoading, isError: coursesError } = useQuery<{ data: Course[] }>({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/courses`)
      if (!res.ok) throw new Error('Failed to fetch courses')
      return res.json()
    },
  })

  const courses = coursesData?.data || []
  const beginnerCourse     = courses.find(c => c.level === 'beginner')
  const intermediateCourse = courses.find(c => c.level === 'intermediate')
  const advancedCourse     = courses.find(c => c.level === 'advanced')

  const { data: beginnerLessonsData,     isLoading: bLoading } = useQuery<{ data: { lessons: Lesson[] } }>({
    queryKey: ['lessons', beginnerCourse?._id],
    queryFn: async () => { const res = await fetch(`${API_BASE_URL}/courses/${beginnerCourse?._id}`); return res.json() },
    enabled: !!beginnerCourse?._id,
  })
  const { data: intermediateLessonsData, isLoading: iLoading } = useQuery<{ data: { lessons: Lesson[] } }>({
    queryKey: ['lessons', intermediateCourse?._id],
    queryFn: async () => { const res = await fetch(`${API_BASE_URL}/courses/${intermediateCourse?._id}`); return res.json() },
    enabled: !!intermediateCourse?._id,
  })
  const { data: advancedLessonsData,     isLoading: aLoading } = useQuery<{ data: { lessons: Lesson[] } }>({
    queryKey: ['lessons', advancedCourse?._id],
    queryFn: async () => { const res = await fetch(`${API_BASE_URL}/courses/${advancedCourse?._id}`); return res.json() },
    enabled: !!advancedCourse?._id,
  })

  const beginnerLessons     = beginnerLessonsData?.data?.lessons?.length
    ? beginnerLessonsData.data.lessons
    : MOCK_BEGINNER_LESSONS
  const intermediateLessons = intermediateLessonsData?.data?.lessons?.length
    ? intermediateLessonsData.data.lessons
    : MOCK_INTERMEDIATE_LESSONS
  const advancedLessons     = advancedLessonsData?.data?.lessons?.length
    ? advancedLessonsData.data.lessons
    : MOCK_ADVANCED_LESSONS

  // ── Progress logic ────────────────────────────────────────────────────────
  // Every lesson carries a canonical `slug` from the API (class-0N /
  // intermediate-* / advanced-*), which is the SAME id the backend progression
  // endpoints use. So no mock-id generation or aliasing is needed — we read the
  // slug directly.
  const classesByLevel = useMemo(
    () => ({
      beginner:     lessonClasses.map(c => ({ id: c.id })),
      intermediate: intermediateLessons
        .map((l) => ({ id: l.slug || toIntermediateMockId(l, 0) }))
        .filter(c => INTERMEDIATE_TRACKED_IDS.includes(c.id)),
      advanced:     advancedLessons
        .map((l) => ({ id: l.slug || toAdvancedMockId(l, 0) }))
        .filter(c => ADVANCED_TRACKED_IDS.includes(c.id)),
    }),
    [intermediateLessons, advancedLessons],
  )
  const orderedLessonIds = useMemo(
    () => [
      ...lessonClasses.map(c => c.id),
      ...intermediateLessons.map((l) => l.slug || toIntermediateMockId(l, 0)),
      ...advancedLessons.map((l) => l.slug || toAdvancedMockId(l, 0)),
    ],
    [intermediateLessons, advancedLessons],
  )

  const {
    completedClassIds, completedLevels, completedClassCount, totalClassCount,
    isLevelUnlocked, isLessonUnlocked, getLevelProgress, markClassComplete, completeLevel,
    apiLoaded,
  } = useCourseProgress(classesByLevel, orderedLessonIds)

  console.log('[DEBUG:CourseListPage] render — completedClassIds:', completedClassIds, 'apiLoaded:', apiLoaded, 'completedLevels:', completedLevels, 'completedClassCount:', completedClassCount)

  // Read-only: reuse the existing first-attempts endpoint to know whether the
  // student has ever attempted the Advanced final exam (drives Final Exam card UI only).
  const { results: firstAttemptResults } = useFirstAttemptResults()
  const hasAttemptedAdvancedExam = useMemo(
    () => firstAttemptResults.some(r => r.level === 'advanced'),
    [firstAttemptResults],
  )

  console.log('[CourseListPage] classesByLevel:', JSON.stringify(classesByLevel))
  console.log('[CourseListPage] completedClassIds:', completedClassIds, '| completedLevels:', completedLevels, '| completedClassCount:', completedClassCount, '| totalClassCount:', totalClassCount)
  console.log('[CourseListPage] beginner ids:', classesByLevel.beginner.map(c => c.id), '| intermediate ids:', classesByLevel.intermediate.map(c => c.id), '| advanced ids:', classesByLevel.advanced.map(c => c.id))
  const overallProgress        = totalClassCount ? Math.round((completedClassCount / totalClassCount) * 100) : 0
  const isIntermediateUnlocked = isLevelUnlocked('intermediate')
  const isAdvancedUnlocked     = isLevelUnlocked('advanced')
  console.log('[CourseListPage] overallProgress:', overallProgress, '| isIntermediateUnlocked:', isIntermediateUnlocked, '| isAdvancedUnlocked:', isAdvancedUnlocked)

  // ── Loading ────────────────────────────────────────────────────────────────
  if (coursesLoading || bLoading || iLoading || aLoading || !apiLoaded) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: C.border }} />
          <div className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: C.accent, borderTopColor: 'transparent' }} />
        </div>
        <div className="text-center">
          <p className="font-black mb-1" style={{ fontSize: '22px', color: C.text, fontFamily: "'Hind Siliguri', sans-serif" }}>
            ক্লাসরুম প্রস্তুত হচ্ছে...
          </p>
          <p className="font-medium" style={{ fontSize: '17px', color: C.muted, fontFamily: "'Hind Siliguri', sans-serif" }}>
            একটু অপেক্ষা করুন
          </p>
        </div>
      </div>
    )
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (coursesError) {
    return (
      <div className="max-w-lg mx-auto mt-16 rounded-2xl p-8 text-center"
        style={{ backgroundColor: 'rgba(255,107,74,0.08)', border: '1.5px solid rgba(255,107,74,0.25)', borderRadius: '20px' }}>
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="font-black mb-2" style={{ fontSize: '20px', color: C.text, fontFamily: "'Hind Siliguri', sans-serif" }}>
          কোর্স লোড করা যায়নি
        </h2>
        <p className="font-medium" style={{ fontSize: '16px', color: C.muted, fontFamily: "'Hind Siliguri', sans-serif" }}>
          ব্যাকএন্ড সার্ভার চলছে কিনা দেখুন:{' '}
          <code className="px-1 rounded" style={{ backgroundColor: 'rgba(255,107,74,0.15)' }}>http://localhost:5000</code>
        </p>
      </div>
    )
  }

  // ── Page ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-10 pb-24">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <header className="max-w-3xl">
        <div
          className="inline-flex items-center gap-2 font-black rounded-full px-5 py-2 mb-4 uppercase tracking-widest"
          style={{ fontSize: '13px', backgroundColor: 'rgba(29,158,117,0.10)', color: C.accent, border: `1px solid ${C.border}` }}
        >
          <Sparkles size={14} /> শেখার পথ
        </div>
        <h1
          className="font-black mb-3 tracking-tight leading-tight"
          style={{ fontSize: 'clamp(32px, 5vw, 48px)', color: C.text, fontFamily: "'Hind Siliguri', sans-serif" }}
        >
          শিখুন <span style={{ color: C.accent }}>সহজ কোডিং</span>
        </h1>
        <p
          className="font-medium leading-relaxed"
          style={{ fontSize: '18px', color: C.secondary, fontFamily: "'Hind Siliguri', sans-serif" }}
        >
          কম্পিউটার ও প্রোগ্রামিং এর জগতে আপনার যাত্রা শুরু হোক এখান থেকে — শিক্ষানবিশ থেকে উন্নত পর্যন্ত।
        </p>
      </header>

      {/* ── Overall Progress Hero ─────────────────────────────────────────── */}
      <section
        className="relative rounded-3xl p-7 sm:p-10 text-white overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${C.accent} 0%, #178a63 100%)`,
          boxShadow: '0 8px 32px rgba(29,158,117,0.22)',
          borderRadius: '24px',
        }}
      >
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)', transform: 'translate(30%,-30%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.06) 0%, transparent 70%)', transform: 'translate(-25%,30%)' }} />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="font-black uppercase tracking-widest text-white/70 mb-3"
              style={{ fontSize: '13px', fontFamily: "'Hind Siliguri', sans-serif" }}>সামগ্রিক অগ্রগতি</p>
            <h2 className="font-black mb-5" style={{ fontSize: '32px', fontFamily: "'Hind Siliguri', sans-serif" }}>
              আপনার অগ্রগতি
            </h2>
            <div className="flex items-center gap-5">
              <div className="font-black tabular-nums" style={{ fontSize: '60px' }}>
                <AnimatedNumber value={overallProgress} />%
              </div>
              <div className="h-14 w-px bg-white/20" />
              <div>
                <p className="font-bold text-white/75 mb-0.5" style={{ fontSize: '16px', fontFamily: "'Hind Siliguri', sans-serif" }}>
                  সম্পন্ন ক্লাস
                </p>
                <p className="font-black" style={{ fontSize: '26px' }}>
                  <AnimatedNumber value={completedClassCount} /> / {totalClassCount}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-3">
              {(['beginner', 'intermediate', 'advanced'] as const).map(lvl => {
                const p = getLevelProgress(lvl)
                return (
                  <div key={lvl} className="space-y-1.5">
                    <div className="flex justify-between font-bold text-white/75"
                      style={{ fontSize: '15px', fontFamily: "'Hind Siliguri', sans-serif" }}>
                      <span>{BN_LEVELS[lvl]}</span>
                      <span>{p}%</span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden bg-white/20">
                      <div className="h-2.5 rounded-full transition-all duration-1000 ease-out bg-white"
                        style={{ width: `${p}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {(['beginner', 'intermediate', 'advanced'] as const).map(lvl => (
                <span
                  key={lvl}
                  className="font-bold px-3 py-1.5 rounded-full transition-all duration-300"
                  style={{
                    fontSize: '14px',
                    backgroundColor: completedLevels.includes(lvl) ? 'white' : isLevelUnlocked(lvl) ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.10)',
                    color: completedLevels.includes(lvl) ? C.accent : isLevelUnlocked(lvl) ? 'white' : 'rgba(255,255,255,0.45)',
                    fontFamily: "'Hind Siliguri', sans-serif",
                  }}
                >
                  {completedLevels.includes(lvl) ? '✓ ' : isLevelUnlocked(lvl) ? '▶ ' : '🔒 '}
                  {BN_LEVELS[lvl]}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Level stepper breadcrumb (also acts as the single Level nav) ───── */}
      <div className="flex items-center gap-3 overflow-x-auto py-1">
        {[
          { label: 'শিক্ষানবিশ',  key: 'beginner' as Level,     done: completedLevels.includes('beginner'),     unlocked: true },
          { label: 'মধ্যবর্তী',   key: 'intermediate' as Level, done: completedLevels.includes('intermediate'), unlocked: isIntermediateUnlocked },
          { label: 'উন্নত',       key: 'advanced' as Level,     done: completedLevels.includes('advanced'),     unlocked: isAdvancedUnlocked },
          { label: 'প্র্যাকটিস',         key: null,                    done: false,                                    unlocked: true },
        ].map((step, i, arr) => {
          const isActive = step.key !== null && activeTab === step.key
          const isClickable = step.key !== null && step.unlocked
          return (
            <div key={step.label} className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => { if (isClickable && step.key) setActiveTab(step.key) }}
                className="flex items-center gap-2 px-4 py-2 rounded-full font-black text-white transition-all"
                style={{
                  fontSize: '14px',
                  backgroundColor: isActive ? C.accent : step.done ? C.accent : 'rgba(107,123,116,0.60)',
                  boxShadow: isActive || step.done ? '0 2px 8px rgba(29,158,117,0.25)' : 'none',
                  outline: isActive ? '2px solid rgba(255,255,255,0.85)' : 'none',
                  outlineOffset: isActive ? '2px' : '0',
                  opacity: !step.unlocked ? 0.65 : 1,
                  cursor: isClickable ? 'pointer' : 'default',
                  fontFamily: "'Hind Siliguri', sans-serif",
                }}
              >
                {step.done
                  ? <CheckCircle2 size={14} />
                  : !step.unlocked
                  ? <Lock size={13} />
                  : <span className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center" style={{ fontSize: '11px' }}>{i + 1}</span>}
                {step.label}
              </button>
              {i < arr.length - 1 && <ChevronRight size={18} style={{ color: C.border }} className="shrink-0" />}
            </div>
          )
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          BEGINNER SECTION — always rendered, tab controls visibility
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'beginner' && (
        <section className="space-y-5">
          <LevelHeader
            icon="🧩" label="শিক্ষানবিশ বিভাগ" stage="ধাপ ১ — কম্পিউটার পরিচিতি"
            progress={getLevelProgress('beginner')}
            isCompleted={completedLevels.includes('beginner')}
            isLocked={false}
            canComplete={getLevelProgress('beginner') >= 100}
            onComplete={() => completeLevel('beginner')}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {beginnerLessons.map((lesson, idx) => {
              const slugId = lesson.slug || lessonClasses[idx]?.id || lesson._id
              return (
              <ClassCard
                key={slugId} id={slugId} title={lesson.title}
                description={BEGINNER_DESCS[idx] ?? 'শিক্ষানবিশ স্তরের কম্পিউটার ধারণা শিখুন।'}
                href={`/courses/beginner/${slugId}`}
                locked={!isLessonUnlocked(slugId)}
                level="beginner"
                completed={completedClassIds.includes(slugId)}
                order={idx + 1}
                onComplete={markClassComplete}
                />
              )})}
            </div>

          {/* ── Final Exam CTA ── */}
          {getLevelProgress('beginner') >= 100 && (
            <div
              className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl mt-4"
              style={{ backgroundColor: 'rgba(29,158,117,0.06)', border: '1.5px solid rgba(29,158,117,0.20)' }}
            >
              <div>
                <p className="font-black text-sm" style={{ color: C.accent, fontFamily: "'Hind Siliguri', sans-serif" }}>🎯 শিক্ষানবিশ ফাইনাল পরীক্ষা</p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: C.muted, fontFamily: "'Hind Siliguri', sans-serif" }}>পরীক্ষায় পাস করলে Intermediate লেভেল আনলক হবে।</p>
              </div>
              {completedLevels.includes('beginner') ? (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/exam/beginner/review"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-sm transition-all hover:scale-105"
                      style={{ backgroundColor: 'rgba(29,158,117,0.08)', color: C.accent, border: '1.5px solid rgba(29,158,117,0.20)' }}
                    >
                      পর্যালোচনা <ChevronRight size={14} />
                    </Link>
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-sm" style={{ backgroundColor: 'rgba(29,158,117,0.12)', color: C.accent }}>
                      <CheckCircle2 size={15} /> পাস হয়েছে ✓
                    </span>
                  </div>
              ) : (
                <Link
                  to="/exam/beginner"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all hover:scale-105"
                  style={{ backgroundColor: C.accent, color: '#fff', boxShadow: '0 0 16px rgba(29,158,117,0.25)' }}
                >
                  <Trophy size={15} /> পরীক্ষা দিন
                </Link>
              )}
            </div>
          )}
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          INTERMEDIATE SECTION
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'intermediate' && (
        <section className="space-y-5">
          <LevelHeader
            icon="🎨" label="মধ্যবর্তী বিভাগ" stage="ধাপ ২ — ভিজ্যুয়াল ব্রিজ"
            progress={getLevelProgress('intermediate')}
            isCompleted={completedLevels.includes('intermediate')}
            isLocked={!isIntermediateUnlocked}
            canComplete={getLevelProgress('intermediate') >= 100}
            onComplete={() => completeLevel('intermediate')}
          />
          {isIntermediateUnlocked ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {intermediateLessons.map((lesson, idx) => {
                  const mockId = lesson.slug || toIntermediateMockId(lesson, idx)
                  return (
                  <ClassCard
                    key={lesson._id} id={mockId} title={lesson.title}
                    description={INTERMEDIATE_DESCS[idx] ?? 'মধ্যবর্তী স্তরের প্রোগ্রামিং ধারণা শিখুন।'}
                    href={`/courses/intermediate?lesson=${mockId}`}
                    locked={!isLessonUnlocked(mockId)}
                    level="intermediate"
                    completed={completedClassIds.includes(mockId)}
                    order={idx + 1}
                    onComplete={markClassComplete}
                  />
                  )
                })}
              </div>

              {/* ── Final Exam CTA ── */}
              {getLevelProgress('intermediate') >= 100 && (
                <div
                  className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl"
                  style={{ backgroundColor: 'rgba(29,158,117,0.06)', border: '1.5px solid rgba(29,158,117,0.20)' }}
                >
                  <div>
                    <p className="font-black text-sm" style={{ color: C.accent, fontFamily: "'Hind Siliguri', sans-serif" }}>🎯 মধ্যবর্তী ফাইনাল পরীক্ষা</p>
                    <p className="text-xs font-semibold mt-0.5" style={{ color: C.muted, fontFamily: "'Hind Siliguri', sans-serif" }}>পরীক্ষায় পাস করলে Advanced লেভেল আনলক হবে।</p>
                  </div>
                  {completedLevels.includes('intermediate') ? (
                    <div className="flex items-center gap-2">
                      <Link
                        to="/exam/intermediate/review"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-sm transition-all hover:scale-105"
                        style={{ backgroundColor: 'rgba(29,158,117,0.08)', color: C.accent, border: '1.5px solid rgba(29,158,117,0.20)' }}
                      >
                        পর্যালোচনা <ChevronRight size={14} />
                      </Link>
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-sm" style={{ backgroundColor: 'rgba(29,158,117,0.12)', color: C.accent }}>
                        <CheckCircle2 size={15} /> পাস হয়েছে ✓
                      </span>
                    </div>
                  ) : (
                    <Link
                      to="/exam/intermediate"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all hover:scale-105"
                      style={{ backgroundColor: C.accent, color: '#fff', boxShadow: '0 0 16px rgba(29,158,117,0.25)' }}
                    >
                      <Trophy size={15} /> পরীক্ষা দিন
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <LockedSection message="সব Beginner কোর্স সম্পন্ন করলে Intermediate আনলক হবে।" />
          )}
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          ADVANCED SECTION
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'advanced' && (
        <section className="space-y-5">
          <LevelHeader
            icon="🚀" label="উন্নত বিভাগ" stage="ধাপ ৩ — পাইথন প্রোগ্রামিং"
            progress={getLevelProgress('advanced')}
            isCompleted={completedLevels.includes('advanced')}
            isLocked={!isAdvancedUnlocked}
            canComplete={getLevelProgress('advanced') >= 100}
            onComplete={() => completeLevel('advanced')}
            hideCompleteButton={getLevelProgress('advanced') >= 100}
          />
          {isAdvancedUnlocked ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 transition-all duration-500">
              {advancedLessons.map((lesson, idx) => {
                const mockId = lesson.slug || toAdvancedMockId(lesson, idx)
                return (
                <ClassCard
                  key={lesson._id} id={mockId} title={lesson.title}
                  description={ADVANCED_DESCS[idx] ?? 'পাইথন প্রোগ্রামিং এর উন্নত বিষয়বস্তু শিখুন।'}
                  href={`/courses/advanced?lesson=${mockId}`}
                  locked={!isLessonUnlocked(mockId)}
                  level="advanced"
                  completed={completedClassIds.includes(mockId)}
                  order={idx + 1}
                  onComplete={markClassComplete}
                />
              )})}
            </div>
          ) : (
            <LockedSection message="সব Intermediate কোর্স সম্পন্ন করলে Advanced আনলক হবে।" />
          )}

          {/* ── Final Exam CTA ── */}
          {isAdvancedUnlocked && getLevelProgress('advanced') >= 100 && (
            <div
              className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl"
              style={{ backgroundColor: 'rgba(29,158,117,0.06)', border: '1.5px solid rgba(29,158,117,0.20)' }}
            >
              <div>
                <p className="font-black text-sm" style={{ color: C.accent, fontFamily: "'Hind Siliguri', sans-serif" }}>🎯 উন্নত ফাইনাল পরীক্ষা</p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: C.muted, fontFamily: "'Hind Siliguri', sans-serif" }}>সম্পূর্ণ কোর্স শেষ করতে পরীক্ষায় পাস করুন।</p>
              </div>
              {/* Status + action buttons — shown according to exam status */}
              <div className="flex flex-wrap items-center justify-end gap-2">
                {completedLevels.includes('advanced') ? (
                  // ── PASSED: পর্যালোচনা + সম্পন্ন হয়েছে ──
                  <>
                    <Link
                      to="/exam/advanced/review"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all hover:scale-105"
                      style={{ backgroundColor: 'rgba(29,158,117,0.10)', color: C.accent, border: '1.5px solid rgba(29,158,117,0.20)' }}
                    >
                      <FileText size={15} /> পর্যালোচনা
                    </Link>
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-sm" style={{ backgroundColor: 'rgba(29,158,117,0.12)', color: C.accent }}>
                      <CheckCircle2 size={15} /> সম্পন্ন হয়েছে 👑
                    </span>
                  </>
                ) : hasAttemptedAdvancedExam ? (
                  // ── FAILED: only আবার পরীক্ষা দিন ──
                  <Link
                    to="/exam/advanced"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all hover:scale-105"
                    style={{ backgroundColor: C.accent, color: '#fff', boxShadow: '0 0 16px rgba(29,158,117,0.25)' }}
                  >
                    <RefreshCw size={15} /> আবার পরীক্ষা দিন
                  </Link>
                ) : (
                  // ── NEVER ATTEMPTED: only পরীক্ষা দিন ──
                  <Link
                    to="/exam/advanced"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all hover:scale-105"
                    style={{ backgroundColor: C.accent, color: '#fff', boxShadow: '0 0 16px rgba(29,158,117,0.25)' }}
                  >
                    <Trophy size={15} /> পরীক্ষা দিন
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* ── Project Submission container (ADDITIVE, Advanced-only) ──
              Placed BETWEEN the Final Exam container and the IDE section.
              Always visible; locked until the Advanced final exam is passed
              (completedLevels.includes('advanced')), then unlocked for
              unlimited submissions. No existing component is moved or changed. */}
          <ProjectSubmissionSection unlocked={completedLevels.includes('advanced')} />
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          IDE SECTION — always visible below tabs (REDESIGNED)
      ══════════════════════════════════════════════════════════════════ */}
      <section className="space-y-6">
        {/* Header — Premium Gradient Banner */}
        <div className="relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, #0E7C66 0%, #1D9E75 55%, #34D399 100%)',
          borderRadius: '24px',
          boxShadow: '0 8px 32px rgba(29,158,117,0.25)',
        }}>
          {/* Decorative background orbs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="absolute top-1/3 right-1/3 w-20 h-20 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />

          <div className="relative z-10 flex items-center gap-5 p-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              💻
            </div>
            <div>
              <h2 className="text-white font-black tracking-tight" style={{ fontSize: '28px', fontFamily: "'Hind Siliguri', sans-serif" }}>
                ডেভেলপমেন্ট IDE
              </h2>
              <p className="font-bold uppercase tracking-widest mt-1" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontFamily: "'Hind Siliguri', sans-serif" }}>
                ধাপ ৪ — ইন্টারেক্টিভ প্র্যাকটিস
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ──── CARD 1: Aalokbortika More Practice Teenager Learner IDE ──── */}
          <Link
            to="/development"
            className="group relative block overflow-hidden ide-card-glow"
            style={{
              background: 'var(--color-card-bg)',
              borderRadius: '24px',
              boxShadow: 'var(--shadow-card)',
              border: '1.5px solid var(--color-card-border)',
              transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              textDecoration: 'none',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'translateY(-6px)'
              el.style.boxShadow = 'var(--shadow-card-hover)'
              el.style.borderColor = 'var(--color-card-border-accent)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'translateY(0)'
              el.style.boxShadow = 'var(--shadow-card)'
              el.style.borderColor = 'var(--color-card-border)'
            }}
          >
            {/* Gradient top accent bar */}
            <div style={{ height: '6px', background: 'linear-gradient(90deg, #1D9E75, #34D399, #6EE7B7)', borderRadius: '24px 24px 0 0' }} />

            <div className="p-7">
              {/* Header: title */}
              <div className="mb-5" style={{ textAlign: 'center' }}>
                <h3 className="font-black leading-tight" style={{ fontSize: '28px', color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}>
                  আলোকবর্তিকা
                </h3>
                <p className="font-bold mt-2" style={{ fontSize: '16px', color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>
                  কিশোর শিক্ষার্থীদের জন্য আরও অনুশীলন
                </p>
              </div>

              {/* Description */}
              <p className="leading-relaxed mb-6" style={{ fontSize: '15px', color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>
                শিক্ষার্থীরা বিভক্ত-পর্দার পরিবেশে পাঠভিত্তিক প্রোগ্রামিং অনুশীলন করতে পারবে, যেখানে কোড এডিটর, ফাইল এক্সপ্লোরার, কনসোল আউটপুট ও AI সহায়তা রয়েছে।
              </p>

              {/* CTA Button */}
              <div className="inline-flex items-center gap-2 font-extrabold text-white px-6 py-3.5 rounded-2xl transition-all duration-300 group-hover:gap-3 group-hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, #1D9E75, #059669)',
                  boxShadow: '0 4px 14px rgba(29,158,117,0.35)',
                  cursor: 'pointer',
                }}>
                আরও অনুশীলন
                <ChevronRight size={18} className="transition-all duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* ──── CARD 2: Aalokbortika Self Practice Teenager Learner IDE ──── */}
          <Link
            to="/practice"
            className="group relative block overflow-hidden ide-card-glow-purple"
            style={{
              background: 'var(--color-card-bg-alt)',
              borderRadius: '24px',
              boxShadow: 'var(--shadow-card-alt)',
              border: '1.5px solid var(--color-card-border-alt)',
              transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              textDecoration: 'none',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'translateY(-6px)'
              el.style.boxShadow = 'var(--shadow-card-alt-hover)'
              el.style.borderColor = 'var(--color-card-border-alt-accent)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'translateY(0)'
              el.style.boxShadow = 'var(--shadow-card-alt)'
              el.style.borderColor = 'var(--color-card-border-alt)'
            }}
          >
            {/* Gradient top accent bar — purple theme */}
            <div style={{ height: '6px', background: 'linear-gradient(90deg, #7C3AED, #8B5CF6, #A78BFA)', borderRadius: '24px 24px 0 0' }} />

            <div className="p-7">
              {/* Header: title */}
              <div className="mb-5" style={{ textAlign: 'center' }}>
                <h3 className="font-black leading-tight" style={{ fontSize: '28px', color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}>
                  আলোকবর্তিকা
                </h3>
                <p className="font-bold mt-2" style={{ fontSize: '16px', color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>
                  কিশোর শিক্ষার্থীদের জন্য নিজস্ব অনুশীলন
                </p>
              </div>

              {/* Description */}
              <p className="leading-relaxed mb-6" style={{ fontSize: '15px', color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>
                শিক্ষার্থীরা যেকোনো ভাষায় স্বাধীনভাবে কোড লিখতে, রান করতে এবং ডিবাগ করতে পারবে — সমন্বিত AI-চালিত IDE-এর সাহায্যে।
              </p>

              {/* CTA Button */}
              <div className="inline-flex items-center gap-2 font-extrabold text-white px-6 py-3.5 rounded-2xl transition-all duration-300 group-hover:gap-3 group-hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                  boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
                  cursor: 'pointer',
                }}>
                নিজস্ব অনুশীলন শুরু করুন
                <ChevronRight size={18} className="transition-all duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
