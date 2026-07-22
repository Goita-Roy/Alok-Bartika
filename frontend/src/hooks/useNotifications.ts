import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'

export interface NotificationItem {
  _id: string
  type: string
  title: string
  message: string
  icon?: string
  color?: string
  link?: string
  read: boolean
  dedupeKey?: string
  createdAt: string
}

export interface NotificationsResponse {
  notifications: NotificationItem[]
  total: number
  unreadCount: number
  limit: number
  skip: number
  hasMore: boolean
}

const POLL_INTERVAL = 15000 // 15s live refresh (no manual refresh needed)

export function useNotifications(enabled: boolean) {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const skipRef = useRef(0)
  const limit = 20

  const fetchAll = useCallback(
    async (isLoadMore = false) => {
      if (!enabled) return
      isLoadMore ? setLoadingMore(true) : setLoading(true)
      try {
        const skip = isLoadMore ? skipRef.current : 0
        const { data } = await axios.get<NotificationsResponse>(
          `${API_BASE_URL}/notifications?limit=${limit}&skip=${skip}`,
        )
        if (isLoadMore) {
          setItems((prev) => [...prev, ...data.notifications])
        } else {
          setItems(data.notifications)
        }
        setUnreadCount(data.unreadCount)
        setTotal(data.total)
        setHasMore(data.hasMore)
        skipRef.current = skip + data.notifications.length
      } catch {
        // swallow — notifications are non-critical
      } finally {
        isLoadMore ? setLoadingMore(false) : setLoading(false)
      }
    },
    [enabled, limit],
  )

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        await axios.patch(`${API_BASE_URL}/notifications/${id}/read`)
        setItems((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
        )
        setUnreadCount((c) => Math.max(0, c - 1))
      } catch {
        /* ignore */
      }
    },
    [],
  )

  const markAllAsRead = useCallback(async () => {
    try {
      await axios.patch(`${API_BASE_URL}/notifications/read-all`)
      setItems((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {
      /* ignore */
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/notifications/${id}`)
      setItems((prev) => {
        const target = prev.find((n) => n._id === id)
        if (target && !target.read) {
          setUnreadCount((c) => Math.max(0, c - 1))
        }
        return prev.filter((n) => n._id !== id)
      })
      setTotal((t) => Math.max(0, t - 1))
    } catch {
      /* ignore */
    }
  }, [])

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore) fetchAll(true)
  }, [hasMore, loadingMore, fetchAll])

  // Initial load + reset pagination when auth state changes.
  useEffect(() => {
    skipRef.current = 0
    if (enabled) fetchAll(false)
  }, [enabled, fetchAll])

  // Live updates: poll so new notifications appear without a manual refresh.
  useEffect(() => {
    if (!enabled) return
    const t = setInterval(() => fetchAll(false), POLL_INTERVAL)
    return () => clearInterval(t)
  }, [enabled, fetchAll])

  return {
    items,
    unreadCount,
    total,
    hasMore,
    loading,
    loadingMore,
    markAsRead,
    markAllAsRead,
    remove,
    loadMore,
    refresh: () => fetchAll(false),
  }
}
