const N = require('../services/notificationService')

// GET /api/notifications  -> list (newest-first, paginated) + unread count
const getNotifications = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || N.PAGE_LIMIT
    const skip = parseInt(req.query.skip, 10) || 0
    const result = await N.getNotifications(req.user._id, { limit, skip })
    res.json(result)
  } catch (err) {
    console.error('getNotifications Error:', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// PATCH /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const updated = await N.markAsRead(req.params.id, req.user._id)
    if (!updated) return res.status(404).json({ message: 'Notification not found' })
    res.json({ message: 'Marked as read', notification: updated })
  } catch (err) {
    console.error('markAsRead Error:', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// PATCH /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  try {
    const count = await N.markAllAsRead(req.user._id)
    res.json({ message: 'All marked as read', updated: count })
  } catch (err) {
    console.error('markAllAsRead Error:', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// DELETE /api/notifications/:id
const deleteNotification = async (req, res) => {
  try {
    const count = await N.deleteNotification(req.params.id, req.user._id)
    if (!count) return res.status(404).json({ message: 'Notification not found' })
    res.json({ message: 'Deleted' })
  } catch (err) {
    console.error('deleteNotification Error:', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification }
