import { Link, Outlet } from 'react-router-dom'
import { useAuthStore } from './state/authStore'
import { useEffect } from 'react'
import { useUiStore } from './state/uiStore'

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const lowBandwidth = useUiStore((s) => s.lowBandwidth)
  const hydrateUi = useUiStore((s) => s.hydrateUi)
  const toggleLowBandwidth = useUiStore((s) => s.toggleLowBandwidth)

  useEffect(() => {
    hydrate()
    hydrateUi()
  }, [hydrate, hydrateUi])

  return (
    <div className="min-h-full">
      <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="text-sm font-semibold tracking-wide">
            alokbartika-platform
          </Link>
          <nav className="flex flex-wrap items-center gap-3 text-sm text-zinc-300">
            <Link className="hover:text-white" to="/">
              Home
            </Link>
            {user ? (
              <>
                <Link className="hover:text-white" to={user.role === 'admin' ? '/admin' : '/dashboard'}>
                  Dashboard
                </Link>
                <button className="hover:text-white" type="button" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="hover:text-white" to="/login">
                  Login
                </Link>
                <Link className="hover:text-white" to="/signup">
                  Signup
                </Link>
              </>
            )}
            <Link className="hover:text-white" to="/health">
              API Health
            </Link>
            <button
              className={`rounded-md border px-2 py-1 text-xs ${lowBandwidth ? 'border-emerald-400/60 text-emerald-300' : 'border-white/20 text-zinc-300'}`}
              type="button"
              onClick={toggleLowBandwidth}
            >
              Low bandwidth: {lowBandwidth ? 'On' : 'Off'}
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-white/10 py-6">
        <div className="mx-auto max-w-5xl px-4 text-xs text-zinc-400">
          API: <code className="rounded bg-white/5 px-2 py-1">{import.meta.env.VITE_API_URL || 'not set'}</code>
        </div>
      </footer>
    </div>
  )
}
