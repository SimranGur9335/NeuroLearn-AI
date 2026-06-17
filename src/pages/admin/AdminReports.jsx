import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  BarChart3, 
  Building, 
  TrendingUp, 
  Award, 
  HelpCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';

const AdminReports = () => {
  const [departmentData, setDepartmentData] = useState([]);
  const [yearlyRegistrations, setYearlyRegistrations] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [resDept, resEnroll, resSessions] = await Promise.all([
        fetch("http://localhost:8000/api/v1/admin/reports/departments"),
        fetch("http://localhost:8000/api/v1/admin/reports/enrollments"),
        fetch("http://localhost:8000/api/v1/admin/reports/active-sessions")
      ]);
      
      if (resDept.ok) {
        const dept = await resDept.json();
        setDepartmentData(dept);
      }
      if (resEnroll.ok) {
        const enroll = await resEnroll.json();
        setYearlyRegistrations(enroll);
      }
      if (resSessions.ok) {
        const sessions = await resSessions.json();
        setActiveSessions(sessions);
      }
    } catch (err) {
      console.error("Failed to load admin reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Intro Header */}
      <div>
        <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Institution Intelligence</p>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Institutional Performance & Usage Audit</h2>
        <p className="text-slate-500 text-xs mt-1">
          Review department statistics, yearly enrollment trajectories, and active login schedules across the institution.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department performance radar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-4 flex items-center gap-2">
            <Building size={18} className="text-emerald-500" />
            Department Aggregates Breakdown
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" radius="70%" data={departmentData}>
                <PolarGrid stroke="#475569" opacity={0.2} />
                <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={9} />
                <PolarRadiusAxis stroke="#64748b" fontSize={9} />
                <Radar name="Attendance (%)" dataKey="attendance" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                <Radar name="Quiz Score (%)" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} />
                <Radar name="Node Completion (%)" dataKey="completion" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '11px' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform logins active history */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-500" />
            Platform Active Login Statistics (Daily)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeSessions}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '11px' }} />
                <Area type="monotone" dataKey="users" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" name="Active Learners Count" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Yearly Enrollments Growth */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm lg:col-span-2">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-emerald-500" />
            Yearly Department Enrollment Growth Index
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yearlyRegistrations}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis dataKey="year" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '11px' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area type="monotone" dataKey="CS" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} name="CS" />
                <Area type="monotone" dataKey="IT" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} name="IT" />
                
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminReports;
