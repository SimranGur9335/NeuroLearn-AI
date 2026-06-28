import React from 'react';

const CareerTimeline = ({ items }) => {
  return (
    <div className="relative border-l border-slate-200 dark:border-slate-800 pl-6 ml-2 space-y-6">
      {items.map((item, index) => (
        <div key={index} className="relative">
          <span className={`absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-white dark:bg-slate-950 ${
            item.status === 'active' 
              ? 'border-indigo-650 dark:border-indigo-400 scale-110 shadow-sm' 
              : 'border-slate-300 dark:border-slate-800'
          }`} />
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">
                {item.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {item.description}
              </p>
            </div>
            {item.date && (
              <span className="text-[9px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-2 py-0.5 rounded font-bold font-mono text-slate-500 dark:text-slate-400">
                {item.date}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CareerTimeline;
