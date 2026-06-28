import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useStudent } from '../../../context/StudentContext';
import { THEME_COLOR_MAP } from '../../../components/StudentHubTheme';

const CareerDetailHeader = ({ category, title, description, onBack }) => {
  const { profile } = useStudent();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  return (
    <div className="space-y-4">
      {onBack && (
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>
      )}

      <div className={`bg-gradient-to-r ${theme.gradient} border ${theme.border} p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-xl text-white`}>
        <div className="absolute right-0 top-0 w-80 h-80 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10 space-y-2">
          {category && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md inline-block">
              {category}
            </span>
          )}
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider font-heading">
            {title}
          </h1>
          {description && (
            <p className="text-slate-200 text-xs md:text-sm max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CareerDetailHeader;
