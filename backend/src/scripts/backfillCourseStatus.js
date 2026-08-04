/**
 * backfillCourseStatus.js
 * One-time backward-compatible migration for legacy Course documents that
 * were created before the `status` field existed.
 *
 * - Updates ONLY documents where `status` does NOT exist.
 * - Sets status = 'published' (legacy courses were live curriculum content).
 * - Does NOT modify existing draft or published courses.
 * - Idempotent: safe to run multiple times (no status-missing docs remain
 *   after the first successful run).
 */
require('dotenv').config()
const mongoose = require('mongoose')
const { connectDb } = require('../config/db')
const { Course } = require('../models/Course')

async function main() {
  await connectDb(process.env.MONGO_URI)
  console.log('Connected to database:', mongoose.connection.name)

  const total = await Course.countDocuments()
  const missingStatus = await Course.countDocuments({ status: { $exists: false } })
  console.log(`Total courses: ${total}`)
  console.log(`Courses missing status field: ${missingStatus}`)

  if (missingStatus === 0) {
    console.log('Nothing to migrate.')
    await mongoose.disconnect()
    return
  }

  const result = await Course.updateMany(
    { status: { $exists: false } },
    { $set: { status: 'published' } }
  )
  console.log(`Migrated ${result.modifiedCount} course(s) to status='published'.`)

  const after = await Course.countDocuments({ status: { $exists: false } })
  console.log(`Courses still missing status after migration: ${after}`)

  await mongoose.disconnect()
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
