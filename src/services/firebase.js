import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  addDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';

// 1. Production Firebase Configuration Credentials
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC2N30TrZJT4XkXmAcTAqR_hLdBh3bISf4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "blockattend-ise.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "blockattend-ise",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "blockattend-ise.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "99937711709",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:99937711709:web:81e69f6101b11eeb127fb4"
};

// 2. Initialize Firebase App & Services
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// 3. Real-Time Cloud Synchronization Helpers

/**
 * Broadcast live 5-minute Dynamic QR session to Firestore
 */
export async function broadcastQRSessionToFirebase(sessionData) {
  try {
    const sessionRef = doc(db, 'activeQRSessions', sessionData.courseId);
    await setDoc(sessionRef, {
      ...sessionData,
      timestamp: new Date().toISOString()
    });
    return { success: true };
  } catch (err) {
    console.warn('Firebase Broadcast fallback:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Real-time listener for active QR classroom sessions
 */
export function subscribeToQRSessions(callback) {
  try {
    const q = collection(db, 'activeQRSessions');
    return onSnapshot(q, (snapshot) => {
      const sessions = {};
      snapshot.forEach((docSnap) => {
        sessions[docSnap.id] = docSnap.data();
      });
      callback(sessions);
    });
  } catch (err) {
    console.warn('Firebase Subscription fallback:', err);
    return () => {};
  }
}

/**
 * Push mined SHA-256 block attendance record to Firestore Cloud
 */
export async function saveAttendanceBlockToFirebase(blockData) {
  try {
    const blocksRef = collection(db, 'blockchainLedger');
    await addDoc(blocksRef, {
      ...blockData,
      syncedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (err) {
    console.warn('Firebase Save Block fallback:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Sync Student Directory record to Firestore Cloud
 */
export async function syncStudentToFirebase(studentData) {
  try {
    const studentRef = doc(db, 'students', studentData.id);
    await setDoc(studentRef, studentData, { merge: true });
    return { success: true };
  } catch (err) {
    console.warn('Firebase Sync Student fallback:', err);
    return { success: false, error: err.message };
  }
}

export default app;
