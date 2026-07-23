import { useNavigate } from 'react-router-dom'
import { ShieldOff, ArrowLeft } from 'lucide-react'

export function ForbiddenPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(226,75,74,0.10)' }}>
            <ShieldOff size={40} style={{ color: 'var(--color-error)' }} />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-black" style={{ color: 'var(--color-text)', opacity: 0.15 }}>403</h1>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Access Denied</h2>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            You don't have permission to access this page.
          </p>
        </div>
        <button
          onClick={() => navigate('/', { replace: true })}
          className="btn btn-sm gap-2"
          style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
          <ArrowLeft size={16} />
          Go Home
        </button>
      </div>
    </div>
  )
}
