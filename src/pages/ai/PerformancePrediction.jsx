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
  AreaChart,
  Area
} from 'recharts';
import { 
  Sparkles, 
  TrendingUp, 
  GraduationCap, 
  Briefcase, 
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  Target
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';

const PerformancePrediction = () => {
  const { xp } = useStudent();

  // Seeded historical and future projections
  const cgpaHistory = [
    { semester: "Sem 1", cgpa: 7.8, project: 7.8 },
    { semester: "Sem 2", cgpa: 8.1, project: 8.1 },
    { semester: "Sem 3", cgpa: 8.3, project: 8.3 },
    { semester: "Sem 4 (Cur)", cgpa: 8.45, project: 8.45 },
    { semester: "Sem 5 (Proj)", project: 8.62 },
    { semester: "Sem 6 (Proj)", project: 8.78 },
    { semester: "Sem 7 (Proj)", project: 8.85 }
  ];

  const placementMetrics = [
    { category: "DSA Coding Skills", score: 85, threshold: 70 },
    { category: "System Architecture", score: 62, threshold: 65 },
    { category: "Resume Score", score: 78, threshold: 75 },
    { category: "Core Attendance", score: 88, threshold: 75 },
    { category: "Certifications Index", score: 92, threshold: 60 }
  ];

  // Dynamically adapt values based on active student XP!
  const predictedGPA = parseFloat((8.1 + (xp > 1450 ? 0.35 : 0.2)).toFixed(2));
  const placementReadinessPercent = xp > 1450 ? 88 : 74;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div>
        <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">AI Predictive Modeling</p>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Academic Outcome & Placement Projections</h2>
        <p className="text-slate-500 text-xs mt-1">
          Machine learning algorithms mapping study history, quiz scores, and streaks to project graduation honors and job placement outcomes.
        </p>
      </div>

      {/* Predictive KPI Gauge grids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CGPA Forecast */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[180px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] text-slate-450 uppercase font-bold">Predicted Graduation CGPA</span>
            <GraduationCap size={18} className="text-indigo-500" />
          </div>
          <div className="py-2">
            <span className="text-4xl font-extrabold text-slate-800 dark:text-white">{predictedGPA}</span>
            <span className="text-slate-400 text-xs font-semibold"> / 10.0</span>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-[10px]">
            <span className="text-slate-400 font-semibold uppercase">Confidence Index: 92.4%</span>
            <span className="text-emerald-500 font-bold uppercase tracking-wide">First Class Dist</span>
          </div>
        </div>

        {/* Placement Readiness */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[180px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] text-slate-450 uppercase font-bold">Placement Readiness Index</span>
            <Briefcase size={18} className="text-indigo-500" />
          </div>
          <div className="py-2">
            <span className="text-4xl font-extrabold text-slate-800 dark:text-white">{placementReadinessPercent}%</span>
            <p className="text-xs text-slate-500 mt-1">Tier-1 engineering placement probability</p>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-[10px]">
            <span className="text-slate-400 font-semibold uppercase">Confidence Index: 88.5%</span>
            <span className="text-indigo-500 font-bold uppercase tracking-wide">Excellent</span>
          </div>
        </div>

        {/* Course Completion trajectory */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[180px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] text-slate-450 uppercase font-bold">Projected Course Completion</span>
            <Target size={18} className="text-indigo-500" />
          </div>
          <div className="py-2">
            <span className="text-4xl font-extrabold text-slate-800 dark:text-white">96%</span>
            <p className="text-xs text-slate-500 mt-1">Likelihood of completing curriculum nodes on schedule</p>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-[10px]">
            <span className="text-slate-400 font-semibold uppercase">Confidence Index: 95.1%</span>
            <span className="text-emerald-500 font-bold uppercase tracking-wide">On Schedule</span>
          </div>
        </div>
      </div>

      {/* Projections charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Semester CGPA Projection Line/Area Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm lg:col-span-2">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-500" />
            Historical GPA & Predictive Projection Curve
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cgpaHistory}>
                <defs>
                  <linearGradient id="colorCgpa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProject" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis dataKey="semester" stroke="#64748b" fontSize={11} />
                <YAxis domain={[6.0, 10.0]} stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '12px' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area type="monotone" dataKey="cgpa" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCgpa)" name="Actual CGPA" />
                <Area type="monotone" dataKey="project" stroke="#06b6d4" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorProject)" name="AI Projected Trajectory" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Placement Checklist Indicators */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-1">Placement Gateways Check</h3>
            <p className="text-xs text-slate-400">Verifying qualifications for Tier-1 placements</p>
          </div>

          <div className="space-y-4 my-6">
            {placementMetrics.map((met, idx) => {
              const isQualified = met.score >= met.threshold;
              return (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-350 block">{met.category}</span>
                    <span className="text-[10px] text-slate-400">Req: &gt;={met.threshold}% • Act: {met.score}%</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    isQualified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {isQualified ? 'Pass' : 'Weakness'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850 text-[10px] text-slate-500 leading-normal flex items-start gap-2">
            <Sparkles className="text-indigo-500 shrink-0 mt-0.5" size={14} />
            <span>AI suggests improving <strong>System Architecture</strong> by 3% to clear placement criteria automatically.</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PerformancePrediction;
