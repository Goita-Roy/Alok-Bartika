import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import api from '../config/api'

interface User {
  id: string
  role: string
  fullName: string
  email: string
  phone?: string
  pendingFeedback?: string | null
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (userData: any) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const initialLoadDone = useRef(false)

  const setAuthHeader = useCallback((t: string | null) => {
    if (t) {
      api.defaults.headers.common['Authorization'] = `Bearer ${t}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [])

  useEffect(() => {
    if (initialLoadDone.current) return
    initialLoadDone.current = true

    const savedToken = localStorage.getItem('token')
    if (!savedToken) {
      setLoading(false)
      return
    }

    setAuthHeader(savedToken)

    const fetchUser = async () => {
      try {
        const { data } = await api.get('/auth/me')
        // Merge pendingFeedback from the server response into the user object.
        // The backend returns it alongside user data so the AuthContext can
        // enforce the mandatory feedback redirect on every navigation.
        const serverUser = data.user || {}
        setUser({
          id: serverUser.id || serverUser._id,
          role: serverUser.role,
          fullName: serverUser.fullName,
          email: serverUser.email,
          phone: serverUser.phone,
          pendingFeedback: serverUser.pendingFeedback || null,
        })
      } catch (error) {
        console.error('Failed to fetch user', error)
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [setAuthHeader])

  const login = useCallback((userData: any) => {
    const token = userData?.token || userData?.accessToken || null
    const rawUser = userData?.user ?? userData
    const normalizedUser = {
      id: rawUser?._id || rawUser?.id,
      role: rawUser?.role,
      fullName: rawUser?.fullName,
      email: rawUser?.email,
      phone: rawUser?.phone,
      pendingFeedback: rawUser?.pendingFeedback || null,
    }

    if (!token) {
      console.error('Auth login called without a token', userData)
      return
    }

    localStorage.setItem('token', token)
    setAuthHeader(token)
    setToken(token)
    setUser(normalizedUser)
    setLoading(false)
  }, [setAuthHeader])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setAuthHeader(null)
    setToken(null)
    setUser(null)
  }, [setAuthHeader])

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
