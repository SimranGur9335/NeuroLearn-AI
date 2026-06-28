import React from 'react';
import { ExternalLink } from 'lucide-react';

const CareerQuickLinks = ({ links }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {links.map((res, idx) => (
        <a 
          key={idx} 
          href={res.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-4 border border-slate-200 dark:border-slate-850 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-950/40 rounded-xl flex items-center justify-between group transition-all"
        >
          <span className="text-xs font-bold text-slate-850 dark:text-slate-200 group-hover:text-indigo-655 dark:group-hover:text-indigo-400 transition-colors">
            {res.name}
          </span>
          <ExternalLink size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
        </a>
      ))}
    </div>
  );
};

export default CareerQuickLinks;
