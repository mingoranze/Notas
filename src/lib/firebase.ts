import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAWpF7qGTQpWRofSZAj-3Ea4jxxGmchM1c',
  authDomain: 'notas-1ffe0.firebaseapp.com',
  projectId: 'notas-1ffe0',
  storageBucket: 'notas-1ffe0.firebasestorage.app',
  messagingSenderId: '23593679590',
  appId: '1:23593679590:web:481280d6d21f45cedfd927',
}

const hasFirebaseConfig = Object.values(firebaseConfig).every((value) => Boolean(value))

export const app = hasFirebaseConfig ? (getApps().length ? getApps()[0] : initializeApp(firebaseConfig)) : null
export const db = app ? getFirestore(app) : null
