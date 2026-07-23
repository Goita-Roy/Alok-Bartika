/**
 * Seed script — create the first Super Admin user.
 * Run: node backend/src/scripts/seedSuperAdmin.js
 *
 * Requires MONGO_URI in .env or passed as env var.
 *
 * Usage:
 *   node backend/src/scripts/seedSuperAdmin.js
 *   node backend/src/scripts/seedSuperAdmin.js --name "Admin Name" --email admin@example.com --password secret123
 *
 * Defaults (override via CLI flags):
 *   name: Super Admin
 *   email: superadmin@alokbartika.com
 *   password: SuperAdmin@123
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '..', '.env') })
const mongoose = require('mongoose')
const { User } = require('../models/User')

function parseArg(flag, fallback) {
  const idx = process.argv.indexOf(flag)
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : fallback
}

async function seed() {
  const uri = process.env.MONGO_URI || process.env.DATABASE_URL
  if (!uri) throw new Error('MONGO_URI not set in .env')
  await mongoose.connect(uri)
  console.log('Connected to MongoDB')

  const name = parseArg('--name', 'Super Admin')
  const email = parseArg('--email', 'superadmin@alokbartika.com')
  const password = parseArg('--password', 'SuperAdmin@123')

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) {
    console.log(`User with email "${email}" already exists (role: ${existing.role}). Skipping.`)
    await mongoose.disconnect()
    return
  }

  const username = email.toLowerCase().split('@')[0].replace(/[^a-z0-9_]/g, '') || 'superadmin'

  const user = await User.create({
    fullName: name,
    username,
    email: email.toLowerCase(),
    password,
    role: 'super-admin',
    termsAccepted: true,
    isVerified: true,
    emailVerified: true,
  })

  console.log('Super Admin created successfully:')
  console.log(`  _id:    ${user._id}`)
  console.log(`  name:   ${user.fullName}`)
  console.log(`  email:  ${user.email}`)
  console.log(`  role:   ${user.role}`)

  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
