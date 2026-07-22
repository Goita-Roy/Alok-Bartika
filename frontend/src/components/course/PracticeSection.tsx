import { Link } from 'react-router-dom'
import { Cpu, Lightbulb, ChevronDown, Target, ListChecks, BookOpen } from 'lucide-react'
import { useState } from 'react'

interface PracticeData {
  title?: string
  description?: string
  objectives?: string[]
  instructions?: string[]
  starterCode?: string
  expectedOutput?: string
  hints?: string[]
  difficulty?: 'easy' | 'medium' | 'hard'
}

interface PracticeSectionProps {
  practice?: PracticeData | null
  lessonId: string
  courseId: string
  language?: string
}

const S = {
  surface: '#0A4A3F', bg: '#04342C',
  accent: '#65D1B2', light: '#8FE3CC',
  text: '#F5F7F6', muted: '#B8C5C1',
}

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
  easy: { bg: 'rgba(74,222,128,0.12)', text: '#4ade80' },
  medium: { bg: 'rgba(250,204,21,0.12)', text: '#facc15' },
  hard: { bg: 'rgba(248,113,113,0.12)', text: '#f87171' },
}

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'সহজ',
  medium: 'মধ্যম',
  hard: 'কঠিন',
}

export function PracticeSection({ practice, lessonId, courseId, language = 'python' }: PracticeSectionProps) {
  const [objectivesOpen, setObjectivesOpen] = useState(true)
  const [instructionsOpen, setInstructionsOpen] = useState(false)
  const [hintsOpen, setHintsOpen] = useState(false)

  const hasStarterCode = practice?.starterCode && practice.starterCode.trim().length > 0

  if (!practice) {
    return (
      <div className="space-y-4 p-6 rounded-2xl mb-6"
        style={{
          backgroundColor: 'rgba(4,52,44,0.6)',
          border: '1px solid rgba(101,209,178,0.15)',
        }}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black flex items-center gap-3" style={{ color: S.text }}>
            <span style={{ color: S.accent }}>💻</span> পাইথন IDE-তে প্র্যাকটিস
          </h3>
        </div>

        {/* ── Subtitle ─────────────────────────────────────────────── */}
        <p className="text-sm font-semibold" style={{ color: S.accent, fontFamily: "'Hind Siliguri', sans-serif" }}>
          আলোকবর্তিকা IDE-তে অনুশীলন করুন
        </p>

        {/* ── Start Practice Button ────────────────────────────── */}
        <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-xl"
          style={{ borderColor: 'rgba(101,209,178,0.25)', backgroundColor: 'rgba(101,209,178,0.02)' }}
        >
          <p className="text-sm font-semibold mb-4 text-center" style={{ color: S.muted, fontFamily: "'Hind Siliguri', sans-serif" }}>
            এখন নিজেই কোড লিখে অনুশীলন করুন। নিচের বাটনে ক্লিক করে Python IDE-তে গিয়ে এই পাঠের কোড নিজে লিখে দেখুন।
          </p>
          <Link
            to={`/development?lessonId=${lessonId}&courseId=${courseId}&practice=true`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: S.accent,
              color: '#04342C',
              boxShadow: '0 0 16px rgba(101,209,178,0.2)',
              fontFamily: "'Hind Siliguri', sans-serif",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = S.light }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = S.accent }}
          >
            🚀 পাইথন IDE খুলুন
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-6 rounded-2xl mb-6"
      style={{
        backgroundColor: 'rgba(4,52,44,0.6)',
        border: '1px solid rgba(101,209,178,0.15)',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black flex items-center gap-3" style={{ color: S.text }}>
          <span style={{ color: S.accent }}>💻</span> প্র্যাকটিস
        </h3>
        {practice.difficulty && (
          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: DIFFICULTY_COLORS[practice.difficulty]?.bg || 'rgba(101,209,178,0.10)',
              color: DIFFICULTY_COLORS[practice.difficulty]?.text || S.muted,
            }}
          >
            {DIFFICULTY_LABELS[practice.difficulty] || practice.difficulty}
          </span>
        )}
      </div>

      {/* ── Description ───────────────────────────────────────── */}
      {practice.description && (
        <p className="text-sm font-medium leading-relaxed" style={{ color: S.muted }}>
          {practice.description}
        </p>
      )}

      {/* ── Objectives (expandable) ──────────────────────────── */}
      {practice.objectives && practice.objectives.length > 0 && (
        <div className="rounded-xl overflow-hidden"
          style={{ backgroundColor: 'rgba(4,52,44,0.4)', border: '1px solid rgba(101,209,178,0.08)' }}
        >
          <button
            onClick={() => setObjectivesOpen(!objectivesOpen)}
            className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/[0.02]"
          >
            <div className="flex items-center gap-2">
              <Target size={14} style={{ color: S.accent }} />
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: S.text }}>
                  শিখন ফল
                </span>
            </div>
            <ChevronDown size={14} style={{ color: S.muted, transform: objectivesOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
          </button>
          {objectivesOpen && (
            <div className="px-4 pb-4 space-y-2">
              {practice.objectives.map((obj, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm font-medium" style={{ color: S.muted }}>
                  <span style={{ color: S.accent, marginTop: 2 }}>•</span>
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Instructions (expandable) ────────────────────────── */}
      {practice.instructions && practice.instructions.length > 0 && (
        <div className="rounded-xl overflow-hidden"
          style={{ backgroundColor: 'rgba(4,52,44,0.4)', border: '1px solid rgba(101,209,178,0.08)' }}
        >
          <button
            onClick={() => setInstructionsOpen(!instructionsOpen)}
            className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/[0.02]"
          >
            <div className="flex items-center gap-2">
              <ListChecks size={14} style={{ color: S.accent }} />
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: S.text }}>
                  নির্দেশনা
                </span>
            </div>
            <ChevronDown size={14} style={{ color: S.muted, transform: instructionsOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
          </button>
          {instructionsOpen && (
            <ol className="px-4 pb-4 space-y-2 list-decimal list-inside">
              {practice.instructions.map((inst, i) => (
                <li key={i} className="text-sm font-medium leading-relaxed" style={{ color: S.muted }}>
                  {inst}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {/* ── Starter Code Info ────────────────────────────────── */}
      {hasStarterCode && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{ backgroundColor: 'rgba(101,209,178,0.05)', border: '1px solid rgba(101,209,178,0.10)' }}
        >
          <BookOpen size={14} style={{ color: S.accent }} />
          <span className="text-xs font-semibold" style={{ color: S.muted }}>
            স্টার্টার কোড উপলব্ধ <span style={{ color: S.accent }}>{language.toUpperCase()}</span>-এ
          </span>
        </div>
      )}

      {/* ── Hints (expandable) ───────────────────────────────── */}
      {practice.hints && practice.hints.length > 0 && (
        <div className="rounded-xl overflow-hidden"
          style={{ backgroundColor: 'rgba(4,52,44,0.4)', border: '1px solid rgba(101,209,178,0.08)' }}
        >
          <button
            onClick={() => setHintsOpen(!hintsOpen)}
            className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/[0.02]"
          >
            <div className="flex items-center gap-2">
              <Lightbulb size={14} style={{ color: S.accent }} />
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: S.text }}>
                  ইঙ্গিত
                </span>
            </div>
            <ChevronDown size={14} style={{ color: S.muted, transform: hintsOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
          </button>
          {hintsOpen && (
            <div className="px-4 pb-4 space-y-2">
              {practice.hints.map((hint, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm font-medium" style={{ color: S.muted }}>
                  <span style={{ color: '#facc15', marginTop: 2 }}>💡</span>
                  <span>{hint}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Start Practice Button ────────────────────────────── */}
      <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-xl"
        style={{ borderColor: 'rgba(101,209,178,0.25)', backgroundColor: 'rgba(101,209,178,0.02)' }}
      >
        <p className="text-sm font-semibold mb-4 text-center" style={{ color: S.muted }}>
          এই প্র্যাকটিস টাস্কটি সমাধান করার জন্য আলোকবর্তিকা এডিটরে যান।
        </p>
        <Link
          to={`/development?lessonId=${lessonId}&courseId=${courseId}&practice=true`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: S.accent,
            color: '#04342C',
            boxShadow: '0 0 16px rgba(101,209,178,0.2)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = S.light }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = S.accent }}
        >
          <Cpu size={16} /> প্র্যাকটিস শুরু করুন
        </Link>
      </div>
    </div>
  )
}
