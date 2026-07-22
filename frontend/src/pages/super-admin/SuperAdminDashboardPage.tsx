import { SuperAdminLayout } from '../../components/super-admin/SuperAdminLayout'

export function SuperAdminDashboardPage() {
  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
            <p className="text-sm opacity-60">System-wide overview</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat bg-base-100 shadow-sm rounded-xl border border-base-200">
            <div className="stat-figure text-primary"><span className="text-2xl">🏢</span></div>
            <div className="stat-title">Total Admins</div>
            <div className="stat-value text-primary">—</div>
            <div className="stat-desc">Loading...</div>
          </div>
          <div className="stat bg-base-100 shadow-sm rounded-xl border border-base-200">
            <div className="stat-figure text-secondary"><span className="text-2xl">👥</span></div>
            <div className="stat-title">Total Students</div>
            <div className="stat-value text-secondary">—</div>
            <div className="stat-desc">Loading...</div>
          </div>
          <div className="stat bg-base-100 shadow-sm rounded-xl border border-base-200">
            <div className="stat-figure text-accent"><span className="text-2xl">📊</span></div>
            <div className="stat-title">System Health</div>
            <div className="stat-value text-accent">—</div>
            <div className="stat-desc">Loading...</div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body">
            <h2 className="card-title">
              <span className="text-xl">🛡️</span> Recent Activity
            </h2>
            <p className="text-sm opacity-60 py-8 text-center">No recent activity to display.</p>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  )
}
