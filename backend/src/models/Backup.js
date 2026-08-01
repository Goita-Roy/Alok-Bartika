const mongoose = require('mongoose')

// Metadata record for a physical backup archive stored on disk.
//
// Archive files live under a NON-web-served directory (backend/backups/) so
// they can never be read by a bare URL. All file access is mediated by the
// download endpoint, which enforces Super Admin auth and resolves paths safely.
const backupSchema = new mongoose.Schema(
  {
    // Physical storage name (basename only). The archive lives at
    // BACKUP_DIR + '/' + filename.
    filename: { type: String, required: true, unique: true, index: true },
    // Human-readable name shown in the UI.
    originalName: { type: String, required: true },

    size: { type: Number, default: 0 }, // bytes at completion
    documentCount: { type: Number, default: 0 },
    collectionCount: { type: Number, default: 0 },

    // Who/what created the archive.
    type: {
      type: String,
      enum: ['manual', 'scheduled', 'safety'],
      default: 'manual',
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed', 'deleted'],
      default: 'pending',
      index: true,
    },

    // sha256 of the archive bytes — verified on download & restore.
    checksum: { type: String, default: '' },

    // Restore lifecycle (only meaningful for completed archives).
    restoreStatus: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed'],
      default: null,
      index: true,
    },
    restoreError: { type: String, default: null },
    restoredAt: { type: Date, default: null },
    restoredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // One-time, short-lived token proving explicit confirmation of a
    // destructive restore. Issued by GET /restore-plan, consumed by POST /restore.
    restoreToken: { type: String, default: null },
    restoreTokenExpiry: { type: Date, default: null },

    notes: { type: String, default: '' },
    error: { type: String, default: null },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
)

backupSchema.index({ createdAt: -1 })
backupSchema.index({ status: 1, createdAt: -1 })
backupSchema.index({ type: 1, createdAt: -1 })
backupSchema.index({ filename: 1 }, { unique: true })

const Backup = mongoose.model('Backup', backupSchema)

module.exports = { Backup }
