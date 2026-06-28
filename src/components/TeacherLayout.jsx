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
import { useBranding } from '../context/BrandingContext';
import defaultLogo from '../assets/image.png';
const GRADIENT_THEMES = {
  violet: {
    gradient: "from-slate-50 to-white",
    textGradient: "from-indigo-600 to-purple-600",
    accent: "bg-indigo-50 text-indigo-750 font-semibold border-l-2 border-indigo-600 shadow-sm",
    toggle: "bg-white text-slate-400 border border-slate-200 hover:text-slate-800 hover:bg-slate-50",
  },
  rose: {
    gradient: "from-slate-50 to-white",
    textGradient: "from-indigo-600 to-purple-600",
    accent: "bg-indigo-50 text-indigo-750 font-semibold border-l-2 border-indigo-600 shadow-sm",
    toggle: "bg-white text-slate-400 border border-slate-200 hover:text-slate-800 hover:bg-slate-50",
  },
  amber: {
    gradient: "from-slate-50 to-white",
    textGradient: "from-indigo-600 to-purple-600",
    accent: "bg-indigo-50 text-indigo-750 font-semibold border-l-2 border-indigo-600 shadow-sm",
    toggle: "bg-white text-slate-400 border border-slate-200 hover:text-slate-800 hover:bg-slate-50",
  },
  indigo: {
    gradient: "from-slate-50 to-white",
    textGradient: "from-indigo-600 to-purple-600",
    accent: "bg-indigo-50 text-indigo-750 font-semibold border-l-2 border-indigo-600 shadow-sm",
    toggle: "bg-white text-slate-400 border border-slate-200 hover:text-slate-800 hover:bg-slate-50",
  }
};

const FacultyLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { profile } = useStudent();
  const { logout } = useAuth();
  const { branding } = useBranding();
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

  const currentTheme = GRADIENT_THEMES[branding.themeColor] || GRADIENT_THEMES.indigo;
  const logoText = branding.institutionName ? (branding.institutionName.split(' ')[0] || 'NeuroLearn') : 'NeuroLearn';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800">
      {/* Faculty Sidebar */}
      <motion.aside
        className="hidden md:flex flex-col bg-white border-r border-slate-200 text-slate-650 relative h-screen sticky top-0"
        animate={{ width: isCollapsed ? '72px' : '250px' }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header/Logo */}
        <div className="flex items-center justify-between p-4 h-16 border-b border-slate-200 bg-slate-50">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                <img 
                  src={branding.logoUrl || defaultLogo} 
                  onError={(e) => { e.target.src = defaultLogo; }}
                  alt="Logo" 
                  className="w-7 h-7 object-contain rounded-lg bg-slate-100 p-0.5 shrink-0" 
                />
                <span className="font-extrabold text-sm tracking-tight text-slate-800">
                  {logoText} <span className="text-slate-400 font-medium">Faculty</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {isCollapsed && (
            <img 
              src={branding.logoUrl || defaultLogo} 
              onError={(e) => { e.target.src = defaultLogo; }}
              alt="Logo" 
              className="w-7 h-7 object-contain rounded-lg mx-auto bg-slate-100 p-0.5" 
            />
          )}
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative text-xs ${isActive
                    ? currentTheme.accent
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <Icon size={16} className="shrink-0 transition-transform group-hover:scale-105" />
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

        {/* Collapsible toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute bottom-20 -right-3 w-6 h-6 flex items-center justify-center bg-white text-slate-400 border border-slate-200 hover:text-slate-800 rounded-full shadow-sm hover:shadow cursor-pointer z-50 transition-all"
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        {/* Logout bottom */}
        <div
          onClick={handleLogout}
          className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-3 cursor-pointer hover:bg-slate-100 transition-colors group"
        >
          <LogOut size={16} className="shrink-0 text-brand-danger" />
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs font-semibold text-slate-800"
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

