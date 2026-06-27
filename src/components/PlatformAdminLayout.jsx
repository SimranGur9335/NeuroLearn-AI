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
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-brand-dark text-slate-800 dark:text-slate-150">
      {/* Platform Owner Sidebar */}
      <motion.aside
        className="hidden md:flex flex-col bg-white dark:bg-brand-card border-r border-slate-200 dark:border-brand-border text-slate-650 dark:text-brand-muted relative h-screen sticky top-0"
        animate={{ width: isCollapsed ? '72px' : '250px' }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header/Logo */}
        <div className="flex items-center justify-between p-4 h-16 border-b border-slate-200 dark:border-brand-border bg-slate-50 dark:bg-brand-dark/40">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                <div className="p-1.5 rounded-lg text-white bg-brand-primary">
                  <Sparkles size={16} />
                </div>
                <span className="font-extrabold text-sm tracking-tight text-slate-800 dark:text-white">
                  Platform <span className="text-slate-400 font-medium">Owner</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {isCollapsed && (
            <div className="p-1.5 rounded-lg text-white mx-auto bg-brand-primary">
              <Sparkles size={16} />
            </div>
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
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative text-xs ${
                    isActive 
                      ? 'bg-brand-primary/5 dark:bg-brand-primary/10 text-brand-primary font-semibold border-l-2 border-brand-primary shadow-sm' 
                      : 'text-slate-500 hover:text-slate-900 dark:text-brand-muted dark:hover:text-white hover:bg-slate-100 dark:hover:bg-brand-cardlight/50'
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
          className="absolute bottom-20 -right-3 w-6 h-6 flex items-center justify-center bg-white dark:bg-brand-card text-slate-400 dark:text-brand-muted border border-slate-200 dark:border-brand-border hover:text-slate-800 dark:hover:text-white rounded-full shadow-sm hover:shadow cursor-pointer z-50 transition-all"
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        {/* Logout bottom */}
        <div 
          onClick={logout}
          className="p-4 border-t border-slate-200 dark:border-brand-border bg-slate-50 dark:bg-brand-dark/20 flex items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-brand-cardlight/30 transition-colors group"
        >
          <LogOut size={16} className="shrink-0 text-brand-danger" />
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs font-semibold text-slate-800 dark:text-slate-350"
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

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 bg-slate-50 dark:bg-brand-dark">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PlatformAdminLayout;

