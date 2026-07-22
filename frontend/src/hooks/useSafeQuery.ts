/**
 * useSafeQuery — React hook wrapping fetchWithRetry.
 *
 * Returns:
 *   data, isLoading, isError, error, retryCount, maxRetries, refetch, isOffline
 *
 * - Retries up to 3 times with exponential backoff (handled in fetchWithRetry).
 *   `retryCount` surfaces progress to the UI ("Retrying 2/3").
 * - Cancels the previous in-flight request when deps change / refetch is called
 *   (AbortController), preventing duplicate/race requests.
 * - When offline, the request is skipped and `isOffline` is set so the UI can
 *   show the offline banner and auto-retry when connectivity returns.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchWithRetry } from './fetchWithRetry'
import { useOnlineStatus } from './useOnlineStatus'

export interface SafeQueryState<T> {
  data: T | null
  isLoading: boolean
  isError: boolean
  error: Error | null
  retryCount: number
  maxRetries: number
  isOffline: boolean
  refetch: () => void
}

interface UseSafeQueryOptions extends RequestInit {
  retries?: number
  timeoutMs?: number
  enabled?: boolean
}

export function useSafeQuery<T = any>(
  url: string | null,
  options: UseSafeQueryOptions = {}
): SafeQueryState<T> {
  const { retries = 3, timeoutMs = 10000, enabled = true, ...init } = options
  const online = useOnlineStatus()

  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(enabled && !!url)
  const [isError, setIsError] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState<number>(0)

  const abortRef = useRef<AbortController | null>(null)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    if (!url || !enabled) {
      setIsLoading(false)
      return
    }
    // Cancel any previous in-flight request (duplicate-request guard).
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    let active = true
    setIsLoading(true)
    setIsError(false)
    setError(null)
    setRetryCount(0)

    fetchWithRetry(url, { ...init, signal: ctrl.signal }, {
      retries,
      timeoutMs,
      online,
      onAttempt: (attempt) => { if (active) setRetryCount(attempt - 1) },
    })
      .then((json) => {
        if (!active || ctrl.signal.aborted) return
        setData(json as T)
        setIsLoading(false)
      })
      .catch((err) => {
        if (!active || ctrl.signal.aborted) return
        setIsError(true)
        setError(err)
        setIsLoading(false)
      })

    return () => {
      active = false
      ctrl.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, enabled, tick, online, retries, timeoutMs])

  // Auto-retry when connectivity returns after being offline.
  const wasOffline = useRef(false)
  useEffect(() => {
    if (!online) {
      wasOffline.current = true
      return
    }
    if (wasOffline.current && url && enabled) {
      wasOffline.current = false
      refetch()
    }
  }, [online, url, enabled, refetch])

  return {
    data,
    isLoading,
    isError,
    error,
    retryCount,
    maxRetries: retries,
    isOffline: !online,
    refetch,
  }
}
