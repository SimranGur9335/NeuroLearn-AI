import React from 'react';
import { CAREER_ICONS } from '../constants/careerIcons';

const CareerSection = ({ title, icon, children, className = "" }) => {
  const IconComponent = typeof icon === 'string' ? CAREER_ICONS[icon] : icon;

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-premium space-y-4 ${className}`}>
      {title && (
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-indigo-650 dark:text-indigo-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
          {IconComponent && <IconComponent size={16} />}
          {title}
        </h3>
      )}
      <div className="pt-1">
        {children}
      </div>
    </div>
  );
};

export default CareerSection;
