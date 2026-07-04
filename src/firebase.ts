import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBQo4612j_N2gi_2kAJp6kIEPKe9ew3kMM",
  authDomain: "jarvis-nikki.firebaseapp.com",
  projectId: "jarvis-nikki",
  storageBucket: "jarvis-nikki.firebasestorage.app",
  messagingSenderId: "98302776876",
  appId: "1:98302776876:web:d4331f9a8ba35accd22389"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = (firebaseConfig as any).firestoreDatabaseId 
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, signOut };
export default app;
