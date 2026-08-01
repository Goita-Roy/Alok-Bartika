const mongoose = require('mongoose')

// Singleton settings document. The whole platform reads/writes exactly one
// document (fixed _id), so configuration stays consistent across consumers.
// There is deliberately no "create many" path — only Super Admin reads and
// writes via GET/PUT /api/system/settings.
const SINGLETON_ID = '5f7d8e9c0a1b2c3d4e5f6001'

const systemSettingSchema = new mongoose.Schema(
  {
    platformName: {
      type: String,
      trim: true,
      required: [true, 'Platform name is required'],
      default: 'Alokbartika',
      maxlength: [100, 'Platform name cannot exceed 100 characters'],
    },
    platformDescription: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Platform description cannot exceed 500 characters'],
    },
    supportEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: 'support@alokbartika.com',
      validate: [
        {
          validator: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
          message: 'Support email must be a valid email address',
        },
      ],
    },
    supportPhone: {
      type: String,
      trim: true,
      default: '',
      validate: [
        {
          validator: (v) => !v || /^\+?[\d\s-]{7,15}$/.test(v),
          message: 'Support phone must be a valid phone number',
        },
      ],
    },
    logo: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Logo URL cannot exceed 500 characters'],
    },
    favicon: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Favicon URL cannot exceed 500 characters'],
    },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Maintenance message cannot exceed 500 characters'],
    },
    googleOAuthEnabled: { type: Boolean, default: false },
    emailVerificationRequired: { type: Boolean, default: false },
    otpEnabled: { type: Boolean, default: true },
    registrationEnabled: { type: Boolean, default: true },
    maxLoginAttempts: {
      type: Number,
      default: 5,
      min: [1, 'Maximum login attempts must be at least 1'],
      max: [100, 'Maximum login attempts cannot exceed 100'],
    },
    sessionTimeout: {
      type: Number,
      default: 30,
      min: [5, 'Session timeout must be at least 5 minutes'],
      max: [1440, 'Session timeout cannot exceed 1440 minutes'],
    },
    smtpHost: {
      type: String,
      trim: true,
      default: '',
      maxlength: [255, 'SMTP host cannot exceed 255 characters'],
    },
    smtpPort: {
      type: Number,
      default: 587,
      min: [1, 'SMTP port must be between 1 and 65535'],
      max: [65535, 'SMTP port must be between 1 and 65535'],
    },
    smtpUser: {
      type: String,
      trim: true,
      default: '',
      maxlength: [255, 'SMTP user cannot exceed 255 characters'],
    },
    smtpSecure: { type: Boolean, default: false },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
)

// Fetch-or-create the singleton. The upsert guard makes concurrent first
// requests safe (only one document can ever be inserted).
systemSettingSchema.statics.ensureSingleton = async function () {
  let doc = await this.findById(SINGLETON_ID)
  if (doc) return doc
  await this.findOneAndUpdate(
    { _id: SINGLETON_ID },
    { $setOnInsert: { _id: SINGLETON_ID } },
    { upsert: true, setDefaultsOnInsert: true }
  )
  return this.findById(SINGLETON_ID)
}

const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema)

module.exports = { SystemSetting, SINGLETON_ID }
