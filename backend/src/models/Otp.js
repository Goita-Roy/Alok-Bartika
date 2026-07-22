const mongoose = require('mongoose')

// Stores one-time passwords separately from the User collection.
// A unique compound index on (identifier, type, purpose) prevents duplicate
// OTP records — a new send replaces any existing pending OTP for the same
// identifier/type/purpose via upsert.
const otpSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true, index: true },
    type: { type: String, enum: ['email', 'phone'], required: true },
    purpose: { type: String, enum: ['signup', 'login'], required: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
)

// Enforce a single pending OTP per (identifier, type, purpose).
otpSchema.index({ identifier: 1, type: 1, purpose: 1 }, { unique: true })

// Auto-delete expired OTPs (TTL). expiresAt drives both app-level checks
// and this index.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const Otp = mongoose.model('Otp', otpSchema)

module.exports = { Otp }
