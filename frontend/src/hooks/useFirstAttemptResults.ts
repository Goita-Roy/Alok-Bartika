import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../config/api'

export interface FirstAttemptResult {
  examId: string
  level: string
  examName: string
  examType: string
  score: number
  earnedPoints: number | null
  totalPoints: number | null
  passed: boolean
  takenAt: string | null
}

interface State {
  results: FirstAttemptResult[]
  isLoading: boolean
}

export function useFirstAttemptResults(): State & { refetch: () => void } {
  const { token } = useAuth()
  const [fetchKey, setFetchKey] = useState(0)
  const [state, setState] = useState<State>({ results: [], isLoading: true })

  useEffect(() => {
    if (!token) {
      setState({ results: [], isLoading: false })
      return
    }

    let cancelled = false
    setState(prev => ({ ...prev, isLoading: true }))

    const fetchResults = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/exams/results/first-attempts`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch first attempt results')
        const json: { results: FirstAttemptResult[] } = await res.json()
        if (cancelled) return
        setState({ results: json.results || [], isLoading: false })
      } catch (error) {
        console.error('First attempt results fetch error:', error)
        if (!cancelled) setState({ results: [], isLoading: false })
      }
    }

    fetchResults()
    return () => { cancelled = true }
  }, [token, fetchKey])

  const refetch = useCallback(() => setFetchKey(k => k + 1), [])

  return { ...state, refetch }
}
