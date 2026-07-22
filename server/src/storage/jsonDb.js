const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '..', '..', '.data')
const DB_PATH = path.join(DATA_DIR, 'db.json')

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], courses: [], lessons: [], progress: [] }, null, 2), 'utf8')
  }
}

function readDb() {
  ensure()
  const raw = fs.readFileSync(DB_PATH, 'utf8')
  const parsed = JSON.parse(raw)
  if (!Array.isArray(parsed.users)) parsed.users = []
  if (!Array.isArray(parsed.courses)) parsed.courses = []
  if (!Array.isArray(parsed.lessons)) parsed.lessons = []
  if (!Array.isArray(parsed.progress)) parsed.progress = []
  return parsed
}

function writeDb(db) {
  ensure()
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8')
}

function makeId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

module.exports = {
  readDb,
  writeDb,
  makeId,
  DB_PATH,
}

