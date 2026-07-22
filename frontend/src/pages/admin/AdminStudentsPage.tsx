import { AdminLayout } from '../../components/admin/AdminLayout'

export function AdminStudentsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Student Management</h1>
            <p className="text-sm opacity-60">Manage registered students</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body items-center text-center py-16">
            <span className="text-5xl mb-4">👥</span>
            <h3 className="text-lg font-semibold">Student Management</h3>
            <p className="text-sm opacity-60 max-w-md">View, edit, and manage student accounts and progress.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
