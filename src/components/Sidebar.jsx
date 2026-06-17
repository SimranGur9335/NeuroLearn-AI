import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Map,
  GraduationCap,
  TrendingUp,
  Compass,
  Trophy,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MessageSquareCode,
  Brain,
  Smile,
  LogOut
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { useAuth } from '../context/AuthContext';
import image from "../assets/image.png";

const THEME_ACCENT_MAP = {
  violet: { accent: 'bg-violet-600 hover:bg-violet-500', hoverText: 'group-hover:text-violet-400', activeTab: 'bg-violet-600 text-white font-semibold shadow-lg shadow-violet-600/30', glow: 'from-violet-400 to-fuchsia-400' },
  rose: { accent: 'bg-rose-600 hover:bg-rose-500', hoverText: 'group-hover:text-rose-400', activeTab: 'bg-rose-600 text-white font-semibold shadow-lg shadow-rose-600/30', glow: 'from-rose-400 to-pink-400' },
  amber: { accent: 'bg-amber-600 hover:bg-amber-500', hoverText: 'group-hover:text-amber-400', activeTab: 'bg-amber-600 text-white font-semibold shadow-lg shadow-amber-600/30', glow: 'from-amber-400 to-yellow-400' },
  indigo: { accent: 'bg-indigo-600 hover:bg-indigo-500', hoverText: 'group-hover:text-indigo-400', activeTab: 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/30', glow: 'from-indigo-400 to-cyan-400' }
};

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { profile } = useStudent();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Domains', path: '/domains', icon: BookOpen },
    { name: 'Interactive Roadmap', path: '/roadmap', icon: Map },
    { name: 'Quiz Arena', path: '/quiz', icon: GraduationCap },
    { name: 'Analytics', path: '/analytics', icon: TrendingUp },
    { name: 'Career Guidance', path: '/career', icon: Compass },
    { name: 'Leaderboard & Badges', path: '/leaderboard', icon: Trophy },
    { name: 'AI Mentor Chat', path: '/ai/chat', icon: MessageSquareCode },
    { name: 'Academic Predictions', path: '/ai/predictions', icon: Brain },
    { name: 'Learning Wellness', path: '/ai/emotions', icon: Smile },
    { name: 'AI Smart Advisor', path: '/ai/recommendations', icon: Sparkles }
  ];

  const theme = THEME_ACCENT_MAP[profile.theme_color] || THEME_ACCENT_MAP.indigo;
  const logoText = profile.college ? (profile.college.split(' ')[0] || 'NeuroLearn') : 'NeuroLearn';

  return (
    <motion.aside
      className="hidden md:flex flex-col bg-slate-900 border-r border-slate-800 text-slate-300 relative h-screen sticky top-0"
      animate={{ width: isCollapsed ? '70px' : '260px' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Sidebar Header/Logo */}
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
                <img src={image} alt="Logo" className="w-8 h-8 object-contain rounded-lg bg-slate-950 p-0.5 shrink-0" />
              ) : (
                <div className={`${theme.accent} p-1.5 rounded-lg text-white shrink-0`}>
                  <Sparkles size={20} className="animate-pulse" />
                </div>
              )}
              <span className={`font-extrabold text-lg bg-gradient-to-r ${theme.glow} bg-clip-text text-transparent`}>
                {logoText} AI
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {isCollapsed && (
          profile.logo_url ? (
            <img src={image} alt="Logo" className="w-8 h-8 object-contain rounded-lg mx-auto bg-slate-950 p-0.5" />
          ) : (
            <div className={`${theme.accent} p-1.5 rounded-lg text-white mx-auto`}>
              <Sparkles size={20} />
            </div>
          )
        )}
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                  ? theme.activeTab
                  : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <IconComponent size={20} className="shrink-0" />
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

      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute bottom-20 -right-3 ${theme.accent} text-white p-1 rounded-full border border-slate-900 shadow-md cursor-pointer z-50`}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* User Footer Profile & Change Role Trigger */}
      <div
        onClick={() => navigate('/profile')}
        className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center gap-3 cursor-pointer hover:bg-slate-850 transition-colors group"
      >
        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg shrink-0 border border-slate-700 relative">
          {profile.avatar}
          <button
            onClick={(e) => {
              e.stopPropagation();
              logout();
            }}
            className="absolute -bottom-1 -right-1 bg-red-500 hover:bg-red-650 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-slate-900"
            title="Log Out"
          >
            <LogOut size={8} />
          </button>
        </div>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 min-w-0"
          >
            <p className={`text-sm font-semibold text-white truncate ${theme.hoverText} transition-colors`}>{profile.name}</p>
            <p className="text-xs text-slate-400 truncate group-hover:text-slate-200 transition-colors">View Profile & Settings</p>
          </motion.div>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
