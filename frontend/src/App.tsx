import { Navigate, Route, Routes, Outlet } from 'react-router-dom'
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
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage'
import { AdminCoursesPage } from './pages/admin/AdminCoursesPage'
import { AdminLessonsPage } from './pages/admin/AdminLessonsPage'
import { AdminQuestionsPage } from './pages/admin/AdminQuestionsPage'
import { AdminSupportPage } from './pages/admin/AdminSupportPage'
import { AdminStudentSupportPage } from './pages/admin/AdminStudentSupportPage'
import { AdminFeedbackPage } from './pages/admin/AdminFeedbackPage'
import { AdminNoticesPage } from './pages/admin/AdminNoticesPage'
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage'
import { AdminExamMonitoringPage } from './pages/admin/AdminExamMonitoringPage'
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage'
import { SuperAdminLoginPage } from './pages/super-admin/SuperAdminLoginPage'
import { SuperAdminDashboardPage } from './pages/super-admin/SuperAdminDashboardPage'
import { SuperAdminAdminsPage } from './pages/super-admin/SuperAdminAdminsPage'
import { SuperAdminUsersPage } from './pages/super-admin/SuperAdminUsersPage'
import { SuperAdminRolesPage } from './pages/super-admin/SuperAdminRolesPage'
import { SuperAdminPlatformPage } from './pages/super-admin/SuperAdminPlatformPage'
import { SuperAdminSecurityPage } from './pages/super-admin/SuperAdminSecurityPage'
import { SuperAdminAnalyticsPage } from './pages/super-admin/SuperAdminAnalyticsPage'
import { SuperAdminBackupPage } from './pages/super-admin/SuperAdminBackupPage'
import { SuperAdminProfilePage } from './pages/super-admin/SuperAdminProfilePage'
import { CourseListPage } from './pages/CourseListPage'
import { LessonViewPage } from './pages/LessonViewPage'
import { TestPage } from './pages/TestPage'
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute'
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
import { FeedbackPage } from './pages/FeedbackPage'
import { FeedbackSuccessPage } from './pages/FeedbackSuccessPage'
import BeginnerCoursePage from './pages/beginner/BeginnerCoursePage'
import { AdvancedCoursePage } from './pages/AdvancedCoursePage'
import { ProgressProvider } from './context/ProgressContext'
import { SocketProvider } from './context/SocketContext'
import { StudentSupportPage } from './pages/StudentSupportPage'

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
      <Route path="/login/*" element={<GuestRoute><SignInPage /></GuestRoute>} />
      <Route path="/signup/*" element={<GuestRoute><SignUpPage /></GuestRoute>} />
      <Route path="/forgot-password/*" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
      <Route path="/verify-otp" element={<GuestRoute><VerifyOtpPage /></GuestRoute>} />
      <Route path="/verify-signup-otp" element={<GuestRoute><SignupOtpPage /></GuestRoute>} />
      <Route path="/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
      {/* Backwards-compatible routes */}
      <Route path="/sign-in/*" element={<GuestRoute><SignInPage /></GuestRoute>} />
      <Route path="/sign-up/*" element={<GuestRoute><SignUpPage /></GuestRoute>} />
      <Route path="/post-auth" element={<Navigate to="/dashboard" replace />} />
      <Route path="/onboarding" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/courses"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin', 'super-admin']}>
            <CourseListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/intermediate"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin', 'super-admin']}>
            <IntermediateCoursePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/advanced"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin', 'super-admin']}>
            <AdvancedCoursePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:courseId"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin', 'super-admin']}>
            <LessonViewPage />
          </ProtectedRoute>
        }
      />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route
        path="/support"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentSupportPage />
          </ProtectedRoute>
        }
      />
      <Route path="/tests/:testId" element={<TestPage />} />
      <Route
        path="/exam/:level"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin', 'super-admin']}>
            <ExamPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exam/:level/review"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin', 'super-admin']}>
            <ExamReviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/feedback/:level"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin', 'super-admin']}>
            <FeedbackPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/feedback/:level/success"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin', 'super-admin']}>
            <FeedbackSuccessPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/beginner"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin', 'super-admin']}>
            <BeginnerCoursePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/beginner/:classId"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin', 'super-admin']}>
            <BeginnerCoursePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin', 'super-admin']}>
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
          <ProtectedRoute allowedRoles={['student', 'admin', 'super-admin']}>
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
          <ProtectedRoute allowedRoles={['student', 'admin', 'super-admin']}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin', 'super-admin']}>
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
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin', 'super-admin']} redirectTo="/admin/login">
            <SocketProvider>
              <Outlet />
            </SocketProvider>
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="students" element={<AdminStudentsPage />} />
          <Route path="courses" element={<AdminCoursesPage />} />
          <Route path="lessons" element={<AdminLessonsPage />} />
          <Route path="questions" element={<AdminQuestionsPage />} />
          <Route path="exam-monitoring" element={<AdminExamMonitoringPage />} />
          <Route path="feedback" element={<AdminFeedbackPage />} />
          <Route path="support" element={<AdminStudentSupportPage />} />
          <Route path="notices" element={<AdminNoticesPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* Super admin routes - standalone, no student/admin Layout wrapper */}
        <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />
        <Route path="/super-admin/dashboard" element={<ProtectedRoute allowedRoles={['super-admin']} redirectTo="/super-admin/login"><SuperAdminDashboardPage /></ProtectedRoute>} />
        <Route path="/super-admin/admins" element={<ProtectedRoute allowedRoles={['super-admin']} redirectTo="/super-admin/login"><SuperAdminAdminsPage /></ProtectedRoute>} />
        <Route path="/super-admin/users" element={<ProtectedRoute allowedRoles={['super-admin']} redirectTo="/super-admin/login"><SuperAdminUsersPage /></ProtectedRoute>} />
        <Route path="/super-admin/roles" element={<ProtectedRoute allowedRoles={['super-admin']} redirectTo="/super-admin/login"><SuperAdminRolesPage /></ProtectedRoute>} />
        <Route path="/super-admin/platform" element={<ProtectedRoute allowedRoles={['super-admin']} redirectTo="/super-admin/login"><SuperAdminPlatformPage /></ProtectedRoute>} />
        <Route path="/super-admin/security" element={<ProtectedRoute allowedRoles={['super-admin']} redirectTo="/super-admin/login"><SuperAdminSecurityPage /></ProtectedRoute>} />
        <Route path="/super-admin/analytics" element={<ProtectedRoute allowedRoles={['super-admin']} redirectTo="/super-admin/login"><SuperAdminAnalyticsPage /></ProtectedRoute>} />
        <Route path="/super-admin/backup" element={<ProtectedRoute allowedRoles={['super-admin']} redirectTo="/super-admin/login"><SuperAdminBackupPage /></ProtectedRoute>} />
        <Route path="/super-admin/profile" element={<ProtectedRoute allowedRoles={['super-admin']} redirectTo="/super-admin/login"><SuperAdminProfilePage /></ProtectedRoute>} />

        {/* Everything else - wrapped in student Layout + SocketProvider for message center */}
        <Route path="/*" element={<SocketProvider><Layout><StudentRoutes /></Layout></SocketProvider>} />
      </Routes>
    </ProgressProvider>
  )
}
