import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

type Course = {
  _id: string
  title: string
  description: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
}

function levelPill(level: Course['level']) {
  if (level === 'Beginner') return 'border-green-500/30 bg-green-500/15 text-green-200'
  if (level === 'Intermediate') return 'border-amber-500/30 bg-amber-500/15 text-amber-200'
  return 'border-violet-500/30 bg-violet-500/15 text-violet-200'
}

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    api
      .get<{ ok: boolean; courses: Course[] }>('/api/courses')
      .then((r) => {
        if (mounted) setCourses(r.data.courses ?? [])
      })
      .catch((e) => {
        if (mounted) setError(e?.response?.data?.error ?? e?.message ?? 'কোর্স লোড করতে ব্যর্থ')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">কোর্সসমূহ</h2>
          <p className="mt-1 text-sm text-zinc-300">একটি কোর্স বেছে নিন এবং শেখা শুরু করুন।</p>
        </div>
        <Link className="text-sm text-white underline underline-offset-4" to="/dashboard">
          ড্যাশবোর্ডে ফিরুন
        </Link>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>
      ) : null}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-28 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
          <div className="h-28 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((c) => (
            <Link
              key={c._id}
              to={`/courses/${c._id}`}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold">{c.title}</div>
                  <div className="mt-1 text-sm text-zinc-300">{c.description}</div>
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] ${levelPill(c.level)}`}>
                  {c.level}
                </span>
              </div>
            </Link>
          ))}
          {!courses.length ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-zinc-300 md:col-span-2">
              এখনো কোনো কোর্স নেই।
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

