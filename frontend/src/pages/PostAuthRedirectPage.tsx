import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { API_BASE_URL } from '../config/api'
import { useAuth } from '../context/AuthContext'

function getRole(rawRole: unknown): 'student' | 'admin' {
  return rawRole === 'admin' ? 'admin' : 'student'
}

export function PostAuthRedirectPage() {
  const { user, token, loading } = useAuth()
  const [profileExists, setProfileExists] = useState<boolean | null>(null)
  const [profileRole, setProfileRole] = useState<'student' | 'admin' | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkProfile() {
      if (!token) return
      try {
        const res = await fetch(`${API_BASE_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (res.ok) {
          const payload = await res.json()
          const roleFromApi = payload?.data?.role === 'admin' ? 'admin' : 'student'
          setProfileRole(roleFromApi)
          setProfileExists(true)
        } else if (res.status === 404) {
          setProfileExists(false)
        } else {
          setError('Could not verify profile status')
          // Fallback: if we can't verify, let them go to onboarding to be safe
          setProfileExists(false)
        }
      } catch (err) {
        console.error('Check Profile Error:', err)
        setError('Network error')
        setProfileExists(false)
      }
    }
    
    if (!loading && token) {
      checkProfile()
    }
  }, [loading, token])

  if (loading) return <p className="p-4">Loading session...</p>
  if (!token) return <Navigate to="/login" replace />
  
  if (profileExists === null) {
    return <p className="p-4">Verifying account details...</p>
  }

  if (error) {
    console.warn('PostAuth Error:', error)
  }

  if (!profileExists) {
    return <Navigate to="/onboarding" replace />
  }

  const role = profileRole ?? getRole(user?.role)
  const targetPath = role === 'admin' ? '/admin' : '/dashboard'

  return <Navigate to={targetPath} replace />
}
