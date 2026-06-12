import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const departmentPerformance = Object.values(
    studentsList.reduce((acc, student) => {
      const branch = student.branch || "Unknown";

      if (!acc[branch]) {
        acc[branch] = {
          branch,
          count: 0,
          totalScore: 0
        };
      }

      const score =
        student.attendance * 0.4 +
        student.quizScore * 0.3 +
        ((student.predictedCgpa / 10) * 100) * 0.3;

      acc[branch].count += 1;
      acc[branch].totalScore += score;

      return acc;
    }, {})
  ).map((dept) => ({
    branch: dept.branch,
    score: Math.round(dept.totalScore / dept.count)
  }));

  const averageCgpa =
    studentsList.length > 0
      ? (
        studentsList.reduce(
          (sum, student) =>
            sum + Number(student.predictedCgpa || 0),
          0
        ) / studentsList.length
      ).toFixed(2)
      : 0;

  const academicHealthScore =
    studentsList.length > 0
      ? Math.round(
        studentsList.reduce((sum, student) => {
          const attendance = Number(student.attendance || 0);
          const quiz = Number(student.quizScore || 0);
          const cgpa =
            ((Number(student.predictedCgpa || 0) / 10) * 100);

          return (
            sum +
            attendance * 0.4 +
            quiz * 0.3 +
            cgpa * 0.3
          );
        }, 0) / studentsList.length
      )
      : 0;// 4 nodes per course

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-900 border border-emerald-900/50 p-4 rounded-3xl relative overflow-hidden shadow-xl text-white">
        <div className="absolute right-0 top-0 w-64 h-64 bg-radial-gradient(circle,rgba(16,185,129,0.15)_0%,transparent_70%) pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              LMS Control Panel
            </span>
            <h1 className="text-xl md:text-2xl font-black mt-2">
              Administrator Platform Center
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-lg">
              Centralized administration, academic oversight,
department monitoring and institutional management.
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
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
            Average CGPA
          </span>

          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-800 dark:text-white">
              {averageCgpa}
            </span>

            <Activity size={18} className="text-slate-400" />
          </div>
        </div>

        {/* Server Health Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm col-span-2 lg:col-span-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
            Academic Health
          </span>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />

            <span className="text-base font-extrabold text-emerald-500">
              {academicHealthScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Telemetry charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Server Load timeline */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm lg:col-span-2">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-4 flex items-center gap-2">
            <Cpu size={18} className="text-emerald-505 text-emerald-500" />
            Department Performance Index
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentPerformance}>
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
                  domain={[0, 100]}
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
                  name="Performance Score"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Server Memory and Nodes statistics */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col">

          <h3 className="font-extrabold text-slate-800 dark:text-white text-lg mb-1">
            Quick Actions
          </h3>

          <p className="text-xs text-slate-400 mb-5">
            Frequently used administrator operations
          </p>

          <div className="grid grid-cols-2 gap-3">

            <button 
            onClick={() => navigate('/admin/users')}
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition">
              <div className="font-bold text-emerald-500">
                Add Student
              </div>
            </button>

            <button onClick={() => navigate('/admin/users')}
            className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition">
              <div className="font-bold text-blue-400">
                Add Faculty
              </div>
            </button>

            <button onClick={() => navigate('/admin/courses')}
            className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition">
              <div className="font-bold text-purple-400">
                Add Course
              </div>
            </button>

            <button onClick={() => navigate('/admin/reports')}className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition">
              <div className="font-bold text-amber-400">
                View Reports
              </div>
            </button>

          </div>

          <div className="mt-6 border-t border-slate-800 pt-4">
            <h4 className="font-bold text-white mb-3">
              Recent Activity
            </h4>

            <div className="space-y-2 text-xs text-slate-400">

              <div>
                • New faculty account created
              </div>

              <div>
                • Curriculum updated for Semester VI
              </div>

              <div>
                • Student directory synced
              </div>

              <div>
                • Department report generated
              </div>

            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
