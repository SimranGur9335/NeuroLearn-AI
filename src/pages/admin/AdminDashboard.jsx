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
  BarChart,
  Bar
} from 'recharts';
import { 
  Users, 
  BookOpen, 
  Server, 
  Activity, 
  Cpu, 
  ShieldCheck, 
  HardDrive, 
  BellRing
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { SYSTEM_METRICS } from '../../data/academicData';

const AdminDashboard = () => {
  const { studentsList, teachersList, coursesList } = useStudent();

  const totalStudents = studentsList.length;
  const totalTeachers = teachersList.length;
  const totalCourses = coursesList.length;
  const totalAssessments = totalCourses * 4; // 4 nodes per course

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
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              LMS Control Panel
            </span>
            <h1 className="text-2xl md:text-3xl font-black mt-3">
              Administrator Platform Center
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-lg">
              Manage accounts, publish course catalogs, monitor database performance indexes, and audit telemetry logs.
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
            <span className="text-2xl font-black text-slate-800 dark:text-white">{totalStudents}</span>
            <Users size={18} className="text-slate-400" />
          </div>
        </div>

        {/* Total Teachers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Total Faculty</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-800 dark:text-white">{totalTeachers}</span>
            <Server size={18} className="text-slate-400" />
          </div>
        </div>

        {/* Total Courses */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Active Courses</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-800 dark:text-white">{totalCourses}</span>
            <BookOpen size={18} className="text-slate-400" />
          </div>
        </div>

        {/* Assessments */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Assessments Nodes</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-800 dark:text-white">{totalAssessments}</span>
            <Activity size={18} className="text-slate-400" />
          </div>
        </div>

        {/* Server Health Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm col-span-2 lg:col-span-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">System Health</span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-base font-extrabold text-emerald-500 uppercase">ONLINE</span>
          </div>
        </div>
      </div>

      {/* Telemetry charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Server Load timeline */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm lg:col-span-2">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-4 flex items-center gap-2">
            <Cpu size={18} className="text-emerald-505 text-emerald-500" />
            Vite Server CPU Telemetry Load (%)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SYSTEM_METRICS.cpuUsage}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="load" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCpu)" name="CPU Core Load (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Server Memory and Nodes statistics */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-1">Hardware Specifications</h3>
            <p className="text-xs text-slate-400">Node cluster performance records</p>
          </div>

          <div className="space-y-4 my-6 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
              <div className="flex items-center gap-2">
                <HardDrive size={16} className="text-slate-400" />
                <span className="text-slate-655 font-medium">Memory Allocation</span>
              </div>
              <span className="font-extrabold text-slate-700 dark:text-slate-200">5.9 GB / 8.0 GB</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-slate-400" />
                <span className="text-slate-655 font-medium">SSL Certificates</span>
              </div>
              <span className="font-extrabold text-emerald-500">VALID</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BellRing size={16} className="text-slate-400" />
                <span className="text-slate-655 font-medium">API Endpoints logs</span>
              </div>
              <span className="font-extrabold text-slate-700 dark:text-slate-200">0 Errors</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850/80 text-[10px] text-slate-500 leading-normal flex items-start gap-2">
            <Cpu className="text-emerald-500 shrink-0 mt-0.5" size={14} />
            <span>Telemetry check successful. Port 5173 is open and stable. CPU cores running at nominal temperature limits.</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
