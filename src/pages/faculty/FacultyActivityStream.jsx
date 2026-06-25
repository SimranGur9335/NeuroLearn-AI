import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Calendar, 
  ClipboardCheck, 
  Award, 
  Bell, 
  AlertTriangle, 
  GraduationCap, 
  BookOpen, 
  Filter, 
  Clock, 
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const FacultyActivityStream = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const facultyId = user?.faculty_id;

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');

  const fetchActivities = async () => {
    if (!facultyId) return;
    setLoading(true);
    try {
      const url = `http://localhost:8000/api/v1/faculty/${facultyId}/activities?module=${moduleFilter}&time_range=${timeFilter}&limit=100`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [facultyId, moduleFilter, timeFilter]);

  const getActivityIcon = (module) => {
    switch (module) {
      case 'attendance': return Calendar;
      case 'assignment': return ClipboardCheck;
      case 'marks': return Award;
      case 'announcement': return Bell;
      case 'risk': return AlertTriangle;
      case 'remedial': return GraduationCap;
      default: return Activity;
    }
  };

  const getActivityColor = (module) => {
    switch (module) {
      case 'attendance': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'assignment': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'marks': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'announcement': return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
      case 'risk': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'remedial': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      default: return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  const formatAbsoluteTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString([], { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      return '';
    }
  };

  const formatRelativeTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays} days ago`;
    } catch (e) {
      return '';
    }
  };

  const modules = [
    { id: 'all', name: 'All Modules' },
    { id: 'attendance', name: 'Attendance' },
    { id: 'assignment', name: 'Assignments' },
    { id: 'marks', name: 'Gradebook' },
    { id: 'risk', name: 'Risk & Notes' },
    { id: 'remedial', name: 'Remedials' },
    { id: 'announcement', name: 'Notices' }
  ];

  const times = [
    { id: 'all', name: 'All Time' },
    { id: 'today', name: 'Today Only' },
    { id: 'week', name: 'This Week' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 font-sans text-slate-800 dark:text-slate-200 min-h-screen pb-12"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/faculty/dashboard')}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-505 transition-colors cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">
              Productivity Hub
            </p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">
              Faculty Activity Stream
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-semibold">
              A comprehensive ledger of all operations, events, and notes logged in your portal.
            </p>
          </div>
        </div>
        
        <button 
          onClick={fetchActivities}
          className="self-start md:self-center flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-855 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Log
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
        {/* Module filter */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">Filter by Module</label>
          <div className="flex items-center gap-2 flex-wrap">
            {modules.map(m => (
              <button
                key={m.id}
                onClick={() => setModuleFilter(m.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  moduleFilter === m.id 
                    ? 'bg-purple-650 bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-500/15 scale-[1.03]' 
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-655 dark:text-slate-350'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* Timeframe filter */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-850">
          <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">Filter by Timeframe</label>
          <div className="flex items-center gap-2">
            {times.map(t => (
              <button
                key={t.id}
                onClick={() => setTimeFilter(t.id)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  timeFilter === t.id 
                    ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-905 shadow-sm scale-102' 
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-605 dark:text-slate-350'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-6 relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col justify-center items-center gap-3">
            <RefreshCw size={24} className="animate-spin text-purple-600" />
            <span className="text-xs text-slate-400 font-bold">Loading activity chronicles...</span>
          </div>
        ) : activities.length === 0 ? (
          <div className="h-[350px] flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-805 flex items-center justify-center text-slate-400 mb-4">
              <Activity size={28} />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200">No logs discovered</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mt-1">
              There are no recorded activities matching your current module or timeframe filter selections.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 md:pl-12 border-l border-slate-200 dark:border-slate-800 space-y-8 py-2">
            <AnimatePresence>
              {activities.map((act, idx) => {
                const Icon = getActivityIcon(act.module);
                const colorClass = getActivityColor(act.module);
                return (
                  <motion.div 
                    key={act.activity_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 1) }}
                    className="relative group flex flex-col md:flex-row md:items-start justify-between gap-4 p-4 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-850 hover:bg-slate-50/40 dark:hover:bg-slate-950/20 transition-all duration-200 text-left"
                  >
                    {/* Circle Bullet Icon */}
                    <div className={`absolute -left-[39px] md:-left-[55px] top-4 p-2.5 rounded-full border-4 border-white dark:border-slate-900 shrink-0 transition-transform group-hover:scale-110 shadow-sm ${colorClass}`}>
                      <Icon size={14} />
                    </div>

                    {/* Left: Details */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="font-extrabold text-slate-850 dark:text-white text-sm leading-tight">
                          {act.action}
                        </h4>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${colorClass}`}>
                          {act.module}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                        {act.details}
                      </p>
                    </div>

                    {/* Right: Timestamp */}
                    <div className="flex flex-row md:flex-col md:items-end justify-between md:justify-start gap-1 shrink-0 mt-1">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-250 flex items-center gap-1">
                        <Clock size={12} className="text-slate-400" />
                        {formatRelativeTime(act.created_at)}
                      </span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium block">
                        {formatAbsoluteTime(act.created_at)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FacultyActivityStream;
