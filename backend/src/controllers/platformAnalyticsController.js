const { User } = require('../models/User')

const DAY_MS = 24 * 60 * 60 * 1000

function buildLast12Months() {
  const now = new Date()
  const months = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleString('en-US', { month: 'short' }),
    })
  }
  return months
}

function monthKeyFromDate(d) {
  return `${d.getFullYear()}-${d.getMonth()}`
}

// @desc    Get platform-wide analytics for the Super Admin
// @route   GET /api/super-admin/analytics/platform
// @access  Private/SuperAdmin
const getPlatformAnalytics = async (_req, res) => {
  try {
    const [
      totalStudents,
      totalAdmins,
      totalSuperAdmins,
      totalUsers,
      activeLast7,
      newThisMonthCount,
      usersForGrowth,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'super-admin' }),
      User.countDocuments({}),
      User.countDocuments({
        role: { $in: ['student', 'admin', 'super-admin'] },
        isActive: true,
        lastActivityTime: { $gte: new Date(Date.now() - 7 * DAY_MS) },
      }),
      User.countDocuments({
        role: { $in: ['student', 'admin', 'super-admin'] },
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      }),
      User.find(
        {
          role: { $in: ['student', 'admin', 'super-admin'] },
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1),
          },
        },
        { createdAt: 1 },
      ).lean(),
    ])

    // ── User Distribution (pie) ──────────────────────────────────────────
    const userDistribution = [
      { role: 'Students', count: totalStudents, color: '#3b82f6' },
      { role: 'Admins', count: totalAdmins, color: '#7c3aed' },
      { role: 'Super Admins', count: totalSuperAdmins, color: '#f59e0b' },
    ]

    // ── Monthly User Growth (line) — last 12 months ──────────────────────
    const months = buildLast12Months()
    const monthCounts = {}
    months.forEach((m) => {
      monthCounts[m.key] = 0
    })
    usersForGrowth.forEach((u) => {
      const key = monthKeyFromDate(new Date(u.createdAt))
      if (key in monthCounts) monthCounts[key] += 1
    })
    const monthlyUserGrowth = months.map((m) => ({
      month: m.label,
      users: monthCounts[m.key],
    }))

    // Month-over-month growth percentage
    const currentMonth = monthCounts[months[months.length - 1].key] || 0
    const previousMonth = monthCounts[months[months.length - 2].key] || 0
    let userGrowthPercent = 0
    if (previousMonth === 0) {
      userGrowthPercent = currentMonth > 0 ? 100 : 0
    } else {
      userGrowthPercent = Math.round(((currentMonth - previousMonth) / previousMonth) * 1000) / 10
    }

    // ── User Activity (bar) ──────────────────────────────────────────────
    const [activeUsers, inactiveUsers] = await Promise.all([
      User.countDocuments({
        role: { $in: ['student', 'admin', 'super-admin'] },
        isActive: true,
      }),
      User.countDocuments({
        role: { $in: ['student', 'admin', 'super-admin'] },
        isActive: false,
      }),
    ])
    const userActivity = [
      { name: 'Active Users', count: activeUsers, color: '#22c55e' },
      { name: 'Inactive Users', count: inactiveUsers, color: '#ef4444' },
    ]

    // ── User Registration by Role (bar) ───────────────────────────────────
    const userRegistrationByRole = [
      { role: 'Students', count: totalStudents, color: '#3b82f6' },
      { role: 'Admins', count: totalAdmins, color: '#7c3aed' },
      { role: 'Super Admins', count: totalSuperAdmins, color: '#f59e0b' },
    ]

    // ── Admin Overview ────────────────────────────────────────────────────
    // The User schema has no `assignedAdmin` / managed-students field, so we
    // cannot determine per-admin student counts. Per the spec, we surface
    // Total Admins only and a clear "not available" message.
    const adminOverview = {
      available: false,
      totalAdmins,
      admins: [],
    }

    res.json({
      data: {
        // KPI values
        totalUsers,
        totalStudents,
        totalAdmins,
        totalSuperAdmins,
        activeUsersLast7Days: activeLast7,
        newUsersThisMonth: newThisMonthCount,
        userGrowthPercent,
        // Chart data
        userDistribution,
        monthlyUserGrowth,
        userActivity,
        userRegistrationByRole,
        adminOverview,
      },
    })
  } catch (error) {
    console.error('Platform Analytics Error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = { getPlatformAnalytics }
