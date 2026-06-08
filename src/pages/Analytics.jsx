import React from 'react';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  BarChart, 
  Bar,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  Award, 
  Trophy,
  CheckCircle2, 
  AlertTriangle,
  Brain,
  Zap,
  Target
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';

const Analytics = () => {
  const { xp } = useStudent();

  const studyData = [
    { day: 'Mon', hours: 1.5, xp: 80 },
    { day: 'Tue', hours: 2.0, xp: 120 },
    { day: 'Wed', hours: 0.8, xp: 40 },
    { day: 'Thu', hours: 3.2, xp: 240 },
    { day: 'Fri', hours: 2.1, xp: 110 },
    { day: 'Sat', hours: 1.2, xp: 90 },
    { day: 'Sun', hours: 2.6, xp: 180 }
  ];

  const skillData = [
    { subject: 'AI/ML', value: 85, fullMark: 100 },
    { subject: 'DevOps', value: 72, fullMark: 100 },
    { subject: 'Full Stack', value: 95, fullMark: 100 },
    { subject: 'Cloud', value: 58, fullMark: 100 },
    { subject: 'Cyber', value: 100, fullMark: 100 },
    { subject: 'Data Sci', value: 48, fullMark: 100 }
  ];

  const accuracyData = [
    { domain: 'AI/ML', accuracy: 82 },
    { domain: 'DevOps', accuracy: 78 },
    { domain: 'Full Stack', accuracy: 96 },
    { domain: 'Cloud', accuracy: 64 },
    { domain: 'Cyber', accuracy: 100 },
    { domain: 'Data Sci', accuracy: 60 }
  ];

  const totalStudyHours = studyData.reduce((acc, curr) => acc + curr.hours, 0).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Intro Header */}
      <div>
        <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">Metrics & Stats</p>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Performance Analytics Suite</h2>
        <p className="text-slate-500 text-xs mt-1">
          Review dynamic, visual evidence of your skills, study hours, and domains. Use this to prepare for college placement presentations.
        </p>
      </div>

      {/* Grid Stats Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <Clock size={22} />
          </div>
          <div>
            <span className="text-[10px] text-slate-450 uppercase block font-bold">Total Weekly Effort</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-white">{totalStudyHours} Hours</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-xl">
            <Trophy size={22} />
          </div>
          <div>
            <span className="text-[10px] text-slate-450 uppercase block font-bold">Total Study Capital</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-white">{xp} XP</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Target size={22} />
          </div>
          <div>
            <span className="text-[10px] text-slate-450 uppercase block font-bold">Average Accuracy</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-white">86.7%</span>
          </div>
        </div>
      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Study Hours & XP Gain */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-500" />
            Weekly Habit & XP Logs
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={studyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis yAxisId="left" stroke="#4f46e5" fontSize={11} />
                <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} labelStyle={{ color: '#94a3b8', fontSize: '11px' }} itemStyle={{ color: '#fff', fontSize: '12px' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line yAxisId="left" type="monotone" dataKey="hours" stroke="#4f46e5" name="Study Hours" strokeWidth={3} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="xp" stroke="#06b6d4" name="XP Gained" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Domain Proficiency Radar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-4 flex items-center gap-2">
            <Brain size={18} className="text-indigo-500" />
            Domain Skill Proficiency (%)
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" radius="70%" data={skillData}>
                <PolarGrid stroke="#475569" opacity={0.2} />
                <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={10} />
                <PolarRadiusAxis stroke="#64748b" fontSize={9} />
                <Radar name="Proficiency" dataKey="value" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quiz Accuracy Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-4 flex items-center gap-2">
            <Zap size={18} className="text-indigo-500" />
            Domain Quiz Accuracy Rate
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis dataKey="domain" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="accuracy" fill="#6366f1" radius={[8, 8, 0, 0]} name="Accuracy (%)">
                  {accuracyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.accuracy >= 80 ? '#10b981' : entry.accuracy >= 60 ? '#6366f1' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diagnostics Suite (Strength / Weakness analysis) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-1">AI Diagnostics</h3>
            <p className="text-xs text-slate-400">Feedback mapped to quiz logs & study consistency</p>
          </div>

          <div className="space-y-4 my-6">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg shrink-0 mt-0.5">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-white">Strength: Cryptography & Network Layers</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  You secured a 100% first-attempt score in 'Network Security' and 'Cryptography Foundations'. Your understanding of key-exchanges is strong.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 rounded-lg shrink-0 mt-0.5">
                <AlertTriangle size={16} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-white">Weakness: Cloud Serverless Configurations</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Latency spikes, microservices, and IAM role delegation show a performance accuracy threshold of 64%. Review the AWS Lambda Cold Starts resources.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850/80 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold text-center">
            Recommendation: Launch Cloud Computing Module 2 Quiz
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Analytics;
