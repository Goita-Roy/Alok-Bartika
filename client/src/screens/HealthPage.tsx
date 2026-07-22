import { useEffect, useState } from 'react'
import { api } from '../lib/api'

type HealthResponse = {
  ok: boolean
  service: string
  time: string
}

export function HealthPage() {
  const [data, setData] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    api
      .get<HealthResponse>('/api/health')
      .then((res) => {
        if (mounted) setData(res.data)
      })
      .catch((e) => {
        if (mounted) setError(e?.message ?? 'Request failed')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">API Health</h2>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
        {loading && <div className="text-zinc-300">Loading…</div>}
        {error && <div className="text-red-300">{error}</div>}
        {data && (
          <pre className="overflow-auto text-zinc-100">{JSON.stringify(data, null, 2)}</pre>
        )}
      </div>
    </div>
  )
}

