const { AuditLog } = require('../models/AuditLog')

// Reusable audit logging service.
//
// All writes are fire-and-forget: they are never awaited by callers, never
// surfaced in responses, and any DB failure is swallowed (logged) so audit
// logging can never break an authenticated request.
//
// Categories: login, role_change, user_delete, course, exam, system_settings.
function record(entry) {
  const payload = {
    actorId: entry.actorId || null,
    actorRole: entry.actorRole || '',
    action: entry.action,
    category: entry.category,
    targetType: entry.targetType || '',
    targetId: entry.targetId || null,
    metadata: entry.metadata || {},
    ip: entry.ip || '',
    userAgent: entry.userAgent || '',
  }

  AuditLog.create(payload).catch((err) => {
    console.error('[audit] failed to persist audit log:', err.message)
  })
}

// Normalizes request context (IP + user agent) from an Express req.
function contextFrom(req) {
  if (!req) return { ip: '', userAgent: '' }
  return {
    ip: req.ip || (req.socket && req.socket.remoteAddress) || '',
    userAgent: (req.get && req.get('user-agent')) || '',
  }
}

// ── High-level helpers ─────────────────────────────────────────────────────
function logLogin(user, req, via = 'local') {
  if (!user) return
  const ctx = contextFrom(req)
  record({
    actorId: user._id,
    actorRole: user.role || '',
    action: 'login',
    category: 'login',
    targetType: 'User',
    targetId: user._id,
    metadata: { email: user.email, via },
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  })
}

// actor = the admin/super-admin performing the change; target = affected user;
// fromRole = role before (null when assigning the first role).
function logRoleChange(actor, target, fromRole, toRole, req) {
  if (!target) return
  const ctx = contextFrom(req)
  record({
    actorId: actor ? actor._id : null,
    actorRole: actor ? actor.role : '',
    action: 'role_change',
    category: 'role_change',
    targetType: 'User',
    targetId: target._id,
    metadata: {
      targetEmail: target.email,
      fromRole: fromRole || null,
      toRole,
    },
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  })
}

function logUserDeletion(actor, deletedUser, req) {
  if (!deletedUser) return
  const ctx = contextFrom(req)
  record({
    actorId: actor ? actor._id : null,
    actorRole: actor ? actor.role : '',
    action: 'user_delete',
    category: 'user_delete',
    targetType: 'User',
    targetId: deletedUser._id,
    metadata: {
      email: deletedUser.email,
      username: deletedUser.username,
      role: deletedUser.role,
    },
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  })
}

function logCourseCrud(actor, action, course, req) {
  if (!course) return
  const ctx = contextFrom(req)
  record({
    actorId: actor ? actor._id : null,
    actorRole: actor ? actor.role : '',
    action: `course.${action}`,
    category: 'course',
    targetType: 'Course',
    targetId: course._id,
    metadata: { title: course.title, level: course.level },
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  })
}

function logExamCrud(actor, action, exam, req) {
  if (!exam) return
  const ctx = contextFrom(req)
  record({
    actorId: actor ? actor._id : null,
    actorRole: actor ? actor.role : '',
    action: `exam.${action}`,
    category: 'exam',
    targetType: 'Exam',
    targetId: exam._id,
    metadata: { title: exam.title, level: exam.level },
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  })
}

// Foundation for system-setting audit. No write endpoint exists today; wire
// this in whenever settings are persisted (e.g. ContactSettings updates).
function logSystemSettingChange(actor, settingName, before, after, req) {
  const ctx = contextFrom(req)
  record({
    actorId: actor ? actor._id : null,
    actorRole: actor ? actor.role : '',
    action: 'system_settings.update',
    category: 'system_settings',
    targetType: 'SystemSetting',
    metadata: { setting: settingName, before: before || null, after: after || null },
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  })
}

// Full system-settings update audit. `change` = {
//   targetId, changedFields: [field...], before: {field: old}, after: {field: new}
// }. Recorded on every successful GET/PUT settings update.
function logSystemSettingsUpdate(actor, change, req) {
  const ctx = contextFrom(req)
  record({
    actorId: actor ? actor._id : null,
    actorRole: actor ? actor.role : '',
    action: 'system_settings.update',
    category: 'system_settings',
    targetType: 'SystemSetting',
    targetId: change.targetId || null,
    metadata: {
      changedFields: change.changedFields || [],
      before: change.before || {},
      after: change.after || {},
    },
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  })
}

module.exports = {
  auditService: {
    record,
    logLogin,
    logRoleChange,
    logUserDeletion,
    logCourseCrud,
    logExamCrud,
    logSystemSettingChange,
    logSystemSettingsUpdate,
  },
}
