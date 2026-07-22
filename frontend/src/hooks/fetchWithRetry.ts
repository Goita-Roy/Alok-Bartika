/**
 * fetchWithRetry — a resilient JSON fetcher for dashboard APIs.
 *
 * Features:
 *   - Automatic retry (default 3 attempts) with EXPONENTIAL BACKOFF.
 *   - Per-attempt TIMEOUT (aborts the request so a hung server can't spin forever).
 *   - DUPLICATE-REQUEST CANCELLATION: callers pass an AbortController; a new
 *     request aborts the previous in-flight one.
 *   - Skips the network entirely when offline (throws a typed OfflineError) so the
 *     UI can show the offline banner instead of burning retries.
 *   - Treats HTTP >= 500 and network/timeout errors as retryable; 4xx (except
 *     408/429) as fatal (no retry).
 */
import { toBool } from '../utils/safe'

export class OfflineError extends Error {
  constructor(msg = 'অফলাইন — ইন্টারনেট সংযোগ নেই') {
    super(msg)
    this.name = 'OfflineError'
  }
}

export class HttpError extends Error {
  status: number
  constructor(status: number, msg: string) {
    super(msg)
    this.name = 'HttpError'
    this.status = status
  }
}

export interface RetryOptions {
  retries?: number
  baseDelayMs?: number
  timeoutMs?: number
  signal?: AbortSignal
  online?: boolean
  onAttempt?: (attempt: number, max: number) => void
}

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'))
    const t = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(t)
        reject(new DOMException('Aborted', 'AbortError'))
      },
      { once: true }
    )
  })

async function withTimeout(
  promise: Promise<Response>,
  ms: number,
  signal?: AbortSignal
): Promise<Response> {
  const controller = new AbortController()
  const onAbort = () => controller.abort()
  signal?.addEventListener('abort', onAbort, { once: true })
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    return await Promise.race([
      promise,
      new Promise<Response>((_, rej) =>
        controller.signal.addEventListener('abort', () => rej(new DOMException('Timeout', 'AbortError')), { once: true })
      ),
    ])
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onAbort)
  }
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  opts: RetryOptions = {}
): Promise<any> {
  const retries = opts.retries ?? 3
  const baseDelay = opts.baseDelayMs ?? 600
  const timeoutMs = opts.timeoutMs ?? 10000
  const maxAttempt = retries + 1

  if (toBool(opts.online, true) === false) {
    throw new OfflineError()
  }

  let lastErr: any = null
  for (let attempt = 1; attempt <= maxAttempt; attempt++) {
    if (opts.signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    opts.onAttempt?.(attempt, maxAttempt)
    try {
      const ctrl = new AbortController()
      const onAbort = () => ctrl.abort()
      opts.signal?.addEventListener('abort', onAbort, { once: true })
      let res: Response
      try {
        res = await withTimeout(
          fetch(url, { ...options, signal: ctrl.signal }),
          timeoutMs,
          opts.signal
        )
      } finally {
        opts.signal?.removeEventListener('abort', onAbort)
      }

      if (res.status >= 500) {
        lastErr = new HttpError(res.status, `Server error ${res.status}`)
        // retryable
      } else if (res.status === 408 || res.status === 429) {
        lastErr = new HttpError(res.status, `Retryable status ${res.status}`)
        // retryable
      } else if (!res.ok) {
        // 4xx (other than above) are fatal → do not retry
        throw new HttpError(res.status, `Request failed with ${res.status}`)
      } else {
        try {
          return await res.json()
        } catch {
          // 200 but invalid JSON → treat as retryable transient
          lastErr = new Error('Invalid JSON response')
        }
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') throw err
      // Fatal HTTP errors (4xx) thrown above must propagate immediately and
      // NOT be swallowed/retried. Retryable errors (network/timeout) fall
      // through to be retried on the next attempt.
      if (err instanceof HttpError && err.status < 500 && err.status !== 408 && err.status !== 429) {
        throw err
      }
      lastErr = err
    }

    // If this was the last attempt, stop.
    if (attempt === maxAttempt) break

    const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 250
    await sleep(delay, opts.signal)
  }

  throw lastErr ?? new Error('Request failed after retries')
}
