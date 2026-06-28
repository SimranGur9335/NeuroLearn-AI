import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useStudent } from '../../../context/StudentContext';
import { THEME_COLOR_MAP } from '../../../components/StudentHubTheme';

const CareerCTA = ({ title, description, buttonText, buttonUrl }) => {
  const { profile } = useStudent();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  return (
    <div className="p-6 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">{title}</h4>
        {description && <p className="text-[11px] text-slate-450 dark:text-slate-400 font-semibold">{description}</p>}
      </div>
      {buttonText && buttonUrl && (
        <a
          href={buttonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${theme.gradient} text-white font-bold text-xs shadow-md rounded-xl hover:shadow-lg transition-all shrink-0`}
        >
          <span>{buttonText}</span>
          <ExternalLink size={12} />
        </a>
      )}
    </div>
  );
};

export default CareerCTA;
