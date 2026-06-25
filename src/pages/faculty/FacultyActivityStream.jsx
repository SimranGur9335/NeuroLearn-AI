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
  RefreshCw,
  Search,
  X,
  User,
  Shield,
  Layers,
  Users,
  Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../services/api';

const FacultyActivityStream = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const facultyId = user?.faculty_id;

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);

  const fetchActivities = async () => {
    if (!facultyId) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/v1/faculty/${facultyId}/activities?module=${moduleFilter}&time_range=${timeFilter}&limit=100`);
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
      case 'gradebook': return Award;
      case 'student_monitoring': return Users;
      case 'risk_prediction': return AlertTriangle;
      case 'remedial': return GraduationCap;
      case 'announcement': return Bell;
      case 'profile': return User;
      case 'authentication': return Shield;
      default: return Activity;
    }
  };

  const getActivityColor = (module) => {
    switch (module) {
      case 'attendance': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'assignment': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'gradebook': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'student_monitoring': return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
      case 'risk_prediction': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'remedial': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'announcement': return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
      case 'profile': return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20';
      case 'authentication': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
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
    { id: 'assignment', name: 'Assignment' },
    { id: 'gradebook', name: 'Gradebook' },
    { id: 'student_monitoring', name: 'Student Monitoring' },
    { id: 'risk_prediction', name: 'Risk Prediction' },
    { id: 'remedial', name: 'Remedial' },
    { id: 'announcement', name: 'Announcements' },
    { id: 'profile', name: 'Profile' },
    { id: 'authentication', name: 'Authentication' }
  ];

  const times = [
    { id: 'all', name: 'All Time' },
    { id: 'today', name: 'Today' },
    { id: 'week', name: 'Last 7 Days' },
    { id: 'month', name: 'Last 30 Days' }
  ];

  // Real-time client-side search across multiple fields
  const filteredActivities = activities.filter(act => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const actionMatch = act.action?.toLowerCase().includes(query);
    const detailsMatch = act.details?.toLowerCase().includes(query);
    const moduleMatch = act.module?.toLowerCase().replace('_', ' ').includes(query);
    const studentMatch = act.related_student?.toLowerCase().includes(query);
    const classMatch = act.related_class?.toLowerCase().includes(query);
    const subjectMatch = act.related_subject?.toLowerCase().includes(query);

    return actionMatch || detailsMatch || moduleMatch || studentMatch || classMatch || subjectMatch;
  });

  // Group activities into Today, Yesterday, and Earlier
  const groupActivities = (list) => {
    const groups = {
      today: [],
      yesterday: [],
      earlier: []
    };
    
    const now = new Date();
    const todayStr = now.toDateString();
    
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    list.forEach(act => {
      if (!act.created_at) {
        groups.earlier.push(act);
        return;
      }
      const actDate = new Date(act.created_at);
      const actDateStr = actDate.toDateString();
      
      if (actDateStr === todayStr) {
        groups.today.push(act);
      } else if (actDateStr === yesterdayStr) {
        groups.yesterday.push(act);
      } else {
        groups.earlier.push(act);
      }
    });
    
    return groups;
  };

  const groupedActivities = groupActivities(filteredActivities);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 font-sans text-slate-800 dark:text-slate-200 min-h-screen pb-12 relative"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/faculty/dashboard')}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 transition-colors cursor-pointer"
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
          className="self-start md:self-center flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Log
        </button>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search activities by action, details, student name, class, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-450 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 dark:focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>

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
                    ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-500/15 scale-[1.03]' 
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
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
          <div className="flex items-center gap-2 flex-wrap">
            {times.map(t => (
              <button
                key={t.id}
                onClick={() => setTimeFilter(t.id)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  timeFilter === t.id 
                    ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900 shadow-sm scale-[1.03]' 
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
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
          // Professional Shimmering Skeleton Loader
          <div className="relative pl-6 md:pl-12 border-l border-slate-200 dark:border-slate-800 space-y-8 py-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="relative flex flex-col md:flex-row justify-between gap-4 p-4 rounded-2xl border border-transparent animate-pulse">
                {/* Circle bullet skeleton */}
                <div className="absolute -left-[39px] md:-left-[55px] top-4 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900" />
                {/* Details skeleton */}
                <div className="space-y-2.5 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    <div className="h-4.5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  </div>
                  <div className="h-3.5 w-3/4 bg-slate-100 dark:bg-slate-850 rounded-lg" />
                </div>
                {/* Timestamp skeleton */}
                <div className="space-y-1.5 self-start md:self-auto shrink-0 flex flex-col md:items-end">
                  <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-2.5 w-24 bg-slate-100 dark:bg-slate-850 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredActivities.length === 0 ? (
          // Elegant Empty State
          <div className="h-[380px] flex flex-col items-center justify-center text-center p-6">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 flex items-center justify-center text-slate-400 dark:text-slate-600 mb-5 shadow-inner"
            >
              <Search size={32} className="stroke-[1.5]" />
            </motion.div>
            <h4 className="font-extrabold text-slate-850 dark:text-white text-lg">No matching activities found</h4>
            <p className="text-slate-400 dark:text-slate-500 text-xs max-w-sm mt-1.5 font-medium leading-relaxed">
              We couldn't find any logs matching your search term. Try adjusting your query or resetting your filters.
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-purple-500/10"
              >
                Clear Search Query
              </button>
            )}
          </div>
        ) : (
          <div className="relative pl-6 md:pl-12 border-l border-slate-200 dark:border-slate-800 py-2 space-y-10">
            {/* Timeline Groups */}
            {['today', 'yesterday', 'earlier'].map((groupKey) => {
              const groupList = groupedActivities[groupKey];
              if (groupList.length === 0) return null;

              const displayHeader = {
                today: 'Today',
                yesterday: 'Yesterday',
                earlier: 'Earlier'
              }[groupKey];

              return (
                <div key={groupKey} className="space-y-4">
                  {/* Date Header Segment */}
                  <div className="relative -ml-6 md:-ml-12 flex items-center gap-3 py-1 bg-white dark:bg-slate-900 z-10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-3 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-lg shadow-sm">
                      {displayHeader}
                    </span>
                    <div className="flex-1 h-px bg-slate-100 dark:bg-slate-850" />
                  </div>

                  {/* Activities inside group */}
                  <div className="space-y-6">
                    <AnimatePresence>
                      {groupList.map((act, idx) => {
                        const Icon = getActivityIcon(act.module);
                        const colorClass = getActivityColor(act.module);
                        return (
                          <motion.div 
                            key={act.activity_id}
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.8) }}
                            onClick={() => setSelectedActivity(act)}
                            className="relative group flex flex-col md:flex-row md:items-start justify-between gap-4 p-4 rounded-2xl border border-transparent hover:border-slate-150 dark:hover:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-850/20 hover:shadow-sm transition-all duration-200 text-left cursor-pointer"
                          >
                            {/* Circle Bullet Icon */}
                            <div className={`absolute -left-[39px] md:-left-[55px] top-4 p-2.5 rounded-full border-4 border-white dark:border-slate-900 shrink-0 transition-all group-hover:scale-110 shadow-sm ${colorClass}`}>
                              <Icon size={14} className="stroke-[2.5]" />
                            </div>

                            {/* Left: Details */}
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <h4 className="font-extrabold text-slate-800 dark:text-white text-sm leading-tight group-hover:text-purple-650 dark:group-hover:text-purple-400 transition-colors">
                                  {act.action}
                                </h4>
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${colorClass}`}>
                                  {act.module?.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-semibold line-clamp-2">
                                {act.details}
                              </p>

                              {/* Mini Context Badges */}
                              {(act.related_student || act.related_class || act.related_subject) && (
                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                  {act.related_student && (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-50 dark:bg-slate-950 dark:text-slate-400 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-850">
                                      <User size={10} />
                                      {act.related_student}
                                    </span>
                                  )}
                                  {act.related_class && (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-50 dark:bg-slate-950 dark:text-slate-400 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-850">
                                      <Layers size={10} />
                                      {act.related_class}
                                    </span>
                                  )}
                                  {act.related_subject && (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-50 dark:bg-slate-950 dark:text-slate-400 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-850">
                                      <BookOpen size={10} />
                                      {act.related_subject}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Right: Timestamp */}
                            <div className="flex flex-row md:flex-col md:items-end justify-between md:justify-start gap-1 shrink-0 mt-1">
                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                <Clock size={12} className="text-slate-400" />
                                {formatRelativeTime(act.created_at)}
                              </span>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold block">
                                {formatAbsoluteTime(act.created_at)}
                              </span>
                              <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-purple-600 dark:text-purple-400 mt-1 transition-opacity hidden md:flex items-center gap-1">
                                <Eye size={12} />
                                Details
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Premium Sliding Detail Drawer */}
      <AnimatePresence>
        {selectedActivity && (
          <>
            {/* Backdrop blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedActivity(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 cursor-pointer"
            />

            {/* Sliding Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col justify-between"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl border ${getActivityColor(selectedActivity.module)}`}>
                    {React.createElement(getActivityIcon(selectedActivity.module), { size: 16, className: "stroke-[2.5]" })}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Activity Chronicle</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Audit Log Details</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Module Badge & Relative Time Card */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl p-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider block">Logged In Module</span>
                    <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border mt-1.5 ${getActivityColor(selectedActivity.module)}`}>
                      {selectedActivity.module?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider block">Relative Occurrence</span>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 mt-1.5 block">
                      {formatRelativeTime(selectedActivity.created_at)}
                    </span>
                  </div>
                </div>

                {/* Details Section */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider block mb-1">Action Performed</span>
                    <p className="font-extrabold text-slate-850 dark:text-white text-sm bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150/50 dark:border-slate-850/50 p-3.5 rounded-2xl leading-snug">
                      {selectedActivity.action}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider block mb-1">Complete Description</span>
                    <p className="text-xs font-semibold text-slate-650 dark:text-slate-350 leading-relaxed bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150/50 dark:border-slate-850/50 p-4 rounded-2xl whitespace-pre-wrap">
                      {selectedActivity.details}
                    </p>
                  </div>
                </div>

                {/* Academic Context */}
                {(selectedActivity.related_student || selectedActivity.related_class || selectedActivity.related_subject || selectedActivity.related_id) && (
                  <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Academic Context</h4>
                    <div className="grid grid-cols-1 gap-2.5">
                      {selectedActivity.related_student && (
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
                          <span className="text-[10px] text-slate-450 font-bold flex items-center gap-1.5">
                            <Users size={12} className="text-slate-400" />
                            Related Student
                          </span>
                          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                            {selectedActivity.related_student}
                          </span>
                        </div>
                      )}
                      {selectedActivity.related_class && (
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
                          <span className="text-[10px] text-slate-450 font-bold flex items-center gap-1.5">
                            <Layers size={12} className="text-slate-400" />
                            Related Class
                          </span>
                          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                            {selectedActivity.related_class}
                          </span>
                        </div>
                      )}
                      {selectedActivity.related_subject && (
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
                          <span className="text-[10px] text-slate-450 font-bold flex items-center gap-1.5">
                            <BookOpen size={12} className="text-slate-400" />
                            Related Subject
                          </span>
                          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                            {selectedActivity.related_subject}
                          </span>
                        </div>
                      )}
                      {selectedActivity.related_id && (
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
                          <span className="text-[10px] text-slate-450 font-bold flex items-center gap-1.5">
                            <Activity size={12} className="text-slate-400" />
                            System Reference ID
                          </span>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                            #{selectedActivity.related_id}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Timeline Metrics */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp Data</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-center">
                      <span className="text-[9px] text-slate-450 font-bold block uppercase tracking-wider mb-1">Calendar Date</span>
                      <span className="text-xs font-extrabold text-slate-850 dark:text-white">
                        {selectedActivity.created_at ? new Date(selectedActivity.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </span>
                    </div>
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-center">
                      <span className="text-[9px] text-slate-450 font-bold block uppercase tracking-wider mb-1">Exact Time</span>
                      <span className="text-xs font-extrabold text-slate-850 dark:text-white">
                        {selectedActivity.created_at ? new Date(selectedActivity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-5 border-t border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-950/60">
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="w-full py-3 bg-slate-950 dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-slate-750 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer text-center shadow-sm"
                >
                  Close Detail Panel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FacultyActivityStream;
