import React from 'react';
import { motion } from 'framer-motion';
import { useStudent } from '../context/StudentContext';
import { THEME_COLOR_MAP } from './StudentHubTheme';
import { ArrowRight } from 'lucide-react';

const StudentHubCard = ({ icon: Icon, title, description, badge, onClick }) => {
  const { profile } = useStudent();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={`relative cursor-pointer rounded-2xl border ${theme.border} bg-white dark:bg-brand-card hover:bg-slate-50/50 dark:hover:bg-brand-cardlight/30 transition-all duration-300 shadow-premium hover:shadow-premium-lg overflow-hidden group`}
    >
      {/* Decorative inner glow */}
      <div className="absolute right-0 top-0 -mr-6 -mt-6 w-24 h-24 bg-white/5 blur-2xl rounded-full group-hover:bg-white/10 transition-colors duration-300" />
      
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${theme.bg} ${theme.text} group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={24} />
        </div>
        {badge !== undefined && (
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${theme.bg} ${theme.text} border ${theme.border}`}>
            {badge}
          </span>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-bold text-white group-hover:text-slate-200 transition-colors">
          {title}
        </h3>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
          {description}
        </p>
      </div>

      <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 group-hover:text-slate-300 transition-colors">
        <span>Open Console</span>
        <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  );
};

export default StudentHubCard;
