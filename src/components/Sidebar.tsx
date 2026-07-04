import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { Conversation, Folder } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, MessageSquare, Pin, Star, Archive, Folder as FolderIcon, FolderPlus, 
  Settings, HelpCircle, Info, LogOut, Search, ChevronDown, ChevronRight, Trash2, Edit2
} from 'lucide-react';

interface SidebarProps {
  currentConvoId: string | null;
  onSelectConvo: (id: string) => void;
  onNewConvo: (folderId?: string | null) => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentConvoId,
  onSelectConvo,
  onNewConvo,
  onOpenSettings,
  onOpenHelp,
  conversations,
  setConversations
}) => {
  const { user, logout } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Loaded state
  useEffect(() => {
    if (user) {
      dbService.getFolders(user.uid).then(setFolders);
    }
  }, [user]);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newFolderName.trim()) return;

    const newFolder: Folder = {
      id: `folder_${Math.random().toString(36).substring(2, 11)}`,
      userId: user.uid,
      name: newFolderName.trim(),
      createdAt: Date.now()
    };

    await dbService.saveFolder(newFolder);
    setFolders([...folders, newFolder]);
    setNewFolderName('');
    setShowFolderModal(false);
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleDeleteConvo = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user) return;
    if (confirm("Are you sure you want to delete this conversation?")) {
      await dbService.deleteConversation(user.uid, id);
      setConversations(prev => prev.filter(c => c.id !== id));
    }
  };

  const togglePinConvo = async (e: React.MouseEvent, convo: Conversation) => {
    e.stopPropagation();
    const updated = { ...convo, isPinned: !convo.isPinned, updatedAt: Date.now() };
    await dbService.saveConversation(updated);
    setConversations(prev => prev.map(c => c.id === convo.id ? updated : c));
  };

  const toggleStarConvo = async (e: React.MouseEvent, convo: Conversation) => {
    e.stopPropagation();
    const updated = { ...convo, isStarred: !convo.isStarred, updatedAt: Date.now() };
    await dbService.saveConversation(updated);
    setConversations(prev => prev.map(c => c.id === convo.id ? updated : c));
  };

  const toggleArchiveConvo = async (e: React.MouseEvent, convo: Conversation) => {
    e.stopPropagation();
    const updated = { ...convo, isArchived: !convo.isArchived, updatedAt: Date.now() };
    await dbService.saveConversation(updated);
    setConversations(prev => prev.map(c => c.id === convo.id ? updated : c));
  };

  // Filter conversations
  const filteredConvos = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedConvos = filteredConvos.filter(c => c.isPinned && !c.isArchived);
  const starredConvos = filteredConvos.filter(c => c.isStarred && !c.isPinned && !c.isArchived);
  const unorganizedConvos = filteredConvos.filter(c => !c.isPinned && !c.isStarred && !c.folderId && !c.isArchived);
  const archivedConvos = filteredConvos.filter(c => c.isArchived);

  return (
    <div className="w-80 h-full flex flex-col bg-[#0F0F12] border-r border-white/5 text-slate-300 relative">
      {/* Sidebar Header */}
      <div className="p-6 flex items-center gap-3">
        <img 
          src="https://i.ibb.co/hFDRXRh7/Chat-GPT-Image-Jul-4-2026-01-41-13-PM.png" 
          alt="Jarvis Logo" 
          className="w-8 h-8 rounded-[10px] object-contain shadow-[0_0_15px_rgba(37,99,235,0.25)]"
          referrerPolicy="no-referrer"
        />
        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">JARVIS</span>
      </div>

      {/* Action Buttons */}
      <div className="px-4 mb-6 space-y-3">
        <button 
          onClick={() => onNewConvo(null)}
          className="w-full py-3 px-4 rounded-[15px] bg-blue-600 hover:bg-blue-500 text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 text-white"
        >
          <Plus size={16} />
          <span>New Conversation</span>
        </button>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search core logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-[12px] py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400/40 transition-colors"
          />
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {/* Pinned Section */}
        {pinnedConvos.length > 0 && (
          <div>
            <div className="text-[11px] uppercase tracking-widest text-gray-500 font-bold px-3 mb-2 flex items-center gap-1.5">
              <Pin size={10} className="text-cyan-400" />
              <span>Pinned Sessions</span>
            </div>
            <div className="space-y-1">
              {pinnedConvos.map(c => (
                <ConversationItem 
                  key={c.id} 
                  convo={c} 
                  isActive={currentConvoId === c.id}
                  onSelect={() => onSelectConvo(c.id)}
                  onDelete={(e) => handleDeleteConvo(e, c.id)}
                  onPin={(e) => togglePinConvo(e, c)}
                  onStar={(e) => toggleStarConvo(e, c)}
                  onArchive={(e) => toggleArchiveConvo(e, c)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Starred Section */}
        {starredConvos.length > 0 && (
          <div>
            <div className="text-[11px] uppercase tracking-widest text-gray-500 font-bold px-3 mb-2 flex items-center gap-1.5">
              <Star size={10} className="text-purple-400" />
              <span>Starred Records</span>
            </div>
            <div className="space-y-1">
              {starredConvos.map(c => (
                <ConversationItem 
                  key={c.id} 
                  convo={c} 
                  isActive={currentConvoId === c.id}
                  onSelect={() => onSelectConvo(c.id)}
                  onDelete={(e) => handleDeleteConvo(e, c.id)}
                  onPin={(e) => togglePinConvo(e, c)}
                  onStar={(e) => toggleStarConvo(e, c)}
                  onArchive={(e) => toggleArchiveConvo(e, c)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Folders Section */}
        {folders.length > 0 && (
          <div>
            <div className="text-[11px] uppercase tracking-widest text-gray-500 font-bold px-3 mb-2 flex items-center gap-1.5">
              <FolderIcon size={10} className="text-yellow-500" />
              <span>Folders</span>
            </div>
            <div className="space-y-1">
              {folders.map(folder => {
                const folderConvos = filteredConvos.filter(c => c.folderId === folder.id && !c.isArchived);
                const isExpanded = !!expandedFolders[folder.id];
                return (
                  <div key={folder.id} className="space-y-1">
                    <button 
                      onClick={() => toggleFolder(folder.id)}
                      className="w-full flex items-center justify-between p-3 rounded-[12px] hover:bg-white/5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        <FolderIcon size={14} className={isExpanded ? "text-yellow-400" : "text-yellow-600"} />
                        <span className="truncate">{folder.name}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-white/5 border border-white/10 rounded-md">
                        {folderConvos.length}
                      </span>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="pl-4 space-y-1 overflow-hidden"
                        >
                          {folderConvos.map(c => (
                            <ConversationItem 
                              key={c.id} 
                              convo={c} 
                              isActive={currentConvoId === c.id}
                              onSelect={() => onSelectConvo(c.id)}
                              onDelete={(e) => handleDeleteConvo(e, c.id)}
                              onPin={(e) => togglePinConvo(e, c)}
                              onStar={(e) => toggleStarConvo(e, c)}
                              onArchive={(e) => toggleArchiveConvo(e, c)}
                            />
                          ))}
                          <button
                            onClick={() => onNewConvo(folder.id)}
                            className="w-full flex items-center gap-2 py-2 px-3 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold border border-dashed border-cyan-500/20 rounded-[12px] hover:bg-cyan-500/5 mt-1 transition-colors"
                          >
                            <Plus size={10} />
                            <span>Add Log to Folder</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Regular Conversations */}
        <div>
          <div className="text-[11px] uppercase tracking-widest text-gray-500 font-bold px-3 mb-2 flex items-center gap-1.5">
            <MessageSquare size={10} />
            <span>Recent Chats</span>
          </div>
          <div className="space-y-1">
            {unorganizedConvos.length > 0 ? (
              unorganizedConvos.map(c => (
                <ConversationItem 
                  key={c.id} 
                  convo={c} 
                  isActive={currentConvoId === c.id}
                  onSelect={() => onSelectConvo(c.id)}
                  onDelete={(e) => handleDeleteConvo(e, c.id)}
                  onPin={(e) => togglePinConvo(e, c)}
                  onStar={(e) => toggleStarConvo(e, c)}
                  onArchive={(e) => toggleArchiveConvo(e, c)}
                />
              ))
            ) : (
              <p className="text-[10px] px-3.5 py-1 text-slate-600 italic">No recent chats.</p>
            )}
          </div>
        </div>

        {/* Archived Section */}
        {archivedConvos.length > 0 && (
          <div>
            <div className="text-[11px] uppercase tracking-widest text-gray-500 font-bold px-3 mb-2 flex items-center gap-1.5">
              <Archive size={10} />
              <span>Archived Logs</span>
            </div>
            <div className="space-y-1">
              {archivedConvos.map(c => (
                <ConversationItem 
                  key={c.id} 
                  convo={c} 
                  isActive={currentConvoId === c.id}
                  onSelect={() => onSelectConvo(c.id)}
                  onDelete={(e) => handleDeleteConvo(e, c.id)}
                  onPin={(e) => togglePinConvo(e, c)}
                  onStar={(e) => toggleStarConvo(e, c)}
                  onArchive={(e) => toggleArchiveConvo(e, c)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer System Control Panel */}
      <div className="p-4 mt-auto border-t border-white/5 bg-black/20 space-y-3">
        {/* User bar */}
        <div className="flex items-center gap-3 p-2 rounded-[12px] hover:bg-white/5 cursor-pointer">
          {user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.name || 'User'} 
              className="w-10 h-10 rounded-full border border-white/10"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold border border-white/10 text-white text-sm">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'JD'}
            </div>
          )}
          <div>
            <div className="text-xs font-semibold text-white">{user?.name || 'John Doe'}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-tighter">
              {user?.subscription || 'Premium'} Member
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-3 gap-1 text-center border-t border-white/5 pt-2">
          <button 
            onClick={onOpenSettings}
            className="flex flex-col items-center justify-center gap-1 py-1.5 text-[10px] text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <Settings size={14} />
            <span>Settings</span>
          </button>
          <button 
            onClick={onOpenHelp}
            className="flex flex-col items-center justify-center gap-1 py-1.5 text-[10px] text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <HelpCircle size={14} />
            <span>Help</span>
          </button>
          <button 
            onClick={logout}
            className="flex flex-col items-center justify-center gap-1 py-1.5 text-[10px] text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={14} />
            <span>Exit</span>
          </button>
        </div>
      </div>

      {/* Create Folder Modal */}
      <AnimatePresence>
        {showFolderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.form 
              onSubmit={handleCreateFolder}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-[#0F0F12] border border-white/10 p-6 rounded-[20px]"
            >
              <h3 className="text-lg font-bold text-white mb-4">Create Folder Tag</h3>
              <input 
                type="text" 
                placeholder="Folder Name (e.g. Analytics, Personal)"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-400 mb-4"
                autoFocus
              />
              <div className="flex justify-end gap-2.5">
                <button 
                  type="button" 
                  onClick={() => setShowFolderModal(false)}
                  className="px-4 py-2 text-xs font-semibold hover:bg-white/5 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition-all"
                >
                  Confirm folder
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* Mini Conversation Item Row */
interface ConversationItemProps {
  convo: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onPin: (e: React.MouseEvent) => void;
  onStar: (e: React.MouseEvent) => void;
  onArchive: (e: React.MouseEvent) => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  convo,
  isActive,
  onSelect,
  onDelete,
  onPin,
  onStar,
  onArchive
}) => {
  return (
    <div 
      onClick={onSelect}
      className={`group w-full flex items-center justify-between p-3 rounded-[12px] cursor-pointer text-sm font-sans transition-all duration-200 ${
        isActive 
          ? 'bg-white/5 border border-white/10 text-gray-200 shadow-lg' 
          : 'hover:bg-white/5 text-gray-400 hover:text-gray-200 border border-transparent'
      }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`w-2 h-2 rounded-full shrink-0 ${
          isActive 
            ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]' 
            : 'bg-gray-600'
        }`} />
        <span className="truncate">{convo.title || 'Diagnostic Log'}</span>
      </div>

      {/* Mini actions visible on hover or if active */}
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1.5 shrink-0">
        <button 
          onClick={onPin}
          title={convo.isPinned ? "Unpin session" : "Pin session"}
          className={`p-1 rounded hover:bg-white/10 transition-colors ${convo.isPinned ? 'text-cyan-400' : 'text-gray-500 hover:text-white'}`}
        >
          <Pin size={11} />
        </button>
        <button 
          onClick={onStar}
          title={convo.isStarred ? "Unstar record" : "Star record"}
          className={`p-1 rounded hover:bg-white/10 transition-colors ${convo.isStarred ? 'text-purple-400' : 'text-gray-500 hover:text-white'}`}
        >
          <Star size={11} />
        </button>
        <button 
          onClick={onArchive}
          title={convo.isArchived ? "Unarchive record" : "Archive record"}
          className={`p-1 rounded hover:bg-white/10 transition-colors ${convo.isArchived ? 'text-yellow-500' : 'text-gray-500 hover:text-white'}`}
        >
          <Archive size={11} />
        </button>
        <button 
          onClick={onDelete}
          title="Delete log"
          className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-red-400 transition-colors"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
};
