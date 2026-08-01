const mongoose = require('mongoose')

// Append-only audit trail for privileged and sensitive actions (logins,
// role changes, account deletions, course/exam CRUD, system settings).
// Entries are fire-and-forget writes from auditService and are never part of
// any API response, so failures never affect the originating request.
const auditLogSchema = new mongoose.Schema(
  {
    // Who performed the action (null for system/seed actions).
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    actorRole: { type: String, default: '' },

    // What kind of action was performed. `action` is the fine-grained event
    // (e.g. 'login', 'admin.create', 'course.update'), `category` groups them
    // for filtering (login, role_change, user_delete, course, exam,
    // system_settings).
    action: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },

    // Optional structured references to the affected record.
    targetType: { type: String, default: '' },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // Free-form event data (before/after values, emails, ids, etc.).
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Request context.
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true }
)

// Newest-first listing per actor and per category (admin audit views).
auditLogSchema.index({ createdAt: -1 })
auditLogSchema.index({ actorId: 1, createdAt: -1 })
auditLogSchema.index({ category: 1, createdAt: -1 })
// TTL: housekeeping for long-running deployments. Entries older than 180 days
// are auto-deleted; production can adjust via env or remove this line.
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 })

const AuditLog = mongoose.model('AuditLog', auditLogSchema)

module.exports = { AuditLog }
