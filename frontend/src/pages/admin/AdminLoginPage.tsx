import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { API_BASE_URL } from '../../config/api'
import { Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react'

export function AdminLoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_BASE_URL}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 403 && data.code === 'NOT_ADMIN') {
          setError('Access denied. This account does not have admin privileges.')
        } else {
          setError(data.message || 'Login failed. Please check your credentials.')
        }
        return
      }

      login(data)
      navigate('/admin/dashboard', { replace: true })
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body gap-6 p-8">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1D9E75, #9FE1CB)',
                         boxShadow: '0 4px 16px rgba(29,158,117,0.25)' }}>
                <Shield size={28} color="#fff" strokeWidth={2.5} />
              </div>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              Admin Login
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Sign in to the admin panel
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: 'rgba(226,75,74,0.10)', color: 'var(--color-error)' }}>
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Email</legend>
              <input
                type="email"
                className="input w-full"
                placeholder="admin@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Password</legend>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input w-full pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-text-muted)' }}
                  onClick={() => setShowPassword(v => !v)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={loading || !email.trim() || !password}
              className="btn btn-primary w-full"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? <span className="loading loading-spinner loading-sm" /> : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
