import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../config/api'

export interface ExamInfo {
  id: string; title: string; level: string
}

export interface ProjectInfo {
  id: string; title: string
}

export interface BadgeInfo {
  name: string; icon: string; awardedAt: string | null
}

export interface LeaderboardEntry {
  rank: number
  id: string
  name: string
  avatar: string
  level: string
  xp: number
  examMarks: number
  completedCourses: number
  badges: BadgeInfo[]
  badgesCount: number
  school: string
  progressPercentage: number
  completedExamsCount: number
  exams: ExamInfo[]
  projectsSubmitted: number
  projects: ProjectInfo[]
  skillLevel: string
  highestCompletedLevel: string
  lastActiveAt: string | null
  isCurrentUser: boolean
}

interface UseLeaderboardResult {
  data: LeaderboardEntry[]
  totalCount: number
  isLoading: boolean
  refetch: () => void
}

export function useLeaderboardData(): UseLeaderboardResult {
  const { token } = useAuth()
  const [fetchKey, setFetchKey] = useState(0)
  const [data, setData] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refetch = useCallback(() => setFetchKey(k => k + 1), [])

  useEffect(() => {
    if (!token) {
      setData([])
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/leaderboard`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch leaderboard')
        const json = await res.json()
        if (!cancelled) {
          setData(json.leaderboard || [])
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Leaderboard fetch error:', error)
        if (!cancelled) {
          setData([])
          setIsLoading(false)
        }
      }
    }

    fetchLeaderboard()
    return () => { cancelled = true }
  }, [token, fetchKey])

  // Auto-refresh via the existing refresh flow (just re-runs the fetch above)
  // whenever the user returns to the tab/window — e.g. after completing a lesson,
  // course, or exam elsewhere — so the leaderboard reflects live DB data without
  // a server restart or window.location.reload().
  useEffect(() => {
    if (!token) return
    const onFocus = () => {
      if (document.visibilityState === 'visible') setFetchKey(k => k + 1)
    }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [token])

  return { data, totalCount: data.length, isLoading, refetch }
}
