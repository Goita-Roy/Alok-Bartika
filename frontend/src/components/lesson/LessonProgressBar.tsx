import { useTheme } from '../../context/ThemeContext'

interface LessonProgressBarProps {
  progress?: number
}

export function LessonProgressBar({ progress = 0 }: LessonProgressBarProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const pct = Math.max(0, Math.min(100, Math.round(progress)))

  return (
    <div
      className="w-full px-4 py-3 flex items-center gap-3"
      style={{
        backgroundColor: isDark ? '#0A4A3F' : '#f0f7f4',
        borderBottom: `1px solid ${isDark ? 'rgba(101,209,178,0.12)' : '#DCE8E2'}`,
      }}
    >
      <span
        className="text-xs font-black uppercase tracking-wider shrink-0"
        style={{ color: isDark ? '#B8C5C1' : '#4B5563' }}
      >
        অগ্রগতি
      </span>
      <div
        className="flex-1 h-2.5 rounded-full overflow-hidden"
        style={{ backgroundColor: isDark ? 'rgba(101,209,178,0.10)' : '#DCE8E2' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: isDark
              ? 'linear-gradient(90deg, #0E7C66, #65D1B2)'
              : 'linear-gradient(90deg, #0E7C66, #FFC93C)',
          }}
        />
      </div>
      <span
        className="text-xs font-black tabular-nums w-10 text-right shrink-0"
        style={{ color: isDark ? '#65D1B2' : '#0E7C66' }}
      >
        {pct}%
      </span>
    </div>
  )
}
