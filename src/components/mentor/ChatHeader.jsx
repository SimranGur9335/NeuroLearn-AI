import React from 'react';
import { Menu, Sparkles } from 'lucide-react';

const ChatHeader = ({ title, onToggleSidebar, theme }) => {
  return (
    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 -ml-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
        >
          <Menu size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500 shrink-0">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="font-extrabold text-xs md:text-sm text-slate-850 dark:text-white truncate max-w-[200px] sm:max-w-md">
              {title || 'AI Mentor Copilot'}
            </h3>
            <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider block">
              Context Synchronized • Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
