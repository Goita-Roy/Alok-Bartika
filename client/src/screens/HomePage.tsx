import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold">Alokbartika Platform</h1>
        <p className="mt-2 text-sm text-zinc-300">
          Frontend (Vite + React + TS + Tailwind) talking to an Express API.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          to="/health"
          className="rounded-xl border border-white/10 bg-zinc-900/40 p-5 text-sm hover:bg-zinc-900/70"
        >
          <div className="font-semibold">Check API health</div>
          <div className="mt-1 text-zinc-300">Calls `GET /api/health` via Axios.</div>
        </Link>

        <Link
          to="/signup"
          className="rounded-xl border border-white/10 bg-zinc-900/40 p-5 text-sm hover:bg-zinc-900/70"
        >
          <div className="font-semibold">Create an account</div>
          <div className="mt-1 text-zinc-300">Signup → login → protected dashboard.</div>
        </Link>
      </div>
    </div>
  )
}

