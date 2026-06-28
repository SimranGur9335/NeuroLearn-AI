import React from 'react';
import { motion } from 'framer-motion';
import { CAREER_ICONS } from '../constants/careerIcons';

const CareerCard = ({ title, description, icon, badge, extraInfo, onClick, children }) => {
  const IconComponent = typeof icon === 'string' ? CAREER_ICONS[icon] : icon;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-premium hover:shadow-premium-lg transition-shadow cursor-pointer flex flex-col justify-between space-y-4`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          {IconComponent && (
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 shrink-0">
              <IconComponent size={18} />
            </div>
          )}
          {badge && (
            <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-250 dark:border-emerald-850 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {badge}
            </span>
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider leading-snug">
            {title}
          </h3>
          {description && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {extraInfo && (
        <div className="text-[10px] text-slate-400 font-bold font-mono border-t border-slate-100 dark:border-slate-850 pt-2.5">
          {extraInfo}
        </div>
      )}

      {children}
    </motion.div>
  );
};

export default CareerCard;
