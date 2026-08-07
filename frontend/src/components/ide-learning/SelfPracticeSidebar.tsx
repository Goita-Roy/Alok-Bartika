import { useState } from 'react'
import { selfPracticeQuestions, type SelfPracticeQuestion } from '../../data/selfPracticeQuestions'

type SelfPracticeSidebarProps = {
  theme: 'dark' | 'light'
}

export function SelfPracticeSidebar({ theme }: SelfPracticeSidebarProps) {
  const isDark = theme === 'dark'
  const [selected, setSelected] = useState<SelfPracticeQuestion>(selfPracticeQuestions[0])

  return (
    <div className={`flex flex-col h-full overflow-hidden ${isDark ? 'bg-[#1b1928] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-0.5">
          {selfPracticeQuestions.map((q) => {
            const active = q.id === selected.id
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setSelected(q)}
                className={`w-full block px-3 py-2 rounded text-left text-sm font-medium transition ${
                  active
                    ? isDark
                      ? 'bg-violet-600/20 text-violet-100'
                      : 'bg-indigo-100 text-indigo-900'
                    : `${isDark ? 'hover:bg-[#0e0c13] text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`
                }`}
              >
                Problem {q.practiceNumber}
              </button>
            )
          })}
        </div>

        {selected && (
          <div className={`mt-4 pt-4 border-t ${isDark ? 'border-[#2d2a3f]' : 'border-slate-200'}`}>
            <h3 className="text-sm font-bold leading-snug">{selected.title}</h3>
            <p className={`mt-1.5 text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {selected.statement}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}