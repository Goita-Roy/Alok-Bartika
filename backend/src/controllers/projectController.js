const path = require('path')
const fs = require('fs')
const multer = require('multer')
const { Project } = require('../models/Project')
const { User } = require('../models/User')

// ── Upload storage (local disk) ───────────────────────────────────────────────
// ADDITIVE: files are stored under backend/uploads/projects and served as static
// files at /uploads (configured in app.js). Nothing about existing storage,
// models, or JSON body handling changes.
const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads')
const PROJECT_DIR = path.join(UPLOAD_ROOT, 'projects')

function ensureDir(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true })
  } catch (_e) {
    /* ignore — mkdir recursive is idempotent */
  }
}
ensureDir(PROJECT_DIR)

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureDir(PROJECT_DIR)
    cb(null, PROJECT_DIR)
  },
  filename: (_req, file, cb) => {
    const safeBase = path
      .basename(file.originalname || 'file')
      .replace(/[^\w.\-]+/g, '_')
      .slice(-80)
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${unique}-${safeBase}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024, files: 30 },
})

// Accept the field names used by the frontend upload form.
const projectUpload = upload.fields([
  { name: 'files', maxCount: 20 },
  { name: 'images', maxCount: 10 },
  { name: 'zip', maxCount: 1 },
  { name: 'readme', maxCount: 1 },
])

function toFileRef(file) {
  if (!file) return null
  return {
    originalName: file.originalname || '',
    fileName: file.filename || '',
    url: `/uploads/projects/${file.filename}`,
    mimeType: file.mimetype || '',
    size: file.size || 0,
  }
}

// ── Badge definitions for the Project feature ─────────────────────────────────
// Awarded by pushing to user.badges (identical shape/mechanism to examController).
const PROJECT_BADGES = [
  { threshold: 1, name: 'প্রথম প্রজেক্ট', icon: '🚀' },
  { threshold: 5, name: '৫টি প্রজেক্ট', icon: '🔧' },
  { threshold: 10, name: '১০টি প্রজেক্ট', icon: '🛠️' },
  { threshold: 20, name: '২০টি প্রজেক্ট', icon: '🏗️' },
  { threshold: 50, name: '৫০টি প্রজেক্ট', icon: '🏆' },
]

// Award any project-count badge the user has newly reached. Returns the list of
// badges added in this call. Does not remove or alter existing badges.
async function awardProjectBadges(user, projectCount) {
  const newBadges = []
  const existing = new Set((user.badges || []).map(b => b.name))
  for (const def of PROJECT_BADGES) {
    if (projectCount >= def.threshold && !existing.has(def.name)) {
      const badge = { name: def.name, icon: def.icon, awardedAt: new Date() }
      user.badges = [...(user.badges || []), badge]
      newBadges.push(badge)
      existing.add(def.name)
    }
  }
  if (newBadges.length > 0) {
    await user.save()
  }
  return newBadges
}

function serializeProject(p) {
  return {
    id: p._id,
    studentId: p.studentId,
    title: p.title,
    description: p.description,
    category: p.category,
    files: p.files || [],
    images: p.images || [],
    zip: p.zip || null,
    readme: p.readme || null,
    githubUrl: p.githubUrl,
    demoUrl: p.demoUrl,
    officialProject: p.officialProject,
    officialProjectRef: p.officialProjectRef || null,
    status: p.status,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }
}

// @desc    Submit a project (personal or answering an official project)
// @route   POST /api/projects
// @access  Private (student)
const submitProject = async (req, res) => {
  try {
    const { title, description, category, githubUrl, demoUrl, officialProjectRef } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'প্রজেক্টের শিরোনাম আবশ্যক' })
    }

    const files = (req.files && req.files.files) || []
    const images = (req.files && req.files.images) || []
    const zipFile = req.files && req.files.zip && req.files.zip[0]
    const readmeFile = req.files && req.files.readme && req.files.readme[0]

    const project = await Project.create({
      studentId: req.user._id,
      title: title.trim(),
      description: (description || '').trim(),
      category: (category || '').trim(),
      files: files.map(toFileRef),
      images: images.map(toFileRef),
      zip: toFileRef(zipFile),
      readme: toFileRef(readmeFile),
      githubUrl: (githubUrl || '').trim(),
      demoUrl: (demoUrl || '').trim(),
      officialProject: false,
      officialProjectRef: officialProjectRef || null,
      status: 'submitted',
    })

    const projectCount = await Project.countDocuments({
      studentId: req.user._id,
      officialProject: false,
    })

    let newBadges = []
    try {
      const user = await User.findById(req.user._id)
      if (user) newBadges = await awardProjectBadges(user, projectCount)
    } catch (_e) {
      /* badge award must never break a successful submission */
    }

    res.status(201).json({
      project: serializeProject(project),
      projectCount,
      newBadges,
    })
  } catch (error) {
    console.error('Submit Project Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// @desc    List the current user's submitted projects (newest first)
// @route   GET /api/projects/mine
// @access  Private
const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      studentId: req.user._id,
      officialProject: false,
    }).sort({ createdAt: -1 })

    res.json({
      count: projects.length,
      projects: projects.map(serializeProject),
    })
  } catch (error) {
    console.error('Get My Projects Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// @desc    List official/assigned projects (templates) for students to view
// @route   GET /api/projects/official
// @access  Private
const getOfficialProjects = async (req, res) => {
  try {
    const projects = await Project.find({ officialProject: true }).sort({ createdAt: -1 })
    res.json({
      count: projects.length,
      projects: projects.map(serializeProject),
    })
  } catch (error) {
    console.error('Get Official Projects Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// @desc    Create an official project (admin/instructor)
// @route   POST /api/projects/official
// @access  Private (admin/instructor)
const createOfficialProject = async (req, res) => {
  try {
    const { title, description, category, githubUrl, demoUrl } = req.body
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'প্রজেক্টের শিরোনাম আবশ্যক' })
    }

    const files = (req.files && req.files.files) || []
    const images = (req.files && req.files.images) || []
    const zipFile = req.files && req.files.zip && req.files.zip[0]
    const readmeFile = req.files && req.files.readme && req.files.readme[0]

    const project = await Project.create({
      studentId: req.user._id,
      title: title.trim(),
      description: (description || '').trim(),
      category: (category || '').trim(),
      files: files.map(toFileRef),
      images: images.map(toFileRef),
      zip: toFileRef(zipFile),
      readme: toFileRef(readmeFile),
      githubUrl: (githubUrl || '').trim(),
      demoUrl: (demoUrl || '').trim(),
      officialProject: true,
      status: 'approved',
    })

    res.status(201).json({ project: serializeProject(project) })
  } catch (error) {
    console.error('Create Official Project Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// @desc    Aggregate real submitted-project counts per user (for leaderboard use)
// @route   GET /api/projects/counts
// @access  Private (admin) — internal reporting
const getProjectCounts = async (req, res) => {
  try {
    const counts = await Project.aggregate([
      { $match: { officialProject: false } },
      { $group: { _id: '$studentId', count: { $sum: 1 } } },
    ])
    res.json({
      counts: counts.map(c => ({ studentId: c._id, count: c.count })),
    })
  } catch (error) {
    console.error('Get Project Counts Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = {
  projectUpload,
  submitProject,
  getMyProjects,
  getOfficialProjects,
  createOfficialProject,
  getProjectCounts,
}
