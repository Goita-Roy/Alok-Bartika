import { AlertTriangle, CheckCircle2, Lightbulb, Wrench, Bug } from 'lucide-react'
import type { CodeErrorDetail } from '../../utils/codeAnalyzer'

type ErrorAnalysisPanelProps = {
  errors: CodeErrorDetail[]
  theme: 'dark' | 'light'
  selectedLine?: number | null
  onSelectError?: (error: CodeErrorDetail) => void
}

export function ErrorAnalysisPanel({ errors, theme, selectedLine, onSelectError }: ErrorAnalysisPanelProps) {
  const isDark = theme === 'dark'

  if (!errors.length) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 text-xs ${
          isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
        }`}
      >
        <CheckCircle2 size={14} />
        <span className="font-semibold">কোনো ত্রুটি পাওয়া যায়নি</span>
      </div>
    )
  }

  return (
    <div className={`max-h-44 overflow-y-auto border-t ${isDark ? 'border-[#2d2a3f] bg-[#0e0c13]' : 'border-slate-200 bg-red-50/50'}`}>
      {errors.map((error, idx) => {
        const isSelected = selectedLine === error.line
        return (
        <button
          key={`${error.line}-${idx}`}
          type="button"
          onClick={() => onSelectError?.(error)}
          className={`w-full text-left px-3 py-2.5 border-b last:border-b-0 transition-all hover:opacity-90 ${
            isSelected
              ? isDark
                ? 'bg-red-500/15 border-l-2 border-l-red-400'
                : 'bg-red-100 border-l-2 border-l-red-500'
              : ''
          } ${
            isDark ? 'border-[#2d2a3f] hover:bg-[#1b1928]' : 'border-red-100 hover:bg-red-50'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Bug size={12} className="text-red-400 shrink-0" />
            <span className="text-[10px] font-black uppercase text-red-400">লাইন {error.line}</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700'}`}>
              {error.type === 'syntax' ? 'সিনট্যাক্স' : error.type === 'runtime' ? 'রানটাইম' : error.type === 'logic' ? 'লজিক' : 'সতর্কতা'}
            </span>
            <span className={`ml-auto text-[9px] font-bold ${error.fixStatus === 'resolved' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {error.fixStatus === 'resolved' ? 'সমাধান ✓' : 'বাকি'}
            </span>
          </div>
          <p className={`text-xs font-medium leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {error.banglaExplanation}
          </p>
          <p className={`mt-1 flex items-start gap-1 text-[11px] ${isDark ? 'text-violet-300' : 'text-indigo-700'}`}>
            <Wrench size={11} className="mt-0.5 shrink-0" />
            <span>{error.suggestedFix}</span>
          </p>
          {error.correctedExample ? (
            <pre className={`mt-1.5 text-[10px] font-mono rounded p-2 overflow-x-auto ${isDark ? 'bg-[#14121c] text-emerald-300' : 'bg-white text-emerald-700 border'}`}>
              {error.correctedExample}
            </pre>
          ) : null}
          {error.learningTip ? (
            <p className={`mt-1 flex items-start gap-1 text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <Lightbulb size={10} className="mt-0.5 shrink-0" />
              <span>{error.learningTip}</span>
            </p>
          ) : null}
        </button>
        )
      })}
    </div>
  )
}
