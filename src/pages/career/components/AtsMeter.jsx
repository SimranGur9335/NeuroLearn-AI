import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const AtsMeter = ({ score = 75, breakdown = [] }) => {
  const getVerdict = (s) => {
    if (s >= 85) return { label: "Excellent Match", color: "text-emerald-500", border: "border-emerald-500/20", bg: "bg-emerald-500/5" };
    if (s >= 70) return { label: "Good Match", color: "text-indigo-500", border: "border-indigo-500/20", bg: "bg-indigo-500/5" };
    if (s >= 50) return { label: "Needs Improvement", color: "text-amber-500", border: "border-amber-500/20", bg: "bg-amber-500/5" };
    return { label: "Critical Gaps", color: "text-rose-500", border: "border-rose-500/20", bg: "bg-rose-500/5" };
  };

  const verdict = getVerdict(score);

  // Circular progress calculations
  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-premium flex flex-col justify-between items-center space-y-6">
      <div className="text-center">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          ATS Compatibility Score
        </h4>
        <p className="text-[9px] text-slate-400 font-mono mt-0.5 uppercase">Algorithm Analysis</p>
      </div>

      {/* SVG Circle Meter */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="72"
            cy="72"
            r={radius}
            className="stroke-slate-100 dark:stroke-slate-850 fill-transparent"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx="72"
            cy="72"
            r={radius}
            className="stroke-indigo-650 dark:stroke-indigo-500 fill-transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-3xl font-black text-slate-850 dark:text-white leading-none">
            {score}
          </span>
          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mt-1">
            out of 100
          </span>
        </div>
      </div>

      <div className={`w-full py-2 px-3 rounded-xl border text-center text-xs font-bold ${verdict.bg} ${verdict.border} ${verdict.color}`}>
        {verdict.label}
      </div>

      {/* Metric Breakdown */}
      {breakdown && breakdown.length > 0 && (
        <div className="w-full space-y-2.5 border-t border-slate-100 dark:border-slate-850 pt-4">
          {breakdown.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span>{item.name}</span>
                <span className="font-mono">{item.value}%</span>
              </div>
              <div className="w-full bg-slate-50 dark:bg-slate-950 h-1 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${item.value >= 75 ? 'bg-emerald-500' : item.value >= 50 ? 'bg-indigo-500' : 'bg-rose-500'}`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AtsMeter;
