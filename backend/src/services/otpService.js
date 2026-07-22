const crypto = require('crypto')
const { Otp } = require('../models/Otp')
const { sendOtpEmail } = require('../utils/email')
const { sendSms } = require('./smsService')

const OTP_TTL_MS = 5 * 60 * 1000 // 5 minutes
const MAX_ATTEMPTS = 3
const RESEND_COOLDOWN_MS = 30 * 1000 // minimum gap between sends

const normalizePhone = (value) => String(value || '').replace(/[^\d+]/g, '')
const normalizeEmail = (value) => String(value || '').trim().toLowerCase()

const hashOtp = (otp) => crypto.createHash('sha256').update(`otp:${otp}`).digest('hex')

const generateOtp = () => crypto.randomInt(100000, 999999).toString()

/**
 * Determine which channel(s) to use.
 * Rules:
 *  - both email + phone  -> email ONLY (no SMS)
 *  - email only          -> email
 *  - phone only          -> phone (SMS)
 * Returns { channel: 'email'|'phone', identifier, type }
 */
function resolveChannel({ email, phone }) {
  const e = normalizeEmail(email)
  const p = normalizePhone(phone)
  if (e) return { channel: 'email', identifier: e, type: 'email' }
  if (p) return { channel: 'phone', identifier: p, type: 'phone' }
  return null
}

/**
 * Send (or resend) an OTP for signup verification.
 * Creates/refreshes a single OTP record per (identifier, type, purpose).
 */
async function sendOtp({ email, phone, purpose = 'signup' }) {
  const target = resolveChannel({ email, phone })
  if (!target) {
    const err = new Error('Email or phone number is required')
    err.status = 400
    throw err
  }

  // Resend cooldown to mitigate abuse / rate limit OTP requests.
  const recent = await Otp.findOne({ identifier: target.identifier, type: target.type, purpose })
  if (recent && Date.now() - recent.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    const err = new Error('Please wait before requesting another OTP')
    err.status = 429
    err.retryAfterMs = RESEND_COOLDOWN_MS - (Date.now() - recent.createdAt.getTime())
    throw err
  }

  const otp = generateOtp()
  const expiresAt = new Date(Date.now() + OTP_TTL_MS)
  const otpHash = hashOtp(otp)

  // Upsert: replaces any existing pending OTP (prevents duplicate records).
  await Otp.findOneAndDelete({ identifier: target.identifier, type: target.type, purpose })
  await Otp.create({ identifier: target.identifier, type: target.type, purpose, otpHash, expiresAt, attempts: 0 })

  if (target.channel === 'email') {
    await sendOtpEmail(target.identifier, otp)
  } else {
    await sendSms({ to: target.identifier, message: `Your Alokbartika verification code is ${otp}. It expires in 5 minutes.` })
  }

  return { channel: target.channel, identifier: target.identifier, expiresInMs: OTP_TTL_MS, otp }
}

/**
 * Verify an OTP. On success the record is deleted (replay protection).
 * Throws with .status and .code for proper HTTP mapping.
 */
async function verifyOtp({ email, phone, otp, purpose = 'signup', consume = true }) {
  const target = resolveChannel({ email, phone })
  if (!target) {
    const err = new Error('Email or phone number is required')
    err.status = 400
    throw err
  }

  const record = await Otp.findOne({ identifier: target.identifier, type: target.type, purpose })
  if (!record) {
    const err = new Error('No OTP requested or it has expired')
    err.status = 400
    err.code = 'OTP_NOT_FOUND'
    throw err
  }

  if (record.expiresAt.getTime() < Date.now()) {
    await Otp.deleteOne({ _id: record._id })
    const err = new Error('OTP has expired. Please request a new one.')
    err.status = 400
    err.code = 'OTP_EXPIRED'
    throw err
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await Otp.deleteOne({ _id: record._id })
    const err = new Error('Too many incorrect attempts. Please request a new OTP.')
    err.status = 429
    err.code = 'OTP_MAX_ATTEMPTS'
    throw err
  }

  if (record.otpHash !== hashOtp(otp)) {
    record.attempts += 1
    await record.save()
    const remaining = MAX_ATTEMPTS - record.attempts
    const err = new Error(remaining > 0 ? `Invalid OTP. ${remaining} attempt(s) left.` : 'Too many incorrect attempts.')
    err.status = 400
    err.code = 'OTP_INVALID'
    err.remainingAttempts = Math.max(0, remaining)
    throw err
  }

  // Success — invalidate immediately (replay protection) only when consuming.
  if (consume) {
    await Otp.deleteOne({ _id: record._id })
  }
  return { channel: target.channel, identifier: target.identifier, type: target.type }
}

module.exports = {
  sendOtp,
  verifyOtp,
  generateOtp,
  OTP_TTL_MS,
  MAX_ATTEMPTS,
  RESEND_COOLDOWN_MS,
}
