import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import {
  Users,
  BookOpen,
  Server,
  Activity,
  Cpu,
  Layers,
  Megaphone,
  Settings,
  ShieldCheck,
  FileText
} from 'lucide-react';



const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:8000/admin/dashboard-stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Error loading dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
        <p className="text-slate-500 text-sm">Error fetching administrative telemetry data.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-900 border border-emerald-900/50 p-6 rounded-3xl relative overflow-hidden shadow-xl text-white">
        <div className="absolute right-0 top-0 w-64 h-64 bg-radial-gradient(circle,rgba(16,185,129,0.15)_0%,transparent_70%) pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 animate-pulse">
              LMS Control Panel
            </span>
            <h1 className="text-xl md:text-2xl font-black mt-2">
              Administrator Platform Center
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-lg">
              Centralized administrative oversight, academic structural configurations, student enrollment tracking, and system logs.
            </p>
          </div>
        </div>
      </div>

      {/* Admin KPI stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Students */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Total Students</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-800 dark:text-white">{stats.total_students}</span>
            <Users size={18} className="text-emerald-500" />
          </div>
        </div>

        {/* Total Faculty */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Total Faculty</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-800 dark:text-white">{stats.total_faculty}</span>
            <Users size={18} className="text-indigo-500" />
          </div>
        </div>

        {/* Total Courses */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Active Courses</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-800 dark:text-white">{stats.total_courses}</span>
            <BookOpen size={18} className="text-purple-500" />
          </div>
        </div>

        {/* Total Subjects */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Active Subjects</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-800 dark:text-white">{stats.total_subjects}</span>
            <BookOpen size={18} className="text-amber-500" />
          </div>
        </div>

        {/* Total Classes */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm col-span-2 lg:col-span-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Active Classes</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-800 dark:text-white">{stats.total_classes}</span>
            <Layers size={18} className="text-rose-500" />
          </div>
        </div>
      </div>

      {/* Charts & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department performance chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm lg:col-span-2">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-4 flex items-center gap-2">
            <Cpu size={18} className="text-emerald-500" />
            Student Distribution by Department
          </h3>
          <div className="h-64">
            {stats.department_distribution.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No students enrolled to generate statistics.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.department_distribution}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                    opacity={0.15}
                  />
                  <XAxis
                    dataKey="branch"
                    stroke="#64748b"
                    fontSize={11}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '12px'
                    }}
                  />
                  <Bar
                    dataKey="score"
                    radius={[8, 8, 0, 0]}
                    fill="#10b981"
                    name="Student Count"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick actions panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base mb-1">
              Quick Operations
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Frequently accessed administrator endpoints
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/admin/users')}
                className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition cursor-pointer text-left"
              >
                <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                  Manage Users
                </div>
              </button>

              <button
                onClick={() => navigate('/admin/enrollments')}
                className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition cursor-pointer text-left"
              >
                <div className="font-bold text-xs text-blue-600 dark:text-blue-400">
                  Enroll Student
                </div>
              </button>

              <button
                onClick={() => navigate('/admin/departments')}
                className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition cursor-pointer text-left"
              >
                <div className="font-bold text-xs text-purple-600 dark:text-purple-400">
                  Departments
                </div>
              </button>

              <button
                onClick={() => navigate('/admin/settings')}
                className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition cursor-pointer text-left"
              >
                <div className="font-bold text-xs text-amber-600 dark:text-amber-400">
                  Portal Settings
                </div>
              </button>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 dark:border-slate-850 pt-4">
            <h4 className="font-bold text-slate-805 dark:text-slate-200 text-xs mb-3 flex items-center gap-1.5">
              <FileText size={14} className="text-emerald-500" />
              Recent Activity Audit Trail
            </h4>

            <div className="space-y-2.5 text-[10px] text-slate-500 dark:text-slate-400 max-h-[140px] overflow-y-auto pr-1">
              {stats.recent_activities.length === 0 ? (
                <p className="italic text-slate-400">No system activities recorded yet.</p>
              ) : (
                stats.recent_activities.map((act, idx) => (
                  <div key={idx} className="flex items-start gap-1 justify-between p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-855 rounded-lg">
                    <span className="truncate pr-2 font-medium">• {act.text}</span>
                    <span className="text-[9px] text-slate-400 font-mono shrink-0">{act.timestamp}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
