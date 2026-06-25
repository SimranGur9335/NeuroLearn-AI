import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  AlertTriangle,
  CalendarDays,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  Bell,
  ClipboardList,
  FileSpreadsheet,
  GraduationCap,
  User,
  Activity
} from 'lucide-react';
import Header from './Header';
import { useStudent } from '../context/StudentContext';
import { useAuth } from '../context/AuthContext';
const GRADIENT_THEMES = {
  violet: {
    gradient: "from-violet-900 via-slate-950 to-slate-950",
    textGradient: "from-violet-400 to-fuchsia-400",
    accent: "bg-violet-600 text-white font-semibold shadow-lg shadow-violet-600/30",
    toggle: "bg-violet-600 hover:bg-violet-500",
  },
  rose: {
    gradient: "from-rose-900 via-slate-950 to-slate-950",
    textGradient: "from-rose-400 to-pink-400",
    accent: "bg-rose-600 text-white font-semibold shadow-lg shadow-rose-600/30",
    toggle: "bg-rose-600 hover:bg-rose-500",
  },
  amber: {
    gradient: "from-amber-900 via-slate-950 to-slate-950",
    textGradient: "from-amber-400 to-yellow-400",
    accent: "bg-amber-600 text-white font-semibold shadow-lg shadow-amber-600/30",
    toggle: "bg-amber-600 hover:bg-amber-500",
  },
  indigo: {
    gradient: "from-indigo-900 via-slate-950 to-slate-950",
    textGradient: "from-indigo-400 to-cyan-400",
    accent: "bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/30",
    toggle: "bg-indigo-600 hover:bg-indigo-500",
  }
};

const FacultyLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { profile } = useStudent();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Faculty Hub', path: '/faculty/dashboard', icon: LayoutDashboard },
    { name: 'Attendance Registry', path: '/faculty/attendance', icon: CalendarDays },
    { name: 'Student Monitoring', path: '/faculty/performance', icon: Users },
    { name: 'Assignment Management', path: '/faculty/assignments', icon: ClipboardList },
    { name: 'Marks & Gradebook', path: '/faculty/gradebook', icon: FileSpreadsheet },
    { name: 'Faculty Analytics', path: '/faculty/analytics', icon: TrendingUp },
    { name: 'Risk Predictions', path: '/faculty/risk', icon: AlertTriangle },
    { name: 'Remedial Sessions', path: '/faculty/remedial', icon: GraduationCap },
    { name: "Announcements", path: '/faculty/announcements', icon: Bell },
    { name: 'Activity Stream', path: '/faculty/activity', icon: Activity },
    { name: 'My Profile', path: `/faculty/profile`, icon: User }
  ];

  const handleLogout = () => {
    logout();
  };

  const currentTheme = GRADIENT_THEMES[profile.theme_color] || GRADIENT_THEMES.indigo;
  const logoText = profile.college ? (profile.college.split(' ')[0] || 'NeuroLearn') : 'NeuroLearn';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-150">
      {/* Faculty Sidebar */}
      <motion.aside
        className="hidden md:flex flex-col bg-slate-900 border-r border-slate-800 text-slate-300 relative h-screen sticky top-0"
        animate={{ width: isCollapsed ? '70px' : '260px' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Header/Logo */}
        <div className="flex items-center justify-between p-4 h-16 border-b border-slate-800 bg-slate-950">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                {profile.logo_url ? (
                  <img src={profile.logo_url} alt="Logo" className="w-8 h-8 object-contain rounded-lg bg-slate-950 p-0.5 shrink-0" />
                ) : (
                  <div className={`p-1.5 rounded-lg text-white bg-gradient-to-br ${currentTheme.gradient}`}>
                    <Sparkles size={20} className="animate-pulse" />
                  </div>
                )}
                <span className={`font-extrabold text-base bg-gradient-to-r ${currentTheme.textGradient} bg-clip-text text-transparent`}>
                  {logoText} Faculty
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {isCollapsed && (
            profile.logo_url ? (
              <img src={profile.logo_url} alt="Logo" className="w-8 h-8 object-contain rounded-lg mx-auto bg-slate-950 p-0.5" />
            ) : (
              <div className={`p-1.5 rounded-lg text-white mx-auto bg-gradient-to-br ${currentTheme.gradient}`}>
                <Sparkles size={20} />
              </div>
            )
          )}
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                    ? currentTheme.accent
                    : 'hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon size={20} className="shrink-0" />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm tracking-wide"
                  >
                    {item.name}
                  </motion.span>
                )}
                {isCollapsed && (
                  <div className="absolute left-16 bg-slate-950 text-white text-xs px-2 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 whitespace-nowrap shadow-md border border-slate-800">
                    {item.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Collapsible toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute bottom-20 -right-3 ${currentTheme.toggle} text-white p-1 rounded-full border border-slate-900 shadow-md cursor-pointer z-50`}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logout bottom */}
        <div
          onClick={handleLogout}
          className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center gap-3 cursor-pointer hover:bg-slate-800/20 text-slate-400 hover:text-white transition-colors"
        >
          <LogOut size={20} className="shrink-0 text-red-500" />
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs font-semibold"
            >
              Log Out Faculty
            </motion.span>
          )}
        </div>
      </motion.aside>

      {/* Page Content layout pane */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        {/* Unified Top Header bar */}
        <Header />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default FacultyLayout;
