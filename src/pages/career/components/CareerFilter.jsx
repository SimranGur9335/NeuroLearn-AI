import React from 'react';

const CareerFilter = ({ options, activeOption, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2 overflow-x-auto py-1">
      {options.map((opt) => {
        const isActive = activeOption === opt;
        return (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border transition-all cursor-pointer whitespace-nowrap ${
              isActive
                ? 'bg-indigo-650 border-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-880 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60'
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
};

export default CareerFilter;
