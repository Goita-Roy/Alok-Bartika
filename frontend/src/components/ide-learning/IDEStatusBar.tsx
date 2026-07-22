import { Terminal, CheckCircle2, AlertCircle, Loader2, Clock, Timer } from 'lucide-react'
import type { ExecutionStatus } from '../../utils/codeRunner'

type IDEStatusBarProps = {
  theme: 'dark' | 'light'
  language: string
  executionStatus: ExecutionStatus
  executionTime: number | null
  lineCount: number
  cursorLine: number
  cursorColumn: number
  encoding: string
}

export function IDEStatusBar({
  theme,
  language,
  executionStatus,
  executionTime,
  lineCount,
  cursorLine,
  cursorColumn,
  encoding,
}: IDEStatusBarProps) {
  const isDark = theme === 'dark'

  const statusConfig: Record<ExecutionStatus, { icon: typeof Terminal; label: string; color: string }> = {
    idle: { icon: Terminal, label: 'প্রস্তুত', color: 'text-slate-400' },
    running: { icon: Loader2, label: 'চলছে...', color: 'text-amber-400' },
    success: { icon: CheckCircle2, label: 'সম্পন্ন', color: 'text-emerald-400' },
    error: { icon: AlertCircle, label: 'রানটাইম ত্রুটি', color: 'text-red-400' },
    timeout: { icon: AlertCircle, label: 'সময় শেষ', color: 'text-orange-400' },
    cancelled: { icon: AlertCircle, label: 'বাতিল', color: 'text-slate-400' },
  }

  const StatusIcon = statusConfig[executionStatus].icon

  const sections: { label: string; value: React.ReactNode }[] = [
    {
      label: 'ভাষা',
      value: (
        <span className="font-semibold">
          <span className="text-emerald-400">●</span> {language}
        </span>
      ),
    },
    {
      label: 'অবস্থা',
      value: (
        <span className={`flex items-center gap-1 font-semibold ${statusConfig[executionStatus].color}`}>
          <StatusIcon size={11} className={executionStatus === 'running' ? 'animate-spin' : ''} />
          {statusConfig[executionStatus].label}
        </span>
      ),
    },
    {
      label: 'সময়',
      value: executionTime !== null ? (
        <span className="flex items-center gap-1">
          <Timer size={10} />
          {executionTime}ms
        </span>
      ) : (
        <span className="opacity-50">—</span>
      ),
    },
    {
      label: 'লাইন',
      value: <span>{cursorLine}</span>,
    },
    {
      label: 'কলাম',
      value: <span>{cursorColumn}</span>,
    },
    {
      label: 'মোট লাইন',
      value: <span>{lineCount}</span>,
    },
    {
      label: 'এনকোডিং',
      value: <span>{encoding}</span>,
    },
  ]

  return (
    <div
      className={`flex items-center justify-between px-3 py-1 text-[10px] shrink-0 border-t ${
        isDark ? 'bg-[#0e0c13] border-[#2d2a3f] text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-500'
      }`}
    >
      <div className="flex items-center gap-4">
        {sections.map((s) => (
          <div key={s.label} className="flex items-center gap-1">
            <span className="opacity-50">{s.label}:</span>
            <span className="font-medium">{s.value}</span>
          </div>
        ))}
      </div>
      <div className={`text-[9px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
        আলোকবর্তিকা IDE v1.0
      </div>
    </div>
  )
}
