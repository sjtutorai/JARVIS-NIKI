import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Mail, Sparkles, AlertCircle } from 'lucide-react';

export interface AuthScreenProps {
  onBack?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onBack }) => {
  const { loginWithGoogle, loginAnonymously, sendPasswordlessLink } = useAuth();
  const [linkSent, setLinkSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
    }
  });

  const onSubmit = async (data: any) => {
    setAuthError(null);
    setLoadingAction('email');
    try {
      await sendPasswordlessLink(data.email);
      setSentEmail(data.email);
      setLinkSent(true);
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setLoadingAction('google');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setAuthError(err.message || 'Google Authentication failed.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGuestLogin = async () => {
    setAuthError(null);
    setLoadingAction('guest');
    try {
      await loginAnonymously();
    } catch (err: any) {
      setAuthError(err.message || 'Guest Authentication failed.');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0A0A0C]">
      {/* Decorative Blur Backdrops */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.08)_0%,transparent_50%)] pointer-events-none" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-[#0F0F12] p-10 rounded-[30px] text-white shadow-2xl border border-white/5 relative z-10"
      >
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/5 p-1 border border-white/10 shadow-[0_0_20px_rgba(37,99,235,0.25)] mb-4">
            <img 
              src="https://i.ibb.co/pjJvWvG0/Chat-GPT-Image-Jul-4-2026-01-41-13-PM.png" 
              alt="Jarvis Logo" 
              className="w-full h-full object-contain rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight uppercase">
            JARVIS AI
          </h2>
          <p className="text-xs text-gray-500 mt-2 uppercase tracking-[0.15em] font-medium">
            Initialize Authentication
          </p>
        </div>

        {/* Global Error Banner */}
        <AnimatePresence>
          {authError && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 bg-red-500/10 border border-red-500/20 text-red-300 p-3.5 rounded-[15px] flex items-start gap-2.5 text-xs overflow-hidden"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
              <span>{authError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {linkSent ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <Sparkles className="w-6 h-6 animate-pulse text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-wide uppercase">Magic Link Dispatched</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
              We have dispatched a secure verification link to <strong className="text-blue-400 font-bold">{sentEmail}</strong>.
            </p>
            <p className="text-[11px] text-gray-500 leading-relaxed max-w-xs mx-auto">
              Open your email inbox on this device, click the verification link, and your Jarvis session will authenticate automatically.
            </p>
            <button
              type="button"
              onClick={() => {
                setLinkSent(false);
                setAuthError(null);
              }}
              className="mt-6 text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors focus:outline-none cursor-pointer uppercase tracking-wider"
            >
              ← Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                  })}
                  placeholder="tony@starkindustries.com"
                  className="w-full bg-white/5 border border-white/10 rounded-[15px] py-3.5 pl-11 pr-4 text-sm text-slate-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              {errors.email && <p className="text-[11px] text-red-400 mt-1">{errors.email.message}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!!loadingAction}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-[15px] py-3.5 text-sm transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/35 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4 cursor-pointer focus:outline-none uppercase tracking-wider"
            >
              {loadingAction === 'email' ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Send Magic Link</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Separator */}
        <div className="relative flex items-center justify-center my-8">
          <div className="absolute w-full h-[1px] bg-white/5" />
          <span className="relative bg-[#0F0F12] px-3.5 text-[10px] text-gray-500 font-mono tracking-[0.2em] uppercase font-medium">
            Alternative Access
          </span>
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={!!loadingAction}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-[15px] border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer focus:outline-none"
          >
            {loadingAction === 'google' ? (
              <span className="w-4 h-4 border-2 border-slate-300/30 border-t-slate-300 rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.74 14.93 1 12 1 7.37 1 3.4 3.65 1.5 7.5l3.78 2.93c.89-2.65 3.39-4.39 6.72-4.39z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.47-1.11 2.72-2.35 3.56l3.66 2.84c2.14-1.97 3.74-4.88 3.74-8.5z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 10.43c-.23-.68-.36-1.41-.36-2.16s.13-1.48.36-2.16L1.5 3.18C.54 5.12 0 7.29 0 9.5s.54 4.38 1.5 6.32l3.78-3.39z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.1.74-2.51 1.18-4.3 1.18-3.33 0-5.83-1.74-6.72-4.39L1.5 16.97C3.4 20.82 7.37 23 12 23z"
                  />
                </svg>
                <span>Google</span>
              </>
            )}
          </button>

          {/* Guest Login */}
          <button
            onClick={handleGuestLogin}
            disabled={!!loadingAction}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-[15px] border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer focus:outline-none"
          >
            {loadingAction === 'guest' ? (
              <span className="w-4 h-4 border-2 border-slate-300/30 border-t-slate-300 rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles size={14} className="text-blue-500 animate-pulse" />
                <span>Guest Mode</span>
              </>
            )}
          </button>
        </div>



        {onBack && (
          <div className="text-center mt-6 pt-4 border-t border-white/5">
            <button
              onClick={onBack}
              className="text-xs text-gray-400 hover:text-white transition-all focus:outline-none cursor-pointer font-medium"
            >
              ← Return to Home
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
