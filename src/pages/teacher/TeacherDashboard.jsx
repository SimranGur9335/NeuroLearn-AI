import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  BarChart,
  Bar
} from 'recharts';
import { 
  Users, 
  Calendar, 
  GraduationCap, 
  AlertTriangle, 
  Activity, 
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { studentsList, teachersList, coursesList } = useStudent();

  // Calculate dynamic stats from studentsList context!
  const totalStudents = studentsList.length;
  const activeStudents = Math.round(totalStudents * 0.92); // mock 92% active ratio
  const avgAttendance = (studentsList.reduce((sum, s) => sum + s.attendance, 0) / totalStudents).toFixed(1);
  const avgQuizScore = (studentsList.reduce((sum, s) => sum + s.quizScore, 0) / totalStudents).toFixed(1);
  const studentsAtRisk = studentsList.filter(s => s.status === "At Risk").length;

  const recentActivities = [
    { name: "Rohit Deshmukh", event: "completed Generative AI quiz with score 3/3", time: "10m ago", severity: "info" },
    { name: "Aarav Singh", event: "maintain study streak for 8 consecutive days", time: "2h ago", severity: "success" },
    { name: "Siddharth Jain", event: "attendance dropped below 75% threshold", time: "4h ago", severity: "high" },
    { name: "Divya Das", event: "failed Full Stack Node 3 quiz on first attempt", time: "6h ago", severity: "medium" }
  ];

  // Seeding chart data dynamically based on calculations
  const branchChartData = [
    { branch: 'CS', average: 82.5, attendance: 89.2 },
    { branch: 'IT', average: 78.4, attendance: 86.4 },
    { branch: 'ECE', average: 75.1, attendance: 84.1 },
    { branch: 'EEE', average: 70.8, attendance: 81.2 },
    { branch: 'ME', average: 68.2, attendance: 82.8 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-950 to-slate-900 border border-purple-900/50 p-6 rounded-3xl relative overflow-hidden shadow-xl text-white">
        <div className="absolute right-0 top-0 w-64 h-64 bg-radial-gradient(circle,rgba(168,85,247,0.15)_0%,transparent_70%) pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-xs text-purple-400 font-bold uppercase tracking-wider bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              Department of Computer Science
            </span>
            <h1 className="text-2xl md:text-3xl font-black mt-3">
              Faculty Hub - Academic Intelligence
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-lg">
              Monitor course metrics, inspect students likely to fail, configure curriculum outlines, and launch remedial class notifications.
            </p>
          </div>
          <button 
            onClick={() => navigate('/teacher/performance')}
            className="bg-white hover:bg-slate-100 text-purple-950 font-bold px-5 py-3 rounded-xl transition-all shadow-lg text-sm shrink-0 flex items-center gap-2 cursor-pointer self-start md:self-auto"
          >
            Review Student Directory
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* KPI Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Students */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[10px] uppercase font-bold">Total Students</span>
            <Users size={16} />
          </div>
          <span className="text-2xl font-black text-slate-800 dark:text-white">{totalStudents}</span>
        </div>

        {/* Active Students */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[10px] uppercase font-bold">Active Users</span>
            <Activity size={16} className="text-emerald-500" />
          </div>
          <span className="text-2xl font-black text-slate-800 dark:text-white">{activeStudents}</span>
        </div>

        {/* Average Attendance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[10px] uppercase font-bold">Avg Attendance</span>
            <Calendar size={16} />
          </div>
          <span className="text-2xl font-black text-slate-800 dark:text-white">{avgAttendance}%</span>
        </div>

        {/* Average Quiz Score */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[10px] uppercase font-bold">Avg Grades</span>
            <GraduationCap size={16} />
          </div>
          <span className="text-2xl font-black text-slate-800 dark:text-white">{avgQuizScore}%</span>
        </div>

        {/* Students At Risk */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm col-span-2 lg:col-span-1">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[10px] uppercase font-bold">Students at Risk</span>
            <AlertTriangle size={16} className="text-red-500" />
          </div>
          <span className="text-2xl font-black text-red-500">{studentsAtRisk}</span>
        </div>
      </div>

      {/* Activity Alert Feed & Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branch Average Grades Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm lg:col-span-2">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-purple-500" />
            Branch Performance Benchmarks
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis dataKey="branch" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '12px' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar dataKey="average" fill="#a855f7" radius={[6, 6, 0, 0]} name="Average Quiz (%)" />
                <Bar dataKey="attendance" fill="#06b6d4" radius={[6, 6, 0, 0]} name="Attendance (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Student Activity Alerts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-1">Recent Student Activities</h3>
            <p className="text-xs text-slate-400 font-semibold mb-4">Live updates from classroom nodes</p>
          </div>

          <div className="space-y-3.5 my-3 flex-1 overflow-y-auto max-h-[200px]">
            {recentActivities.map((act, index) => (
              <div key={index} className="flex gap-2.5 text-[11px] leading-relaxed">
                <span className="text-slate-400">●</span>
                <div>
                  <strong className="text-slate-700 dark:text-slate-250">{act.name}</strong>
                  <span className="text-slate-500 block">{act.event}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">{act.time}</span>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => navigate('/teacher/performance')}
            className="w-full py-2.5 bg-slate-105 border border-slate-250 dark:border-slate-800 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-800 dark:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Audits Performance Logs
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TeacherDashboard;
