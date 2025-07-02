import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyCCKlcRIz2p0dCXIXsbpk2gu0SJ8okJoHM",
  authDomain: "vamoil-vessels-dashboard.firebaseapp.com",
  projectId: "vamoil-vessels-dashboard",
  storageBucket: "vamoil-vessels-dashboard.firebasestorage.app",
  messagingSenderId: "666902249065",
  appId: "1:666902249065:web:1567f1183371e68251ecf8",
  measurementId: "G-SHR0VMMXQX"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app)

export default app