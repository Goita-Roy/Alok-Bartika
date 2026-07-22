import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'

interface User {
  id: string
  role: string
  fullName: string
  email: string
  phone?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (userData: any) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const initialLoadDone = useRef(false)

  const setAuthHeader = useCallback((t: string | null) => {
    if (t) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${t}`
    } else {
      delete axios.defaults.headers.common['Authorization']
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
        const { data } = await axios.get(`${API_BASE_URL}/auth/me`)
        setUser(data.user)
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
    const normalizedUser = userData?.user ?? {
      id: userData?._id || userData?.id,
      role: userData?.role,
      fullName: userData?.fullName,
      email: userData?.email,
      phone: userData?.phone,
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

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
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
