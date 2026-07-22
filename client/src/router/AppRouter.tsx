import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import App from '../App'
import { ProtectedRoute } from '../components/ProtectedRoute'

const HealthPage = lazy(() => import('../screens/HealthPage').then((m) => ({ default: m.HealthPage })))
const HomePage = lazy(() => import('../screens/HomePage').then((m) => ({ default: m.HomePage })))
const LoginPage = lazy(() => import('../screens/LoginPage').then((m) => ({ default: m.LoginPage })))
const SignupPage = lazy(() => import('../screens/SignupPage').then((m) => ({ default: m.SignupPage })))
const StudentDashboard = lazy(() => import('../screens/StudentDashboard').then((m) => ({ default: m.StudentDashboard })))
const AdminDashboard = lazy(() => import('../screens/AdminDashboard').then((m) => ({ default: m.AdminDashboard })))
const CoursesPage = lazy(() => import('../screens/CoursesPage').then((m) => ({ default: m.CoursesPage })))
const CourseDetailPage = lazy(() => import('../screens/CourseDetailPage').then((m) => ({ default: m.CourseDetailPage })))
const LessonPage = lazy(() => import('../screens/LessonPage').then((m) => ({ default: m.LessonPage })))

export function AppRouter() {
  return (
    <Suspense fallback={<div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">Loading...</div>}>
      <Routes>
        <Route element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<ProtectedRoute role="student" />}>
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:courseId" element={<CourseDetailPage />} />
            <Route path="/lessons/:lessonId" element={<LessonPage />} />
          </Route>
          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
          <Route path="/health" element={<HealthPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

