import { ArrowLeft } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

export function BackButton() {
  const navigate = useNavigate()
  const location = useLocation()

  // The Home Page (/) renders its own layout and must not show the shared
  // "পেছনে" button. Every other page keeps the existing behavior unchanged.
  if (location.pathname === '/') return null

  const handleClick = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/dashboard', { replace: true })
    }
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 text-sm font-bold transition-opacity duration-200 hover:opacity-70 mb-4"
      style={{ color: '#0F766E' }}
    >
      <ArrowLeft size={18} />
      <span style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>পেছনে</span>
    </button>
  )
}
