import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../config/api'
import { useSafeQuery } from './useSafeQuery'
import { get, toArray, toNumber, toStr, safeMap } from '../utils/safe'

export interface DashboardState {
  data: StudentDashboardData
  isLoading: boolean
  isError: boolean
  isOffline: boolean
  retryCount: number
  maxRetries: number
  error: Error | null
  refetch: () => void
}

export interface StudentDashboardData {
  student: {
    name: string
    className: string
    avatar: string
    greeting: string
    profile?: { avatar?: string; schoolName?: string; roll?: string; address?: string; bio?: string }
    profilePicture?: string
  }
  xp: { totalXP: number; level: number; currentLevelXP: number; nextLevelXP: number }
  sidebarItems: Array<{ id: string; label: string; href: string; icon: string; locked?: boolean }>
  stats: Array<{ id: string; title: string; value: string; description: string; trend: string; trendUp: boolean; icon: string }>
  courses: Array<{ id: string; title: string; icon: string; level: string; progress: number; status: 'Completed' | 'Active' | 'Locked' }>
  activities: Array<{ id: string; icon: string; text: string; time: string; xp: number }>
  badges: Array<{ id: string; name: string; icon: string; earned: boolean }>
  challenge: { title: string; description: string; rewardXP: number; ctaText: string; continueHref?: string }
  recentlyCompleted: Array<{ _id: string; title: string; level: string; progress: number; status: string }>
  leaderboard: Array<{
    rank: number; id: string; name: string; avatar: string
    level: string; xp: number; examMarks: number
    completedCourses: number; isCurrentUser: boolean
  }>
  lastVisitedCourse?: string
  lastVisitedLesson?: string
  lastVisitedStage?: string
  learningAnalytics: {
    totalMinutes: number
    weeklyMinutes: number
    todayMinutes: number
    todayTabSwitches: number
    dailyLogs: Array<{ date: string; minutes: number }>
    lastActiveAt: string | null
  }
}

// ── Safe default shape ───────────────────────────────────────────────────────
// Every field has a default so a partial / malformed / empty API response can
// NEVER crash a widget (no `data.student.name` style unsafe access anywhere).
function emptyData(): StudentDashboardData {
  return {
    student: { name: '', className: '', avatar: '', greeting: '' },
    xp: { totalXP: 0, level: 1, currentLevelXP: 0, nextLevelXP: 1 },
    sidebarItems: [],
    stats: [],
    courses: [],
    activities: [],
    badges: [],
    challenge: { title: '', description: '', rewardXP: 0, ctaText: '' },
    recentlyCompleted: [],
    leaderboard: [],
    lastVisitedCourse: undefined,
    lastVisitedLesson: undefined,
    lastVisitedStage: undefined,
    learningAnalytics: {
      totalMinutes: 0,
      weeklyMinutes: 0,
      todayMinutes: 0,
      todayTabSwitches: 0,
      dailyLogs: [],
      lastActiveAt: null,
    },
  }
}

// ── Defensive parser: builds a fully-defaulted object from any JSON ──────────
// Exported for unit testing; only used internally by the hook in production.
export function parseDashboard(json: any): StudentDashboardData {
  const d = emptyData()
  if (!json || typeof json !== 'object') return d

  d.student = {
    name: toStr(get(json, 'student.name', '')),
    className: toStr(get(json, 'student.className', '')),
    avatar: toStr(get(json, 'student.avatar', '')),
    greeting: toStr(get(json, 'student.greeting', '')),
    profile: get(json, 'student.profile', undefined),
    profilePicture: get(json, 'student.profilePicture', undefined),
  }
  d.xp = {
    totalXP: toNumber(get(json, 'xp.totalXP', 0)),
    level: toNumber(get(json, 'xp.level', 1)),
    currentLevelXP: toNumber(get(json, 'xp.currentLevelXP', 0)),
    nextLevelXP: toNumber(get(json, 'xp.nextLevelXP', 1)) || 1,
  }
  d.sidebarItems = safeMap(get(json, 'sidebarItems', []), (it: any) => ({
    id: toStr(it?.id, ''),
    label: toStr(it?.label, ''),
    href: toStr(it?.href, '#'),
    icon: toStr(it?.icon, 'Circle'),
    locked: !!it?.locked,
  }))
  d.stats = safeMap(get(json, 'stats', []), (it: any) => ({
    id: toStr(it?.id, ''),
    title: toStr(it?.title, ''),
    value: toStr(it?.value, ''),
    description: toStr(it?.description, ''),
    trend: toStr(it?.trend, ''),
    trendUp: !!it?.trendUp,
    icon: toStr(it?.icon, 'Circle'),
  }))
  d.courses = safeMap(get(json, 'courses', []), (it: any) => ({
    id: toStr(it?._id, ''),
    title: toStr(it?.title, ''),
    icon: toStr(it?.icon, 'BookOpen'),
    level: toStr(it?.level, ''),
    progress: toNumber(it?.progress, 0),
    status: toStr(it?.status, 'Active') as 'Completed' | 'Active' | 'Locked',
  }))
  d.activities = safeMap(get(json, 'activities', []), (it: any) => ({
    id: toStr(it?.id, ''),
    icon: toStr(it?.icon, 'Circle'),
    text: toStr(it?.text, ''),
    time: toStr(it?.time, ''),
    xp: toNumber(it?.xp, 0),
  }))
  d.badges = safeMap(get(json, 'badges', []), (it: any) => ({
    id: toStr(it?.id, ''),
    name: toStr(it?.name, ''),
    icon: toStr(it?.icon, 'Award'),
    earned: !!it?.earned,
  }))
  const ch = get<any>(json, 'challenge', null)
  if (ch && typeof ch === 'object') {
    d.challenge = {
      title: toStr(ch.title, ''),
      description: toStr(ch.description, ''),
      rewardXP: toNumber(ch.rewardXP, 0),
      ctaText: toStr(ch.ctaText, ''),
      continueHref: get(ch, 'continueHref', undefined),
    }
  }
  d.recentlyCompleted = safeMap(get(json, 'recentlyCompleted', []), (it: any) => ({
    _id: toStr(it?._id, ''),
    title: toStr(it?.title, ''),
    level: toStr(it?.level, ''),
    progress: toNumber(it?.progress, 0),
    status: toStr(it?.status, ''),
  }))
  d.leaderboard = safeMap(get(json, 'leaderboard', []), (it: any) => ({
    rank: toNumber(it?.rank, 0),
    id: toStr(it?.id, ''),
    name: toStr(it?.name, ''),
    avatar: toStr(it?.avatar, ''),
    level: toStr(it?.level, ''),
    xp: toNumber(it?.xp, 0),
    examMarks: toNumber(it?.examMarks, 0),
    completedCourses: toNumber(it?.completedCourses, 0),
    isCurrentUser: !!it?.isCurrentUser,
  }))
  d.lastVisitedCourse = get(json, 'lastVisitedCourse', undefined)
  d.lastVisitedLesson = get(json, 'lastVisitedLesson', undefined)
  d.lastVisitedStage = get(json, 'lastVisitedStage', undefined)

  const la = get<any>(json, 'learningAnalytics', null)
  if (la && typeof la === 'object') {
    d.learningAnalytics = {
      totalMinutes: toNumber(la.totalMinutes, 0),
      weeklyMinutes: toNumber(la.weeklyMinutes, 0),
      todayMinutes: toNumber(la.todayMinutes, 0),
      todayTabSwitches: toNumber(la.todayTabSwitches, 0),
      dailyLogs: safeMap(get(la, 'dailyLogs', []), (it: any) => ({
        date: toStr(it?.date, ''),
        minutes: toNumber(it?.minutes, 0),
      })),
      lastActiveAt: get(la, 'lastActiveAt', null),
    }
  }
  return d
}

export function useStudentDashboardData(): DashboardState & { sections: { global: { isLoading: boolean; isError: boolean; isOffline: boolean; retryCount: number; maxRetries: number } } } {
  const { token } = useAuth()
  const url = token ? `${API_BASE_URL}/dashboard` : null

  const { data, isLoading, isError, isOffline, retryCount, maxRetries, error, refetch } =
    useSafeQuery<any>(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      retries: 3,
      timeoutMs: 10000,
    })

  // Always expose a fully-defaulted object. On success we parse; on empty /
  // malformed / error we still return safe defaults so widgets render.
  const [parsed, setParsed] = useState<StudentDashboardData>(emptyData())

  useEffect(() => {
    if (data) setParsed(parseDashboard(data))
  }, [data])

  return {
    data: parsed,
    isLoading,
    isError,
    isOffline,
    retryCount,
    maxRetries,
    error,
    refetch,
    sections: {
      global: { isLoading, isError, isOffline, retryCount, maxRetries },
    },
  }
}
