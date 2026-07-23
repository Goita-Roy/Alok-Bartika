import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyCzcXRxzm60iXJ2NGZTVHF4fVqZqPgJpVY',
  authDomain: 'alokbortik.firebaseapp.com',
  projectId: 'alokbortik',
  storageBucket: 'alokbortik.firebasestorage.app',
  messagingSenderId: '797562833862',
  appId: '1:797562833862:web:196d290e4ec5fda49bc0c7',
  measurementId: 'G-P76WVNQQBW',
}

const app: FirebaseApp = initializeApp(firebaseConfig)
export const auth: Auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
