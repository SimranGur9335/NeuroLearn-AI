import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Cpu, MessageSquare } from 'lucide-react';
import SuggestedPrompts from './SuggestedPrompts';

const EmptyState = ({ theme, onSelectPrompt }) => {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-6 text-center max-w-2xl mx-auto space-y-8 my-auto">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="relative"
      >
        <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white shadow-xl`}>
          <Brain className="w-10 h-10 animate-pulse" />
        </div>
        <div className="absolute -top-2 -right-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-full p-1.5 shadow-md">
          <Sparkles className="w-4 h-4 text-yellow-400 dark:text-yellow-600 animate-spin" style={{ animationDuration: '4s' }} />
        </div>
      </motion.div>

      <div className="space-y-3">
        <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
          NeuroLearn AI Mentor
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
          Your personal academic copilot and career architect. Ask questions about engineering concepts, design capstone project architectures, or request code debugging assistance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-left">
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
          <Cpu className={`w-5 h-5 ${theme.text}`} />
          <h4 className="font-extrabold text-xs text-slate-800 dark:text-white uppercase tracking-wider">Student Context Aware</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">Tailors explanations to your learning wellness records and academic predictors.</p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
          <MessageSquare className={`w-5 h-5 ${theme.text}`} />
          <h4 className="font-extrabold text-xs text-slate-800 dark:text-white uppercase tracking-wider">Concept Explainer</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">Simplifies complex topics with diagrams, pseudo-code, and analogies.</p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
          <Sparkles className={`w-5 h-5 ${theme.text}`} />
          <h4 className="font-extrabold text-xs text-slate-800 dark:text-white uppercase tracking-wider">Career Alignment</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">Suggests targeted quizzes and pathways based on conversation topics.</p>
        </div>
      </div>

      <div className="w-full pt-4">
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wider mb-3 text-left">
          Suggested Topics to Begin:
        </span>
        <SuggestedPrompts onSelectPrompt={onSelectPrompt} />
      </div>
    </div>
  );
};

export default EmptyState;
