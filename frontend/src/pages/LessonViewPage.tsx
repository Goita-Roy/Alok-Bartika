import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useCopyProtection } from '../hooks/useCopyProtection'
import { CodeEditor } from '../components/CodeEditor'
import { API_BASE_URL } from '../config/api'
import { useAuth } from '../context/AuthContext'
import { useLearningTracker } from '../hooks/useLearningTracker'
import { useDailyCodingTracker } from '../hooks/useDailyCodingTracker'
import { useLessonContentInjector } from '../hooks/useLessonContentInjector'
import { useCourseProgress, type LearningLevel } from '../hooks/useCourseProgress'
import { PracticeSection } from '../components/course/PracticeSection'
import { LessonProgressBar } from '../components/lesson/LessonProgressBar'
import { LessonCompleteToast } from '../components/lesson/LessonCompleteToast'
import { LockedLessonToast } from '../components/lesson/LockedLessonToast'
import { useLessonReadingProgress } from '../hooks/useLessonReadingProgress'
import {
  BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Lock,
  PanelLeftClose, PanelLeft, X, ArrowLeft, ArrowRight, Cpu,
  FileText, Trash2, Download, Search, Edit3, Trophy,
} from 'lucide-react'

const SIDEBAR_KEY = 'alokbartika_sidebar_collapsed'
const READING_WIDTH_KEY = 'alokbartika_reading_width'
const READING_PRESETS = [
  { label: 'S', width: 720, name: 'সংকীর্ণ' },
  { label: 'M', width: 960, name: 'ডিফল্ট' },
  { label: 'L', width: 1280, name: 'প্রশস্ত' },
] as const

const S = {
  surface: '#0A4A3F', bg: '#04342C',
  accent: '#65D1B2', light: '#8FE3CC',
  text: '#F5F7F6', muted: '#B8C5C1', border: '1a5a4a',
}

interface Lesson {
  _id: string; title: string; content?: string; slug: string
  videoUrl?: string; audioUrl?: string; codingProblem?: string; htmlUrl?: string
  language?: string; starterCode?: string; expectedOutput?: string
  practice?: {
    title?: string; description?: string
    objectives?: string[]; instructions?: string[]
    starterCode?: string; expectedOutput?: string
    hints?: string[]; difficulty?: 'easy' | 'medium' | 'hard'
  }
}

interface CourseWithLessons { _id: string; title: string; level?: LearningLevel; lessons: Lesson[] }

function Sidebar({
  course, activeLesson, collapsed, onToggle, onSelect, onCloseMobile,
  lessonStates, onLockedClick,
}: {
  course: CourseWithLessons
  activeLesson: Lesson | null
  collapsed: boolean
  onToggle: () => void
  onSelect: (id: string) => void
  onCloseMobile: () => void
  lessonStates?: Record<string, 'locked' | 'unlocked' | 'completed'>
  onLockedClick: () => void
}) {
  const activeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [activeLesson?.slug])

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: S.surface, borderRight: '1px solid rgba(101,209,178,0.12)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(101,209,178,0.12)' }}>
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen size={16} style={{ color: S.accent }} />
            <h2 className="font-black text-sm truncate" style={{ color: S.text }} title={course.title}>
              {course.title}
            </h2>
          </div>
        )}
        <button
          onClick={onToggle}
          className="shrink-0 p-1.5 rounded-lg transition-colors hover:bg-white/5 hidden lg:flex items-center justify-center"
          style={{ color: S.muted }}
          title={collapsed ? 'সাইডবার খুলুন' : 'সাইডবার বন্ধ করুন'}
        >
          {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
        </button>
        <button
          onClick={onCloseMobile}
          className="shrink-0 p-1.5 rounded-lg transition-colors hover:bg-white/5 lg:hidden flex items-center justify-center"
          style={{ color: S.muted }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Lesson count badge (collapsed) */}
      {collapsed && (
        <div className="py-2 flex justify-center">
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'rgba(101,209,178,0.12)', color: S.accent }}>
            {course.lessons.length}
          </span>
        </div>
      )}

      {/* Lesson list */}
      <nav className="flex-1 overflow-y-auto py-1">
        {course.lessons.map((lesson, index) => {
          const isActive = activeLesson?.slug === lesson.slug
          return (
            <button
              key={lesson.slug}
              ref={isActive ? activeRef : undefined}
              onClick={() => {
                if (lessonStates?.[lesson.slug] === 'locked') { onLockedClick(); return }
                onSelect(lesson.slug)
                if (onCloseMobile) onCloseMobile()
              }}
              className="w-full text-left flex items-center gap-3 transition-all duration-200"
              style={{
                padding: collapsed ? '12px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderLeft: `3px solid ${isActive ? S.accent : 'transparent'}`,
                backgroundColor: isActive ? 'rgba(101,209,178,0.08)' : 'transparent',
                opacity: lessonStates?.[lesson.slug] === 'locked' ? 0.35 : 1,
                cursor: lessonStates?.[lesson.slug] === 'locked' ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => { if (!isActive && lessonStates?.[lesson.slug] !== 'locked') (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(101,209,178,0.04)' }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
            >
              {lessonStates?.[lesson.slug] === 'completed' ? (
                <span className="shrink-0 flex items-center justify-center"
                  style={{
                    width: collapsed ? '32px' : '28px',
                    height: collapsed ? '32px' : '28px',
                    borderRadius: collapsed ? '50%' : '8px',
                    backgroundColor: 'rgba(101,209,178,0.15)',
                    color: S.accent,
                  }}>
                  <CheckCircle2 size={collapsed ? 16 : 14} />
                </span>
              ) : lessonStates?.[lesson.slug] === 'locked' ? (
                <span className="shrink-0 flex items-center justify-center"
                  style={{
                    width: collapsed ? '32px' : '28px',
                    height: collapsed ? '32px' : '28px',
                    borderRadius: collapsed ? '50%' : '8px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: S.muted,
                  }}>
                  <Lock size={collapsed ? 14 : 12} />
                </span>
              ) : (
                <span className="shrink-0 flex items-center justify-center text-xs font-black rounded-lg transition-all"
                  style={{
                    width: collapsed ? '32px' : '28px',
                    height: collapsed ? '32px' : '28px',
                    backgroundColor: isActive ? S.accent : 'rgba(101,209,178,0.10)',
                    color: isActive ? '#04342C' : S.muted,
                    borderRadius: collapsed ? '50%' : '8px',
                  }}>
                  {index + 1}
                </span>
              )}
              {!collapsed && (
                <span className="text-sm font-semibold truncate" style={{ color: isActive ? S.accent : S.muted }}>
                  {lesson.title}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

// ── Smooth fade transition wrapper ──────────────────────────────────────
function LessonTransition({ lessonId, children }: { lessonId: string; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setVisible(false)
    const frame = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [lessonId])
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
      }}
    >
      {children}
    </div>
  )
}

// ── Pure-presentation child: only rendered once data is guaranteed ────────
function LessonContent({
  course, activeLessonId, setActiveLessonId, sidebarCollapsed, saveSidebar,
  mobileSidebarOpen, setMobileSidebarOpen, readingWidth, setReadingWidth: _setReadingWidth,
  isDragging, setIsDragging: _setIsDragging, dragStartRef: _dragStartRef, readingWidthRef: _readingWidthRef,
  handlePresetClick, handleDragStart, activePreset,
  completeLessonMutation, lessonStates,
  showCompleteToast, setShowCompleteToast, markClassComplete, completedClassIds,
  lessonIds: _lessonIds, courseId: _courseId, token, isAllLessonsCompleted, onLockedClick,
}: {
  course: CourseWithLessons
  activeLessonId: string | null
  setActiveLessonId: (id: string | null) => void
  sidebarCollapsed: boolean
  saveSidebar: (v: boolean) => void
  mobileSidebarOpen: boolean
  setMobileSidebarOpen: (v: boolean) => void
  readingWidth: number
  setReadingWidth: (w: number) => void
  isDragging: boolean
  setIsDragging: (v: boolean) => void
  dragStartRef: React.MutableRefObject<{ x: number; width: number }>
  readingWidthRef: React.MutableRefObject<number>
  handlePresetClick: (w: number) => void
  handleDragStart: (e: React.MouseEvent) => void
  activePreset: { label: string; width: number; name: string } | undefined
  completeLessonMutation: any
  lessonStates: Record<string, 'locked' | 'unlocked' | 'completed'>
  showCompleteToast: boolean
  setShowCompleteToast: (v: boolean) => void
  markClassComplete: (lessonId: string, courseId?: string, force?: boolean) => void
  completedClassIds: string[]
  lessonIds: string[]
  courseId: string | undefined
  token: string | null
  isAllLessonsCompleted: boolean
  onLockedClick: () => void
}) {
  const activeLesson = course.lessons.find((l: any) => l.slug === activeLessonId) || course.lessons[0]

  // ── Navigation helpers ─────────────────────────────────────────────
  const currentIndex = useMemo(
    () => course.lessons.findIndex((l: any) => l.slug === activeLesson?.slug),
    [course.lessons, activeLesson]
  )
  const prevLesson = currentIndex > 0 ? course.lessons[currentIndex - 1] : null
  const nextLesson = currentIndex < course.lessons.length - 1 ? course.lessons[currentIndex + 1] : null
  const isFirstLesson = currentIndex <= 0
  const isLastLesson = currentIndex >= course.lessons.length - 1
  const isNextLocked = nextLesson ? lessonStates[(nextLesson as any).slug] === 'locked' : true
  const isCurrentCompleted = activeLesson ? lessonStates[(activeLesson as any).slug] === 'completed' : false
  const mainContentRef = useRef<HTMLDivElement>(null)
  const readingProgress = useLessonReadingProgress((activeLesson as any)?.slug, mainContentRef)

  const [notesOpen, setNotesOpen] = useState(false)
  const [notesMap, setNotesMap] = useState<Record<string, { content: string; updatedAt: string }>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [currentNoteText, setCurrentNoteText] = useState('')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle')
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lessonIframeRef = useRef<HTMLIFrameElement>(null)
  // useLessonContentInjector(lessonIframeRef, activeLesson?.htmlUrl)

  useEffect(() => {
    if (!token) return
    fetch(`${API_BASE_URL}/progression`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.notes) {
          setNotesMap(data.notes)
        }
      })
      .catch(err => console.error('Error fetching notes:', err))
  }, [token])

  useEffect(() => {
    if ((activeLesson as any)?.slug) {
      setCurrentNoteText(notesMap[(activeLesson as any).slug]?.content || '')
      setSaveStatus('idle')
    }
  }, [(activeLesson as any)?.slug, notesMap])

  // Auto-complete lesson once the student has read enough of it
  useEffect(() => {
    if (readingProgress >= 80 && (activeLesson as any)?.slug && !completedClassIds.includes((activeLesson as any).slug) && _courseId) {
      markClassComplete((activeLesson as any).slug, _courseId)
      setShowCompleteToast(true)
    }
  }, [readingProgress, (activeLesson as any)?.slug, completedClassIds, _courseId, markClassComplete])

  const handleNoteChange = (text: string) => {
    setCurrentNoteText(text)
    setSaveStatus('saving')

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

    saveTimeoutRef.current = setTimeout(() => {
      fetch(`${API_BASE_URL}/progression/note`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ lessonId: (activeLesson as any)?.slug, content: text })
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.notes) {
            setNotesMap(data.notes)
            setSaveStatus('saved')
          }
        })
        .catch(err => {
          console.error(err)
          setSaveStatus('idle')
        })
    }, 800)
  }

  const handleDeleteNote = () => {
    if (window.confirm('আসলই কি এই নোটটি ডিলিট করতে চান?')) {
      setCurrentNoteText('')
      setSaveStatus('saving')
      fetch(`${API_BASE_URL}/progression/note`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ lessonId: (activeLesson as any)?.slug, content: '' })
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.notes) {
            setNotesMap(data.notes)
            setSaveStatus('saved')
          }
        })
        .catch(err => {
          console.error(err)
          setSaveStatus('idle')
        })
    }
  }

  const handleExportNotes = () => {
    let text = `আলোকবর্তিকা স্টাডি নোট\nএক্সপোর্ট তারিখ: ${new Date().toLocaleDateString()}\n=========================\n\n`
    Object.entries(notesMap).forEach(([lId, note]) => {
      const l = course.lessons.find((lesson: any) => lesson.slug === lId)
      text += `পাঠ: ${l?.title || 'অজানা পাঠ'}\n`
      text += `সর্বশেষ আপডেট: ${new Date(note.updatedAt).toLocaleString()}\n`
      text += `-----------------------------------------\n`
      text += `${note.content}\n`
      text += `=========================================\n\n`
    })

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `alokbartika_my_notes.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return Object.entries(notesMap)
      .map(([lId, note]) => {
        const l = course.lessons.find((lesson: any) => lesson.slug === lId)
        return {
          lessonId: lId,
          lessonTitle: l?.title || 'অজানা পাঠ',
          content: note.content,
          updatedAt: note.updatedAt
        }
      })
      .filter(item => item.content.toLowerCase().includes(q) || item.lessonTitle.toLowerCase().includes(q))
  }, [searchQuery, notesMap, course.lessons])

  const navigateToLesson = useCallback((lessonId: string) => {
    setActiveLessonId(lessonId)
    // Scroll the main content area back to top for the new lesson
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [setActiveLessonId])
  const sidebarWidth = sidebarCollapsed ? 60 : 288

  return (
    <>
      <LessonCompleteToast
        show={showCompleteToast}
        isLevelCompleted={isLastLesson}
        nextLessonLabel={nextLesson?.title}
        onDismiss={() => setShowCompleteToast(false)}
      />
      <div className="fixed inset-x-0 bottom-0 flex" style={{ top: '64px', zIndex: 30, backgroundColor: S.bg }}>
        <aside className="hidden lg:flex flex-shrink-0 overflow-hidden"
          style={{ width: sidebarWidth, transition: 'width 0.25s ease' }}>
          <Sidebar
            course={course}
            activeLesson={activeLesson}
            collapsed={sidebarCollapsed}
            onToggle={() => saveSidebar(!sidebarCollapsed)}
            onSelect={id => navigateToLesson(id)}
            onCloseMobile={() => {}}
            lessonStates={lessonStates}
            onLockedClick={onLockedClick}
          />
        </aside>

        {mobileSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)} />
        )}
        <aside className={`fixed left-0 top-0 bottom-0 z-50 w-72 lg:hidden flex flex-col transition-transform duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`} style={{ backgroundColor: S.surface }}>
          <Sidebar
            course={course}
            activeLesson={activeLesson}
            collapsed={false}
            onToggle={() => {}}
            onSelect={id => navigateToLesson(id)}
            onCloseMobile={() => setMobileSidebarOpen(false)}
            lessonStates={lessonStates}
            onLockedClick={onLockedClick}
          />
        </aside>

        <main className="flex-1 flex flex-col min-w-0">
          {activeLesson ? (
            <>
              <div className="flex items-center gap-3 px-4 py-3 shrink-0"
                style={{ backgroundColor: S.surface, borderBottom: '1px solid rgba(101,209,178,0.12)' }}>
                <button onClick={() => setMobileSidebarOpen(true)}
                  className="lg:hidden p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: S.muted }}>
                  <ChevronRight size={18} />
                </button>
                <button onClick={() => saveSidebar(!sidebarCollapsed)}
                  className="hidden lg:flex p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: S.muted }}>
                  {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
                <h1 className="text-sm font-black truncate" style={{ color: S.text }}>{activeLesson.title}</h1>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="hidden lg:flex items-center mr-1 gap-0.5 rounded-lg overflow-hidden"
                    style={{ border: '1px solid rgba(101,209,178,0.12)' }}>
                    {READING_PRESETS.map(p => (
                      <button key={p.label} onClick={() => handlePresetClick(p.width)}
                        className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider transition-all"
                        style={{
                          color: activePreset?.width === p.width ? '#04342C' : S.muted,
                          backgroundColor: activePreset?.width === p.width ? S.accent : 'transparent',
                        }} title={p.name}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setNotesOpen(!notesOpen)}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200"
                    style={{
                      color: notesOpen ? '#04342C' : S.muted,
                      backgroundColor: notesOpen ? S.accent : 'transparent',
                    }}
                  >
                    <FileText size={14} /> আমার নোট
                  </button>
                  <Link to="/courses" className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5"
                    style={{ color: S.muted }}>
                    কোর্স থেকে বের হন
                  </Link>
                </div>
              </div>

              <div ref={mainContentRef} className="flex-1 overflow-y-auto overflow-x-hidden relative select-none"
                style={isDragging ? { cursor: 'col-resize' } : undefined}
                onCopy={e => {
                  const tag = (e.target as HTMLElement).tagName
                  if (!['INPUT', 'TEXTAREA'].includes(tag)) e.preventDefault()
                }}
                onCut={e => {
                  const tag = (e.target as HTMLElement).tagName
                  if (!['INPUT', 'TEXTAREA'].includes(tag)) e.preventDefault()
                }}
                onDragStart={e => {
                  const tag = (e.target as HTMLElement).tagName
                  if (!['INPUT', 'TEXTAREA', 'AUDIO', 'VIDEO'].includes(tag)) e.preventDefault()
                }}
                onContextMenu={e => {
                  const tag = (e.target as HTMLElement).tagName
                  if (!['INPUT', 'TEXTAREA', 'A', 'BUTTON'].includes(tag)) e.preventDefault()
                }}
              >
                <LessonProgressBar progress={readingProgress} />
                <div className="flex justify-center min-h-full">
                  <div className="flex-1 min-w-0 px-4 py-6 sm:px-8 sm:py-8 space-y-6"
                    style={{ maxWidth: readingWidth }}>

                    <LessonTransition lessonId={(activeLesson as any).slug}>
                    {activeLesson.videoUrl && (
                      <figure className="aspect-video bg-black w-full relative rounded-xl overflow-hidden mb-6">
                        <iframe className="absolute inset-0 w-full h-full"
                          src={activeLesson.videoUrl.replace('watch?v=', 'embed/')}
                          title={activeLesson.title} frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                      </figure>
                    )}

                    {activeLesson.audioUrl && (
                      <div className="flex items-center gap-4 p-4 rounded-xl mb-6"
                        style={{ backgroundColor: 'rgba(15,23,42,0.6)', border: '1px solid rgba(101,209,178,0.12)' }}>
                        <span className="text-2xl">🎙️</span>
                        <audio controls className="w-full h-10 rounded-xl">
                          <source src={activeLesson.audioUrl} type="audio/mpeg" />
                        </audio>
                      </div>
                    )}

                    {activeLesson.htmlUrl ? (
                      <div className="w-full rounded-xl overflow-hidden mb-6"
                        style={{ height: 'calc(100dvh - 220px)', border: '1px solid rgba(101,209,178,0.15)' }}>
                        <iframe ref={lessonIframeRef} src={activeLesson.htmlUrl} className="w-full h-full border-none" title={activeLesson.title} />
                      </div>
                    ) : (
                      <div className="prose max-w-none leading-relaxed font-medium whitespace-pre-wrap mb-6" style={{ color: S.muted }}>
                        {activeLesson.content || 'ভিডিও এবং কোডিং চ্যালেঞ্জের মাধ্যমে এই পাঠের ধারণাগুলো শিখুন।'}
                      </div>
                    )}

                    {/* ── Practice Section (Advanced only) ─────────────── */}
                    {course.level === 'advanced' && (
                      <PracticeSection
                        practice={activeLesson.practice || null}
                        lessonId={(activeLesson as any).slug}
                        courseId={course._id}
                        language={activeLesson.language || 'python'}
                      />
                    )}

                    {activeLesson.codingProblem && (
                      <div className="space-y-4 p-6 rounded-2xl mb-6"
                        style={{ backgroundColor: 'rgba(15,23,42,0.6)', border: '1px solid rgba(101,209,178,0.15)' }}>
                        <h3 className="text-xl font-black flex items-center gap-3" style={{ color: S.text }}>
                          <span style={{ color: S.accent }}>💻</span> কোডিং চ্যালেঞ্জ / প্র্যাকটিস টাস্ক
                        </h3>
                        <div className="p-4 rounded-xl italic font-medium"
                          style={{ backgroundColor: 'rgba(101,209,178,0.05)', color: S.muted, border: '1px solid rgba(101,209,178,0.10)' }}>
                          {activeLesson.codingProblem}
                        </div>
                        {course.level === 'advanced' ? (
                          <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-xl"
                            style={{ borderColor: 'rgba(101,209,178,0.25)', backgroundColor: 'rgba(101,209,178,0.02)' }}>
                            <p className="text-sm font-semibold mb-4 text-center" style={{ color: S.muted, fontFamily: "'Hind Siliguri', sans-serif" }}>
                              এই লেসনের প্র্যাকটিস টাস্কটি সমাধান করার জন্য আলোকবর্তিকা এডিটরে যান।
                            </p>
                            <Link
                              to={`/development?lessonId=${(activeLesson as any).slug}&courseId=${course._id}`}
                              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all duration-200 hover:scale-105"
                              style={{ backgroundColor: S.accent, color: '#04342C', boxShadow: '0 0 16px rgba(101,209,178,0.2)' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = S.light }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = S.accent }}>
                              <Cpu size={16} /> IDE খুলুন
                            </Link>
                          </div>
                        ) : (
                          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(101,209,178,0.15)' }}>
                            <CodeEditor problemDescription={activeLesson.codingProblem} />
                          </div>
                        )}
                      </div>
                    )}

                    </LessonTransition>

                    <div className="border-t text-center pt-6 text-xs font-black uppercase tracking-widest"
                      style={{ borderColor: 'rgba(101,209,178,0.10)', color: S.muted }}>পাঠ শেষ</div>

                    {/* ── Complete Lesson Button ──────────────────────── */}
                    {!isCurrentCompleted && (
                      <div className="flex justify-center">
                        <button onClick={() => activeLesson && completeLessonMutation.mutate((activeLesson as any).slug)}
                          disabled={completeLessonMutation.isPending}
                          className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-base transition-all duration-200 hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
                          style={{ backgroundColor: S.accent, color: '#04342C', boxShadow: '0 0 24px rgba(101,209,178,0.25)' }}
                          onMouseEnter={e => { if (!completeLessonMutation.isPending) (e.currentTarget as HTMLElement).style.backgroundColor = S.light }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = S.accent }}>
                          <CheckCircle2 size={20} />
                          {completeLessonMutation.isPending ? 'শেষ হচ্ছে...' : 'পাঠ শেষ করুন'}
                        </button>
                      </div>
                    )}

                    {/* ── Lesson Navigation Bar ──────────────────────── */}
                    <div className="flex items-center justify-between gap-3 pb-8 pt-2">
                      {/* Previous Lesson Button */}
                      <button
                        onClick={() => prevLesson && navigateToLesson((prevLesson as any).slug)}
                        disabled={isFirstLesson}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200"
                        style={{
                          backgroundColor: isFirstLesson ? 'rgba(101,209,178,0.05)' : 'rgba(101,209,178,0.10)',
                          color: isFirstLesson ? 'rgba(184,197,193,0.35)' : S.muted,
                          cursor: isFirstLesson ? 'not-allowed' : 'pointer',
                          border: '1px solid rgba(101,209,178,0.08)',
                        }}
                        onMouseEnter={e => { if (!isFirstLesson) { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(101,209,178,0.18)'; (e.currentTarget as HTMLElement).style.color = S.accent } }}
                        onMouseLeave={e => { if (!isFirstLesson) { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(101,209,178,0.10)'; (e.currentTarget as HTMLElement).style.color = S.muted } }}
                      >
                        <ArrowLeft size={16} />
                        <span className="hidden sm:inline">পূর্ববর্তী পাঠ</span>
                        <span className="sm:hidden">পূর্ববর্তী</span>
                      </button>

                      {/* Lesson Counter */}
                      <span className="text-xs font-black uppercase tracking-widest" style={{ color: S.muted }}>
                        {currentIndex + 1} / {course.lessons.length}
                      </span>

                      {/* Next Lesson Button or Exam Lock/Unlock */}
                      {isLastLesson ? (
                        isAllLessonsCompleted ? (
                          <Link
                            to={`/exam/${course.level}`}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105"
                            style={{ backgroundColor: S.accent, color: '#04342C', boxShadow: '0 0 16px rgba(101,209,178,0.20)' }}
                          >
                            <Trophy size={16} />
                            <span className="hidden sm:inline">চূড়ান্ত পরীক্ষা দিন</span>
                            <span className="sm:hidden">Exam</span>
                          </Link>
                        ) : (
                          <div className="relative group">
                            <button
                              disabled
                              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm cursor-not-allowed"
                              style={{
                                backgroundColor: 'rgba(101,209,178,0.05)',
                                color: 'rgba(184,197,193,0.35)',
                                border: '1px solid rgba(101,209,178,0.08)',
                              }}
                            >
                              <span className="hidden sm:inline">চূড়ান্ত পরীক্ষা দিন (লক)</span>
                              <span className="sm:hidden">Exam (লক)</span>
                              <Lock size={14} />
                            </button>
                            <span className="absolute bottom-full mb-2 right-0 w-56 text-center text-xs p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
                              style={{ backgroundColor: '#2F3A35', color: '#FFFDF8' }}>
                              সকল ক্লাস সম্পন্ন করলে ফাইনাল পরীক্ষা আনলক হবে।
                            </span>
                          </div>
                        )
                      ) : (
                        <button
                          onClick={() => nextLesson && !isNextLocked && navigateToLesson((nextLesson as any).slug)}
                          disabled={isNextLocked}
                          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200"
                          style={{
                            backgroundColor: isNextLocked ? 'rgba(101,209,178,0.05)' : S.accent,
                            color: isNextLocked ? 'rgba(184,197,193,0.35)' : '#04342C',
                            cursor: isNextLocked ? 'not-allowed' : 'pointer',
                            boxShadow: isNextLocked ? 'none' : '0 0 16px rgba(101,209,178,0.20)',
                            border: isNextLocked ? '1px solid rgba(101,209,178,0.08)' : 'none',
                          }}
                          onMouseEnter={e => { if (!isNextLocked) (e.currentTarget as HTMLElement).style.backgroundColor = S.light }}
                          onMouseLeave={e => { if (!isNextLocked) (e.currentTarget as HTMLElement).style.backgroundColor = S.accent }}
                        >
                          <span className="hidden sm:inline">পরবর্তী পাঠ</span>
                          <span className="sm:hidden">পরবর্তী</span>
                          {isNextLocked ? <Lock size={14} /> : <ArrowRight size={16} />}
                        </button>
                      )}
                    </div>

                    {completeLessonMutation.isSuccess && (
                      <div className="toast toast-top toast-center z-[100]">
                        <div className="px-8 py-5 rounded-2xl font-black text-lg animate-bounce"
                          style={{ backgroundColor: S.accent, color: '#04342C', boxShadow: '0 0 32px rgba(101,209,178,0.40)' }}>
                          🎉 আপনি এক্সপি অর্জন করেছেন!
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="hidden lg:flex items-center justify-center cursor-col-resize shrink-0 group"
                    style={{ width: '20px', opacity: isDragging ? 1 : undefined }}
                    onMouseDown={handleDragStart}>
                    <div className="flex flex-col items-center gap-0.5 transition-opacity duration-150 group-hover:opacity-100"
                      style={{ opacity: isDragging ? 1 : 0.25 }}>
                      <div className="w-0.5 h-0.5 rounded-full" style={{ backgroundColor: S.accent }} />
                      <div className="w-0.5 h-0.5 rounded-full" style={{ backgroundColor: S.accent }} />
                      <div className="w-0.5 h-0.5 rounded-full" style={{ backgroundColor: S.accent }} />
                      <div className="w-px h-3 rounded-full" style={{ backgroundColor: 'rgba(101,209,178,0.2)' }} />
                      <div className="w-0.5 h-0.5 rounded-full" style={{ backgroundColor: S.accent }} />
                      <div className="w-0.5 h-0.5 rounded-full" style={{ backgroundColor: S.accent }} />
                      <div className="w-0.5 h-0.5 rounded-full" style={{ backgroundColor: S.accent }} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center" style={{ opacity: 0.3 }}>
                <div className="text-8xl mb-4">📖</div>
                <p className="text-xl font-black uppercase tracking-widest" style={{ color: S.text }}>
                  শুরু করতে একটি পাঠ নির্বাচন করুন
                </p>
              </div>
            </div>
          )}
        </main>

        {/* ── My Notes Slide-in Panel ─────────────────────────── */}
        <div
          className="fixed top-16 right-0 bottom-0 flex flex-col z-[60] transition-transform duration-300"
          style={{
            width: '360px',
            transform: notesOpen ? 'translateX(0)' : 'translateX(100%)',
            backgroundColor: '#1E293B',
            borderLeft: '1px solid rgba(101,209,178,0.15)',
            boxShadow: notesOpen ? '-8px 0 32px rgba(0,0,0,0.4)' : 'none',
          }}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ borderBottom: '1px solid rgba(101,209,178,0.12)' }}>
            <div className="flex items-center gap-2">
              <Edit3 size={15} style={{ color: S.accent }} />
              <span className="font-black text-sm" style={{ color: S.text }}>আমার নোট</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-1"
                style={{ backgroundColor: 'rgba(101,209,178,0.12)', color: S.accent }}>
                {Object.keys(notesMap).length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {Object.keys(notesMap).length > 0 && (
                <button
                  onClick={handleExportNotes}
                  className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                  style={{ color: S.muted }}
                  title="সকল নোট .txt হিসেবে এক্সপোর্ট করুন"
                >
                  <Download size={14} />
                </button>
              )}
              <button
                onClick={() => setNotesOpen(false)}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                style={{ color: S.muted }}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="px-3 py-2 shrink-0" style={{ borderBottom: '1px solid rgba(101,209,178,0.08)' }}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: 'rgba(101,209,178,0.05)', border: '1px solid rgba(101,209,178,0.10)' }}>
              <Search size={13} style={{ color: S.muted }} />
              <input
                type="text"
                placeholder="নোট খুঁজুন..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-xs font-medium"
                style={{ color: S.text }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ color: S.muted }}>
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {searchQuery ? (
            /* Search results view */
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
              {searchResults.length === 0 ? (
                <div className="text-center py-8" style={{ color: S.muted, opacity: 0.5 }}>
                  <Search size={24} className="mx-auto mb-2" />
                  <p className="text-xs font-semibold">কোন মিল পাওয়া যায়নি</p>
                </div>
              ) : searchResults.map(result => (
                <div key={result.lessonId}
                  className="p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
                  style={{ backgroundColor: 'rgba(101,209,178,0.05)', border: '1px solid rgba(101,209,178,0.10)' }}
                  onClick={() => {
                    setSearchQuery('')
                    setActiveLessonId(result.lessonId)
                  }}
                >
                  <p className="text-[11px] font-black mb-1" style={{ color: S.accent }}>{result.lessonTitle}</p>
                  <p className="text-xs line-clamp-3 font-medium" style={{ color: S.muted }}>{result.content}</p>
                  <p className="text-[10px] mt-2 font-bold" style={{ color: 'rgba(101,209,178,0.4)' }}>
                    {new Date(result.updatedAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            /* Note editor for current lesson */
            <div className="flex-1 flex flex-col min-h-0">
              {/* Current lesson label */}
              <div className="px-3 pt-3 pb-2 shrink-0">
                <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'rgba(101,209,178,0.4)' }}>
                  বর্তমান পাঠ
                </p>
                <p className="text-xs font-bold truncate" style={{ color: S.accent }}>
                  {activeLesson?.title || '—'}
                </p>
              </div>

              {/* Textarea */}
              <div className="flex-1 px-3 pb-2 min-h-0">
                <textarea
                  value={currentNoteText}
                  onChange={e => handleNoteChange(e.target.value)}
                  placeholder="এখানে নোট লিখুন... (Auto-save চালু আছে)"
                  className="w-full h-full resize-none outline-none rounded-xl p-3 text-sm leading-relaxed font-medium"
                  style={{
                    backgroundColor: 'rgba(101,209,178,0.04)',
                    border: '1px solid rgba(101,209,178,0.12)',
                    color: S.text,
                    fontFamily: "'Hind Siliguri', sans-serif",
                    minHeight: '220px',
                  }}
                />
              </div>

              {/* Save status + timestamp + delete */}
              <div className="px-3 py-2 shrink-0 flex items-center justify-between"
                style={{ borderTop: '1px solid rgba(101,209,178,0.08)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold"
                    style={{
                      color: saveStatus === 'saved' ? S.accent : saveStatus === 'saving' ? '#f5c842' : 'rgba(101,209,178,0.3)'
                    }}>
                    {saveStatus === 'saved' ? '✓ সংরক্ষিত' : saveStatus === 'saving' ? '⏳ সংরক্ষণ হচ্ছে…' : ''}
                  </span>
                  {notesMap[(activeLesson as any)?.slug || '']?.updatedAt && (
                    <span className="text-[10px]" style={{ color: 'rgba(101,209,178,0.3)' }}>
                      · {new Date(notesMap[(activeLesson as any)!.slug].updatedAt).toLocaleString('bn-BD', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
                {currentNoteText.trim() && (
                  <button
                    onClick={handleDeleteNote}
                    className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg transition-all"
                    style={{ color: '#f87171', backgroundColor: 'rgba(248,113,113,0.08)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(248,113,113,0.18)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(248,113,113,0.08)' }}
                  >
                    <Trash2 size={11} /> মুছুন
                  </button>
                )}
              </div>

              {/* All notes list */}
              {Object.keys(notesMap).length > 0 && (
                <div className="px-3 pb-3 shrink-0 overflow-y-auto" style={{ maxHeight: '220px', borderTop: '1px solid rgba(101,209,178,0.08)' }}>
                  <p className="text-[10px] font-black uppercase tracking-widest pt-3 pb-2" style={{ color: 'rgba(101,209,178,0.4)' }}>
                    সকল নোট ({Object.keys(notesMap).length})
                  </p>
                  <div className="space-y-2">
                    {Object.entries(notesMap).map(([lId, note]) => {
        const l = course.lessons.find((lesson: any) => lesson.slug === lId)
                      const isThisLesson = lId === (activeLesson as any)?.slug
                      return (
                        <div
                          key={lId}
                          onClick={() => { setActiveLessonId(lId) }}
                          className="p-2.5 rounded-lg cursor-pointer transition-all"
                          style={{
                            backgroundColor: isThisLesson ? 'rgba(101,209,178,0.10)' : 'rgba(101,209,178,0.03)',
                            border: `1px solid ${isThisLesson ? 'rgba(101,209,178,0.20)' : 'rgba(101,209,178,0.07)'}`,
                          }}
                        >
                          <p className="text-[10px] font-black mb-0.5 truncate" style={{ color: isThisLesson ? S.accent : S.muted }}>
                            {l?.title || 'অজানা পাঠ'}
                          </p>
                          <p className="text-[10px] line-clamp-2 font-medium" style={{ color: 'rgba(184,197,193,0.6)' }}>
                            {note.content}
                          </p>
                          <p className="text-[9px] mt-1 font-bold" style={{ color: 'rgba(101,209,178,0.3)' }}>
                            {new Date(note.updatedAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Hook-only parent: all hooks flat and unconditional at the top ────────
export function LessonViewPage() {
  useCopyProtection()
  const { courseId } = useParams<{ courseId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeLessonId, setActiveLessonId] = useState<string | null>(searchParams.get('lesson'))
  const { token } = useAuth()
  const queryClient = useQueryClient()
  useLearningTracker()
  useDailyCodingTracker(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) === 'true' } catch { return false }
  })
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const saveSidebar = useCallback((val: boolean) => {
    setSidebarCollapsed(val)
    try { localStorage.setItem(SIDEBAR_KEY, String(val)) } catch {}
  }, [])

  const [readingWidth, setReadingWidth] = useState(() => {
    try {
      const saved = localStorage.getItem(READING_WIDTH_KEY)
      if (saved) return Math.max(480, Math.min(1600, parseInt(saved, 10)))
    } catch {}
    return 960
  })
  const readingWidthRef = useRef(readingWidth)
  readingWidthRef.current = readingWidth
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, width: 0 })

  const handlePresetClick = useCallback((width: number) => {
    setReadingWidth(width)
    try { localStorage.setItem(READING_WIDTH_KEY, String(width)) } catch {}
  }, [])

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragStartRef.current = { x: e.clientX, width: readingWidthRef.current }
    setIsDragging(true)
  }, [])

  useEffect(() => {
    if (!isDragging) return
    const handleDrag = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.x
      const newWidth = Math.max(480, Math.min(1600, dragStartRef.current.width + dx))
      setReadingWidth(newWidth)
    }
    const handleDragEnd = () => {
      setIsDragging(false)
      try { localStorage.setItem(READING_WIDTH_KEY, String(readingWidthRef.current)) } catch {}
    }
    document.addEventListener('mousemove', handleDrag)
    document.addEventListener('mouseup', handleDragEnd)
    return () => {
      document.removeEventListener('mousemove', handleDrag)
      document.removeEventListener('mouseup', handleDragEnd)
    }
  }, [isDragging])

  const activePreset = READING_PRESETS.find(p => p.width === readingWidth)

  const { data, isLoading, isError } = useQuery<{ data: CourseWithLessons }>({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/courses/${courseId}`)
      if (!res.ok) throw new Error('Failed to fetch course data')
      return res.json()
    },
  })

  const safeCourse = data?.data
  // The course API now returns a canonical `slug` for every lesson, which is the
  // SAME id the progression backend uses. So lesson identifiers (ordered ids,
  // active selection, last-visited, completion state) are all slugs — no _id
  // reconciliation needed.
  const orderedLessonIds = safeCourse?.lessons?.map((l: any) => l.slug) || []

  const { markClassComplete, completeLevel, isLessonUnlocked, completedClassIds, lastVisitedLessonId, unlockedLessonIds, isLessonComplete } = useCourseProgress(
    { beginner: [], intermediate: [], advanced: [] },
    orderedLessonIds
  )

  const initialLessonParam = useRef(searchParams.get('lesson'))

  const completeLessonMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      if (!token) throw new Error('Missing auth token')
      const res = await fetch(`${API_BASE_URL}/progression/complete-lesson`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lessonId, courseId }),
      })
      if (!res.ok) throw new Error('Failed to complete lesson')
      return res.json()
    },
    onSuccess: (_, lessonId) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      markClassComplete(lessonId, courseId, true)
      if (safeCourse && safeCourse.lessons.length > 0) {
        const last = safeCourse.lessons[safeCourse.lessons.length - 1]
        if (last.slug === lessonId && safeCourse.level) completeLevel(safeCourse.level)
      }
      // Auto-advance to next lesson after completion
      if (safeCourse) {
        const idx = safeCourse.lessons.findIndex((l: any) => l.slug === lessonId)
        if (idx >= 0 && idx < safeCourse.lessons.length - 1) {
          const nextId = safeCourse.lessons[idx + 1].slug
          setTimeout(() => setActiveLessonId(nextId), 1200)
        }
      }
    },
  })

  // Set active lesson: URL param > last visited > first lesson
  useEffect(() => {
    if (!data?.data?.lessons?.length) return

    const urlParam = initialLessonParam.current
    if (urlParam && orderedLessonIds.includes(urlParam)) {
      if (activeLessonId !== urlParam) setActiveLessonId(urlParam)
      return
    }

    if (activeLessonId && orderedLessonIds.includes(activeLessonId)) {
      // Already has a valid selection — only override if lastVisited arrives late and current is the first-lesson fallback
      if (lastVisitedLessonId && orderedLessonIds.includes(lastVisitedLessonId) && activeLessonId === data.data.lessons[0].slug) {
        setActiveLessonId(lastVisitedLessonId)
      }
      return
    }

    if (lastVisitedLessonId && orderedLessonIds.includes(lastVisitedLessonId)) {
      setActiveLessonId(lastVisitedLessonId)
    } else {
      setActiveLessonId(data.data.lessons[0].slug)
    }
  }, [data, activeLessonId, lastVisitedLessonId, orderedLessonIds])

  // Sync activeLessonId → searchParams & save last visited
  useEffect(() => {
    if (activeLessonId) {
      setSearchParams({ lesson: activeLessonId }, { replace: true })
      if (token && courseId && activeLessonId) {
        fetch(`${API_BASE_URL}/progression/last-visited`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ courseId, lessonId: activeLessonId }),
        }).catch(() => {})
      }
    }
  }, [activeLessonId, setSearchParams, token, courseId])

  const course = data?.data
  const lessonStates: Record<string, 'locked' | 'unlocked' | 'completed'> = {}
  if (course?.lessons?.length) {
    for (const lesson of course.lessons) {
      if (completedClassIds.includes(lesson.slug)) {
        lessonStates[lesson.slug] = 'completed'
      } else if (isLessonUnlocked(lesson.slug)) {
        lessonStates[lesson.slug] = 'unlocked'
      } else {
        lessonStates[lesson.slug] = 'locked'
      }
    }
  }

  // ── URL navigation guard: redirect locked lessons to first unlocked ──
  useEffect(() => {
    if (!data?.data?.lessons?.length || !activeLessonId) return
    if (lessonStates[activeLessonId] === 'locked') {
      const firstUnlocked = data.data.lessons.find(l => lessonStates[l.slug] !== 'locked')
      if (firstUnlocked) {
        setActiveLessonId(firstUnlocked.slug)
      }
    }
  }, [activeLessonId, data, lessonStates])

  const [showCompleteToast, setShowCompleteToast] = useState(false)
  const [showLockedToast, setShowLockedToast] = useState(false)

  // ── Early returns (after ALL hooks) ─────────────────────────
  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-5">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: 'rgba(101,209,178,0.15)' }} />
        <div className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: '#65D1B2', borderTopColor: 'transparent' }} />
      </div>
      <p className="text-lg font-bold" style={{ color: '#B8C5C1' }}>আপনার ক্লাসরুম প্রস্তুত হচ্ছে...</p>
    </div>
  )

  if (isError || !course) return (
    <div className="max-w-md mx-auto mt-16 rounded-2xl p-8 text-center"
      style={{ backgroundColor: '#0A4A3F', border: '1px solid rgba(248,113,113,0.25)' }}>
      <div className="text-4xl mb-4">⚠️</div>
      <h3 className="font-bold text-lg mb-2" style={{ color: '#F5F7F6' }}>কোর্স পাওয়া যায়নি</h3>
      <p className="text-sm mb-6" style={{ color: '#B8C5C1' }}>আপনার খোঁজ করা পাঠটি খুঁজে পাওয়া যায়নি।</p>
      <Link to="/courses" className="inline-block px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
        style={{ backgroundColor: '#65D1B2', color: '#04342C' }}>কোর্সে ফিরুন</Link>
    </div>
  )

  const isAllLessonsCompleted = course.lessons.length > 0 && course.lessons.every((l: any) => isLessonComplete(l.slug))

  return (
    <>
    <LockedLessonToast show={showLockedToast} onDismiss={() => setShowLockedToast(false)} />
    <LessonContent
      course={course}
      activeLessonId={activeLessonId}
      setActiveLessonId={setActiveLessonId}
      sidebarCollapsed={sidebarCollapsed}
      saveSidebar={saveSidebar}
      mobileSidebarOpen={mobileSidebarOpen}
      setMobileSidebarOpen={setMobileSidebarOpen}
      readingWidth={readingWidth}
      setReadingWidth={setReadingWidth}
      isDragging={isDragging}
      setIsDragging={setIsDragging}
      dragStartRef={dragStartRef}
      readingWidthRef={readingWidthRef}
      handlePresetClick={handlePresetClick}
      handleDragStart={handleDragStart}
      activePreset={activePreset}
      completeLessonMutation={completeLessonMutation}
      lessonStates={lessonStates}
      showCompleteToast={showCompleteToast}
      setShowCompleteToast={setShowCompleteToast}
      markClassComplete={markClassComplete}
      completedClassIds={completedClassIds}
      lessonIds={orderedLessonIds}
      courseId={courseId}
      token={token}
      isAllLessonsCompleted={isAllLessonsCompleted}
      onLockedClick={() => setShowLockedToast(true)}
    />
    </>
  )
}

