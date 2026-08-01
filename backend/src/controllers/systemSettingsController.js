const { SystemSetting } = require('../models/SystemSetting')
const { auditService } = require('../services/auditService')

// Whitelist of fields a Super Admin may persist. Anything not in this list is
// rejected — arbitrary keys can never reach the settings document.
const SETTINGS_FIELDS = [
  'platformName',
  'platformDescription',
  'supportEmail',
  'supportPhone',
  'logo',
  'favicon',
  'maintenanceMode',
  'maintenanceMessage',
  'googleOAuthEnabled',
  'emailVerificationRequired',
  'otpEnabled',
  'registrationEnabled',
  'maxLoginAttempts',
  'sessionTimeout',
  'smtpHost',
  'smtpPort',
  'smtpUser',
  'smtpSecure',
]

const NUMERIC_FIELDS = new Set(['maxLoginAttempts', 'sessionTimeout', 'smtpPort'])
const BOOLEAN_FIELDS = new Set([
  'maintenanceMode',
  'googleOAuthEnabled',
  'emailVerificationRequired',
  'otpEnabled',
  'registrationEnabled',
  'smtpSecure',
])

// Public response shape — only the whitelisted settings plus audit metadata.
function sanitize(doc) {
  const out = {}
  for (const field of SETTINGS_FIELDS) {
    out[field] = doc[field] ?? null
  }
  out.updatedBy = doc.updatedBy || null
  out.createdAt = doc.createdAt
  out.updatedAt = doc.updatedAt
  return out
}

const getSettings = async (_req, res) => {
  try {
    const doc = await SystemSetting.ensureSingleton()
    if (!doc) {
      return res.status(500).json({ message: 'Settings could not be loaded' })
    }
    res.json({ data: sanitize(doc) })
  } catch (error) {
    console.error('Get System Settings Error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

const updateSettings = async (req, res) => {
  try {
    const body = req.body || {}
    const keys = Object.keys(body)

    if (keys.length === 0) {
      return res.status(400).json({ message: 'No settings provided to update' })
    }

    // SECURITY: never allow arbitrary field updates.
    const unknown = keys.filter((k) => !SETTINGS_FIELDS.includes(k))
    if (unknown.length > 0) {
      return res.status(400).json({
        message: `Unknown settings field(s): ${unknown.join(', ')}`,
      })
    }

    const doc = await SystemSetting.ensureSingleton()
    if (!doc) {
      return res.status(500).json({ message: 'Settings could not be loaded' })
    }

    const before = {}
    const after = {}
    const changed = []

    for (const key of keys) {
      const raw = body[key]

      let value = raw
      if (NUMERIC_FIELDS.has(key)) {
        if (raw === '' || raw === null || raw === undefined) {
          value = null
        } else {
          const num = Number(raw)
          if (Number.isNaN(num)) {
            return res.status(400).json({ message: `${key} must be a valid number` })
          }
          value = num
        }
      } else if (BOOLEAN_FIELDS.has(key)) {
        value = raw === true || raw === 'true' || raw === 1 || raw === '1'
      }

      // Only persist + audit fields whose value actually changed.
      if (String(value) !== String(doc[key] ?? null)) {
        before[key] = doc[key] ?? null
        after[key] = value
        changed.push(key)
        doc[key] = value
      }
    }

    if (changed.length === 0) {
      return res.json({ message: 'No changes to save', data: sanitize(doc) })
    }

    doc.updatedBy = req.user._id
    await doc.save() // runs schema validators (required, min, max, regex)

    auditService.logSystemSettingsUpdate(
      req.user,
      {
        targetId: doc._id,
        changedFields: changed,
        before,
        after,
      },
      req
    )

    res.json({ message: 'Settings updated successfully', data: sanitize(doc) })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((v) => v.message)
      return res.status(400).json({ message: 'Validation error', errors: messages })
    }
    console.error('Update System Settings Error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = { getSettings, updateSettings }
