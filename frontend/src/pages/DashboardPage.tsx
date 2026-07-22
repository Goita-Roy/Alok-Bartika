import { useState, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import {
  DashboardSidebar,
  DashboardSkeleton, DashboardTopHeader,
  LearningAnalyticsCards, WeeklyChart,
  TabChangeWarning, AchievementSection,
  FirstAttemptResultsSection,
  DailyChallengeCard,
} from '../components/dashboard'
import { WidgetErrorBoundary } from '../components/WidgetErrorBoundary'
import { SectionErrorCard, WidgetSkeleton } from '../components/Skeletons'
import { useStudentDashboardData } from '../hooks/useStudentDashboardData'
import { useFirstAttemptResults } from '../hooks/useFirstAttemptResults'
import { useCourseProgress } from '../hooks/useCourseProgress'
import { useLearningTracker } from '../hooks/useLearningTracker'
import { useTabChangeTracker } from '../hooks/useTabChangeTracker'
import { useDailyCodingTracker } from '../hooks/useDailyCodingTracker'
import { LeaderboardPage } from './LeaderboardPage'
import { BadgesPage } from './BadgesPage'
import type { SidebarItem } from '../data/dashboardData'

export function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { data, isLoading, isError, isOffline, retryCount, maxRetries, refetch } = useStudentDashboardData()
  const { results: firstAttemptResults, isLoading: farLoading, refetch: farRefetch } = useFirstAttemptResults()

  const { completedClassCount, completedLevels, apiLoaded } = useCourseProgress(
    { beginner: [], intermediate: [], advanced: [] },
    []
  )

  const { elapsedSeconds, isSessionRunning, isTabAway } = useLearningTracker()
  const { tabChangeCount, showWarning, dismissWarning } = useTabChangeTracker()
  const { codingSeconds } = useDailyCodingTracker(false)

  const sidebarItems = useMemo((): SidebarItem[] => {
    const items: SidebarItem[] = data?.sidebarItems ? [...data.sidebarItems] : []
    const lbIndex = items.findIndex(i => i.id === 'leaderboard')
    if (lbIndex >= 0) items[lbIndex] = { ...items[lbIndex], href: '/dashboard/leaderboard' }
    else items.push({ id: 'leaderboard', label: 'লিডারবোর্ড', href: '/dashboard/leaderboard', icon: 'Trophy' })
    if (!items.find(i => i.id === 'badges')) {
      items.push({ id: 'badges', label: 'ব্যাজ ও অর্জন', href: '/dashboard/badges', icon: 'Award' })
    }
    return items
  }, [data?.sidebarItems])

  const activeItemId = useMemo(() => {
    const sorted = [...sidebarItems].sort((a, b) => b.href.length - a.href.length)
    return sorted.find(i => location.pathname.startsWith(i.href))?.id || 'dashboard'
  }, [location.pathname, sidebarItems])

  const currentPage = useMemo(() => {
    const path = location.pathname
    if (path === '/dashboard/leaderboard') return 'leaderboard'
    if (path === '/dashboard/badges') return 'badges'
    return 'dashboard'
  }, [location.pathname])

  const progressStats = useMemo(() => {
    const badgesStat = data.stats?.find(s => s.id === 'badges')
    return {
      lessons: completedClassCount,
      courses: completedLevels.length,
      badges: Number(badgesStat?.value) || data.badges?.filter(b => b.earned).length || 0,
      streak: data.learningAnalytics?.todayMinutes ? Math.ceil(data.learningAnalytics.todayMinutes / 10) : 0,
    }
  }, [data, completedClassCount, completedLevels])

  // Global API failure (after retries) → show a non-blocking error card that
  // still lets the sidebar/header render. Widgets below are independently safe.
  const globalErrorBanner = isError ? (
    <SectionErrorCard
      title="ড্যাশবোর্ড ডেটা লোড হয়নি"
      retryLabel={retryCount > 0 ? `আবার চেষ্টা করুন (${retryCount}/${maxRetries})` : 'আবার চেষ্টা করুন'}
      onRetry={refetch}
    />
  ) : null

  // On the VERY FIRST load (no data yet, no cached defaults needed) show the
  // full skeleton so the layout doesn't jump; afterwards we render partial content.
  if (isLoading && !data) return <DashboardSkeleton />

  return (
    <div className="rounded-[24px] p-4 sm:p-6 lg:p-8"
      style={{ backgroundColor: '#E8F3EE' }}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-8">
        <DashboardSidebar
          items={sidebarItems}
          activeItemId={activeItemId}
          student={{ ...data.student, profile: data.student.profile }}
          mobileOpen={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
          xp={data.xp}
          badgesCount={progressStats.badges}
        />
        <main className="min-h-[70vh] space-y-6">
          {currentPage !== 'leaderboard' && (
            <DashboardTopHeader
              studentName={data.student.name}
              onOpenSidebar={() => setSidebarOpen(true)}
              level={data.xp.level}
              totalXP={data.xp.totalXP}
            />
          )}

          {currentPage === 'leaderboard' && (
            <LeaderboardPage />
          )}

          {currentPage === 'badges' && (
            <BadgesPage badges={data.badges} />
          )}

          {currentPage === 'dashboard' && (
            <div className="space-y-6">
              <TabChangeWarning visible={showWarning} onDismiss={dismissWarning} />

              {globalErrorBanner}

              <WidgetErrorBoundary title="দৈনিক চ্যালেঞ্জ" onRetry={refetch}>
                {data.challenge?.title ? (
                  <DailyChallengeCard challenge={data.challenge} />
                ) : (
                  <WidgetSkeleton height="h-28" />
                )}
              </WidgetErrorBoundary>

              <WidgetErrorBoundary title="লার্নিং অ্যানালিটিক্স" onRetry={refetch}>
                <LearningAnalyticsCards
                  todayMinutes={data.learningAnalytics.todayMinutes}
                  totalMinutes={data.learningAnalytics.totalMinutes}
                  elapsedSeconds={elapsedSeconds}
                  tabSwitchCount={tabChangeCount}
                  lastActiveAt={data.learningAnalytics.lastActiveAt}
                />
              </WidgetErrorBoundary>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <WidgetErrorBoundary title="সাপ্তাহিক শেখার সময়" onRetry={refetch}>
                  <WeeklyChart dailyLogs={data.learningAnalytics.dailyLogs} />
                </WidgetErrorBoundary>

                <WidgetErrorBoundary title="অর্জন" onRetry={refetch}>
                  <AchievementSection stats={progressStats} />
                </WidgetErrorBoundary>
              </div>

              <WidgetErrorBoundary title="পরীক্ষার ফলাফল" onRetry={() => { farRefetch(); refetch() }}>
                {farLoading ? (
                  <WidgetSkeleton height="h-40" />
                ) : (
                  <FirstAttemptResultsSection results={firstAttemptResults} />
                )}
              </WidgetErrorBoundary>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
