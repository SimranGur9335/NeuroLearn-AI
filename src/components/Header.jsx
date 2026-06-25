import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Flame, 
  Heart, 
  Trophy, 
  Bell, 
  Sun, 
  Moon, 
  Menu, 
  X,
  Sparkles,
  Award,
  AlertCircle,
  Calendar,
  Clipboard,
  FileText,
  AlertTriangle,
  GraduationCap,
  Trash2,
  Check
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';

const Header = () => {
  const { 
    role,
    xp, 
    streak, 
    hearts, 
    refillHearts, 
    searchTerm, 
    setSearchTerm, 
    darkMode, 
    toggleDarkMode,
    profile
  } = useStudent();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showHeartsModal, setShowHeartsModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    if (role !== 'faculty' || !profile?.id) return;
    setLoadingNotifications(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/faculty/${profile.id}/notifications`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (role === 'faculty' && profile?.id) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    } else if (role === 'student') {
      // Mock student notifications
      setNotifications([
        { notification_id: 1, title: "Assignment Due", message: "Prof. Verma assigned the 'Generative AI & LLMs' quiz.", is_read: false, created_at: new Date(Date.now() - 600000).toISOString(), type: 'assignment' },
        { notification_id: 2, title: "Streak Alert", message: "Streak Alert! 7 Days of learning. Keep it up! 🔥", is_read: false, created_at: new Date(Date.now() - 7200000).toISOString(), type: 'streak' },
        { notification_id: 3, title: "Badge Earned", message: "Earned badge: 'Week of Fire'!", is_read: true, created_at: new Date(Date.now() - 86400000).toISOString(), type: 'badge' }
      ]);
    }
  }, [role, profile?.id]);

  const handleMarkRead = async (id) => {
    if (role !== 'faculty') {
      setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
      return;
    }
    try {
      const res = await fetch(`http://localhost:8000/api/v1/faculty/notifications/${id}/read`, {
        method: 'PATCH'
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
      }
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    if (role !== 'faculty') {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      return;
    }
    try {
      const res = await fetch(`http://localhost:8000/api/v1/faculty/${profile.id}/notifications/read-all`, {
        method: 'PATCH'
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      }
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (role !== 'faculty') {
      setNotifications(prev => prev.filter(n => n.notification_id !== id));
      return;
    }
    try {
      const res = await fetch(`http://localhost:8000/api/v1/faculty/notifications/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.notification_id !== id));
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const handleNotificationClick = (item) => {
    handleMarkRead(item.notification_id);
    setShowNotifications(false);
    if (role !== 'faculty') return;
    
    switch (item.type) {
      case 'attendance':
        navigate('/faculty/attendance');
        break;
      case 'assignment':
        navigate('/faculty/assignments');
        break;
      case 'gradebook':
        navigate('/faculty/gradebook');
        break;
      case 'risk':
        navigate('/faculty/risk');
        break;
      case 'remedial':
        navigate('/faculty/remedial');
        break;
      case 'announcement':
        navigate('/faculty/announcements');
        break;
      default:
        navigate('/faculty/dashboard');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'attendance': return Calendar;
      case 'assignment': return Clipboard;
      case 'gradebook': return FileText;
      case 'risk': return AlertCircle;
      case 'remedial': return GraduationCap;
      case 'announcement': return Bell;
      default: return Bell;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'attendance': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case 'assignment': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'gradebook': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case 'risk': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
      case 'remedial': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      case 'announcement': return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400';
      default: return 'bg-slate-500/10 text-slate-600 dark:text-slate-400';
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  const handleRefillHearts = () => {
    if (xp >= 150) {
      refillHearts();
      setShowHeartsModal(false);
    } else {
      alert("Insufficient XP! You need 150 XP to buy a life refill.");
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path.startsWith('/faculty')) {
      if (path.includes('dashboard')) return 'Faculty Hub & Productivity Center';
      if (path.includes('performance')) return 'Student Performance Monitoring';
      if (path.includes('analytics')) return 'LMS Academic Analytics';
      if (path.includes('risk')) return 'At-Risk Early Warnings';
      if (path.includes('attendance')) return 'Attendance Registry Matrix';
      if (path.includes('ai-chat')) return 'Research & Faculty AI Assistant';
      if (path.includes('activity')) return 'Faculty Activity Stream';
      return 'Faculty Workspace';
    }

    if (path.startsWith('/admin')) {
      if (path.includes('dashboard')) return 'Institutional Controller Dashboard';
      if (path.includes('users')) return 'User Directory & Control';
      if (path.includes('courses')) return 'Curriculum & Course Catalogue';
      if (path.includes('reports')) return 'Institutional Performance Reports';
      if (path.includes('system')) return 'System Logs & Infrastructure Health';
      return 'Admin Portal';
    }

    if (path.startsWith('/ai')) {
      if (path.includes('chat')) return 'AI Personal Mentor';
      if (path.includes('predictions')) return 'Academic Predictors';
      if (path.includes('emotions')) return 'Sentiment & Focus Analytics';
    }

    if (path.includes('/student-hub/predictions')) {
      return 'Academic Outcome Forecasts';
    }

    if (path.includes('dashboard')) return 'Engineering Student Hub';
    if (path.includes('domains')) return 'Academic Learning Domains';
    if (path.includes('roadmap')) return 'Dynamic Roadmap Track';
    if (path.includes('quiz')) return 'Quiz Skill Evaluation';
    if (path.includes('analytics')) return 'Personal Performance Dashboard';
    if (path.includes('career')) return 'Career Tracks & Certifications';
    if (path.includes('leaderboard')) return 'Campus Leaderboard';
    return profile.college || 'COEP Technological University';
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Domains', path: '/domains' },
    { name: 'Roadmap', path: '/roadmap' },
    { name: 'Quiz Arena', path: '/quiz' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Career', path: '/career' },
    { name: 'Leaderboard', path: '/leaderboard' },
  ];

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="glass-nav px-4 md:px-8 py-3 flex items-center justify-between border-slate-200 dark:border-slate-800/80">
      {/* Title & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
        >
          <Menu size={22} />
        </button>
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            {getPageTitle()}
          </h2>
        </div>
      </div>

      {/* Global Search Bar (Notion style) */}
      <div className="hidden lg:flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 px-3 py-2 rounded-xl w-80 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all duration-200">
        <Search size={18} className="text-slate-400 dark:text-slate-500" />
        <input 
          type="text" 
          placeholder="Search courses, concepts, paths..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none w-full text-sm"
        />
      </div>

      {/* Stats and Controls */}
      <div className="flex items-center gap-2 md:gap-4">
        {role === 'student' ? (
          <>
            <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-3 py-1.5 rounded-full border border-yellow-500/20 text-sm font-bold shadow-sm">
              <Trophy size={16} />
              <span>{xp} XP</span>
            </div>

            <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-600 dark:text-orange-500 px-3 py-1.5 rounded-full border border-orange-500/20 text-sm font-bold shadow-sm animate-fire">
              <Flame size={16} />
              <span>{streak}d</span>
            </div>

            <button 
              onClick={() => setShowHeartsModal(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-bold shadow-sm transition-all duration-200 cursor-pointer ${
                hearts === 0 
                  ? 'bg-red-500/20 text-red-500 border-red-500/30 animate-pulse' 
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:scale-105'
              }`}
            >
              <Heart size={16} className={hearts > 0 ? "fill-current animate-heart" : "text-red-500"} />
              <span>{hearts}</span>
            </button>
          </>
        ) : role === 'faculty' ? (
          <>
            {/* Academic Year Badge */}
            <div className="hidden lg:flex items-center gap-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-full border border-indigo-500/20 text-xs font-extrabold tracking-wide uppercase">
              <span>AY 2026-27 · Term I</span>
            </div>
            {/* Department Badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 px-3 py-1.5 rounded-full border border-purple-500/20 text-xs font-extrabold tracking-wide uppercase">
              <span>{profile.branch}</span>
            </div>
            {/* Role designation */}
            <div className="bg-purple-600 text-white text-[10px] font-black tracking-widest uppercase px-3.5 py-1.5 rounded-full shadow-md">
              Faculty
            </div>
          </>
        ) : (
          <>
            <div className="hidden lg:flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/20 text-xs font-extrabold tracking-wide uppercase">
              <span>{profile.college}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-3 py-1.5 rounded-full border border-cyan-500/20 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-mono">Sys: Active</span>
            </div>
            <div className="bg-emerald-600 text-white text-[10px] font-black tracking-widest uppercase px-3.5 py-1.5 rounded-full shadow-md">
              System Admin
            </div>
          </>
        )}

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(true)}
            className="relative p-2.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition-colors cursor-pointer"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white dark:border-slate-900 animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleDarkMode}
          className="p-2.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition-colors cursor-pointer"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Hearts/Life refill Dialog */}
      {showHeartsModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl relative">
            <button 
              onClick={() => setShowHeartsModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X size={20} />
            </button>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 text-3xl mb-4">
                <Heart className="fill-current animate-heart" />
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white">Life Refill Depot</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Running low on hearts? Buy a full 3-heart refill using your hard-earned study XP!
              </p>
              
              <div className="my-6 bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="text-left">
                  <span className="text-xs text-slate-400 block">Cost</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">150 XP</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Your Balance</span>
                  <span className="font-bold text-yellow-500">{xp} XP</span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setShowHeartsModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRefillHearts}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-500/20 transition-all cursor-pointer"
                >
                  Refill Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Drawer (Side-sheet) */}
      {showNotifications && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div 
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowNotifications(false)} 
          />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-50 border-l border-slate-200 dark:border-slate-800 transition-all duration-300">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Bell className="text-indigo-600 dark:text-indigo-400 animate-pulse" size={20} />
                <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2.5 py-0.5 rounded-full font-black">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {notifications.length > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-extrabold flex items-center gap-1 cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 dark:bg-slate-950/20">
              {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
                    <Bell size={28} />
                  </div>
                  <p className="font-bold text-slate-700 dark:text-slate-300">All caught up!</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">No new notifications at the moment.</p>
                </div>
              ) : (
                notifications.map(item => {
                  const Icon = getNotificationIcon(item.type);
                  const colorClass = getNotificationColor(item.type);
                  return (
                    <div 
                      key={item.notification_id}
                      onClick={() => handleNotificationClick(item)}
                      className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex gap-3 ${
                        !item.is_read 
                          ? 'bg-indigo-50/20 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20' 
                          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-850/30'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl shrink-0 ${colorClass}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-black ${!item.is_read ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                            {item.title}
                          </p>
                          {!item.is_read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1 animate-ping" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {item.message}
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-2">
                          {formatTime(item.created_at)}
                        </span>
                      </div>
                      
                      {/* Delete Button */}
                      <button 
                        onClick={(e) => handleDelete(item.notification_id, e)}
                        className="absolute right-3 bottom-3 p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer"
                        title="Delete notification"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Responsive Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-950/60" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex flex-col w-64 bg-slate-900 text-slate-300 h-full p-5 border-r border-slate-800 z-50">
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-indigo-400" />
                <span className="font-bold text-white">NeuroLearn AI</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 mt-6 space-y-2">
              {menuItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => 
                    `block px-4 py-3 rounded-xl transition-colors ${
                      isActive 
                        ? 'bg-indigo-600 text-white font-semibold' 
                        : 'hover:bg-slate-800'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>
            <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
              <span className="text-xl">{profile.avatar}</span>
              <div>
                <p className="text-sm font-semibold text-white">{profile.name}</p>
                <p className="text-xs text-slate-400">{profile.branch}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
