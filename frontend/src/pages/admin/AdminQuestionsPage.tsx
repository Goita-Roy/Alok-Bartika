import { AdminLayout } from '../../components/admin/AdminLayout'

export function AdminQuestionsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Question & Exam Management</h1>
            <p className="text-sm opacity-60">Manage exam questions and assessments</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body items-center text-center py-16">
            <span className="text-5xl mb-4">❓</span>
            <h3 className="text-lg font-semibold">Question & Exam Management</h3>
            <p className="text-sm opacity-60 max-w-md">Create exam papers, question banks, and grading rubrics.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
