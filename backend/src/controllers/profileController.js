const { User } = require('../models/User')
const N = require('../services/notificationService')

// Fire-and-forget; must never throw into the request flow.
function notify(opts) {
  N.createNotification(opts).catch(() => {})
}

// A profile counts as "complete" once these key fields are filled in.
function isProfileComplete(user) {
  const p = user.profile || {}
  return Boolean(user.schoolName && p.className && p.bio)
}

// @desc    Get logged-in user's full profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('completedCourses')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const completedLessonsCount = user.completedLessons?.length || 0
    const completedCoursesCount = user.completedCourses?.length || 0

    // Compute leaderboard rank using $expr for safe array-size comparison
    const rank = await User.countDocuments({
      $or: [
        { xp: { $gt: user.xp } },
        { xp: user.xp, examMarks: { $gt: user.examMarks } },
        {
          xp: user.xp,
          examMarks: user.examMarks,
          $expr: { $gt: [{ $size: '$completedCourses' }, completedCoursesCount] },
        },
      ],
    }) + 1

    // Determine birthDate: prefer profile.birthDate, fallback to top-level dob (safe cast)
    let birthDate = null
    const profile = user.profile || {}
    if (profile.birthDate) {
      birthDate = profile.birthDate
    } else if (user.dob) {
      try {
        const d = new Date(user.dob)
        if (!Number.isNaN(d.getTime())) {
          birthDate = d
          // Silently migrate once so subsequent reads are fast
          User.findByIdAndUpdate(user._id, { $set: { 'profile.birthDate': d } }).catch(() => {})
        }
      } catch {
        // ignore invalid dob
      }
    }

    res.json({
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      phone: user.phone,
      profilePicture: user.profilePicture,
      profile: {
        avatar: profile?.avatar || '',
        schoolName: profile?.schoolName || '',
        className: profile?.className || '',
        roll: profile?.roll || '',
        address: profile?.address || '',
        phone: profile?.phone || '',
        bio: profile?.bio || '',
        birthDate,
      },
      schoolName: user.schoolName || '',
      xp: user.xp || 0,
      level: user.level || 1,
      badges: user.badges || [],
      completedLessons: completedLessonsCount,
      completedCourses: completedCoursesCount,
      currentStage: user.currentStage || 'beginner',
      progressPercentage: user.progressPercentage || 0,
      examMarks: user.examMarks || 0,
      leaderboardRank: rank,
    })
  } catch (error) {
    console.error('Get Profile Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// @desc    Update logged-in user's profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const {
      profile, phone, schoolName,
    } = req.body

    const updateData = {}
    if (phone !== undefined) updateData.phone = phone
    if (schoolName !== undefined) updateData.schoolName = schoolName

    if (profile && typeof profile === 'object') {
      const allowed = ['avatar', 'schoolName', 'className', 'roll', 'address', 'phone', 'bio', 'birthDate']
      for (const key of allowed) {
        if (profile[key] !== undefined) {
          updateData[`profile.${key}`] = profile[key]
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { returnDocument: 'after', runValidators: true }
    )

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (isProfileComplete(user)) {
      notify({
        userId: req.user._id,
        type: 'profile_completed',
        title: 'প্রোফাইল সম্পূর্ণ',
        message: 'আপনার প্রোফাইল সফলভাবে সম্পন্ন করেছেন।',
        icon: 'UserCheck',
        color: '#1D9E75',
        link: '/profile',
        dedupeKey: 'profile:completed',
      })
    }

    res.json({
      message: 'Profile updated successfully',
      data: {
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        phone: user.phone,
        profilePicture: user.profilePicture,
        profile: user.profile || {},
        schoolName: user.schoolName,
      },
    })
  } catch (error) {
    console.error('Update Profile Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// @desc    Upload profile avatar (base64 or URL)
// @route   POST /api/profile/upload or /api/profile/avatar
// @access  Private
const uploadAvatar = async (req, res) => {
  try {
    const { avatar } = req.body
    if (!avatar) {
      return res.status(400).json({ message: 'Avatar data is required' })
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { 'profile.avatar': avatar, profilePicture: avatar } },
      { returnDocument: 'after' }
    )

    res.json({
      message: 'Avatar updated',
      avatar: user.profile?.avatar || user.profilePicture,
    })
  } catch (error) {
    console.error('Upload Avatar Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// @desc    Change password
// @route   PUT /api/profile/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' })
    }

    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    user.password = newPassword
    await user.save()

    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change Password Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = { getProfile, updateProfile, uploadAvatar, changePassword }
