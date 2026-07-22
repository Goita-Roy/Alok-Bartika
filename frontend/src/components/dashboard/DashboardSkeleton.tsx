export function DashboardSkeleton() {
  return (
    <div className="rounded-2xl p-3 sm:p-4 lg:p-6"
      style={{ background: 'linear-gradient(180deg, rgba(10,74,63,0.3) 0%, rgba(4,52,44,0.1) 100%)' }}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-6">
        <div className="hidden lg:block">
          <div className="h-[calc(100vh-3rem)] rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
        </div>
        <main className="min-h-[70vh] animate-pulse space-y-4">
          <div className="h-20 rounded-2xl" style={{ backgroundColor: 'var(--color-border)' }} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="h-36 rounded-2xl" style={{ backgroundColor: 'var(--color-border)' }} />
            <div className="h-36 rounded-2xl" style={{ backgroundColor: 'var(--color-border)' }} />
          </div>
          <div className="h-40 rounded-2xl" style={{ backgroundColor: 'var(--color-border)' }} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="h-32 rounded-2xl" style={{ backgroundColor: 'var(--color-border)' }} />
            <div className="h-64 rounded-2xl" style={{ backgroundColor: 'var(--color-border)' }} />
          </div>
          <div className="h-40 rounded-2xl" style={{ backgroundColor: 'var(--color-border)' }} />
          <div className="h-28 rounded-2xl" style={{ backgroundColor: 'var(--color-border)' }} />
        </main>
      </div>
    </div>
  )
}
