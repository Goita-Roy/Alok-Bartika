import { useCallback, useState } from 'react'

// NOTE: IDE practice-problem completion is an ephemeral sandbox state. It is NOT
// part of the LMS progression and is intentionally kept in-memory only — never
// persisted to localStorage (the single source of truth for learning progress
// is MongoDB). It resets on refresh, which is acceptable for a practice playground.

export function useIDEProgress(totalClasses: number) {
  const [completedClassIds, setCompletedClassIds] = useState<string[]>([])

  const markClassComplete = useCallback((classId: string) => {
    setCompletedClassIds((prev) => (prev.includes(classId) ? prev : [...prev, classId]))
  }, [])

  const isClassComplete = useCallback(
    (classId: string) => completedClassIds.includes(classId),
    [completedClassIds],
  )

  const overallPercent = totalClasses
    ? Math.round((completedClassIds.length / totalClasses) * 100)
    : 0

  return {
    completedClassIds,
    overallPercent,
    markClassComplete,
    isClassComplete,
  }
}
