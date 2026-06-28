import React from 'react';
import { HelpCircle } from 'lucide-react';

const CareerEmptyState = ({ title = "No Matches Found", message = "Try resetting your search query or filters to discover matching resources." }) => {
  return (
    <div className="text-center py-12 px-6 bg-slate-50/50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl max-w-md mx-auto space-y-3">
      <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-full inline-block text-slate-400">
        <HelpCircle size={24} />
      </div>
      <h4 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">{title}</h4>
      <p className="text-[11px] text-slate-450 dark:text-slate-400 leading-relaxed font-semibold">{message}</p>
    </div>
  );
};

export default CareerEmptyState;
