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
  hydrated: boolean
  hydrate: () => Promise<void>
  setUser: (user: AuthUser) => void
  logout: () => Promise<void>
  clearUser: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  hydrated: false,
  // Authentication is now cookie-based (HttpOnly access + refresh tokens).
  // Hydration calls /me; the browser supplies the HttpOnly cookie automatically.
  hydrate: async () => {
    try {
      const res = await api.get<{ ok: boolean; user: AuthUser }>('/api/auth/me')
      if (res.data?.user) set({ user: res.data.user, hydrated: true })
      else set({ user: null, hydrated: true })
    } catch {
      set({ user: null, hydrated: true })
    }
  },
  setUser: (user) => set({ user }),
  logout: async () => {
    try {
      await api.post('/api/auth/logout')
    } catch {
      // ignore network errors; clear local state regardless
    }
    set({ user: null })
  },
  clearUser: () => set({ user: null }),
}))
