import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  GitPullRequest,
  School,
  Users,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import Header from './Header';
import { useAuth } from '../context/AuthContext';

const PlatformAdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/platform-admin/dashboard', icon: LayoutDashboard },
    { name: 'Onboarding Requests', path: '/platform-admin/requests', icon: GitPullRequest },
    { name: 'Institutions', path: '/platform-admin/institutions', icon: School },
    { name: 'Users Directory', path: '/platform-admin/users', icon: Users },
    { name: 'Global Settings', path: '/platform-admin/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-150">
      {/* Platform Owner Sidebar */}
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
                <div className="p-1.5 rounded-lg text-white bg-gradient-to-br from-indigo-600 to-cyan-500">
                  <Sparkles size={20} className="animate-pulse" />
                </div>
                <span className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                  Platform Admin
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {isCollapsed && (
            <div className="p-1.5 rounded-lg text-white mx-auto bg-gradient-to-br from-indigo-600 to-cyan-500">
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
                      ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/30' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
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
          className="absolute bottom-20 -right-3 bg-indigo-600 hover:bg-indigo-500 text-white p-1 rounded-full border border-slate-900 shadow-md cursor-pointer z-50"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logout bottom */}
        <div 
          onClick={logout}
          className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center gap-3 cursor-pointer hover:bg-slate-800/20 text-slate-400 hover:text-white transition-colors"
        >
          <LogOut size={20} className="shrink-0 text-red-500" />
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs font-semibold"
            >
              Sign Out Owner
            </motion.span>
          )}
        </div>
      </motion.aside>

      {/* Page Content layout pane */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        {/* Unified Top Header bar */}
        <Header />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PlatformAdminLayout;
