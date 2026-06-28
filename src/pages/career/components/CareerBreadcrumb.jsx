import React from 'react';
import { ChevronRight } from 'lucide-react';

const CareerBreadcrumb = ({ items }) => {
  return (
    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight size={10} />}
            {isLast ? (
              <span className="text-slate-655 dark:text-slate-300 truncate">{item.name}</span>
            ) : (
              <span className="hover:text-indigo-650 cursor-pointer" onClick={item.onClick}>
                {item.name}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default CareerBreadcrumb;
