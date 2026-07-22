import { SuperAdminLayout } from '../../components/super-admin/SuperAdminLayout'

export function SuperAdminUsersPage() {
  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-sm opacity-60">Manage all platform users</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body items-center text-center py-16">
            <span className="text-5xl mb-4">👥</span>
            <h3 className="text-lg font-semibold">User Management</h3>
            <p className="text-sm opacity-60 max-w-md">View and manage students, teachers, and parents.</p>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  )
}
