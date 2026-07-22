const Notification = require('../models/Notification')

const PAGE_LIMIT = 20

/**
 * Centralized Notification Service.
 *
 * Every feature in the app MUST create notifications through this service so
 * that storage, deduplication, read-state and pagination stay consistent.
 */

/**
 * Create a notification for a user.
 *
 * @param {Object} opts
 * @param {string} opts.userId      Target user _id (required)
 * @param {string} opts.type        One of the Notification.type enum values
 * @param {string} opts.title
 * @param {string} opts.message
 * @param {string} [opts.icon]      lucide-react icon name
 * @param {string} [opts.color]     hex accent color
 * @param {string} [opts.link]      in-app route to open on click
 * @param {string} [opts.dedupeKey] If provided, an existing UNREAD notification
 *                                    with the same (userId,dedupeKey) is updated
 *                                    in place instead of creating a duplicate.
 *                                    This guarantees ONE notification per event.
 */
async function createNotification(opts) {
  const {
    userId, type, title, message, icon, color, link, dedupeKey,
  } = opts

  if (!userId || !type || !title || !message) {
    // Defensive: a malformed notification must never crash the caller flow.
    console.error('[NotificationService] createNotification missing required fields', {
      userId, type, title, message,
    })
    return null
  }

  try {
    if (dedupeKey) {
      const existing = await Notification.findOne({ userId, dedupeKey, read: false })
      if (existing) {
        // Update in place → one notification per event, kept fresh/newest.
        existing.type = type
        existing.title = title
        existing.message = message
        if (icon) existing.icon = icon
        if (color) existing.color = color
        if (link) existing.link = link
        existing.read = false
        existing.createdAt = new Date()
        await existing.save()
        return existing
      }
    }

    const doc = await Notification.create({
      userId,
      type,
      title,
      message,
      icon: icon || 'Bell',
      color: color || '#1D9E75',
      link: link || '',
      dedupeKey: dedupeKey || '',
      read: false,
    })
    return doc
  } catch (err) {
    console.error('[NotificationService] createNotification failed', err)
    return null
  }
}

/** Mark a single notification as read. Returns the updated doc or null. */
async function markAsRead(notificationId, userId) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { $set: { read: true } },
    { new: true },
  )
}

/** Mark all of a user's notifications as read. Returns count updated. */
async function markAllAsRead(userId) {
  const res = await Notification.updateMany(
    { userId, read: false },
    { $set: { read: true } },
  )
  return res.modifiedCount || 0
}

/** Delete a single notification (ownership-enforced). */
async function deleteNotification(notificationId, userId) {
  const res = await Notification.deleteOne({ _id: notificationId, userId })
  return res.deletedCount || 0
}

/**
 * Fetch a user's notifications, newest-first, paginated.
 * @param {string} userId
 * @param {Object} [opts]
 * @param {number} [opts.limit=20]  page size
 * @param {number} [opts.skip=0]    offset for "load more"
 * @param {boolean} [opts.unreadOnly=false]
 */
async function getNotifications(userId, opts = {}) {
  const limit = Math.min(opts.limit || PAGE_LIMIT, 50)
  const skip = opts.skip || 0
  const filter = { userId }
  if (opts.unreadOnly) filter.read = false

  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments({ userId }),
    Notification.countDocuments({ userId, read: false }),
  ])

  return {
    notifications: items,
    total,
    unreadCount,
    limit,
    skip,
    hasMore: skip + items.length < total,
  }
}

/** Convenience: unread count for a user (for the bell badge). */
async function getUnreadCount(userId) {
  return Notification.countDocuments({ userId, read: false })
}

module.exports = {
  PAGE_LIMIT,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotifications,
  getUnreadCount,
}
