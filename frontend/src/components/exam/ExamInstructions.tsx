import { useState } from 'react'
import { AlertTriangle, Shield, Clock, Ban, Monitor, Eye, FileWarning } from 'lucide-react'

const S = {
  bg: '#04342C', surface: '#0A4A3F', card: '#071f1a',
  accent: '#65D1B2', light: '#8FE3CC', muted: '#B8C5C1', text: '#F5F7F6',
  danger: '#f87171', warn: '#f5c842', success: '#65D1B2',
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'শিক্ষানবিশ', intermediate: 'মধ্যবর্তী', advanced: 'উন্নত',
}

interface ExamInstructionsProps {
  level: string
  examTitle: string
  questionCount: number
  timeLimitMinutes: number
  passingScore: number
  onStart: () => void
  onBack: () => void
}

export function ExamInstructions({
  level, examTitle, questionCount, timeLimitMinutes, passingScore, onStart, onBack,
}: ExamInstructionsProps) {
  const [agreed, setAgreed] = useState(true)

  const instructions = [
    {
      icon: <Ban size={18} style={{ color: S.danger }} />,
      text: 'এই পরীক্ষার সময় কোনো ধরনের Copy, Paste বা প্রশ্ন কপি করা যাবে না।',
    },
    {
      icon: <Monitor size={18} style={{ color: S.danger }} />,
      text: 'Keyboard shortcuts যেমন: Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, Ctrl+P, Ctrl+S, Ctrl+Shift+I, F12, Right Click — সবগুলো নিষিদ্ধ থাকবে।',
    },
    {
      icon: <Eye size={18} style={{ color: S.danger }} />,
      text: 'পরীক্ষার সময় অন্য Browser Tab, অন্য Browser Window বা অন্য Application-এ গেলে পরীক্ষা স্বয়ংক্রিয়ভাবে বন্ধ হয়ে যাবে।',
    },
    {
      icon: <FileWarning size={18} style={{ color: S.warn }} />,
      text: 'যদি Browser Tab পরিবর্তন করা হয়, Window minimize করা হয়, অথবা Browser focus হারায়, তাহলে পরীক্ষা তাৎক্ষণিকভাবে শেষ হবে এবং পুনরায় চালিয়ে যাওয়া যাবে না।',
    },
    {
      icon: <Shield size={18} style={{ color: S.danger }} />,
      text: 'পরীক্ষা চলাকালীন Screenshot, Print বা Developer Tools ব্যবহার করা যাবে না।',
    },
    {
      icon: <Clock size={18} style={{ color: S.warn }} />,
      text: 'পরীক্ষা শুরু করার পর নির্ধারিত নিয়ম অবশ্যই মেনে চলতে হবে।',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-8 px-4" style={{ backgroundColor: S.bg }}>
      <div className="w-full max-w-2xl space-y-5">

        {/* Header */}
        <div className="text-center space-y-3">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
            style={{ backgroundColor: 'rgba(245,200,66,0.12)', border: '2px solid rgba(245,200,66,0.3)' }}
          >
            <AlertTriangle size={32} style={{ color: S.warn }} />
          </div>
          <h1 className="text-2xl font-black" style={{ color: S.text }}>
            📋 পরীক্ষার নির্দেশনা
          </h1>
          <p className="text-sm font-semibold" style={{ color: S.muted }}>
            {LEVEL_LABELS[level]} ফাইনাল পরীক্ষা — {examTitle}
          </p>
        </div>

        {/* Exam info cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'প্রশ্ন সংখ্যা', value: `${questionCount} টি`, icon: '📝' },
            { label: 'সময় সীমা', value: `${timeLimitMinutes} মিনিট`, icon: '⏱️' },
            { label: 'পাসের নম্বর', value: `${passingScore}%`, icon: '🎯' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl p-3 text-center"
              style={{ backgroundColor: S.surface, border: '1px solid rgba(101,209,178,0.12)' }}
            >
              <div className="text-2xl mb-1">{item.icon}</div>
              <p className="text-lg font-black" style={{ color: S.accent }}>{item.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: S.muted }}>{item.label}</p>
            </div>
          ))}
        </div>

        {/* Warning box */}
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ backgroundColor: 'rgba(245,200,66,0.06)', border: '1.5px solid rgba(245,200,66,0.25)' }}
        >
          <h2 className="text-sm font-black flex items-center gap-2" style={{ color: S.warn }}>
            <AlertTriangle size={16} /> নির্দেশনাসমূহ
          </h2>
          <ol className="space-y-3">
            {instructions.map((inst, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black mt-0.5"
                  style={{ backgroundColor: 'rgba(101,209,178,0.10)', color: S.accent }}
                >
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">{inst.icon}</div>
                  <p className="text-sm font-semibold leading-relaxed" style={{ color: S.text }}>{inst.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Red academic integrity notice */}
        <div
          className="rounded-2xl p-4 text-center"
          style={{ backgroundColor: 'rgba(248,113,113,0.08)', border: '1.5px solid rgba(248,113,113,0.25)' }}
        >
          <p className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: S.danger }}>
            ⚠️ একাডেমিক সততা
          </p>
          <p className="text-sm font-bold" style={{ color: S.text }}>
            যেকোনো নিয়ম ভঙ্গ করলে পরীক্ষা তাৎক্ষণিকভাবে বাতিল হবে এবং পুনরায় চালিয়ে যাওয়া যাবে না।
          </p>
        </div>

        {/* Confirmation checkbox */}
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: 'rgba(101,209,178,0.06)', border: '1.5px solid rgba(101,209,178,0.20)' }}
        >
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 rounded accent-emerald-500 cursor-pointer"
              style={{ accentColor: S.accent }}
            />
            <span className="text-sm font-bold leading-relaxed" style={{ color: S.text }}>
              ☐ আমি পরীক্ষার সকল নিয়ম পড়েছি এবং মেনে চলতে সম্মত।
            </span>
          </label>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pb-6">
          <button
            onClick={onBack}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: S.muted, border: '1px solid rgba(255,255,255,0.08)' }}
          >
            ← ফিরে যান
          </button>
          <button
            onClick={onStart}
            disabled={!agreed}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              backgroundColor: agreed ? S.accent : 'rgba(101,209,178,0.15)',
              color: agreed ? '#04342C' : S.muted,
              boxShadow: agreed ? '0 0 24px rgba(101,209,178,0.30)' : 'none',
            }}
          >
            🚀 পরীক্ষা শুরু করুন
          </button>
        </div>

      </div>
    </div>
  )
}
