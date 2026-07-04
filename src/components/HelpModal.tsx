import React from 'react';
import { motion } from 'motion/react';
import { X, HelpCircle, ShieldAlert, Cpu, Terminal, RefreshCw } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg bg-[#0F0F12] border border-white/5 rounded-[30px] text-white shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HelpCircle size={18} className="text-blue-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Jarvis Help Mainframe</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors cursor-pointer focus:outline-none"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[400px]">
          <div>
            <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">1. Cognitive Models</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Jarvis operates on three dynamic performance levels:
            </p>
            <ul className="list-disc pl-5 mt-2 text-xs text-slate-400 space-y-1.5">
              <li><strong className="text-white">Fast AI:</strong> Hyper-efficient flash model optimized for lightning-quick general questions.</li>
              <li><strong className="text-white">Balanced AI:</strong> General purpose model blending reasoning and speed.</li>
              <li><strong className="text-white">Advanced AI:</strong> High-intelligence reasoning engine designed for deep code synthesis and complex logic tasks.</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">2. Cybernetic Attachments</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              You can feed data logs to Jarvis by clicking the paperclip button or dropping files directly on the chat workspace. Supports: Images, text logs, spreadsheet schemas.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">3. Verbal Uplink (Voice)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use the Microphone button in the chat input bar to trigger the speech-to-text verbal link. Click 'Speak' on any response from Jarvis to synthesize audio vocal output.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">4. Stark Defensive protocol</h4>
            <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-[15px] flex gap-3">
              <ShieldAlert size={20} className="text-red-400 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h5 className="text-xs font-semibold text-red-300 uppercase tracking-wider">Local Isolation Safe-Guards</h5>
                <p className="text-[11px] text-gray-400 leading-relaxed mt-1">
                  Your core conversations are synchronized securely to Firestore database. In guest mode or offline environments, safe-guard algorithms isolate your keys, caching logs purely in localized encrypted browser storage.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/5 bg-[#0F0F12] flex items-center justify-between text-[10px] text-gray-500 uppercase tracking-wider font-medium">
          <span>Stark Industries Core</span>
          <span>Build v1.0.4</span>
        </div>
      </motion.div>
    </div>
  );
};
