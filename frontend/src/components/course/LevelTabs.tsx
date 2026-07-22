import { Lock } from 'lucide-react'
import type { LearningLevel } from '../../hooks/useCourseProgress'

type LevelTabItem = {
  level: LearningLevel
  label: string
  unlocked: boolean
  progress: number
}

type LevelTabsProps = {
  activeLevel: LearningLevel
  tabs: LevelTabItem[]
  onSelect: (level: LearningLevel) => void
}

export function LevelTabs({ activeLevel, tabs, onSelect }: LevelTabsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {tabs.map((tab) => {
        const isActive = tab.level === activeLevel
        return (
          <button
            key={tab.level}
            type="button"
            onClick={() => tab.unlocked && onSelect(tab.level)}
            disabled={!tab.unlocked}
            className={`rounded-2xl border p-4 text-left transition-all ${
              isActive
                ? 'border-indigo-500 bg-indigo-50 shadow-md'
                : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-md'
            } ${!tab.unlocked ? 'cursor-not-allowed opacity-60 grayscale' : ''}`}
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="font-bold capitalize text-slate-900">{tab.label}</p>
              {!tab.unlocked && <Lock size={16} className="text-slate-500" />}
            </div>
            <p className="mb-2 text-xs text-slate-500">{tab.progress}% completed</p>
            <div className="h-2 rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
                style={{ width: `${tab.progress}%` }}
              />
            </div>
          </button>
        )
      })}
    </div>
  )
}
