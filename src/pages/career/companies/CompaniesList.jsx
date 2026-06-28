import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, ArrowRight, ExternalLink, ShieldAlert, Award, Bookmark, BookmarkCheck } from 'lucide-react';
import { companies } from '../data/companies';
import CareerHero from '../components/CareerHero';
import CareerCard from '../components/CareerCard';
import CareerSection from '../components/CareerSection';
import CareerTimeline from '../components/CareerTimeline';
import CareerSearch from '../components/CareerSearch';
import CareerTag from '../components/CareerTag';
import CareerEmptyState from '../components/CareerEmptyState';
import CareerDetailHeader from '../components/CareerDetailHeader';
import CareerInfoGrid from '../components/CareerInfoGrid';
import CareerStatCard from '../components/CareerStatCard';
import CareerBreadcrumb from '../components/CareerBreadcrumb';
import CareerQuickLinks from '../components/CareerQuickLinks';
import CareerCTA from '../components/CareerCTA';
import { bookmarkEngine } from '../utils/bookmarkEngine';
import { rankItemsByProfile } from '../utils/personalizationEngine';
import RelatedRecommendations from '../components/RelatedRecommendations';

const CompaniesList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  // Load bookmarks on mount
  useEffect(() => {
    const list = bookmarkEngine.getBookmarks();
    setBookmarkedIds(list.filter(b => b.type === 'Company').map(b => b.id));
  }, []);

  const handleToggleBookmark = (e, comp) => {
    e.stopPropagation();
    bookmarkEngine.toggleBookmark({
      id: comp.id,
      name: comp.name,
      type: 'Company',
      url: `/career/companies`
    });
    const list = bookmarkEngine.getBookmarks();
    setBookmarkedIds(list.filter(b => b.type === 'Company').map(b => b.id));
  };

  // Rank by profile
  const sortedCompanies = rankItemsByProfile(companies, 'company');

  const filteredCompanies = sortedCompanies.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.overview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  // Dynamic Company Details View
  if (selectedCompany) {
    // Log view history
    bookmarkEngine.logView({
      id: selectedCompany.id,
      name: selectedCompany.name,
      type: 'Company',
      url: `/career/companies`
    });

    const isBookmarked = bookmarkedIds.includes(selectedCompany.id);

    const breadcrumbItems = [
      { name: 'Career Journey', onClick: () => setSelectedCompanyId(null) },
      { name: 'Companies Explorer', onClick: () => setSelectedCompanyId(null) },
      { name: selectedCompany.name }
    ];

    const timelineRounds = selectedCompany.interviewRounds.map((r, idx) => ({
      title: r.round,
      description: r.details,
      status: idx === 0 ? 'active' : 'upcoming'
    }));

    const relatedRecs = companies
      .filter(c => c.id !== selectedCompany.id)
      .slice(0, 2)
      .map(c => ({ id: c.id, name: c.name, type: 'Company', url: '/career/companies' }));

    return (
      <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans pb-10 max-w-5xl mx-auto">
        <div className="flex justify-between items-center">
          <CareerBreadcrumb items={breadcrumbItems} />
          <button
            onClick={(e) => handleToggleBookmark(e, selectedCompany)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            {isBookmarked ? (
              <>
                <BookmarkCheck size={14} className="text-emerald-500 fill-emerald-500" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark size={14} />
                <span>Save Company</span>
              </>
            )}
          </button>
        </div>

        <CareerDetailHeader
          category="Company profile"
          title={selectedCompany.name}
          description={selectedCompany.overview}
          onBack={() => setSelectedCompanyId(null)}
        />

        <CareerInfoGrid columns={3}>
          <CareerStatCard title="Average Compensation" value={selectedCompany.salaryOverview.split('|')[0].trim()} icon="salary" />
          <CareerStatCard title="Eligibility Bar" value="CGPA > 7.0 / 7.5" icon="calendar" />
          <CareerStatCard title="Role Scope" value={`${selectedCompany.roles.length} Active Tracks`} icon="career" />
        </CareerInfoGrid>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <CareerSection title="Company Culture & Values" icon="company">
              <p className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed font-semibold">
                {selectedCompany.culture}
              </p>
            </CareerSection>

            <CareerSection title="Hiring Process & Interview Rounds" icon="roadmap">
              <p className="text-xs text-slate-500 mb-4 font-semibold">{selectedCompany.hiringProcess}</p>
              <CareerTimeline items={timelineRounds} />
            </CareerSection>

            <CareerSection title="Preparation Strategy & Tips" icon="resource">
              <ul className="space-y-2.5">
                {selectedCompany.prepTips.map((tip, idx) => (
                  <li key={idx} className="flex gap-3 p-3.5 border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl items-start">
                    <span className="w-5 h-5 flex items-center justify-center rounded bg-amber-50 dark:bg-amber-950/30 text-amber-550 dark:text-amber-400 text-[10px] font-mono font-bold shrink-0 mt-0.5">
                      TIP
                    </span>
                    <span className="text-xs text-slate-655 dark:text-slate-400 font-semibold leading-relaxed">
                      {tip}
                    </span>
                  </li>
                ))}
              </ul>
            </CareerSection>

            <CareerSection title="Expected Compensation & Career Growth" icon="salary">
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/30">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Base Package Overview</span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{selectedCompany.salaryOverview}</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/30">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Growth & Mobility Scope</span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">{selectedCompany.growthOpportunities}</p>
                </div>
              </div>
            </CareerSection>
          </div>

          <div className="space-y-6">
            <CareerSection title="Key Placement Checklist" icon="check">
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompany.requiredSkills.map(skill => (
                      <CareerTag key={skill} label={skill} />
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-850 pt-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Preferred Portfolio Projects</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompany.preferredProjects.map(proj => (
                      <CareerTag key={proj} label={proj} className="bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400" />
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-850 pt-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Expected Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompany.expectedCertifications.map(cert => (
                      <CareerTag key={cert} label={cert} className="bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400" />
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-850 pt-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Target Roles</h4>
                  <div className="space-y-1.5">
                    {selectedCompany.roles.map(role => (
                      <div key={role} className="text-xs text-slate-655 dark:text-slate-400 font-semibold flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-550" />
                        <span>{role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CareerSection>

            {relatedRecs.length > 0 && (
              <RelatedRecommendations
                title="Recommended Employers"
                items={relatedRecs}
                onItemClick={(item) => setSelectedCompanyId(item.id)}
              />
            )}

            <CareerSection title="Interview References" icon="resource">
              <div className="space-y-3">
                {selectedCompany.resources.map((res, i) => {
                  const url = typeof res === 'string' ? 'https://leetcode.com' : res.url;
                  const name = typeof res === 'string' ? res : res.name;
                  return (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 border border-slate-205 dark:border-slate-850 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-950/40 rounded-xl flex items-center justify-between group transition-all"
                    >
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                        {name}
                      </span>
                      <ExternalLink size={12} className="text-slate-400 group-hover:text-indigo-550 transition-colors" />
                    </a>
                  );
                })}
              </div>
            </CareerSection>

            <CareerCTA
              title="Official Careers Portal"
              description="Visit the official hiring portal to apply for roles."
              buttonText="Explore Jobs"
              buttonUrl={selectedCompany.careersWebsite}
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
        <Building size={14} />
        Back to Dashboard
      </button>

      <CareerHero
        category="Placement Prep Suite"
        title="Companies Explorer"
        description="Audit interview architectures, recruitment cycles, technology stack priorities, eligibility CGPA benchmarks, and preparation paths of major tech organizations."
      />

      <div className="w-full md:w-80">
        <CareerSearch
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search target employers..."
        />
      </div>

      <AnimatePresence mode="popLayout">
        {filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredCompanies.map((c) => {
              const isBookmarked = bookmarkedIds.includes(c.id);
              return (
                <div key={c.id} className="relative group">
                  <CareerCard
                    title={c.name}
                    description={c.overview}
                    icon="company"
                    badge={`CGPA Bar: ${c.id === 'google' ? '7.5' : '7.0'}`}
                    extraInfo={`Difficulty: Hard | Roles: ${c.roles.length}`}
                    onClick={() => setSelectedCompanyId(c.id)}
                  >
                    <div className="flex flex-wrap gap-4 pt-3 border-t border-slate-100 dark:border-slate-850 justify-between items-center text-[10px] text-slate-500 font-semibold mt-2">
                      <div className="flex flex-wrap gap-1.5">
                        {c.requiredSkills.slice(0, 3).map(skill => (
                          <span key={skill} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 font-mono text-[9px]">
                            {skill}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-indigo-650 dark:text-indigo-400 font-bold group-hover:underline">
                        <span>Hiring Details</span>
                        <ArrowRight size={12} />
                      </div>
                    </div>
                  </CareerCard>

                  <button
                    onClick={(e) => handleToggleBookmark(e, c)}
                    className="absolute top-4 right-4 z-10 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-905 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    {isBookmarked ? (
                      <BookmarkCheck size={14} className="text-emerald-500 fill-emerald-500" />
                    ) : (
                      <Bookmark size={14} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <CareerEmptyState
            title="No Companies Found"
            message={`We couldn't find any company matches for "${searchQuery}".`}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompaniesList;
