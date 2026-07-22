const nodemailer = require('nodemailer')
const { env } = require('../config/env')

const transporter = nodemailer.createTransport({
  host: env.emailHost,
  port: env.emailPort,
  secure: env.emailPort === 465,
  auth: {
    user: env.emailUser,
    pass: env.emailPass,
  },
})

async function sendOtpEmail(to, otp) {
  const mailOptions = {
    from: `"Alokbartika" <${env.emailFrom}>`,
    to,
    subject: 'Your Password Reset OTP - Alokbartika',
    html: `
      <div style="max-width:480px;margin:0 auto;padding:24px;font-family:Arial,sans-serif;background:#fff;border-radius:16px;border:1px solid #e5e7eb;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="width:48px;height:48px;margin:0 auto 12px;background:#1D9E75;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;font-weight:900;">AB</div>
          <h1 style="font-size:20px;font-weight:800;color:#111827;margin:0;">Password Reset OTP</h1>
        </div>
        <p style="font-size:14px;color:#4b5563;line-height:1.6;">You requested a password reset. Use the OTP below to verify your identity. This code expires in <strong>10 minutes</strong>.</p>
        <div style="text-align:center;margin:24px 0;">
          <span style="display:inline-block;padding:16px 40px;font-size:32px;font-weight:900;letter-spacing:8px;color:#1D9E75;background:#f0fdf4;border-radius:12px;border:2px dashed #1D9E75;">${otp}</span>
        </div>
        <p style="font-size:13px;color:#6b7280;">If you did not request this, please ignore this email.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
        <p style="font-size:12px;color:#9ca3af;text-align:center;">&copy; ${new Date().getFullYear()} Alokbartika. All rights reserved.</p>
      </div>
    `,
  }

  return transporter.sendMail(mailOptions)
}

module.exports = { sendOtpEmail }
