import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Briefcase, 
  GraduationCap, 
  Cpu, 
  MapPin, 
  TrendingUp, 
  DollarSign, 
  Building, 
  FileCheck, 
  ExternalLink,
  PlusCircle,
  MinusCircle,
  CheckCircle,
  FileBadge,
  Terminal,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { CAREERS_DATA } from './careersData';
import { useStudent } from '../../../context/StudentContext';
import { THEME_COLOR_MAP } from '../../../components/StudentHubTheme';
import { bookmarkEngine } from '../utils/bookmarkEngine';
import RelatedRecommendations from '../components/RelatedRecommendations';

const CareerDetail = () => {
  const { careerId } = useParams();
  const navigate = useNavigate();
  const { profile } = useStudent();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  // Find career by id
  const career = CAREERS_DATA.find(c => c.id === careerId);

  // Active tab state
  const [activeTab, setActiveTab] = useState('overview');
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (career) {
      // Log view
      bookmarkEngine.logView({
        id: career.id,
        name: career.title,
        type: 'Career',
        url: `/career/explore/${career.id}`
      });
      setIsBookmarked(bookmarkEngine.isBookmarked(career.id, 'Career'));
    }
  }, [career]);

  const handleToggleBookmark = () => {
    const bookmarked = bookmarkEngine.toggleBookmark({
      id: career.id,
      name: career.title,
      type: 'Career',
      url: `/career/explore/${career.id}`
    });
    setIsBookmarked(bookmarked);
  };

  if (!career) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-bold text-red-500">Career Path Not Found</h2>
        <p className="text-xs text-slate-500">The career profile matching ID "{careerId}" does not exist.</p>
        <button
          onClick={() => navigate('/career/explore')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
        >
          Return to Career Grid
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview & Work', icon: Briefcase },
    { id: 'skills', name: 'Skills & Tech Stack', icon: Terminal },
    { id: 'market', name: 'Growth & Salary', icon: TrendingUp },
    { id: 'resources', name: 'Resources & Certifications', icon: GraduationCap }
  ];

  // Companion careers
  const relatedRecs = CAREERS_DATA
    .filter(c => c.id !== career.id)
    .slice(0, 2)
    .map(c => ({ id: c.id, name: c.title, type: 'Career', url: `/career/explore/${c.id}` }));

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans pb-10 max-w-5xl mx-auto">
      {/* Top action row */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => navigate('/career/explore')}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back to Careers Grid
        </button>

        <button
          onClick={handleToggleBookmark}
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
              <span>Save Career Path</span>
            </>
          )}
        </button>
      </div>

      {/* Hero Banner */}
      <div className={`bg-gradient-to-r ${theme.gradient} border ${theme.border} p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-xl text-white`}>
        <div className="absolute right-0 top-0 w-80 h-80 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
            Specialized Track
          </span>
          <h1 className="text-2xl md:text-3xl font-black mt-3 font-heading">
            {career.title}
          </h1>
          <p className="text-slate-200 text-xs md:text-sm mt-2 max-w-2xl leading-relaxed">
            {career.shortDescription}
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 dark:border-slate-855 overflow-x-auto space-x-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-indigo-650 text-indigo-650 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
            >
              <Icon size={14} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Main Grid: Detail content + Sidebar recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Main Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-2xl shadow-premium">
          {activeTab === 'overview' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">Role Overview</h3>
                <p className="text-xs text-slate-655 dark:text-slate-450 leading-relaxed">
                  {career.overview}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">Day-in-the-Life & Daily Work</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {career.dailyWork.map((task, idx) => (
                    <div 
                      key={idx} 
                      className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 flex items-start gap-3"
                    >
                      <CheckCircle className="text-indigo-500 shrink-0 mt-0.5" size={14} />
                      <span className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed font-semibold">{task}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 border border-slate-100 dark:border-slate-850 p-5 rounded-2xl bg-emerald-500/5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-650 dark:text-emerald-400 flex items-center gap-1.5 font-heading">
                    <PlusCircle size={14} />
                    Pros of this Path
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-655 dark:text-slate-400 font-semibold">
                    {career.pros.map((pro, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-500 shrink-0 mt-0.5">•</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3 border border-slate-100 dark:border-slate-850 p-5 rounded-2xl bg-rose-500/5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-650 dark:text-rose-455 flex items-center gap-1.5 font-heading">
                    <MinusCircle size={14} />
                    Cons & Challenges
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-655 dark:text-slate-400 font-semibold">
                    {career.cons.map((con, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-500 shrink-0 mt-0.5">•</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'skills' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">Core Skills Required</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {career.requiredSkills.map((skill, idx) => (
                    <div key={idx} className="flex gap-3 items-start border-l-4 border-l-indigo-650 pl-4 py-1">
                      <span className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed font-semibold">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-100 dark:border-slate-850 pt-6">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">Target Technology Stack</h3>
                <p className="text-[11px] text-slate-500 mb-4">Focus on mastering these packages, frameworks, and languages.</p>
                <div className="flex flex-wrap gap-2.5">
                  {career.techStack.map((tech, idx) => (
                    <span 
                      key={idx} 
                      className="px-3.5 py-1.5 text-xs font-bold font-mono rounded-xl bg-slate-100 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-350"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'market' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">Salary Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-5 border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Entry Level</span>
                      <span className="text-xl font-black text-slate-800 dark:text-white mt-1 block">{career.salaryOverview.entry}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 font-mono">0-2 Years Experience</p>
                  </div>

                  <div className="p-5 border border-indigo-200 dark:border-indigo-950/60 bg-indigo-500/5 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute right-0 top-0 bg-indigo-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                      Average
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider block">Mid Career</span>
                      <span className="text-xl font-black text-indigo-650 dark:text-indigo-400 mt-1 block">{career.salaryOverview.mid}</span>
                    </div>
                    <p className="text-[10px] text-indigo-500 dark:text-indigo-400 mt-2 font-mono">2-5 Years Experience</p>
                  </div>

                  <div className="p-5 border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Senior / Lead</span>
                      <span className="text-xl font-black text-slate-800 dark:text-white mt-1 block">{career.salaryOverview.senior}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 font-mono">5+ Years Experience</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-100 dark:border-slate-850 pt-6">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">Dream Companies Hiring</h3>
                <div className="flex flex-wrap gap-4">
                  {career.typicalCompanies.map((company, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-350">
                      <Building size={12} className="text-indigo-500" />
                      {company}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-100 dark:border-slate-850 pt-6">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">Career Growth & Progression</h3>
                <div className="relative border-l-2 border-l-slate-200 dark:border-l-slate-800 pl-6 ml-2 space-y-6">
                  {career.careerGrowth.map((stage, idx) => (
                    <div key={idx} className="relative">
                      <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-indigo-500 bg-white dark:bg-slate-950 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      </span>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold bg-indigo-550 dark:bg-indigo-950/40 text-white dark:text-indigo-400 px-2 py-0.5 rounded-md font-mono">
                          Stage {idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">{stage}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-100 dark:border-slate-855 pt-6">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading font-heading">Future Scope & Outlook</h3>
                <p className="text-xs text-slate-655 dark:text-slate-455 leading-relaxed">
                  {career.futureScope}
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'resources' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">Required & Recommended Certifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {career.requiredCertifications.map((cert, idx) => (
                    <div key={idx} className="p-4 border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-955/40 rounded-xl flex items-center gap-3">
                      <FileBadge size={22} className="text-indigo-500 shrink-0" />
                      <span className="text-xs text-slate-850 dark:text-slate-300 font-bold leading-normal">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-100 dark:border-slate-850 pt-6">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">Curated Study Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {career.resources.map((res, idx) => (
                    <a 
                      key={idx} 
                      href={res.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-4 border border-slate-200 dark:border-slate-855 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-950/40 rounded-xl flex items-center justify-between group transition-all"
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                          {res.name}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">External Tutorial Link</span>
                      </div>
                      <ExternalLink size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {relatedRecs.length > 0 && (
            <RelatedRecommendations
              title="Related Career Tracks"
              items={relatedRecs}
              onItemClick={(item) => navigate(item.url)}
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default CareerDetail;
