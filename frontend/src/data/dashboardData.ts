export type SidebarItem = {
  id: string
  label: string
  href: string
  icon: string
  locked?: boolean
}

export type DashboardStat = {
  id: string
  title: string
  value: string
  description: string
  trend: string
  trendUp: boolean
  icon: string
}

export type CourseItem = {
  id: string
  title: string
  icon: string
  level: string
  progress: number
  status: 'Completed' | 'Active' | 'Locked'
}

export type ActivityItem = {
  id: string
  icon: string
  text: string
  time: string
  xp: number
}

export type BadgeItem = {
  id: string
  name: string
  icon: string
  earned: boolean
}

export type LeaderboardItem = {
  id: string
  rank: number
  name: string
  xp: number
  isCurrentUser?: boolean
}

export type DailyChallenge = {
  title: string
  description: string
  rewardXP: number
  ctaText: string
}

export type StudentDashboardData = {
  student: {
    name: string
    className: string
    avatar: string
    greeting: string
  }
  xp: {
    totalXP: number
    level: number
    currentLevelXP: number
    nextLevelXP: number
  }
  sidebarItems: SidebarItem[]
  stats: DashboardStat[]
  courses: CourseItem[]
  activities: ActivityItem[]
  badges: BadgeItem[]
  leaderboard: LeaderboardItem[]
  challenge: DailyChallenge
  learningAnalytics: {
    totalMinutes: number
    weeklyMinutes: number
    todayMinutes: number
    todayTabSwitches: number
    dailyLogs: Array<{ date: string; minutes: number }>
    lastActiveAt: string | null
  }
}

export const studentDashboardMock: StudentDashboardData = {
  student: {
    name: 'Noyon Rahman',
    className: 'Class 8 - Section A',
    avatar: 'NR',
    greeting: 'ফিরে আসার জন্য স্বাগতম',
  },
  xp: {
    totalXP: 7840,
    level: 8,
    currentLevelXP: 840,
    nextLevelXP: 1000,
  },
  sidebarItems: [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', href: '/dashboard', icon: 'LayoutDashboard' },
    { id: 'ide', label: 'পাইথন IDE', href: '/development', icon: 'Code2' },
    { id: 'leaderboard', label: 'লিডারবোর্ড', href: '/dashboard', icon: 'Trophy' },
    { id: 'challenges', label: 'চ্যালেঞ্জ', href: '/dashboard', icon: 'Swords' },
    { id: 'assistant', label: 'AI সহায়ক', href: '/dashboard', icon: 'Bot' },
    { id: 'settings', label: 'সেটিংস', href: '/dashboard', icon: 'Settings' },
  ],
  stats: [
    {
      id: 'problems',
      title: 'সমাধান করা সমস্যা',
      value: '126',
      description: 'সমস্যা সমাধানের ধারা শক্তিশালী',
      trend: '+১২ এই সপ্তাহে',
      trendUp: true,
      icon: 'CircleCheckBig',
    },
    {
      id: 'badges',
      title: 'অর্জিত ব্যাজ',
      value: '18',
      description: 'নতুন অ্যালগরিদম ব্যাজ আনলক হয়েছে',
      trend: '+২ এই মাসে',
      trendUp: true,
      icon: 'Award',
    },
    {
      id: 'time',
      title: 'শেখার সময়',
      value: '৩৪ঘ',
      description: 'এই সপ্তাহে মনোযোগী শিক্ষা',
      trend: 'ট্র্যাকে আছে',
      trendUp: true,
      icon: 'Clock3',
    },
  ],
  courses: [
    { id: 'python-fundamentals', title: 'পাইথন ফান্ডামেন্টালস', icon: 'FileCode2', level: 'beginner', progress: 100, status: 'Completed' },
    { id: 'algorithms', title: 'অ্যালগরিদম মাস্টারি', icon: 'BrainCircuit', level: 'intermediate', progress: 72, status: 'Active' },
    { id: 'web-scraping', title: 'ওয়েব স্ক্র্যাপিং', icon: 'Globe2', level: 'advanced', progress: 44, status: 'Active' },
    { id: 'data-science', title: 'ডাটা সায়েন্স স্টার্টার', icon: 'BarChart3', level: 'advanced', progress: 0, status: 'Locked' },
  ],
  activities: [
    { id: 'a1', icon: 'CheckCircle2', text: '"লুপ ও কন্ডিশন" কুইজ সম্পন্ন করেছেন', time: '২ঘ আগে', xp: 120 },
    { id: 'a2', icon: 'Code2', text: 'কোডিং চ্যালেঞ্জ সমাধান: ফিবোনাচ্চি', time: '৫ঘ আগে', xp: 80 },
    { id: 'a3', icon: 'Medal', text: '"কনসিস্টেন্সি স্টার" ব্যাজ আনলক করেছেন', time: '১দি আগে', xp: 150 },
    { id: 'a4', icon: 'BookOpenCheck', text: 'পাঠ শেষ: ফাংশনস ডিপ ডাইভ', time: '১দি আগে', xp: 100 },
  ],
  badges: [
    { id: 'b1', name: 'প্রথম সমাধান', icon: 'Sparkles', earned: true },
    { id: 'b2', name: 'বাগ হান্টার', icon: 'Bug', earned: true },
    { id: 'b3', name: 'দ্রুত শিক্ষার্থী', icon: 'Rocket', earned: true },
    { id: 'b4', name: 'লজিক মাস্টার', icon: 'Lightbulb', earned: true },
    { id: 'b5', name: 'কোড নিনজা', icon: 'Shield', earned: false },
    { id: 'b6', name: 'টপ র্যাঙ্কার', icon: 'Crown', earned: false },
  ],
  leaderboard: [
    { id: 'l1', rank: 1, name: 'Ayesha Karim', xp: 9120 },
    { id: 'l2', rank: 2, name: 'Noyon Rahman', xp: 7840, isCurrentUser: true },
    { id: 'l3', rank: 3, name: 'Tanvir Hasan', xp: 7510 },
    { id: 'l4', rank: 4, name: 'Maliha Noor', xp: 7100 },
    { id: 'l5', rank: 5, name: 'Rahim Ahmed', xp: 6880 },
  ],
  challenge: {
    title: 'দৈনিক চ্যালেঞ্জ: প্রাইম পাথ',
    description: 'একটি সীমার মধ্যে সকল মৌলিক সংখ্যা খুঁজে বের করার জন্য একটি ফাংশন তৈরি করুন।',
    rewardXP: 250,
    ctaText: 'চ্যালেঞ্জ শুরু করুন',
  },
  learningAnalytics: {
    totalMinutes: 120,
    weeklyMinutes: 45,
    todayMinutes: 15,
    todayTabSwitches: 2,
    dailyLogs: [],
    lastActiveAt: null,
  },
}
