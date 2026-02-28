// Firebase initialization and helpers
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'

// configuration pulled from environment variables defined in .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// initialize app and authentication
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const provider = new GoogleAuthProvider()
const db = getFirestore(app)

// Firestore save/load helpers
async function saveGameToCloud(uid, gameState) {
  try {
    await setDoc(doc(db, 'saves', uid), { ...gameState, updatedAt: Date.now() })
  } catch (err) {
    console.error('Cloud save failed', err)
  }
}

async function loadGameFromCloud(uid) {
  try {
    const snap = await getDoc(doc(db, 'saves', uid))
    return snap.exists() ? snap.data() : null
  } catch (err) {
    console.error('Cloud load failed', err)
    return null
  }
}

// helper wrappers
function signInWithGoogle() {
  return signInWithPopup(auth, provider)
}

function signOut() {
  return firebaseSignOut(auth)
}

function onAuthStateChangedHelper(callback) {
  return onAuthStateChanged(auth, callback)
}

export { auth, signInWithGoogle, signOut, onAuthStateChangedHelper as onAuthStateChanged, saveGameToCloud, loadGameFromCloud }
