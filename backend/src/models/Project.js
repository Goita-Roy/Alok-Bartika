const mongoose = require('mongoose')

// A stored file reference for a project submission. Files are saved to disk by
// multer; only metadata + the served URL path are persisted here.
const fileRefSchema = new mongoose.Schema(
  {
    originalName: { type: String, trim: true, default: '' },
    fileName: { type: String, trim: true, default: '' },
    url: { type: String, trim: true, default: '' },
    mimeType: { type: String, trim: true, default: '' },
    size: { type: Number, default: 0 },
  },
  { _id: false }
)

// Project Submission — an ADDITIVE collection for the Advanced level project
// feature. It does not touch any existing model or completion logic.
const projectSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    category: { type: String, trim: true, default: '' },
    // Uploaded source/python files
    files: [fileRefSchema],
    // Uploaded images / screenshots
    images: [fileRefSchema],
    // Optional single zip archive of the project
    zip: { type: fileRefSchema, default: null },
    // Optional README file
    readme: { type: fileRefSchema, default: null },
    githubUrl: { type: String, trim: true, default: '' },
    demoUrl: { type: String, trim: true, default: '' },
    // true => an official/assigned project template (admin), false => personal submission
    officialProject: { type: Boolean, default: false, index: true },
    // If this submission answers an official project, keep the reference
    officialProjectRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    status: {
      type: String,
      enum: ['submitted', 'reviewed', 'approved', 'rejected'],
      default: 'submitted',
    },
  },
  { timestamps: true }
)

const Project = mongoose.model('Project', projectSchema)

module.exports = { Project }
