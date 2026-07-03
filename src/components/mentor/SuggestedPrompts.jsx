import React from 'react';

const SUGGESTED_QUESTIONS = [
  "Explain vanishing gradients in deep networks.",
  "How do I secure an Express REST API against SQLi?",
  "Suggest a capstone project utilizing Kubernetes & FastAPI."
];

const SuggestedPrompts = ({ onSelectPrompt }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-start">
      {SUGGESTED_QUESTIONS.map((prompt, idx) => (
        <button
          key={idx}
          onClick={() => onSelectPrompt(prompt)}
          className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 text-slate-750 dark:text-slate-300 text-[11px] font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer text-left shadow-sm hover:shadow active:scale-95"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
};

export default SuggestedPrompts;
export { SUGGESTED_QUESTIONS };
