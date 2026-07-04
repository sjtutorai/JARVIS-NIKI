import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Bot, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500); // slight pause at 100%
          return 100;
        }
        return prev + 2;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0A0C] text-white">
      {/* Glow Backdrops */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(37,99,235,0.08)_0%,transparent_50%)] pointer-events-none" />

      <div className="z-10 flex flex-col items-center">
        {/* Animated Glowing Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative flex items-center justify-center w-28 h-28 rounded-full bg-white/5 border border-white/10 mb-8"
        >
          {/* Animated rings */}
          <div className="absolute inset-0 rounded-full border border-dashed border-white/10 animate-spin" style={{ animationDuration: '25s' }} />
          <div className="absolute inset-2 rounded-full border border-double border-white/5 animate-reverse-spin" style={{ animation: 'spin 15s linear infinite reverse' }} />
          
          <div className="flex items-center justify-center w-18 h-18 rounded-full bg-white/5 p-1.5 shadow-[0_0_20px_rgba(37,99,235,0.25)]">
            <img 
              src="https://i.ibb.co/pjJvWvG0/Chat-GPT-Image-Jul-4-2026-01-41-13-PM.png" 
              alt="Jarvis Logo" 
              className="w-full h-full object-contain rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-3xl font-bold tracking-wider text-white uppercase"
        >
          JARVIS AI
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 0.8 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-xs font-semibold text-gray-500 mt-2.5 tracking-[0.2em] uppercase font-medium"
        >
          Your Intelligent AI Assistant
        </motion.p>

        {/* Progress Bar Container */}
        <div className="w-56 h-1 bg-white/5 rounded-full overflow-hidden mt-12 border border-white/5">
          <motion.div
            className="h-full bg-blue-600 rounded-full"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Percentage Indicator */}
        <p className="text-xs font-mono text-gray-500 mt-3 tracking-wider uppercase font-medium">{percent}% System Loaded</p>
      </div>

      {/* Decorative watermark */}
      <div className="absolute bottom-6 text-[10px] text-gray-600 font-mono tracking-[0.2em] uppercase font-bold">
        JARVIS CORE V1.0.4 // INITIATING INTERFACE
      </div>
    </div>
  );
};
