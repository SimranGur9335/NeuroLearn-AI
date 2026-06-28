import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../services/api';
import StudentHubHeader from '../../components/StudentHubHeader';
import { useStudent } from '../../context/StudentContext';
import { THEME_COLOR_MAP } from '../../components/StudentHubTheme';
import { 
  UserCheck, 
  Calendar, 
  AlertCircle, 
  TrendingUp, 
  CheckCircle,
  XCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const AttendancePage = () => {
  const { profile } = useStudent();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    overall_percentage: 0.0,
    subject_breakdown: [],
    history: []
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const res = await apiFetch('/student-hub/attendance');
        if (!res.ok) {
          throw new Error('Failed to load attendance');
        }
        const attendanceData = await res.json();
        setData(attendanceData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  // Format history for trend chart (last 10 records, chronological)
  const chartData = [...data.history]
    .slice(0, 15)
    .reverse()
    .map((record, index) => {
      // Calculate running attendance (simulated or simplified based on status)
      return {
        name: new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        StatusValue: record.status === 'Present' ? 100 : 0,
        subject: record.subject_code
      };
    });

  // Calculate circular stroke details
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (data.overall_percentage / 100) * circumference;

  return (
    <div className="space-y-8">
      <StudentHubHeader 
        title="Attendance & Presence Tracking" 
        description="Verify your subject enrollment presence logs. Keep your overall standing above the 75% threshold."
        showBackButton={true}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] space-y-4">
          <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-slate-500 dark:text-slate-400 text-xs animate-pulse">Retrieving attendance logs...</span>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-650 dark:text-red-400 text-sm">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Radial gauge overview card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-between text-center space-y-6">
            <h3 className="font-extrabold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">Overall Standing</h3>
            
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background Track */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="12"
                  fill="transparent"
                />
                {/* Active Progress */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className={themeColor === 'indigo' ? 'stroke-indigo-500' : themeColor === 'rose' ? 'stroke-rose-500' : themeColor === 'violet' ? 'stroke-violet-500' : themeColor === 'emerald' ? 'stroke-emerald-500' : themeColor === 'amber' ? 'stroke-amber-500' : 'stroke-blue-500'}
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900 dark:text-white">{data.overall_percentage}%</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Presence</span>
              </div>
            </div>

            <div className="w-full bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 text-left flex items-start gap-3">
              <AlertCircle className={data.overall_percentage >= 75 ? 'text-emerald-550 dark:text-emerald-400 shrink-0' : 'text-amber-550 dark:text-amber-400 shrink-0'} size={20} />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {data.overall_percentage >= 75 ? 'Attendance Standing Clear' : 'Attendance Warning'}
                </span>
                <p className="text-[11px] text-slate-650 dark:text-slate-400 mt-0.5">
                  {data.overall_percentage >= 75 
                    ? 'Your records meet the minimum academic operations standard of 75%.'
                    : 'Your standing is below the required 75%. Please attend upcoming classes to avoid eligibility locks.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Recharts Trend Area Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 lg:col-span-2 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-550 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp size={16} className={theme.text} />
                Recent Presence Trend
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Plotting chronological present/absent status over the last 15 lectures.</p>
            </div>

            <div className="h-44 w-full">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  Not enough historical sessions recorded.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTheme" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={themeColor === 'indigo' ? '#4F46E5' : themeColor === 'rose' ? '#f43f5e' : themeColor === 'violet' ? '#7C3AED' : themeColor === 'emerald' ? '#10b981' : themeColor === 'amber' ? '#f59e0b' : '#2563EB'} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={themeColor === 'indigo' ? '#4F46E5' : themeColor === 'rose' ? '#f43f5e' : themeColor === 'violet' ? '#7C3AED' : themeColor === 'emerald' ? '#10b981' : themeColor === 'amber' ? '#f59e0b' : '#2563EB'} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                      labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#94a3b8', fontSize: '11px' }}
                      formatter={(value, name, props) => [value === 100 ? 'Present' : 'Absent', `Subject: ${props.payload.subject}`]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="StatusValue" 
                      stroke={themeColor === 'indigo' ? '#4F46E5' : themeColor === 'rose' ? '#f43f5e' : themeColor === 'violet' ? '#7C3AED' : themeColor === 'emerald' ? '#10b981' : themeColor === 'amber' ? '#f59e0b' : '#2563EB'} 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorTheme)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Subject Breakdown Progress Bars */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 lg:col-span-2 space-y-6">
            <h3 className="font-extrabold text-sm text-slate-550 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={16} className={theme.text} />
              Subject-wise standing
            </h3>
            
            <div className="space-y-4">
              {data.subject_breakdown.map((sub, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <div className="space-x-2">
                      <span className="font-extrabold text-slate-900 dark:text-white">{sub.subject_name}</span>
                      <span className="text-[10px] text-slate-550 dark:text-slate-500 font-bold uppercase">{sub.subject_code}</span>
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {sub.percentage}% ({sub.present_count}/{sub.total_count})
                    </span>
                  </div>
                  {/* Progress bar background */}
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        sub.percentage >= 75 
                          ? (themeColor === 'indigo' ? 'bg-indigo-500' : themeColor === 'rose' ? 'bg-rose-500' : themeColor === 'violet' ? 'bg-violet-500' : themeColor === 'emerald' ? 'bg-emerald-500' : themeColor === 'amber' ? 'bg-amber-500' : 'bg-blue-500') 
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${sub.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chronological logs feed */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 overflow-hidden flex flex-col justify-between">
            <h3 className="font-extrabold text-sm text-slate-550 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck size={16} className={theme.text} />
              Chronological Logs
            </h3>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {data.history.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No attendance records logged yet.
                </div>
              ) : (
                data.history.slice(0, 10).map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                    <div className="flex items-center gap-3">
                      {log.status === 'Present' ? (
                        <CheckCircle className="text-emerald-500 shrink-0" size={16} />
                      ) : (
                        <XCircle className="text-red-500 shrink-0" size={16} />
                      )}
                      <div>
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white block">{log.subject_name}</span>
                        <span className="text-[10px] text-slate-500 font-bold block">{log.subject_code}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default AttendancePage;
