import { useEffect, useRef, useState } from 'react'
import type { editor } from 'monaco-editor'
import {
  Play,
  Trash2,
  Copy,
  Download,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  FilePlus,
  Pencil,
  X,
  FolderTree,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCode,
  FileText,
  FileJson,
  Terminal,
  ChevronUp,
  ChevronDown,
  PanelBottom,
} from 'lucide-react'
import type { IDELessonClass } from '../../data/ideLessonData'
import { LANGUAGE_LABELS, type SupportedLanguage } from '../../data/ideLessonData'
import type { IDEFile, IDETheme } from '../../hooks/useIDEWorkspace'
import type { ExecutionStatus } from '../../utils/codeRunner'
import type { CodeErrorDetail } from '../../utils/codeAnalyzer'
import { AIAssistantPanel } from './AIAssistantPanel'
import { IDECodeEditor } from './IDECodeEditor'
import { ErrorAnalysisPanel } from './ErrorAnalysisPanel'
import { IDEConsole } from './IDEConsole'
import { IDEStatusBar } from './IDEStatusBar'

type WorkspacePanelProps = {
  lesson: IDELessonClass | null
  files: IDEFile[]
  activeFile: IDEFile
  openTabIds: string[]
  theme: IDETheme
  isFullscreen: boolean
  monacoLanguage: string
  executionStatus: ExecutionStatus
  stdout: string
  stderr: string | null
  previewHtml: string | null
  stdin: string
  errors: CodeErrorDetail[]
  hasRun: boolean
  runTrigger: number
  runSuccess: boolean
  runErrors: CodeErrorDetail[]
  focusedErrorLine: number | null
  executionTime: number | null
  onFocusErrorLine: (line: number | null) => void
  onStdinChange: (v: string) => void
  onRun: () => void
  onClearConsole: () => void
  onUpdateContent: (id: string, content: string) => void
  onCreateFile: (lang?: SupportedLanguage) => void
  onRenameFile: (id: string, name: string) => void
  onDeleteFile: (id: string) => void
  onOpenTab: (id: string) => void
  onCloseTab: (id: string) => void
  onToggleTheme: () => void
  onToggleFullscreen: () => void
  onDownload: () => void
  onCopy: () => void
  onMarkComplete?: () => void
  isComplete?: boolean
  mode: 'learning' | 'sandbox'
  onCursorChange?: (line: number, column: number) => void
  onScrollChange?: (scrollTop: number) => void
  onEditorMount?: (ed: editor.IStandaloneCodeEditor) => void
}

const LANG_OPTIONS: SupportedLanguage[] = ['python', 'html', 'css', 'javascript', 'c', 'cpp', 'java']

const fileIcons: Record<string, typeof FileCode> = {
  py: Terminal,
  js: FileCode,
  ts: FileCode,
  html: FileCode,
  css: FileJson,
  c: FileCode,
  cpp: FileCode,
  java: FileCode,
  txt: FileText,
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop() ?? ''
  const Icon = fileIcons[ext] ?? FileCode
  return Icon
}

export function WorkspacePanel({
  lesson,
  files,
  activeFile,
  openTabIds,
  theme,
  isFullscreen,
  monacoLanguage,
  executionStatus,
  stdout,
  stderr,
  previewHtml,
  stdin,
  errors,
  hasRun,
  runTrigger,
  runSuccess,
  runErrors,
  focusedErrorLine,
  executionTime,
  onFocusErrorLine,
  onStdinChange,
  onRun,
  onClearConsole,
  onUpdateContent,
  onCreateFile,
  onRenameFile,
  onDeleteFile,
  onOpenTab,
  onCloseTab,
  onToggleTheme,
  onToggleFullscreen,
  onDownload,
  onCopy,
  onMarkComplete,
  isComplete,
  mode,
  onCursorChange,
  onScrollChange,
  onEditorMount,
}: WorkspacePanelProps) {
  const isDark = theme === 'dark'
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [newLang, setNewLang] = useState<SupportedLanguage>('python')
  const [copied, setCopied] = useState(false)
  const [previewTab, setPreviewTab] = useState<'console' | 'preview'>('console')
  const [consoleExpanded, setConsoleExpanded] = useState(false)
  const [cursorLine, setCursorLine] = useState(1)
  const [cursorColumn, setCursorColumn] = useState(1)
  const [showExplorer, setShowExplorer] = useState(true)
  const [showErrors, setShowErrors] = useState(true)
  const [showStdin, setShowStdin] = useState(true)
  const rootRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    if (previewHtml) setPreviewTab('preview')
  }, [previewHtml])

  useEffect(() => {
    if (hasRun) setConsoleExpanded(true)
  }, [hasRun])

  const shellCls = isDark ? 'bg-[#0e0c13] text-slate-200' : 'bg-white text-slate-900'
  const borderCls = isDark ? 'border-[#2d2a3f]' : 'border-slate-200'
  const panelCls = isDark ? 'bg-[#14121c]' : 'bg-slate-50'
  const btnCls = isDark
    ? 'bg-[#1b1928] hover:bg-[#252236] border-[#2d2a3f] text-slate-300'
    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'

  const statusBadge = () => {
    if (executionStatus === 'running') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
          <Loader2 size={12} className="animate-spin" /> চলছে
        </span>
      )
    }
    if (executionStatus === 'success') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
          <CheckCircle2 size={12} /> সফল
        </span>
      )
    }
    if (executionStatus === 'error') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-red-400">
          <AlertCircle size={12} /> ত্রুটি
        </span>
      )
    }
    if (executionStatus === 'timeout') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-orange-400">
          <AlertCircle size={12} /> সময় শেষ
        </span>
      )
    }
    return <span className="text-[10px] font-bold text-slate-500">প্রস্তুত</span>
  }

  const handleCopy = async () => {
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const startRename = (file: IDEFile) => {
    setRenamingId(file.id)
    setRenameValue(file.name)
  }

  const commitRename = () => {
    if (renamingId && renameValue.trim()) onRenameFile(renamingId, renameValue.trim())
    setRenamingId(null)
  }

  const handleCopyOutput = async () => {
    const text = [stderr, stdout].filter(Boolean).join('\n')
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      /* ignore */
    }
  }

  const handleDownloadOutput = () => {
    const text = [stderr, stdout].filter(Boolean).join('\n')
    if (!text) return
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'output.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div ref={rootRef} className={`flex flex-col h-full overflow-hidden ${shellCls}`}>
      {/* Toolbar */}
      <div className={`flex flex-wrap items-center gap-1.5 px-3 py-2 border-b shrink-0 ${borderCls}`}>
        <button
          type="button"
          onClick={onRun}
          disabled={executionStatus === 'running'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white text-xs font-bold disabled:opacity-50 transition shadow-sm"
        >
          <Play size={14} fill="currentColor" />
          চালান
        </button>

        <div className={`w-px h-5 ${borderCls}`} />

        <button
          type="button"
          onClick={onClearConsole}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition ${btnCls}`}
          title="কনসোল পরিষ্কার করুন"
        >
          <Trash2 size={12} /> পরিষ্কার
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition ${btnCls}`}
          title="কোড কপি করুন"
        >
          <Copy size={12} /> {copied ? 'কপি হয়েছে!' : 'কপি'}
        </button>
        <button
          type="button"
          onClick={onDownload}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition ${btnCls}`}
          title="প্রকল্প ডাউনলোড করুন"
        >
          <Download size={12} /> ডাউনলোড
        </button>

        <div className={`w-px h-5 ${borderCls}`} />

        <button
          type="button"
          onClick={() => setShowExplorer((v) => !v)}
          className={`p-1.5 rounded-lg border transition ${btnCls} ${showExplorer ? 'ring-1 ring-violet-500/30' : ''}`}
          title="ফাইল এক্সপ্লোরার টগল করুন"
        >
          <FolderTree size={13} />
        </button>
        <button
          type="button"
          onClick={onToggleTheme}
          className={`p-1.5 rounded-lg border transition ${btnCls}`}
          title="থিম টগল করুন"
        >
          {isDark ? <Sun size={13} /> : <Moon size={13} />}
        </button>
        <button
          type="button"
          onClick={onToggleFullscreen}
          className={`p-1.5 rounded-lg border transition ${btnCls}`}
          title="পূর্ণ পর্দা টগল করুন"
        >
          {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        </button>

        <div className="flex-1" />

        <span className={`text-[10px] font-bold px-2 py-1 rounded border ${btnCls}`}>
          {LANGUAGE_LABELS[activeFile.language]}
        </span>
        {statusBadge()}

        {mode === 'learning' && onMarkComplete && !isComplete ? (
          <button
            type="button"
            onClick={onMarkComplete}
            className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-violet-600 text-white hover:from-violet-400 hover:to-violet-500 transition"
          >
            সম্পন্ন চিহ্নিত করুন
          </button>
        ) : null}
        {isComplete ? (
          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 size={12} /> সম্পন্ন
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 min-h-0">
        {/* File explorer sidebar */}
        {showExplorer ? (
          <aside className={`w-48 shrink-0 border-r flex flex-col ${borderCls} ${panelCls}`}>
            <div className={`px-3 py-2.5 border-b text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${borderCls} ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <FolderTree size={12} /> এক্সপ্লোরার
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {files.map((file) => {
                const FileIcon = getFileIcon(file.name)
                const isActive = file.id === activeFile.id
                return (
                  <div
                    key={file.id}
                    className={`group flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs cursor-pointer transition-all ${
                      isActive
                        ? isDark
                          ? 'bg-violet-500/20 text-violet-200 border border-violet-500/20'
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        : `border border-transparent ${isDark ? 'hover:bg-[#1b1928]' : 'hover:bg-slate-100'}`
                    }`}
                    onClick={() => onOpenTab(file.id)}
                  >
                    <FileIcon size={13} className={isActive ? 'text-violet-400' : isDark ? 'text-slate-500' : 'text-slate-400'} />
                    {renamingId === file.id ? (
                      <input
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(e) => e.key === 'Enter' && commitRename()}
                        className="w-full bg-transparent border-b outline-none text-xs"
                        autoFocus
                      />
                    ) : (
                      <span className="truncate flex-1">{file.name}</span>
                    )}
                    <button
                      type="button"
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-black/10 rounded"
                      onClick={(e) => { e.stopPropagation(); startRename(file) }}
                    >
                      <Pencil size={10} />
                    </button>
                    {files.length > 1 ? (
                      <button
                        type="button"
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-black/10 rounded text-red-400"
                        onClick={(e) => { e.stopPropagation(); onDeleteFile(file.id) }}
                      >
                        <X size={10} />
                      </button>
                    ) : null}
                  </div>
                )
              })}
            </div>
            <div className={`p-2.5 border-t space-y-1.5 ${borderCls}`}>
              <select
                value={newLang}
                onChange={(e) => setNewLang(e.target.value as SupportedLanguage)}
                className={`w-full text-[10px] rounded-lg border px-2 py-1.5 outline-none ${
                  isDark ? 'bg-[#0e0c13] border-[#2d2a3f] text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                {LANG_OPTIONS.map((l) => (
                  <option key={l} value={l}>{LANGUAGE_LABELS[l]}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => onCreateFile(newLang)}
                className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-[10px] font-bold transition ${btnCls} hover:bg-emerald-500 hover:text-white hover:border-emerald-500`}
              >
                <FilePlus size={12} /> নতুন ফাইল
              </button>
            </div>
          </aside>
        ) : null}

        {/* Editor + bottom panels */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tab bar */}
          <div className={`flex overflow-x-auto border-b shrink-0 ${borderCls} ${panelCls}`}>
            {openTabIds.map((tabId) => {
              const file = files.find((f) => f.id === tabId)
              if (!file) return null
              const FileIcon = getFileIcon(file.name)
              const isActive = tabId === activeFile.id
              return (
                <button
                  key={tabId}
                  type="button"
                  onClick={() => onOpenTab(tabId)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-r whitespace-nowrap transition-all ${
                    isActive
                      ? isDark
                        ? 'bg-[#0e0c13] text-white border-t-2 border-t-emerald-400'
                        : 'bg-white text-slate-900 border-t-2 border-t-emerald-500'
                      : `opacity-70 hover:opacity-100 ${isDark ? 'text-slate-400' : 'text-slate-500'}`
                  } ${borderCls}`}
                >
                  <FileIcon size={12} className={isActive ? 'text-emerald-400' : ''} />
                  {file.name}
                  {openTabIds.length > 1 ? (
                    <X
                      size={12}
                      className="opacity-0 group-hover:opacity-100 hover:bg-black/10 rounded p-0.5"
                      onClick={(e) => { e.stopPropagation(); onCloseTab(tabId) }}
                    />
                  ) : null}
                </button>
              )
            })}
          </div>

          {/* Main content: editor + console (flex proportions) */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Monaco editor — flex-1 takes most space */}
            <div className="flex-1 min-h-[200px] relative">
              <IDECodeEditor
                fileId={activeFile.id}
                language={monacoLanguage}
                theme={theme}
                value={activeFile.content}
                errors={errors}
                highlightLine={focusedErrorLine}
                onChange={(v) => onUpdateContent(activeFile.id, v)}
                onEditorMount={(ed) => { editorRef.current = ed; onEditorMount?.(ed) }}
                onCursorChange={(line, col) => { setCursorLine(line); setCursorColumn(col); onCursorChange?.(line, col) }}
                onScrollChange={(scrollTop) => { onScrollChange?.(scrollTop) }}
              />
            </div>

            {/* Error Analysis Panel - collapsible */}
            {errors.length > 0 && (
              <div className={`border-t shrink-0 ${borderCls}`}>
                <button
                  type="button"
                  onClick={() => setShowErrors((v) => !v)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase transition ${
                    isDark ? 'bg-red-500/5 text-red-300 hover:bg-red-500/10' : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                >
                  <AlertCircle size={12} />
                  সমস্যা ({errors.length})
                  <span className={`ml-auto transition ${showErrors ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {showErrors && (
                  <ErrorAnalysisPanel
                    errors={errors}
                    theme={theme}
                    selectedLine={focusedErrorLine}
                    onSelectError={(error) => {
                      onFocusErrorLine(error.line)
                      editorRef.current?.revealLineInCenter(error.line)
                      editorRef.current?.setPosition({ lineNumber: error.line, column: 1 })
                      editorRef.current?.focus()
                    }}
                  />
                )}
              </div>
            )}

            {/* Stdin for Python */}
            {activeFile.language === 'python' && showStdin && (
              <div className={`border-t shrink-0 ${borderCls}`}>
                <button
                  type="button"
                  onClick={() => setShowStdin((v) => !v)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase transition ${
                    isDark ? 'hover:bg-[#1b1928] text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                  }`}
                >
                  <Terminal size={12} />
                  স্ট্যান্ডার্ড ইনপুট (stdin)
                  <span className={`ml-auto transition ${showStdin ? 'rotate-180' : ''}`}>▼</span>
                </button>
                <div className="px-3 py-2">
                  <input
                    value={stdin}
                    onChange={(e) => onStdinChange(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-1.5 text-xs font-mono outline-none transition ${
                      isDark ? 'bg-[#0e0c13] border-[#2d2a3f] text-slate-200 focus:border-violet-500' : 'bg-white border-slate-200 focus:border-violet-400'
                    }`}
                    placeholder="input() কলের জন্য ইনপুট"
                  />
                </div>
              </div>
            )}

            {/* Console toggle handle */}
            <div
              className={`shrink-0 flex items-center gap-2 px-3 py-1 border-t cursor-pointer select-none transition ${
                isDark ? 'border-[#2d2a3f] bg-[#1b1928] hover:bg-[#252236] text-slate-400' : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-500'
              }`}
              onClick={() => setConsoleExpanded((v) => !v)}
            >
              <PanelBottom size={11} />
              <span className="text-[10px] font-bold uppercase tracking-wider">কনসোল / আউটপুট</span>
              <span className="ml-auto">
                {consoleExpanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
              </span>
            </div>

            {/* Bottom panel: Console + AI Assistant — 35% when expanded, hidden when collapsed */}
            <div
              className={`border-t overflow-hidden transition-all duration-200 ${
                consoleExpanded
                  ? 'flex-[0_0_38%] min-h-[120px]'
                  : 'h-0 min-h-0 border-t-0'
              } ${borderCls}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 h-full min-h-0">
                <div className={`flex flex-col min-h-0 border-b md:border-b-0 md:border-r ${borderCls}`}>
                  {previewHtml && (
                    <div className={`flex items-center gap-3 px-3 py-1 border-b text-[10px] font-bold uppercase shrink-0 ${borderCls}`}>
                      <button
                        type="button"
                        onClick={() => setPreviewTab('console')}
                        className={previewTab === 'console' ? 'text-emerald-400' : 'opacity-50'}
                      >
                        কনসোল
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewTab('preview')}
                        className={previewTab === 'preview' ? 'text-violet-400' : 'opacity-50'}
                      >
                        প্রিভিউ
                      </button>
                    </div>
                  )}
                  {previewTab === 'preview' && previewHtml ? (
                    <iframe title="প্রিভিউ" srcDoc={previewHtml} className="w-full h-full border-0 rounded bg-white" />
                  ) : (
                    <div className="flex-1 min-h-0 overflow-hidden">
                      <IDEConsole
                        theme={theme}
                        stdout={stdout}
                        stderr={stderr ?? ''}
                        executionStatus={executionStatus}
                        errors={errors}
                        hasRun={hasRun}
                        onClear={onClearConsole}
                        onCopy={handleCopyOutput}
                        onDownload={handleDownloadOutput}
                      />
                    </div>
                  )}
                </div>

                <div className="min-h-0 overflow-hidden">
                  <AIAssistantPanel
                    errors={errors}
                    runTrigger={runTrigger}
                    runSuccess={runSuccess}
                    runErrors={runErrors}
                    focusedErrorLine={focusedErrorLine}
                    theme={theme}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <IDEStatusBar
            theme={theme}
            language={LANGUAGE_LABELS[activeFile.language]}
            executionStatus={executionStatus}
            executionTime={executionTime}
            lineCount={activeFile.content.split('\n').length}
            cursorLine={cursorLine}
            cursorColumn={cursorColumn}
            encoding="UTF-8"
          />
        </div>
      </div>
    </div>
  )
}
