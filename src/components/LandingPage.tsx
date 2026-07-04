import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, MessageSquare, FileText, Image as ImageIcon, Code, Mic, Globe, PenTool, Zap, Lock, 
  Cloud, Check, ChevronRight, ChevronLeft, Star, ArrowRight, Menu, X, Play, Shield, 
  Sparkles, Award, Eye, RefreshCw, Smartphone, Laptop, Settings, HelpCircle, 
  LayoutDashboard, Database, Send, Mail, Github, Linkedin, Twitter, Instagram, Heart
} from 'lucide-react';

// Counter component for Trusted By section
const AnimatedCounter: React.FC<{ value: number; suffix?: string; label: string }> = ({ value, suffix = '', label }) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isIntersecting) return;

    let start = 0;
    const duration = 2000; // 2 seconds
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quad
      const easeProgress = progress * (2 - progress);
      const currentCount = Math.floor(easeProgress * value);

      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value, isIntersecting]);

  return (
    <div ref={elementRef} className="text-center p-6">
      <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight font-mono text-blue-500">
        {count.toLocaleString()}{suffix}
      </h3>
      <p className="text-sm font-semibold text-gray-400 mt-2 uppercase tracking-widest">{label}</p>
    </div>
  );
};

interface LandingPageProps {
  onSignIn: () => void;
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSignIn, onGetStarted }) => {
  const [isDark, setIsDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  
  // Carousel State
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Live Simulated Chat in Hero
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'jarvis', text: string }>>([
    { sender: 'user', text: "Jarvis, draft a marketing campaign for our new premium SaaS." }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  const prompts = [
    {
      user: "Jarvis, draft a marketing campaign for our new premium SaaS.",
      response: "Stark Launch Campaign: 1. Cybernetic teasers (15s clips), 2. Neural beta testing invite, 3. Dynamic pricing structure highlighting 24/7 assistant uptime. Ready for deployment."
    },
    {
      user: "Analyze this code fragment for memory leaks and performance blocks.",
      response: "Analysis: Memory leak identified in your useEffect dependency array at line 42. Stabilizing values via useCallback yields a 24% boost in UI cycle latency."
    },
    {
      user: "Summarize the primary benefits of using Jarvis over generic LLMs.",
      response: "Jarvis advantages: Extreme lightning fast execution (<1.2s), secure isolated database containers, custom user-authored seed profiles, and verbal speech link."
    }
  ];

  useEffect(() => {
    const chatSequence = async () => {
      // Wait before responding
      setIsTyping(true);
      await new Promise(r => setTimeout(r, 2000));
      setIsTyping(false);
      setChatMessages(prev => [...prev, { sender: 'jarvis', text: prompts[currentPromptIndex].response }]);

      // Wait before loading next conversation
      await new Promise(r => setTimeout(r, 5000));
      const nextIndex = (currentPromptIndex + 1) % prompts.length;
      setCurrentPromptIndex(nextIndex);
      setChatMessages([{ sender: 'user', text: prompts[nextIndex].user }]);
    };

    chatSequence();
  }, [currentPromptIndex]);

  // Carousel auto play
  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % 7);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const screenshots = [
    {
      id: 'home',
      title: 'Home Screen',
      desc: 'Elegant cybernetic welcome portal tailored to your workflow.',
      content: (
        <div className="w-full h-full bg-[#070709] border border-white/5 rounded-2xl p-6 text-left flex flex-col justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <Bot size={20} className="text-blue-500" />
              <span className="font-bold text-xs uppercase tracking-widest text-white">Jarvis Core</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
          </div>
          <div className="my-auto py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-600/10 flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
              <Sparkles size={22} className="text-blue-500" />
            </div>
            <h4 className="text-lg font-bold text-white tracking-tight">Welcome, Operator</h4>
            <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed">Neural pipelines synchronized. Diagnostic metrics initialized.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-mono text-gray-400">
            <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl">Node: Stable</div>
            <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl">Sync: Cloud 100%</div>
          </div>
        </div>
      )
    },
    {
      id: 'chat',
      title: 'Chat Interface',
      desc: 'Clean conversational design with responsive bubble indicators and speed optimization.',
      content: (
        <div className="w-full h-full bg-[#070709] border border-white/5 rounded-2xl p-4 text-left flex flex-col justify-between overflow-hidden relative">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-[10px] font-mono text-gray-400">Session ID: CONVO_9302</span>
            <span className="text-[9px] bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full font-mono font-bold">Balanced AI</span>
          </div>
          <div className="flex-1 py-4 space-y-3.5 overflow-y-auto">
            <div className="bg-white/5 rounded-[15px] p-3 text-xs text-slate-300 max-w-[85%] self-end ml-auto border border-white/5">
              Draft an optimized React loop function.
            </div>
            <div className="bg-blue-600/10 rounded-[15px] p-3 text-xs text-slate-300 max-w-[85%] border border-blue-500/15">
              <div className="flex items-center gap-1.5 text-[10px] text-blue-400 font-bold mb-1 uppercase tracking-wider">
                <Bot size={12} />
                <span>Jarvis</span>
              </div>
              Here is the optimized structure:
              <pre className="mt-1 bg-black/40 p-2 rounded-lg font-mono text-[9px] text-gray-400">
                {"const loop = useCallback(() => {\n  // Optimized logic\n}, [deps]);"}
              </pre>
            </div>
          </div>
          <div className="flex gap-2 border-t border-white/5 pt-2.5">
            <input type="text" placeholder="Query Jarvis Mainframe..." disabled className="flex-1 bg-white/5 border border-white/5 rounded-xl text-[10px] px-3 py-2 text-gray-400" />
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white cursor-not-allowed">
              <Send size={12} />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'mobile',
      title: 'Mobile View',
      desc: 'Seamless, thumb-friendly navigation and rich styling tailored for smart devices.',
      content: (
        <div className="w-full h-full flex justify-center items-center">
          <div className="w-56 h-full bg-[#070709] border-4 border-gray-800 rounded-[30px] p-3 text-left flex flex-col justify-between overflow-hidden relative shadow-2xl">
            <div className="w-20 h-4 bg-gray-800 rounded-b-xl mx-auto absolute top-0 left-1/2 -translate-x-1/2 z-10" />
            <div className="flex items-center justify-between border-b border-white/5 pb-2 pt-2">
              <Bot size={14} className="text-blue-500" />
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">Jarvis</span>
              <Menu size={14} className="text-gray-400" />
            </div>
            <div className="flex-1 flex flex-col justify-center items-center text-center px-2">
              <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center border border-blue-500/20 mb-3">
                <Mic size={18} className="text-blue-500" />
              </div>
              <h5 className="text-xs font-bold text-white uppercase">Mobile Uplink Active</h5>
              <p className="text-[9px] text-gray-500 mt-1">Tap microphone to initiate voice synchronization.</p>
            </div>
            <div className="h-8 bg-white/5 border border-white/5 rounded-xl flex items-center px-2 text-[8px] text-gray-500">
              Speak query...
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'dark',
      title: 'Dark Mode',
      desc: 'Beautiful deep cosmic theme packed with customizable ambient glowing backdrops.',
      content: (
        <div className="w-full h-full bg-[#040406] border border-white/10 rounded-2xl p-6 text-left flex flex-col justify-between overflow-hidden relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-white uppercase tracking-widest font-mono text-glow">Dark Protocol v1.4</span>
            <div className="w-4 h-4 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(124,58,237,0.8)]" />
          </div>
          <div className="space-y-2 mt-4 relative z-10">
            <div className="h-3 w-3/4 bg-white/5 rounded" />
            <div className="h-3 w-1/2 bg-white/5 rounded" />
            <div className="h-3 w-5/6 bg-white/5 rounded" />
          </div>
          <p className="text-[10px] font-mono text-purple-400 mt-6 tracking-wider uppercase">Active Dark-matter Matrix</p>
        </div>
      )
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      desc: 'Real-time telemetry tracking, token counts, analytics, and interactive achievement logs.',
      content: (
        <div className="w-full h-full bg-[#070709] border border-white/5 rounded-2xl p-5 text-left flex flex-col justify-between overflow-hidden relative">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Metrics Telemetry</span>
            <span className="text-[9px] text-gray-500 font-mono">Synced</span>
          </div>
          <div className="grid grid-cols-2 gap-2 my-auto">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="text-[8px] text-gray-500 uppercase font-bold tracking-wider">Chats</span>
              <h5 className="text-base font-black text-white font-mono mt-1">1,482</h5>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="text-[8px] text-gray-500 uppercase font-bold tracking-wider">Efficiency</span>
              <h5 className="text-base font-black text-blue-500 font-mono mt-1">99.8%</h5>
            </div>
          </div>
          <div className="h-10 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between px-3 text-[10px]">
            <span className="text-gray-400">Total Neural Loops</span>
            <span className="text-blue-400 font-mono font-bold">143K</span>
          </div>
        </div>
      )
    },
    {
      id: 'settings',
      title: 'Settings',
      desc: 'Configure avatar neural seeds, notification parameters, and custom system languages.',
      content: (
        <div className="w-full h-full bg-[#070709] border border-white/5 rounded-2xl p-5 text-left flex flex-col justify-between overflow-hidden relative">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">System Config</span>
            <Settings size={14} className="text-gray-400" />
          </div>
          <div className="space-y-2.5 my-auto">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-400">Voice Synthesis Voice</span>
              <span className="text-blue-400 font-bold">Stark Male Beta</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-400">Security Containers</span>
              <span className="text-green-400 font-bold">Active Isolated</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-400">Sync Frequency</span>
              <span className="text-gray-500">Realtime Cloud</span>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <div className="px-3 py-1.5 bg-white/5 text-[9px] rounded-lg font-bold text-gray-300">Reset</div>
            <div className="px-3 py-1.5 bg-blue-600 text-[9px] rounded-lg font-bold text-white">Save Sync</div>
          </div>
        </div>
      )
    },
    {
      id: 'voice',
      title: 'Voice Assistant',
      desc: 'Seamless speech-to-text with premium voice synthesis algorithms to dictate complex concepts.',
      content: (
        <div className="w-full h-full bg-[#070709] border border-white/5 rounded-2xl p-6 text-left flex flex-col justify-between overflow-hidden relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl" />
          <div className="flex items-center gap-2">
            <Mic size={16} className="text-blue-500 animate-pulse" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Vocal Link Mode</span>
          </div>
          <div className="flex flex-col items-center justify-center my-4">
            {/* Pulsing wave lines */}
            <div className="flex items-end gap-1.5 h-10">
              <div className="w-1.5 bg-blue-500 rounded-full animate-pulse h-4" style={{ animationDelay: '0.1s' }} />
              <div className="w-1.5 bg-blue-500 rounded-full animate-pulse h-8" style={{ animationDelay: '0.3s' }} />
              <div className="w-1.5 bg-blue-500 rounded-full animate-pulse h-5" style={{ animationDelay: '0.2s' }} />
              <div className="w-1.5 bg-blue-500 rounded-full animate-pulse h-9" style={{ animationDelay: '0.5s' }} />
              <div className="w-1.5 bg-blue-500 rounded-full animate-pulse h-3" style={{ animationDelay: '0.4s' }} />
            </div>
            <span className="text-[9px] font-mono text-gray-500 mt-3">Dictation analysis loop synchronized</span>
          </div>
          <p className="text-[9px] text-gray-400 leading-relaxed text-center italic">"Explain quantum mechanics in easy terms."</p>
        </div>
      )
    }
  ];

  const features = [
    { icon: <MessageSquare size={20} className="text-blue-500" />, title: '💬 Smart Conversations', desc: 'Engage with highly-contextual cognitive reasoning pipelines optimized for fast response.' },
    { icon: <FileText size={20} className="text-purple-500" />, title: '📄 Document Analysis', desc: 'Upload, query, and extract insights from complex PDFs, schemas, or text spreadsheets.' },
    { icon: <ImageIcon size={20} className="text-cyan-500" />, title: '🖼 Image Understanding', desc: 'Analyze visuals, decipher engineering diagrams, or transcribe handwritten charts instantly.' },
    { icon: <Code size={20} className="text-indigo-500" />, title: '💻 Code Generation', desc: 'Synthesize production-ready code blocks across major scripting languages with debugging analysis.' },
    { icon: <Mic size={20} className="text-rose-500" />, title: '🎤 Voice Assistant', desc: 'Uplink via verbal dictation pipelines and trigger professional vocal answers effortlessly.' },
    { icon: <Globe size={20} className="text-teal-500" />, title: '🌍 Multi-language Support', desc: 'Accurate translations, local dialect mapping, and localized messaging pipelines.' },
    { icon: <PenTool size={20} className="text-amber-500" />, title: '📝 Writing Assistant', desc: 'Draft outlines, refine emails, synthesize letters, and enhance vocabulary in seconds.' },
    { icon: <Zap size={20} className="text-yellow-500" />, title: '⚡ Instant Answers', desc: 'Accelerated intelligence networks ensuring system latency is kept under 1.2s.' },
    { icon: <Lock size={20} className="text-emerald-500" />, title: '🔒 Secure Authentication', desc: 'Firebase Authentication protocols guaranteeing high data isolation and security.' },
    { icon: <Cloud size={20} className="text-sky-500" />, title: '☁ Cloud Sync', desc: 'Sync state databases across devices automatically. All data encrypted at rest.' }
  ];

  const capabilitiesList = [
    "Answer Questions", "Explain Concepts", "Solve Math", "Programming Help",
    "Generate Content", "Brainstorm Ideas", "Translate Languages", "Summarize PDFs",
    "Create Emails", "Generate Notes"
  ];

  const faqs = [
    { q: "What is Jarvis?", a: "Jarvis is a premium cybernetic AI Assistant designed to serve as an intellectual companion for learning, coding, writing, document summarization, and data diagnostics." },
    { q: "Is it free?", a: "Yes, you can establish an operator link completely free of charge. We offer 100 free neural queries per day, with flexible premium tiers for pro operators." },
    { q: "Can I upload documents?", a: "Absolutely. Jarvis can parse text files, spreadsheets, and complex PDFs, allowing you to ask queries directly about the uploaded content." },
    { q: "Is my data secure?", a: "Yes. All database sync channels are fully secured through isolated Firebase containers. Guest logs remain cached locally in secure browser isolation." },
    { q: "Can I use it on mobile?", a: "Yes. The Jarvis landing page and mainframe chat application are fully responsive and built for smartphones, tablets, and desktop displays." },
    { q: "How do I sign in?", a: "Simply click 'Sign In' or 'Get Started Free' on the navigation menu. You can quickly initialize secure access via Google Authentication, Email, or Guest Mode." }
  ];

  const pricingPlans = [
    {
      name: "Free Plan",
      price: "$0",
      desc: "Perfect for testing neural pipelines.",
      features: [
        "100 cognitive queries / day",
        "Balanced AI 3.5 access",
        "Standard multi-language",
        "Standard data isolation"
      ],
      recommended: false,
      cta: "Get Started Free"
    },
    {
      name: "Starter",
      price: "$9",
      period: "/ month",
      desc: "Ideal for casual daily productivity.",
      features: [
        "1,000 queries / day",
        "Balanced & Fast AI models",
        "Basic file upload & analysis",
        "Standard email support"
      ],
      recommended: false,
      cta: "Activate Starter"
    },
    {
      name: "Pro",
      price: "$29",
      period: "/ month",
      desc: "Our most popular professional tier.",
      features: [
        "Unlimited neural queries",
        "Full access to Advanced AI models",
        "Priority document & image upload",
        "Unlimited voice assistant sync",
        "Advanced analytics logs dashboard",
        "24/7 dedicated uplink support"
      ],
      recommended: true,
      cta: "Upgrade to Pro"
    },
    {
      name: "Enterprise",
      price: "Custom",
      desc: "For full team mainframe collaboration.",
      features: [
        "Dedicated isolated database nodes",
        "Custom model fine-tuning seeds",
        "SLA guaranteed 99.99% uptime",
        "Dedicated technical operator team",
        "Custom compliance rule packages"
      ],
      recommended: false,
      cta: "Contact Operations"
    }
  ];

  const testimonials = [
    {
      name: "Tony Stark",
      role: "CEO, Stark Industries",
      rating: 5,
      review: "A masterpiece of cognitive engineering. Jarvis handles my diagnostic telemetry, compiles code, and streamlines cloud synchronization with zero lag.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
    },
    {
      name: "Pepper Potts",
      role: "Operations Director",
      rating: 5,
      review: "The document analysis saves our teams hours of review every single day. The user interface is gorgeous, clean, and extremely secure.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
    },
    {
      name: "Bruce Banner",
      role: "Senior Nuclear Physicist",
      rating: 5,
      review: "The Advanced AI reasoning capabilities are exceptional. Excellent mathematical processing, and local encryption ensures secure research data.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120"
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 overflow-x-hidden select-none ${
      isDark ? 'bg-[#050507] text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {isDark ? (
          <>
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[140px]" />
            <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[150px]" />
            <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[130px]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px]" />
          </>
        ) : (
          <>
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
            <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[130px]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:45px_45px]" />
          </>
        )}
      </div>

      {/* Sticky Navigation Bar */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${
        isDark ? 'bg-[#050507]/80 border-white/5' : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Left: Animated Jarvis Logo */}
          <div className="flex items-center gap-3">
            <div 
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 p-0.5 border border-white/10 shadow-[0_0_15px_rgba(37,99,235,0.2)]"
            >
              <img 
                src="https://i.ibb.co/pjJvWvG0/Chat-GPT-Image-Jul-4-2026-01-41-13-PM.png" 
                alt="Jarvis Logo" 
                className="w-full h-full object-contain rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-xl font-bold tracking-tight uppercase">JARVIS AI</span>
          </div>

          {/* Center Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
            <a href="#home" className={`transition-colors ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-blue-600'}`}>Home</a>
            <a href="#features" className={`transition-colors ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-blue-600'}`}>Features</a>
            <a href="#capabilities" className={`transition-colors ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-blue-600'}`}>AI Models</a>
            <a href="#pricing" className={`transition-colors ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-blue-600'}`}>Pricing</a>
            <a href="#faq" className={`transition-colors ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-blue-600'}`}>FAQ</a>
            <a href="#contact" className={`transition-colors ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-blue-600'}`}>Contact</a>
          </nav>

          {/* Right Controls */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Dark Mode toggle */}
            <button 
              onClick={() => setIsDark(!isDark)}
              className={`p-2.5 rounded-full border transition-colors cursor-pointer focus:outline-none ${
                isDark ? 'border-white/10 hover:bg-white/5 text-yellow-400' : 'border-gray-200 hover:bg-gray-100 text-purple-600'
              }`}
              title="Toggle theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <button 
              onClick={onSignIn}
              className={`px-4.5 py-2.5 text-xs font-semibold rounded-[15px] border transition-all cursor-pointer focus:outline-none ${
                isDark ? 'border-white/10 hover:bg-white/5 text-gray-300 hover:text-white' : 'border-gray-200 hover:bg-gray-100 text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button 
              onClick={onGetStarted}
              className="px-5 py-2.5 text-xs font-bold rounded-[15px] bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-500/35 transition-all cursor-pointer focus:outline-none"
            >
              Get Started
            </button>
          </div>

          {/* Hamburger Menu (Mobile) */}
          <div className="flex items-center gap-3 lg:hidden">
            <button 
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-full border cursor-pointer focus:outline-none ${
                isDark ? 'border-white/10 text-yellow-400' : 'border-gray-200 text-purple-600'
              }`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className={`p-2.5 rounded-xl border cursor-pointer focus:outline-none ${
                isDark ? 'border-white/10 text-white' : 'border-gray-200 text-gray-800'
              }`}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Fullscreen Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed inset-0 z-50 flex flex-col justify-between p-8 ${
                isDark ? 'bg-[#050507]' : 'bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                    </div>
                    <span className="text-lg font-bold uppercase tracking-wider text-white">JARVIS AI</span>
                  </div>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className={`p-2 rounded-xl border cursor-pointer focus:outline-none ${
                      isDark ? 'border-white/10 text-white' : 'border-gray-200 text-gray-800'
                    }`}
                  >
                    <X size={20} />
                  </button>
                </div>

                <nav className="flex flex-col gap-6 text-xl font-bold mt-12 text-left">
                  <a href="#home" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-500 transition-colors">Home</a>
                  <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-500 transition-colors">Features</a>
                  <a href="#capabilities" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-500 transition-colors">AI Models</a>
                  <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-500 transition-colors">Pricing</a>
                  <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-500 transition-colors">FAQ</a>
                </nav>
              </div>

              <div className="flex flex-col gap-4 mt-auto">
                <button 
                  onClick={() => { setMobileMenuOpen(false); onSignIn(); }}
                  className={`w-full py-4 text-sm font-bold rounded-2xl border transition-all cursor-pointer ${
                    isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-gray-200 hover:bg-gray-100 text-gray-800'
                  }`}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setMobileMenuOpen(false); onGetStarted(); }}
                  className="w-full py-4 text-sm font-bold rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
                >
                  Get Started Free
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section id="home" className="max-w-7xl mx-auto px-6 py-16 md:py-24 lg:py-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative">
        {/* Left Side Info */}
        <div className="lg:col-span-7 text-left space-y-8 z-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400"
          >
            <Sparkles size={12} className="animate-pulse" />
            <span>Introducing Stark Cybernetic Console v1.0.4</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight"
          >
            Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400">Jarvis</span>
          </motion.h1>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl md:text-2xl font-semibold text-gray-400 max-w-2xl leading-relaxed"
          >
            Your Intelligent AI Assistant for Learning, Productivity, Creativity, and Everyday Tasks.
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-sm md:text-base text-gray-500 max-w-xl leading-relaxed"
          >
            Ask questions, generate content, write code, summarize documents, solve problems, and accomplish more with an AI assistant designed for speed, accuracy, and simplicity.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-wrap gap-4 pt-4"
          >
            <button 
              onClick={onGetStarted}
              className="px-8 py-4 text-sm font-bold rounded-[15px] bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/25 hover:shadow-blue-500/40 transition-all cursor-pointer focus:outline-none"
            >
              Get Started Free
            </button>
            <a 
              href="#features"
              className={`px-8 py-4 text-sm font-semibold rounded-[15px] border transition-all flex items-center gap-2 focus:outline-none ${
                isDark ? 'border-white/10 hover:bg-white/5 text-gray-300 hover:text-white' : 'border-gray-200 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Play size={14} className="fill-current" />
              <span>Watch Demo</span>
            </a>
          </motion.div>
        </div>

        {/* Right Side: Beautiful Interactive Chat UI */}
        <div className="lg:col-span-5 relative z-10 flex justify-center items-center">
          {/* Decorative glow background */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-purple-600/10 rounded-[30px] blur-3xl -z-10" />

          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className={`w-full max-w-sm rounded-[24px] border shadow-2xl p-5 overflow-hidden flex flex-col justify-between h-[420px] relative transition-colors ${
              isDark ? 'bg-[#0b0b0e]/95 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-800'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Jarvis Neural Frame</h4>
                  <p className="text-[9px] font-mono text-gray-500">Latency: 1.1s</p>
                </div>
              </div>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 py-4 overflow-y-auto space-y-4 text-xs">
              {chatMessages.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3.5 rounded-[18px] max-w-[85%] leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white ml-auto' 
                      : isDark 
                        ? 'bg-white/5 border border-white/5 text-gray-200 mr-auto'
                        : 'bg-gray-100 text-gray-800 mr-auto'
                  }`}
                >
                  {msg.sender === 'jarvis' && (
                    <span className="text-[9px] text-blue-400 font-bold uppercase block mb-1">Jarvis Response</span>
                  )}
                  {msg.text}
                </motion.div>
              ))}

              {isTyping && (
                <div className="p-3.5 bg-white/5 border border-white/5 rounded-[18px] max-w-[40%] mr-auto flex gap-1 items-center justify-center">
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-blue-400" />
                </div>
              )}
            </div>

            {/* Bottom input area */}
            <div className="flex gap-2 border-t border-white/5 pt-3">
              <div className="flex-1 bg-white/5 border border-white/5 rounded-xl text-xs px-3 py-2 text-gray-500 flex items-center">
                Query Jarvis Mainframe...
              </div>
              <button disabled className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center opacity-70">
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className={`border-y py-12 relative z-10 transition-colors ${
        isDark ? 'bg-[#07070a]/90 border-white/5' : 'bg-gray-100 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <AnimatedCounter value={10000} suffix="+" label="Operators Locked In" />
          <AnimatedCounter value={100000} suffix="+" label="Neural Connections" />
          <AnimatedCounter value={99.9} suffix="%" label="Mainframe Uptime" />
          <AnimatedCounter value={24} suffix="/7" label="Continuous Uplink" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24 text-center relative z-10">
        <div className="space-y-4 mb-16">
          <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Premium Suite Capabilities</span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Everything You Need in One AI Assistant</h2>
          <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Jarvis is modularly configured to adapt dynamically to your requirements. Access lightning fast pipelines designed to power daily operations.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, index) => (
            <motion.div 
              key={index}
              whileHover={{ y: -6 }}
              className={`p-6 rounded-[24px] border text-left flex flex-col justify-between h-56 hover:shadow-2xl transition-all relative group overflow-hidden ${
                isDark 
                  ? 'bg-white/5 border-white/10 hover:border-blue-500/30 text-white hover:bg-white/10' 
                  : 'bg-white border-gray-200 text-gray-800 hover:border-blue-500/35'
              }`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-600/5 to-purple-600/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/15 flex items-center justify-center shadow-inner">
                {feat.icon}
              </div>
              <div className="space-y-2 mt-4">
                <h3 className="text-base font-bold tracking-tight">{feat.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Capabilities Split Section */}
      <section id="capabilities" className={`py-24 border-y transition-colors relative z-10 ${
        isDark ? 'bg-[#07070a]/50 border-white/5' : 'bg-gray-100 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left: Beautiful Animated illustration (Simulated capability pipeline) */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <div className="absolute inset-0 bg-blue-600/5 rounded-full blur-3xl" />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
              className="w-72 h-72 rounded-full border border-dashed border-white/10 flex items-center justify-center p-8 relative"
            >
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                className="w-52 h-52 rounded-full border border-double border-blue-500/20 flex items-center justify-center p-6 relative"
              >
                <div className="w-32 h-32 rounded-full bg-blue-600/10 flex items-center justify-center border border-blue-500/30">
                  <Bot size={54} className="text-blue-500 animate-pulse" />
                </div>
              </motion.div>

              {/* Floating capability markers */}
              <div className="absolute top-4 left-4 p-2 bg-blue-600/10 rounded-xl border border-blue-500/20 text-[10px] font-mono text-blue-400">MATH</div>
              <div className="absolute bottom-4 right-4 p-2 bg-purple-600/10 rounded-xl border border-purple-500/20 text-[10px] font-mono text-purple-400">CODE</div>
              <div className="absolute top-1/2 -right-8 p-2 bg-cyan-600/10 rounded-xl border border-cyan-500/20 text-[10px] font-mono text-cyan-400">PDF</div>
            </motion.div>
          </div>

          {/* Right: capability items list */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="space-y-4">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Dynamic Processing Capabilities</span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Expand Your Creative and Analytical Boundaries</h2>
              <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
                Operate alongside an adaptive AI partner optimized to process academic challenges, script debugging, summary generation, and dialect translations.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {capabilitiesList.map((cap, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-2xl">
                  <div className="w-5 h-5 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-400">
                    <Check size={12} />
                  </div>
                  <span className="text-xs font-semibold text-gray-300">{cap}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center relative z-10">
        <div className="space-y-4 mb-16">
          <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Mainframe Integration Flow</span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">How It Works</h2>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Deploying Jarvis takes three rapid steps. Establish an operator account to unlock continuous assistance.
          </p>
        </div>

        {/* 3 Step Interactive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Background Connector Arrow (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 border-t border-dashed border-white/10 -z-10" />

          {/* Step 1 */}
          <div className={`p-8 rounded-[24px] border relative transition-colors ${
            isDark ? 'bg-[#07070a]/90 border-white/5' : 'bg-white border-gray-200'
          }`}>
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/20">
              1
            </span>
            <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center mx-auto mb-6 border border-blue-500/15">
              <Lock size={22} className="text-blue-500" />
            </div>
            <h3 className="text-lg font-bold">Sign In</h3>
            <p className="text-xs text-gray-400 leading-relaxed mt-3">Create your operator profile via Google login, Email credentials, or activate Guest mode instantly.</p>
          </div>

          {/* Step 2 */}
          <div className={`p-8 rounded-[24px] border relative transition-colors ${
            isDark ? 'bg-[#07070a]/90 border-white/5' : 'bg-white border-gray-200'
          }`}>
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/20">
              2
            </span>
            <div className="w-12 h-12 bg-purple-600/10 rounded-xl flex items-center justify-center mx-auto mb-6 border border-purple-500/15">
              <MessageSquare size={22} className="text-purple-500" />
            </div>
            <h3 className="text-lg font-bold">Ask Anything</h3>
            <p className="text-xs text-gray-400 leading-relaxed mt-3">Type custom diagnostic prompts, dictate query files, upload text logs, or trigger verbal mic synching.</p>
          </div>

          {/* Step 3 */}
          <div className={`p-8 rounded-[24px] border relative transition-colors ${
            isDark ? 'bg-[#07070a]/90 border-white/5' : 'bg-white border-gray-200'
          }`}>
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/20">
              3
            </span>
            <div className="w-12 h-12 bg-cyan-600/10 rounded-xl flex items-center justify-center mx-auto mb-6 border border-cyan-500/15">
              <Sparkles size={22} className="text-cyan-500" />
            </div>
            <h3 className="text-lg font-bold">Receive Answers</h3>
            <p className="text-xs text-gray-400 leading-relaxed mt-3">Jarvis parses parameters rapidly to render intelligent diagnostic code solutions or detailed concepts.</p>
          </div>
        </div>
      </section>

      {/* Screenshots Section (Carousel) */}
      <section className={`py-24 border-y transition-colors relative z-10 ${
        isDark ? 'bg-[#07070a]/50 border-white/5' : 'bg-gray-100 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="space-y-4 mb-16">
            <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Interface Telemetry Preview</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Explore the Cybernetic Interface</h2>
            <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Preview individual modular segments designed for high latency efficiency and pristine modern aesthetics.
            </p>
          </div>

          {/* Carousel Layout */}
          <div className="max-w-3xl mx-auto relative flex flex-col items-center">
            <div className="w-full h-80 relative overflow-hidden flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={carouselIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="w-full max-w-lg h-full"
                >
                  {screenshots[carouselIndex].content}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Title & Desc */}
            <div className="mt-8 space-y-1">
              <h4 className="text-lg font-bold text-white uppercase tracking-wider font-mono">{screenshots[carouselIndex].title}</h4>
              <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">{screenshots[carouselIndex].desc}</p>
            </div>

            {/* Navigation arrows */}
            <div className="flex gap-4 mt-6">
              <button 
                onClick={() => setCarouselIndex(prev => (prev - 1 + 7) % 7)}
                className="w-10 h-10 rounded-full border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white focus:outline-none cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => setCarouselIndex(prev => (prev + 1) % 7)}
                className="w-10 h-10 rounded-full border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white focus:outline-none cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Dots */}
            <div className="flex gap-2 mt-4">
              {screenshots.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCarouselIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    carouselIndex === i ? 'w-6 bg-blue-500' : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Jarvis */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center relative z-10">
        <div className="space-y-4 mb-16">
          <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Performance Safekeeping</span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Why Operators Choose Jarvis</h2>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Engineered from ground up to satisfy extreme latency targets while preserving isolated cloud structures.
          </p>
        </div>

        {/* Reason Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          <div className="p-6 bg-white/5 border border-white/5 rounded-[24px] space-y-3.5">
            <Zap size={22} className="text-blue-400" />
            <h3 className="text-base font-bold">Lightning Fast</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Queries synthesize under 1.2 seconds, leveraging fast cloud response mapping loops.</p>
          </div>
          <div className="p-6 bg-white/5 border border-white/5 rounded-[24px] space-y-3.5">
            <Shield size={22} className="text-purple-400" />
            <h3 className="text-base font-bold">Privacy Focused</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Secure data isolation parameters prevent credential leakages. Cache remains local.</p>
          </div>
          <div className="p-6 bg-white/5 border border-white/5 rounded-[24px] space-y-3.5">
            <Smartphone size={22} className="text-cyan-400" />
            <h3 className="text-base font-bold">Modern Interface</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Pristine glassmorphic styles with responsive structural panels configured for ergonomics.</p>
          </div>
          <div className="p-6 bg-white/5 border border-white/5 rounded-[24px] space-y-3.5">
            <Bot size={22} className="text-emerald-400" />
            <h3 className="text-base font-bold">Always Available</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Isolated database nodes run continuously to secure permanent access 24/7.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className={`py-24 border-y transition-colors relative z-10 ${
        isDark ? 'bg-[#07070a]/50 border-white/5' : 'bg-gray-100 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="space-y-4 mb-16">
            <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Mainframe Level Packages</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Flexible Pricing Plans</h2>
            <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Select the appropriate bandwidth for your cognitive operational queries.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {pricingPlans.map((plan, i) => (
              <div 
                key={i}
                className={`p-6.5 rounded-[24px] border flex flex-col justify-between relative transition-all ${
                  plan.recommended 
                    ? 'bg-blue-600/10 border-blue-500 shadow-2xl scale-[1.02]' 
                    : isDark ? 'bg-white/5 border-white/5 hover:border-white/10' : 'bg-white border-gray-200'
                }`}
              >
                {plan.recommended && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">
                    Recommended Pro Node
                  </span>
                )}
                
                <div className="space-y-4 text-left">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{plan.name}</h4>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-extrabold tracking-tight text-white font-mono">{plan.price}</span>
                    {plan.period && <span className="text-xs text-gray-400 font-mono">{plan.period}</span>}
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed border-b border-white/5 pb-4">{plan.desc}</p>
                  
                  <ul className="space-y-2.5 text-xs text-gray-300">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check size={12} className="text-blue-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={onGetStarted}
                  className={`w-full py-3.5 mt-8 text-xs font-bold rounded-[15px] transition-all cursor-pointer focus:outline-none ${
                    plan.recommended 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg' 
                      : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center relative z-10">
        <div className="space-y-4 mb-16">
          <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Endorsements Matrix</span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Approved by Elite Operators</h2>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Read telemetry summaries from operators who utilize Jarvis to power high-capacity daily workflows.
          </p>
        </div>

        {/* Sliding Testimonial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test, i) => (
            <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-[24px] text-left flex flex-col justify-between h-64 relative overflow-hidden">
              <div className="absolute top-4 right-4 text-blue-500/20">
                <Star size={54} className="fill-current" />
              </div>
              <p className="text-xs text-gray-300 leading-relaxed italic relative z-10">"{test.review}"</p>
              
              <div className="flex items-center gap-3.5 border-t border-white/5 pt-4 mt-6">
                <img src={test.avatar} alt={test.name} className="w-10 h-10 rounded-full border border-blue-500/20 object-cover" />
                <div>
                  <h5 className="text-xs font-bold text-white uppercase">{test.name}</h5>
                  <p className="text-[10px] text-gray-500">{test.role}</p>
                </div>
                <div className="flex gap-0.5 ml-auto text-yellow-400">
                  {Array.from({ length: test.rating }).map((_, idx) => (
                    <Star key={idx} size={10} className="fill-current" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className={`py-24 border-y transition-colors relative z-10 ${
        isDark ? 'bg-[#07070a]/50 border-white/5' : 'bg-gray-100 border-gray-200'
      }`}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="space-y-4 mb-16">
            <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Diagnostic Queries</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Frequently Asked Questions</h2>
            <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Explore structural FAQs regarding local databases, voice processing, and subscription tiers.
            </p>
          </div>

          <div className="space-y-3.5 text-left">
            {faqs.map((faq, index) => {
              const isOpen = activeFAQ === index;
              return (
                <div 
                  key={index}
                  className={`rounded-2xl border overflow-hidden transition-all ${
                    isOpen ? 'bg-white/5 border-blue-500/30' : 'bg-white/5 border-white/5 hover:border-white/10'
                  }`}
                >
                  <button 
                    onClick={() => setActiveFAQ(isOpen ? null : index)}
                    className="w-full p-5 flex items-center justify-between text-left font-semibold text-xs md:text-sm text-white focus:outline-none cursor-pointer uppercase tracking-wider"
                  >
                    <span>{faq.q}</span>
                    <span className="text-blue-400 font-bold font-mono text-base">{isOpen ? '−' : '+'}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-5 pb-5 text-xs text-gray-400 leading-relaxed border-t border-white/5 pt-3"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center relative z-10">
        <div className="bg-gradient-to-tr from-blue-600/10 via-purple-600/5 to-cyan-500/10 p-12 md:p-20 rounded-[30px] border border-white/5 relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_40%,rgba(37,99,235,0.08)_0%,transparent_50%)] pointer-events-none" />
          
          <div className="w-16 h-16 bg-white/5 border border-white/10 p-1.5 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/25 mb-8 animate-bounce">
            <img 
              src="https://i.ibb.co/pjJvWvG0/Chat-GPT-Image-Jul-4-2026-01-41-13-PM.png" 
              alt="Jarvis Logo" 
              className="w-full h-full object-contain rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Start Chatting with Jarvis Today</h2>
          <p className="text-sm text-gray-400 mt-4 max-w-xl leading-relaxed">
            Experience the future of AI-powered conversations with a fast, intelligent, and secure assistant.
          </p>

          <div className="flex flex-wrap gap-4 mt-8 justify-center">
            <button 
              onClick={onGetStarted}
              className="px-8 py-4 text-xs font-bold rounded-[15px] bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/35 transition-all cursor-pointer focus:outline-none"
            >
              Get Started Free
            </button>
            <button 
              onClick={onSignIn}
              className="px-8 py-4 text-xs font-bold rounded-[15px] border border-white/10 hover:bg-white/5 text-white transition-all cursor-pointer focus:outline-none"
            >
              Sign In to Core
            </button>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer id="contact" className={`border-t transition-colors relative z-10 ${
        isDark ? 'bg-[#030305] border-white/5 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-600'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-12 text-left">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white/5 p-0.5 border border-white/10 flex items-center justify-center">
                <img 
                  src="https://i.ibb.co/pjJvWvG0/Chat-GPT-Image-Jul-4-2026-01-41-13-PM.png" 
                  alt="Jarvis Logo" 
                  className="w-full h-full object-contain rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-base font-bold text-white tracking-wider">JARVIS AI</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
              Your futuristic conversational diagnostic mainframe, custom-configured with safe isolated database pipelines.
            </p>
            {/* Social Links */}
            <div className="flex gap-4 pt-2">
              <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-blue-600 hover:text-white transition-all"><Twitter size={14} /></a>
              <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-blue-600 hover:text-white transition-all"><Github size={14} /></a>
              <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-blue-600 hover:text-white transition-all"><Linkedin size={14} /></a>
              <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-blue-600 hover:text-white transition-all"><Instagram size={14} /></a>
            </div>
          </div>

          {/* Links 1 */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Product</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#home" className="hover:text-white transition-colors">Home Portal</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Features Suite</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing Levels</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ Metrics</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Neural APIs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Status Feed</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security Isolated</a></li>
            </ul>
          </div>

          {/* Links 3 */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Operations</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Stark Industries</a></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Contact Operations</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Have queries regarding custom mainframe deployments?
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <Mail size={12} className="text-blue-500" />
              <span>support@starkindustries.com</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 py-8 text-center text-xs text-gray-600">
          <p>© 2026 Jarvis AI. All rights reserved. Configured under Stark Industries Defensive Protocols.</p>
          <p className="mt-1 flex items-center justify-center gap-1">
            Built with <Heart size={10} className="text-red-500 animate-pulse fill-current" /> and futuristic cognitive mechanics.
          </p>
        </div>
      </footer>
    </div>
  );
};
