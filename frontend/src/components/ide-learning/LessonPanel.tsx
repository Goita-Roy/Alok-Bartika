import { CheckCircle2, ChevronRight, Target, Lightbulb, ListChecks } from 'lucide-react'
import type { IDELessonClass } from '../../data/ideLessonData'
import { LANGUAGE_LABELS } from '../../data/ideLessonData'

type LessonPanelProps = {
  classes: IDELessonClass[]
  activeClass: IDELessonClass
  onSelectClass: (id: string) => void
  completedClassIds: string[]
  overallPercent: number
  theme: 'dark' | 'light'
}

export function LessonPanel({
  classes,
  activeClass,
  onSelectClass,
  completedClassIds,
  overallPercent,
  theme,
}: LessonPanelProps) {
  const isDark = theme === 'dark'

  return (
    <div
      className={`flex flex-col h-full overflow-hidden ${
        isDark ? 'bg-[#1b1928] text-slate-200' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className={`p-4 border-b shrink-0 ${isDark ? 'border-[#2d2a3f]' : 'border-slate-200'}`}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-1">
          ডেভেলপমেন্ট ফেজ IDE
        </p>
        <h2 className="text-lg font-black leading-tight">{activeClass.heading}</h2>
        <div className="mt-3 flex items-center gap-2">
          <div className={`flex-1 h-2 rounded-full ${isDark ? 'bg-[#0e0c13]' : 'bg-slate-200'}`}>
            <div
              className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
          <span className="text-[10px] font-bold">{overallPercent}%</span>
        </div>
      </div>

      <div className={`px-3 py-2 border-b overflow-x-auto shrink-0 ${isDark ? 'border-[#2d2a3f]' : 'border-slate-200'}`}>
        <div className="flex gap-2 min-w-max">
          {classes.map((cls) => {
            const done = completedClassIds.includes(cls.id)
            const active = cls.id === activeClass.id
            return (
              <button
                key={cls.id}
                type="button"
                onClick={() => onSelectClass(cls.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                  active
                    ? 'bg-violet-500 text-white'
                    : isDark
                      ? 'bg-[#14121c] text-slate-400 hover:text-white'
                      : 'bg-white text-slate-600 hover:bg-indigo-50'
                }`}
              >
                {done ? <CheckCircle2 size={12} className="text-emerald-400" /> : null}
                ক্লাস {cls.classNumber}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-sm">
        <section>
          <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest text-violet-400">
            <Target size={14} /> শিখন ফল
          </div>
          <ul className="space-y-1.5">
            {activeClass.objectives.map((o) => (
              <li key={o} className="flex items-start gap-2">
                <ChevronRight size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{o}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-2">তত্ত্ব ও ব্যাখ্যা</div>
          <p className={`leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{activeClass.theory}</p>
        </section>

        <section>
          <div className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-2">উদাহরণ</div>
          <div className="space-y-2">
            {activeClass.examples.map((ex) => (
              <div
                key={ex.title}
                className={`rounded-xl border p-3 ${isDark ? 'border-[#2d2a3f] bg-[#0e0c13]' : 'border-slate-200 bg-white'}`}
              >
                <div className="text-xs font-bold mb-1">{ex.title}</div>
                <pre className="text-[11px] font-mono overflow-x-auto text-emerald-400">{ex.code}</pre>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest text-amber-400">
            <ListChecks size={14} /> প্র্যাকটিস প্রশ্ন
          </div>
          <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>{activeClass.practiceQuestion}</p>
        </section>

        <section>
          <div className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">কোডিং টাস্ক</div>
          <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeClass.codingTask}</p>
        </section>

        <section>
          <div className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-2">নির্দেশনা</div>
          <ol className="list-decimal list-inside space-y-1">
            {activeClass.instructions.map((step) => (
              <li key={step} className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                {step}
              </li>
            ))}
          </ol>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
            <Lightbulb size={14} /> ইঙ্গিত
          </div>
          <ul className="space-y-1">
            {activeClass.hints.map((h) => (
              <li key={h} className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                • {h}
              </li>
            ))}
          </ul>
        </section>

        {activeClass.expectedOutput ? (
          <section>
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">প্রত্যাশিত আউটপুট</div>
            <pre
              className={`rounded-xl border p-3 text-xs font-mono whitespace-pre-wrap ${
                isDark ? 'border-[#2d2a3f] bg-[#0e0c13] text-emerald-300' : 'border-slate-200 bg-white text-emerald-700'
              }`}
            >
              {activeClass.expectedOutput}
            </pre>
          </section>
        ) : null}

        <section className={`rounded-xl border p-3 ${isDark ? 'border-violet-500/30 bg-violet-500/5' : 'border-indigo-200 bg-indigo-50'}`}>
          <div className="text-xs font-bold uppercase tracking-widest mb-1">লাইভ কোডিং এরিয়া</div>
          <p className="text-xs opacity-80">
            এই ক্লাসের কোড লিখতে ডানের এডিটর ব্যবহার করুন। ভাষা:{' '}
            <span className="font-bold">{LANGUAGE_LABELS[activeClass.language]}</span>
          </p>
        </section>
      </div>
    </div>
  )
}
