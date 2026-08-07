import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { API_BASE_URL } from '../../config/api'
import { Eye, EyeOff, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react'

// Hidden one-time bootstrap page. NOT linked from any navigation — reachable
// only by typing /super-admin/setup directly. The backend is the authority on
// whether setup is still allowed (it rejects once a super admin exists).
export function SuperAdminSetupPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [configured, setConfigured] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const checkStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/super-admin/setup-status`)
        const data = await res.json()
        if (!cancelled) setConfigured(Boolean(data.configured))
      } catch {
        if (!cancelled) setError('Network error. Please try again.')
      } finally {
        if (!cancelled) setChecking(false)
      }
    }
    void checkStatus()
    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !email.trim() || !password) return

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_BASE_URL}/auth/super-admin/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: fullName.trim(), email: email.trim(), password }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409 && data.code === 'SUPER_ADMIN_CONFIGURED') {
          setConfigured(true)
          setError(null)
        } else {
          setError(data.message || 'Setup failed. Please check your details.')
        }
        return
      }

      login(data)
      navigate('/super-admin/dashboard', { replace: true })
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
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #c084fc)',
                  boxShadow: '0 4px 16px rgba(124,58,237,0.25)'
                }}>
                <Shield size={28} color="#fff" strokeWidth={2.5} />
              </div>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              Super Admin Setup
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {configured ? 'Configuration complete' : 'Create the first super admin account'}
            </p>
          </div>

          {checking ? (
            <div className="flex justify-center py-6">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : configured ? (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: 'rgba(52,199,89,0.10)', color: 'var(--color-success)' }}>
              <CheckCircle2 size={16} />
              Super Admin has already been configured.
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: 'rgba(226,75,74,0.10)', color: 'var(--color-error)' }}>
                  <AlertTriangle size={16} />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Full Name</legend>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Super Admin"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                    autoFocus
                  />
                </fieldset>

                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Email</legend>
                  <input
                    type="email"
                    className="input w-full"
                    placeholder="superadmin@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </fieldset>

                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Password</legend>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input w-full pr-10"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded-md"
                      style={{ color: 'var(--color-text-muted)' }}
                      onClick={() => setShowPassword(v => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </fieldset>

                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Confirm Password</legend>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input w-full"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </fieldset>

                <button
                  type="submit"
                  disabled={loading || !fullName.trim() || !email.trim() || !password || !confirmPassword}
                  className="btn w-full border-0 font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed, #c084fc)',
                    color: '#fff',
                    opacity: loading ? 0.7 : 1,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  {loading ? <span className="loading loading-spinner loading-sm" /> : 'Create Super Admin'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
