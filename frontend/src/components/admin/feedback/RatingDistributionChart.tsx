import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface RatingDistributionChartProps {
  ratingDistribution: { [key: number]: number } | undefined
  loading?: boolean
  error?: string | null
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Average',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
}

const RATING_COLORS: Record<number, string> = {
  1: '#dc2626',
  2: '#ea580c',
  3: '#d97706',
  4: '#2563eb',
  5: '#15803d',
}

export function RatingDistributionChart({
  ratingDistribution,
  loading = false,
  error = null,
}: RatingDistributionChartProps) {
  if (loading) {
    return (
      <div className="card shadow-sm rounded-2xl border-0 overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div className="card-body p-6">
          <div className="flex items-center justify-center gap-3 py-12">
            <Loader2 className="animate-spin" size={24} style={{ color: 'var(--color-accent)' }} />
            <span className="font-semibold" style={{ color: 'var(--color-text-muted)' }}>Loading chart...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card shadow-sm rounded-2xl border-0 overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div className="card-body p-6">
          <div className="flex items-center justify-center gap-3 py-12">
            <AlertTriangle size={24} style={{ color: '#dc2626' }} />
            <span className="font-semibold" style={{ color: 'var(--color-text-muted)' }}>{error}</span>
          </div>
        </div>
      </div>
    )
  }

  const chartData = [1, 2, 3, 4, 5].map((rating) => ({
    rating: RATING_LABELS[rating],
    count: ratingDistribution?.[rating] || 0,
    fill: RATING_COLORS[rating],
  }))

  const totalCount = chartData.reduce((sum, item) => sum + item.count, 0)

  if (totalCount === 0) {
    return (
      <div className="card shadow-sm rounded-2xl border-0 overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div className="card-body p-6">
          <div className="flex items-center justify-center py-12">
            <span className="font-semibold" style={{ color: 'var(--color-text-muted)' }}>No rating data available</span>
          </div>
        </div>
      </div>
    )
  }

  const dataWithPercentage = chartData.map((item) => ({
    ...item,
    percentage: totalCount > 0 ? ((item.count / totalCount) * 100).toFixed(1) : '0.0',
  }))

  return (
    <div className="card shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl border-0 overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <div className="card-body p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            Rating Distribution
          </h3>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>
            Overall student ratings
          </p>
        </div>
        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataWithPercentage} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="rating"
                tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                axisLine={{ stroke: 'var(--color-border)' }}
                tickLine={{ stroke: 'var(--color-border)' }}
              />
              <YAxis
                tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                axisLine={{ stroke: 'var(--color-border)' }}
                tickLine={{ stroke: 'var(--color-border)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  color: 'var(--color-text)',
                }}
                itemStyle={{ color: 'var(--color-text)' }}
              />
              <Bar
                dataKey="count"
                radius={[8, 8, 0, 0]}
                animationDuration={800}
                animationEasing="ease-out"
              >
                <LabelList
                  dataKey="count"
                  position="top"
                  style={{ fill: 'var(--color-text)', fontSize: '12px', fontWeight: 'bold' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 grid grid-cols-5 gap-3">
          {dataWithPercentage.map((item) => (
            <div
              key={item.rating}
              className="text-center p-3 rounded-lg hover:scale-105 transition-transform duration-200"
              style={{ backgroundColor: 'var(--color-accent-pale)' }}
            >
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>
                {item.rating}
              </div>
              <div className="text-sm font-bold" style={{ color: item.fill }}>
                {item.percentage}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
