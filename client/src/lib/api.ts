import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { env } from './env'
import { getCookie } from './cookie'
import { useAuthStore } from '../state/authStore'

export const CSRF_COOKIE = 'csrf_token'
export const CSRF_HEADER = 'x-csrf-token'
const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

let refreshing: Promise<unknown> | null = null

function ensureCsrfToken(): Promise<void> {
  // The server issues a CSRF cookie on every response; make sure we have one
  // before sending a state-changing request.
  if (getCookie(CSRF_COOKIE)) return Promise.resolve()
  return api.get('/api/auth/csrf-token').then(() => undefined).catch(() => undefined)
}

export const api = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true, // send/receive HttpOnly auth cookies
})

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  config.headers = config.headers ?? {}
  const method = (config.method ?? 'get').toUpperCase()
  if (MUTATING.has(method)) {
    await ensureCsrfToken()
    const token = getCookie(CSRF_COOKIE)
    if (token) config.headers[CSRF_HEADER] = token
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined
    const status = error.response?.status

    // Attempt a single silent refresh on 401 (expired access token).
    if (status === 401 && original && !original._retried) {
      original._retried = true
      try {
        if (!refreshing) refreshing = api.post('/api/auth/refresh')
        await refreshing
        refreshing = null
        return api(original)
      } catch {
        refreshing = null
        useAuthStore.getState().clearUser()
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  },
)
