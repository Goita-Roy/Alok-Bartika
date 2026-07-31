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

// ── LocalStorage persistence helpers ────────────────────────────────────────
// localStorage is a fast-load cache ONLY for the current browser session.
// MongoDB (via the /progression API) is always the source of truth.
// Rules:
//  - On initial mount: load from localStorage so the UI is non-blank while the
//    API request is in flight.
//  - On server fetch success: REPLACE localStorage with the server list.
//    Never union/merge — stale entries must not survive a server round-trip.
//  - On markClassComplete: optimistically add to state + localStorage so the
//    UI reacts immediately; the following server fetch will canonicalise it.
//  - On login / user change: clear localStorage for the old user before
//    re-fetching so cross-device or cross-account data never bleeds through.

const STORAGE_KEY_COMPLETED = 'alokbartika_completed_classes'

function getLocalCompletedClassIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMPLETED)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed.map(String)
    }
  } catch {}
  return []
}

function saveCompletedClassIdsToLocal(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(ids))
  } catch {}
}

function clearLocalCompletedClassIds() {
  try {
    localStorage.removeItem(STORAGE_KEY_COMPLETED)
  } catch {}
}

// ── Initial state ────────────────────────────────────────────────────────────
// EMPTY_PROGRESS must NOT read from localStorage at module-load time. Doing so
// would bake stale cross-session/cross-user data into the constant and cause a
// race: on login/user-change the Provider clears completedClassIds to [], but
// EMPTY_PROGRESS would still hold the old user's data. Instead, localStorage
// hydration happens inside the Provider after mount, and is always overwritten
// by the server's canonical response.

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
  markClassComplete: (classId: string, courseId?: string) => Promise<void>
  completeLevel: (level: LearningLevel, courseId?: string) => void
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

  // Hydrate from localStorage INSIDE the Provider so it's per-mount, not per-module.
  // This is a temporary cache only — always overwritten by the server response.
  const [state, setState] = useState<ProgressState>(() => ({
    ...EMPTY_PROGRESS,
    completedClassIds: getLocalCompletedClassIds(),
  }))
  const [apiLoaded, setApiLoaded] = useState(false)

  // ── Queued fetch — never silently drops a re-fetch request ──────────────
  // Instead of a boolean inFlight that drops concurrent calls, we use a
  // counter: if fetchProgress is requested while one is in-flight, we record
  // that a re-fetch is needed and trigger it after the current one finishes.
  // This guarantees that post-mutation refreshes always execute.
  const inFlight = useRef(false)
  const pendingRefetch = useRef(false)

  // ── Fetch progress from server ───────────────────────────────────────────
  const fetchProgress = useCallback(async () => {
    if (!token) return
    if (inFlight.current) {
      // A fetch is already running — schedule a re-fetch after it completes
      // instead of silently dropping this request.
      pendingRefetch.current = true
      return
    }
    inFlight.current = true
    pendingRefetch.current = false
    try {
      const res = await fetch(`${API_BASE_URL}/progression`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        console.error(`[fetchProgress] GET ${API_BASE_URL}/progression → status: ${res.status}`)
        return
      }
      const data = await res.json()
      const examAttempts: Record<string, ExamAttempt[]> = {}
      const rawAttempts = data.examAttempts || {}
      for (const [k, v] of Object.entries(rawAttempts)) {
        if (Array.isArray(v)) examAttempts[k] = v as ExamAttempt[]
      }
      // Server is source of truth — replace localStorage with the canonical list.
      // Never union with stale local data; that would let deleted/incorrect
      // entries survive indefinitely and break multi-device consistency.
      const serverCompleted: string[] = (data.completedLessons || []).map(String)
      saveCompletedClassIdsToLocal(serverCompleted)

      // IMPORTANT: Use functional updater so optimistic additions from
      // markClassComplete that arrived WHILE this fetch was in-flight are
      // preserved if they aren't yet in the server response (write may not
      // have been committed by the time GET /progression runs).
      setState(prev => {
        // Merge: server list is canonical, but keep any optimistic id that
        // the server hasn't acknowledged yet (it will on the next fetch).
        const merged = new Set(serverCompleted)
        for (const id of prev.completedClassIds) {
          merged.add(id)
        }
        const mergedIds = [...merged]
        // Only persist the server's canonical list (not the optimistic ids)
        // so a hard refresh will get the right data.
        return {
          completedClassIds: mergedIds,
          completedLevels: (data.completedLevels || []) as LearningLevel[],
          unlockedLevels: (data.unlockedLevels || ['beginner']) as LearningLevel[],
          completedCourseIds: (data.completedCourses || []).map(String),
          unlockedCourseIds: (data.unlockedCourses || []).map(String),
          completedExamIds: (data.completedExams || []).map(String),
          examAttempts,
          practiceCompletedIds: (data.practiceCompleted || []).map(String),
          completedActivityIds: prev.completedActivityIds,
          completedQuizIds: prev.completedQuizIds,
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
        }
      })
      setApiLoaded(true)
    } catch (e) {
      console.error('[fetchProgress] network error:', e)
    } finally {
      inFlight.current = false
      // If a re-fetch was requested while we were busy, run it now.
      if (pendingRefetch.current) {
        pendingRefetch.current = false
        fetchProgress()
      }
    }
  }, [token])

  // ── Fetch triggers ────────────────────────────────────────────────────────
  // Login / logout — clear stale localStorage for the previous user, reset
  // loading flag, and re-fetch. Uses a full state reset (not just clearing
  // completedClassIds) so cross-device/cross-account data never bleeds.
  useEffect(() => {
    clearLocalCompletedClassIds()
    setState(EMPTY_PROGRESS)
    setApiLoaded(false)
    fetchProgress()
  }, [fetchProgress, user?.id])

  // ── Refresh — directly calls fetchProgress (queuing handles concurrency) ─
  const refreshProgress = useCallback(() => {
    fetchProgress()
  }, [fetchProgress])

  // ── Mutation helper: POST with retry, then re-read from server ──────────
  const callApi = useCallback(
    async (url: string, body: Record<string, unknown>) => {
      if (!token) {
        console.warn(`[callApi] ${url} — skipped: no auth token`)
        return
      }
      let succeeded = false
      const maxAttempts = 3
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          const res = await fetch(`${API_BASE_URL}${url}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(body),
          })
          if (res.ok) {
            succeeded = true
            break
          }
          const errBody = await res.text().catch(() => '')
          console.error(`[callApi] POST ${url} → status: ${res.status} body: ${errBody}`)
          if (res.status >= 400 && res.status < 500) break
        } catch (e) {
          console.error(`[callApi] POST ${url} → NETWORK ERROR:`, e)
        }
        if (attempt < maxAttempts - 1) {
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)))
        }
      }
      // Only re-fetch from server on success so we don't overwrite optimistic
      // local state with stale server data when the write never landed.
      if (succeeded) {
        refreshProgress()
      } else {
        console.warn(`[callApi] ${url} — all ${maxAttempts} attempts failed; keeping local optimistic state`)
      }
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
    (classId: string, courseId?: string): Promise<void> => {
      // Optimistic update — immediately reflect in UI + localStorage.
      setState(prev => {
        if (prev.completedClassIds.includes(classId)) return prev
        const nextCompleted = [...prev.completedClassIds, classId]
        saveCompletedClassIdsToLocal(nextCompleted)
        return { ...prev, completedClassIds: nextCompleted }
      })

      // Always call the API. The callApi helper handles retries and
      // triggers refreshProgress on success, which fetches the server's
      // canonical state (the queued-fetch mechanism ensures it runs).
      return callApi('/progression/complete-lesson', { lessonId: classId, courseId })
    },
    [callApi]
  )

  const completeLevel = useCallback(
    (level: LearningLevel, courseId?: string) => {
      console.log('[ProgressContext] completeLevel called for level:', level, 'courseId:', courseId)
      return callApi('/progression/complete-course', { level, courseId })
    },
    [callApi]
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
