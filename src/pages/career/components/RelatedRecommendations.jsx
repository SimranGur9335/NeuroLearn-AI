import React from 'react';
import { ArrowRight, Star } from 'lucide-react';
import CareerSection from './CareerSection';
import CareerTag from './CareerTag';

const RelatedRecommendations = ({
  title = "Personalized Recommendations",
  items = [],
  onItemClick,
  emptyMessage = "No matching recommendations found."
}) => {
  if (!items || items.length === 0) return null;

  return (
    <CareerSection title={title} icon="resource">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            onClick={() => onItemClick && onItemClick(item)}
            className="p-4 border border-slate-150 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-950/20 hover:border-indigo-500/40 hover:bg-slate-100/30 rounded-xl cursor-pointer transition-all flex justify-between items-center group"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Star size={10} className="text-amber-500 fill-amber-500 shrink-0" />
                <span className="text-xs font-bold text-slate-850 dark:text-slate-205">{item.title || item.name}</span>
              </div>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-405 tracking-wide">
                {item.type || 'Recommendation'}
              </span>
            </div>
            <ArrowRight size={12} className="text-slate-450 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        ))}
      </div>
    </CareerSection>
  );
};

export default RelatedRecommendations;
