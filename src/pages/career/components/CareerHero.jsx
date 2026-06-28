import React from 'react';
import { useStudent } from '../../../context/StudentContext';
import { THEME_COLOR_MAP } from '../../../components/StudentHubTheme';

const CareerHero = ({ category, title, description, children }) => {
  const { profile } = useStudent();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  return (
    <div className={`bg-gradient-to-r ${theme.gradient} border ${theme.border} p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-xl text-white`}>
      <div className="absolute right-0 top-0 w-80 h-80 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="relative z-10 space-y-3">
        {category && (
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/10 backdrop-blur-md inline-block">
            {category}
          </span>
        )}
        <h1 className="text-2xl md:text-3xl font-black font-heading tracking-wide">
          {title}
        </h1>
        <p className="text-slate-200 text-xs md:text-sm max-w-2xl leading-relaxed">
          {description}
        </p>
        {children}
      </div>
    </div>
  );
};

export default CareerHero;
