import React from 'react';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell, 
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
  LineChart, 
  Line 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Brain, 
  Award, 
  HelpCircle,
  BarChart3,
  Flame,
  Activity
} from 'lucide-react';

const TeacherAnalytics = () => {
  const branchData = [
    { name: 'Computer Science', score: 84, attendance: 91, students: 150 },
    { name: 'Information Tech', score: 79, attendance: 88, students: 120 },
    { name: 'Electronics & Comm', score: 76, attendance: 85, students: 110 },
    { name: 'Electrical Eng', score: 72, attendance: 82, students: 70 },
    { name: 'Mechanical Eng', score: 69, attendance: 83, students: 70 }
  ];

  const subjectAverages = [
    { subject: 'Artificial Intell', avg: 82 },
    { subject: 'Cybersecurity', avg: 88 },
    { subject: 'Full Stack Web', avg: 74 },
    { subject: 'DevOps Pipelines', avg: 69 },
    { subject: 'Cloud Databases', avg: 64 },
    { branch: 'Big Data Spark', avg: 60 }
  ];

  const engagementTimeline = [
    { hour: '08:00', load: 15 },
    { hour: '10:00', load: 42 },
    { hour: '12:00', load: 78 },
    { hour: '14:00', load: 55 },
    { hour: '16:00', load: 68 },
    { hour: '18:00', load: 82 },
    { hour: '20:00', load: 95 },
    { hour: '22:00', load: 60 }
  ];

  const completionsData = [
    { subject: 'AI/ML', completed: 92, active: 8 },
    { subject: 'DevOps', completed: 78, active: 22 },
    { subject: 'Full Stack', completed: 96, active: 4 },
    { subject: 'Cloud', completed: 64, active: 36 },
    { subject: 'Cyber', completed: 100, active: 0 },
    { subject: 'Data Sci', completed: 60, active: 40 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Intro Header */}
      <div>
        <p className="text-xs text-purple-500 font-bold uppercase tracking-wider">Academic Performance Indicators</p>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Academic Intelligence Analytics</h2>
        <p className="text-slate-500 text-xs mt-1">
          Review aggregates, course completion rates, active session schedules, and curriculum coverage indices.
        </p>
      </div>

      {/* Grid of charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch-wise performance & attendance comparison */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-purple-505 text-purple-500" />
            Branch Performance Comparisons (%)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '11px' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar dataKey="score" fill="#a855f7" name="Avg Quiz Score (%)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="attendance" fill="#06b6d4" name="Avg Attendance (%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject wise average radar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-4 flex items-center gap-2">
            <Brain size={18} className="text-purple-500" />
            Subject Wise Performance Index
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" radius="70%" data={subjectAverages}>
                <PolarGrid stroke="#475569" opacity={0.2} />
                <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={9} />
                <PolarRadiusAxis stroke="#64748b" fontSize={9} />
                <Radar name="Class Average" dataKey="avg" stroke="#a855f7" fill="#a855f7" fillOpacity={0.25} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '11px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic platform engagement timeline */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-4 flex items-center gap-2">
            <Activity size={18} className="text-purple-500 animate-pulse" />
            Student Hourly Engagement Loads
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagementTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '11px' }} />
                <Line type="monotone" dataKey="load" stroke="#a855f7" strokeWidth={3} activeDot={{ r: 6 }} name="Sessions Count" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stacked bar completion rates */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-4 flex items-center gap-2">
            <Award size={18} className="text-purple-505 text-purple-500" />
            Curriculum Node Completion Distributions
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={completionsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                <XAxis dataKey="subject" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '11px' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed Nodes (%)" />
                <Bar dataKey="active" stackId="a" fill="#6366f1" name="In Progress Nodes (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TeacherAnalytics;
