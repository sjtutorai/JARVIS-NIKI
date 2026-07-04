import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User, 
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { UserProfile, UserAnalytics } from '../types';
import { dbService } from '../services/db';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAnonymously: () => Promise<void>;
  loginWithEmail: (email: string, pass: string, isSignUp: boolean, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to construct profile
  const makeProfile = (u: User | { uid: string; displayName: string | null; email: string | null; photoURL: string | null }, isGuest = false): UserProfile => ({
    uid: u.uid,
    name: u.displayName || u.email?.split('@')[0] || (isGuest ? 'Jarvis Guest' : 'User'),
    email: u.email || 'guest@jarvis.ai',
    photoURL: u.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.uid}`,
    createdAt: Date.now(),
    lastLogin: Date.now(),
    subscription: isGuest ? 'free' : 'pro',
    theme: 'dark', // default to premium dark mode
    language: 'en'
  });

  useEffect(() => {
    // Listen for Firebase Auth changes
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        try {
          // Fetch existing user profile
          let profile = await dbService.getUserProfile(fUser.uid);
          if (!profile) {
            profile = makeProfile(fUser);
            await dbService.saveUserProfile(profile);
          } else {
            profile.lastLogin = Date.now();
            await dbService.saveUserProfile(profile);
          }
          setUser(profile);
          
          // Seed analytics if not exist
          const existingAnalytics = await dbService.getAnalytics(fUser.uid);
          if (!existingAnalytics.totalChats) {
            await dbService.saveAnalytics(fUser.uid, {
              totalChats: 0,
              totalMessages: 0,
              wordsGenerated: 0,
              filesUploaded: 0,
              lastUpdated: Date.now(),
              dailyUsage: []
            });
          }
        } catch (err) {
          console.error("Auth sync error:", err);
          // Fallback to local
          const fallback = makeProfile(fUser);
          setUser(fallback);
        }
      } else {
        // If not logged into Firebase, check if local Guest is stored
        const localGuest = localStorage.getItem('jarvis_guest_profile');
        if (localGuest) {
          setUser(JSON.parse(localGuest));
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google Sign-In Error", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginAnonymously = async () => {
    setLoading(true);
    try {
      // Create guest profile locally
      const guestUid = `guest_${Math.random().toString(36).substring(2, 11)}`;
      const guestProfile = makeProfile({
        uid: guestUid,
        displayName: 'Anonymous Agent',
        email: 'guest@jarvis.ai',
        photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${guestUid}`
      }, true);
      
      localStorage.setItem('jarvis_guest_profile', JSON.stringify(guestProfile));
      setUser(guestProfile);
      
      // Also write template guest analytics
      dbService.saveAnalytics(guestUid, {
        totalChats: 0,
        totalMessages: 0,
        wordsGenerated: 0,
        filesUploaded: 0,
        lastUpdated: Date.now(),
        dailyUsage: []
      }).catch(() => {});
      
    } catch (error) {
      console.error("Anonymous Sign-In Error", error);
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string, isSignUp: boolean, displayName?: string) => {
    setLoading(true);
    try {
      if (isSignUp) {
        const credential = await createUserWithEmailAndPassword(auth, email, pass);
        // Save initial display name
        const userProf = makeProfile({
          uid: credential.user.uid,
          displayName: displayName || email.split('@')[0],
          email,
          photoURL: null
        });
        await dbService.saveUserProfile(userProf);
        setUser(userProf);
      } else {
        await signInWithEmailAndPassword(auth, email, pass);
      }
    } catch (error) {
      console.error("Email Authentication Error", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('jarvis_guest_profile');
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error("Logout Error", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    if (user.uid.startsWith('guest_')) {
      localStorage.setItem('jarvis_guest_profile', JSON.stringify(updated));
    } else {
      await dbService.saveUserProfile(updated);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      firebaseUser, 
      loading, 
      loginWithGoogle, 
      loginAnonymously,
      loginWithEmail,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
