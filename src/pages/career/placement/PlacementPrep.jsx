import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, ArrowRight, CheckCircle2, BookOpen, AlertTriangle } from 'lucide-react';
import { placementPrepData } from '../data/placement';
import CareerHero from '../components/CareerHero';
import CareerCard from '../components/CareerCard';
import CareerSection from '../components/CareerSection';
import CareerSearch from '../components/CareerSearch';
import CareerTag from '../components/CareerTag';
import CareerEmptyState from '../components/CareerEmptyState';
import CareerDetailHeader from '../components/CareerDetailHeader';
import CareerInfoGrid from '../components/CareerInfoGrid';
import CareerStatCard from '../components/CareerStatCard';
import CareerBreadcrumb from '../components/CareerBreadcrumb';
import CareerQuickLinks from '../components/CareerQuickLinks';
import CareerCTA from '../components/CareerCTA';

const PlacementPrep = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomainId, setSelectedDomainId] = useState(null);

  const filteredDomains = placementPrepData.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.overview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedDomain = placementPrepData.find(d => d.id === selectedDomainId);

  // Detailed Domain Prep Page View
  if (selectedDomain) {
    const breadcrumbItems = [
      { name: 'Career Journey', onClick: () => setSelectedDomainId(null) },
      { name: 'Placement Prep', onClick: () => setSelectedDomainId(null) },
      { name: selectedDomain.title }
    ];

    const quickLinks = [
      ...selectedDomain.practicePlatforms.map(p => ({ name: `Practice on ${p.name}`, url: p.url })),
      ...selectedDomain.books.map(b => ({ name: `Book: ${b}`, url: 'https://www.amazon.com' })),
      ...selectedDomain.courses.map(c => ({ name: `Course: ${c}`, url: 'https://www.coursera.org' }))
    ];

    return (
      <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans pb-10 max-w-5xl mx-auto">
        <CareerBreadcrumb items={breadcrumbItems} />

        <CareerDetailHeader
          category="Placement Preparation Guide"
          title={selectedDomain.title}
          description={selectedDomain.overview}
          onBack={() => setSelectedDomainId(null)}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <CareerSection title="Core Syllabus Topics" icon="dev">
              <div className="grid grid-cols-1 gap-3">
                {selectedDomain.coreTopics.map((topic, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 border border-slate-100 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-950/20 rounded-xl">
                    <span className="w-5 h-5 flex items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-650 dark:text-indigo-400 text-[10px] font-mono font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-slate-655 dark:text-slate-400 font-semibold leading-relaxed">
                      {topic}
                    </span>
                  </div>
                ))}
              </div>
            </CareerSection>

            <CareerSection title="Revision Cheat Sheet & Core Metrics" icon="resource">
              <div className="p-4 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl font-mono text-[11px] leading-relaxed text-slate-700 dark:text-slate-350 select-all">
                {selectedDomain.cheatSheet}
              </div>
            </CareerSection>

            <CareerSection title="Frequently Asked Interview Questions" icon="chat">
              <div className="space-y-4">
                {selectedDomain.interviewQuestions.map((q, idx) => (
                  <div key={idx} className="p-4 border border-slate-100 dark:border-slate-850 rounded-xl bg-slate-50/50 dark:bg-slate-950/30 space-y-2">
                    <h4 className="text-xs font-bold text-slate-850 dark:text-white leading-normal">
                      Q: {q.q}
                    </h4>
                    <p className="text-xs text-slate-655 dark:text-slate-450 leading-relaxed font-semibold">
                      A: {q.a}
                    </p>
                  </div>
                ))}
              </div>
            </CareerSection>

            <CareerSection title="Recently Asked Interview Problems" icon="calendar">
              <div className="space-y-2.5">
                {selectedDomain.previousQuestions.map((prob, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 border border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-950/20 rounded-xl">
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">{prob.split('(')[0].trim()}</span>
                    <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400">
                      {prob.includes('(') ? prob.split('(')[1].replace(')', '') : 'General'}
                    </span>
                  </div>
                ))}
              </div>
            </CareerSection>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <CareerSection title="Prep Checklist" icon="check">
              <div className="space-y-3">
                {selectedDomain.prepChecklist.map((item, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-slate-655 dark:text-slate-400 font-semibold leading-normal">{item}</span>
                  </div>
                ))}
              </div>
            </CareerSection>

            <CareerSection title="Related Target Employers" icon="company">
              <div className="flex flex-wrap gap-2">
                {selectedDomain.relatedCompanies.map(c => (
                  <CareerTag key={c} label={c} className="bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400" />
                ))}
              </div>
            </CareerSection>

            <CareerSection title="Study Links & Assets" icon="resource">
              <CareerQuickLinks links={quickLinks} />
            </CareerSection>

            <CareerCTA
              title="Practice Playgrounds"
              description="Open official interactive practice portals to write and benchmark algorithmic code solutions."
              buttonText="Solve Questions"
              buttonUrl={selectedDomain.practicePlatforms[0].url}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans pb-10 max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('/career')}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors bg-transparent border-none cursor-pointer"
      >
        <GraduationCap size={14} />
        Back to Dashboard
      </button>

      <CareerHero
        category="Placement Prep Suite"
        title="Placement Preparation Deck"
        description="Audit algorithmic syllabus structures, low-level data structures, system designs scaling parameters, and database normalcy definitions."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <div className="md:col-span-2 space-y-6">
          <div className="w-full md:w-80">
            <CareerSearch
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prep domains..."
            />
          </div>

          <AnimatePresence mode="popLayout">
            {filteredDomains.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredDomains.map((d) => (
                  <CareerCard
                    key={d.id}
                    title={d.title}
                    description={d.overview}
                    icon="dev"
                    badge={`${d.coreTopics.length} Core Modules`}
                    onClick={() => setSelectedDomainId(d.id)}
                  >
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold mt-2 border-t border-slate-100 dark:border-slate-850 pt-3">
                      <span className="text-indigo-655 dark:text-indigo-400 font-bold uppercase">Preparation guide</span>
                      <div className="flex items-center gap-1 text-indigo-650 dark:text-indigo-400 font-bold group-hover:underline">
                        <span>Review Deck</span>
                        <ArrowRight size={12} />
                      </div>
                    </div>
                  </CareerCard>
                ))}
              </div>
            ) : (
              <CareerEmptyState
                title="No Domains Found"
                message={`We couldn't find any preparation tracks matching "${searchQuery}".`}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Rules & Guidelines Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-premium space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-rose-500 flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
              <AlertTriangle size={16} />
              Placement Policies
            </h3>
            <div className="space-y-3.5 text-xs text-slate-655 dark:text-slate-450 leading-relaxed font-semibold">
              <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-1">
                <span className="font-bold text-rose-600 uppercase tracking-wide block text-[10px]">CGPA Bar Limit</span>
                <p className="text-[10px] text-slate-500">Must maintain a minimum overall aggregate CGPA of 7.00 with 0 active backlogs.</p>
              </div>

              <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-xl space-y-1">
                <span className="font-bold text-indigo-650 uppercase tracking-wide block text-[10px]">Offer Release Rules</span>
                <p className="text-[10px] text-slate-500">Receiving an initial package offer of &gt;8 LPA automatically excuses you from further base hiring processes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementPrep;
