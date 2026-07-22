import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, PenTool, Cpu } from 'lucide-react'
import { ideLessonClasses, type IDELessonClass, type SupportedLanguage } from '../../data/ideLessonData'
import { useIDEWorkspace } from '../../hooks/useIDEWorkspace'
import { useIDEProgress } from '../../hooks/useIDEProgress'
import { usePracticePersistence, type RestoredPractice } from '../../hooks/usePracticePersistence'
import { LessonPanel } from './LessonPanel'
import { WorkspacePanel } from './WorkspacePanel'
import { runWorkspaceCode, validateAgainstExpected, type ExecutionStatus } from '../../utils/codeRunner'
import { analyzeCode, mergeErrors, parseRuntimeError, type CodeErrorDetail } from '../../utils/codeAnalyzer'
import { API_BASE_URL } from '../../config/api'
import type { editor } from 'monaco-editor'

type IDELearningEnvironmentProps = {
  mode?: 'learning' | 'sandbox'
  practiceKey?: string
}

export function IDELearningEnvironment({ mode: initialMode = 'learning', practiceKey }: IDELearningEnvironmentProps) {
  const [mode, setMode] = useState<'learning' | 'sandbox'>(initialMode)
  const [activeClassId, setActiveClassId] = useState(ideLessonClasses[0].id)
  const [searchParams] = useSearchParams()
  const lessonIdParam = searchParams.get('lessonId')
  const courseIdParam = searchParams.get('courseId')

  const [dynamicClass, setDynamicClass] = useState<any | null>(null)
  const [isLoadingDynamic, setIsLoadingDynamic] = useState(!!lessonIdParam)
  const [completedDynamicIds, setCompletedDynamicIds] = useState<string[]>([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch(`${API_BASE_URL}/progression`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.completedLessons) {
          const ids = data.completedLessons.map((l: any) => l._id || l)
          setCompletedDynamicIds(ids)
        }
      })
      .catch(err => console.error(err))
  }, [])

  useEffect(() => {
    if (!lessonIdParam) return
    setIsLoadingDynamic(true)
    const token = localStorage.getItem('token')
    fetch(`${API_BASE_URL}/lessons/${lessonIdParam}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(resData => {
        if (resData && resData.data) {
          const lesson = resData.data
          const lang = lesson.language || 'python'
          const filename = lang === 'html' ? 'index.html' : lang === 'javascript' ? 'main.js' : lang === 'c' ? 'main.c' : lang === 'cpp' ? 'main.cpp' : 'main.py'
          const practice = lesson.practice
          const practiceStarterCode = practice?.starterCode || lesson.starterCode || (lang === 'python' ? '# Write your Python code here\n' : '')

          setDynamicClass({
            id: lesson._id,
            classNumber: lesson.order || 1,
            heading: lesson.title,
            language: lang,
            objectives: practice?.objectives?.length ? practice.objectives : ['পাঠের প্র্যাকটিস কাজটি সমাধান করুন।'],
            theory: practice?.description || lesson.content || '',
            examples: [],
            practiceQuestion: practice?.title || '',
            codingTask: practice?.description || lesson.codingProblem || 'প্র্যাকটিস কাজটি সম্পন্ন করুন।',
            instructions: practice?.instructions?.length
              ? practice.instructions
              : [
                  `Open ${filename} in the editor.`,
                  'Write your code to solve the practice task.',
                  'Click Run Code to test your solution.',
                  'Match any expected output and mark complete.'
                ],
            hints: practice?.hints || [],
            expectedOutput: practice?.expectedOutput || lesson.expectedOutput || '',
            starterFiles: [
              {
                name: filename,
                language: lang,
                content: practiceStarterCode
              }
            ],
            isCourseLesson: true,
            courseId: lesson.courseId
          })
        }
        setIsLoadingDynamic(false)
      })
      .catch(err => {
        console.error(err)
        setIsLoadingDynamic(false)
      })
  }, [lessonIdParam])

  const activeClass = useMemo(() => {
    if (dynamicClass) return dynamicClass
    return ideLessonClasses.find((c) => c.id === activeClassId) ?? ideLessonClasses[0]
  }, [dynamicClass, activeClassId])

  // ── Practice persistence (MongoDB is source of truth) ────────────────────────
  // Key: a canonical lesson slug when this is a course lesson, otherwise a
  // stable key ("sandbox", or the resume key passed in via ?resume=).
  const practiceKeyComputed = useMemo(() => {
    if (practiceKey) return practiceKey
    if (mode === 'sandbox') return 'sandbox'
    return activeClass.isCourseLesson && activeClass.id ? activeClass.id : 'sandbox'
  }, [practiceKey, mode, activeClass])

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const cursorRef = useRef<{ line: number; column: number }>({ line: 1, column: 1 })
  const scrollRef = useRef<number>(0)
  const restoredAppliedRef = useRef(false)

  const storageKey = mode === 'sandbox' ? 'sandbox' : activeClass.id
  const workspace = useIDEWorkspace(
    storageKey,
    mode === 'learning' ? activeClass.starterFiles : undefined,
  )
  const { completedClassIds, overallPercent, markClassComplete, isClassComplete } = useIDEProgress(
    ideLessonClasses.length,
  )

  const applyRestored = useCallback((state: RestoredPractice) => {
    if (restoredAppliedRef.current) return
    restoredAppliedRef.current = true
    if (state.files && state.files.length) {
      workspace.loadStarterFiles(state.files.map((f) => ({
        name: f.name,
        language: (f.language || 'python') as SupportedLanguage,
        content: f.content,
      })))
    }
    // Defer cursor/scroll restore until the editor is mounted.
    const attempt = (tries: number) => {
      const ed = editorRef.current
      if (ed && state.cursor) {
        ed.setPosition({ lineNumber: state.cursor.line, column: state.cursor.column })
        ed.revealLineInCenter(state.cursor.line)
      }
      if (ed && typeof state.scroll === 'number' && state.scroll > 0) {
        ed.setScrollTop(state.scroll)
      }
      if ((!ed || (state.cursor && !ed.getPosition())) && tries > 0) {
        window.setTimeout(() => attempt(tries - 1), 250)
      }
    }
    window.setTimeout(() => attempt(8), 200)
  }, [workspace])

  const { markComplete } = usePracticePersistence({
    key: practiceKeyComputed,
    enabled: true,
    onRestore: applyRestored,
    getSnapshot: () => ({
      files: workspace.files.map((f) => ({ name: f.name, language: f.language, content: f.content })),
      activeFileId: workspace.activeFileId,
      language: workspace.activeFile?.language,
      code: workspace.activeFile?.content ?? '',
      cursor: cursorRef.current,
      scroll: scrollRef.current,
      lesson: practiceKeyComputed !== 'sandbox' ? practiceKeyComputed : null,
    }),
  })

  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>('idle')
  const [stdout, setStdout] = useState('')
  const [stderr, setStderr] = useState<string | null>(null)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [stdin, setStdin] = useState('')
  const [liveErrors, setLiveErrors] = useState<CodeErrorDetail[]>([])
  const [runErrors, setRunErrors] = useState<CodeErrorDetail[]>([])
  const [runTrigger, setRunTrigger] = useState(0)
  const [runSuccess, setRunSuccess] = useState(false)
  const [hasRun, setHasRun] = useState(false)
  const [focusedErrorLine, setFocusedErrorLine] = useState<number | null>(null)
  const [executionTime, setExecutionTime] = useState<number | null>(null)
  const isRunningRef = useRef(false)

  const activeContent = workspace.activeFile?.content ?? ''
  const activeLanguage = workspace.activeFile?.language ?? 'python'

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLiveErrors(analyzeCode(activeLanguage, activeContent))
    }, 280)
    return () => window.clearTimeout(timer)
  }, [activeContent, activeLanguage])

  const allErrors = useMemo(() => mergeErrors(liveErrors, runErrors), [liveErrors, runErrors])

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) workspace.setIsFullscreen(false)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [workspace])

  const handleRun = useCallback(async () => {
    if (!workspace.activeFile || isRunningRef.current) return
    isRunningRef.current = true

    const lang = workspace.activeFile.language
    const content = workspace.activeFile.content

    setExecutionStatus('running')
    setHasRun(true)
    setRunErrors([])
    setFocusedErrorLine(null)
    setExecutionTime(null)
    setStdout('')
    setStderr(null)

    const startTime = performance.now()

    const staticErrors = analyzeCode(lang, content)

    const result = await runWorkspaceCode(
      lang,
      workspace.files.map((f) => ({ name: f.name, language: f.language, content: f.content })),
      {
        name: workspace.activeFile.name,
        language: workspace.activeFile.language,
        content: workspace.activeFile.content,
      },
      stdin,
    )

    const endTime = performance.now()
    setExecutionTime(Math.round(endTime - startTime))

    const executionErrors: CodeErrorDetail[] = []
    if (result.stderr) {
      const parsed = parseRuntimeError(result.stderr, lang)
      if (parsed) {
        executionErrors.push(parsed)
      } else {
        executionErrors.push({
          line: 1,
          type: result.stderr.toLowerCase().includes('compilation') || result.status === 'error' ? 'syntax' : 'runtime',
          message: result.stderr,
          banglaExplanation: result.guidance ?? result.stderr,
          suggestedFix: 'কোড চেক করে আবার run করুন।',
          fixStatus: 'pending',
        })
      }
    }

    const combinedErrors = mergeErrors(staticErrors, executionErrors)
    setRunErrors(combinedErrors)

    setStdout(result.stdout)
    setStderr(result.stderr)

    let finalStatus: ExecutionStatus = result.status
    if (result.status === 'success' && combinedErrors.length > 0 && result.stderr) {
      finalStatus = 'error'
    }

    const execOk = finalStatus === 'success' && combinedErrors.length === 0
    const outputMatches =
      mode !== 'learning' || !activeClass.expectedOutput ||
      validateAgainstExpected(result.stdout, activeClass.expectedOutput)

    const passed = execOk && outputMatches

    setRunSuccess(passed)
    setRunTrigger((t) => t + 1)
    setExecutionStatus(finalStatus)

    if (passed && mode === 'learning') {
      if (activeClass.isCourseLesson) {
        setCompletedDynamicIds(prev => prev.includes(activeClass.id) ? prev : [...prev, activeClass.id])
        const token = localStorage.getItem('token')
        fetch(`${API_BASE_URL}/progression/complete-lesson`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ lessonId: activeClass.id, courseId: activeClass.courseId }),
        }).catch(err => console.error('Error completing lesson:', err))
        // Also persist the practice working state to MongoDB.
        markComplete(100).catch(() => {})
      } else {
        markClassComplete(activeClass.id)
        markComplete(100).catch(() => {})
      }
    }

    setPreviewHtml(result.previewHtml ?? null)
    isRunningRef.current = false
  }, [workspace, stdin, mode, activeClass, markClassComplete])

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      workspace.setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      workspace.setIsFullscreen(false)
    }
  }

  if (isLoadingDynamic) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]" style={{ backgroundColor: '#0e0c13' }}>
        <span className="loading loading-spinner loading-lg text-violet-400" />
      </div>
    )
  }

  if (!workspace.hydrated || !workspace.activeFile) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="loading loading-spinner loading-lg" />
      </div>
    )
  }

  const isDark = workspace.theme === 'dark'

  return (
    <div
      className={`flex flex-col h-full overflow-hidden rounded-2xl border shadow-2xl ${
        isDark ? 'bg-[#0e0c13] border-[#2d2a3f]' : 'bg-white border-slate-200'
      }`}
    >
      <header
        className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b shrink-0 ${
          isDark ? 'border-[#2d2a3f] bg-[#14121c]' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-3">
          <Link
            to={activeClass.isCourseLesson ? `/courses/${activeClass.courseId}?lesson=${activeClass.id}` : "/courses"}
            className={`p-2 rounded-lg border transition ${isDark ? 'border-[#2d2a3f] hover:bg-[#1b1928]' : 'border-slate-200 hover:bg-white'}`}
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-sm font-black flex items-center gap-2">
              <Cpu size={16} className="text-violet-400" />
              {mode === 'learning' ? 'Development & Practice IDE' : 'Self Practice Sandbox'}
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
              Interactive Learning Environment
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('learning')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              mode === 'learning' ? 'bg-violet-500 text-white shadow-sm' : isDark ? 'bg-[#1b1928] text-slate-400 hover:bg-[#252236]' : 'bg-white text-slate-600 border hover:bg-slate-50'
            }`}
          >
            <BookOpen size={14} /> Class Learning
          </button>
          <button
            type="button"
            onClick={() => setMode('sandbox')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              mode === 'sandbox' ? 'bg-emerald-500 text-black shadow-sm' : isDark ? 'bg-[#1b1928] text-slate-400 hover:bg-[#252236]' : 'bg-white text-slate-600 border hover:bg-slate-50'
            }`}
          >
            <PenTool size={14} /> Free Practice
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
        {mode === 'learning' ? (
          <div className="w-full lg:w-[42%] xl:w-[38%] min-h-[320px] lg:min-h-0 border-b lg:border-b-0 lg:border-r border-inherit shrink-0">
            <LessonPanel
              classes={activeClass.isCourseLesson ? [activeClass] : ideLessonClasses}
              activeClass={activeClass}
              onSelectClass={setActiveClassId}
              completedClassIds={activeClass.isCourseLesson ? completedDynamicIds : completedClassIds}
              overallPercent={activeClass.isCourseLesson ? (completedDynamicIds.includes(activeClass.id) ? 100 : 0) : overallPercent}
              theme={workspace.theme}
            />
          </div>
        ) : null}

        <div className="flex-1 min-h-[480px] lg:min-h-0">
          <WorkspacePanel
            lesson={mode === 'learning' ? activeClass : null}
            files={workspace.files}
            activeFile={workspace.activeFile}
            openTabIds={workspace.openTabIds}
            theme={workspace.theme}
            isFullscreen={workspace.isFullscreen}
            monacoLanguage={workspace.monacoLanguage}
            executionStatus={executionStatus}
            stdout={stdout}
            stderr={stderr}
            previewHtml={previewHtml}
            stdin={stdin}
            errors={allErrors}
            hasRun={hasRun}
            runTrigger={runTrigger}
            runSuccess={runSuccess}
            runErrors={runErrors}
            focusedErrorLine={focusedErrorLine}
            executionTime={executionTime}
            onFocusErrorLine={setFocusedErrorLine}
            onStdinChange={setStdin}
            onRun={handleRun}
            onClearConsole={() => {
              setStdout('')
              setStderr(null)
              setPreviewHtml(null)
              setRunErrors([])
              setRunSuccess(false)
              setHasRun(false)
              setRunTrigger(0)
              setFocusedErrorLine(null)
              setExecutionStatus('idle')
              setExecutionTime(null)
            }}
            onUpdateContent={workspace.updateFileContent}
            onCreateFile={workspace.createFile}
            onRenameFile={workspace.renameFile}
            onDeleteFile={workspace.deleteFile}
            onOpenTab={workspace.openTab}
            onCloseTab={workspace.closeTab}
            onToggleTheme={() => workspace.setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            onToggleFullscreen={toggleFullscreen}
            onDownload={workspace.downloadProject}
            onCopy={workspace.copyActiveCode}
            onEditorMount={(ed) => { editorRef.current = ed }}
            onCursorChange={(line, col) => { cursorRef.current = { line, column: col } }}
            onScrollChange={(scrollTop) => { scrollRef.current = scrollTop }}
            onMarkComplete={() => {
              if (activeClass.isCourseLesson) {
                setCompletedDynamicIds(prev => prev.includes(activeClass.id) ? prev : [...prev, activeClass.id])
                const token = localStorage.getItem('token')
                fetch(`${API_BASE_URL}/progression/complete-lesson`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ lessonId: activeClass.id, courseId: activeClass.courseId }),
                }).catch(err => console.error('Error completing lesson:', err))
              } else {
                markClassComplete(activeClass.id)
              }
              // Persist practice completion (code/time/score) to MongoDB.
              const score = runSuccess ? 100 : 0
              markComplete(score).catch(() => {})
            }}
            isComplete={activeClass.isCourseLesson ? completedDynamicIds.includes(activeClass.id) : isClassComplete(activeClass.id)}
            mode={mode}
          />
        </div>
      </div>
    </div>
  )
}
