import { SuperAdminLayout } from '../../components/super-admin/SuperAdminLayout'

export function SuperAdminRolesPage() {
  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Role & Permissions</h1>
            <p className="text-sm opacity-60">Define roles and access levels</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body items-center text-center py-16">
            <span className="text-5xl mb-4">🔑</span>
            <h3 className="text-lg font-semibold">Role & Permissions</h3>
            <p className="text-sm opacity-60 max-w-md">Configure user roles and granular permission sets.</p>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  )
}
