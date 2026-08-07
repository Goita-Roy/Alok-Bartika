import { useState } from 'react';
import { CheckCircle2, ChevronRight, Zap } from 'lucide-react'
import type { IDELessonClass } from '../../data/ideLessonData'
import type { Practice } from '../../data/advancedPracticeData'

type LessonPanelProps = {
  classes: IDELessonClass[]
  activeClass: IDELessonClass
  onSelectClass: (id: string) => void
  completedClassIds: string[]
  overallPercent: number
  theme: 'dark' | 'light'
  classPractices: Record<string, Practice[]>
  activePracticeId?: string
  onSelectPractice: (practice: Practice) => void
}

export function LessonPanel({
  classes,
  activeClass,
  onSelectClass,
  completedClassIds,
  classPractices,
  activePracticeId,
  onSelectPractice,
  theme,
}: LessonPanelProps) {
  const isDark = theme === 'dark'
  const bgCls = isDark ? 'bg-[#1b1928] text-slate-200' : 'bg-slate-50 text-slate-900'
  const borderCls = isDark ? 'border-[#2d2a3f]' : 'border-slate-200'
  const mutedCls = isDark ? 'text-slate-400' : 'text-slate-500'

  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    classes.forEach((cls, idx) => {
      initial[cls.id] = idx === 0
    })
    return initial
  })

  const toggleClass = (classId: string) => {
    setExpandedClasses((prev) => ({ ...prev, [classId]: !prev[classId] }))
  }

  return (
    <div className={`flex flex-col h-full overflow-hidden ${bgCls}`}>
      <div className={`p-4 border-b shrink-0 ${borderCls}`}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-1">
          Advanced Practice
        </p>
        <h2 className="text-base font-black leading-tight">Class Practice</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {classes.map((cls) => {
            const done = completedClassIds.includes(cls.id)
            const active = cls.id === activeClass.id
            const isExpanded = expandedClasses[cls.id] ?? false

            const headerActive = active
              ? isDark
                ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
                : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
              : isDark
                ? 'text-slate-300 hover:bg-[#0e0c13]'
                : 'text-slate-700 hover:bg-slate-100'

            return (
              <div key={cls.id} className="space-y-1">
                {/* Class Header - Clickable to toggle */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectClass(cls.id)
                    toggleClass(cls.id)
                  }}
                  className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm font-bold transition ${headerActive}`}
                >
                  <ChevronRight
                    size={14}
                    className={`flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''} ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                  />
                  {done ? (
                    <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                  ) : (
                    <span
                      className={`mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        active
                          ? isDark
                            ? 'bg-violet-400/50'
                            : 'bg-indigo-400/50'
                          : isDark
                            ? 'bg-slate-600'
                            : 'bg-slate-300'
                      }`}
                    />
                  )}
                  Class {cls.classNumber}
                </button>

                {/* Practices List - Collapsible with animation */}
                <div
                  className={`overflow-hidden transition-all duration-200 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className={`ml-6 mt-0.5 space-y-0.5 ${isDark ? 'border-l border-[#2d2a3f]' : 'border-l border-slate-200'}`}>
                    {(classPractices[cls.id] || []).map((practice) => {
                      const isActivePractice = activePracticeId === practice.id
                      return (
                        <button
                          key={practice.id}
                          type="button"
                          onClick={() => {
                            onSelectPractice(practice)
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors
                            ${
                              isActivePractice
                                ? isDark
                                  ? 'bg-violet-500/15 text-violet-300'
                                  : 'bg-indigo-100 text-indigo-800'
                                : active
                                  ? isDark
                                    ? 'text-violet-300 hover:bg-[#0e0c13]'
                                    : 'text-indigo-700 hover:bg-slate-100'
                                  : mutedCls
                            }`}
                        >
                          <span className={`text-xs ${
                            isActivePractice
                              ? isDark
                                ? 'text-emerald-400'
                                : 'text-emerald-600'
                              : active
                                ? isDark
                                  ? 'text-emerald-400'
                                  : 'text-emerald-600'
                                : mutedCls
                          }`}>
                            {isActivePractice ? '✓' : '•'}
                          </span>
                          <span className="flex-1 min-w-0 truncate">
                            প্র্যাক্টিস {practice.practiceNumber}: {practice.title}
                          </span>
                          {typeof practice.xp === 'number' ? (
                            <span className={`shrink-0 flex items-center gap-0.5 text-[9px] font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                              <Zap size={9} /> {practice.xp} XP
                            </span>
                          ) : null}
                          {practice.difficulty && (
                            <span className={`shrink-0 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              practice.difficulty === 'Easy'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : practice.difficulty === 'Medium'
                                  ? 'bg-amber-500/15 text-amber-400'
                                  : 'bg-red-500/15 text-red-400'
                            }`}>
                              {practice.difficulty}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
