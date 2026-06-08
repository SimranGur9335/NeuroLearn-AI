import React from 'react';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  Smile, 
  Frown, 
  Brain, 
  Zap, 
  AlertCircle, 
  Sparkles,
  HelpCircle,
  Flame
} from 'lucide-react';

const EmotionAnalysis = () => {
  // Mock weekly stack area metrics for moods
  const moodHistory = [
    { day: "Mon", focused: 30, happy: 45, frustrated: 15, stressed: 10 },
    { day: "Tue", focused: 35, happy: 48, frustrated: 10, stressed: 7 },
    { day: "Wed", focused: 45, happy: 35, frustrated: 12, stressed: 8 },
    { day: "Thu", focused: 25, happy: 40, frustrated: 20, stressed: 15 }, // Quiz Day
    { day: "Fri", focused: 38, happy: 42, frustrated: 12, stressed: 8 },
    { day: "Sat", focused: 40, happy: 45, frustrated: 10, stressed: 5 },
    { day: "Sun", focused: 30, happy: 50, frustrated: 12, stressed: 8 }
  ];

  const moodBreakdown = [
    { label: "Happy / Excited", percentage: 48, icon: Smile, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
    { label: "Focused / In-the-Zone", percentage: 38, icon: Brain, color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" },
    { label: "Frustrated / Confused", percentage: 9, icon: Frown, color: "text-yellow-600 bg-yellow-500/10 border-yellow-500/20" },
    { label: "Stressed / Tired", percentage: 5, icon: AlertCircle, color: "text-red-500 bg-red-500/10 border-red-500/20" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div>
        <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">Academic Affective Computing</p>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Emotion & Engagement Intelligence</h2>
        <p className="text-slate-500 text-xs mt-1">
          Tracking emotional vectors during study cycles to optimize memory retention and prevent study burnout.
        </p>
      </div>

      {/* Grid of Mood indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {moodBreakdown.map((mood, idx) => {
          const Icon = mood.icon;
          return (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
              <div className={`p-3 rounded-xl ${mood.color} border`}>
                <Icon size={20} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">{mood.label}</span>
                <span className="text-xl font-extrabold text-slate-800 dark:text-white">{mood.percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stack Area Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm lg:col-span-2">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-4 flex items-center gap-2">
            <Flame className="text-indigo-500" size={18} />
            Weekly Mood & Focus Stack Analytics
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={moodHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} labelStyle={{ color: '#94a3b8', fontSize: '11px' }} itemStyle={{ color: '#fff', fontSize: '12px' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area type="monotone" dataKey="happy" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Happy" />
                <Area type="monotone" dataKey="focused" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} name="Focused" />
                <Area type="monotone" dataKey="frustrated" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} name="Frustrated" />
                <Area type="monotone" dataKey="stressed" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Stressed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emotion Learning Correlation */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-1">Affection Correlation</h3>
            <p className="text-xs text-slate-400">Behavioral mapping to quiz outcomes</p>
          </div>

          <div className="space-y-4 my-6">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 rounded-lg shrink-0 mt-0.5">
                <Zap size={16} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-white">Stress-Quiz Performance Link</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Data logs indicate a direct correlation between stress spikes and DevOps containerization quiz attempts. Stress &gt; 30% yields a 14% drop in first-time accuracy scores.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg shrink-0 mt-0.5">
                <Smile size={16} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-white">Happy-Streak Retention Link</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  High happiness index days correlate with longer streaks. The user maintained a 7-day streak when average happy index exceeded 40%.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850 text-[10px] text-slate-500 leading-normal flex items-start gap-2">
            <Sparkles className="text-indigo-500 shrink-0 mt-0.5" size={14} />
            <span><strong>Burnout Prevention Advice</strong>: Refrain from starting new locked roadmap nodes for 2 hours if frustration is high. Try checking AI Mentor Chat archives.</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EmotionAnalysis;
