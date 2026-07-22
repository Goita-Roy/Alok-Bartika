import { SuperAdminLayout } from '../../components/super-admin/SuperAdminLayout'

export function SuperAdminSecurityPage() {
  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Security & Audit Logs</h1>
            <p className="text-sm opacity-60">Monitor platform security and activity</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body items-center text-center py-16">
            <span className="text-5xl mb-4">🔒</span>
            <h3 className="text-lg font-semibold">Security & Audit Logs</h3>
            <p className="text-sm opacity-60 max-w-md">Review security events, login history, and system audit trails.</p>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  )
}
