import React from 'react';
import { Sparkles } from 'lucide-react';

const TypingIndicator = () => {
  return (
    <div className="flex gap-3 max-w-[80%] self-start items-start">
      <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
        <Sparkles size={14} className="animate-spin" style={{ animationDuration: '3s' }} />
      </div>
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs italic flex items-center gap-1.5 rounded-tl-sm shadow-sm">
        <span className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
};

export default TypingIndicator;
