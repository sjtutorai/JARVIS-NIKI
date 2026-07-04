import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB8aa8oLRtyLJGS6_-lFWs6cqZOejORjTE",
  authDomain: "abiding-composition-k9ffs.firebaseapp.com",
  projectId: "abiding-composition-k9ffs",
  storageBucket: "abiding-composition-k9ffs.firebasestorage.app",
  messagingSenderId: "526552560400",
  appId: "1:526552560400:web:07f64eb68efe9c055ceb95",
  firestoreDatabaseId: "ai-studio-e43fb21c-1714-4233-83b0-31a7f3fa29a8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, signOut };
export default app;
