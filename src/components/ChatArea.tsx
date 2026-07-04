import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { Message, AIModelType, FileAttachment } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Send, Bot, Sparkles, Mic, MicOff, Volume2, VolumeX, Copy, Check, RefreshCw, 
  Paperclip, Image, FileText, CheckCircle, Flame, Shield, Play, Square, AlertCircle, X, ThumbsUp, ThumbsDown, Share2
} from 'lucide-react';

interface ChatAreaProps {
  convoId: string | null;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  model: AIModelType;
  setModel: (model: AIModelType) => void;
  triggerAnalyticsRefresh: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  convoId,
  messages,
  setMessages,
  model,
  setModel,
  triggerAnalyticsRefresh
}) => {
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Voice Settings
  const [isRecording, setIsRecording] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
  const [speechSynthesisAvailable, setSpeechSynthesisAvailable] = useState(false);
  const [speechRecognitionAvailable, setSpeechRecognitionAvailable] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Check speech features on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSpeechSynthesisAvailable('speechSynthesis' in window);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechRecognitionAvailable(true);
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';
        
        rec.onstart = () => {
          setIsRecording(true);
        };
        
        rec.onend = () => {
          setIsRecording(false);
        };
        
        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputText(prev => prev ? `${prev} ${transcript}` : transcript);
          }
        };
        
        rec.onerror = (e: any) => {
          console.error("Speech Recognition error:", e);
          setIsRecording(false);
        };
        
        recognitionRef.current = rec;
      }
    }
  }, []);

  // Auto Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleToggleRecord = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSpeakText = (messageId: string, text: string) => {
    if (!speechSynthesisAvailable) return;
    
    // Stop current speech if active
    if (activeSpeechId === messageId) {
      window.speechSynthesis.cancel();
      setActiveSpeechId(null);
      return;
    }

    window.speechSynthesis.cancel();
    
    // Clean up text of markdown/code syntax before speaking
    const cleanText = text
      .replace(/```[\s\S]*?```/g, '[Code block content omitted]')
      .replace(/[*#_`]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => {
      setActiveSpeechId(null);
    };
    utterance.onerror = () => {
      setActiveSpeechId(null);
    };

    setActiveSpeechId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  // Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const processFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const newAttachment: FileAttachment = {
          id: `file_${Math.random().toString(36).substring(2, 11)}`,
          name: file.name,
          size: file.size,
          type: file.type || 'text/plain',
          dataUrl
        };
        setAttachments(prev => [...prev, newAttachment]);
      };
      // For text files, read as data url of text/plain base64
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // Core Sending Logic (Stream)
  const handleSendMessage = async (e?: React.FormEvent, retryText?: string) => {
    if (e) e.preventDefault();
    const textToSend = retryText || inputText;
    if (!textToSend.trim() && attachments.length === 0) return;
    if (!convoId || !user) return;

    // Reset input fields
    if (!retryText) {
      setInputText('');
    }
    const currentAttachments = [...attachments];
    setAttachments([]);

    // 1. Create User Message
    const userMsg: Message = {
      id: `msg_${Math.random().toString(36).substring(2, 11)}`,
      conversationId: convoId,
      role: 'user',
      content: textToSend,
      createdAt: Date.now(),
      attachments: currentAttachments,
      status: 'sending'
    };

    // Save and render User Message
    setMessages(prev => [...prev, userMsg]);
    await dbService.saveMessage(userMsg);

    // 2. Set Typing Shimmer
    setIsTyping(true);

    // 3. Create Assistant Message Placeholder
    const assistantMsgId = `msg_${Math.random().toString(36).substring(2, 11)}`;
    const assistantMsg: Message = {
      id: assistantMsgId,
      conversationId: convoId,
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
      model,
      status: 'sending'
    };

    setMessages(prev => [...prev, assistantMsg]);

    // Send payload to backend streaming API
    try {
      const historyToSend = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
        attachments: m.attachments?.map(a => ({
          name: a.name,
          type: a.type,
          dataUrl: a.dataUrl
        }))
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyToSend,
          model
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Server connection failed.');
      }

      // Read stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      if (!reader) throw new Error('Stream reader not available.');

      let assistantContent = '';
      let isStreaming = true;

      while (isStreaming) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              isStreaming = false;
              break;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                assistantContent += parsed.text;
                // Update Assistant Message on the fly
                setMessages(prev => 
                  prev.map(m => m.id === assistantMsgId ? { ...m, content: assistantContent, status: 'sent' } : m)
                );
              }
            } catch (err) {
              // Parse error or incomplete line
            }
          }
        }
      }

      // Save complete assistant message to Firestore / Local
      const finalizedAssistant: Message = {
        ...assistantMsg,
        content: assistantContent,
        status: 'sent'
      };
      await dbService.saveMessage(finalizedAssistant);

      // Save usage analytics
      const updatedAnalytics = await dbService.getAnalytics(user.uid);
      const wordsCount = assistantContent.split(/\s+/).length;
      
      updatedAnalytics.totalMessages += 2; // User and Assistant
      updatedAnalytics.wordsGenerated += wordsCount;
      if (currentAttachments.length > 0) {
        updatedAnalytics.filesUploaded += currentAttachments.length;
      }
      
      // Update daily logs
      const today = new Date().toISOString().split('T')[0];
      const todayLog = updatedAnalytics.dailyUsage.find(d => d.date === today);
      if (todayLog) {
        todayLog.messages += 2;
        todayLog.words += wordsCount;
      } else {
        updatedAnalytics.dailyUsage.push({ date: today, messages: 2, words: wordsCount });
      }
      updatedAnalytics.lastUpdated = Date.now();
      await dbService.saveAnalytics(user.uid, updatedAnalytics);
      triggerAnalyticsRefresh();

    } catch (err: any) {
      console.error("Transmission Error:", err);
      // Mark assistant message as failed
      setMessages(prev => 
        prev.map(m => m.id === assistantMsgId ? { 
          ...m, 
          content: `⚠️ Failed to receive response: ${err.message || "Unable to establish stable neural sync with Jarvis."}`, 
          status: 'error' 
        } : m)
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLikeMessage = async (msg: Message, rating: 'like' | 'dislike') => {
    const updated = { ...msg, rating: msg.rating === rating ? null : rating };
    setMessages(prev => prev.map(m => m.id === msg.id ? updated : m));
    await dbService.saveMessage(updated);
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 flex flex-col h-full bg-[#0A0A0C] relative overflow-hidden transition-all duration-300 ${
        isDragOver ? 'border-2 border-dashed border-cyan-400 bg-cyan-950/10' : ''
      }`}
    >
      {/* Background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.08)_0%,transparent_50%)] pointer-events-none" />

      {/* Top Bar / Model Selector */}
      <div className="h-16 flex items-center justify-between px-8 bg-white/5 backdrop-blur-md border-b border-white/5 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <Sparkles size={18} className="text-cyan-400 animate-pulse" />
          <h2 className="text-sm font-extrabold text-white tracking-widest uppercase font-sans">Jarvis Core Node</h2>
        </div>

        {/* Model Selection Tabs */}
        <div className="flex bg-white/5 p-1 rounded-[15px] border border-white/10">
          {(['fast', 'balanced', 'advanced'] as AIModelType[]).map(m => (
            <button
              key={m}
              onClick={() => setModel(m)}
              className={`px-3 py-1.5 rounded-[12px] text-xs font-semibold capitalize transition-all ${
                model === m 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Main Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 z-10">
        {messages.length === 0 ? (
          <EmptyState onSuggestionClick={(text) => setInputText(text)} />
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id || index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end items-start' : 'justify-start items-start'}`}
              >
                {/* Assistant Avatar */}
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 p-0.5 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(37,99,235,0.2)]">
                    <img 
                      src="https://i.ibb.co/hFDRXRh7/Chat-GPT-Image-Jul-4-2026-01-41-13-PM.png" 
                      alt="Jarvis Logo" 
                      className="w-full h-full object-contain rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div className={`flex flex-col max-w-[70%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Speech name indicator */}
                  <div className="flex items-center gap-2 mb-1.5 px-1 text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                    <span>{msg.role === 'user' ? 'Operator' : `Jarvis // ${msg.model || 'Flash'}`}</span>
                    {msg.status === 'sending' && (
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`p-5 rounded-[20px] text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-600/15'
                      : msg.status === 'error'
                        ? 'bg-red-950/20 border border-red-900/50 text-red-200 rounded-tl-none'
                        : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-none'
                  }`}>
                    {/* Render Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2.5 mb-3.5">
                        {msg.attachments.map(att => (
                          <div key={att.id} className="bg-white/5 border border-white/10 rounded-[15px] p-2 flex items-center gap-2.5 max-w-xs text-xs">
                            {att.type.startsWith('image/') ? (
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 bg-slate-900 shrink-0">
                                <img src={att.dataUrl} alt={att.name} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                                <FileText size={18} className="text-blue-400" />
                              </div>
                            )}
                            <div className="overflow-hidden">
                              <p className="font-semibold text-slate-300 truncate max-w-[140px]">{att.name}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{(att.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Markdown text parser rendering */}
                    <div className="prose prose-invert max-w-none text-slate-200 leading-relaxed font-sans space-y-2">
                      <MessageContent text={msg.content} />
                    </div>
                  </div>

                  {/* Bubble Actions bar */}
                  <div className="flex items-center gap-3 mt-2 px-1 text-slate-500 text-xs">
                    <button 
                      onClick={() => handleCopyText(msg.content, msg.id)}
                      className="hover:text-slate-300 flex items-center gap-1 font-mono text-[10px] tracking-wide focus:outline-none"
                    >
                      {copiedId === msg.id ? <Check size={11} className="text-cyan-400" /> : <Copy size={11} />}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>
                    
                    {speechSynthesisAvailable && msg.role === 'assistant' && (
                      <button 
                        onClick={() => handleSpeakText(msg.id, msg.content)}
                        className={`hover:text-slate-300 flex items-center gap-1 font-mono text-[10px] tracking-wide focus:outline-none ${
                          activeSpeechId === msg.id ? 'text-cyan-400 animate-pulse' : ''
                        }`}
                      >
                        {activeSpeechId === msg.id ? <Square size={11} className="text-red-400" /> : <Volume2 size={11} />}
                        <span>{activeSpeechId === msg.id ? 'Stop Speak' : 'Speak'}</span>
                      </button>
                    )}

                    {msg.role === 'assistant' && (
                      <>
                        <button 
                          onClick={() => handleLikeMessage(msg, 'like')}
                          className={`hover:text-cyan-400 transition-colors focus:outline-none ${msg.rating === 'like' ? 'text-cyan-400' : ''}`}
                        >
                          <ThumbsUp size={11} />
                        </button>
                        <button 
                          onClick={() => handleLikeMessage(msg, 'dislike')}
                          className={`hover:text-red-400 transition-colors focus:outline-none ${msg.rating === 'dislike' ? 'text-red-400' : ''}`}
                        >
                          <ThumbsDown size={11} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* User Avatar */}
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/10 text-xs font-bold text-gray-300">
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : user?.email ? user.email.slice(0, 2).toUpperCase() : 'JD'}
                  </div>
                )}
              </motion.div>
            ))}

            {/* Simulated Loading Shimmer */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4 justify-start items-start"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 p-0.5 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(37,99,235,0.2)]">
                  <img 
                    src="https://i.ibb.co/hFDRXRh7/Chat-GPT-Image-Jul-4-2026-01-41-13-PM.png" 
                    alt="Jarvis Logo" 
                    className="w-full h-full object-contain rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col items-start max-w-[80%]">
                  <div className="flex items-center gap-2 mb-1 px-1 text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                    <span>Jarvis // Synchronizing...</span>
                  </div>
                  <div className="p-5 rounded-[20px] rounded-tl-none bg-white/5 border border-white/10 text-slate-400 flex items-center gap-1.5">
                    <span className="typing-dot w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    <span className="typing-dot w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <span className="typing-dot w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Drag Over Mask Overlay */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-20 flex flex-col items-center justify-center text-cyan-400 p-8"
          >
            <div className="w-24 h-24 rounded-full border border-cyan-400/30 bg-cyan-500/10 flex items-center justify-center mb-4 neon-glow-cyan animate-bounce">
              <Paperclip size={40} />
            </div>
            <h3 className="text-xl font-bold tracking-wider">Feed Data to Jarvis</h3>
            <p className="text-sm text-slate-400 mt-2">Drop images, texts, or spreadsheet files here to sync core memory.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attachments Preview bar */}
      {attachments.length > 0 && (
        <div className="px-6 py-2.5 bg-slate-950/90 border-t border-slate-800 flex flex-wrap gap-2.5 z-10">
          {attachments.map(att => (
            <div key={att.id} className="relative bg-slate-900 border border-slate-800 rounded-xl p-1.5 pl-3 pr-8 flex items-center gap-2 max-w-xs text-xs">
              {att.type.startsWith('image/') ? (
                <Image size={14} className="text-cyan-400" />
              ) : (
                <FileText size={14} className="text-blue-400" />
              )}
              <span className="font-semibold text-slate-300 truncate max-w-[120px]">{att.name}</span>
              <button 
                onClick={() => handleRemoveAttachment(att.id)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-800 text-slate-500 hover:text-white rounded"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Chat Input form area */}
      <div className="p-8 relative z-10 shrink-0 bg-transparent">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-400/20 blur-xl opacity-35 pointer-events-none" />
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto relative group">
          <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[24px] p-2 flex items-center gap-2 shadow-2xl">
            {/* File Attach Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 hover:bg-white/5 rounded-[18px] text-gray-400 hover:text-white transition-colors focus:outline-none"
              title="Attach logs"
            >
              <Paperclip size={20} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden" 
              multiple
            />

            {/* Text Input */}
            <input
              type="text"
              placeholder={convoId ? "Message Jarvis..." : "Create or select a system core session to begin"}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={!convoId}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 px-2 text-white placeholder-gray-500 focus:outline-none disabled:opacity-40"
            />
            
            <div className="flex items-center gap-1 pr-2">
              {/* Mic voice input Button */}
              {speechRecognitionAvailable && convoId && (
                <button
                  type="button"
                  onClick={handleToggleRecord}
                  className={`p-3 hover:bg-white/5 rounded-[18px] text-gray-400 hover:text-white transition-colors focus:outline-none ${
                    isRecording 
                      ? 'text-red-500 bg-red-500/10 animate-pulse' 
                      : ''
                  }`}
                  title={isRecording ? "Stop voice interface" : "Start voice interface"}
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              )}

              {/* Send Action */}
              <button
                type="submit"
                disabled={!convoId || (!inputText.trim() && attachments.length === 0)}
                className="bg-blue-600 p-3 rounded-[18px] text-white shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center shrink-0 disabled:opacity-40 focus:outline-none"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </form>
        <p className="text-center text-[10px] text-slate-600 font-mono mt-4 uppercase tracking-[0.2em] font-medium">
          Jarvis Core Intel V3.5 // Protected by Stark Protocol
        </p>
      </div>
    </div>
  );
};

/* Suggestions / Empty State Card layout */
interface EmptyStateProps {
  onSuggestionClick: (text: string) => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onSuggestionClick }) => {
  const suggestions = [
    { title: "Develop neural sync", desc: "Write an elegant React state hook", text: "Write an elegant React custom hook for syncing component state to firestore with localStorage fail-safes." },
    { title: "Refine algorithms", desc: "Compare bubble vs quicksort logic", text: "Please compare Bubble Sort and Quick Sort algorithms, and write clean typescript versions." },
    { title: "Stark industrial brief", desc: "Draft a modern cyber-defense plan", text: "Draft an ironclad cybersecurity threat assessment and mitigation plan for a futuristic multi-billion industrial company." },
    { title: "Quantum metrics", desc: "Formulate a sleek CSS grid design", text: "How do I build a fluid, ultra-responsive bento-grid dashboard using pure Tailwind CSS utility classes? Show complete code." }
  ];

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center justify-center h-full text-center">
      <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 p-1 flex items-center justify-center mb-6">
        <img 
          src="https://i.ibb.co/hFDRXRh7/Chat-GPT-Image-Jul-4-2026-01-41-13-PM.png" 
          alt="Jarvis Logo" 
          className="w-full h-full object-contain rounded-full"
          referrerPolicy="no-referrer"
        />
      </div>
      <h3 className="text-2xl font-bold text-white tracking-tight">I am Jarvis</h3>
      <p className="text-xs text-gray-500 tracking-wider font-mono mt-2 uppercase">Stark Cybernetic Console v1.0.4</p>
      <p className="text-sm text-gray-400 max-w-md mt-4 leading-relaxed">
        Select a suggestion below or input diagnostic queries to sync with the Jarvis mainframe.
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 w-full">
        {suggestions.map((s, i) => (
          <div 
            key={i}
            onClick={() => onSuggestionClick(s.text)}
            className="bg-white/5 border border-white/10 p-5 rounded-[20px] text-left cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all duration-200 group"
          >
            <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-wider">{s.title}</h4>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* Code block renderer with syntax styling and copy button */
const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-[15px] border border-white/10 bg-[#050507] overflow-hidden font-mono text-xs shadow-lg max-w-full">
      {/* Code Header */}
      <div className="bg-white/5 px-4 py-2.5 flex items-center justify-between border-b border-white/5">
        <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">{language || 'code'}</span>
        <button 
          onClick={copyCode}
          className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors focus:outline-none"
        >
          {copied ? (
            <>
              <Check size={12} className="text-blue-500" />
              <span className="text-[10px] text-blue-500">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} className="text-slate-400" />
              <span className="text-[10px] text-slate-400">Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <pre className="p-4 overflow-x-auto text-slate-300 leading-relaxed font-mono">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
};

/* Custom Markdown Content text rendering engine with full support for tables, lists, blockquotes, etc. */
const MessageContent: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  return (
    <div className="markdown-body text-slate-200 space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Customize headers
          h1: ({ children }) => <h2 className="text-lg font-extrabold text-white uppercase tracking-wider mt-5 mb-2.5">{children}</h2>,
          h2: ({ children }) => <h3 className="text-base font-bold text-white uppercase tracking-wide mt-4 mb-2">{children}</h3>,
          h3: ({ children }) => <h4 className="text-sm font-bold text-white tracking-wider mt-3.5 mb-1.5">{children}</h4>,
          h4: ({ children }) => <h5 className="text-xs font-bold text-white tracking-widest uppercase mt-3 mb-1">{children}</h5>,
          
          // Customize paragraphs and lists
          p: ({ children }) => <p className="leading-relaxed text-slate-300 my-1 whitespace-pre-wrap">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 my-2.5 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 my-2.5 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-slate-300 my-0.5">{children}</li>,
          
          // Customize quotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 my-2.5 italic text-slate-400 bg-white/5 py-1.5 pr-2 rounded-r-lg">
              {children}
            </blockquote>
          ),
          
          // Customize links
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-cyan-400 hover:text-cyan-300 underline font-medium transition-colors"
            >
              {children}
            </a>
          ),
          
          // Customize tables (Render beautiful markdown tables with responsive styling)
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02] shadow-2xl">
              <table className="min-w-full divide-y divide-white/10 text-left border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-white/5">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-white/5">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-white/[0.01] transition-colors">{children}</tr>,
          th: ({ children }) => <th className="px-4 py-2.5 text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-white/10">{children}</th>,
          td: ({ children }) => <td className="px-4 py-2.5 text-sm text-slate-300 align-middle border-b border-white/[0.02]">{children}</td>,
          
          // Customize code (both inline and code block)
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const inline = !match;
            const codeString = String(children).replace(/\n$/, '');

            if (inline) {
              return (
                <code className="bg-slate-900/80 border border-slate-800 text-cyan-400 px-1.5 py-0.5 rounded font-mono text-xs" {...props}>
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock 
                language={match ? match[1] : 'code'} 
                code={codeString} 
              />
            );
          }
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};
