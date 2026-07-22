import { useCallback, useMemo } from 'react'
import { useProgressContext } from '../context/ProgressContext'
import type { LearningLevel } from '../context/ProgressContext'

export type { LearningLevel }

export type ExamAttempt = {
  score: number
  passed: boolean
  takenAt: string
  timeTakenSeconds: number
}

export function useCourseProgress(
  classesByLevel: Record<LearningLevel, { id: string }[]>,
  orderedLessonIds: string[] = []
) {
  const ctx = useProgressContext()

  // ── Consumer-specific derived helpers ──────────────────────────────────────
  // These depend on per-consumer parameters (classesByLevel / orderedLessonIds)
  // and therefore cannot live in the global context.

  const isLessonUnlocked = useCallback(
    (lessonId: string): boolean => {
      if (ctx.completedClassIds.includes(lessonId)) return true
      if (ctx.unlockedLessonIds.includes(lessonId)) return true
      if (orderedLessonIds.length > 0 && orderedLessonIds[0] === lessonId) return true
      const idx = orderedLessonIds.indexOf(lessonId)
      if (idx > 0) {
        const prev = orderedLessonIds[idx - 1]
        return ctx.completedClassIds.includes(prev)
      }
      return false
    },
    [ctx.completedClassIds, ctx.unlockedLessonIds, orderedLessonIds]
  )

  const getLevelProgress = useCallback(
    (level: LearningLevel): number => {
      const classes = classesByLevel[level] || []
      if (!classes.length) return 0
      const done = classes.filter(c => ctx.completedClassIds.includes(c.id)).length
      return Math.round((done / classes.length) * 100)
    },
    [classesByLevel, ctx.completedClassIds]
  )

  const totalFromLevels = useMemo(
    () => Object.values(classesByLevel).reduce((acc, list) => acc + list.length, 0),
    [classesByLevel]
  )
  const totalClassCount = useMemo(
    () => totalFromLevels || orderedLessonIds.length,
    [totalFromLevels, orderedLessonIds]
  )
  const completedClassCount = useMemo(
    () => Math.min(ctx.completedClassIds.length, totalClassCount || Infinity),
    [ctx.completedClassIds, totalClassCount]
  )

  // ── Return the exact same shape as before ──────────────────────────────────

  return {
    // All ProgressState fields (spread from context)
    ...ctx,
    // Override completedClassIds with the normalized version (already normalized
    // in context, but kept explicit for clarity and backward compat).
    completedClassIds: ctx.completedClassIds,

    // Consumer-specific helpers
    isLessonUnlocked,
    getLevelProgress,
    completedClassCount,
    totalClassCount,

    // Everything else already comes from ctx: apiLoaded, isLevelUnlocked,
    // isIdeUnlocked, isLessonComplete, isPracticeComplete, isQuizComplete,
    // hasPassedExam, getExamAttempts, getBestExamScore, getLessonActivityProgress,
    // markClassComplete, completeLevel, markPracticeComplete, markQuizComplete,
    // markActivityComplete, markExamPassed, refreshProgress, saveLastVisited,
    // completedLevels, unlockedLevels, completedCourseIds, unlockedCourseIds,
    // completedExamIds, practiceCompletedIds, achievements, unlockedLessonIds,
    // lastVisitedLessonId, xp, level, currentStage, progressPercentage,
    // badges, currentLessonId, continueLearning.
  }
}
