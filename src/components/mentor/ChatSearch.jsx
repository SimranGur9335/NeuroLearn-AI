import React from 'react';
import { Search, X } from 'lucide-react';

const ChatSearch = ({ value, onChange }) => {
  return (
    <div className="relative">
      <Search size={14} className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-505" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search conversation archives..."
        className="w-full pl-9 pr-8 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 text-slate-850 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-inner"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 top-2.5 p-0.5 text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-white rounded-full transition-colors cursor-pointer"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
};

export default ChatSearch;
