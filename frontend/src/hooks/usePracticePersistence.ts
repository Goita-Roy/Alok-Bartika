import { useCallback, useEffect, useRef, useState } from 'react'
import { API_BASE_URL } from '../config/api'

export type PracticeSnapshot = {
  files?: { name: string; language: string; content: string }[]
  activeFileId?: string | null
  language?: string
  code?: string
  timeSpent?: number
  score?: number
  cursor?: { line: number; column: number }
  scroll?: number
  lesson?: string | null
  completed?: boolean
}

export type RestoredPractice = {
  files?: { name: string; language: string; content: string }[]
  language?: string
  activeFileId?: string | null
  code?: string
  cursor?: { line: number; column: number }
  scroll?: number
  timeSpent?: number
  lesson?: string | null
}

const AUTOSAVE_MS = 10000

// Centralized client-side practice persistence. MongoDB is the single source of
// truth — we never rely on localStorage for practice completion. The hook:
//  - restores saved code/language/cursor/scroll/time on mount
//  - auto-saves every 10s while editing
//  - saves on page unload (best-effort)
//  - exposes markComplete() to finalize + award XP / unlock / notify (server-side)
export function usePracticePersistence(opts: {
  key: string
  enabled: boolean
  getSnapshot: () => PracticeSnapshot
  onRestore?: (state: RestoredPractice) => void
}) {
  const { key, enabled, getSnapshot, onRestore } = opts

  const keyRef = useRef(key)
  keyRef.current = key
  const getSnapshotRef = useRef(getSnapshot)
  getSnapshotRef.current = getSnapshot
  const onRestoreRef = useRef(onRestore)
  onRestoreRef.current = onRestore

  const timeRef = useRef(0)
  const restoredRef = useRef(false)
  const savingRef = useRef(false)
  const [restored, setRestored] = useState(false)

  // Track elapsed time (seconds) for the current open session.
  useEffect(() => {
    if (!enabled) return
    const t = window.setInterval(() => { timeRef.current += 1 }, 1000)
    return () => window.clearInterval(t)
  }, [enabled])

  const buildPayload = useCallback(() => {
    const snap = getSnapshotRef.current()
    return {
      key: keyRef.current,
      ...snap,
      timeSpent: (snap.timeSpent || 0) + timeRef.current,
    }
  }, [])

  const save = useCallback(async (extra: Record<string, unknown> = {}) => {
    if (!enabled) return
    if (savingRef.current) return
    savingRef.current = true
    try {
      const payload = { ...buildPayload(), ...extra }
      await fetch(`${API_BASE_URL}/practice/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(payload),
      })
    } catch {
      /* non-critical */
    } finally {
      savingRef.current = false
    }
  }, [enabled, buildPayload])

  const markComplete = useCallback(async (score?: number) => {
    if (!enabled) return
    try {
      const payload = buildPayload()
      if (typeof score === 'number') payload.score = score
      payload.completed = true
      const res = await fetch(`${API_BASE_URL}/practice/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(payload),
      })
      return await res.json().catch(() => ({}))
    } catch {
      return {}
    }
  }, [enabled, buildPayload])

  // Restore saved practice state on mount (once per key).
  useEffect(() => {
    if (!enabled || restoredRef.current) return
    restoredRef.current = true
    let cancelled = false
    fetch(`${API_BASE_URL}/practice/${encodeURIComponent(keyRef.current)}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return
        const state = data && data.state
        if (state && (state.files?.length || state.code)) {
          onRestoreRef.current?.({
            files: state.files,
            language: state.language,
            activeFileId: state.activeFileId,
            code: state.code,
            cursor: state.cursor,
            scroll: state.scroll,
            timeSpent: state.timeSpent || 0,
            lesson: state.lesson,
          })
          timeRef.current = state.timeSpent || 0
        }
        setRestored(true)
      })
      .catch(() => { if (!cancelled) setRestored(true) })
    return () => { cancelled = true }
  }, [enabled, key])

  // Auto-save every 10 seconds.
  useEffect(() => {
    if (!enabled) return
    const t = window.setInterval(() => { save() }, AUTOSAVE_MS)
    return () => window.clearInterval(t)
  }, [enabled, save])

  // Save on page unload / hide (best-effort, fire-and-forget).
  useEffect(() => {
    if (!enabled) return
    const handler = () => {
      const payload = buildPayload()
      const url = `${API_BASE_URL}/practice/save`
      const token = localStorage.getItem('token')
      // sendBeacon can't carry an Authorization header, so use keepalive fetch.
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {})
    }
    window.addEventListener('beforeunload', handler)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') handler()
    })
    return () => {
      window.removeEventListener('beforeunload', handler)
    }
  }, [enabled, buildPayload])

  return { save, markComplete, restored }
}
