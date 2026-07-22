export function SuperAdminLoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body gap-6 p-8">
          <div className="text-center space-y-2">
            <div className="text-4xl">🛡️</div>
            <h1 className="text-2xl font-bold">Super Admin Login</h1>
            <p className="text-sm opacity-60">Sign in to the super admin panel</p>
          </div>
          <div className="space-y-4">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Email</legend>
              <input type="email" className="input w-full" placeholder="superadmin@example.com" />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Password</legend>
              <input type="password" className="input w-full" placeholder="••••••••" />
            </fieldset>
            <button className="btn btn-primary w-full">Sign In</button>
          </div>
        </div>
      </div>
    </div>
  )
}
