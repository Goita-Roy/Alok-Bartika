import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'

type LessonListItem = {
  id: string
  title: string
  order: number
  locked: boolean
  completed: boolean
}

export function CourseDetailPage() {
  const { courseId } = useParams()
  const [lessons, setLessons] = useState<LessonListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!courseId) return
    let mounted = true
    setLoading(true)
    setError(null)
    api
      .get<{ ok: boolean; lessons: LessonListItem[] }>(`/api/courses/${courseId}/lessons`)
      .then((r) => {
        if (mounted) setLessons(r.data.lessons ?? [])
      })
      .catch((e) => {
        if (mounted) setError(e?.response?.data?.error ?? e?.message ?? 'পাঠ লোড করতে ব্যর্থ')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [courseId])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">পাঠসমূহ</h2>
          <p className="mt-1 text-sm text-zinc-300">আগের পাঠ শেষ করলে লক করা পাঠ খুলে যাবে।</p>
        </div>
        <Link className="text-sm text-white underline underline-offset-4" to="/courses">
          কোর্সে ফিরুন
        </Link>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          <div className="h-14 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
          <div className="h-14 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
          <div className="h-14 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((l) => (
            <div key={l.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {l.order + 1}. {l.title}
                  </div>
                  <div className="mt-1 text-xs text-zinc-300">
                    {l.completed ? 'সম্পন্ন' : l.locked ? 'লক করা' : 'প্রস্তুত'}
                  </div>
                </div>
                {l.locked ? (
                  <span className="rounded-full border border-white/10 bg-zinc-950/40 px-3 py-1 text-xs text-zinc-300">
                    লক করা
                  </span>
                ) : (
                  <Link
                    to={`/lessons/${l.id}`}
                    className="rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-sky-400"
                  >
                    খুলুন
                  </Link>
                )}
              </div>
            </div>
          ))}
          {!lessons.length ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-zinc-300">
              এখনো কোনো পাঠ নেই।
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

