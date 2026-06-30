import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Library,
  BookOpen,
  Map,
  GraduationCap,
  TrendingUp,
  Compass,
  Trophy,
  MessageSquareCode,
  Smile,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
  User
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import image from "../assets/image.png";

const THEME_ACCENT_MAP = {
  violet: { 
    accent: 'bg-indigo-700 hover:bg-indigo-600', 
    hoverText: 'group-hover:text-indigo-500 dark:group-hover:text-indigo-400', 
    activeTab: 'bg-gradient-to-r from-indigo-500/10 to-violet-500/5 dark:from-indigo-500/15 dark:to-violet-500/5 text-indigo-700 dark:text-indigo-300 font-semibold border-l-4 border-indigo-600 dark:border-indigo-400 shadow-sm', 
    glow: 'from-indigo-400 to-violet-400' 
  },
  rose: { 
    accent: 'bg-brand-danger hover:bg-rose-500', 
    hoverText: 'group-hover:text-brand-danger dark:group-hover:text-brand-danger/90', 
    activeTab: 'bg-gradient-to-r from-red-500/10 to-rose-500/5 dark:from-red-500/15 dark:to-rose-500/5 text-brand-danger dark:text-brand-danger font-semibold border-l-4 border-brand-danger shadow-sm', 
    glow: 'from-brand-danger to-pink-400' 
  },
  amber: { 
    accent: 'bg-brand-accent hover:bg-amber-500', 
    hoverText: 'group-hover:text-brand-accent dark:group-hover:text-brand-accent/90', 
    activeTab: 'bg-gradient-to-r from-amber-500/10 to-yellow-500/5 dark:from-amber-500/15 dark:to-yellow-500/5 text-brand-accent dark:text-brand-accent font-semibold border-l-4 border-brand-accent shadow-sm', 
    glow: 'from-brand-accent to-yellow-400' 
  },
  indigo: { 
    accent: 'bg-brand-primary hover:bg-indigo-500', 
    hoverText: 'group-hover:text-brand-primary dark:group-hover:text-brand-primary/90', 
    activeTab: 'bg-gradient-to-r from-brand-primary/10 to-brand-secondary/5 dark:from-brand-primary/15 dark:to-brand-secondary/5 text-brand-primary dark:text-violet-400 font-semibold border-l-4 border-brand-primary dark:border-brand-primary shadow-sm', 
    glow: 'from-brand-primary to-brand-secondary' 
  }
};

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { profile } = useStudent();
  const { logout } = useAuth();
  const { branding } = useBranding();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Student Hub', path: '/student-hub', icon: Library },
    { name: 'Domains', path: '/domains', icon: BookOpen },
    { name: 'Interactive Roadmap', path: '/roadmap', icon: Map },
    { name: 'Quiz Arena', path: '/quiz', icon: GraduationCap },
    { name: 'Analytics', path: '/analytics', icon: TrendingUp },
    { name: 'Career Journey', path: '/career', icon: Compass },
    { name: 'Career Profile', path: '/career/profile', icon: User },
    { name: 'Leaderboard & Badges', path: '/leaderboard', icon: Trophy },
    { name: 'AI Mentor Chat', path: '/ai/chat', icon: MessageSquareCode },
    { name: 'Learning Wellness', path: '/ai/wellness', icon: Smile }
  ];

  const theme = THEME_ACCENT_MAP[branding.themeColor] || THEME_ACCENT_MAP.indigo;
  const logoText = branding.institutionName ? (branding.institutionName.split(' ')[0] || 'NeuroLearn') : 'NeuroLearn';

  return (
    <motion.aside
      className="hidden md:flex flex-col bg-white dark:bg-brand-card border-r border-slate-200 dark:border-brand-border text-slate-600 dark:text-brand-muted relative h-screen sticky top-0"
      animate={{ width: isCollapsed ? '72px' : '250px' }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Sidebar Header/Logo */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-slate-200 dark:border-brand-border bg-slate-50 dark:bg-brand-dark/40">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2"
            >
              <img 
                src={branding.logoUrl || image} 
                onError={(e) => { e.target.src = image; }}
                alt="Logo" 
                className="w-7 h-7 object-contain rounded-lg bg-slate-100 dark:bg-brand-dark p-0.5 shrink-0" 
              />
              <span className="font-extrabold text-sm tracking-tight text-slate-800 dark:text-white">
                {logoText} <span className="text-slate-400 font-medium">AI</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {isCollapsed && (
          <img 
            src={branding.logoUrl || image} 
            onError={(e) => { e.target.src = image; }}
            alt="Logo" 
            className="w-7 h-7 object-contain rounded-lg mx-auto bg-slate-100 dark:bg-brand-dark p-0.5" 
          />
        )}
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative text-xs ${isActive
                  ? theme.activeTab
                  : 'text-slate-500 hover:text-slate-900 dark:text-brand-muted dark:hover:text-white hover:bg-slate-100 dark:hover:bg-brand-cardlight/50'
                }`
              }
            >
              <IconComponent size={16} className="shrink-0 transition-transform group-hover:scale-105" />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="tracking-normal font-medium"
                >
                  {item.name}
                </motion.span>
              )}
              {isCollapsed && (
                <div className="absolute left-16 bg-slate-950 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 whitespace-nowrap shadow-md border border-brand-border">
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
        className="absolute bottom-20 -right-3 w-6 h-6 flex items-center justify-center bg-white dark:bg-brand-card text-slate-400 dark:text-brand-muted border border-slate-200 dark:border-brand-border hover:text-slate-800 dark:hover:text-white rounded-full shadow-sm hover:shadow cursor-pointer z-50 transition-all"
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* User Footer Profile & Change Role Trigger */}
      <div
        onClick={() => navigate('/profile')}
        className="p-4 border-t border-slate-200 dark:border-brand-border bg-slate-50 dark:bg-brand-dark/20 flex items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-brand-cardlight/30 transition-colors group"
      >
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-brand-cardlight flex items-center justify-center text-sm shrink-0 border border-slate-200 dark:border-brand-border relative">
          {profile.avatar}
          <button
            onClick={(e) => {
              e.stopPropagation();
              logout();
            }}
            className="absolute -bottom-1 -right-1 bg-brand-danger hover:bg-red-650 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-white dark:border-brand-card"
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
            <p className="text-xs font-semibold text-slate-800 dark:text-white truncate transition-colors">{profile.name}</p>
            <p className="text-[10px] text-slate-400 dark:text-brand-muted truncate transition-colors">Profile & Settings</p>
          </motion.div>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;

