import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useAuth } from './AuthContext'
import { API_BASE_URL } from '../config/api'

// ── Types ────────────────────────────────────────────────────────────────────

export type LearningLevel = 'beginner' | 'intermediate' | 'advanced'

export type ExamAttempt = {
  score: number
  passed: boolean
  takenAt: string
  timeTakenSeconds: number
}

type ProgressState = {
  completedClassIds: string[]
  completedLevels: LearningLevel[]
  unlockedLevels: LearningLevel[]
  completedCourseIds: string[]
  unlockedCourseIds: string[]
  completedExamIds: string[]
  examAttempts: Record<string, ExamAttempt[]>
  practiceCompletedIds: string[]
  completedActivityIds: string[]
  completedQuizIds: string[]
  achievements: { name: string; description: string; icon: string; awardedAt: string }[]
  unlockedLessonIds: string[]
  lastVisitedLessonId: string | null
  xp: number
  level: number
  currentStage: LearningLevel
  progressPercentage: number
  badges: { name: string; icon: string; awardedAt: string | Date }[]
  currentLessonId: string | null
  continueLearning: {
    continueLevel: string | null
    continueCourseId: string | null
    continueLessonId: string | null
    continueUrl: string
    progress: number
    title: string | null
    description: string | null
  } | null
}

// ── Initial state ────────────────────────────────────────────────────────────

const EMPTY_PROGRESS: ProgressState = {
  completedClassIds: [],
  completedLevels: [],
  unlockedLevels: ['beginner'],
  completedCourseIds: [],
  unlockedCourseIds: [],
  completedExamIds: [],
  examAttempts: {},
  practiceCompletedIds: [],
  completedActivityIds: [],
  completedQuizIds: [],
  achievements: [],
  unlockedLessonIds: [],
  lastVisitedLessonId: null,
  xp: 0,
  level: 1,
  currentStage: 'beginner',
  progressPercentage: 0,
  badges: [],
  currentLessonId: null,
  continueLearning: null,
}

// ── Context value type ───────────────────────────────────────────────────────

export interface ProgressContextValue extends ProgressState {
  apiLoaded: boolean
  completedClassIds: string[]

  // Mutations
  refreshProgress: () => void
  saveLastVisited: (lessonId: string, courseId?: string, stage?: LearningLevel) => Promise<void>
  markClassComplete: (classId: string, courseId?: string, skipApi?: boolean) => Promise<void>
  completeLevel: (level: LearningLevel) => void
  markPracticeComplete: (lessonId: string) => Promise<void>
  markQuizComplete: (lessonId: string) => Promise<void>
  markActivityComplete: (id: string) => void
  markExamPassed: (examId?: string, attempt?: unknown) => void

  // Derived helpers (no consumer-specific params)
  isLevelUnlocked: (level: LearningLevel) => boolean
  isIdeUnlocked: () => boolean
  isLessonComplete: (lessonId: string) => boolean
  isPracticeComplete: (lessonId: string) => boolean
  isQuizComplete: (lessonId: string) => boolean
  hasPassedExam: (examId: string) => boolean
  getExamAttempts: (examId: string) => ExamAttempt[]
  getBestExamScore: (examId: string) => number
  getLessonActivityProgress: (lessonId: string, sectionIds: string[]) => number
}

// ── Context ──────────────────────────────────────────────────────────────────

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined)

// ── Provider ─────────────────────────────────────────────────────────────────

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth()

  const [state, setState] = useState<ProgressState>(EMPTY_PROGRESS)
  const [apiLoaded, setApiLoaded] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const inFlight = useRef(false)

  // ── Fetch progress from server ───────────────────────────────────────────
  const fetchProgress = useCallback(async () => {
    if (!token || inFlight.current) return
    inFlight.current = true
    try {
      const res = await fetch(`${API_BASE_URL}/progression`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      const examAttempts: Record<string, ExamAttempt[]> = {}
      const rawAttempts = data.examAttempts || {}
      for (const [k, v] of Object.entries(rawAttempts)) {
        if (Array.isArray(v)) examAttempts[k] = v as ExamAttempt[]
      }
      console.log('[DEBUG:fetchProgress] raw completedLessons from server:', data.completedLessons)
      setState({
        completedClassIds: (data.completedLessons || []).map(String),
        completedLevels: (data.completedLevels || []) as LearningLevel[],
        unlockedLevels: (data.unlockedLevels || ['beginner']) as LearningLevel[],
        completedCourseIds: (data.completedCourses || []).map(String),
        unlockedCourseIds: (data.unlockedCourses || []).map(String),
        completedExamIds: (data.completedExams || []).map(String),
        examAttempts,
        practiceCompletedIds: (data.practiceCompleted || []).map(String),
        completedActivityIds: [],
        completedQuizIds: [],
        achievements: data.achievements || [],
        unlockedLessonIds: (data.unlockedLessons || []).map(String),
        lastVisitedLessonId: data.lastVisitedLesson ? String(data.lastVisitedLesson) : null,
        xp: typeof data.xp === 'number' ? data.xp : 0,
        level: typeof data.level === 'number' ? data.level : 1,
        currentStage: (data.currentStage as LearningLevel) || 'beginner',
        progressPercentage: typeof data.progressPercentage === 'number' ? data.progressPercentage : 0,
        badges: data.badges || [],
        currentLessonId: data.currentLessonId ? String(data.currentLessonId) : null,
        continueLearning: data.continueLearning || null,
      })
      setApiLoaded(true)
    } catch {
      // Network error — keep whatever we have (empty for first load).
    } finally {
      inFlight.current = false
    }
  }, [token])

  // ── Fetch triggers ────────────────────────────────────────────────────────
  // 1. Login / logout (token or user id changes) → reset apiLoaded and fetch
  // 2. refreshProgress() (mutation completion)  → just re-fetch, keep apiLoaded
  //    so pages don't briefly flash to "loading" after markClassComplete etc.

  // Login / logout — reset loading flag and re-fetch
  useEffect(() => {
    setApiLoaded(false)
    fetchProgress()
  }, [fetchProgress, user?.id])

  // After mutations — re-fetch without resetting apiLoaded (avoids flash)
  useEffect(() => {
    if (refreshKey > 0) fetchProgress()
  }, [refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Refresh (bumps refreshKey to trigger re-fetch) ──────────────────────
  const refreshProgress = useCallback(() => {
    setRefreshKey(k => k + 1)
  }, [])

  // ── Mutation helper: POST with retry, then re-read from server ──────────
  const callApi = useCallback(
    async (url: string, body: Record<string, unknown>) => {
      if (!token) return
      const maxAttempts = 3
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          const res = await fetch(`${API_BASE_URL}${url}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(body),
          })
          console.log('[DEBUG:callApi] POST', url, '→ status:', res.status, 'body:', body)
          if (res.ok) break
          if (res.status >= 400 && res.status < 500) break
        } catch (e) {
          console.log('[DEBUG:callApi] POST', url, '→ NETWORK ERROR:', e)
        }
        if (attempt < maxAttempts - 1) {
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)))
        }
      }
      refreshProgress()
    },
    [token, refreshProgress]
  )

  // ── Public mutation functions ────────────────────────────────────────────

  const saveLastVisited = useCallback(
    async (lessonId: string, courseId?: string, stage?: LearningLevel) => {
      if (!token) return
      try {
        await fetch(`${API_BASE_URL}/progression/last-visited`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ lessonId, courseId, stage }),
        })
      } catch {
        // swallow — best-effort persistence
      }
    },
    [token]
  )

  const markClassComplete = useCallback(
    (classId: string, courseId?: string, skipApi = false): Promise<void> => {
      if (skipApi) {
        refreshProgress()
        return Promise.resolve()
      }
      return callApi('/progression/complete-lesson', { lessonId: classId, courseId })
    },
    [callApi, refreshProgress]
  )

  const completeLevel = useCallback(
    (_level: LearningLevel) => {
      refreshProgress()
    },
    [refreshProgress]
  )

  const markPracticeComplete = useCallback(
    (lessonId: string) => callApi('/progression/complete-practice', { lessonId }),
    [callApi]
  )

  const markQuizComplete = useCallback(
    (lessonId: string) => callApi('/progression/complete-practice', { lessonId, type: 'quiz' }),
    [callApi]
  )

  // ── Activity completion (micro UI state, not persisted) ──────────────────
  const [activityState, setActivityState] = useState<Record<string, boolean>>({})

  const markActivityComplete = useCallback((id: string) => {
    setActivityState(prev => ({ ...prev, [id]: true }))
  }, [])

  const getLessonActivityProgress = useCallback(
    (lessonId: string, sectionIds: string[]) => {
      if (!sectionIds.length) return 0
      const done = sectionIds.filter(id => activityState[`${lessonId}:${id}`]).length
      return Math.round((done / sectionIds.length) * 100)
    },
    [activityState]
  )

  const markExamPassed = useCallback((_examId?: string, _attempt?: unknown) => {
    refreshProgress()
  }, [refreshProgress])

  // ── Derived: normalized completed class ids (deduped) ────────────────────
  const normalizedCompletedClassIds = useMemo(() => {
    const seen = new Set<string>()
    const out: string[] = []
    for (const id of state.completedClassIds) {
      if (seen.has(id)) continue
      seen.add(id)
      out.push(id)
    }
    return out
  }, [state.completedClassIds])

  // ── Derived helpers (no consumer-specific params) ────────────────────────

  const isLessonComplete = useCallback(
    (lessonId: string): boolean => normalizedCompletedClassIds.includes(lessonId),
    [normalizedCompletedClassIds]
  )

  const isLevelUnlocked = useCallback(
    (level: LearningLevel): boolean => state.unlockedLevels.includes(level),
    [state.unlockedLevels]
  )

  const isIdeUnlocked = useCallback(
    (): boolean => state.completedLevels.includes('advanced'),
    [state.completedLevels]
  )

  const isPracticeComplete = useCallback(
    (lessonId: string): boolean => state.practiceCompletedIds.includes(lessonId),
    [state.practiceCompletedIds]
  )

  const isQuizComplete = useCallback(
    (lessonId: string): boolean => state.completedQuizIds.includes(lessonId),
    [state.completedQuizIds]
  )

  const hasPassedExam = useCallback(
    (examId: string): boolean =>
      (state.examAttempts[examId] || []).some(a => a.passed),
    [state.examAttempts]
  )

  const getExamAttempts = useCallback(
    (examId: string): ExamAttempt[] => state.examAttempts[examId] || [],
    [state.examAttempts]
  )

  const getBestExamScore = useCallback(
    (examId: string): number => {
      const attempts = state.examAttempts[examId] || []
      return attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0
    },
    [state.examAttempts]
  )

  // ── Memoize context value to prevent unnecessary re-renders ──────────────

  const value = useMemo<ProgressContextValue>(
    () => ({
      ...state,
      apiLoaded,
      completedClassIds: normalizedCompletedClassIds,

      refreshProgress,
      saveLastVisited,
      markClassComplete,
      completeLevel,
      markPracticeComplete,
      markQuizComplete,
      markActivityComplete,
      markExamPassed,

      isLevelUnlocked,
      isIdeUnlocked,
      isLessonComplete,
      isPracticeComplete,
      isQuizComplete,
      hasPassedExam,
      getExamAttempts,
      getBestExamScore,
      getLessonActivityProgress,
    }),
    [
      state,
      apiLoaded,
      normalizedCompletedClassIds,
      refreshProgress,
      saveLastVisited,
      markClassComplete,
      completeLevel,
      markPracticeComplete,
      markQuizComplete,
      markActivityComplete,
      markExamPassed,
      isLevelUnlocked,
      isIdeUnlocked,
      isLessonComplete,
      isPracticeComplete,
      isQuizComplete,
      hasPassedExam,
      getExamAttempts,
      getBestExamScore,
      getLessonActivityProgress,
    ]
  )

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  )
}

// ── Consumer hook ────────────────────────────────────────────────────────────

export function useProgressContext(): ProgressContextValue {
  const ctx = useContext(ProgressContext)
  if (ctx === undefined) {
    throw new Error('useProgressContext must be used within a ProgressProvider')
  }
  return ctx
}
