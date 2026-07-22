import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { API_BASE_URL } from '../config/api'
import { useAuth } from '../context/AuthContext'

interface Question {
  questionText: string
  options: string[]
  correctAnswer: number
}

interface TestData {
  _id: string
  type: string
  questions: Question[]
}

export function TestPage() {
  const { testId } = useParams<{ testId: string }>()
  const navigate = useNavigate()
  const { token } = useAuth()
  const [answers, setAnswers] = useState<number[]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [result, setResult] = useState<{ score: number; total: number } | null>(null)

  const { data, isLoading, isError } = useQuery<{ data: TestData }>({
    queryKey: ['test', testId],
    queryFn: async () => {
      if (!token) throw new Error('Missing auth token')
      const res = await fetch(`${API_BASE_URL}/tests/${testId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch test')
      return res.json()
    },
    enabled: !!token && !!testId,
  })

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('Missing auth token')
      const res = await fetch(`${API_BASE_URL}/tests/${testId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answers })
      })
      if (!res.ok) throw new Error('জমা দিতে ব্যর্থ')
      return res.json()
    },
    onSuccess: (data) => {
      setResult({ score: data.score, total: data.total })
      setIsSubmitted(true)
    }
  })

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <span className="loading loading-infinity loading-lg text-primary"></span>
      <p className="text-xl font-bold opacity-60 uppercase tracking-widest">প্রশ্ন তৈরি করা হচ্ছে...</p>
    </div>
  )
  
  if (isError) return (
    <div className="alert alert-error shadow-lg max-w-lg mx-auto mt-10">
      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span>পরীক্ষা লোড করতে ত্রুটি। অনুগ্রহ করে সমর্থনের সাথে যোগাযোগ করুন।</span>
    </div>
  )

  const test = data?.data
  if (!test) return null

  const handleOptionSelect = (qIdx: number, oIdx: number) => {
    const newAnswers = [...answers]
    newAnswers[qIdx] = oIdx
    setAnswers(newAnswers)
  }

  if (isSubmitted && result) {
    const percentage = Math.round((result.score / result.total) * 100)
    return (
      <div className="max-w-xl mx-auto mt-10 card bg-base-100 shadow-2xl border border-base-200 animate-in zoom-in duration-500">
        <div className="card-body items-center text-center p-12">
          <div className="text-8xl mb-6">🏆</div>
          <h2 className="card-title text-4xl font-black text-base-content mb-2 uppercase">মূল্যায়ন সম্পন্ন!</h2>
          <p className="text-lg opacity-60 font-medium mb-10 leading-tight">চমৎকার! আপনি সফলভাবে {test.type} সম্পন্ন করেছেন।</p>
          
          <div className="stats shadow-xl bg-primary text-primary-content w-full mb-10 overflow-hidden border-4 border-white">
            <div className="stat">
              <div className="stat-title font-black uppercase text-xs tracking-widest opacity-70">চূড়ান্ত স্কোর</div>
              <div className="stat-value text-6xl">{result.score} <span className="text-2xl opacity-40">/ {result.total}</span></div>
              <div className="stat-desc font-bold opacity-70">জ্ঞান অর্জন: {percentage}%</div>
            </div>
          </div>

          <div className="radial-progress text-primary font-black mb-10" style={{ "--value": percentage, "--size": "12rem", "--thickness": "2rem" } as any} role="progressbar">
            {percentage}%
          </div>

          <button 
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary btn-lg btn-wide rounded-full font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform"
          >
            ড্যাশবোর্ডে ফিরুন
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <header className="card bg-base-100 shadow-xl border border-base-200 overflow-hidden">
        <div className="bg-primary p-1"></div>
        <div className="card-body p-8 flex flex-row items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-base-content uppercase tracking-tight leading-tight">{test.type}</h1>
            <p className="text-sm font-medium opacity-50 uppercase tracking-widest">বিষয়ভিত্তিক মূল্যায়ন</p>
          </div>
          <div className="badge badge-lg font-black">{test.questions.length} Qs</div>
        </div>
      </header>

      <div className="space-y-8">
        {test.questions.map((q, qIdx) => (
          <div key={qIdx} className="card bg-base-100 shadow-xl border border-base-200 overflow-hidden group">
            <div className="card-body p-8">
              <div className="flex gap-4 items-start mb-8">
                <span className="badge badge-primary font-black px-4 py-4 text-lg">Q{qIdx + 1}</span>
                <h3 className="text-xl font-black text-base-content leading-tight">
                  {q.questionText}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {q.options.map((option, oIdx) => (
                  <label 
                    key={oIdx}
                    className={`flex items-center p-6 rounded-2xl border-2 cursor-pointer transition-all gap-4 group/option
                      ${answers[qIdx] === oIdx 
                        ? 'border-primary bg-primary/5 shadow-md' 
                        : 'border-base-200 hover:border-base-300 hover:bg-base-200/50'}`}
                  >
                    <input 
                      type="radio" 
                      name={`q-${qIdx}`} 
                      className="radio radio-primary" 
                      checked={answers[qIdx] === oIdx}
                      onChange={() => handleOptionSelect(qIdx, oIdx)}
                    />
                    <div className="flex-1">
                      <span className={`text-lg font-bold ${answers[qIdx] === oIdx ? 'text-primary' : 'opacity-70'}`}>
                        {option}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card bg-base-100 shadow-2xl p-8 sticky bottom-8 border-t-4 border-primary z-50">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="text-center sm:text-left">
            <div className="text-xs font-black uppercase opacity-40 tracking-widest mb-1">মূল্যায়ন অগ্রগতি</div>
            <div className="font-black text-xl">
              {answers.filter(a => a !== undefined).length} <span className="opacity-30">/ {test.questions.length}</span> উত্তর দেওয়া হয়েছে
            </div>
          </div>
          <button
            onClick={() => submitMutation.mutate()}
            disabled={submitMutation.isPending || answers.filter(a => a !== undefined).length < test.questions.length}
            className="btn btn-primary btn-lg px-12 rounded-full font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform disabled:loading"
          >
            {submitMutation.isPending ? 'যাচাই করা হচ্ছে...' : 'চূড়ান্ত করুন ও জমা দিন'}
          </button>
        </div>
      </div>
    </div>
  )
}
