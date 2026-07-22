import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { API_BASE_URL } from '../config/api'
import { useAuth } from '../context/AuthContext'

export function OnboardingPage() {
  const { user, token, loading } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    role: 'student',
    name: '',
    phone: '',
    dob: '',
    gender: 'prefer_not_to_say',
    district: '',
    class: '',
    guardianName: '',
    guardianPhone: '',
    guardianRelation: '',
  })

  useEffect(() => {
    if (user && !formData.name) {
      setFormData(prev => ({
        ...prev,
        name: user.fullName || ''
      }))
    }
  }, [user, formData.name])

  const createProfileMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('Missing auth token')
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: formData.role,
          name: formData.name,
          email: user?.email,
          phone: formData.phone,
          dob: formData.dob || undefined,
          gender: formData.gender,
          district: formData.district,
          class: formData.class,
          guardianInfo: {
            name: formData.guardianName,
            phone: formData.guardianPhone,
            relation: formData.guardianRelation,
          },
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to create profile')
      }
      return res.json()
    },
    onSuccess: (response: { data?: { role?: string } }) => {
      const role = response?.data?.role === 'admin' ? 'admin' : 'student'
      navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    },
  })

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <span className="loading loading-spinner loading-lg text-primary"></span>
      <p className="text-xl font-bold opacity-60">আপনার অ্যাকাউন্ট চালু করা হচ্ছে...</p>
    </div>
  )
  if (!token) return <Navigate to="/login" replace />

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createProfileMutation.mutate()
  }

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="card bg-base-100 shadow-2xl border border-base-200 overflow-hidden mb-10">
        <div className="bg-primary p-8 sm:p-12 text-primary-content relative">
          <div className="relative z-10">
            <h2 className="text-4xl font-black tracking-tight mb-2 uppercase">আপনার যাত্রা শুরু হচ্ছে</h2>
            <p className="text-lg opacity-80 font-medium max-w-lg">
              আলোকবর্তিকায় স্বাগতম, {user?.fullName || 'শিক্ষার্থী'}! আপনার অভিজ্ঞতা ব্যক্তিগতকরণের জন্য আরও কিছু বিবরণ প্রয়োজন।
            </p>
          </div>
          <div className="absolute top-0 right-0 p-10 opacity-10 text-9xl pointer-events-none">✨</div>
        </div>

        <div className="card-body p-8 sm:p-12">
          {createProfileMutation.isError && (
            <div className="alert alert-error shadow-md mb-8 font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{createProfileMutation.error?.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Personal Info Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👤</span>
                <h3 className="text-xl font-black uppercase tracking-tight">ব্যক্তিগত তথ্য</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control w-full">
                  <label className="label font-bold uppercase text-xs opacity-50 tracking-widest">অ্যাকাউন্ট টাইপ</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="select select-bordered w-full font-bold"
                  >
                    <option value="student">শিক্ষার্থী</option>
                    <option value="admin">অ্যাডমিন</option>
                  </select>
                </div>

                <div className="form-control w-full">
                  <label className="label font-bold uppercase text-xs opacity-50 tracking-widest">পূর্ণ নাম</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="input input-bordered input-primary w-full font-bold focus:shadow-lg transition-all"
                    placeholder="আপনার পূর্ণ নাম লিখুন"
                  />
                </div>
                
                <div className="form-control w-full">
                  <label className="label font-bold uppercase text-xs opacity-50 tracking-widest">ফোন নম্বর</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input input-bordered w-full font-bold"
                    placeholder="যেমন: +8801..."
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label font-bold uppercase text-xs opacity-50 tracking-widest">জন্ম তারিখ</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="input input-bordered w-full font-bold"
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label font-bold uppercase text-xs opacity-50 tracking-widest">লিঙ্গ</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="select select-bordered w-full font-bold"
                  >
                    <option value="prefer_not_to_say">উত্তর দিতে চাই না</option>
                    <option value="male">পুরুষ</option>
                    <option value="female">নারী</option>
                    <option value="other">অন্যান্য</option>
                  </select>
                </div>

                <div className="form-control w-full">
                  <label className="label font-bold uppercase text-xs opacity-50 tracking-widest">জেলা</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="input input-bordered w-full font-bold"
                    placeholder="যেমন: ঢাকা"
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label font-bold uppercase text-xs opacity-50 tracking-widest">শ্রেণি / স্তর</label>
                  <input
                    type="text"
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    className="input input-bordered w-full font-bold"
                    placeholder="যেমন: সপ্তম শ্রেণি"
                  />
                </div>
              </div>
            </div>

            {/* Guardian Info Section */}
            <div className="space-y-6 pt-6 border-t-2 border-base-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🛡️</span>
                <h3 className="text-xl font-black uppercase tracking-tight">অভিভাবকের তথ্য</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control w-full">
                  <label className="label font-bold uppercase text-xs opacity-50 tracking-widest">অভিভাবকের নাম</label>
                  <input
                    type="text"
                    name="guardianName"
                    value={formData.guardianName}
                    onChange={handleChange}
                    className="input input-bordered w-full font-bold"
                    placeholder="পূর্ণ নাম"
                  />
                </div>
                <div className="form-control w-full">
                  <label className="label font-bold uppercase text-xs opacity-50 tracking-widest">অভিভাবকের ফোন</label>
                  <input
                    type="tel"
                    name="guardianPhone"
                    value={formData.guardianPhone}
                    onChange={handleChange}
                    className="input input-bordered w-full font-bold"
                    placeholder="যোগাযোগ নম্বর"
                  />
                </div>
                <div className="form-control w-full md:col-span-2">
                  <label className="label font-bold uppercase text-xs opacity-50 tracking-widest">অভিভাবকের সাথে সম্পর্ক</label>
                  <input
                    type="text"
                    name="guardianRelation"
                    value={formData.guardianRelation}
                    onChange={handleChange}
                    placeholder="যেমন: পিতা, মাতা, ভাই"
                    className="input input-bordered w-full font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="card-actions justify-center pt-10">
              <button
                type="submit"
                disabled={createProfileMutation.isPending}
                className="btn btn-primary btn-lg px-12 rounded-full font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform disabled:loading"
              >
                {createProfileMutation.isPending ? 'সংরক্ষণ করা হচ্ছে...' : 'আমার প্রোফাইল চালু করুন 🚀'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <p className="text-center text-xs font-black opacity-30 uppercase tracking-[0.2em] mb-10">Clerk ও আলোকবর্তিকা শিল্ড দ্বারা সুরক্ষিত</p>
    </div>
  )
}
