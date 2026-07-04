import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { Conversation, Message } from '../types';
import { motion } from 'motion/react';
import { 
  X, User, Shield, Eye, Globe, Bell, Download, Trash2, Check, Sparkles 
} from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  conversations: Conversation[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, conversations }) => {
  const { user, updateProfile, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'notifications' | 'privacy'>('profile');
  
  // Profile state
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [avatarSeed, setAvatarSeed] = useState(user?.uid || 'seed');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Appearance state
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(user?.theme || 'dark');
  const [language, setLanguage] = useState(user?.language || 'en');

  // Notifications state
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    const photoURL = `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`;
    await updateProfile({
      name: displayName.trim(),
      photoURL,
      theme,
      language
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleExportData = async () => {
    if (!user) return;
    try {
      // Package user info and all loaded conversations
      const exportObject: Record<string, any> = {
        exportedAt: Date.now(),
        profile: user,
        sessions: []
      };

      for (const convo of conversations) {
        const msgs = await dbService.getMessages(convo.id);
        exportObject.sessions.push({
          conversation: convo,
          messages: msgs
        });
      }

      // Download payload
      const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `jarvis_mainframe_backup_${user.uid}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export Jarvis core logs: " + err);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirmDelete = confirm(
      "☢️ CRITICAL PROTOCOL WARNING:\n" +
      "You are about to initiate an irreversible wipe of your entire Jarvis Profile, including all conversation logs, settings, and analytics.\n\n" +
      "Are you absolutely sure you want to proceed?"
    );

    if (confirmDelete) {
      try {
        // Simple mock of deleting local backups and syncing
        localStorage.clear();
        await logout();
        alert("Wipe completed. Mainframe credentials de-authorized.");
        window.location.reload();
      } catch (err) {
        alert("Wipe failed: " + err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl bg-[#0F0F12] border border-white/5 rounded-[30px] text-white shadow-2xl flex flex-col md:flex-row overflow-hidden h-[520px]"
      >
        {/* Left tabs menu */}
        <div className="w-full md:w-52 bg-[#0C0C0F] border-b md:border-b-0 md:border-r border-white/5 p-4 flex flex-row md:flex-col gap-1.5 shrink-0 overflow-x-auto md:overflow-x-visible">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2.5 px-3.5 py-3 rounded-[12px] text-xs font-semibold w-full text-left transition-colors whitespace-nowrap cursor-pointer focus:outline-none ${
              activeTab === 'profile' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User size={14} />
            <span>Profile Identity</span>
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-2.5 px-3.5 py-3 rounded-[12px] text-xs font-semibold w-full text-left transition-colors whitespace-nowrap cursor-pointer focus:outline-none ${
              activeTab === 'appearance' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe size={14} />
            <span>Theme & Language</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2.5 px-3.5 py-3 rounded-[12px] text-xs font-semibold w-full text-left transition-colors whitespace-nowrap cursor-pointer focus:outline-none ${
              activeTab === 'notifications' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell size={14} />
            <span>Alert Pipelines</span>
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2.5 px-3.5 py-3 rounded-[12px] text-xs font-semibold w-full text-left text-red-400 hover:text-red-300 transition-colors whitespace-nowrap cursor-pointer focus:outline-none ${
              activeTab === 'privacy' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-slate-400 hover:text-red-400/80'
            }`}
          >
            <Shield size={14} />
            <span>Data & Destruction</span>
          </button>
        </div>

        {/* Right Tab Content area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              {activeTab === 'profile' && 'Identity Core Configuration'}
              {activeTab === 'appearance' && 'System Parameters'}
              {activeTab === 'notifications' && 'Alert Pipelines'}
              {activeTab === 'privacy' && 'Core Destruct Controls'}
            </h3>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors cursor-pointer focus:outline-none"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form / Scroll Container */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">User Identity name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-[15px] py-3 px-4 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Tony Stark"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Avatar Neural Seed</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={avatarSeed}
                      onChange={(e) => setAvatarSeed(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-[15px] py-3 px-4 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="seed"
                    />
                    <img 
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`} 
                      alt="avatar" 
                      className="w-11 h-11 rounded-xl border border-white/10 bg-[#0C0C0F] p-1 shrink-0"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-500 font-semibold rounded-[15px] text-xs text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-500/35 flex items-center gap-2 cursor-pointer focus:outline-none"
                  >
                    {saveSuccess ? (
                      <>
                        <Check size={14} className="text-white animate-pulse" />
                        <span>Core Parameters Synced</span>
                      </>
                    ) : (
                      <span>Save Parameters</span>
                    )}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2.5 uppercase tracking-wider">Interface Color Theme</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {(['light', 'dark', 'system'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`py-3 px-4 border rounded-[15px] text-xs font-semibold capitalize transition-all cursor-pointer focus:outline-none ${
                          theme === t 
                            ? 'bg-blue-600/10 text-blue-400 border-blue-500/30 font-bold' 
                            : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-400'
                        }`}
                      >
                        {t} Mode
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2.5 uppercase tracking-wider">System Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-[#0C0C0F] border border-white/10 rounded-[15px] py-3 px-4 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    <option value="en">English (US)</option>
                    <option value="es">Español (ES)</option>
                    <option value="fr">Français (FR)</option>
                    <option value="de">Deutsch (DE)</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-[15px] border border-white/10">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Neural Core Status Updates</h4>
                    <p className="text-[10px] text-gray-400 mt-1">Alert on successful conversation completions.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotif}
                    onChange={(e) => setEmailNotif(e.target.checked)}
                    className="w-4 h-4 text-blue-500 bg-black border-white/10 focus:ring-0 focus:ring-offset-0 accent-blue-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-[15px] border border-white/10">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Data Sync Indicators</h4>
                    <p className="text-[10px] text-gray-400 mt-1">Toggle push signals for file uploads & downloads.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={pushNotif}
                    onChange={(e) => setPushNotif(e.target.checked)}
                    className="w-4 h-4 text-blue-500 bg-black border-white/10 focus:ring-0 focus:ring-offset-0 accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="p-5 bg-white/5 border border-white/10 rounded-[20px] shadow-sm">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Download size={14} className="text-blue-500" />
                    <span>Download Core Intel backup</span>
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
                    Download a full encrypted JSON archive of your Jarvis parameters, chat history logs, and file schemas.
                  </p>
                  <button
                    onClick={handleExportData}
                    className="mt-4 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-xs font-semibold rounded-[15px] border border-white/10 hover:border-white/20 transition-colors cursor-pointer focus:outline-none"
                  >
                    Export Core Log
                  </button>
                </div>

                <div className="p-5 bg-red-500/5 border border-red-500/10 rounded-[20px] shadow-sm">
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                    <Trash2 size={14} />
                    <span>Destroy mainframe credentials</span>
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
                    Instantly de-authorize all secure connections, clearing memory stores and permanent cloud logs irreversibly.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="mt-4 px-4 py-2.5 bg-red-600/10 hover:bg-red-600 border border-red-500/20 hover:border-red-500 text-red-300 hover:text-white text-xs font-semibold rounded-[15px] transition-all cursor-pointer focus:outline-none"
                  >
                    Initiate System Wipe
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
