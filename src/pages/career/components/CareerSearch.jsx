import React from 'react';
import { Search } from 'lucide-react';

const CareerSearch = ({ value, onChange, placeholder = "Search resources..." }) => {
  return (
    <div className="relative flex items-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus-within:ring-2 focus-within:ring-indigo-650/20 focus-within:border-indigo-650 dark:focus-within:border-indigo-500 rounded-xl px-3 py-2.5 transition-all">
      <Search size={14} className="text-slate-400 mr-2 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="bg-transparent border-none text-xs text-slate-850 dark:text-slate-100 placeholder-slate-400 focus:outline-none w-full font-medium"
      />
    </div>
  );
};

export default CareerSearch;
