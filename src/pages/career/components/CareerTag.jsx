import React from 'react';

const CareerTag = ({ label, className = "" }) => {
  return (
    <span className={`px-2.5 py-1 text-[10px] font-bold font-mono rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 text-slate-600 dark:text-slate-400 ${className}`}>
      {label}
    </span>
  );
};

export default CareerTag;
