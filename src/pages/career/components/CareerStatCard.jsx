import React from 'react';
import { CAREER_ICONS } from '../constants/careerIcons';

const CareerStatCard = ({ title, value, icon, className = "" }) => {
  const IconComponent = typeof icon === 'string' ? CAREER_ICONS[icon] : icon;

  return (
    <div className={`p-4 rounded-xl border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/30 flex items-center gap-3 ${className}`}>
      {IconComponent && <IconComponent size={18} className="text-indigo-500 shrink-0" />}
      <div className="min-w-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">{title}</span>
        <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider block truncate">{value}</span>
      </div>
    </div>
  );
};

export default CareerStatCard;
