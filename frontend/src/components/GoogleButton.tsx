import { useState } from 'react'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import api from '../config/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export function GoogleButton({ mode }: { mode: 'login' | 'signup' }) {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''
  if (!clientId) {
    return (
      <div className="p-3 rounded-xl text-sm font-medium text-center"
        style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', fontFamily: "'Hind Siliguri', sans-serif" }}>
        Google লগইন কনফিগার করা হয়নি। (.env-এ VITE_GOOGLE_CLIENT_ID সেট করুন)
      </div>
    )
  }

  async function handleCredential(response: CredentialResponse) {
    if (!response.credential) {
      setError('Google এর সাথে লগইন ব্যর্থ হয়েছে।')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/google', { credential: response.credential })
      login(data)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Google দিয়ে লগইন ব্যর্থ হয়েছে।')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="p-3.5 rounded-xl text-sm font-bold flex items-center gap-2"
          style={{ backgroundColor: '#FFF0F0', color: 'var(--color-error)', border: '1px solid #fecaca', fontFamily: "'Hind Siliguri', sans-serif" }}>
          ⚠️ {error}
        </div>
      ) : null}

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleCredential}
          onError={() => setError('Google এর সাথে লগইন ব্যর্থ হয়েছে।')}
          useOneTap={false}
          theme="outline"
          shape="rectangular"
          text={mode === 'signup' ? 'signup_with' : 'continue_with'}
          width="300"
        />
      </div>
    </div>
  )
}
