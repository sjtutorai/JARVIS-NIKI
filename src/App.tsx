import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { dbService } from './services/db';
import { Conversation, Message, AppNotification } from './types';
import { SplashScreen } from './components/SplashScreen';
import { AuthScreen } from './components/AuthScreen';
import { LandingPage } from './components/LandingPage';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { Dashboard } from './components/Dashboard';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, Bell, LayoutDashboard, MessageSquare, Bot, AlertCircle, CheckCircle2, ShieldAlert
} from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

function MainAppContent() {
  const { user, loading } = useAuth();
  
  // App UI State
  const [authView, setAuthView] = useState<'landing' | 'auth'>('landing');
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard'>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Data State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvoId, setCurrentConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [model, setModel] = useState<'fast' | 'balanced' | 'advanced'>('balanced');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Trigger tokens for refreshing analytics
  const [analyticsUpdatedToken, setAnalyticsUpdatedToken] = useState(0);

  // Load conversations on mount or user change
  useEffect(() => {
    if (user) {
      if (sessionStorage.getItem('justSignedInWithGoogle') === 'true') {
        setActiveTab('dashboard');
        sessionStorage.removeItem('justSignedInWithGoogle');
      }

      dbService.getConversations(user.uid).then(convos => {
        setConversations(convos);
        if (convos.length > 0) {
          setCurrentConvoId(convos[0].id);
        } else {
          // Setup a default initial conversation
          handleNewConversation("Neural Synaptic Init");
        }
      });
      
      // Load notifications
      dbService.getNotifications(user.uid).then(setNotifications);

      // Trigger standard welcome toast
      addToast("Jarvis Cybernetic mainframes active and synced.", "success");
    }
  }, [user]);

  // Load messages when current conversation changes
  useEffect(() => {
    if (currentConvoId) {
      dbService.getMessages(currentConvoId).then(setMessages);
    } else {
      setMessages([]);
    }
  }, [currentConvoId]);

  const addToast = (msg: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newToast: Toast = {
      id: `toast_${Math.random().toString(36).substring(2, 9)}`,
      message: msg,
      type
    };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 4500);
  };

  const handleNewConversation = async (customTitle?: string, folderId: string | null = null) => {
    if (!user) return;
    
    const newConvo: Conversation = {
      id: `convo_${Math.random().toString(36).substring(2, 11)}`,
      userId: user.uid,
      title: customTitle || `Diagnostic Session #${conversations.length + 1}`,
      isPinned: false,
      isStarred: false,
      isArchived: false,
      folderId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await dbService.saveConversation(newConvo);
    setConversations(prev => [newConvo, ...prev]);
    setCurrentConvoId(newConvo.id);
    setActiveTab('chat');
    addToast("New neural channel initialized.", "info");

    // Save analytics
    const uAnalytics = await dbService.getAnalytics(user.uid);
    uAnalytics.totalChats += 1;
    await dbService.saveAnalytics(user.uid, uAnalytics);
    setAnalyticsUpdatedToken(t => t + 1);
  };

  const handleSelectConvo = (id: string) => {
    setCurrentConvoId(id);
    setActiveTab('chat');
    // On small screens, close sidebar upon selection
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleMarkNotifRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    // Usually updates in db here
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <span className="w-10 h-10 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-xs font-mono tracking-widest uppercase">Initializing Stark Mainframe Security...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authView === 'landing') {
      return (
        <LandingPage 
          onSignIn={() => setAuthView('auth')} 
          onGetStarted={() => setAuthView('auth')} 
        />
      );
    }
    return <AuthScreen onBack={() => setAuthView('landing')} />;
  }

  const activeConvo = conversations.find(c => c.id === currentConvoId);
  const unreadNotifs = notifications.filter(n => !n.read);

  return (
    <div className="h-screen w-screen flex bg-[#0A0A0C] text-slate-100 overflow-hidden font-sans">
      {/* Decorative Blur Backdrops */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.08)_0%,transparent_50%)] pointer-events-none" />

      {/* Slideout Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '320px', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full shrink-0 z-20 md:relative absolute left-0"
          >
            <Sidebar
              currentConvoId={currentConvoId}
              onSelectConvo={handleSelectConvo}
              onNewConvo={(folderId) => handleNewConversation(undefined, folderId)}
              onOpenSettings={() => setShowSettings(true)}
              onOpenHelp={() => setShowHelp(true)}
              conversations={conversations}
              setConversations={setConversations}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container Content */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* Top App Bar */}
        <header className="h-16 flex items-center justify-between px-8 bg-white/5 backdrop-blur-md border-b border-white/5 z-10">
          <div className="flex items-center gap-4">
            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="Toggle sidebar"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            
            {/* Intel specs badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-xs font-medium text-gray-300">
                {model === 'fast' && 'Fast AI 3.5'}
                {model === 'balanced' && 'Balanced AI 3.5'}
                {model === 'advanced' && 'Advanced AI 3.5'}
              </span>
            </div>
            <span className="text-gray-600 hidden sm:inline">/</span>
            <span className="text-xs text-gray-400 truncate max-w-[120px] md:max-w-xs hidden sm:inline">
              {activeTab === 'chat' ? (activeConvo?.title || 'No active logs') : 'System Metrics Console'}
            </span>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3">
            {/* Chat vs Dashboard tab selectors */}
            <div className="flex bg-white/5 p-1 rounded-[15px] border border-white/10">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] text-xs font-semibold transition-all ${
                  activeTab === 'chat' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <MessageSquare size={13} />
                <span className="hidden sm:inline">Mainframe</span>
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] text-xs font-semibold transition-all ${
                  activeTab === 'dashboard' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <LayoutDashboard size={13} />
                <span className="hidden sm:inline">Analytics</span>
              </button>
            </div>

            {/* Notifications trigger */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 hover:bg-white/10 rounded-full border border-white/10 text-gray-400 hover:text-white transition-colors relative"
                title="System notifications"
              >
                <Bell size={18} />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full ring-2 ring-slate-950 animate-pulse" />
                )}
              </button>

              {/* Notification Drawer Popover */}
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-[#0F0F12] border border-white/10 rounded-[20px] p-4 shadow-2xl z-40 text-slate-200"
                    >
                      <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-white/5">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans">System Notifications</h4>
                        <span className="text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">
                          {unreadNotifs.length} alerts
                        </span>
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-slate-600 italic text-center py-4">Logs clean. No active notifications.</p>
                        ) : (
                          notifications.map(notif => (
                            <div 
                              key={notif.id}
                              onClick={() => handleMarkNotifRead(notif.id)}
                              className={`p-2.5 rounded-[12px] border transition-colors cursor-pointer ${
                                notif.read 
                                  ? 'bg-transparent border-transparent text-slate-500' 
                                  : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-xs truncate max-w-[150px]">{notif.title}</span>
                                <span className="text-[9px] text-slate-500 font-mono">
                                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-1">{notif.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Panel Tab Swap */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {activeTab === 'chat' ? (
            <ChatArea
              convoId={currentConvoId}
              messages={messages}
              setMessages={setMessages}
              model={model}
              setModel={setModel}
              triggerAnalyticsRefresh={() => setAnalyticsUpdatedToken(t => t + 1)}
            />
          ) : (
            <Dashboard 
              onClose={() => setActiveTab('chat')} 
              analyticsUpdatedToken={analyticsUpdatedToken}
            />
          )}
        </div>
      </div>

      {/* Dialog Modals */}
      <AnimatePresence>
        {showSettings && (
          <SettingsModal 
            onClose={() => setShowSettings(false)} 
            conversations={conversations}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHelp && (
          <HelpModal onClose={() => setShowHelp(false)} />
        )}
      </AnimatePresence>

      {/* Floating Real-time Toasts notifications */}
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className="pointer-events-auto bg-slate-950/90 border border-slate-800 p-4 rounded-xl shadow-2xl flex items-start gap-3 w-80 backdrop-blur-sm"
            >
              {toast.type === 'success' ? (
                <CheckCircle2 size={16} className="text-cyan-400 mt-0.5 shrink-0" />
              ) : toast.type === 'error' ? (
                <ShieldAlert size={16} className="text-red-500 mt-0.5 shrink-0 animate-bounce" />
              ) : (
                <AlertCircle size={16} className="text-blue-400 mt-0.5 shrink-0" />
              )}
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  {toast.type === 'success' && 'Sync Complete'}
                  {toast.type === 'error' && 'Telemetry Fault'}
                  {toast.type === 'info' && 'Telemetry Signal'}
                </p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{toast.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
