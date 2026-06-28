import React from 'react';
import CareerSection from './CareerSection';
import CareerTag from './CareerTag';
import { ArrowRight, BookOpen, FileCheck } from 'lucide-react';

const ResumeSuggestions = ({
  detectedSkills = [],
  missingKeywords = [],
  suggestedCertifications = [],
  suggestedProjects = [],
  suggestedResources = [],
  onCertClick,
  onProjectClick,
  onResourceClick
}) => {
  return (
    <div className="space-y-6">
      {/* Extracted Keywords vs Missing Keywords */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CareerSection title="Detected Skills" icon="check">
          <div className="flex flex-wrap gap-2">
            {detectedSkills.map((skill) => (
              <CareerTag key={skill} label={skill} className="bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-400" />
            ))}
          </div>
        </CareerSection>

        <CareerSection title="Missing Role Keywords" icon="warning">
          <div className="flex flex-wrap gap-2">
            {missingKeywords.map((kw) => (
              <CareerTag key={kw} label={kw} className="bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-455" />
            ))}
          </div>
        </CareerSection>
      </div>

      {/* Recommendations */}
      <CareerSection title="Suggested Resume Improvements" icon="resource">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Suggested Certifications */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <FileCheck size={12} className="text-indigo-500" />
              Certifications
            </h4>
            <div className="space-y-2">
              {suggestedCertifications.map((cert) => (
                <div
                  key={cert.id}
                  onClick={() => onCertClick && onCertClick(cert.id)}
                  className="p-3 border border-slate-200 dark:border-slate-850 hover:border-indigo-500/40 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-all flex justify-between items-center group"
                >
                  <span className="text-[11px] font-bold text-slate-850 dark:text-slate-250 truncate block max-w-[180px]">
                    {cert.name}
                  </span>
                  <ArrowRight size={12} className="text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Projects */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <BookOpen size={12} className="text-indigo-500" />
              Portfolio Projects
            </h4>
            <div className="space-y-2">
              {suggestedProjects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => onProjectClick && onProjectClick(proj.id)}
                  className="p-3 border border-slate-200 dark:border-slate-850 hover:border-indigo-500/40 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-all flex justify-between items-center group"
                >
                  <span className="text-[11px] font-bold text-slate-850 dark:text-slate-250 truncate block max-w-[180px]">
                    {proj.title}
                  </span>
                  <ArrowRight size={12} className="text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Resources */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <BookOpen size={12} className="text-indigo-500" />
              Learning Guides
            </h4>
            <div className="space-y-2">
              {suggestedResources.map((res) => (
                <div
                  key={res.id}
                  onClick={() => onResourceClick && onResourceClick(res.externalLink)}
                  className="p-3 border border-slate-200 dark:border-slate-850 hover:border-indigo-500/40 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-all flex justify-between items-center group"
                >
                  <span className="text-[11px] font-bold text-slate-850 dark:text-slate-250 truncate block max-w-[180px]">
                    {res.title}
                  </span>
                  <ArrowRight size={12} className="text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CareerSection>
    </div>
  );
};

export default ResumeSuggestions;
