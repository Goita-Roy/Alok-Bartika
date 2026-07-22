import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../config/api'

export interface ProjectFileRef {
  originalName: string
  fileName: string
  url: string
  mimeType: string
  size: number
}

export interface ProjectSubmission {
  id: string
  studentId: string
  title: string
  description: string
  category: string
  files: ProjectFileRef[]
  images: ProjectFileRef[]
  zip: ProjectFileRef | null
  readme: ProjectFileRef | null
  githubUrl: string
  demoUrl: string
  officialProject: boolean
  officialProjectRef: string | null
  status: string
  createdAt: string
  updatedAt: string
}

export interface ProjectBadge {
  name: string
  icon: string
  awardedAt: string
}

export interface SubmitProjectInput {
  title: string
  description?: string
  category?: string
  githubUrl?: string
  demoUrl?: string
  officialProjectRef?: string
  files?: File[]
  images?: File[]
  zip?: File | null
  readme?: File | null
}

export interface SubmitProjectResult {
  project: ProjectSubmission
  projectCount: number
  newBadges: ProjectBadge[]
}

interface State {
  projects: ProjectSubmission[]
  official: ProjectSubmission[]
  isLoading: boolean
}

export function useProjects() {
  const { token } = useAuth()
  const [fetchKey, setFetchKey] = useState(0)
  const [state, setState] = useState<State>({ projects: [], official: [], isLoading: true })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!token) {
      setState({ projects: [], official: [], isLoading: false })
      return
    }

    let cancelled = false
    setState(prev => ({ ...prev, isLoading: true }))

    const load = async () => {
      try {
        const [mineRes, officialRes] = await Promise.all([
          fetch(`${API_BASE_URL}/projects/mine`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/projects/official`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
        if (!mineRes.ok) throw new Error('Failed to fetch projects')
        const mineJson: { projects: ProjectSubmission[] } = await mineRes.json()
        const officialJson: { projects: ProjectSubmission[] } = officialRes.ok
          ? await officialRes.json()
          : { projects: [] }
        if (cancelled) return
        setState({
          projects: mineJson.projects || [],
          official: officialJson.projects || [],
          isLoading: false,
        })
      } catch (error) {
        console.error('Projects fetch error:', error)
        if (!cancelled) setState({ projects: [], official: [], isLoading: false })
      }
    }

    load()
    return () => { cancelled = true }
  }, [token, fetchKey])

  const refetch = useCallback(() => setFetchKey(k => k + 1), [])

  const submitProject = useCallback(
    async (input: SubmitProjectInput): Promise<SubmitProjectResult> => {
      if (!token) throw new Error('Not authenticated')
      setIsSubmitting(true)
      try {
        const form = new FormData()
        form.append('title', input.title)
        if (input.description) form.append('description', input.description)
        if (input.category) form.append('category', input.category)
        if (input.githubUrl) form.append('githubUrl', input.githubUrl)
        if (input.demoUrl) form.append('demoUrl', input.demoUrl)
        if (input.officialProjectRef) form.append('officialProjectRef', input.officialProjectRef)
        ;(input.files || []).forEach(f => form.append('files', f))
        ;(input.images || []).forEach(f => form.append('images', f))
        if (input.zip) form.append('zip', input.zip)
        if (input.readme) form.append('readme', input.readme)

        const res = await fetch(`${API_BASE_URL}/projects`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.message || 'প্রজেক্ট জমা দিতে ব্যর্থ হয়েছে')
        }
        const json: SubmitProjectResult = await res.json()
        setFetchKey(k => k + 1)
        return json
      } finally {
        setIsSubmitting(false)
      }
    },
    [token]
  )

  return { ...state, refetch, submitProject, isSubmitting }
}
