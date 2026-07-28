const { User } = require('../models/User')
const { Course } = require('../models/Course')
const { Lesson } = require('../models/Lesson')
const P = require('../services/progressService')

const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced']

function computeStreak(dailyLogs) {
  if (!Array.isArray(dailyLogs) || dailyLogs.length === 0) return 0
  const logMap = new Map(dailyLogs.map(d => [d.date, d.minutes || 0]))
  let streak = 0
  const today = new Date()
  for (let i = 0; ; i++) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i))
    const ds = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
    const mins = logMap.get(ds)
    if (mins && mins > 0) streak++
    else break
  }
  return streak
}

// @desc    Get dashboard data for the logged-in user
// @route   GET /api/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    // completedCourses / unlockedCourses remain Course ObjectIds and need populate.
    const user = await User.findById(req.user._id)
      .populate('completedCourses unlockedCourses lastVisitedCourse')
    if (!user) return res.status(404).json({ message: 'User not found' })

    const courses = await Course.find({}).sort({ level: 1 })
    const allLessons = await Lesson.find({}).populate('courseId', 'level').sort({ order: 1 })
    const slugOf = (l) => P.slugForLesson(l)

    const courseLevelById = {}
    courses.forEach((c) => { courseLevelById[c._id.toString()] = c.level })

    const totalLessons = allLessons.length
    const completedLessonSlugs = user.completedLessons || []
    const completedLessonCount = completedLessonSlugs.length
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessonCount / totalLessons) * 100) : 0

    const completedCourseIds = (user.completedCourses || []).map((c) => c._id?.toString() || c.toString())
    const unlockedCourseIds = (user.unlockedCourses || []).map((c) => c._id?.toString() || c.toString())

    const completedLevels = user.completedLevels || []

    let currentStage = user.currentStage || 'beginner'
    if (completedLevels.includes('beginner') && currentStage === 'beginner') currentStage = 'intermediate'
    if (completedLevels.includes('intermediate') && currentStage === 'intermediate') currentStage = 'advanced'

    const coursesForDashboard = courses.map((c) => {
      const courseLessons = allLessons.filter((l) => l.courseId?.toString() === c._id.toString())
      const courseCompletedLessons = courseLessons.filter((l) => completedLessonSlugs.includes(slugOf(l)))
      const courseProgress = courseLessons.length > 0
        ? Math.round((courseCompletedLessons.length / courseLessons.length) * 100)
        : 0
      const isCompleted = completedCourseIds.includes(c._id.toString())
      const isUnlocked = c.level === 'beginner' || unlockedCourseIds.includes(c._id.toString())
      return {
        _id: c._id,
        title: c.title,
        level: c.level,
        progress: courseProgress,
        status: isCompleted ? 'Completed' : (isUnlocked ? 'Active' : 'Locked'),
        description: c.description,
      }
    })

    const recentlyCompletedCourses = coursesForDashboard.filter((c) => c.status === 'Completed')
    const activeCourse = coursesForDashboard.find((c) => c.status === 'Active')

    const slugToLesson = {}
    allLessons.forEach((l) => { slugToLesson[slugOf(l)] = l })

    const activities = completedLessonSlugs
      .slice()
      .reverse()
      .slice(0, 10)
      .map((slug, i) => {
        const l = slugToLesson[slug]
        return {
          id: `act-${i}`,
          icon: 'CheckCircle2',
          text: l ? `সম্পন্ন করেছেন: ${l.title}` : `লেসন সম্পন্ন #${completedLessonCount - i}`,
          time: i === 0 ? 'সবশেষ' : `${i} আগে`,
          xp: 100,
        }
      })

    const badges = (user.badges || []).map((b, i) => ({
      id: `badge-${i}`,
      name: b.name,
      icon: b.icon === '🌱' ? 'Sparkles' : b.icon === '🔥' ? 'Rocket' : b.icon === '🏆' ? 'Trophy' : 'Sparkles',
      earned: true,
    }))

    const totalBadgeSlots = 6
    while (badges.length < totalBadgeSlots) {
      const lockedBadges = ['Bug Hunter', 'Fast Learner', 'Logic Master', 'Code Ninja', 'Top Ranker', 'Consistency Star']
      const next = lockedBadges[badges.length % lockedBadges.length]
      badges.push({ id: `badge-locked-${badges.length}`, name: next, icon: 'Sparkles', earned: false })
    }

    // Build leaderboard
    const allStudents = await User.find({ role: 'student' })
      .populate('completedCourses')
      .select('fullName profilePicture profile xp level completedLessons badges learningAnalytics lastActivityTime progressPercentage')
      .lean()

    const mapped = allStudents.map((u) => {
      const la = u.learningAnalytics || {}
      return {
        _id: u._id,
        fullName: u.fullName,
        avatar: u.profilePicture || u.profile?.avatar || '',
        level: u.level,
        xp: u.xp || 0,
        completedCourses: u.completedCourses?.length || 0,
        completedLessons: u.completedLessons?.length || 0,
        badgesCount: u.badges?.length || 0,
        totalMinutes: la.totalMinutes || 0,
        lastActiveAt: la.lastActiveAt || u.lastActivityTime || null,
        streak: computeStreak(la.dailyLogs),
        progressPercentage: u.progressPercentage || 0,
      }
    })

    mapped.sort((a, b) => {
      if (b.xp !== a.xp) return b.xp - a.xp
      if (b.completedCourses !== a.completedCourses) return b.completedCourses - a.completedCourses
      if (b.completedLessons !== a.completedLessons) return b.completedLessons - a.completedLessons
      if (b.totalMinutes !== a.totalMinutes) return b.totalMinutes - a.totalMinutes
      const aTime = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0
      const bTime = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0
      return bTime - aTime
    })

    const top10 = mapped.slice(0, 10)
    const currentUserIdStr = req.user._id.toString()
    const currentInTop10 = top10.find(e => e._id.toString() === currentUserIdStr)

    const leaderboard = top10.map((entry, i) => ({
      rank: i + 1,
      id: entry._id,
      name: entry.fullName,
      avatar: entry.avatar,
      level: entry.level,
      xp: entry.xp,
      completedCourses: entry.completedCourses,
      completedLessons: entry.completedLessons,
      badgesCount: entry.badgesCount,
      totalMinutes: entry.totalMinutes,
      lastActiveAt: entry.lastActiveAt,
      streak: entry.streak,
      progressPercentage: entry.progressPercentage,
      isCurrentUser: entry._id.toString() === currentUserIdStr,
    }))

    // If current user is outside top-10, append their data
    if (!currentInTop10) {
      const me = mapped.find(e => e._id.toString() === currentUserIdStr)
      if (me) {
        const myGlobalRank = mapped.findIndex(e => e._id.toString() === currentUserIdStr) + 1
        leaderboard.push({
          rank: myGlobalRank,
          id: me._id,
          name: me.fullName,
          avatar: me.avatar,
          level: me.level,
          xp: me.xp,
          completedCourses: me.completedCourses,
          completedLessons: me.completedLessons,
          badgesCount: me.badgesCount,
          totalMinutes: me.totalMinutes,
          lastActiveAt: me.lastActiveAt,
          streak: me.streak,
          progressPercentage: me.progressPercentage,
          isCurrentUser: true,
        })
      }
    }

    const greetingHour = new Date().getHours()
    let greeting
    if (greetingHour < 12) greeting = 'শুভ সকাল'
    else if (greetingHour < 17) greeting = 'শুভ বিকেল'
    else greeting = 'শুভ সন্ধ্যা'

    // Canonical Continue Learning resolution (single source of truth).
    const continueLearning = await P.getContinueLearning(user)
    const continueHref = continueLearning.continueUrl

    const la = user.learningAnalytics || {}
    let weeklyMinutes = 0
    if (Array.isArray(la.dailyLogs) && la.dailyLogs.length > 0) {
      const now = new Date()
      const day = now.getUTCDay()
      const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1)
      const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff))
      const mondayStr = `${monday.getUTCFullYear()}-${String(monday.getUTCMonth() + 1).padStart(2, '0')}-${String(monday.getUTCDate()).padStart(2, '0')}`
      const thisWeekLogs = la.dailyLogs.filter((d) => d.date >= mondayStr)
      weeklyMinutes = thisWeekLogs.reduce((sum, d) => sum + (d.minutes || 0), 0)
    }

    const todayStr = () => new Date().toISOString().slice(0, 10)
    const todayLog = Array.isArray(la.dailyLogs) ? la.dailyLogs.find((d) => d.date === todayStr()) : null

    res.json({
      student: {
        name: user.fullName,
        className: user.grade ? `Class ${user.grade}${user.section ? ` - ${user.section}` : ''}` : 'শিক্ষার্থী',
        avatar: user.fullName.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(),
        greeting,
        profilePicture: user.profilePicture || '',
        profile: user.profile || {},
      },
      xp: {
        totalXP: user.xp,
        level: user.level,
        currentLevelXP: user.xp % 1000,
        nextLevelXP: 1000,
      },
      stats: [
        {
          id: 'lessons',
          title: 'সম্পন্ন পাঠ',
          value: String(completedLessonCount),
          description: `${totalLessons} টির মধ্যে ${completedLessonCount} টি সম্পন্ন`,
          trend: `${progressPercentage}% অগ্রগতি`,
          trendUp: true,
          icon: 'BookOpen',
        },
        {
          id: 'badges',
          title: 'অর্জিত ব্যাজ',
          value: String(user.badges?.length || 0),
          description: 'উপার্জিত ব্যাজসমূহ',
          trend: currentStage ? `${currentStage === 'beginner' ? 'শিক্ষানবিশ' : currentStage === 'intermediate' ? 'মধ্যবর্তী' : 'উন্নত'} পর্যায়` : '',
          trendUp: true,
          icon: 'Award',
        },
        {
          id: 'stage',
          title: 'বর্তমান ধাপ',
          value: currentStage === 'beginner' ? 'শিক্ষানবিশ' : currentStage === 'intermediate' ? 'মধ্যবর্তী' : 'উন্নত',
          description: activeCourse ? `চলমান: ${activeCourse.title}` : completedLevels.length >= 3 ? 'সকল কোর্স সম্পন্ন!' : 'শুরু করুন',
          trend: `${completedLevels.length}/${LEVEL_ORDER.length} ধাপ`,
          trendUp: true,
          icon: 'TrendingUp',
        },
      ],
      courses: coursesForDashboard,
      activities,
      badges,
      sidebarItems: [
        { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
        { id: 'courses', label: 'কোর্সসমূহ', href: '/courses', icon: 'BookOpen' },
        { id: 'development', label: 'Python IDE', href: '/development', icon: 'Code2' },
        { id: 'practice', label: 'প্র্যাকটিস', href: '/practice', icon: 'Swords' },
        { id: 'ai-buddy', label: 'AI Buddy', href: '/ai-buddy', icon: 'Bot' },
      ],
      challenge: {
        title: completedLevels.length >= 3 ? '🎉 সব কোর্স শেষ!' : '📚 আজকের পাঠ চালিয়ে যান',
        description: completedLevels.length >= 3
          ? 'অভিনন্দন! আপনি সব কোর্স সম্পন্ন করেছেন। এখন IDE-তে নিজের প্রজেক্ট তৈরি করুন।'
          : activeCourse
            ? `"${activeCourse.title}" কোর্সে ${activeCourse.progress}% অগ্রগতি`
            : 'একটি কোর্স বেছে নিন এবং শেখা শুরু করুন।',
        rewardXP: 250,
        ctaText: completedLevels.length >= 3 ? 'IDE তে যান' : 'চালিয়ে যান',
        continueHref,
      },
      continueLearning,
      recentlyCompleted: recentlyCompletedCourses.map((c) => ({
        _id: c._id,
        title: c.title,
        level: c.level,
        progress: 100,
        status: 'Completed',
      })),
      lastVisitedCourse: user.lastVisitedCourse?._id?.toString() || user.lastVisitedCourse?.toString() || null,
      lastVisitedLesson: user.lastVisitedLesson || null,
      lastVisitedStage: user.lastVisitedStage || currentStage,
      leaderboard,
      learningAnalytics: {
        totalMinutes: la.totalMinutes || 0,
        weeklyMinutes,
        todayMinutes: todayLog?.minutes || 0,
        todayTabSwitches: todayLog?.tabSwitches || 0,
        dailyLogs: (la.dailyLogs || []).slice(-14),
        lastActiveAt: la.lastActiveAt || null,
      },
    })
  } catch (error) {
    console.error('Dashboard Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = { getDashboard }
