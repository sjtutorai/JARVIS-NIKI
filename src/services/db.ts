import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Conversation, Message, UserProfile, UserAnalytics, AppNotification, Folder } from '../types';

// Helper to check if Firebase is online/working
async function isFirebaseAccessible(): Promise<boolean> {
  try {
    // Simple fast check
    const testRef = doc(db, 'system', 'connection_test');
    await getDoc(testRef);
    return true;
  } catch (err) {
    console.warn("Firestore not fully initialized or accessible. Using LocalStorage fallback.", err);
    return false;
  }
}

// LocalStorage helpers as reliable fallbacks
const getLocal = <T>(key: string, defaultValue: T): T => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setLocal = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("LocalStorage write error", e);
  }
};

export const dbService = {
  // === USER PROFILE ===
  async saveUserProfile(profile: UserProfile): Promise<void> {
    setLocal(`user_profile_${profile.uid}`, profile);
    try {
      await setDoc(doc(db, 'users', profile.uid), profile, { merge: true });
    } catch (err) {
      console.warn("Failed to save user profile to Firestore, saved locally", err);
    }
  },

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const localProfile = getLocal<UserProfile | null>(`user_profile_${uid}`, null);
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setLocal(`user_profile_${uid}`, data);
        return data;
      }
    } catch (err) {
      console.warn("Failed to get user profile from Firestore, using local", err);
    }
    return localProfile;
  },

  // === CONVERSATIONS ===
  async getConversations(uid: string): Promise<Conversation[]> {
    const localConvos = getLocal<Conversation[]>(`conversations_${uid}`, []);
    try {
      const q = query(
        collection(db, 'conversations'), 
        where('userId', '==', uid), 
        orderBy('updatedAt', 'desc')
      );
      const snap = await getDocs(q);
      const convos = snap.docs.map(d => d.data() as Conversation);
      if (convos.length > 0) {
        setLocal(`conversations_${uid}`, convos);
        return convos;
      }
    } catch (err) {
      console.warn("Failed to fetch conversations from Firestore, using local", err);
    }
    return localConvos;
  },

  async saveConversation(convo: Conversation): Promise<void> {
    const uid = convo.userId;
    const localConvos = getLocal<Conversation[]>(`conversations_${uid}`, []);
    const idx = localConvos.findIndex(c => c.id === convo.id);
    if (idx >= 0) {
      localConvos[idx] = convo;
    } else {
      localConvos.unshift(convo);
    }
    setLocal(`conversations_${uid}`, localConvos);

    try {
      await setDoc(doc(db, 'conversations', convo.id), convo, { merge: true });
    } catch (err) {
      console.warn("Failed to save conversation to Firestore, saved locally", err);
    }
  },

  async deleteConversation(uid: string, convoId: string): Promise<void> {
    const localConvos = getLocal<Conversation[]>(`conversations_${uid}`, []);
    const updated = localConvos.filter(c => c.id !== convoId);
    setLocal(`conversations_${uid}`, updated);

    // Also remove local messages
    localStorage.removeItem(`messages_${convoId}`);

    try {
      await deleteDoc(doc(db, 'conversations', convoId));
      // Delete associated messages in Firestore if needed (done client-side or we rely on orphan cleanups)
    } catch (err) {
      console.warn("Failed to delete conversation from Firestore, deleted locally", err);
    }
  },

  // === MESSAGES ===
  async getMessages(convoId: string): Promise<Message[]> {
    const localMsgs = getLocal<Message[]>(`messages_${convoId}`, []);
    try {
      const q = query(
        collection(db, 'messages'),
        where('conversationId', '==', convoId),
        orderBy('createdAt', 'asc')
      );
      const snap = await getDocs(q);
      const msgs = snap.docs.map(d => d.data() as Message);
      if (msgs.length > 0) {
        setLocal(`messages_${convoId}`, msgs);
        return msgs;
      }
    } catch (err) {
      console.warn("Failed to fetch messages from Firestore, using local", err);
    }
    return localMsgs;
  },

  async saveMessage(msg: Message): Promise<void> {
    const convoId = msg.conversationId;
    const localMsgs = getLocal<Message[]>(`messages_${convoId}`, []);
    const idx = localMsgs.findIndex(m => m.id === msg.id);
    if (idx >= 0) {
      localMsgs[idx] = msg;
    } else {
      localMsgs.push(msg);
    }
    setLocal(`messages_${convoId}`, localMsgs);

    try {
      await setDoc(doc(db, 'messages', msg.id), msg, { merge: true });
    } catch (err) {
      console.warn("Failed to save message to Firestore, saved locally", err);
    }
  },

  // === ANALYTICS ===
  async getAnalytics(uid: string): Promise<UserAnalytics> {
    const defaultAnalytics: UserAnalytics = {
      totalChats: 0,
      totalMessages: 0,
      wordsGenerated: 0,
      filesUploaded: 0,
      lastUpdated: Date.now(),
      dailyUsage: []
    };
    const localAnalytics = getLocal<UserAnalytics>(`analytics_${uid}`, defaultAnalytics);
    try {
      const snap = await getDoc(doc(db, 'analytics', uid));
      if (snap.exists()) {
        const data = snap.data() as UserAnalytics;
        setLocal(`analytics_${uid}`, data);
        return data;
      }
    } catch (err) {
      console.warn("Failed to fetch analytics from Firestore, using local", err);
    }
    return localAnalytics;
  },

  async saveAnalytics(uid: string, analytics: UserAnalytics): Promise<void> {
    setLocal(`analytics_${uid}`, analytics);
    try {
      await setDoc(doc(db, 'analytics', uid), analytics, { merge: true });
    } catch (err) {
      console.warn("Failed to save analytics to Firestore, saved locally", err);
    }
  },

  // === NOTIFICATIONS ===
  async getNotifications(uid: string): Promise<AppNotification[]> {
    const localNotifs = getLocal<AppNotification[]>(`notifications_${uid}`, [
      {
        id: 'welcome',
        userId: uid,
        title: 'Welcome to Jarvis',
        message: 'Welcome! I am your intelligent AI assistant, styled with futuristic design and optimized to help you with anything.',
        read: false,
        createdAt: Date.now(),
        type: 'success'
      }
    ]);
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const notifications = snap.docs.map(d => d.data() as AppNotification);
      if (notifications.length > 0) {
        setLocal(`notifications_${uid}`, notifications);
        return notifications;
      }
    } catch (err) {
      console.warn("Failed to fetch notifications from Firestore, using local", err);
    }
    return localNotifs;
  },

  async saveNotification(notif: AppNotification): Promise<void> {
    const uid = notif.userId;
    const localNotifs = getLocal<AppNotification[]>(`notifications_${uid}`, []);
    localNotifs.unshift(notif);
    setLocal(`notifications_${uid}`, localNotifs);

    try {
      await setDoc(doc(db, 'notifications', notif.id), notif, { merge: true });
    } catch (err) {
      console.warn("Failed to save notification to Firestore, saved locally", err);
    }
  },

  // === FOLDERS ===
  async getFolders(uid: string): Promise<Folder[]> {
    const localFolders = getLocal<Folder[]>(`folders_${uid}`, []);
    try {
      const q = query(
        collection(db, 'folders'),
        where('userId', '==', uid),
        orderBy('createdAt', 'asc')
      );
      const snap = await getDocs(q);
      const folders = snap.docs.map(d => d.data() as Folder);
      if (folders.length > 0) {
        setLocal(`folders_${uid}`, folders);
        return folders;
      }
    } catch (err) {
      console.warn("Failed to fetch folders from Firestore, using local", err);
    }
    return localFolders;
  },

  async saveFolder(folder: Folder): Promise<void> {
    const uid = folder.userId;
    const localFolders = getLocal<Folder[]>(`folders_${uid}`, []);
    localFolders.push(folder);
    setLocal(`folders_${uid}`, localFolders);

    try {
      await setDoc(doc(db, 'folders', folder.id), folder, { merge: true });
    } catch (err) {
      console.warn("Failed to save folder to Firestore, saved locally", err);
    }
  }
};
