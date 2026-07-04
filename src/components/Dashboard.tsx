import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { UserAnalytics } from '../types';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar 
} from 'recharts';
import { 
  BarChart2, MessageSquare, Award, Cloud, FileCode, CheckCircle, Zap, Shield, Crown, Globe, Cpu
} from 'lucide-react';

interface DashboardProps {
  onClose: () => void;
  analyticsUpdatedToken: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ onClose, analyticsUpdatedToken }) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      dbService.getAnalytics(user.uid)
        .then(setAnalytics)
        .finally(() => setLoading(false));
    }
  }, [user, analyticsUpdatedToken]);

  // Generate mock default chart data if empty
  const getChartData = () => {
    if (!analytics || !analytics.dailyUsage || analytics.dailyUsage.length === 0) {
      return [
        { date: 'Mon', messages: 4, words: 420 },
        { date: 'Tue', messages: 6, words: 710 },
        { date: 'Wed', messages: 12, words: 1450 },
        { date: 'Thu', messages: 8, words: 910 },
        { date: 'Fri', messages: 14, words: 1820 },
        { date: 'Sat', messages: 18, words: 2450 },
        { date: 'Sun', messages: 10, words: 1100 },
      ];
    }
    // Format daily usage dates (e.g., 2026-07-04 -> Jul 4)
    return analytics.dailyUsage.map(d => {
      try {
        const parts = d.date.split('-');
        if (parts.length === 3) {
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          return {
            date: `${monthNames[dateObj.getMonth()]} ${dateObj.getDate()}`,
            messages: d.messages,
            words: d.words
          };
        }
      } catch {}
      return { date: d.date, messages: d.messages, words: d.words };
    });
  };

  const chartData = getChartData();

  const achievements = [
    { id: '1', title: 'Mainframe Synced', desc: 'Authorized first Jarvis connection', icon: Cpu, unlocked: true },
    { id: '2', title: 'Quantum Author', desc: 'Generate over 10,000 words of intellect', icon: Award, unlocked: (analytics?.wordsGenerated || 0) > 10000 },
    { id: '3', title: 'Data Crawler', desc: 'Sync and analyze over 5 external files', icon: Cloud, unlocked: (analytics?.filesUploaded || 0) >= 5 },
    { id: '4', title: 'Stark Protocol Advisor', desc: 'Perform 100+ diagnostic messages', icon: Shield, unlocked: (analytics?.totalMessages || 0) >= 100 }
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0A0A0C] text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <span className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-xs font-mono tracking-widest uppercase">Analyzing Mainframe Metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#0A0A0C] p-8 text-white z-10 relative">
      {/* Glow Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.08)_0%,transparent_50%)] pointer-events-none" />

      {/* Header */}
      <div className="max-w-5xl mx-auto flex items-center justify-between mb-8 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight uppercase">Operator Dashboard</h2>
          <p className="text-xs text-gray-500 mt-1 tracking-wider uppercase font-medium">Stark Mainframe Analytics</p>
        </div>
        <button 
          onClick={onClose}
          className="px-4 py-2 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs font-semibold rounded-[15px] transition-all cursor-pointer focus:outline-none"
        >
          Return to Core
        </button>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stat 1 */}
          <div className="bg-white/5 border border-white/10 p-5 rounded-[20px] relative overflow-hidden group hover:border-white/20 transition-all shadow-lg">
            <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <BarChart2 size={18} className="text-blue-500" />
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Chats</p>
            <h3 className="text-2xl font-bold mt-3 text-white">{analytics?.totalChats || 0}</h3>
            <span className="text-[10px] text-gray-400 mt-1.5 block font-medium">Active Sessions</span>
          </div>

          {/* Stat 2 */}
          <div className="bg-white/5 border border-white/10 p-5 rounded-[20px] relative overflow-hidden group hover:border-white/20 transition-all shadow-lg">
            <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <MessageSquare size={18} className="text-blue-500" />
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Messages</p>
            <h3 className="text-2xl font-bold mt-3 text-white">{analytics?.totalMessages || 0}</h3>
            <span className="text-[10px] text-gray-400 mt-1.5 block font-medium">Mainframe Queries</span>
          </div>

          {/* Stat 3 */}
          <div className="bg-white/5 border border-white/10 p-5 rounded-[20px] relative overflow-hidden group hover:border-white/20 transition-all shadow-lg">
            <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Zap size={18} className="text-blue-500 animate-pulse" />
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Words Generated</p>
            <h3 className="text-2xl font-bold mt-3 text-white">{(analytics?.wordsGenerated || 0).toLocaleString()}</h3>
            <span className="text-[10px] text-gray-400 mt-1.5 block font-medium">Intellectual Cycles</span>
          </div>

          {/* Stat 4 */}
          <div className="bg-white/5 border border-white/10 p-5 rounded-[20px] relative overflow-hidden group hover:border-white/20 transition-all shadow-lg">
            <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Cloud size={18} className="text-blue-500" />
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Files Indexed</p>
            <h3 className="text-2xl font-bold mt-3 text-white">{analytics?.filesUploaded || 0}</h3>
            <span className="text-[10px] text-gray-400 mt-1.5 block font-medium">Uploaded Logs</span>
          </div>
        </div>

        {/* Charts & Graphs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Activity Graph */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 p-6 rounded-[20px] flex flex-col h-96 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Core Intellectual Cycles</h4>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded px-2.5 py-1 font-mono">Words Generated per Day</span>
            </div>
            <div className="flex-1 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorWords" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.05} />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F0F12', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '15px', color: '#f8fafc' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area type="monotone" dataKey="words" stroke="#2563eb" fillOpacity={1} fill="url(#colorWords)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Secondary stats & Subscription card */}
          <div className="flex flex-col gap-6">
            {/* Account Membership details */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-[20px] flex flex-col justify-between h-44 relative overflow-hidden shadow-lg">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
              <div className="flex items-center gap-3">
                <Crown size={22} className="text-yellow-400 animate-bounce" />
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase">Stark Industries Console</h4>
                  <p className="text-[10px] text-slate-500 font-mono">Mainframe Node Level</p>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xl font-bold tracking-tight text-white uppercase">PRO OPERATOR</span>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">Unlimited neural pipelines & pro analytics enabled.</p>
              </div>
            </div>

            {/* Achievements Progress bar */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-[20px] flex-1 shadow-lg">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Node Operations Progress</h4>
              <div className="space-y-4">
                {achievements.map((ach) => (
                  <div key={ach.id} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                      ach.unlocked 
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                        : 'bg-white/5 border-white/5 text-slate-600'
                    }`}>
                      <ach.icon size={16} />
                    </div>
                    <div className="overflow-hidden flex-1">
                      <p className={`text-xs font-semibold truncate ${ach.unlocked ? 'text-slate-200' : 'text-slate-500'}`}>
                        {ach.title}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{ach.desc}</p>
                    </div>
                    {ach.unlocked && <span className="text-[9px] font-mono text-blue-400 uppercase tracking-wider bg-blue-400/10 border border-blue-400/20 px-1.5 py-0.5 rounded shrink-0 font-medium">unlocked</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
