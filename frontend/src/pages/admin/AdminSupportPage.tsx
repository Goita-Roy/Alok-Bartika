import { AdminLayout } from '../../components/admin/AdminLayout'

export function AdminSupportPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Student Support</h1>
            <p className="text-sm opacity-60">Handle student inquiries and support tickets</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body items-center text-center py-16">
            <span className="text-5xl mb-4">💬</span>
            <h3 className="text-lg font-semibold">Student Support</h3>
            <p className="text-sm opacity-60 max-w-md">Respond to student messages and support requests.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
