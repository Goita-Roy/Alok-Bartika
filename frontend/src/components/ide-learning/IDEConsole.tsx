import { useEffect, useRef, useState } from 'react'
import {
  Terminal,
  FileCode2,
  AlertTriangle,
  Bot,
  Play,
  Variable,
  Bug,
  X,
  Copy,
  Download,
  Trash2,
} from 'lucide-react'
import type { ExecutionStatus } from '../../utils/codeRunner'
import type { CodeErrorDetail } from '../../utils/codeAnalyzer'

type ConsoleTab = 'output' | 'terminal' | 'problems' | 'ai-analysis' | 'execution' | 'variables'

type IDEConsoleProps = {
  theme: 'dark' | 'light'
  stdout: string
  stderr: string
  executionStatus: ExecutionStatus
  errors: CodeErrorDetail[]
  hasRun: boolean
  onClear: () => void
  onCopy: () => void
  onDownload: () => void
}

export function IDEConsole({
  theme,
  stdout,
  stderr,
  executionStatus,
  errors,
  hasRun,
  onClear,
  onCopy,
  onDownload,
}: IDEConsoleProps) {
  const isDark = theme === 'dark'
  const [activeTab, setActiveTab] = useState<ConsoleTab>('output')
  const stdoutRef = useRef<HTMLPreElement>(null)
  const stderrRef = useRef<HTMLPreElement>(null)

  const borderCls = isDark ? 'border-[#2d2a3f]' : 'border-slate-200'
  const panelCls = isDark ? 'bg-[#14121c]' : 'bg-slate-50'
  const textCls = isDark ? 'text-slate-300' : 'text-slate-700'
  const mutedCls = isDark ? 'text-slate-500' : 'text-slate-400'

  useEffect(() => {
    if (stdoutRef.current) {
      stdoutRef.current.scrollTop = stdoutRef.current.scrollHeight
    }
  }, [stdout])

  useEffect(() => {
    if (stderrRef.current) {
      stderrRef.current.scrollTop = stderrRef.current.scrollHeight
    }
  }, [stderr])

  const tabs: { id: ConsoleTab; label: string; icon: typeof Terminal }[] = [
    { id: 'output', label: 'Output', icon: FileCode2 },
    { id: 'terminal', label: 'Terminal', icon: Terminal },
    { id: 'problems', label: 'Problems', icon: AlertTriangle },
    { id: 'ai-analysis', label: 'AI Analysis', icon: Bot },
    { id: 'execution', label: 'Execution', icon: Play },
    { id: 'variables', label: 'Variables', icon: Variable },
  ]

  return (
    <div className={`flex flex-col h-full ${borderCls}`}>
      <div className={`flex items-center justify-between px-1 border-b shrink-0 ${borderCls} ${panelCls}`}>
        <div className="flex items-center overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold whitespace-nowrap border-b-2 transition-all ${
                  isActive
                    ? isDark
                      ? 'border-emerald-400 text-emerald-300 bg-[#0e0c13]'
                      : 'border-emerald-500 text-emerald-700 bg-white'
                    : `border-transparent ${textCls} hover:opacity-80`
                }`}
              >
                <Icon size={13} />
                {tab.label}
                {tab.id === 'problems' && errors.length > 0 ? (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                    isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-600'
                  }`}>
                    {errors.length}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-1 px-2">
          <button
            type="button"
            onClick={onCopy}
            className={`p-1 rounded hover:bg-black/10 ${mutedCls}`}
            title="আউটপুট কপি করুন"
          >
            <Copy size={12} />
          </button>
          <button
            type="button"
            onClick={onDownload}
            className={`p-1 rounded hover:bg-black/10 ${mutedCls}`}
            title="আউটপুট ডাউনলোড করুন"
          >
            <Download size={12} />
          </button>
          <button
            type="button"
            onClick={onClear}
            className={`p-1 rounded hover:bg-black/10 ${mutedCls}`}
            title="কনসোল পরিষ্কার করুন"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'output' && (
          <OutputConsole
            stdout={stdout}
            stderr={stderr}
            hasRun={hasRun}
            isDark={isDark}
            mutedCls={mutedCls}
            textCls={textCls}
            stdoutRef={stdoutRef}
            stderrRef={stderrRef}
          />
        )}
        {activeTab === 'terminal' && (
          <TerminalConsole
            stdout={stdout}
            stderr={stderr}
            hasRun={hasRun}
            isDark={isDark}
            mutedCls={mutedCls}
            textCls={textCls}
          />
        )}
        {activeTab === 'problems' && (
          <ProblemsConsole errors={errors} isDark={isDark} mutedCls={mutedCls} textCls={textCls} />
        )}
        {activeTab === 'ai-analysis' && (
          <AIAnalysisConsole
            errors={errors}
            executionStatus={executionStatus}
            hasRun={hasRun}
            isDark={isDark}
            mutedCls={mutedCls}
            textCls={textCls}
          />
        )}
        {activeTab === 'execution' && (
          <ExecutionConsole executionStatus={executionStatus} hasRun={hasRun} isDark={isDark} mutedCls={mutedCls} textCls={textCls} />
        )}
        {activeTab === 'variables' && (
          <VariablesConsole
            stdout={stdout}
            hasRun={hasRun}
            isDark={isDark}
            mutedCls={mutedCls}
            textCls={textCls}
          />
        )}
      </div>
    </div>
  )
}

function OutputConsole({
  stdout,
  stderr,
  hasRun,
  isDark,
  mutedCls,
  textCls,
  stdoutRef,
  stderrRef,
}: {
  stdout: string
  stderr: string
  hasRun: boolean
  isDark: boolean
  mutedCls: string
  textCls: string
  stdoutRef: React.RefObject<HTMLPreElement | null>
  stderrRef: React.RefObject<HTMLPreElement | null>
}) {
  if (!hasRun) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className={`text-xs italic ${mutedCls}`}>Run code to see output</span>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-3 font-mono text-xs leading-relaxed space-y-2">
      {stderr ? (
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-red-400 mb-1">
            <Bug size={11} /> stderr
          </div>
          <pre
            ref={stderrRef}
            className="text-red-400 whitespace-pre-wrap break-words overflow-auto max-h-32"
          >
            {stderr}
          </pre>
        </div>
      ) : null}
      {stdout !== '' ? (
        <div>
          {stderr ? (
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-emerald-400 mb-1 mt-2">
              <Terminal size={11} /> stdout
            </div>
          ) : null}
          <pre
            ref={stdoutRef}
            className={`whitespace-pre-wrap break-words ${isDark ? 'text-slate-100' : 'text-slate-900'}`}
            style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '12px' }}
          >
            {stdout}
          </pre>
        </div>
      ) : stderr ? null : (
        <span className={`italic ${mutedCls}`}>(no output)</span>
      )}
    </div>
  )
}

function TerminalConsole({
  stdout,
  stderr,
  hasRun,
  isDark,
  mutedCls,
  textCls,
}: {
  stdout: string
  stderr: string
  hasRun: boolean
  isDark: boolean
  mutedCls: string
  textCls: string
}) {
  const barCls = isDark ? 'bg-[#0e0c13]' : 'bg-gray-900'
  const ref = useRef<HTMLPreElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [stdout, stderr])

  if (!hasRun) {
    return (
      <div className={`flex items-center justify-center h-full ${barCls}`}>
        <span className="text-xs italic text-gray-500">$ Run your code to see terminal output</span>
      </div>
    )
  }

  return (
    <div className={`h-full overflow-y-auto p-3 font-mono text-xs leading-relaxed ${barCls}`}>
      <pre ref={ref} className="whitespace-pre-wrap break-words text-green-400">
        {stderr ? (
          <span className="text-red-400">{stderr}</span>
        ) : null}
        {stdout !== '' ? (
          <span>{stdout}</span>
        ) : (
          <span className="italic text-gray-500">(no output)</span>
        )}
        <span className="block mt-2 text-green-400">{'> '}_</span>
      </pre>
    </div>
  )
}

function ProblemsConsole({
  errors,
  isDark,
  mutedCls,
  textCls,
}: {
  errors: CodeErrorDetail[]
  isDark: boolean
  mutedCls: string
  textCls: string
}) {
  if (!errors.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertTriangle size={20} className={`mx-auto mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
          <span className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>No problems detected</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-2 space-y-1">
      {errors.map((e, i) => (
        <div
          key={`${e.line}-${i}`}
          className={`flex items-start gap-2 rounded-lg px-3 py-2 ${
            isDark ? 'bg-red-500/10' : 'bg-red-50'
          }`}
        >
          <AlertTriangle size={13} className="mt-0.5 shrink-0 text-red-400" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px]">
              <span className="font-bold text-red-400">Line {e.line}</span>
              <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700'
              }`}>
                {e.type.toUpperCase()}
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${textCls}`}>{e.banglaExplanation}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function AIAnalysisConsole({
  errors,
  executionStatus,
  hasRun,
  isDark,
  mutedCls,
  textCls,
}: {
  errors: CodeErrorDetail[]
  executionStatus: ExecutionStatus
  hasRun: boolean
  isDark: boolean
  mutedCls: string
  textCls: string
}) {
  if (!hasRun) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Bot size={24} className={`mx-auto mb-2 ${mutedCls}`} />
          <p className={`text-xs ${mutedCls}`}>Run your code to get AI analysis</p>
        </div>
      </div>
    )
  }

  if (executionStatus === 'success' && !errors.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className={`text-2xl mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>✓</div>
          <p className={`text-xs font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
            No Error Detected. Code executed successfully!
          </p>
          <p className={`text-[11px] mt-1 ${mutedCls}`}>
            Your code ran without any issues. Great job!
          </p>
        </div>
      </div>
    )
  }

  if (errors.length > 0) {
    return (
      <div className="h-full overflow-y-auto p-3 space-y-3">
        <div className={`text-xs font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
          Found {errors.length} error{errors.length > 1 ? 's' : ''}:
        </div>
        {errors.map((e, i) => (
          <div
            key={i}
            className={`rounded-lg border p-3 ${
              isDark ? 'border-red-500/20 bg-red-500/5' : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-black ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                Line {e.line}
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700'
              }`}>
                {e.type.toUpperCase()}
              </span>
            </div>
            <p className={`text-xs leading-relaxed ${textCls}`}>{e.banglaExplanation}</p>
            <p className={`mt-1.5 flex items-start gap-1 text-[11px] ${
              isDark ? 'text-violet-300' : 'text-indigo-600'
            }`}>
              <span>💡 {e.suggestedFix}</span>
            </p>
            {e.correctedExample ? (
              <pre className={`mt-1.5 text-[10px] font-mono rounded p-2 overflow-x-auto ${
                isDark ? 'bg-[#0e0c13] text-emerald-300' : 'bg-white text-emerald-700 border'
              }`}>
                {e.correctedExample}
              </pre>
            ) : null}
          </div>
        ))}
      </div>
    )
  }

  return null
}

function ExecutionConsole({
  executionStatus,
  hasRun,
  isDark,
  mutedCls,
  textCls,
}: {
  executionStatus: ExecutionStatus
  hasRun: boolean
  isDark: boolean
  mutedCls: string
  textCls: string
}) {
  const statusConfig: Record<ExecutionStatus, { label: string; color: string; bg: string }> = {
    idle: { label: 'Waiting...', color: 'text-gray-400', bg: isDark ? 'bg-gray-500/10' : 'bg-gray-100' },
    running: { label: 'Running...', color: 'text-amber-400', bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50' },
    success: { label: 'Completed', color: 'text-emerald-400', bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50' },
    error: { label: 'Runtime Error', color: 'text-red-400', bg: isDark ? 'bg-red-500/10' : 'bg-red-50' },
    timeout: { label: 'Execution Timeout', color: 'text-orange-400', bg: isDark ? 'bg-orange-500/10' : 'bg-orange-50' },
    cancelled: { label: 'Cancelled', color: 'text-slate-400', bg: isDark ? 'bg-slate-500/10' : 'bg-slate-100' },
  }

  const config = statusConfig[executionStatus]

  if (!hasRun) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className={`text-xs italic ${mutedCls}`}>Click Run to execute code</span>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className={`rounded-lg border p-4 ${config.bg} ${isDark ? 'border-[#2d2a3f]' : 'border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${executionStatus === 'running' ? 'animate-pulse bg-amber-400' : ''} ${executionStatus === 'success' ? 'bg-emerald-400' : ''} ${executionStatus === 'error' ? 'bg-red-400' : ''} ${executionStatus === 'timeout' ? 'bg-orange-400' : ''}`} />
          <div>
            <p className={`text-sm font-bold ${config.color}`}>{config.label}</p>
            <p className={`text-[10px] ${mutedCls}`}>
              {executionStatus === 'idle' && 'Ready to execute'}
              {executionStatus === 'running' && 'Executing your code...'}
              {executionStatus === 'success' && 'Code ran successfully with no errors'}
              {executionStatus === 'error' && 'An error occurred during execution'}
              {executionStatus === 'timeout' && 'Code took too long to execute (limit: 10s)'}
              {executionStatus === 'cancelled' && 'Execution was cancelled'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function VariablesConsole({
  stdout,
  hasRun,
  isDark,
  mutedCls,
  textCls,
}: {
  stdout: string
  hasRun: boolean
  isDark: boolean
  mutedCls: string
  textCls: string
}) {
  if (!hasRun) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className={`text-xs italic ${mutedCls}`}>ভেরিয়েবল তথ্য দেখতে কোড চালান</span>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className={`rounded-lg border p-4 ${isDark ? 'border-[#2d2a3f] bg-[#0e0c13]' : 'border-slate-200 bg-white'}`}>
        <div className="flex items-center gap-2 mb-3">
          <Variable size={14} className={isDark ? 'text-violet-400' : 'text-violet-600'} />
          <span className={`text-xs font-bold ${textCls}`}>ভেরিয়েবল স্টেট</span>
        </div>
        <p className={`text-xs ${mutedCls}`}>
          আউটপুট সফলভাবে তৈরি হয়েছে। আউটপুট ট্যাবে বিস্তারিত ভেরিয়েবল ট্র্যাকিং দেখুন।
        </p>
      </div>
    </div>
  )
}
