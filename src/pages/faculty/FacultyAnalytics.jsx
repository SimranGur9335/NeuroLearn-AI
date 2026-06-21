import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
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
  AreaChart, 
  Area,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Brain, 
  Award, 
  BarChart3,
  Activity,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

const FacultyAnalytics = () => {
  const selectedClass = JSON.parse(localStorage.getItem("selectedClass") || "{}");
  const facultyId = Number(localStorage.getItem("faculty_id") || "7");

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/faculty/${facultyId}/analytics`);
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to load analytics data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [facultyId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 font-sans text-slate-800 dark:text-slate-200"
    >
      {/* Intro Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-purple-650 font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            LMS Analytics
          </p>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            Academic Intelligence Center
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Review live class aggregates, historical attendance logs, and student performance rankings.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="p-2.5 rounded-xl border border-slate-250 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer text-slate-500 hover:text-slate-800 dark:hover:text-white"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {loading ? (
        <div className="p-20 text-center flex flex-col items-center justify-center gap-2">
          <RefreshCw size={24} className="animate-spin text-purple-650" />
          <span className="text-xs text-slate-400">Loading academic analytics...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Branch comparisons */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-850 dark:text-white text-sm flex items-center gap-2">
                <BarChart3 size={18} className="text-purple-500" />
                Branch Performance Comparisons (%)
              </h3>
              <div className="h-64">
                {analytics?.performance_trend && analytics.performance_trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.performance_trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                      <XAxis dataKey="branch" stroke="#64748b" fontSize={9} />
                      <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '11px' }} />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Bar dataKey="average" fill="#a855f7" name="Avg Quiz Score (%)" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="attendance" fill="#06b6d4" name="Avg Attendance (%)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">No data available.</div>
                )}
              </div>
            </div>

            {/* Subject performance index radar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-850 dark:text-white text-sm flex items-center gap-2">
                <Brain size={18} className="text-purple-500" />
                Subject Wise Performance Index
              </h3>
              <div className="h-64 flex items-center justify-center">
                {analytics?.subject_averages && analytics.subject_averages.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" radius="70%" data={analytics.subject_averages}>
                      <PolarGrid stroke="#475569" opacity={0.2} />
                      <PolarAngleAxis dataKey="subject_name" stroke="#64748b" fontSize={9} />
                      <PolarRadiusAxis stroke="#64748b" fontSize={9} />
                      <Radar name="Class Average" dataKey="average" stroke="#a855f7" fill="#a855f7" fillOpacity={0.25} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '11px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-slate-400 text-xs">No subject average data registered.</div>
                )}
              </div>
            </div>

            {/* Attendance Trend Area Chart */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-850 dark:text-white text-sm flex items-center gap-2">
                <Activity size={18} className="text-purple-500" />
                Attendance Timeline Trend (%)
              </h3>
              <div className="h-64">
                {analytics?.attendance_trend && analytics.attendance_trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.attendance_trend}>
                      <defs>
                        <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={9} />
                      <YAxis stroke="#64748b" fontSize={9} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '11px' }} />
                      <Area type="monotone" dataKey="rate" stroke="#a855f7" fillOpacity={1} fill="url(#colorAtt)" strokeWidth={2.5} name="Attendance Rate" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">No historical records loaded.</div>
                )}
              </div>
            </div>

            {/* Top and Weak Students Rankings */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-850 dark:text-white text-sm flex items-center gap-2">
                <Award size={18} className="text-purple-500" />
                Syllabus Performance Highlights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Top performing */}
                <div className="space-y-3">
                  <span className="text-[10px] text-slate-450 uppercase font-extrabold tracking-wider block">Top Students</span>
                  <div className="space-y-2">
                    {analytics?.top_students?.map((s, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded-xl bg-purple-500/5 border border-purple-500/5">
                        <div>
                          <span className="font-bold text-[11px] text-slate-850 dark:text-slate-200 block leading-tight">{s.name}</span>
                          <span className="text-[9px] text-slate-400 block font-mono">{s.roll} • {s.branch}</span>
                        </div>
                        <span className="font-black text-xs text-purple-650">{s.score.toFixed(1)}%</span>
                      </div>
                    ))}
                    {(!analytics?.top_students || analytics.top_students.length === 0) && (
                      <span className="text-slate-400 text-xs block py-2">No data recorded.</span>
                    )}
                  </div>
                </div>

                {/* At risk / weak */}
                <div className="space-y-3">
                  <span className="text-[10px] text-slate-455 text-red-500 uppercase font-extrabold tracking-wider block">At-Risk Warnings</span>
                  <div className="space-y-2">
                    {analytics?.weak_students?.map((s, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded-xl bg-red-500/5 border border-red-500/5">
                        <div>
                          <span className="font-bold text-[11px] text-slate-850 dark:text-slate-200 block leading-tight">{s.name}</span>
                          <span className="text-[9px] text-slate-400 block font-mono">{s.roll} • {s.branch}</span>
                        </div>
                        <span className="font-black text-xs text-red-500">{s.score.toFixed(1)}%</span>
                      </div>
                    ))}
                    {(!analytics?.weak_students || analytics.weak_students.length === 0) && (
                      <span className="text-slate-400 text-xs block py-2">No risk warnings flagged.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FacultyAnalytics;
