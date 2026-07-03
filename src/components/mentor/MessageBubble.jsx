import React, { useState } from 'react';
import { Sparkles, User, Terminal, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const MessageBubble = ({ message, index, theme }) => {
  const isAi = message.sender === 'assistant' || message.role === 'assistant';
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const parseInlineMarkdown = (text) => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      let content = line;
      
      // Check if line is a header
      if (content.startsWith('### ')) {
        return <h4 key={lineIdx} className="text-[13px] font-black text-slate-800 dark:text-white mt-3 mb-1">{content.slice(4)}</h4>;
      }
      if (content.startsWith('## ')) {
        return <h3 key={lineIdx} className="text-[14px] font-black text-slate-850 dark:text-white mt-4 mb-2">{content.slice(3)}</h3>;
      }
      if (content.startsWith('# ')) {
        return <h2 key={lineIdx} className="text-sm font-black text-slate-900 dark:text-white mt-4 mb-2">{content.slice(2)}</h2>;
      }
      
      // Check if line is a bullet point
      const isBullet = content.trim().startsWith('* ') || content.trim().startsWith('- ');
      if (isBullet) {
        content = content.trim().slice(2);
      }

      // Process bold and inline code
      const elements = [];
      const regex = /(\*\*.*?\*\*|`.*?`)/g;
      const parts = content.split(regex);
      
      parts.forEach((part, partIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          elements.push(<strong key={partIdx} className="font-extrabold text-slate-950 dark:text-white">{part.slice(2, -2)}</strong>);
        } else if (part.startsWith('`') && part.endsWith('`')) {
          elements.push(<code key={partIdx} className="bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono text-indigo-650 dark:text-indigo-400 font-semibold">{part.slice(1, -1)}</code>);
        } else {
          elements.push(part);
        }
      });

      if (isBullet) {
        return (
          <li key={lineIdx} className="ml-4 list-disc pl-1 py-0.5 text-slate-650 dark:text-slate-300">
            <span>{elements}</span>
          </li>
        );
      }

      return (
        <span key={lineIdx} className="block min-h-[1.25em] text-slate-650 dark:text-slate-350">
          {elements}
        </span>
      );
    });
  };

  const parseMessageContent = (text) => {
    if (!text) return null;
    
    // Split the text by code blocks ```...```
    const parts = text.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, idx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const language = match ? match[1] : 'code';
        const codeContent = match ? match[2].trim() : part.slice(3, -3).trim();
        
        return (
          <div key={idx} className="my-3.5 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-100 dark:bg-slate-950 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-500">
              <span className="flex items-center gap-1.5 uppercase font-extrabold tracking-wider">
                <Terminal size={12} /> {language || 'code'} / Snippet
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(codeContent, idx)}
                className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-white cursor-pointer transition-colors focus:outline-none bg-slate-250 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 px-2 py-0.5 rounded text-[9px] font-bold"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check size={10} className="text-emerald-500" />
                    <span className="text-emerald-500 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={10} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-indigo-300 font-mono text-[10px] overflow-x-auto leading-relaxed">
              <code>{codeContent}</code>
            </pre>
          </div>
        );
      }
      
      return (
        <div key={idx} className="space-y-1 mt-1">
          {parseInlineMarkdown(part)}
        </div>
      );
    });
  };

  const timestamp = message.created_at
    ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : message.date || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 max-w-[85%] ${isAi ? 'self-start' : 'self-end flex-row-reverse ml-auto'}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 border ${
        isAi
          ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
          : 'bg-slate-800 dark:bg-slate-700 border-slate-700 text-white'
      }`}>
        {isAi ? <Sparkles size={14} /> : <User size={14} />}
      </div>
      <div className="space-y-1 max-w-full">
        <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
          isAi
            ? 'bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 rounded-tl-sm shadow-xs'
            : 'bg-indigo-600 text-white rounded-tr-sm shadow-md'
        }`}>
          {parseMessageContent(message.message || message.text)}
        </div>
        <span className={`text-[9px] text-slate-400 dark:text-slate-500 block px-1 ${isAi ? 'text-left' : 'text-right'}`}>
          {timestamp}
        </span>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
