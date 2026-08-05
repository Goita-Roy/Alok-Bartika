import { useState, useEffect } from 'react'
import { SuperAdminLayout } from '../../components/super-admin/SuperAdminLayout'
import { useAuth } from '../../context/AuthContext'
import { API_BASE_URL } from '../../config/api'
import {
  Plus, Search, Shield, Pencil, Trash2, UserX, UserCheck,
  AlertTriangle, Eye, EyeOff, X, RefreshCw, Loader2,
  Key, ChevronLeft, ChevronRight,
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
  lastLogin: string | null
  updatedAt?: string
}

interface FormErrors {
  fullName?: string
  email?: string
  phone?: string
  password?: string
  confirmPassword?: string
}

const emptyForm = { fullName: '', email: '', phone: '', password: '', confirmPassword: '' }
const emptyResetForm = { password: '', confirm: '' }

const roleColors: Record<string, string> = {
  student: '#3b82f6',
  admin: '#7c3aed',
  'super-admin': '#dc2626',
  teacher: '#16a34a',
  parent: '#f59e0b',
}

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
] as const

export function SuperAdminAdminsPage() {
  const { token } = useAuth()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters & pagination
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

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

  // View modal
  const [viewTarget, setViewTarget] = useState<Admin | null>(null)

  // Reset password modal
  const [resetTarget, setResetTarget] = useState<Admin | null>(null)
  const [resetting, setResetting] = useState(false)
  const [resetForm, setResetForm] = useState(emptyResetForm)
  const [resetError, setResetError] = useState('')

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

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    loadAdmins()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // ── Derived: filtered + paginated ──
  const filtered = admins.filter(a => {
    const q = search.toLowerCase()
    const matchesSearch =
      a.fullName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.role.toLowerCase().includes(q) ||
      (a.phone ? a.phone.toLowerCase().includes(q) : false)
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' ? a.isActive : !a.isActive)
    return matchesSearch && matchesStatus
  })

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const activePage = Math.min(currentPage, totalPages)
  const pageData = filtered.slice((activePage - 1) * pageSize, activePage * pageSize)

  // ── Helpers ──
  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
    catch { return '—' }
  }

  const roleColor = (role: string) => roleColors[role] || '#6b7280'

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

  // ── Reset Password ──
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetTarget) return
    setResetError('')
    if (resetForm.password.length < 6) {
      setResetError('Password must be at least 6 characters')
      return
    }
    if (resetForm.password !== resetForm.confirm) {
      setResetError('Passwords do not match')
      return
    }
    setResetting(true)
    try {
      const res = await fetch(`${API_BASE_URL}/admins/${resetTarget.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ password: resetForm.password }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Request failed')
      showToast(`Password reset for ${resetTarget.fullName}`, 'success')
      setResetTarget(null)
      setResetForm(emptyResetForm)
      loadAdmins()
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Request failed', 'error')
    } finally {
      setResetting(false)
    }
  }

  return (
    <SuperAdminLayout>
      <div className="space-y-6">

        {/* ── Premium page header ── */}
        <div
          className="rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md p-5 sm:p-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Admin Management</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Create, edit, and manage administrator accounts
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadAdmins}
                className="btn btn-sm btn-ghost"
                style={{ color: 'var(--color-text-muted)' }}
                title="Refresh"
              >
                <RefreshCw size={16} />
              </button>
              <button
                onClick={openCreate}
                className="btn btn-sm font-semibold gap-2"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', color: '#fff', border: 'none' }}
              >
                <Plus size={16} /> Create Admin
              </button>
            </div>
          </div>

          {/* Search + Status filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4">
            <div className="relative max-w-sm w-full sm:max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                className="input input-sm w-full pl-9"
                placeholder="Search by name, email, role, or phone..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              />
            </div>
            <div
              className="inline-flex items-center gap-1 p-1 rounded-xl"
              style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
            >
              {statusOptions.map((opt) => {
                const active = statusFilter === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => { setStatusFilter(opt.value); setCurrentPage(1) }}
                    className={`btn btn-xs btn-ghost ${active ? 'font-semibold' : ''}`}
                    style={{
                      color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    }}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Main table card ── */}
        <div className="card shadow-sm rounded-2xl"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          {loading ? (
            /* ── Premium skeleton ── */
            <div className="p-4 sm:p-6">
              <div className="space-y-3">
                <div className="h-3 rounded animate-pulse" style={{ backgroundColor: 'var(--color-border)', width: '60%' }} />
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="h-3 rounded animate-pulse" style={{ backgroundColor: 'var(--color-border)', width: '100%' }} />
                ))}
              </div>
            </div>
          ) : error ? (
            /* ── Professional retry card ── */
            <div className="p-6 flex flex-col items-center text-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shrink-0"
                style={{ backgroundColor: 'rgba(226,75,74,0.08)', color: 'var(--color-error)' }}
              >
                <AlertTriangle size={22} />
              </div>
              <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                Something went wrong
              </h3>
              <p className="text-xs mb-4 max-w-sm" style={{ color: 'var(--color-text-muted)' }}>
                {error}
              </p>
              <button
                onClick={loadAdmins}
                className="btn btn-sm font-semibold gap-1.5"
                style={{ background: 'var(--color-accent)', color: '#fff', border: 'none' }}
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            /* ── Professional empty illustration ── */
            <div className="card-body items-center text-center py-14">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}
              >
                <Shield size={32} />
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {search || statusFilter !== 'all'
                  ? 'No admins match your search or filters.'
                  : 'No admin accounts have been created yet.'}
              </p>
              {!search && statusFilter === 'all' && (
                <button
                  onClick={openCreate}
                  className="btn btn-sm btn-ghost mt-3 gap-1.5"
                  style={{ color: 'var(--color-accent)' }}
                >
                  <Plus size={14} />
                  Create first admin
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="table table-sm w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                      {['Name', 'Email', 'Role', 'Status', 'Created At', 'Last Login', 'Actions'].map((h) => (
                        <th
                          key={h}
                          className="text-xs font-semibold uppercase tracking-wider text-left py-3 px-4"
                          style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.map((admin) => (
                      <tr
                        key={admin.id}
                        style={{ borderBottom: '1px solid var(--color-border)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-accent-pale)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                              style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}
                            >
                              {admin.fullName?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                              {admin.fullName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text)' }}>{admin.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className="badge badge-sm font-semibold gap-1"
                            style={{
                              backgroundColor: `${roleColor(admin.role)}20`,
                              color: roleColor(admin.role),
                              border: 'none',
                            }}
                          >
                            <Shield size={10} />
                            {admin.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`badge badge-sm font-semibold ${admin.isActive ? 'badge-success' : 'badge-error'}`}
                            style={{ border: 'none' }}
                          >
                            {admin.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                          {formatDate(admin.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                          {admin.lastLogin ? formatDate(admin.lastLogin) : 'Never'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setViewTarget(admin)}
                              className="btn btn-ghost btn-xs"
                              style={{ color: 'var(--color-accent)' }}
                              title="View"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => openEdit(admin)}
                              className="btn btn-ghost btn-xs"
                              style={{ color: 'var(--color-accent)' }}
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setSuspendTarget(admin)}
                              className="btn btn-ghost btn-xs"
                              style={{ color: admin.isActive ? 'var(--color-warning, #f59e0b)' : '#22c55e' }}
                              title={admin.isActive ? 'Suspend' : 'Reactivate'}
                            >
                              {admin.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                            </button>
                            <button
                              onClick={() => setResetTarget(admin)}
                              className="btn btn-ghost btn-xs"
                              style={{ color: 'var(--color-warning, #f59e0b)' }}
                              title="Reset password"
                            >
                              <Key size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(admin)}
                              className="btn btn-ghost btn-xs"
                              style={{ color: 'var(--color-error)' }}
                              title="Delete"
                            >
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
                {pageData.map((admin) => (
                  <div key={admin.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                          style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}
                        >
                          {admin.fullName?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{admin.fullName}</p>
                          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{admin.email}</p>
                        </div>
                      </div>
                      <span
                        className={`badge badge-sm font-semibold ${admin.isActive ? 'badge-success' : 'badge-error'}`}
                        style={{ border: 'none' }}
                      >
                        {admin.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </div>

                    <div className="flex items-center flex-wrap gap-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      <span
                        className="badge badge-sm"
                        style={{
                          backgroundColor: `${roleColor(admin.role)}20`,
                          color: roleColor(admin.role),
                          border: 'none',
                        }}
                      >
                        <Shield size={10} />
                        {admin.role}
                      </span>
                      <span>•</span>
                      <span>Created: {formatDate(admin.createdAt)}</span>
                      <span>•</span>
                      <span>Last login: {admin.lastLogin ? formatDate(admin.lastLogin) : 'Never'}</span>
                    </div>

                    <div className="flex items-center gap-1 pt-1">
                      <button
                        onClick={() => setViewTarget(admin)}
                        className="btn btn-ghost btn-xs"
                        style={{ color: 'var(--color-accent)' }}
                        title="View"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => openEdit(admin)}
                        className="btn btn-ghost btn-xs"
                        style={{ color: 'var(--color-accent)' }}
                        title="Edit"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setSuspendTarget(admin)}
                        className="btn btn-ghost btn-xs"
                        style={{ color: admin.isActive ? 'var(--color-warning, #f59e0b)' : '#22c55e' }}
                        title={admin.isActive ? 'Suspend' : 'Reactivate'}
                      >
                        {admin.isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                      </button>
                      <button
                        onClick={() => setResetTarget(admin)}
                        className="btn btn-ghost btn-xs"
                        style={{ color: 'var(--color-warning, #f59e0b)' }}
                        title="Reset password"
                      >
                        <Key size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(admin)}
                        className="btn btn-ghost btn-xs"
                        style={{ color: 'var(--color-error)' }}
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 px-4 sm:px-6"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <div className="flex items-center gap-2 text-sm">
                  <span style={{ color: 'var(--color-text-muted)' }}>Rows per page:</span>
                  <select
                    className="select select-sm select-bordered"
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1) }}
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  >
                    {[10, 20, 50, 100].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {total === 0
                    ? '0–0 of 0'
                    : `${(activePage - 1) * pageSize + 1}–${Math.min(activePage * pageSize, total)} of ${total}`}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={activePage === 1}
                    className="btn btn-ghost btn-xs"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Page {activePage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={activePage === totalPages}
                    className="btn btn-ghost btn-xs"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {filtered.length} admin{filtered.length !== 1 ? 's' : ''} total
        </p>

        {/* ── Create / Edit Modal ── */}
        {modalOpen && (
          <div className="modal modal-open" onClick={() => !submitting && setModalOpen(false)}>
            <div
              className="modal-box max-w-lg p-0"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                  {editingId ? 'Edit Admin' : 'Create Admin'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="btn btn-ghost btn-xs"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                {/* Full Name */}
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Full name *</legend>
                  <input
                    type="text"
                    className={`input input-sm w-full ${formErrors.fullName ? 'input-error' : ''}`}
                    placeholder="Admin name"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                  {formErrors.fullName && (
                    <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{formErrors.fullName}</p>
                  )}
                </fieldset>

                {/* Email */}
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Email *</legend>
                  <input
                    type="email"
                    className={`input input-sm w-full ${formErrors.email ? 'input-error' : ''}`}
                    placeholder="admin@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                  {formErrors.email && (
                    <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{formErrors.email}</p>
                  )}
                </fieldset>

                {/* Phone */}
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Phone (optional)</legend>
                  <input
                    type="tel"
                    className={`input input-sm w-full ${formErrors.phone ? 'input-error' : ''}`}
                    placeholder="+880..."
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                  {formErrors.phone && (
                    <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{formErrors.phone}</p>
                  )}
                </fieldset>

                {/* Password */}
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">
                    Password {!editingId ? '*' : '(leave blank to keep the current one)'}
                  </legend>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`input input-sm w-full pr-10 ${formErrors.password ? 'input-error' : ''}`}
                      placeholder={editingId ? '••••••••' : 'Minimum 6 characters'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--color-text-muted)' }}
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{formErrors.password}</p>
                  )}
                </fieldset>

                {/* Confirm Password */}
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">
                    Confirm password {!editingId ? '*' : ''}
                  </legend>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`input input-sm w-full ${formErrors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                  {formErrors.confirmPassword && (
                    <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{formErrors.confirmPassword}</p>
                  )}
                </fieldset>

                {/* Role badge */}
                <div className="flex items-center gap-2 px-1">
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>Role:</span>
                  <span
                    className="badge badge-sm font-bold"
                    style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)', border: 'none' }}
                  >
                    admin
                  </span>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2 pb-1">
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    style={{ color: 'var(--color-text-muted)' }}
                    onClick={() => setModalOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sm font-semibold"
                    disabled={submitting}
                    style={{
                      background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
                      color: '#fff',
                      border: 'none',
                      opacity: submitting ? 0.7 : 1,
                    }}
                  >
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : editingId ? 'Save Changes' : 'Create Admin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── View Modal ── */}
        {viewTarget && (
          <div className="modal modal-open" onClick={() => setViewTarget(null)}>
            <div
              className="modal-box max-w-lg p-0"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Admin Details</h3>
                <button
                  onClick={() => setViewTarget(null)}
                  className="btn btn-ghost btn-xs"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shrink-0"
                    style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}
                  >
                    {viewTarget.fullName?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div>
                    <p className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{viewTarget.fullName}</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{viewTarget.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-xs" style={{ color: 'var(--color-text-muted)' }}>Username</span>
                    <p style={{ color: 'var(--color-text)' }}>{viewTarget.username || '—'}</p>
                  </div>
                  <div>
                    <span className="block text-xs" style={{ color: 'var(--color-text-muted)' }}>Role</span>
                    <p style={{ color: 'var(--color-text)' }}>{viewTarget.role || 'admin'}</p>
                  </div>
                  <div>
                    <span className="block text-xs" style={{ color: 'var(--color-text-muted)' }}>Status</span>
                    <p style={{ color: 'var(--color-text)' }}>{viewTarget.isActive ? 'Active' : 'Suspended'}</p>
                  </div>
                  <div>
                    <span className="block text-xs" style={{ color: 'var(--color-text-muted)' }}>Email verified</span>
                    <p style={{ color: 'var(--color-text)' }}>{viewTarget.emailVerified ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="block text-xs" style={{ color: 'var(--color-text-muted)' }}>Created At</span>
                    <p style={{ color: 'var(--color-text)' }}>{formatDate(viewTarget.createdAt)}</p>
                  </div>
                  <div>
                    <span className="block text-xs" style={{ color: 'var(--color-text-muted)' }}>Last Login</span>
                    <p style={{ color: 'var(--color-text)' }}>{viewTarget.lastLogin ? formatDate(viewTarget.lastLogin) : 'Never'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Reset Password Modal ── */}
        {resetTarget && (
          <div className="modal modal-open" onClick={() => !resetting && setResetTarget(null)}>
            <div
              className="modal-box max-w-sm p-0"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Reset Password</h3>
                <button
                  onClick={() => setResetTarget(null)}
                  className="btn btn-ghost btn-xs"
                  style={{ color: 'var(--color-text-muted)' }}
                  disabled={resetting}
                >
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleResetPassword} className="px-5 py-4 space-y-4">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">New password *</legend>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`input input-sm w-full pr-10 ${resetError ? 'input-error' : ''}`}
                      placeholder="Minimum 6 characters"
                      value={resetForm.password}
                      onChange={(e) => setResetForm({ ...resetForm, password: e.target.value })}
                      style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                      disabled={resetting}
                    />
                  </div>
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Confirm password *</legend>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`input input-sm w-full pr-10 ${resetError ? 'input-error' : ''}`}
                      placeholder="Re-enter password"
                      value={resetForm.confirm}
                      onChange={(e) => setResetForm({ ...resetForm, confirm: e.target.value })}
                      style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                      disabled={resetting}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--color-text-muted)' }}
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </fieldset>
                {resetError && (
                  <p className="text-xs" style={{ color: 'var(--color-error)' }}>{resetError}</p>
                )}
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    style={{ color: 'var(--color-text-muted)' }}
                    onClick={() => setResetTarget(null)}
                    disabled={resetting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sm font-semibold"
                    disabled={resetting}
                    style={{
                      background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
                      color: '#fff',
                      border: 'none',
                      opacity: resetting ? 0.7 : 1,
                    }}
                  >
                    {resetting ? <Loader2 size={14} className="animate-spin" /> : 'Reset Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Suspend / Reactivate Confirmation ── */}
        {suspendTarget && (
          <div className="modal modal-open" onClick={() => !suspending && setSuspendTarget(null)}>
            <div
              className="modal-box max-w-sm"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center gap-3 py-2">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: suspendTarget.isActive ? 'rgba(226,75,74,0.08)' : 'rgba(34,197,94,0.10)' }}
                >
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
                <button
                  className="btn btn-sm btn-ghost"
                  style={{ color: 'var(--color-text-muted)' }}
                  onClick={() => setSuspendTarget(null)}
                  disabled={suspending}
                >
                  Cancel
                </button>
                <button
                  className={`btn btn-sm font-semibold ${suspendTarget.isActive ? 'btn-error' : 'btn-success'}`}
                  onClick={handleSuspend}
                  disabled={suspending}
                >
                  {suspending ? <Loader2 size={14} className="animate-spin" /> : suspendTarget.isActive ? 'Suspend' : 'Reactivate'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Delete Confirmation ── */}
        {deleteTarget && (
          <div className="modal modal-open" onClick={() => !deleting && setDeleteTarget(null)}>
            <div
              className="modal-box max-w-sm"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center gap-3 py-2">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(226,75,74,0.08)' }}
                >
                  <Trash2 size={24} style={{ color: 'var(--color-error)' }} />
                </div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Delete Admin?</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  This action is permanent. <strong>{deleteTarget.fullName}</strong> ({deleteTarget.email}) will be permanently removed.
                </p>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                <button
                  className="btn btn-sm btn-ghost"
                  style={{ color: 'var(--color-text-muted)' }}
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-sm btn-error font-semibold"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Toast ── */}
        {toast && (
          <div className="toast toast-end toast-bottom z-50">
            <div
              className={`alert ${toast.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-sm font-semibold`}
              style={{ border: 'none' }}
            >
              {toast.message}
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  )
}
