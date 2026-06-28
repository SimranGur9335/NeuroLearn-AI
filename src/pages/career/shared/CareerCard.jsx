import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const CareerCard = ({ icon: Icon, title, description, badge, onClick }) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative cursor-pointer rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 hover:bg-slate-50/50 dark:hover:bg-slate-900/90 transition-all duration-300 shadow-premium hover:shadow-premium-lg overflow-hidden group flex flex-col justify-between h-full"
    >
      {/* Decorative top gradient border on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      
      {/* Decorative inner glow */}
      <div className="absolute right-0 top-0 -mr-6 -mt-6 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full group-hover:bg-indigo-500/10 transition-colors duration-300" />
      
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
              <Icon size={24} />
            </div>
            {badge && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-indigo-950">
                {badge}
              </span>
            )}
          </div>

          <div className="mt-5">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {title}
            </h3>
            <p className="mt-2 text-xs text-slate-650 dark:text-slate-400 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-350 transition-colors">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          <span>Explore Module</span>
          <ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
};

export default CareerCard;
