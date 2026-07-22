import { Navigate, Route, Routes } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SignInPage } from './pages/SignInPage'
import { SignUpPage } from './pages/SignUpPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { VerifyOtpPage } from './pages/VerifyOtpPage'
import { SignupOtpPage } from './pages/SignupOtpPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { DashboardPage } from './pages/DashboardPage'
import { AdminPage } from './pages/AdminPage'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { CourseListPage } from './pages/CourseListPage'
import { LessonViewPage } from './pages/LessonViewPage'
import { TestPage } from './pages/TestPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { API_BASE_URL } from './config/api'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import { DevelopmentPage } from './pages/DevelopmentPage'
import { IntermediateCoursePage } from './pages/IntermediateCoursePage'
import { PracticePage } from './pages/PracticePage'
import { ProfilePage } from './pages/ProfilePage'
import { SettingsPage } from './pages/SettingsPage'
import { AIBuddyPage } from './pages/AIBuddyPage'
import { ExamPage } from './pages/ExamPage'
import { ExamReviewPage } from './pages/ExamReviewPage'
import BeginnerCoursePage from './pages/beginner/BeginnerCoursePage'
import { AdvancedCoursePage } from './pages/AdvancedCoursePage'
import { ProgressProvider } from './context/ProgressContext'

function HealthPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/health`)
      if (!res.ok) throw new Error('Health check failed')
      return (await res.json()) as { status: string }
    },
    staleTime: 60_000,
  })

  return (
    <div className="card bg-base-100 shadow-xl p-8 max-w-md mx-auto">
      <h2 className="card-title text-2xl font-bold mb-4">Backend Status</h2>
      <div className="flex items-center gap-3">
        {isLoading && <span className="loading loading-spinner text-primary"></span>}
        {isError && <div className="badge badge-error gap-2 py-3 px-4">Offline</div>}
        {data && <div className="badge badge-success gap-2 py-3 px-4 font-bold">Online</div>}
      </div>
      {data && (
        <p className="mt-4 text-sm opacity-60">
          Everything is running smoothly. Happy coding!
        </p>
      )}
    </div>
  )
}

function StudentRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/health" element={<HealthPage />} />
      {/* Aliases: support conventional auth URLs */}
      <Route path="/login/*" element={<SignInPage />} />
      <Route path="/signup/*" element={<SignUpPage />} />
      <Route path="/forgot-password/*" element={<ForgotPasswordPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/verify-signup-otp" element={<SignupOtpPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      {/* Backwards-compatible routes */}
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />
      <Route path="/post-auth" element={<Navigate to="/dashboard" replace />} />
      <Route path="/onboarding" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/courses"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <CourseListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/intermediate"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <IntermediateCoursePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/advanced"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <AdvancedCoursePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:courseId"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <LessonViewPage />
          </ProtectedRoute>
        }
      />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/tests/:testId" element={<TestPage />} />
      <Route
        path="/exam/:level"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <ExamPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exam/:level/review"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <ExamReviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/beginner"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <BeginnerCoursePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/beginner/:classId"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <BeginnerCoursePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/development"
        element={
          <DevelopmentPage />
        }
      />
      <Route
        path="/practice"
        element={
          <PracticePage />
        }
      />
      <Route
        path="/ai-buddy"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <AIBuddyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ProgressProvider>
      <Routes>
        {/* Admin routes - standalone, no student Layout wrapper */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

        {/* Everything else - wrapped in student Layout */}
        <Route path="/*" element={<Layout><StudentRoutes /></Layout>} />
      </Routes>
    </ProgressProvider>
  )
}
