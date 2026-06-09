import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CalendarDays, 
  MessageSquareCode,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import Header from './Header';
import { useStudent } from '../context/StudentContext';
import { useAuth } from '../context/AuthContext';
import { COLLEGE_THEMES } from '../data/academicData';

const TeacherLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { profile, institution } = useStudent();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Teacher Hub', path: '/teacher/dashboard', icon: LayoutDashboard },
    { name: 'Student Monitoring', path: '/teacher/performance', icon: Users },
    { name: 'LMS Analytics', path: '/teacher/analytics', icon: TrendingUp },
    { name: 'Risk Predictions', path: '/teacher/risk', icon: AlertTriangle },
    { name: 'Attendance Registry', path: '/teacher/attendance', icon: CalendarDays },
    { name: 'Faculty AI Mentor', path: '/teacher/ai-chat', icon: MessageSquareCode },
  ];

  const handleLogout = () => {
    logout();
  };

  const currentTheme = COLLEGE_THEMES[institution] || COLLEGE_THEMES.coep;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-150">
      {/* Faculty Sidebar */}
      <motion.aside
        className="hidden md:flex flex-col bg-slate-900 border-r border-slate-800 text-slate-350 relative h-screen sticky top-0"
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
                <div className={`p-1.5 rounded-lg text-white bg-gradient-to-br ${currentTheme.color}`}>
                  <Sparkles size={20} className="animate-pulse" />
                </div>
                <span className={`font-extrabold text-base bg-gradient-to-r ${currentTheme.color} bg-clip-text text-transparent`}>
                  {currentTheme.logoText} Faculty
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {isCollapsed && (
            <div className={`p-1.5 rounded-lg text-white mx-auto bg-gradient-to-br ${currentTheme.color}`}>
              <Sparkles size={20} />
            </div>
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
                  `flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                    isActive 
                      ? 'bg-purple-600 text-white font-semibold shadow-lg shadow-purple-600/30' 
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
          className="absolute bottom-20 -right-3 bg-purple-600 hover:bg-purple-500 text-white p-1 rounded-full border border-slate-900 shadow-md cursor-pointer z-50"
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

export default TeacherLayout;
