import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, TrendingUp, Compass, Award, ExternalLink, MessageSquare, ShieldCheck, HelpCircle } from 'lucide-react';
import { useStudent } from '../../../context/StudentContext';
import { THEME_COLOR_MAP } from '../../../components/StudentHubTheme';
import { trends, emergingSkills, popularFrameworks, industryReports, weeklyHighlights } from '../data/trends';
import { CAREER_ICONS } from '../constants/careerIcons';
import CareerHero from '../components/CareerHero';
import CareerCard from '../components/CareerCard';
import CareerSection from '../components/CareerSection';
import CareerSearch from '../components/CareerSearch';
import CareerFilter from '../components/CareerFilter';
import CareerTag from '../components/CareerTag';

const TechTrends = () => {
  const navigate = useNavigate();
  const { profile } = useStudent();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'AI & ML', 'Languages', 'Cloud & DevOps', 'Web & Systems'];

  const filteredTrends = trends.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans pb-10 max-w-5xl mx-auto">
      {/* Back button */}
      <button 
        onClick={() => navigate('/career')}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors bg-transparent border-none cursor-pointer"
      >
        <ArrowLeft size={14} />
        Back to Dashboard
      </button>

      <CareerHero
        category="Placement Prep Suite"
        title="Technology Trends & Market Insights"
        description="Monitor active shifts in the global engineering landscape. Adapt your toolchain selections to match placement hiring bars."
      />

      {/* Grid structure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Trending Tech */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
              <div className="w-full sm:w-72">
                <CareerSearch
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search trending tech..."
                />
              </div>
              <CareerFilter
                options={categories}
                activeOption={selectedCategory}
                onSelect={setSelectedCategory}
              />
            </div>

            <AnimatePresence mode="popLayout">
              <div className="space-y-4">
                {filteredTrends.map((t) => {
                  const Icon = CAREER_ICONS[t.icon] || CAREER_ICONS.dev;
                  return (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-5 rounded-2xl shadow-premium hover:shadow-premium-lg transition-all group flex gap-4 items-start relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-indigo-650 transform scale-y-0 group-hover:scale-y-100 transition-transform" />
                      
                      <div className={`p-3 rounded-xl ${t.bg} ${t.color} shrink-0`}>
                        <Icon size={20} />
                      </div>

                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                          <h4 className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider group-hover:text-indigo-655 dark:group-hover:text-indigo-400 transition-colors">
                            {t.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-extrabold text-emerald-500 uppercase font-mono">
                              {t.growth}
                            </span>
                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-500">
                              Hiring: {t.hiringPressure}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-655 dark:text-slate-450 leading-relaxed font-semibold">
                          {t.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          </div>

          {/* Emerging Skills & Learning Recommendations */}
          <CareerSection title="Emerging Skill Tracks & Resources" icon="resource">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {emergingSkills.map((sk) => (
                <div
                  key={sk.skill}
                  onClick={() => window.open(sk.resourceUrl, '_blank')}
                  className="p-4 border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl cursor-pointer hover:border-indigo-500/40 hover:bg-slate-100/30 transition-all flex justify-between items-center group"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-850 dark:text-slate-205">{sk.skill}</span>
                    <div className="flex gap-2">
                      <span className="text-[9px] font-extrabold text-indigo-650 dark:text-indigo-400 uppercase tracking-wide">
                        {sk.demandTier} Demand
                      </span>
                      <span className="text-[9px] text-slate-450 font-semibold">
                        ~{sk.learningHours} study
                      </span>
                    </div>
                  </div>
                  <ExternalLink size={12} className="text-slate-400 group-hover:text-indigo-550 transition-colors" />
                </div>
              ))}
            </div>
          </CareerSection>

          {/* Framework Market Share */}
          <CareerSection title="Developer Framework Adoption Share" icon="dev">
            <div className="border border-slate-200 dark:border-slate-850 rounded-xl overflow-hidden bg-white dark:bg-slate-950">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3">Framework</th>
                    <th className="p-3">Sector</th>
                    <th className="p-3">Adoption Share</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs font-semibold text-slate-655 dark:text-slate-400">
                  {popularFrameworks.map((f) => (
                    <tr key={f.name} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10">
                      <td className="p-3 text-slate-850 dark:text-white font-bold">{f.name}</td>
                      <td className="p-3">{f.sector}</td>
                      <td className="p-3 font-mono">{f.share}</td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          f.status === 'Dominant' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500' : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-550'
                        }`}>
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CareerSection>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Weekly Highlights Timeline */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-880 p-5 rounded-2xl shadow-premium space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-indigo-650 dark:text-indigo-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
              <TrendingUp size={16} />
              Weekly Highlights
            </h3>
            
            <div className="relative border-l border-slate-200 dark:border-slate-800 pl-4 ml-2 space-y-4">
              {weeklyHighlights.map((hl, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-550 border-2 border-white dark:border-slate-900" />
                  <p className="text-xs text-slate-655 dark:text-slate-400 font-semibold leading-relaxed">
                    {hl}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Industry Reports & Surveys */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-premium space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-indigo-650 dark:text-indigo-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
              <Compass size={16} />
              Industry Reports
            </h3>

            <div className="space-y-4">
              {industryReports.map((rep) => (
                <div
                  key={rep.title}
                  onClick={() => window.open(rep.link, '_blank')}
                  className="p-4 border border-slate-100 dark:border-slate-850 hover:border-indigo-550/40 hover:bg-slate-50 dark:hover:bg-slate-950/20 rounded-xl cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs font-bold text-slate-850 dark:text-white leading-snug group-hover:text-indigo-655 dark:group-hover:text-indigo-400 transition-colors uppercase">
                      {rep.title}
                    </h4>
                    <ExternalLink size={12} className="text-slate-400 shrink-0 group-hover:text-indigo-500 transition-colors mt-0.5" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    {rep.summary}
                  </p>
                  <span className="text-[9px] text-slate-400 font-mono block">Published: {rep.date}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default TechTrends;
