import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileBadge, ArrowRight, ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react';
import { certifications } from '../data/certifications';
import CareerHero from '../components/CareerHero';
import CareerCard from '../components/CareerCard';
import CareerSection from '../components/CareerSection';
import CareerTimeline from '../components/CareerTimeline';
import CareerSearch from '../components/CareerSearch';
import CareerFilter from '../components/CareerFilter';
import CareerTag from '../components/CareerTag';
import CareerBadge from '../components/CareerBadge';
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

const CertificationsList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCertId, setSelectedCertId] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  // Load bookmarks on mount
  useEffect(() => {
    const list = bookmarkEngine.getBookmarks();
    setBookmarkedIds(list.filter(b => b.type === 'Certification').map(b => b.id));
  }, []);

  const handleToggleBookmark = (e, cert) => {
    e.stopPropagation();
    bookmarkEngine.toggleBookmark({
      id: cert.id,
      name: cert.name,
      type: 'Certification',
      url: `/career/certifications`
    });
    const list = bookmarkEngine.getBookmarks();
    setBookmarkedIds(list.filter(b => b.type === 'Certification').map(b => b.id));
  };

  // Rank certifications list by student profile goal
  const sortedCerts = rankItemsByProfile(certifications, 'cert');

  const filteredCerts = sortedCerts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedCert = certifications.find(c => c.id === selectedCertId);

  // If a certification is selected, render the detailed template
  if (selectedCert) {
    // Log recently viewed
    bookmarkEngine.logView({
      id: selectedCert.id,
      name: selectedCert.name,
      type: 'Certification',
      url: `/career/certifications`
    });

    const isBookmarked = bookmarkedIds.includes(selectedCert.id);

    const breadcrumbItems = [
      { name: 'Career Journey', onClick: () => setSelectedCertId(null) },
      { name: 'Certifications', onClick: () => setSelectedCertId(null) },
      { name: selectedCert.name }
    ];

    const quickLinks = [
      { name: 'Official Documentation', url: selectedCert.resources.officialDoc },
      ...selectedCert.resources.courses.map((c, i) => ({ name: `Online Course: ${c}`, url: 'https://www.coursera.org' })),
      ...selectedCert.resources.books.map((b, i) => ({ name: `Study Guide: ${b}`, url: 'https://www.amazon.com' })),
      ...selectedCert.resources.practiceTests.map((t, i) => ({ name: `Practice Tests: ${t}`, url: 'https://www.udemy.com' }))
    ];

    const timelineItems = selectedCert.studyRoadmap.map((step, idx) => ({
      title: `Phase ${idx + 1}`,
      description: step,
      status: idx === 0 ? 'active' : 'upcoming'
    }));

    // Generate related recommendation items
    const relatedRecs = certifications
      .filter(c => c.id !== selectedCert.id && c.category === selectedCert.category)
      .slice(0, 2)
      .map(c => ({ id: c.id, name: c.name, type: 'Certification', url: '/career/certifications' }));

    return (
      <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans pb-10 max-w-5xl mx-auto">
        <div className="flex justify-between items-center">
          <CareerBreadcrumb items={breadcrumbItems} />
          <button
            onClick={(e) => handleToggleBookmark(e, selectedCert)}
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
                <span>Save Certification</span>
              </>
            )}
          </button>
        </div>
        
        <CareerDetailHeader
          category={`${selectedCert.category} Certification`}
          title={selectedCert.name}
          description={`Overview: ${selectedCert.overview}`}
          onBack={() => setSelectedCertId(null)}
        />

        <CareerInfoGrid columns={3}>
          <CareerStatCard title="Exam Duration" value={selectedCert.duration} icon="clock" />
          <CareerStatCard title="Level Tier" value={selectedCert.level} icon="certification" />
          <CareerStatCard title="Suggested Difficulty" value={selectedCert.difficulty} icon="warning" />
        </CareerInfoGrid>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main info panel */}
          <div className="md:col-span-2 space-y-6">
            <CareerSection title="Exam Blueprint & Details" icon="calendar">
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">Exam Format</span>
                  <p className="text-xs font-semibold leading-relaxed text-slate-655 dark:text-slate-400">{selectedCert.examPattern}</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">Prerequisites</span>
                  <p className="text-xs font-semibold leading-relaxed text-slate-655 dark:text-slate-400">{selectedCert.prerequisites}</p>
                </div>
              </div>
            </CareerSection>

            <CareerSection title="Syllabus Modules" icon="dev">
              <ul className="space-y-2.5">
                {selectedCert.syllabus.map((topic, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3.5 border border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-950/40 rounded-xl">
                    <span className="w-5 h-5 flex items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-650 dark:text-indigo-400 text-[10px] font-mono font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-slate-655 dark:text-slate-400 font-semibold leading-relaxed">
                      {topic}
                    </span>
                  </li>
                ))}
              </ul>
            </CareerSection>

            <CareerSection title="Study Roadmap" icon="roadmap">
              <CareerTimeline items={timelineItems} />
            </CareerSection>

            <CareerSection title="Career & Job Market Benefits" icon="salary">
              <div className="grid grid-cols-1 gap-3">
                {selectedCert.careerBenefits.map((benefit, idx) => (
                  <div key={idx} className="flex gap-3 items-center border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 p-3.5 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-xs text-slate-655 dark:text-slate-400 leading-normal font-semibold">{benefit}</span>
                  </div>
                ))}
              </div>
            </CareerSection>
          </div>

          {/* Sidebar associations */}
          <div className="space-y-6">
            <CareerSection title="Related Pathways" icon="career">
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Target Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCert.relatedSkills.map(skill => (
                      <CareerTag key={skill} label={skill} />
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-850 pt-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Recommended Careers</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCert.relatedCareers.map(career => (
                      <CareerTag key={career} label={career} className="bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400" />
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-850 pt-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Matching Portfolio Projects</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCert.relatedProjects.map(proj => (
                      <CareerTag key={proj} label={proj} className="bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400" />
                    ))}
                  </div>
                </div>
              </div>
            </CareerSection>

            {relatedRecs.length > 0 && (
              <RelatedRecommendations
                title="Recommended Credentials"
                items={relatedRecs}
                onItemClick={(item) => setSelectedCertId(item.id)}
              />
            )}

            <CareerSection title="Resources & References" icon="resource">
              <CareerQuickLinks links={quickLinks} />
            </CareerSection>

            <CareerCTA
              title="Ready to Register?"
              description="Navigate to the vendor landing page to schedule your official certification exam slot."
              buttonText="Schedule Exam"
              buttonUrl={selectedCert.registrationLink}
            />
          </div>
        </div>
      </div>
    );
  }

  // Categories list
  const categories = ['All', 'AWS', 'Azure', 'Google Cloud', 'Cisco', 'Databricks', 'Meta'];

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans pb-10 max-w-5xl mx-auto">
      {/* Back button */}
      <button 
        onClick={() => navigate('/career')}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors bg-transparent border-none cursor-pointer"
      >
        <FileBadge size={14} />
        Back to Dashboard
      </button>

      <CareerHero
        category="Placement Prep Suite"
        title="Certification Hub"
        description="Verify your expertise and boost your resume validation. Explore industry-recognized credentials across cloud platforms, database systems, networks, and frontend architectures."
      />

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="w-full md:w-80">
          <CareerSearch
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search certifications..."
          />
        </div>
        <CareerFilter
          options={categories}
          activeOption={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Grid listing */}
      <AnimatePresence mode="popLayout">
        {filteredCerts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {filteredCerts.map((c) => {
              const isBookmarked = bookmarkedIds.includes(c.id);
              return (
                <div key={c.id} className="relative group">
                  <CareerCard
                    title={c.name}
                    description={c.overview}
                    icon="certification"
                    badge={c.category}
                    extraInfo={`Duration: ${c.duration} | Difficulty: ${c.difficulty}`}
                    onClick={() => setSelectedCertId(c.id)}
                  >
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold mt-2 border-t border-slate-100 dark:border-slate-850 pt-3">
                      <span className="text-indigo-655 dark:text-indigo-400 font-bold uppercase">Syllabus details</span>
                      <div className="flex items-center gap-1 text-indigo-650 dark:text-indigo-400 font-bold group-hover:underline">
                        <span>Explore Track</span>
                        <ArrowRight size={12} />
                      </div>
                    </div>
                  </CareerCard>
                  
                  <button
                    onClick={(e) => handleToggleBookmark(e, c)}
                    className="absolute top-4 right-4 z-10 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
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
          </motion.div>
        ) : (
          <CareerEmptyState
            title="No Certifications Found"
            message={`We couldn't find any certifications matching "${searchQuery}" under ${selectedCategory}. Try resetting your parameters.`}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CertificationsList;
