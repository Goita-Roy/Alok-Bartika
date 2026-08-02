import { create } from 'zustand'
import { api } from '../lib/api'

export type UserRole = 'student' | 'admin'

export type AuthUser = {
  id: string
  role: UserRole
  fullName: string
  email: string
  phone: string
}

type AuthState = {
  user: AuthUser | null
  token: string | null
  hydrated: boolean
  hydrate: () => Promise<void>
  setUser: (user: AuthUser, token?: string) => void
  logout: () => Promise<void>
  clearUser: () => void
}

const TOKEN_KEY = 'alokbartika.auth.token'

function loadToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}

function saveToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch { /* ignore */ }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: loadToken(),
  hydrated: false,
  hydrate: async () => {
    try {
      const res = await api.get<{ ok: boolean; user: AuthUser }>('/api/auth/me')
      if (res.data?.user) set({ user: res.data.user, hydrated: true })
      else set({ user: null, hydrated: true })
    } catch {
      set({ user: null, hydrated: true })
    }
  },
  setUser: (user, token) => {
    if (token) saveToken(token)
    set({ user, ...(token ? { token } : {}) })
  },
  logout: async () => {
    try {
      await api.post('/api/auth/logout')
    } catch {
      // ignore network errors; clear local state regardless
    }
    saveToken(null)
    set({ user: null, token: null })
  },
  clearUser: () => {
    saveToken(null)
    set({ user: null, token: null })
  },
}))
