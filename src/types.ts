export type AIModelType = 'fast' | 'balanced' | 'advanced';

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string; // Base64 content for local preview / sending
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
  model?: AIModelType;
  attachments?: FileAttachment[];
  status?: 'sending' | 'sent' | 'error';
  rating?: 'like' | 'dislike' | null;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  isPinned: boolean;
  isStarred: boolean;
  isArchived: boolean;
  folderId?: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  createdAt: number;
  lastLogin: number;
  subscription: 'free' | 'pro' | 'enterprise';
  theme: 'light' | 'dark' | 'system';
  language: string;
}

export interface UserAnalytics {
  totalChats: number;
  totalMessages: number;
  wordsGenerated: number;
  filesUploaded: number;
  lastUpdated: number;
  dailyUsage: { date: string; messages: number; words: number }[];
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: number;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface Folder {
  id: string;
  userId: string;
  name: string;
  createdAt: number;
}
