import { useState, useEffect, useCallback, useRef } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import api from '../../config/api'
import { CodeBlock } from '../../components/ai-buddy/code'
import {
  FileText, Loader2, PlusCircle, Trash2, Edit3, Search, Copy,
  AlertTriangle, RefreshCw, ChevronLeft, ChevronRight,
  BookOpen, Layers, Sparkles, GraduationCap, GripVertical, Eye, X,
 } from 'lucide-react'
import {
   DndContext,
   closestCenter,
   KeyboardSensor,
   PointerSensor,
   useSensor,
   useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface CourseItem {
  _id: string
  title: string
  level: string
}

interface LessonItem {
  _id: string
  courseId: string
  title: string
  content: string
  order: number
  language: string
  videoUrl: string
  audioUrl: string
  starterCode: string
  expectedOutput: string
  codingProblem?: string
  level?: string
  status?: string
  createdAt?: string
  updatedAt?: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

interface LessonSummary {
  total: number
  published: number
  draft: number
  totalCourses: number
}

const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

interface SortableLessonRowProps {
  lesson: LessonItem
  onEdit: (lesson: LessonItem) => void
  onPreview: (lesson: LessonItem) => void
  onUpdateStatus: (lesson: LessonItem) => void
  onDuplicate: (lessonId: string) => void
  onDelete: (lessonId: string) => void
  duplicatingId: string | null
  draggingId: string | null
  selectedLessons: Set<string>
  onToggleSelection: (id: string) => void
  recentlySavedId: string | null
  getCourseForLesson: (lesson: LessonItem) => CourseItem | undefined
  getStatusColor: (status: string) => string
  getLevelColor: (level: string) => string
  formatDate: (d?: string) => string
}

const SortableLessonRow = function SortableLessonRow({
  lesson,
  onEdit,
  onPreview,
  onUpdateStatus,
  onDuplicate,
  onDelete,
  duplicatingId,
  draggingId,
  selectedLessons,
  onToggleSelection,
  recentlySavedId,
  getCourseForLesson,
  getStatusColor,
  getLevelColor,
  formatDate,
}: SortableLessonRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson._id })

  const isRecentlySaved = recentlySavedId === lesson._id
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    borderWidth: draggingId === lesson._id ? '2px' : '1px',
    borderColor: draggingId === lesson._id ? 'var(--color-accent)' : 'var(--color-border)',
    borderStyle: 'solid',
    backgroundColor: isRecentlySaved ? 'rgba(34, 197, 94, 0.08)' : undefined,
  }

  const course = getCourseForLesson(lesson)
  const level = course?.level || lesson.level || ''

  return (
    <tr ref={setNodeRef} style={style} key={lesson._id}>
      <td className="px-2 py-2">
        <div className="flex items-center justify-center">
           <input
             type="checkbox"
             className="checkbox checkbox-sm"
             checked={selectedLessons.has(lesson._id)}
             onChange={() => onToggleSelection(lesson._id)}
             style={{ borderRadius: 'var(--rounded)' }}
             onClick={(e) => e.stopPropagation()}
           />
        </div>
      </td>
      <td className="px-2 py-2">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none select-none"
          style={{ color: 'var(--color-text-muted)' }} title="Drag to reorder">
          <GripVertical size={16} />
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--color-accent-pale)' }}>
            <FileText size={16} style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{lesson.title}</p>
            {lesson.content && (
              <p className="text-xs max-w-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{lesson.content}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="badge badge-sm font-semibold"
          style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)', border: 'none' }}>
          #{lesson.order}
        </span>
      </td>
       <td className="px-4 py-3">
         <button
           type="button"
           className="badge badge-sm font-semibold capitalize cursor-pointer"
           style={{
             backgroundColor: `${getStatusColor(lesson.status || 'draft')}20`,
             color: getStatusColor(lesson.status || 'draft'),
             border: 'none',
           }}
           onClick={(e) => {
             e.stopPropagation()
             onUpdateStatus(lesson)
           }}
           title={lesson.status === 'published' ? 'Unpublish' : 'Publish'}
         >
           {lesson.status || 'draft'}
         </button>
       </td>
      <td className="px-4 py-3">
        {level ? (
          <span
            className="badge badge-sm font-semibold capitalize"
            style={{
              backgroundColor: `${getLevelColor(level)}20`,
              color: getLevelColor(level),
              border: 'none',
            }}
          >
            {level}
          </span>
        ) : (
          <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>—</span>
        )}
      </td>
       <td className="px-4 py-3">
         {course?.title ? (
           <span
             className="badge badge-sm font-semibold capitalize cursor-pointer"
             style={{
               backgroundColor: `${getLevelColor(level)}20`,
               color: getLevelColor(level),
               border: 'none',
             }}
             title={`View ${course.title} lessons`}
           >
             {course.title}
           </span>
         ) : (
           <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>—</span>
         )}
       </td>
       <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
         {lesson.language || '—'}
       </td>
       <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
         {formatDate(lesson.createdAt)}
       </td>
       <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
         {lesson.updatedAt ? formatDate(lesson.updatedAt) : '—'}
       </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1">
           <button
             type="button"
             className="btn btn-sm btn-ghost"
             onClick={() => onEdit(lesson)}
             style={{ color: 'var(--color-accent)' }}
             title="Edit"
           >
             <Edit3 size={14} />
           </button>
           <button
             type="button"
             className="btn btn-sm btn-ghost"
             onClick={() => onPreview(lesson)}
             style={{ color: 'var(--color-text-muted)' }}
             title="Preview"
           >
             <Eye size={14} />
           </button>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            disabled={duplicatingId === lesson._id}
            onClick={() => onDuplicate(lesson._id)}
            style={{ color: 'var(--color-text-muted)' }}
            title="Duplicate"
          >
            {duplicatingId === lesson._id ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Copy size={14} />
            )}
          </button>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => onDelete(lesson._id)}
            style={{ color: 'var(--color-error)' }}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}

const emptyForm = {
  _id: '',
  title: '',
  content: '',
  order: 1,
  language: 'python',
  videoUrl: '',
  audioUrl: '',
  starterCode: '',
  expectedOutput: '',
  status: 'draft',
}

export function AdminLessonsPage() {
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [lessons, setLessons] = useState<LessonItem[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loadingLessons, setLoadingLessons] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [reordering, setReordering] = useState(false)
  const [selectedLessons, setSelectedLessons] = useState<Set<string>>(new Set())
  const [recentlySavedId, setRecentlySavedId] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [previewLesson, setPreviewLesson] = useState<LessonItem | null>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  // Search / filter / sort / pagination state
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('order')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 25, total: 0, pages: 0 })
  const [summary, setSummary] = useState<LessonSummary>({ total: 0, published: 0, draft: 0, totalCourses: 0 })

   // Drag-and-drop sensors
   const sensors = useSensors(
     useSensor(PointerSensor, {
       activationConstraint: {
         distance: 5,
       },
     }),
     useSensor(KeyboardSensor)
   )

   // Clear recently-saved highlight after 2 seconds
   useEffect(() => {
     if (recentlySavedId) {
       const t = setTimeout(() => setRecentlySavedId(null), 2000)
       return () => clearTimeout(t)
     }
   }, [recentlySavedId])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const SortableHeader = ({ field, label }: { field: string; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider py-3 px-4 text-left transition-colors"
      style={{
        color: 'var(--color-text-muted)',
        backgroundColor: 'transparent',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLElement).style.color = 'var(--color-text)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'
      }}
    >
      {label}
      {sortBy === field && (
        <span style={{ color: 'var(--color-accent)' }}>
          {sortOrder === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </button>
  )

  const loadCourses = useCallback(async () => {
    try {
      setLoadingCourses(true)
      const response = await api.get('/courses', { params: { status: 'all' } })
      const courseList = response.data?.data || []
      setCourses(courseList)
      setSelectedCourseId((prev) => prev || (courseList[0]?._id) || '')
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load courses')
    } finally {
      setLoadingCourses(false)
    }
  }, [])

  const loadLessons = useCallback(async (page = 1) => {
    try {
      setLoadingLessons(true)
      setError(null)
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '25')
      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim())
      if (courseFilter !== 'all') params.set('courseId', courseFilter)
      if (levelFilter !== 'all') params.set('level', levelFilter)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      params.set('sortBy', sortBy)
      params.set('sortOrder', sortOrder)

       const response = await api.get(`/lessons?${params.toString()}`)
      const json = response.data
      setLessons(json.data || [])
      setSelectedLessons(new Set())
      setPagination(json.pagination || { page: 1, limit: 25, total: 0, pages: 0 })
      if (json.summary) {
        setSummary({
          total: json.summary.total || 0,
          published: json.summary.published || 0,
          draft: json.summary.draft || 0,
          totalCourses: json.summary.totalCourses || 0,
        })
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load lessons')
    } finally {
      setLoadingLessons(false)
    }
  }, [debouncedSearch, courseFilter, levelFilter, statusFilter, sortBy, sortOrder])

  useEffect(() => {
    loadCourses()
  }, [loadCourses])

  useEffect(() => {
    loadLessons(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, courseFilter, levelFilter, statusFilter, sortBy, sortOrder])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  const handleRefresh = () => {
    loadCourses()
    loadLessons(pagination.page)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourseId) {
      setError('Select a course first')
      return
    }
    if (!form.title.trim()) {
      setError('Lesson title is required')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      const payload = {
        courseId: selectedCourseId,
        title: form.title.trim(),
        content: form.content.trim(),
        order: Number(form.order) || 1,
        language: form.language,
        videoUrl: form.videoUrl.trim(),
        audioUrl: form.audioUrl.trim(),
        starterCode: form.starterCode.trim(),
        expectedOutput: form.expectedOutput.trim(),
        status: form.status,
      }

       if (form._id) {
         await api.put(`/lessons/${form._id}`, payload)
         showToast('Lesson updated', 'success')
         setRecentlySavedId(form._id)
       } else {
         const res = await api.post('/lessons', payload)
         showToast('Lesson created', 'success')
         setForm(emptyForm)
         setTimeout(() => titleInputRef.current?.focus(), 0)
         if (res.data?.data?._id) {
           setRecentlySavedId(res.data.data._id)
         }
       }

       await loadLessons(pagination.page)
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to save lesson', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const openNewLesson = () => {
    setForm(emptyForm)
    setPanelOpen(true)
    setTimeout(() => titleInputRef.current?.focus(), 0)
  }

  const closePanel = () => {
    setPanelOpen(false)
    setForm(emptyForm)
  }

  const handleEdit = (lesson: LessonItem) => {
    setSelectedCourseId(lesson.courseId || selectedCourseId)
    setForm({
      _id: lesson._id,
      title: lesson.title,
      content: lesson.content,
      order: lesson.order || 1,
      language: lesson.language,
      videoUrl: lesson.videoUrl,
      audioUrl: lesson.audioUrl,
      starterCode: lesson.starterCode,
      expectedOutput: lesson.expectedOutput,
      status: lesson.status || 'draft',
    })
    setPanelOpen(true)
  }

  const handleDelete = async (lessonId: string) => {
    if (!window.confirm('Delete this lesson?')) return
    try {
      await api.delete(`/lessons/${lessonId}`)
      showToast('Lesson deleted', 'success')
      await loadLessons(pagination.page)
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to delete lesson', 'error')
    }
  }

  const handleDuplicate = async (lessonId: string) => {
    try {
      setDuplicatingId(lessonId)
      await api.post(`/lessons/${lessonId}/duplicate`)
      showToast('Lesson duplicated', 'success')
      await loadLessons(pagination.page)
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to duplicate lesson', 'error')
    } finally {
      setDuplicatingId(null)
     }
   }

   const handleToggleSelection = (id: string) => {
     setSelectedLessons(prev => {
       const next = new Set(prev)
       if (next.has(id)) {
         next.delete(id)
       } else {
         next.add(id)
       }
       return next
     })
   }

   const handleSelectAll = () => {
     if (selectedLessons.size === lessons.length && lessons.length > 0) {
       setSelectedLessons(new Set())
     } else {
       setSelectedLessons(new Set(lessons.map(l => l._id)))
     }
   }

   const handleBulkStatus = async (status: 'published' | 'draft') => {
     const ids = Array.from(selectedLessons)
     if (ids.length === 0) return
     try {
       const { data } = await api.post('/lessons/bulk/status', { ids, status })
       showToast(`${data.affected} lesson(s) ${status === 'published' ? 'published' : 'moved to draft'}`, 'success')
       setSelectedLessons(new Set())
       await loadLessons(pagination.page)
      } catch (err: any) {
        showToast(err.response?.data?.message || err.message || 'Failed to update status', 'error')
      }
    }

    const handleBulkDelete = async () => {
      const ids = Array.from(selectedLessons)
      if (ids.length === 0) return
      try {
        const { data } = await api.post('/lessons/bulk/delete', { ids })
        showToast(`${data.deleted} lesson(s) deleted`, 'success')
        setSelectedLessons(new Set())
        setShowDeleteModal(false)
        await loadLessons(pagination.page)
      } catch (err: any) {
        showToast(err.response?.data?.message || err.message || 'Failed to delete lessons', 'error')
        setShowDeleteModal(false)
      }
     }

      const handlePreview = (lesson: LessonItem) => {
        setPreviewLesson(lesson)
      }

      const handleUpdateStatus = async (lesson: LessonItem) => {
        const newStatus = lesson.status === 'published' ? 'draft' : 'published'
        const previousLessons = [...lessons]

        // Optimistic update
        setLessons(lessons.map(l =>
          l._id === lesson._id ? { ...l, status: newStatus } : l
        ))

        try {
          await api.put(`/lessons/${lesson._id}`, {
            title: lesson.title,
            content: lesson.content,
            order: lesson.order,
            language: lesson.language,
            videoUrl: lesson.videoUrl,
            audioUrl: lesson.audioUrl,
            starterCode: lesson.starterCode,
            expectedOutput: lesson.expectedOutput,
            status: newStatus,
          })
          showToast(`Lesson ${newStatus === 'published' ? 'published' : 'moved to draft'}`, 'success')
        } catch (err: any) {
          // Revert on failure
          setLessons(previousLessons)
          showToast(err.response?.data?.message || err.message || 'Failed to update status', 'error')
        }
      }

      const handleDragStart = (event: DragStartEvent) => {
     setDraggingId(event.active.id as string)
   }

   const handleDragEnd = async (event: DragEndEvent) => {
     const { active, over } = event
     setDraggingId(null)

     if (!over || active.id !== over.id) {
       const oldIndex = lessons.findIndex(l => l._id === active.id)
       const newIndex = lessons.findIndex(l => l._id === over!.id)

       const courseId = lessons[oldIndex]?.courseId

       // Cross-course drag prevention
       if (!courseId || lessons[newIndex]?.courseId !== courseId) {
        showToast('You can only reorder lessons within the same course', 'error')
        return
      }

      // All lessons in the same course (sorted by order)
      const courseLessons = lessons
        .filter(l => l.courseId === courseId)
        .sort((a, b) => (a.order || 0) - (b.order || 0))

      const reordered = arrayMove(courseLessons, oldIndex, newIndex)
      const lessonIds = reordered.map(l => l._id)

      try {
        setReordering(true)
        await api.post('/lessons/reorder', { courseId, lessonIds })
        showToast('Lesson order updated', 'success')

        // Optimistically update local state while preserving current view filters
        const otherLessons = lessons.filter(l => l.courseId !== courseId)
        const updatedLessons = [...reordered, ...otherLessons]
        setLessons(updatedLessons)

        await loadLessons(pagination.page)
      } catch (err: any) {
        showToast(err.response?.data?.message || err.message || 'Failed to reorder lessons', 'error')
      } finally {
        setReordering(false)
      }
    }
  }

  const getCourseForLesson = (lesson: LessonItem) => {
    return courses.find(c => c._id === lesson.courseId)
  }

  const getStatusColor = (status: string): string => {
    return status === 'published' ? '#22c55e' : '#f59e0b'
  }

  const getLevelColor = (level: string): string => {
    switch (level) {
      case 'beginner': return '#3b82f6'
      case 'intermediate': return '#f59e0b'
      case 'advanced': return '#dc2626'
      default: return 'var(--color-text-muted)'
    }
  }

  const formatDate = (d?: string) => {
    if (!d) return '—'
    try {
      return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return '—'
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Lesson Management</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Create and organize lesson content for each course</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleRefresh}
              className="btn btn-sm btn-ghost"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <RefreshCw size={16} />
            </button>
            <button
              type="button"
              onClick={openNewLesson}
              className="btn btn-sm btn-outline"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              <PlusCircle size={16} />
              New lesson
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
             { label: 'Total Lessons', value: summary.total, icon: FileText, color: '#3b82f6' },
             { label: 'Published', value: summary.published, icon: Layers, color: '#22c55e' },
             { label: 'Draft', value: summary.draft, icon: Sparkles, color: '#f59e0b' },
             { label: 'Total Courses', value: summary.totalCourses, icon: BookOpen, color: '#8b5cf6' },
          ].map(c => {
            const Icon = c.icon
            return (
              <div
                key={c.label}
                className="group card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                <div className="card-body p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                      style={{ backgroundColor: `${c.color}15` }}
                    >
                      <Icon size={20} style={{ color: c.color }} />
                    </div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{c.label}</p>
                      <p className="text-2xl font-bold" style={{ color: c.color }}>{c.value}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              className="input input-sm w-full pl-9"
              placeholder="Search by title or content..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            />
          </div>
          <select
            className="select select-sm"
            value={courseFilter}
            onChange={e => setCourseFilter(e.target.value)}
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>{course.title}</option>
            ))}
          </select>
          <select
            className="select select-sm"
            value={levelFilter}
            onChange={e => setLevelFilter(e.target.value)}
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          >
            <option value="all">All Levels</option>
            {LEVELS.map(level => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>
          <select
            className="select select-sm"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* Bulk Action Toolbar */}
        {selectedLessons.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.30)' }}>
            <span style={{ color: 'var(--color-accent)' }}>{selectedLessons.size} selected</span>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => handleBulkStatus('published')}
              style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}
            >
              Publish Selected
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => handleBulkStatus('draft')}
              style={{ borderColor: 'var(--color-text-muted)', color: 'var(--color-text-muted)' }}
            >
              Move to Draft
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => setShowDeleteModal(true)}
              style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
            >
              Delete Selected
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: 'rgba(226,75,74,0.10)', color: 'var(--color-error)' }}>
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">

          {/* Lesson List / Table */}
          <div className="space-y-4">
            {loadingLessons ? (
              <div className="card p-8 text-center shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <Loader2 size={24} className="mx-auto animate-spin" style={{ color: 'var(--color-accent)' }} />
                <p className="mt-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading lessons…</p>
              </div>
             ) : lessons.length === 0 ? (
              <div className="card p-8 text-center shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                {debouncedSearch || courseFilter !== 'all' || levelFilter !== 'all' ? (
                  <div>
                    <Search size={32} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      No lessons match your search or filter criteria
                    </p>
                  </div>
                ) : (
                  <div>
                    <BookOpen size={40} className="mx-auto mb-4" style={{ color: 'var(--color-accent)', opacity: 0.3 }} />
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>No lessons yet</h3>
                    <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                      Add the first one to start teaching.
                    </p>
                    <button
                      type="button"
                      onClick={openNewLesson}
                      className="btn btn-sm btn-primary"
                    >
                      <PlusCircle size={16} />
                      Create your first lesson
                    </button>
                  </div>
                )}
              </div>
            ) : (
               <>
                 {/* Desktop table */}
                 <DndContext
                   sensors={sensors}
                   collisionDetection={closestCenter}
                   onDragStart={handleDragStart}
                   onDragEnd={handleDragEnd}
                 >
                   <SortableContext
                     items={lessons.map((l) => l._id)}
                     strategy={verticalListSortingStrategy}
                   >
                     <div className="hidden md:block card shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                       <div className="overflow-x-auto">
                         <table className="table table-sm w-full">
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, backgroundColor: 'var(--color-surface)', zIndex: 10 }}>
                                <th key="Select" className="text-xs font-semibold uppercase tracking-wider py-3 px-4"
                                  style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent', width: '36px' }}>
                                  <div className="flex items-center justify-center">
                                    <input
                                      type="checkbox"
                                      className="checkbox checkbox-sm"
                                      checked={lessons.length > 0 && selectedLessons.size === lessons.length}
                                      ref={checkbox => {
                                        if (checkbox) checkbox.indeterminate = selectedLessons.size > 0 && selectedLessons.size < lessons.length
                                      }}
                                      onChange={handleSelectAll}
                                      style={{ borderRadius: 'var(--rounded)' }}
                                    />
                                  </div>
                                </th>
                                <th key="Drag" className="text-xs font-semibold uppercase tracking-wider py-3 px-4"
                                  style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent', width: '32px' }}>
                                </th>
                                <th key="Title" style={{ backgroundColor: 'transparent' }}>
                                  <SortableHeader field="title" label="Lesson Title" />
                                </th>
                                <th key="Order" style={{ backgroundColor: 'transparent' }}>
                                  <SortableHeader field="order" label="Order" />
                                </th>
                                <th key="Status" className="text-xs font-semibold uppercase tracking-wider py-3 px-4"
                                  style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}>Status</th>
                                <th key="Level" style={{ backgroundColor: 'transparent' }}>
                                  <SortableHeader field="level" label="Level" />
                                </th>
                                <th key="Course" className="text-xs font-semibold uppercase tracking-wider py-3 px-4"
                                  style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}>Course</th>
                                <th key="Language" className="text-xs font-semibold uppercase tracking-wider py-3 px-4"
                                  style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}>Language</th>
                                 <th key="CreatedDate" style={{ backgroundColor: 'transparent' }}>
                                   <SortableHeader field="createdAt" label="Created Date" />
                                 </th>
                                 <th key="UpdatedDate" className="text-xs font-semibold uppercase tracking-wider py-3 px-4"
                                   style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}>Last Updated</th>
                                 <th key="Actions" className="text-xs font-semibold uppercase tracking-wider py-3 px-4 text-center"
                                   style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {lessons.map(lesson => (
                                  <SortableLessonRow
                                    key={lesson._id}
                                    lesson={lesson}
                                    onEdit={handleEdit}
                                    onPreview={handlePreview}
                                    onUpdateStatus={handleUpdateStatus}
                                    onDuplicate={handleDuplicate}
                                    onDelete={handleDelete}
                                    duplicatingId={duplicatingId}
                                    draggingId={draggingId}
                                    selectedLessons={selectedLessons}
                                    onToggleSelection={handleToggleSelection}
                                    recentlySavedId={recentlySavedId}
                                    getCourseForLesson={getCourseForLesson}
                                    getStatusColor={getStatusColor}
                                    getLevelColor={getLevelColor}
                                    formatDate={formatDate}
                                  />
                              ))}
                            </tbody>
                            </table>
                          </div>
                        </div>
                        </SortableContext>
                        </DndContext>

                 {/* Mobile cards */}
                 <div className="md:hidden space-y-3">
                   {lessons.map(lesson => {
                     const course = getCourseForLesson(lesson)
                     const level = course?.level || lesson.level || ''
                     return (
                       <div
                         key={lesson._id}
                         className="card shadow-sm"
                         style={{
                           backgroundColor: 'var(--color-surface)',
                           border: '1px solid var(--color-border)',
                         }}
                       >
                         <div className="card-body flex flex-col gap-3">
                           <div className="flex items-start justify-between gap-3">
                             <div className="flex items-center gap-2.5">
                               <div className="flex items-center justify-center">
                                 <input
                                   type="checkbox"
                                   className="checkbox checkbox-sm"
                                   checked={selectedLessons.has(lesson._id)}
                                    onChange={() => handleToggleSelection(lesson._id)}
                                   style={{ borderRadius: 'var(--rounded)' }}
                                 />
                               </div>
                               <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                 style={{ backgroundColor: 'var(--color-accent-pale)' }}>
                                 <FileText size={16} style={{ color: 'var(--color-accent)' }} />
                               </div>
                               <div>
                                 <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>{lesson.title}</h3>
                                 <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                   {course?.title || '—'} · {lesson.language || '—'}
                                 </p>
                               </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                              <span className="badge badge-sm font-semibold"
                                style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)', border: 'none' }}>
                                #{lesson.order}
                              </span>
                              {level && (
                                <span
                                  className="badge badge-sm font-semibold capitalize"
                                  style={{
                                    backgroundColor: `${getLevelColor(level)}20`,
                                    color: getLevelColor(level),
                                    border: 'none',
                                  }}
                                >
                                  {level}
                                </span>
                              )}
                              <span
                                className="badge badge-sm font-semibold capitalize"
                                style={{
                                  backgroundColor: `${getStatusColor(lesson.status || 'draft')}20`,
                                  color: getStatusColor(lesson.status || 'draft'),
                                  border: 'none',
                                }}
                              >
                                {lesson.status || 'draft'}
                              </span>
                            </div>
                          </div>
                          {lesson.content && (
                            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{lesson.content}</p>
                          )}
                          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                            <span>{formatDate(lesson.createdAt)}</span>
                          </div>
                          <div className="flex gap-2">
                            <button type="button" className="btn btn-sm btn-ghost" onClick={() => handleEdit(lesson)}>
                              <Edit3 size={14} />
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-ghost"
                              disabled={duplicatingId === lesson._id}
                              onClick={() => handleDuplicate(lesson._id)}
                            >
                              {duplicatingId === lesson._id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Copy size={14} />
                              )}
                              Duplicate
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-ghost"
                              onClick={() => handleDelete(lesson._id)}
                              style={{ color: 'var(--color-error)' }}
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    className="btn btn-sm btn-ghost"
                    disabled={pagination.page <= 1}
                    onClick={() => loadLessons(pagination.page - 1)}
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                    let page: number
                    if (pagination.pages <= 5) {
                      page = i + 1
                    } else if (pagination.page <= 3) {
                      page = i + 1
                    } else if (pagination.page >= pagination.pages - 2) {
                      page = pagination.pages - 4 + i
                    } else {
                      page = pagination.page - 2 + i
                    }
                    return (
                      <button
                        key={page}
                        className={`btn btn-sm ${page === pagination.page ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => loadLessons(page)}
                        style={page === pagination.page ? { border: 'none' } : { color: 'var(--color-text-muted)' }}
                      >
                        {page}
                      </button>
                    )
                  })}
                  <button
                    className="btn btn-sm btn-ghost"
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => loadLessons(pagination.page + 1)}
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right panel: Create / Edit */}
          <div className="flex flex-col gap-4">
            {panelOpen ? (
              <div
                className="card shadow-sm flex flex-col transition-all duration-300 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)]"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                {/* Sticky header */}
                <div
                  className="px-4 py-3 border-b shrink-0 lg:sticky lg:top-0"
                  style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', zIndex: 10 }}
                >
                  <div className="flex items-center gap-2">
                    <FileText size={18} style={{ color: 'var(--color-accent)' }} />
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                      {form._id ? 'Edit Lesson' : 'Create New Lesson'}
                    </h2>
                  </div>
                </div>

                {/* Scrollable body */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                  <div className="card-body gap-4 flex-1 overflow-y-auto">
                    <div>
                      <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Course</label>
                      {loadingCourses ? (
                        <div className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Loading courses…</div>
                      ) : (
                        <select
                          value={selectedCourseId}
                          onChange={(e) => setSelectedCourseId(e.target.value)}
                          className="select select-sm w-full mt-1"
                          style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                        >
                          {courses.map(course => (
                            <option key={course._id} value={course._id}>{course.title}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Title</label>
                      <input
                        ref={titleInputRef}
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="input input-sm w-full mt-1"
                        style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Content</label>
                      <textarea
                        value={form.content}
                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                        className="textarea textarea-sm w-full mt-1"
                        rows={4}
                        style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Order</label>
                        <input
                          type="number"
                          value={form.order}
                          onChange={(e) => setForm({ ...form, order: Number(e.target.value) || 1 })}
                          className="input input-sm w-full mt-1"
                          style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Language</label>
                        <select
                          value={form.language}
                          onChange={(e) => setForm({ ...form, language: e.target.value })}
                          className="select select-sm w-full mt-1"
                          style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                        >
                          <option value="python">Python</option>
                          <option value="javascript">JavaScript</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Status</label>
                        <select
                          value={form.status}
                          onChange={(e) => setForm({ ...form, status: e.target.value })}
                          className="select select-sm w-full mt-1"
                          style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Video URL</label>
                        <input
                          value={form.videoUrl}
                          onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                          className="input input-sm w-full mt-1"
                          style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Audio URL</label>
                        <input
                          value={form.audioUrl}
                          onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
                          className="input input-sm w-full mt-1"
                          style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Starter code</label>
                      <textarea
                        value={form.starterCode}
                        onChange={(e) => setForm({ ...form, starterCode: e.target.value })}
                        className="textarea textarea-sm w-full mt-1"
                        rows={3}
                        style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Expected output</label>
                      <input
                        value={form.expectedOutput}
                        onChange={(e) => setForm({ ...form, expectedOutput: e.target.value })}
                        className="input input-sm w-full mt-1"
                        style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                      />
                    </div>
                  </div>

                  {/* Sticky footer */}
                  <div
                    className="px-4 py-3 border-t flex gap-2 shrink-0 lg:sticky lg:bottom-0"
                    style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', zIndex: 10 }}
                  >
                    <button className="btn btn-sm btn-primary" type="submit" disabled={submitting}>
                      {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                      {form._id ? 'Update lesson' : 'Save lesson'}
                    </button>
                    <button type="button" className="btn btn-sm btn-ghost" onClick={closePanel}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div
                className="card shadow-sm flex items-center justify-center p-8 transition-all duration-300 lg:sticky lg:top-4"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', minHeight: '240px' }}
              >
                <p className="text-sm text-center max-w-[14rem]" style={{ color: 'var(--color-text-muted)' }}>
                  Select a lesson to edit or click New Lesson.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className="toast toast-end toast-bottom z-50">
            <div className={`alert ${toast.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-sm font-semibold`}
              style={{ border: 'none' }}>
              {toast.message}
            </div>
          </div>
        )}

        {/* Bulk Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div
              className="card shadow-xl max-w-md w-full mx-4"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div className="card-body gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'rgba(226,75,74,0.10)' }}
                  >
                    <AlertTriangle size={20} style={{ color: 'var(--color-error)' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>Delete {selectedLessons.size} lesson(s)?</h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      This action cannot be undone. The selected lessons will be permanently removed and lesson order will be renumbered within each affected course.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={() => setShowDeleteModal(false)}
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-error"
                    onClick={handleBulkDelete}
                  >
                    Delete Selected
                  </button>
                </div>
              </div>
            </div>
          </div>
         )}

        {/* Lesson Preview Modal */}
        {previewLesson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div
              className="card shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div className="px-6 py-4 border-b" style={{ borderBottomColor: 'var(--color-border)' }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
                    {previewLesson.title}
                  </h2>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={() => setPreviewLesson(null)}
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 min-h-0">
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Course</label>
                      <p className="text-sm mt-1" style={{ color: 'var(--color-text)' }}>{getCourseForLesson(previewLesson)?.title || '—'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Status</label>
                      <div className="mt-1">
                        <span
                          className="badge badge-sm font-semibold capitalize"
                          style={{
                            backgroundColor: `${getStatusColor(previewLesson.status || 'draft')}20`,
                            color: getStatusColor(previewLesson.status || 'draft'),
                            border: 'none',
                          }}
                        >
                          {previewLesson.status || 'draft'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Order</label>
                      <p className="text-sm mt-1" style={{ color: 'var(--color-text)' }}>#{previewLesson.order}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Language</label>
                      <p className="text-sm mt-1" style={{ color: 'var(--color-text)' }}>{previewLesson.language || '—'}</p>
                    </div>
                    {previewLesson.videoUrl && (
                      <div className="sm:col-span-2">
                        <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Video URL</label>
                        <p className="text-sm mt-1 break-all" style={{ color: 'var(--color-text)' }}>{previewLesson.videoUrl}</p>
                      </div>
                    )}
                    {previewLesson.audioUrl && (
                      <div className="sm:col-span-2">
                        <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Audio URL</label>
                        <p className="text-sm mt-1 break-all" style={{ color: 'var(--color-text)' }}>{previewLesson.audioUrl}</p>
                      </div>
                    )}
                  </div>

                  {previewLesson.content && (
                    <div>
                      <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Lesson Content</label>
                      <div className="mt-2 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                        <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--color-text)' }}>{previewLesson.content}</p>
                      </div>
                    </div>
                  )}

                  {previewLesson.codingProblem && (
                    <div>
                      <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Coding Problem</label>
                      <div className="mt-2 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                        <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--color-text)' }}>{previewLesson.codingProblem}</p>
                      </div>
                    </div>
                  )}

                  {previewLesson.starterCode && (
                    <div>
                      <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Starter Code</label>
                      <div className="mt-2 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
                        <CodeBlock code={previewLesson.starterCode} language={previewLesson.language || 'python'} />
                      </div>
                    </div>
                  )}

                  {previewLesson.expectedOutput && (
                    <div>
                      <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Expected Output</label>
                      <div className="mt-2 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                        <p className="text-sm whitespace-pre-wrap font-mono" style={{ color: 'var(--color-text)' }}>{previewLesson.expectedOutput}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 border-t flex justify-end gap-2" style={{ borderTopColor: 'var(--color-border)' }}>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => setPreviewLesson(null)}
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
