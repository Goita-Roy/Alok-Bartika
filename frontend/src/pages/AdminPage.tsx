import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { API_BASE_URL } from '../config/api'
import { useAuth } from '../context/AuthContext'

interface UserProfile {
  _id: string
  name: string
  email: string
  role: string
  xp: number
  level: number
  completedLessons: string[]
}

interface Course {
  _id: string
  title: string
  level: string
}

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<'students' | 'courses' | 'analytics'>('students')
  const { token } = useAuth()
  const queryClient = useQueryClient()

  // Fetch Students
  const { data: studentsData, isLoading: isLoadingStudents } = useQuery<{ data: UserProfile[] }>({
    queryKey: ['admin-students'],
    queryFn: async () => {
      if (!token) throw new Error('Missing auth token')
      const res = await fetch(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch students')
      return res.json()
    },
    enabled: !!token && (activeTab === 'students' || activeTab === 'analytics')
  })

  // Fetch Courses
  const { data: coursesData, isLoading: isLoadingCourses } = useQuery<{ data: Course[] }>({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/courses`)
      if (!res.ok) throw new Error('Failed to fetch courses')
      return res.json()
    },
    enabled: activeTab === 'courses'
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!token) throw new Error('Missing auth token')
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to delete user')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] })
    }
  })

  const handleExportCSV = async () => {
    if (!token) throw new Error('Missing auth token')
    const response = await fetch(`${API_BASE_URL}/tests/export`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'alokbartika_results.csv'
    a.click()
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-base-100 p-8 rounded-3xl shadow-xl border border-base-200">
        <div>
          <h1 className="text-3xl font-black text-base-content tracking-tight mb-1">Command Center</h1>
          <p className="text-sm font-medium opacity-50 uppercase tracking-widest">Platform Administration</p>
        </div>
        
        <div className="tabs tabs-boxed bg-base-200 p-1 font-black">
          {(['students', 'courses', 'analytics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab tab-lg uppercase text-xs tracking-widest ${activeTab === tab ? 'tab-active' : 'opacity-50'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'students' && (
        <div className="card bg-base-100 shadow-2xl border border-base-200 overflow-hidden">
          <div className="p-8 border-b border-base-200 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black text-base-content uppercase tracking-tighter">Student Roster</h2>
              <div className="badge badge-primary font-black">{studentsData?.data.length || 0} TOTAL</div>
            </div>
            <button 
              onClick={handleExportCSV}
              className="btn btn-success btn-sm font-black text-xs shadow-lg shadow-success/20"
            >
              📥 EXPORT PERFORMANCE DATA
            </button>
          </div>
          
          {isLoadingStudents ? (
            <div className="p-20 text-center"><span className="loading loading-bars loading-lg text-primary"></span></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead className="bg-base-200">
                  <tr className="text-xs font-black uppercase tracking-widest opacity-60">
                    <th className="py-5">Name</th>
                    <th>Email</th>
                    <th>Level</th>
                    <th>Lessons</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="font-medium">
                  {studentsData?.data.map((student) => (
                    <tr key={student._id} className="hover">
                      <td className="font-black text-base-content">{student.name}</td>
                      <td className="opacity-60">{student.email}</td>
                      <td>
                        <div className="badge badge-outline font-black text-xs">LVL {student.level}</div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-black">{student.completedLessons.length}</span>
                          <progress className="progress progress-primary w-20" value={student.completedLessons.length} max="20"></progress>
                        </div>
                      </td>
                      <td className="text-right">
                        <button 
                          onClick={() => confirm('Permanently remove this student?') && deleteUserMutation.mutate(student._id)}
                          className="btn btn-ghost btn-xs text-error font-black hover:bg-error/10"
                        >
                          DELETE
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'courses' && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoadingCourses ? (
             <div className="col-span-full p-20 text-center"><span className="loading loading-dots loading-lg text-secondary"></span></div>
          ) : (
            coursesData?.data.map((course) => (
              <div key={course._id} className="card bg-base-100 shadow-xl border border-base-200 group hover:-translate-y-2 transition-all">
                <div className="card-body">
                  <div className="badge badge-secondary badge-xs font-black uppercase mb-2 tracking-widest">{course.level}</div>
                  <h3 className="card-title text-2xl font-black text-base-content leading-tight">{course.title}</h3>
                  <div className="card-actions justify-end mt-8 border-t border-base-200 pt-4">
                    <button className="btn btn-ghost btn-xs font-black uppercase tracking-widest opacity-50 hover:opacity-100">Lessons</button>
                    <button className="btn btn-ghost btn-xs font-black uppercase tracking-widest opacity-50 hover:opacity-100 text-primary">Edit</button>
                  </div>
                </div>
              </div>
            ))
          )}
          <button className="card bg-base-200 border-4 border-dashed border-base-300 shadow-none hover:bg-base-300 hover:border-primary/50 transition-all cursor-pointer group py-12">
            <div className="card-body items-center text-center justify-center">
              <div className="text-5xl mb-4 group-hover:scale-125 transition-transform">➕</div>
              <p className="font-black text-lg uppercase tracking-widest opacity-50 group-hover:opacity-100">Add Course</p>
            </div>
          </button>
        </section>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="stats shadow-xl bg-base-100">
              <div className="stat">
                <div className="stat-figure text-primary text-3xl">👥</div>
                <div className="stat-title font-black uppercase text-[10px] tracking-widest">Students</div>
                <div className="stat-value text-primary">{studentsData?.data.length || 0}</div>
              </div>
            </div>
            <div className="stats shadow-xl bg-base-100">
              <div className="stat">
                <div className="stat-figure text-secondary text-3xl">🎯</div>
                <div className="stat-title font-black uppercase text-[10px] tracking-widest">Activity</div>
                <div className="stat-value text-secondary">{studentsData?.data.reduce((acc, s) => acc + s.completedLessons.length, 0) || 0}</div>
                <div className="stat-desc font-bold">Lessons completed</div>
              </div>
            </div>
            <div className="stats shadow-xl bg-base-100">
              <div className="stat">
                <div className="stat-figure text-accent text-3xl">⭐</div>
                <div className="stat-title font-black uppercase text-[10px] tracking-widest">Total XP</div>
                <div className="stat-value text-accent">
                   {Math.round((studentsData?.data.reduce((acc, s) => acc + s.xp, 0) || 0) / 1000)}k
                </div>
                <div className="stat-desc font-bold">Platform experience</div>
              </div>
            </div>
            <div className="stats shadow-xl bg-base-100">
              <div className="stat">
                <div className="stat-figure text-success text-3xl">🚀</div>
                <div className="stat-title font-black uppercase text-[10px] tracking-widest">Efficiency</div>
                <div className="stat-value text-success">98%</div>
                <div className="stat-desc font-bold">System stability</div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-2xl border border-base-200 p-8 sm:p-12">
            <h3 className="text-2xl font-black text-base-content uppercase tracking-tighter mb-10 flex items-center gap-4">
               <span className="text-4xl">📊</span> PERFORMANCE DISTRIBUTION
            </h3>
            <div className="flex items-end gap-3 h-64 border-b-4 border-base-200 px-4">
              {studentsData?.data.slice(0, 15).map((s, idx) => {
                const avgScore = s.completedLessons.length > 0 ? (s.xp / (s.completedLessons.length * 100)) * 10 : 0
                const height = Math.min(100, (avgScore / 10) * 100)
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-4 group relative h-full justify-end">
                    <div className="absolute -top-10 bg-neutral text-neutral-content text-[10px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                       {Math.round(height)}%
                    </div>
                    <div 
                      className="w-full bg-primary rounded-t-xl hover:bg-secondary transition-all cursor-help shadow-lg" 
                      style={{ height: `${height}%` }}
                    ></div>
                    <div className="text-[10px] font-black uppercase tracking-tighter opacity-40 rotate-45 origin-left truncate w-12 pb-8">
                      {s.name.split(' ')[0]}
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="mt-20 text-center text-xs font-black opacity-30 uppercase tracking-[0.3em]">Aggregate Student Success Metric</p>
          </div>
        </div>
      )}
    </div>
  )
}
