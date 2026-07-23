const { initializeApp } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')

const projectId = process.env.FIREBASE_PROJECT_ID || 'alokbortik'

let app
const apps = require('firebase-admin').getApps()
if (!apps.length) {
  app = initializeApp({ projectId })
} else {
  app = apps[0]
}

const auth = getAuth(app)

module.exports = { admin: require('firebase-admin'), auth }
