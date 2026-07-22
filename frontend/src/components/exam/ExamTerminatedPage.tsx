import { Link } from 'react-router-dom'
import { ShieldOff, ArrowLeft, RefreshCw } from 'lucide-react'

const S = {
  bg: '#04342C', surface: '#0A4A3F', card: '#071f1a',
  accent: '#65D1B2', light: '#8FE3CC', muted: '#B8C5C1', text: '#F5F7F6',
  danger: '#f87171', warn: '#f5c842', success: '#65D1B2',
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'শিক্ষানবিশ', intermediate: 'মধ্যবর্তী', advanced: 'উন্নত',
}

interface ExamTerminatedProps {
  level: string
  reason: string
}

export function ExamTerminatedPage({ level, reason }: ExamTerminatedProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: S.bg }}
    >
      <div className="w-full max-w-md text-center space-y-6">
        {/* Icon */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
          style={{ backgroundColor: 'rgba(248,113,113,0.12)', border: '2px solid rgba(248,113,113,0.30)' }}
        >
          <ShieldOff size={40} style={{ color: S.danger }} />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black" style={{ color: S.danger }}>
            পরীক্ষা বাতিল হয়েছে
          </h1>
          <p className="text-sm font-semibold" style={{ color: S.muted }}>
            {LEVEL_LABELS[level]} ফাইনাল পরীক্ষা
          </p>
        </div>

        {/* Reason card */}
        <div
          className="rounded-2xl p-5 text-left space-y-3"
          style={{ backgroundColor: 'rgba(248,113,113,0.06)', border: '1.5px solid rgba(248,113,113,0.25)' }}
        >
          <p className="text-xs font-black uppercase tracking-wider" style={{ color: S.danger }}>
            ⚠️ নিয়ম লঙ্ঘনের কারণ
          </p>
          <p className="text-sm font-bold leading-relaxed" style={{ color: S.text }}>
            {reason}
          </p>
        </div>

        {/* Termination message */}
        <div
          className="rounded-2xl p-5 space-y-2"
          style={{ backgroundColor: 'rgba(245,200,66,0.06)', border: '1.5px solid rgba(245,200,66,0.20)' }}
        >
          <p className="text-sm font-bold leading-relaxed" style={{ color: S.warn }}>
            আপনি পরীক্ষার নিয়ম ভঙ্গ করেছেন। এই পরীক্ষাটি আর পুনরায় চালিয়ে যেতে পারবেন না।
          </p>
          <p className="text-xs font-semibold leading-relaxed" style={{ color: S.muted }}>
            এই পরীক্ষাটি বাতিল করা হয়েছে। চালিয়ে যেতে হলে একটি নতুন পরীক্ষা শুরু করুন।
          </p>
        </div>

        {/* Actions: start a brand-new attempt or go back */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={`/exam/${level}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all hover:scale-105"
            style={{ backgroundColor: S.accent, color: '#04342C', boxShadow: '0 0 20px rgba(101,209,178,0.25)' }}
          >
            <RefreshCw size={16} /> নতুন পরীক্ষা শুরু করুন
          </a>
          <Link
            to="/courses"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all hover:scale-105"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: S.muted, border: '1px solid rgba(101,209,178,0.15)' }}
          >
            <ArrowLeft size={16} /> কোর্সে ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  )
}
