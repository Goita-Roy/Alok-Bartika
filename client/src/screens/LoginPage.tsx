import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import type { AuthUser } from '../state/authStore'
import { useAuthStore } from '../state/authStore'

type LoginResponse = {
  user: AuthUser
}

function validate(identifier: string, password: string) {
  const errors: Record<string, string> = {}
  if (!identifier.trim()) errors.identifier = 'Email or phone is required'
  if (password.length < 8) errors.password = 'Password must be at least 8 characters'
  return errors
}

export function LoginPage() {
  const setUser = useAuthStore((s) => s.setUser)
  const navigate = useNavigate()
  const location = useLocation()
  const next = (location.state as any)?.next as string | undefined

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const fieldErrors = useMemo(() => validate(identifier, password), [identifier, password])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)
    const errs = validate(identifier, password)
    if (Object.keys(errs).length) return
    setSubmitting(true)
    try {
      const res = await api.post<LoginResponse>('/api/auth/login', {
        emailOrPhone: identifier,
        password,
      })
      setUser(res.data.user)
      const roleTarget = res.data.user.role === 'admin' ? '/admin' : '/dashboard'
      navigate(next ?? roleTarget, { replace: true })
    } catch (err: any) {
      setServerError(err?.response?.data?.error ?? err?.message ?? 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold">Login</h2>
        <p className="text-sm text-zinc-300">
          Use your email or phone and password.
        </p>
      </div>

      {serverError ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {serverError}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-5">
        <label className="grid gap-1 text-sm">
          <span className="text-zinc-300">Email or phone</span>
          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="rounded-md border border-white/10 bg-zinc-950 px-3 py-2 outline-none focus:border-white/30"
            autoComplete="username"
          />
          {fieldErrors.identifier ? <span className="text-xs text-red-200">{fieldErrors.identifier}</span> : null}
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-zinc-300">Password</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="rounded-md border border-white/10 bg-zinc-950 px-3 py-2 outline-none focus:border-white/30"
            autoComplete="current-password"
          />
          {fieldErrors.password ? <span className="text-xs text-red-200">{fieldErrors.password}</span> : null}
        </label>

        <button
          className="w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-sm hover:bg-zinc-800 disabled:opacity-60"
          type="submit"
          disabled={submitting || Object.keys(fieldErrors).length > 0}
        >
          {submitting ? 'Logging in…' : 'Login'}
        </button>
      </form>

      <p className="text-sm text-zinc-300">
        New here?{' '}
        <Link className="text-white underline underline-offset-4" to="/signup">
          Create an account
        </Link>
      </p>
    </div>
  )
}

