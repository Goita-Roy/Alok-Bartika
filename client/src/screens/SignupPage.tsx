import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import type { AuthUser } from '../state/authStore'
import { useAuthStore } from '../state/authStore'

type RegisterResponse = {
  user: AuthUser
}

type FormState = {
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  institution: string
  address: string
}

function validate(s: FormState) {
  const e: Record<string, string> = {}
  if (s.fullName.trim().length < 2) e.fullName = 'Full name is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email.trim())) e.email = 'Valid email is required'
  if (s.phone.trim().length < 8) e.phone = 'Valid phone is required'
  if (s.password.length < 8) e.password = 'Password must be at least 8 characters'
  if (s.confirmPassword !== s.password) e.confirmPassword = 'Passwords do not match'
  if (!s.institution.trim()) e.institution = 'Institution is required'
  if (!s.address.trim()) e.address = 'Address is required'
  return e
}

export function SignupPage() {
  const setUser = useAuthStore((s) => s.setUser)
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    institution: '',
    address: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [fieldErrorsFromServer, setFieldErrorsFromServer] = useState<Record<string, string> | null>(null)

  const fieldErrors = useMemo(() => validate(form), [form])

  function update<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)
    setFieldErrorsFromServer(null)
    const errs = validate(form)
    if (Object.keys(errs).length) return
    setSubmitting(true)
    try {
      const res = await api.post<RegisterResponse>('/api/auth/register', {
        role: 'student',
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        institution: form.institution,
        address: form.address,
        department: 'Not specified',
        batch: 'Not specified',
        roll: 'Not specified',
        guardianName: 'Not specified',
        guardianPhone: form.phone,
      })
      setUser(res.data.user)
      navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    } catch (err: any) {
      setServerError(err?.response?.data?.error ?? err?.message ?? 'Signup failed')
      setFieldErrorsFromServer(err?.response?.data?.fieldErrors ?? null)
    } finally {
      setSubmitting(false)
    }
  }

  function errorFor(key: keyof FormState) {
    return fieldErrors[key] ?? fieldErrorsFromServer?.[key as string] ?? null
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold">Create account</h2>
        <p className="text-sm text-zinc-300">All fields are required.</p>
      </div>

      {serverError ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {serverError}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-6 rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="text-zinc-300">Full name</span>
            <input
              value={form.fullName}
              onChange={(e) => update('fullName', e.target.value)}
              className="rounded-md border border-white/10 bg-zinc-950 px-3 py-2 outline-none focus:border-white/30"
            />
            {errorFor('fullName') ? <span className="text-xs text-red-200">{errorFor('fullName')}</span> : null}
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-zinc-300">Email</span>
            <input
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="rounded-md border border-white/10 bg-zinc-950 px-3 py-2 outline-none focus:border-white/30"
              autoComplete="email"
            />
            {errorFor('email') ? <span className="text-xs text-red-200">{errorFor('email')}</span> : null}
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-zinc-300">Phone</span>
            <input
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              className="rounded-md border border-white/10 bg-zinc-950 px-3 py-2 outline-none focus:border-white/30"
              autoComplete="tel"
            />
            {errorFor('phone') ? <span className="text-xs text-red-200">{errorFor('phone')}</span> : null}
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-zinc-300">Institution</span>
            <input
              value={form.institution}
              onChange={(e) => update('institution', e.target.value)}
              className="rounded-md border border-white/10 bg-zinc-950 px-3 py-2 outline-none focus:border-white/30"
            />
            {errorFor('institution') ? <span className="text-xs text-red-200">{errorFor('institution')}</span> : null}
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-zinc-300">Password</span>
            <input
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              type="password"
              className="rounded-md border border-white/10 bg-zinc-950 px-3 py-2 outline-none focus:border-white/30"
              autoComplete="new-password"
            />
            {errorFor('password') ? <span className="text-xs text-red-200">{errorFor('password')}</span> : null}
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-zinc-300">Confirm password</span>
            <input
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              type="password"
              className="rounded-md border border-white/10 bg-zinc-950 px-3 py-2 outline-none focus:border-white/30"
              autoComplete="new-password"
            />
            {errorFor('confirmPassword') ? (
              <span className="text-xs text-red-200">{errorFor('confirmPassword')}</span>
            ) : null}
          </label>

          <label className="grid gap-1 text-sm md:col-span-2">
            <span className="text-zinc-300">Address</span>
            <input
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              className="rounded-md border border-white/10 bg-zinc-950 px-3 py-2 outline-none focus:border-white/30"
            />
            {errorFor('address') ? <span className="text-xs text-red-200">{errorFor('address')}</span> : null}
          </label>
        </div>

        <button
          className="w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-sm hover:bg-zinc-800 disabled:opacity-60"
          type="submit"
          disabled={submitting || Object.keys(fieldErrors).length > 0}
        >
          {submitting ? 'Creating…' : 'Sign up'}
        </button>
      </form>

      <p className="text-sm text-zinc-300">
        Already have an account?{' '}
        <Link className="text-white underline underline-offset-4" to="/login">
          Login
        </Link>
      </p>
    </div>
  )
}
