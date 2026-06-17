import React from 'react';
import { useStudent } from '../context/StudentContext';
import { THEME_COLOR_MAP } from './StudentHubTheme';

const SummaryMetricCard = ({ title, value, subtext, icon: Icon }) => {
  const { profile } = useStudent();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  return (
    <div className={`relative bg-slate-900 border ${theme.border} p-6 rounded-2xl flex items-center justify-between overflow-hidden shadow-lg hover:border-slate-700 transition-all duration-300`}>
      <div className="space-y-1 z-10">
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
          {title}
        </span>
        <span className="text-3xl font-black text-white block">
          {value}
        </span>
        {subtext && (
          <span className="text-xs text-slate-500 block font-medium">
            {subtext}
          </span>
        )}
      </div>
      {Icon && (
        <div className={`p-3.5 rounded-xl ${theme.bg} ${theme.text} z-10 shrink-0`}>
          <Icon size={22} />
        </div>
      )}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/[0.02] blur-xl rounded-full pointer-events-none" />
    </div>
  );
};

export default SummaryMetricCard;
