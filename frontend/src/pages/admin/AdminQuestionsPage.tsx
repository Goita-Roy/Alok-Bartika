import React, { useState, useEffect, useCallback, useRef } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import api from '../../config/api'
import {
  ClipboardList, Loader2, Save, Search, ChevronLeft, ChevronRight, RefreshCw,
  AlertTriangle, PlusCircle, Edit3, Trash2, Copy, Eye, X, ChevronDown,
  CheckCircle, XCircle,
} from 'lucide-react'

interface CourseItem {
  _id: string
  title: string
  level: string
}

interface QuestionItem {
  type: string
  questionText: string
  options?: string[]
  correctAnswer?: unknown
  points?: number
  difficulty?: string
  explanation?: string
  language?: string
  starterCode?: string
  expectedOutput?: string
  examId: string
  examTitle: string
  courseId: string
  courseTitle: string
  courseLevel: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const QUESTION_TYPES = [
  { value: 'mcq', label: 'Multiple Choice' },
  { value: 'truefalse', label: 'True/False' },
  { value: 'code-output', label: 'Code Output' },
  { value: 'coding', label: 'Coding' },
]

const DIFFICULTIES = ['easy', 'medium', 'hard']

const emptyForm = {
  _id: '',
  title: '',
  description: '',
  passingScore: 60,
  timeLimitMinutes: 30,
  isActive: true,
  courseId: '',
  level: '',
  questionsText: '',
}

export function AdminQuestionsPage() {
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [questions, setQuestions] = useState<QuestionItem[]>([])
  const [examForms, setExamForms] = useState<Record<string, typeof emptyForm>>({})
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [savingLevel, setSavingLevel] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 25, total: 0, pages: 0 })
  const [sortBy, setSortBy] = useState<string>('questionText')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const titleInputRef = useRef<HTMLInputElement>(null)
  const [questionPanelOpen, setQuestionPanelOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null)
  const [questionForm, setQuestionForm] = useState({
    questionText: '',
    type: 'mcq',
    options: ['', ''],
    correctAnswer: '',
    points: 1,
    explanation: '',
    difficulty: 'easy',
  })
  const [deleteTarget, setDeleteTarget] = useState<QuestionItem | null>(null)
  const [previewQuestion, setPreviewQuestion] = useState<QuestionItem | null>(null)
  const [previewExamOpen, setPreviewExamOpen] = useState(false)
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set())
  const [activeLevel, setActiveLevel] = useState<string>(LEVELS[0].value)
  const [activeAccordion, setActiveAccordion] = useState<string>('beginner')
  const [studentPreviewOpen, setStudentPreviewOpen] = useState(false)
  const [studentPreviewLevel, setStudentPreviewLevel] = useState<string>('')
  const [studentPreviewPage, setStudentPreviewPage] = useState(0)
  const [studentPreviewTimer, setStudentPreviewTimer] = useState(0)
  const [healthCheckOpen, setHealthCheckOpen] = useState(false)
  const [importTarget, setImportTarget] = useState<string | null>(null)
  const [publishTarget, setPublishTarget] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const loadSeqRef = useRef(0)

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
      style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent', cursor: 'pointer' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text)' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)' }}
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
      const response = await api.get('/courses', { params: { status: 'all' } })
      const courseList = response.data?.data || []
      setCourses(courseList)
    } catch {
      // course list is optional; the page still renders without it
    }
  }, [])

  const loadQuestions = useCallback(async (page = 1) => {
    const requestId = ++loadSeqRef.current
    try {
      setLoadingQuestions(true)
      setError(null)

      let allQuestions: QuestionItem[] = []

      try {
        const res = await api.get(`/exams/level/${activeLevel}`)
        const exam = res.data
        if (exam?.questions) {
          const course = courses.find(c => c.level === activeLevel) || { _id: '', title: '—', level: activeLevel }
          const qItems = exam.questions.map((q: Record<string, unknown>) => ({
            type: String(q.type || 'mcq'),
            questionText: String(q.questionText || 'Untitled'),
            options: Array.isArray(q.options) ? q.options as string[] : [],
            correctAnswer: q.correctAnswer,
            points: Number(q.points) || 1,
            difficulty: String(q.difficulty || 'easy'),
            explanation: String(q.explanation || ''),
            language: String(q.language || 'python'),
            starterCode: String(q.starterCode || ''),
            expectedOutput: String(q.expectedOutput || ''),
            examId: String(exam._id || ''),
            examTitle: String(exam.title || LEVELS.find(l => l.value === activeLevel)?.label || activeLevel),
            courseId: String(exam.courseId || course._id || ''),
            courseTitle: course.title || '—',
            courseLevel: course.level || activeLevel,
          } as QuestionItem))
          allQuestions = [...qItems]
        }
      } catch {
        // 404 (no exam for this level) is expected — the empty state is shown
      }

      // Apply search filter
      if (debouncedSearch.trim()) {
        const searchTerm = debouncedSearch.trim().toLowerCase()
        allQuestions = allQuestions.filter(q =>
          q.questionText.toLowerCase().includes(searchTerm) ||
          (q.options || []).some(opt => opt.toLowerCase().includes(searchTerm))
        )
      }

      // Apply course filter
      if (courseFilter !== 'all') {
        allQuestions = allQuestions.filter(q => q.courseId === courseFilter)
      }

      // Apply type filter
      if (typeFilter !== 'all') {
        allQuestions = allQuestions.filter(q => q.type === typeFilter)
      }

      // Apply sorting
      allQuestions.sort((a, b) => {
        const aVal = a[sortBy as keyof QuestionItem] || ''
        const bVal = b[sortBy as keyof QuestionItem] || ''
        const aStr = String(aVal).toLowerCase()
        const bStr = String(bVal).toLowerCase()
        if (aStr < bStr) return sortOrder === 'asc' ? -1 : 1
        if (aStr > bStr) return sortOrder === 'asc' ? 1 : -1
        return 0
      })

      const total = allQuestions.length
      const limitNum = 25
      const skip = (page - 1) * limitNum
      const pageData = allQuestions.slice(skip, skip + limitNum)

      if (requestId === loadSeqRef.current) {
        setQuestions(pageData)
        setPagination({
          page,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        })
      }
    } catch (err: any) {
      if (requestId === loadSeqRef.current) {
        setError(err.response?.data?.message || err.message || 'Failed to load questions')
      }
    } finally {
      if (requestId === loadSeqRef.current) {
        setLoadingQuestions(false)
      }
    }
  }, [debouncedSearch, courseFilter, typeFilter, sortBy, sortOrder, courses, activeLevel])

  useEffect(() => { loadCourses() }, [loadCourses])
  useEffect(() => { loadQuestions(1) }, [loadQuestions])
  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(search), 350); return () => clearTimeout(t) }, [search])

  const handleRefresh = () => { loadCourses(); loadQuestions(pagination.page) }

  const openNewQuestionPanel = () => {
    setEditingQuestion(null)
    setQuestionForm({ questionText: '', type: 'mcq', options: ['', ''], correctAnswer: '', points: 1, explanation: '', difficulty: 'easy' })
    setQuestionPanelOpen(true)
  }

  const openEditQuestionPanel = (question: QuestionItem) => {
    setEditingQuestion(question)
    setQuestionForm({
      questionText: question.questionText,
      type: question.type,
      options: question.options && question.options.length > 0 ? [...question.options] : ['', ''],
      correctAnswer: String(question.correctAnswer ?? ''),
      points: question.points ?? 1,
      explanation: '',
      difficulty: question.difficulty || 'easy',
    })
    setQuestionPanelOpen(true)
  }

  const closeQuestionPanel = () => { setQuestionPanelOpen(false); setEditingQuestion(null) }

  const isEditingQuestion = (q: QuestionItem) =>
    !!editingQuestion && editingQuestion.questionText === q.questionText && editingQuestion.points === q.points

  const handleDeleteQuestion = () => {
    if (!deleteTarget) return
    const target = deleteTarget
    setDeleteTarget(null)
    const level = target.courseLevel
    const form = examForms[level]
    if (!form) return
    let questions = []
    try { questions = JSON.parse(form.questionsText) } catch { return }
    const updated = questions.filter(
      (q: Record<string, unknown>) => !(q.questionText === target.questionText && q.points === target.points)
    )
    updateForm(level, { questionsText: JSON.stringify(updated, null, 2) })
    showToast('Question deleted', 'success')
    loadQuestions(pagination.page)
  }

  const handleDuplicateQuestion = (question: QuestionItem) => {
    const level = question.courseLevel
    const form = examForms[level]
    if (!form) return
    let questions = []
    try { questions = JSON.parse(form.questionsText) } catch { return }
    const duplicate = { ...question, questionText: question.questionText + ' (copy)' }
    questions.push(duplicate)
    updateForm(level, { questionsText: JSON.stringify(questions, null, 2) })
    showToast('Question duplicated', 'success')
    loadQuestions(pagination.page)
  }

  const handleSaveQuestion = () => {
    const { questionText, type, options, correctAnswer, points, explanation, difficulty } = questionForm
    if (!questionText.trim()) { showToast('Question text is required', 'error'); return }
    if (type === 'mcq' && options.some(o => !o.trim())) { showToast('All MCQ options are required', 'error'); return }
    if (!correctAnswer.trim()) { showToast('Correct answer is required', 'error'); return }
    const level = activeLevel
    const form = examForms[level]
    if (!form) return
    let questions = []
    try { questions = JSON.parse(form.questionsText) } catch { showToast('Invalid exam JSON', 'error'); return }
    if (editingQuestion) {
      const idx = questions.findIndex(
        (q: Record<string, unknown>) => q.questionText === editingQuestion.questionText && q.points === editingQuestion.points
      )
      if (idx !== -1) {
        questions[idx] = { ...questions[idx], questionText, type, options: type === 'mcq' ? options : undefined, correctAnswer, points, difficulty, explanation }
      }
    } else {
      questions.push({ type, questionText, options: type === 'mcq' ? options : undefined, correctAnswer, points, difficulty, explanation })
    }
    updateForm(level, { questionsText: JSON.stringify(questions, null, 2) })
    showToast(editingQuestion ? 'Question updated' : 'Question created', 'success')
    closeQuestionPanel()
    loadQuestions(pagination.page)
  }

  const handleMoveQuestion = (level: string, index: number, direction: 'up' | 'down') => {
    const form = examForms[level]
    if (!form) return
    let questions = []
    try { questions = JSON.parse(form.questionsText) } catch { return }
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= questions.length) return
    const [moved] = questions.splice(index, 1)
    questions.splice(newIndex, 0, moved)
    updateForm(level, { questionsText: JSON.stringify(questions, null, 2) })
    loadQuestions(pagination.page)
  }

  const handleToggleSelect = (questionKey: string) => {
    setSelectedQuestions(prev => {
      const next = new Set(prev)
      if (next.has(questionKey)) { next.delete(questionKey) } else { next.add(questionKey) }
      return next
    })
  }

  const handleSelectAll = (level: string) => {
    const form = examForms[level]
    if (!form) return
    let questions = []
    try { questions = JSON.parse(form.questionsText) } catch { return }
    if (selectedQuestions.size === questions.length) { setSelectedQuestions(new Set()) } else { setSelectedQuestions(new Set(questions.map((q: Record<string, unknown>) => `${q.questionText}-${q.points}`))) }
  }

  const getSelectedTotalMarks = (level: string) => {
    const form = examForms[level]
    if (!form) return 0
    let questions = []
    try { questions = JSON.parse(form.questionsText) } catch { return 0 }
    return questions.filter((q: Record<string, unknown>) => selectedQuestions.has(`${q.questionText}-${q.points}`)).reduce((sum: number, q: Record<string, unknown>) => sum + (Number(q.points) || 0), 0)
  }

  const getLevelStats = (level: string) => {
    const form = examForms[level]
    if (!form) return { total: 0, totalMarks: 0, mcqCount: 0, codingCount: 0 }
    let questions = []
    try { questions = JSON.parse(form.questionsText || '[]') } catch { return { total: 0, totalMarks: 0, mcqCount: 0, codingCount: 0 } }
    return {
      total: questions.length,
      totalMarks: questions.reduce((sum: number, q: Record<string, unknown>) => sum + (Number(q.points) || 0), 0),
      mcqCount: questions.filter((q: Record<string, unknown>) => q.type === 'mcq' || q.type === 'truefalse').length,
      codingCount: questions.filter((q: Record<string, unknown>) => q.type === 'coding' || q.type === 'code-output').length,
    }
  }

  const validateExamBeforeSave = (level: string): boolean => {
    const form = examForms[level]
    if (!form) return false
    if (!form.title.trim()) { showToast('Exam title is required', 'error'); return false }
    if (!form.courseId) { showToast('Select a course for this exam level first', 'error'); return false }
    let questions = []
    try { questions = JSON.parse(form.questionsText) } catch { showToast('Questions must be valid JSON', 'error'); return false }
    if (questions.length === 0) { showToast('At least one question is required', 'error'); return false }
    const totalMarks = questions.reduce((sum: number, q: Record<string, unknown>) => sum + (Number(q.points) || 0), 0)
    if (totalMarks <= 0) { showToast('Total marks must be greater than 0', 'error'); return false }
    for (const q of questions) {
      if (!q.questionText || !q.questionText.trim()) { showToast('All questions must have text', 'error'); return false }
      if ((q.type === 'mcq' || q.type === 'truefalse') && !q.correctAnswer && q.correctAnswer !== 0) { showToast(`MCQ/TrueFalse question "${q.questionText}" needs a correct answer`, 'error'); return false }
    }
    return true
  }

  const handleSaveExam = async (level: string) => { if (!validateExamBeforeSave(level)) return; await handleSave(level) }

  const getExamAnalytics = (level: string) => {
    const form = examForms[level]
    if (!form) return { total: 0, totalMarks: 0, avgMarks: 0, mcqCount: 0, codingCount: 0, trueFalseCount: 0, estimatedDuration: 0 }
    let questions = []
    try { questions = JSON.parse(form.questionsText || '[]') } catch { return { total: 0, totalMarks: 0, avgMarks: 0, mcqCount: 0, codingCount: 0, trueFalseCount: 0, estimatedDuration: 0 } }
    const total = questions.length
    const totalMarks = questions.reduce((s: number, q: Record<string, unknown>) => s + (Number(q.points) || 0), 0)
    const avgMarks = total > 0 ? (totalMarks / total) : 0
    const mcqCount = questions.filter((q: Record<string, unknown>) => q.type === 'mcq').length
    const codingCount = questions.filter((q: Record<string, unknown>) => q.type === 'coding').length
    const trueFalseCount = questions.filter((q: Record<string, unknown>) => q.type === 'truefalse').length
    const estimatedDuration = mcqCount * 1 + codingCount * 5
    return { total, totalMarks, avgMarks, mcqCount, codingCount, trueFalseCount, estimatedDuration }
  }

  const getDifficultyDistribution = (level: string) => {
    const form = examForms[level]
    if (!form) return { easy: 0, medium: 0, hard: 0, total: 0 }
    let questions = []
    try { questions = JSON.parse(form.questionsText || '[]') } catch { return { easy: 0, medium: 0, hard: 0, total: 0 } }
    const easy = questions.filter((q: Record<string, unknown>) => q.difficulty === 'easy').length
    const medium = questions.filter((q: Record<string, unknown>) => q.difficulty === 'medium').length
    const hard = questions.filter((q: Record<string, unknown>) => q.difficulty === 'hard').length
    return { easy, medium, hard, total: questions.length }
  }

  const getHealthCheck = (level: string): { check: string; status: 'pass' | 'fail' | 'warning'; message: string }[] => {
    const form = examForms[level]
    if (!form) return []
    let questions = []
    try { questions = JSON.parse(form.questionsText || '[]') } catch { return [{ check: 'Valid JSON', status: 'fail', message: 'Questions JSON is invalid' }] }
    const results: { check: string; status: 'pass' | 'fail' | 'warning'; message: string }[] = []
    if (questions.length === 0) { results.push({ check: 'At least one question', status: 'fail', message: 'No questions found' }) } else { results.push({ check: 'At least one question', status: 'pass', message: `${questions.length} question(s) found` }) }
    const totalMarks = questions.reduce((s: number, q: Record<string, unknown>) => s + (Number(q.points) || 0), 0)
    if (totalMarks <= 0) { results.push({ check: 'Total marks > 0', status: 'fail', message: `Total marks is ${totalMarks}` }) } else { results.push({ check: 'Total marks > 0', status: 'pass', message: `Total marks: ${totalMarks}` }) }
    let hasEmpty = false; let hasMissingCorrectAnswer = false; const questionTexts = new Set<string>(); let hasDuplicateQuestions = false; const difficulties = new Set<string>(); const types = new Set<string>()
    for (const q of questions) {
      if (!q.questionText || !String(q.questionText).trim()) { hasEmpty = true }
      if ((q.type === 'mcq' || q.type === 'truefalse') && (q.correctAnswer === undefined || q.correctAnswer === null)) { hasMissingCorrectAnswer = true }
      const key = String(q.questionText || '')
      if (questionTexts.has(key)) { hasDuplicateQuestions = true }
      questionTexts.add(key)
      if (q.difficulty) difficulties.add(String(q.difficulty))
      if (q.type) types.add(String(q.type))
    }
    if (hasEmpty) { results.push({ check: 'No empty questions', status: 'fail', message: 'Some questions have empty text' }) } else { results.push({ check: 'No empty questions', status: 'pass', message: 'All questions have text' }) }
    if (hasMissingCorrectAnswer) { results.push({ check: 'MCQ/TrueFalse has correct answer', status: 'fail', message: 'Some MCQ/TrueFalse questions missing correct answer' }) } else { results.push({ check: 'MCQ/TrueFalse has correct answer', status: 'pass', message: 'All MCQ/TrueFalse questions have correct answers' }) }
    if (hasDuplicateQuestions) { results.push({ check: 'No duplicate questions', status: 'warning', message: 'Some questions have duplicate text' }) } else { results.push({ check: 'No duplicate questions', status: 'pass', message: 'No duplicate questions found' }) }
    if (difficulties.size < 3 && questions.length >= 3) { results.push({ check: 'Varied difficulty', status: 'warning', message: `Only ${difficulties.size} difficulty level(s) used` }) } else if (questions.length >= 3) { results.push({ check: 'Varied difficulty', status: 'pass', message: 'Good difficulty distribution' }) }
    if (types.size < 2 && questions.length >= 3) { results.push({ check: 'Varied question types', status: 'warning', message: `Only ${types.size} question type(s) used` }) } else if (questions.length >= 3) { results.push({ check: 'Varied question types', status: 'pass', message: 'Good type distribution' }) }
    for (const q of questions) { if (q.type === 'mcq' && Array.isArray(q.options)) { const opts = q.options as string[]; const optSet = new Set(opts.map((o: string) => o.trim())); if (optSet.size < opts.length) { results.push({ check: 'No duplicate options', status: 'warning', message: `Question "${q.questionText}" has duplicate options` }); break } } }
    if (!results.some(r => r.check === 'No duplicate options')) { results.push({ check: 'No duplicate options', status: 'pass', message: 'No duplicate options found' }) }
    return results
  }

  const handlePublish = (level: string) => {
    const health = getHealthCheck(level)
    const hasFail = health.some(h => h.status === 'fail')
    if (hasFail) { showToast('Cannot publish: fix failing health checks first', 'error'); return }
    setPublishTarget(level)
  }

  const handleConfirmPublish = () => {
    if (!publishTarget) return
    const form = examForms[publishTarget]
    if (!form) return
    updateForm(publishTarget, { isActive: true })
    showToast(`${publishTarget} exam published`, 'success')
    setPublishTarget(null)
  }

  const handleUnpublish = (level: string) => {
    const form = examForms[level]
    if (!form) return
    updateForm(level, { isActive: false })
    showToast(`${level} exam unpublished`, 'success')
  }

  const handleStartStudentPreview = (level: string) => {
    setStudentPreviewLevel(level)
    setStudentPreviewPage(0)
    const form = examForms[level]
    if (form) { setStudentPreviewTimer((form.timeLimitMinutes || 30) * 60) }
    setStudentPreviewOpen(true)
  }

  const handleStudentPreviewNext = () => { setStudentPreviewPage(prev => prev + 1) }
  const handleStudentPreviewPrev = () => { setStudentPreviewPage(prev => Math.max(0, prev - 1)) }
  const handleFinishExam = () => { setStudentPreviewOpen(false); setStudentPreviewPage(0) }

  const handleExportQuestions = (level: string) => {
    const form = examForms[level]
    if (!form) return
    let questions = []
    try { questions = JSON.parse(form.questionsText || '[]') } catch { showToast('Invalid exam JSON', 'error'); return }
    const blob = new Blob([JSON.stringify(questions, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${level}-questions.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast(`Exported ${questions.length} questions`, 'success')
  }

  const handleImportQuestions = (level: string, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      let imported: unknown
      try { imported = JSON.parse(text) } catch { showToast('Invalid JSON file', 'error'); return }
      if (!Array.isArray(imported)) { showToast('Imported JSON must be an array of questions', 'error'); return }
      for (const q of imported) {
        if (typeof q !== 'object' || q === null) { showToast('Each question must be an object', 'error'); return }
        const qw = q as Record<string, unknown>
        if (!qw.questionText || typeof qw.questionText !== 'string') { showToast('Each question must have a questionText string', 'error'); return }
        if (!qw.type || typeof qw.type !== 'string') { showToast('Each question must have a type string', 'error'); return }
        if (qw.type === 'mcq') {
          if (!Array.isArray(qw.options) || qw.options.length === 0) { showToast('MCQ questions must have a non-empty options array', 'error'); return }
          if (qw.correctAnswer === undefined || qw.correctAnswer === null) { showToast('MCQ questions must have a correctAnswer', 'error'); return }
        }
        if (typeof qw.points !== 'number' || qw.points < 1) { showToast('Each question must have a points number >= 1', 'error'); return }
      }
      const form = examForms[level]
      if (!form) return
      updateForm(level, { questionsText: JSON.stringify(imported, null, 2) })
      showToast(`Imported ${imported.length} questions`, 'success')
      loadQuestions(pagination.page)
    }
    reader.readAsText(file)
  }

  const updateForm = (level: string, updates: Partial<typeof emptyForm>) => {
    setExamForms(prev => ({ ...prev, [level]: { ...(prev[level] || { ...emptyForm, level }), ...updates } }))
  }

  const handleSave = async (level: string) => {
    const form = examForms[level]
    if (!form) return
    if (!form.courseId) { showToast('Select a course for this exam level first', 'error'); return }
    if (!form.title.trim()) { showToast('Exam title is required', 'error'); return }
    try {
      setSavingLevel(level)
      setError(null)
      let questions = []
      try { questions = JSON.parse(form.questionsText) } catch { showToast('Questions must be valid JSON', 'error'); setSavingLevel(null); return }
      const payload = { courseId: form.courseId, level, title: form.title.trim(), description: form.description.trim(), passingScore: Number(form.passingScore), timeLimitMinutes: Number(form.timeLimitMinutes), isActive: form.isActive, questions }
      const response = form._id ? await api.put(`/exams/${form._id}`, payload) : await api.post('/exams', payload)
      const savedExam = response.data?.data || response.data
      updateForm(level, { _id: savedExam?._id || form._id, title: savedExam?.title || form.title, description: savedExam?.description || form.description, passingScore: savedExam?.passingScore || form.passingScore, timeLimitMinutes: savedExam?.timeLimitMinutes || form.timeLimitMinutes, isActive: savedExam?.isActive ?? form.isActive })
      showToast(`${level} exam saved successfully`, 'success')
      await Promise.all([loadExams(), loadQuestions(pagination.page)])
    } catch (err: any) { showToast(err.response?.data?.message || err.message || 'Failed to save exam', 'error') }
    finally { setSavingLevel(null) }
  }

  const loadExams = useCallback(async () => {
    const initialState: Record<string, typeof emptyForm> = {}
    LEVELS.forEach(level => {
      const matchingCourse = courses.find((course: CourseItem) => course.level === level.value)
      initialState[level.value] = { ...emptyForm, courseId: matchingCourse?._id || '', level: level.value }
    })
    setExamForms(initialState)
    await Promise.all(LEVELS.map(async level => {
      try {
        const res = await api.get(`/exams/level/${level.value}`)
        const exam = res.data
        const matchingCourse = courses.find((course: CourseItem) => course.level === level.value)
        if (exam) {
          initialState[level.value] = {
            _id: exam._id, title: exam.title || '', description: exam.description || '',
            passingScore: exam.passingScore || 60, timeLimitMinutes: exam.timeLimitMinutes || 30,
            isActive: exam.isActive !== false, courseId: matchingCourse?._id || exam.courseId || '',
            level: level.value, questionsText: JSON.stringify(exam.questions || [], null, 2),
          }
        }
      } catch {
        // 404 (no exam yet) is expected — the level form keeps its defaults
      }
    }))
    setExamForms(initialState)
  }, [courses])

  useEffect(() => { loadExams() }, [loadExams])

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'mcq': return '#3b82f6'
      case 'truefalse': return '#8b5cf6'
      case 'code-output': return '#f59e0b'
      case 'coding': return '#22c55e'
      default: return 'var(--color-text-muted)'
    }
  }

  const getLevelColor = (level: string): string => {
    switch (level) {
      case 'beginner': return '#3b82f6'
      case 'intermediate': return '#f59e0b'
      case 'advanced': return '#dc2626'
      default: return 'var(--color-text-muted)'
    }
  }

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'mcq': return 'MCQ'
      case 'truefalse': return 'True/False'
      case 'code-output': return 'Code Output'
      case 'coding': return 'Coding'
      default: return type
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Question and Exam Management</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Create and update the active exam for each learning level</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button type="button" onClick={() => openNewQuestionPanel()} className="btn btn-sm btn-outline" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
              <PlusCircle size={16} /> New Question
            </button>
            <button type="button" onClick={() => setImportTarget(activeLevel)} className="btn btn-sm btn-ghost" style={{ color: 'var(--color-text-muted)' }}>Import</button>
            <button type="button" onClick={() => handleExportQuestions(activeLevel)} className="btn btn-sm btn-ghost" style={{ color: 'var(--color-text-muted)' }}>Export</button>
            <button type="button" onClick={handleRefresh} className="btn btn-sm btn-ghost" style={{ color: 'var(--color-text-muted)' }}>
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold" style={{ backgroundColor: 'rgba(226,75,74,0.10)', color: 'var(--color-error)' }}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="toast toast-end toast-bottom z-50 animate-in slide-in-from-right duration-300">
            <div className={`alert ${toast.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-sm font-semibold`} style={{ border: 'none' }}>
              {toast.message}
            </div>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
{[
             { label: 'Total Questions', value: pagination.total, icon: ClipboardList, color: '#3b82f6' },
             { label: 'Published', value: examForms[activeLevel]?.isActive ? 1 : 0, icon: CheckCircle, color: '#22c55e' },
             { label: 'Draft', value: examForms[activeLevel]?.isActive ? 0 : 1, icon: XCircle, color: '#f59e0b' },
             { label: 'Total Marks', value: questions.reduce((sum, q) => sum + (q.points || 0), 0), icon: ClipboardList, color: '#8b5cf6' },
           ].map(c => {
            const Icon = c.icon
            return (
              <div key={c.label} className="group card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="card-body p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110" style={{ backgroundColor: `${c.color}15` }}>
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

        {/* Level selector toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            {LEVELS.map(level => {
              const isActive = activeLevel === level.value
              const count = getLevelStats(level.value).total
              return (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setActiveLevel(level.value)}
                  className="relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                  style={isActive
                    ? { backgroundColor: 'var(--color-accent)', color: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }
                    : { color: 'var(--color-text-muted)', cursor: 'pointer' }}
                  onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--color-text)' }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)' }}
                >
                  {level.label}
                  <span
                    className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-bold transition-colors duration-200"
                    style={isActive
                      ? { backgroundColor: 'rgba(255,255,255,0.22)', color: '#fff' }
                      : { backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' }}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
            <ClipboardList size={14} style={{ color: 'var(--color-accent)' }} />
            {LEVELS.find(l => l.value === activeLevel)?.label || activeLevel} · {pagination.total} question{pagination.total === 1 ? '' : 's'}
          </div>
        </div>

        {/* Filters — sticky */}
        <div className="sticky top-0 z-10 flex flex-col sm:flex-row gap-3 py-2" style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input type="text" className="input input-sm w-full pl-9" placeholder="Search by question or options..." value={search} onChange={e => setSearch(e.target.value)} style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
          </div>
          <select className="select select-sm" value={courseFilter} onChange={e => setCourseFilter(e.target.value)} style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>{course.title}</option>
            ))}
          </select>
          <select className="select select-sm" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
            <option value="all">All Types</option>
            {QUESTION_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Questions table */}
        <div key={activeLevel} className="space-y-4 animate-in fade-in duration-200">
          {loadingQuestions ? (
            <div className="card p-8 text-center shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <Loader2 size={24} className="mx-auto animate-spin" style={{ color: 'var(--color-accent)' }} />
              <p className="mt-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading questions…</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="card p-10 text-center shadow-sm animate-in fade-in duration-200" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="flex flex-col items-center max-w-sm mx-auto">
                {/* Illustration */}
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 rounded-2xl rotate-6" style={{ backgroundColor: `${getLevelColor(activeLevel)}0d`, border: '1px solid var(--color-border)' }} />
                  <div className="absolute inset-0 rounded-2xl -rotate-6" style={{ backgroundColor: `${getLevelColor(activeLevel)}14`, border: '1px solid var(--color-border)' }} />
                  <div className="absolute inset-2 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent-pale)' }}>
                    <ClipboardList size={40} style={{ color: 'var(--color-accent)', opacity: 0.5 }} />
                  </div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                    <PlusCircle size={18} style={{ color: '#fff' }} />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>No questions found</h3>
                <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
                  {debouncedSearch || courseFilter !== 'all' || typeFilter !== 'all'
                    ? 'No questions match your search or filter criteria. Try adjusting or clearing your filters.'
                    : `The ${LEVELS.find(l => l.value === activeLevel)?.label || activeLevel} exam has no questions yet. Create the first question to get started.`}
                </p>
                {!debouncedSearch && courseFilter === 'all' && typeFilter === 'all' ? (
                  <button type="button" className="btn btn-sm btn-primary gap-1.5 px-5" onClick={() => openNewQuestionPanel()}>
                    <PlusCircle size={16} /> Create Question
                  </button>
                ) : (
                  <button type="button" className="btn btn-sm btn-ghost gap-1.5" onClick={() => { setSearch(''); setCourseFilter('all'); setTypeFilter('all') }}>
                    <X size={16} /> Clear Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Desktop flat table */}
              <div className="hidden md:block card shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="overflow-x-auto">
                  <table className="table table-sm w-full">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, backgroundColor: 'var(--color-surface)', zIndex: 10 }}>
                        <th className="text-xs font-semibold uppercase tracking-wider py-3 px-2" style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent', width: '40px' }}>#</th>
                        <th style={{ backgroundColor: 'transparent' }}><SortableHeader field="questionText" label="Question" /></th>
                        <th className="text-xs font-semibold uppercase tracking-wider py-3 px-4" style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}>Type</th>
                        <th style={{ backgroundColor: 'transparent' }}><SortableHeader field="points" label="Marks" /></th>
                        <th className="text-xs font-semibold uppercase tracking-wider py-3 px-4" style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}>Status</th>
                        <th className="text-xs font-semibold uppercase tracking-wider py-3 px-4" style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questions.map((q, qi) => {
                        const isEditing = isEditingQuestion(q)
                        return (
                        <tr key={`${q.examId}-${qi}`} className="transition-colors duration-150"
                          style={{
                            borderBottom: '1px solid var(--color-border)',
                            backgroundColor: isEditing ? 'var(--color-accent-pale)' : 'transparent',
                            boxShadow: isEditing ? 'inset 3px 0 0 0 var(--color-accent)' : 'none',
                          }}>
                          <td className="px-2 py-3 text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>{qi + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{q.questionText}</p>
                              {isEditing && (
                                <span className="badge badge-sm font-semibold gap-1 animate-in fade-in duration-200" style={{ backgroundColor: 'var(--color-accent)', color: '#fff', border: 'none' }}>
                                  <Edit3 size={10} /> Editing
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="badge badge-sm font-semibold capitalize" style={{ backgroundColor: `${getTypeColor(q.type)}20`, color: getTypeColor(q.type), border: 'none' }}>
                              {getTypeLabel(q.type)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text)' }}>{q.points}</td>
                          <td className="px-4 py-3 text-xs">
                            <span className={`badge badge-sm font-semibold ${examForms[activeLevel]?.isActive ? 'badge-success' : 'badge-warning'}`}>
                              {examForms[activeLevel]?.isActive ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-1">
                              <button type="button" className="btn btn-sm btn-ghost" onClick={() => openEditQuestionPanel(q)} title="Edit" style={{ color: 'var(--color-accent)' }}><Edit3 size={14} /></button>
                              <button type="button" className="btn btn-sm btn-ghost" onClick={() => setDeleteTarget(q)} title="Delete" style={{ color: 'var(--color-error)' }}><Trash2 size={14} /></button>
                              <button type="button" className="btn btn-sm btn-ghost" onClick={() => handleDuplicateQuestion(q)} title="Duplicate" style={{ color: 'var(--color-text-muted)' }}><Copy size={14} /></button>
                              <button type="button" className="btn btn-sm btn-ghost" onClick={() => setPreviewQuestion(q)} title="Preview" style={{ color: 'var(--color-text-muted)' }}><Eye size={14} /></button>
                            </div>
                          </td>
                        </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {questions.map((q, qi) => {
                  const isEditing = isEditingQuestion(q)
                  return (
                  <div key={`${q.examId}-${qi}`} className="card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                    style={{
                      backgroundColor: isEditing ? 'var(--color-accent-pale)' : 'var(--color-surface)',
                      border: `1px solid ${isEditing ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      animationDelay: `${qi * 30}ms`,
                      boxShadow: isEditing ? '0 0 0 1px var(--color-accent)' : 'none',
                    }}>
                    <div className="card-body flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-bold mt-1" style={{ color: 'var(--color-text-muted)' }}>{qi + 1}</span>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="badge badge-sm font-semibold capitalize" style={{ backgroundColor: `${getTypeColor(q.type)}20`, color: getTypeColor(q.type), border: 'none' }}>
                              {getTypeLabel(q.type)}
                            </span>
                            {isEditing && (
                              <span className="badge badge-sm font-semibold gap-1 animate-in fade-in duration-200" style={{ backgroundColor: 'var(--color-accent)', color: '#fff', border: 'none' }}>
                                <Edit3 size={10} /> Editing
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={`badge badge-sm font-semibold ${examForms[activeLevel]?.isActive ? 'badge-success' : 'badge-warning'}`}>
                          {examForms[activeLevel]?.isActive ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{q.questionText}</h3>
                      {q.options && q.options.length > 0 && (<p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{q.options.join(', ')}</p>)}
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{q.courseTitle} · {q.examTitle} · {q.difficulty || '—'} · {q.points}pts</p>
                      <div className="flex gap-2 flex-wrap items-center">
                        <button type="button" className="btn btn-sm btn-ghost" onClick={() => openEditQuestionPanel(q)} style={{ color: 'var(--color-accent)' }}><Edit3 size={14} /></button>
                        <button type="button" className="btn btn-sm btn-ghost" onClick={() => setDeleteTarget(q)} style={{ color: 'var(--color-error)' }}><Trash2 size={14} /></button>
                        <button type="button" className="btn btn-sm btn-ghost" onClick={() => handleDuplicateQuestion(q)} style={{ color: 'var(--color-text-muted)' }}><Copy size={14} /></button>
                        <button type="button" className="btn btn-sm btn-ghost" onClick={() => setPreviewQuestion(q)} style={{ color: 'var(--color-text-muted)' }}><Eye size={14} /></button>
                      </div>
                    </div>
                  </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-1">
              <button className="btn btn-sm btn-ghost" disabled={pagination.page <= 1} onClick={() => loadQuestions(pagination.page - 1)} style={{ color: 'var(--color-text-muted)' }}>
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(pagination.pages - 4, pagination.page - 2)) + i
                if (pageNum > pagination.pages) return null
                return (
                  <button key={pageNum} className={`btn btn-sm ${pageNum === pagination.page ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => loadQuestions(pageNum)}
                    style={pageNum === pagination.page ? {} : { color: 'var(--color-text-muted)' }}>
                    {pageNum}
                  </button>
                )
              })}
              <button className="btn btn-sm btn-ghost" disabled={pagination.page >= pagination.pages} onClick={() => loadQuestions(pagination.page + 1)} style={{ color: 'var(--color-text-muted)' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-in fade-in duration-200">
            <div className="card shadow-xl max-w-md w-full mx-4 animate-in zoom-in duration-200" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="card-body">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle size={24} style={{ color: 'var(--color-error)' }} />
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>Delete Question</h3>
                </div>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Are you sure you want to delete this question? This action cannot be undone.</p>
                <div className="flex gap-2 justify-end mt-4">
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
                  <button type="button" className="btn btn-sm btn-error" onClick={handleDeleteQuestion}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Question Modal */}
        {previewQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-in fade-in duration-200">
            <div className="card shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto animate-in zoom-in duration-200" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>Preview Question</h3>
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => setPreviewQuestion(null)}><X size={16} /></button>
                </div>
                <div className="space-y-3">
                  <div><span className="badge badge-sm font-semibold capitalize" style={{ backgroundColor: `${getTypeColor(previewQuestion.type)}20`, color: getTypeColor(previewQuestion.type), border: 'none' }}>{getTypeLabel(previewQuestion.type)}</span></div>
                  <p className="font-semibold" style={{ color: 'var(--color-text)' }}>{previewQuestion.questionText}</p>
                  {previewQuestion.options && previewQuestion.options.length > 0 && (
                    <ul className="space-y-1">
                      {previewQuestion.options.map((opt, i) => (
                        <li key={i} className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{String.fromCharCode(65 + i)}. {opt}</li>
                      ))}
                    </ul>
                  )}
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}><strong>Correct Answer:</strong> {String(previewQuestion.correctAnswer)}</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}><strong>Points:</strong> {previewQuestion.points}</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}><strong>Difficulty:</strong> <span className="capitalize">{previewQuestion.difficulty || '—'}</span></p>
                  {previewQuestion.explanation && (<p className="text-sm" style={{ color: 'var(--color-text-muted)' }}><strong>Explanation:</strong> {previewQuestion.explanation}</p>)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Exam Preview Modal */}
        {previewExamOpen && (() => {
          const form = examForms[activeLevel]
          if (!form) return null
          let questions = []
          try { questions = JSON.parse(form.questionsText || '[]') } catch { questions = [] }
          const totalMinutes = form.timeLimitMinutes || 30
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-in fade-in duration-200">
              <div className="card shadow-xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto animate-in zoom-in duration-200" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="card-body">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>Exam Preview — {form.title || activeLevel} Exam</h3>
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => setPreviewExamOpen(false)}><X size={16} /></button>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Timer:</span>
                      <span className="text-sm font-bold" style={{ color: totalMinutes * 60 - studentPreviewTimer < 60 ? '#dc2626' : 'var(--color-text)' }}>
                        {Math.floor(studentPreviewTimer / 60)}:{String(studentPreviewTimer % 60).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Progress:</span>
                      <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{studentPreviewPage + 1} / {questions.length}</span>
                    </div>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${questions.length > 0 ? ((studentPreviewPage + 1) / questions.length) * 100 : 0}%`, backgroundColor: 'var(--color-accent)' }} />
                    </div>
                  </div>
                  {questions.length > 0 && (
                    <div className="space-y-3">
                      {questions.map((q: Record<string, unknown>, qi: number) => {
                        if (qi !== studentPreviewPage) return null
                        return (
                          <div key={qi} className="rounded-lg p-4" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                            <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{qi + 1}. {String(q.questionText || '')}</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>({String(q.type || '')}) — {Number(q.points) || 0} pts — Difficulty: {String(q.difficulty || '—').toLowerCase()}</p>
                            {Array.isArray(q.options) && q.options.length > 0 && (
                              <ul className="mt-2 space-y-1">
                                {q.options.map((opt: string, oi: number) => (
                                  <li key={oi} className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{String.fromCharCode(65 + oi)}. {opt}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <button type="button" className="btn btn-sm btn-ghost" disabled={studentPreviewPage <= 0} onClick={handleStudentPreviewPrev} style={{ color: 'var(--color-text-muted)' }}>Previous</button>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{studentPreviewPage + 1} of {questions.length}</span>
                    {studentPreviewPage < questions.length - 1 ? (
                      <button type="button" className="btn btn-sm btn-primary" onClick={handleStudentPreviewNext}>Next</button>
                    ) : (
                      <button type="button" className="btn btn-sm btn-success" onClick={() => { if (window.confirm('Are you sure you want to finish the exam?')) { handleFinishExam() } }}>Finish Exam</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Import Confirmation Modal */}
        {importTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-in fade-in duration-200">
            <div className="card shadow-xl max-w-md w-full mx-4 animate-in zoom-in duration-200" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="card-body">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle size={24} style={{ color: 'var(--color-error)' }} />
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>Import Questions</h3>
                </div>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>This will replace all existing questions for the {LEVELS.find(l => l.value === importTarget)?.label} exam. Are you sure?</p>
                <div className="flex gap-2 justify-end mt-4">
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => setImportTarget(null)}>Cancel</button>
                  <button type="button" className="btn btn-sm btn-primary" onClick={() => { fileInputRef.current?.click() }}>Choose File</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <input type="file" accept=".json" ref={fileInputRef} className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file && importTarget) { handleImportQuestions(importTarget, file) } setImportTarget(null); if (fileInputRef.current) { fileInputRef.current.value = '' } }} />

        {/* Exam editor panels — accordion */}
        <div className="space-y-4">
          {LEVELS.map((level) => {
            const form = examForms[level.value]
            if (!form) return null
            const stats = getLevelStats(level.value)
            const isOpen = activeAccordion === level.value
            return (
              <div key={level.value} className="card shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <button type="button" className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={() => setActiveAccordion(isOpen ? '' : level.value)}
                  style={{ color: 'var(--color-text)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${getLevelColor(level.value)}15` }}>
                      <ClipboardList size={16} style={{ color: getLevelColor(level.value) }} />
                    </div>
                    <div>
                      <h2 className="font-semibold text-sm">{level.label} Exam</h2>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{stats.total} questions · {stats.totalMarks} marks</p>
                    </div>
                  </div>
                  <ChevronDown size={18} className="transition-transform duration-200 shrink-0" style={{ color: 'var(--color-text-muted)', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>
                <div className="overflow-hidden transition-all duration-250 ease-in-out" style={{ maxHeight: isOpen ? '2000px' : '0px', opacity: isOpen ? 1 : 0 }}>
                  <div className="px-5 pb-5 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="card-body gap-4 p-0">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <ClipboardList size={18} style={{ color: 'var(--color-accent)' }} />
                          <h2 className="text-lg font-semibold">{level.label} exam</h2>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" className="btn btn-sm btn-ghost" onClick={() => setImportTarget(level.value)} style={{ color: 'var(--color-text-muted)' }}>Import</button>
                          <button type="button" className="btn btn-sm btn-ghost" onClick={() => handleExportQuestions(level.value)} style={{ color: 'var(--color-text-muted)' }}>Export</button>
                          <button type="button" className="btn btn-sm btn-ghost" onClick={() => { setActiveLevel(level.value); setStudentPreviewPage(0); setStudentPreviewTimer((form.timeLimitMinutes || 30) * 60); setPreviewExamOpen(true) }} style={{ color: 'var(--color-text-muted)' }}>
                            <Eye size={14} /> Preview
                          </button>
                          <button type="button" className="btn btn-sm btn-primary" onClick={() => handleSaveExam(level.value)} disabled={savingLevel === level.value}>
                            {savingLevel === level.value ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
                          </button>
                        </div>
                      </div>

                      {/* Live Statistics */}
                      {(() => {
                        const analytics = getExamAnalytics(level.value)
                        const difficulty = getDifficultyDistribution(level.value)
                        const health = getHealthCheck(level.value)
                        const isPublished = form.isActive
                        const mcqPct = analytics.total > 0 ? ((analytics.mcqCount + analytics.trueFalseCount) / analytics.total) * 100 : 0
                        const codingPct = analytics.total > 0 ? (analytics.codingCount / analytics.total) * 100 : 0
                        const avgDifficulty = difficulty.total > 0 ? (difficulty.easy * 1 + difficulty.medium * 2 + difficulty.hard * 3) / difficulty.total : 0
                        return (
                          <>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div className="rounded-xl p-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                                <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Total Questions</p>
                                <p className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{analytics.total}</p>
                              </div>
                              <div className="rounded-xl p-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                                <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Total Marks</p>
                                <p className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{analytics.totalMarks}</p>
                              </div>
                              <div className="rounded-xl p-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                                <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Avg Marks</p>
                                <p className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{analytics.avgMarks.toFixed(1)}</p>
                              </div>
                              <div className="rounded-xl p-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                                <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Est. Duration</p>
                                <p className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{analytics.estimatedDuration} min</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div className="rounded-xl p-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                                <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>MCQ %</p>
                                <p className="text-xl font-bold" style={{ color: '#3b82f6' }}>{mcqPct.toFixed(0)}%</p>
                              </div>
                              <div className="rounded-xl p-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                                <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Coding %</p>
                                <p className="text-xl font-bold" style={{ color: '#22c55e' }}>{codingPct.toFixed(0)}%</p>
                              </div>
                              <div className="rounded-xl p-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                                <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Avg Difficulty</p>
                                <p className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{avgDifficulty < 1.5 ? 'Easy' : avgDifficulty < 2.5 ? 'Medium' : 'Hard'}</p>
                              </div>
                              <div className="rounded-xl p-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                                <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Status</p>
                                <span className={`badge badge-sm font-semibold ${isPublished ? 'badge-success' : 'badge-warning'}`}>{isPublished ? 'Published' : 'Draft'}</span>
                              </div>
                            </div>

                            {/* Difficulty Distribution */}
                            {difficulty.total > 0 && (
                              <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                                <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Difficulty Distribution</p>
                                <div className="space-y-2">
                                  {(['easy', 'medium', 'hard'] as const).map((d, di) => {
                                    const count = difficulty[d]
                                    const pct = difficulty.total > 0 ? (count / difficulty.total) * 100 : 0
                                    return (
                                      <div key={d} className="flex items-center gap-2 animate-in slide-in-from-left duration-200" style={{ animationDelay: `${di * 100}ms` }}>
                                        <span className="text-xs capitalize w-16" style={{ color: 'var(--color-text-muted)' }}>{d}</span>
                                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                                          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: d === 'easy' ? '#22c55e' : d === 'medium' ? '#f59e0b' : '#dc2626' }} />
                                        </div>
                                        <span className="text-xs font-semibold w-8 text-right" style={{ color: 'var(--color-text-muted)' }}>{count}</span>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Publish / Draft */}
                            <div className="flex items-center gap-2">
                              {isPublished ? (
                                <button type="button" className="btn btn-sm btn-warning" onClick={() => handleUnpublish(level.value)}>Unpublish</button>
                              ) : (
                                <button type="button" className="btn btn-sm btn-success" onClick={() => handlePublish(level.value)}>Publish</button>
                              )}
                              <button type="button" className="btn btn-sm btn-ghost" onClick={() => setHealthCheckOpen(true)} style={{ color: 'var(--color-text-muted)' }}>Health Check</button>
                            </div>

                            {/* Health Check */}
                            {healthCheckOpen && (
                              <div className="rounded-xl p-3 mt-3 animate-in fade-in duration-300" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                                <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Health Check</p>
                                <div className="space-y-1">
                                  {health.map((h, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs animate-in slide-in-from-left duration-200" style={{ animationDelay: `${i * 50}ms` }}>
                                      {h.status === 'pass' && <CheckCircle size={12} style={{ color: '#22c55e' }} />}
                                      {h.status === 'fail' && <XCircle size={12} style={{ color: '#dc2626' }} />}
                                      {h.status === 'warning' && <AlertTriangle size={12} style={{ color: '#f59e0b' }} />}
                                      <span style={{ color: 'var(--color-text-muted)' }}>{h.check}:</span>
                                      <span style={{ color: h.status === 'pass' ? '#22c55e' : h.status === 'fail' ? '#dc2626' : '#f59e0b' }}>{h.message}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )
                      })()}

                      {/* Publish Confirmation Modal */}
                      {publishTarget && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                          <div className="card shadow-xl max-w-md w-full mx-4" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <div className="card-body">
                              <div className="flex items-center gap-3 mb-2">
                                <AlertTriangle size={24} style={{ color: '#f59e0b' }} />
                                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>Publish Exam</h3>
                              </div>
                              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Are you sure you want to publish the {LEVELS.find(l => l.value === publishTarget)?.label} exam? Students will be able to take this exam.</p>
                              <div className="flex gap-2 justify-end mt-4">
                                <button type="button" className="btn btn-sm btn-ghost" onClick={() => setPublishTarget(null)}>Cancel</button>
                                <button type="button" className="btn btn-sm btn-success" onClick={handleConfirmPublish}>Publish</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid gap-4 lg:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Course</label>
                          <select value={form.courseId || ''} onChange={(e) => updateForm(level.value, { courseId: e.target.value })} className="select select-sm w-full mt-1" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                            <option value="">Select a course</option>
                            {courses.filter(course => course.level === level.value).map(course => (
                              <option key={course._id} value={course._id}>{course.title}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Exam Title</label>
                          <input value={form.title || ''} onChange={(e) => updateForm(level.value, { title: e.target.value })} className="input input-sm w-full mt-1" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Description</label>
                        <textarea value={form.description || ''} onChange={(e) => updateForm(level.value, { description: e.target.value })} className="textarea textarea-sm w-full mt-1" rows={3} style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Pass Mark (%)</label>
                          <input type="number" value={form.passingScore || 60} onChange={(e) => updateForm(level.value, { passingScore: Number(e.target.value) || 60 })} className="input input-sm w-full mt-1" min={0} max={100} style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                        </div>
                        <div>
                          <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Time Limit (min)</label>
                          <input type="number" value={form.timeLimitMinutes || 30} onChange={(e) => updateForm(level.value, { timeLimitMinutes: Number(e.target.value) || 30 })} className="input input-sm w-full mt-1" min={1} style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                        </div>
                        <div>
                          <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Total Marks</label>
                          <input type="number" value={stats.totalMarks} readOnly className="input input-sm w-full mt-1" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }} />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Total Questions</label>
                        <input type="number" value={stats.total} readOnly className="input input-sm w-full mt-1" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }} />
                      </div>
                      <div>
                        <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Questions (JSON)</label>
                        <textarea value={form.questionsText || ''} onChange={(e) => updateForm(level.value, { questionsText: e.target.value })} className="textarea textarea-sm w-full mt-1 font-mono text-xs" rows={10} style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} placeholder='[{"type":"mcq","questionText":"...","options":["A","B"],"correctAnswer":"A","points":1}]' />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Question Editor Panel */}
        {questionPanelOpen && (
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-base-100 shadow-xl transform transition-all duration-300 ease-in-out animate-in slide-in-from-right duration-300" style={{ borderLeft: '1px solid var(--color-border)' }}>
            <div className="flex flex-col h-full">
              <div className="px-4 py-3 border-b shrink-0 flex items-center justify-between" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>{editingQuestion ? 'Edit Question' : 'New Question'}</h2>
                <button type="button" className="btn btn-sm btn-ghost" onClick={closeQuestionPanel}><X size={16} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Question Text</label>
                    <textarea value={questionForm.questionText} onChange={(e) => setQuestionForm(prev => ({ ...prev, questionText: e.target.value }))} className="textarea textarea-sm w-full mt-1" rows={3} style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Type</label>
                    <select value={questionForm.type} onChange={(e) => setQuestionForm(prev => ({ ...prev, type: e.target.value }))} className="select select-sm w-full mt-1" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                      {QUESTION_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  {questionForm.type === 'mcq' && (
                    <div>
                      <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Options</label>
                      <div className="space-y-2 mt-1">
                        {questionForm.options.map((opt, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>{String.fromCharCode(65 + i)}</span>
                            <input type="text" value={opt} onChange={(e) => { const newOpts = [...questionForm.options]; newOpts[i] = e.target.value; setQuestionForm(prev => ({ ...prev, options: newOpts })) }} className="input input-sm flex-1" placeholder={`Option ${String.fromCharCode(65 + i)}`} style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Correct Answer</label>
                    {questionForm.type === 'mcq' ? (
                      <select value={questionForm.correctAnswer} onChange={(e) => setQuestionForm(prev => ({ ...prev, correctAnswer: e.target.value }))} className="select select-sm w-full mt-1" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                        <option value="">Select correct answer</option>
                        {questionForm.options.map((opt, i) => (
                          <option key={i} value={opt}>{String.fromCharCode(65 + i)}. {opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input type="text" value={questionForm.correctAnswer} onChange={(e) => setQuestionForm(prev => ({ ...prev, correctAnswer: e.target.value }))} className="input input-sm w-full mt-1" placeholder="True or False" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Points</label>
                      <input type="number" value={questionForm.points} onChange={(e) => setQuestionForm(prev => ({ ...prev, points: Number(e.target.value) || 1 }))} className="input input-sm w-full mt-1" min={1} style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Difficulty</label>
                      <select value={questionForm.difficulty} onChange={(e) => setQuestionForm(prev => ({ ...prev, difficulty: e.target.value }))} className="select select-sm w-full mt-1" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Explanation (optional)</label>
                    <textarea value={questionForm.explanation} onChange={(e) => setQuestionForm(prev => ({ ...prev, explanation: e.target.value }))} className="textarea textarea-sm w-full mt-1" rows={2} style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                  </div>
                  <div className="flex gap-2 justify-end pt-4">
                    <button type="button" className="btn btn-sm btn-ghost" onClick={closeQuestionPanel}>Cancel</button>
                    <button type="button" className="btn btn-sm btn-primary" onClick={handleSaveQuestion}>{editingQuestion ? 'Update' : 'Create'} Question</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}