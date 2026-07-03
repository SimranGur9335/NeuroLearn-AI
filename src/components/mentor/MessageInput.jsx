import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

const MessageInput = ({ onSendMessage, disabled, theme }) => {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto focus input on mount or session change
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 flex gap-2 items-center">
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? "Please wait..." : "Type technical engineering or career query here..."}
        disabled={disabled}
        className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        className={`p-3.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer focus:outline-none flex items-center justify-center shrink-0 text-white ${
          text.trim() && !disabled
            ? `bg-indigo-600 hover:bg-indigo-500 hover:shadow-lg`
            : 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed text-slate-400 dark:text-slate-600'
        }`}
      >
        <Send size={16} />
      </button>
    </form>
  );
};

export default MessageInput;
