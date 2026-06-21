import React, { useState } from 'react';
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
  AlertCircle
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
  const location = useLocation();
  const navigate = useNavigate();

  const notifications = [
    { id: 1, text: "Prof. Verma assigned the 'Generative AI & LLMs' quiz.", time: "10m ago", read: false },
    { id: 2, text: "Streak Alert! 7 Days of learning. Keep it up! 🔥", time: "2h ago", read: false },
    { id: 3, text: "Earned badge: 'Week of Fire'!", time: "1d ago", read: true }
  ];

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
    
    // Faculty Portal Paths
    if (path.startsWith('/faculty')) {
      if (path.includes('dashboard')) return 'Faculty Analytics Console';
      if (path.includes('performance')) return 'Student Performance Monitoring';
      if (path.includes('analytics')) return 'LMS Academic Analytics';
      if (path.includes('risk')) return 'At-Risk Early Warnings';
      if (path.includes('attendance')) return 'Attendance Registry Matrix';
      if (path.includes('ai-chat')) return 'Research & Faculty AI Assistant';
      return 'Faculty Workspace';
    }

    // Admin Portal Paths
    if (path.startsWith('/admin')) {
      if (path.includes('dashboard')) return 'Institutional Controller Dashboard';
      if (path.includes('users')) return 'User Directory & Control';
      if (path.includes('courses')) return 'Curriculum & Course Catalogue';
      if (path.includes('reports')) return 'Institutional Performance Reports';
      if (path.includes('system')) return 'System Logs & Infrastructure Health';
      return 'Admin Portal';
    }

    // AI Student Paths
    if (path.startsWith('/ai')) {
      if (path.includes('chat')) return 'AI Personal Mentor';
      if (path.includes('predictions')) return 'Academic Predictors';
      if (path.includes('emotions')) return 'Sentiment & Focus Analytics';
      if (path.includes('recommendations')) return 'Curriculum Recommendation Engine';
    }

    // Student Portal Paths
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
            {/* XP Trophy */}
            <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-3 py-1.5 rounded-full border border-yellow-500/20 text-sm font-bold shadow-sm">
              <Trophy size={16} />
              <span>{xp} XP</span>
            </div>

            {/* Streak Fire */}
            <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-600 dark:text-orange-500 px-3 py-1.5 rounded-full border border-orange-500/20 text-sm font-bold shadow-sm animate-fire">
              <Flame size={16} />
              <span>{streak}d</span>
            </div>

            {/* Hearts Life (Duolingo style) */}
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
            {/* Institution Badge */}
            <div className="hidden lg:flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/20 text-xs font-extrabold tracking-wide uppercase">
              <span>{profile.college}</span>
            </div>
            {/* Server load indicator */}
            <div className="hidden sm:flex items-center gap-1.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-3 py-1.5 rounded-full border border-cyan-500/20 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-mono">Sys: Active</span>
            </div>
            {/* Role designation */}
            <div className="bg-emerald-600 text-white text-[10px] font-black tracking-widest uppercase px-3.5 py-1.5 rounded-full shadow-md">
              System Admin
            </div>
          </>
        )}

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition-colors cursor-pointer"
          >
            <Bell size={18} />
            {notifications.some(n => !n.read) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full animate-ping" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 font-bold border-b border-slate-100 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-400 flex justify-between items-center">
                <span>System Notifications</span>
                <button className="text-[10px] text-indigo-500 hover:underline cursor-pointer">Mark all read</button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map(item => (
                  <div key={item.id} className={`p-3 text-xs leading-relaxed hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${!item.read ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''}`}>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">{item.text}</p>
                    <span className="text-[10px] text-slate-400 block mt-1">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
