import { useState, useEffect } from 'react'
import { SuperAdminLayout } from '../../components/super-admin/SuperAdminLayout'
import { useAuth } from '../../context/AuthContext'
import { API_BASE_URL } from '../../config/api'
import {
  Plus, Search, Shield, Pencil, Trash2, UserX, UserCheck,
  AlertTriangle, Eye, EyeOff, X, RefreshCw, Loader2,
} from 'lucide-react'

interface Admin {
  id: string
  fullName: string
  username: string
  email: string
  role: string
  phone?: string
  isActive: boolean
  emailVerified: boolean
  createdAt: string
}

interface FormErrors {
  fullName?: string
  email?: string
  phone?: string
  password?: string
  confirmPassword?: string
}

const emptyForm = { fullName: '', email: '', phone: '', password: '', confirmPassword: '' }

export function SuperAdminAdminsPage() {
  const { token } = useAuth()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Create/Edit modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Admin | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Suspend confirmation
  const [suspendTarget, setSuspendTarget] = useState<Admin | null>(null)
  const [suspending, setSuspending] = useState(false)

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadAdmins = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${API_BASE_URL}/admins`, { headers })
      if (!res.ok) throw new Error('Failed to load admins')
      const json = await res.json()
      setAdmins(json.data || [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load admins')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAdmins()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const filtered = admins.filter(a =>
    a.fullName.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    (a.phone && a.phone.includes(search))
  )

  // ── Validation ──
  const validate = (isEdit: boolean): FormErrors => {
    const errs: FormErrors = {}
    if (!form.fullName.trim()) errs.fullName = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Invalid email format'
    if (form.phone && !/^\+?[\d\s-]{7,15}$/.test(form.phone.trim())) errs.phone = 'Invalid phone number'
    if (!isEdit) {
      if (!form.password) errs.password = 'Password is required'
      else if (form.password.length < 6) errs.password = 'Min 6 characters'
      if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    } else if (form.password) {
      if (form.password.length < 6) errs.password = 'Min 6 characters'
      if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    }
    return errs
  }

  // ── Create / Edit ──
  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFormErrors({})
    setShowPassword(false)
    setModalOpen(true)
  }

  const openEdit = (admin: Admin) => {
    setEditingId(admin.id)
    setForm({
      fullName: admin.fullName,
      email: admin.email,
      phone: admin.phone || '',
      password: '',
      confirmPassword: '',
    })
    setFormErrors({})
    setShowPassword(false)
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const isEdit = !!editingId
    const errs = validate(isEdit)
    setFormErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSubmitting(true)
    try {
      const body: Record<string, string> = {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
      }
      if (form.phone.trim()) body.phone = form.phone.trim()
      if (form.password) body.password = form.password

      const url = isEdit ? `${API_BASE_URL}/admins/${editingId}` : `${API_BASE_URL}/admins`
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, { method, headers, body: JSON.stringify(body) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Request failed')

      showToast(isEdit ? 'Admin updated' : 'Admin created', 'success')
      setModalOpen(false)
      loadAdmins()
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Request failed', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Suspend / Reactivate ──
  const handleSuspend = async () => {
    if (!suspendTarget) return
    setSuspending(true)
    try {
      const res = await fetch(`${API_BASE_URL}/admins/${suspendTarget.id}/suspend`, {
        method: 'PATCH',
        headers,
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Request failed')
      showToast(json.message, 'success')
      setSuspendTarget(null)
      loadAdmins()
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Request failed', 'error')
    } finally {
      setSuspending(false)
    }
  }

  // ── Delete ──
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`${API_BASE_URL}/admins/${deleteTarget.id}`, {
        method: 'DELETE',
        headers,
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Request failed')
      showToast('Admin deleted', 'success')
      setDeleteTarget(null)
      loadAdmins()
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Request failed', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
    catch { return '—' }
  }

  return (
    <SuperAdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Admin Management</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Create, edit, and manage administrator accounts</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadAdmins}
              className="btn btn-sm btn-ghost"
              style={{ color: 'var(--color-text-muted)' }}>
              <RefreshCw size={16} />
            </button>
            <button onClick={openCreate}
              className="btn btn-sm font-semibold gap-2"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', color: '#fff', border: 'none' }}>
              <Plus size={16} />
              Create Admin
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            className="input input-sm w-full pl-9"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: 'rgba(226,75,74,0.10)', color: 'var(--color-error)' }}>
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {/* Table */}
        <div className="card shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="card-body items-center text-center py-16">
              <Shield size={40} style={{ color: 'var(--color-text-muted)', opacity: 0.4 }} />
              <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
                {search ? 'No admins match your search' : 'No admin accounts yet'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="table table-sm w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                      {['Name', 'Email', 'Phone', 'Status', 'Created', 'Actions'].map(h => (
                        <th key={h} className="text-xs font-semibold uppercase tracking-wider py-3 px-4"
                          style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(admin => (
                      <tr key={admin.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                              style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}>
                              {admin.fullName?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{admin.fullName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text)' }}>{admin.email}</td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>{admin.phone || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`badge badge-sm font-semibold ${admin.isActive ? 'badge-success' : 'badge-error'}`}
                            style={{ border: 'none' }}>
                            {admin.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>{formatDate(admin.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEdit(admin)}
                              className="btn btn-ghost btn-xs"
                              style={{ color: 'var(--color-accent)' }}
                              title="Edit">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => setSuspendTarget(admin)}
                              className="btn btn-ghost btn-xs"
                              style={{ color: admin.isActive ? 'var(--color-warning, #f59e0b)' : '#22c55e' }}
                              title={admin.isActive ? 'Suspend' : 'Reactivate'}>
                              {admin.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                            </button>
                            <button onClick={() => setDeleteTarget(admin)}
                              className="btn btn-ghost btn-xs"
                              style={{ color: 'var(--color-error)' }}
                              title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {filtered.map(admin => (
                  <div key={admin.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                          style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}>
                          {admin.fullName?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{admin.fullName}</p>
                          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{admin.email}</p>
                        </div>
                      </div>
                      <span className={`badge badge-sm font-semibold ${admin.isActive ? 'badge-success' : 'badge-error'}`}
                        style={{ border: 'none' }}>
                        {admin.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                    {admin.phone && (
                      <p className="text-xs pl-[46px]" style={{ color: 'var(--color-text-muted)' }}>{admin.phone}</p>
                    )}
                    <div className="flex items-center justify-between pl-[46px]">
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{formatDate(admin.createdAt)}</p>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(admin)} className="btn btn-ghost btn-xs" style={{ color: 'var(--color-accent)' }}><Pencil size={14} /></button>
                        <button onClick={() => setSuspendTarget(admin)} className="btn btn-ghost btn-xs"
                          style={{ color: admin.isActive ? 'var(--color-warning, #f59e0b)' : '#22c55e' }}>
                          {admin.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                        <button onClick={() => setDeleteTarget(admin)} className="btn btn-ghost btn-xs" style={{ color: 'var(--color-error)' }}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {filtered.length} admin{filtered.length !== 1 ? 's' : ''} total
        </p>
      </div>

      {/* ── Create / Edit Modal ── */}
      {modalOpen && (
        <div className="modal modal-open" onClick={() => !submitting && setModalOpen(false)}>
          <div className="modal-box max-w-lg p-0"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                {editingId ? 'Edit Admin' : 'Create Admin'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="btn btn-ghost btn-xs"
                style={{ color: 'var(--color-text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Full Name */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Full Name *</legend>
                <input
                  type="text" className={`input w-full ${formErrors.fullName ? 'input-error' : ''}`}
                  placeholder="Admin name"
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
                {formErrors.fullName && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{formErrors.fullName}</p>}
              </fieldset>

              {/* Email */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Email *</legend>
                <input
                  type="email" className={`input w-full ${formErrors.email ? 'input-error' : ''}`}
                  placeholder="admin@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
                {formErrors.email && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{formErrors.email}</p>}
              </fieldset>

              {/* Phone */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Phone (optional)</legend>
                <input
                  type="tel" className={`input w-full ${formErrors.phone ? 'input-error' : ''}`}
                  placeholder="+880..."
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
                {formErrors.phone && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{formErrors.phone}</p>}
              </fieldset>

              {/* Password */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Password {!editingId ? '*' : '(leave blank to keep current)'}
                </legend>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`input w-full pr-10 ${formErrors.password ? 'input-error' : ''}`}
                    placeholder={editingId ? '••••••••' : 'Min 6 characters'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--color-text-muted)' }}
                    onClick={() => setShowPassword(v => !v)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {formErrors.password && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{formErrors.password}</p>}
              </fieldset>

              {/* Confirm Password */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Confirm Password {!editingId ? '*' : ''}</legend>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`input w-full ${formErrors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
                {formErrors.confirmPassword && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{formErrors.confirmPassword}</p>}
              </fieldset>

              {/* Role badge */}
              <div className="flex items-center gap-2 px-1">
                <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>Role:</span>
                <span className="badge badge-sm font-bold" style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)', border: 'none' }}>
                  admin
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 pb-1">
                <button type="button" className="btn btn-sm btn-ghost"
                  style={{ color: 'var(--color-text-muted)' }}
                  onClick={() => setModalOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-sm font-semibold"
                  disabled={submitting}
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', color: '#fff', border: 'none', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : editingId ? 'Save Changes' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Suspend / Reactivate Confirmation ── */}
      {suspendTarget && (
        <div className="modal modal-open" onClick={() => !suspending && setSuspendTarget(null)}>
          <div className="modal-box max-w-sm"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center gap-3 py-2">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: suspendTarget.isActive ? 'rgba(226,75,74,0.10)' : 'rgba(34,197,94,0.10)' }}>
                {suspendTarget.isActive
                  ? <UserX size={24} style={{ color: 'var(--color-error)' }} />
                  : <UserCheck size={24} style={{ color: '#22c55e' }} />}
              </div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                {suspendTarget.isActive ? 'Suspend Admin?' : 'Reactivate Admin?'}
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {suspendTarget.isActive
                  ? `${suspendTarget.fullName} will lose access to the admin panel.`
                  : `${suspendTarget.fullName} will regain access to the admin panel.`}
              </p>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              <button className="btn btn-sm btn-ghost" style={{ color: 'var(--color-text-muted)' }}
                onClick={() => setSuspendTarget(null)} disabled={suspending}>Cancel</button>
              <button className={`btn btn-sm font-semibold ${suspendTarget.isActive ? 'btn-error' : 'btn-success'}`}
                onClick={handleSuspend} disabled={suspending}>
                {suspending ? <Loader2 size={14} className="animate-spin" /> : suspendTarget.isActive ? 'Suspend' : 'Reactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {deleteTarget && (
        <div className="modal modal-open" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="modal-box max-w-sm"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center gap-3 py-2">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(226,75,74,0.10)' }}>
                <Trash2 size={24} style={{ color: 'var(--color-error)' }} />
              </div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Delete Admin?</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                This action is permanent. <strong>{deleteTarget.fullName}</strong> ({deleteTarget.email}) will be permanently removed.
              </p>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              <button className="btn btn-sm btn-ghost" style={{ color: 'var(--color-text-muted)' }}
                onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button>
              <button className="btn btn-sm btn-error font-semibold"
                onClick={handleDelete} disabled={deleting}>
                {deleting ? <Loader2 size={14} className="animate-spin" /> : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="toast toast-end toast-bottom z-50">
          <div className={`alert ${toast.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-sm font-semibold`}
            style={{ border: 'none' }}>
            {toast.message}
          </div>
        </div>
      )}
    </SuperAdminLayout>
  )
}
