import { AdminLayout } from '../../components/admin/AdminLayout'

export function AdminLessonsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Lesson Management</h1>
            <p className="text-sm opacity-60">Create and manage lessons</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body items-center text-center py-16">
            <span className="text-5xl mb-4">📝</span>
            <h3 className="text-lg font-semibold">Lesson Management</h3>
            <p className="text-sm opacity-60 max-w-md">Build lesson content, activities, and reading materials.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
