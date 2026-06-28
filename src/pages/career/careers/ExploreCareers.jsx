import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  ArrowRight, 
  Brain, 
  Database, 
  LineChart, 
  Terminal, 
  Cloud, 
  Lock, 
  BarChart2, 
  Briefcase, 
  Monitor, 
  HardDrive, 
  GitBranch, 
  Palette,
  ArrowLeft,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { CAREERS_DATA } from './careersData';
import { useStudent } from '../../../context/StudentContext';
import { THEME_COLOR_MAP } from '../../../components/StudentHubTheme';
import { bookmarkEngine } from '../utils/bookmarkEngine';
import { rankItemsByProfile } from '../utils/personalizationEngine';

// Map career IDs to corresponding Lucide icons
const getCareerIcon = (id) => {
  switch (id) {
    case 'ai-engineer': return Brain;
    case 'ml-engineer': return Database;
    case 'data-scientist': return LineChart;
    case 'software-engineer': return Terminal;
    case 'cloud-engineer': return Cloud;
    case 'cybersecurity-engineer': return Lock;
    case 'data-analyst': return BarChart2;
    case 'business-analyst': return Briefcase;
    case 'frontend-developer': return Monitor;
    case 'backend-developer': return HardDrive;
    case 'devops-engineer': return GitBranch;
    case 'ui-ux-designer': return Palette;
    default: return Briefcase;
  }
};

const ExploreCareers = () => {
  const navigate = useNavigate();
  const { profile } = useStudent();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  // Load bookmarks on mount
  useEffect(() => {
    const list = bookmarkEngine.getBookmarks();
    setBookmarkedIds(list.filter(b => b.type === 'Career').map(b => b.id));
  }, []);

  const handleToggleBookmark = (e, career) => {
    e.stopPropagation();
    bookmarkEngine.toggleBookmark({
      id: career.id,
      name: career.title,
      type: 'Career',
      url: `/career/explore/${career.id}`
    });
    const list = bookmarkEngine.getBookmarks();
    setBookmarkedIds(list.filter(b => b.type === 'Career').map(b => b.id));
  };

  // Categorize careers for filtering
  const getDomainGroup = (id) => {
    if (['ai-engineer', 'ml-engineer', 'data-scientist'].includes(id)) return 'Data & AI';
    if (['software-engineer', 'frontend-developer', 'backend-developer'].includes(id)) return 'Development';
    if (['cloud-engineer', 'devops-engineer', 'cybersecurity-engineer'].includes(id)) return 'Infrastructure & Security';
    if (['data-analyst', 'business-analyst'].includes(id)) return 'Analytics & Strategy';
    if (id === 'ui-ux-designer') return 'Design';
    return 'Other';
  };

  // Rank careers by profile goal
  const sortedCareers = rankItemsByProfile(CAREERS_DATA, 'career');

  const filteredCareers = sortedCareers.filter(career => {
    const matchesSearch = career.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          career.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    
    const domainGroup = getDomainGroup(career.id);
    const matchesDomain = selectedDomain === 'All' || domainGroup === selectedDomain;

    return matchesSearch && matchesDomain;
  });

  const domains = ['All', 'Data & AI', 'Development', 'Infrastructure & Security', 'Analytics & Strategy', 'Design'];

  return (
    <div className="space-y-8 text-slate-800 dark:text-slate-100 font-sans pb-10 max-w-5xl mx-auto">
      {/* Breadcrumbs / Back button */}
      <button 
        onClick={() => navigate('/career')}
        className="flex items-center gap-2 text-xs font-bold text-slate-505 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors bg-transparent border-none cursor-pointer"
      >
        <ArrowLeft size={14} />
        Back to Dashboard
      </button>

      {/* Header Banner */}
      <div className={`bg-gradient-to-r ${theme.gradient} border ${theme.border} p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-xl text-white`}>
        <div className="absolute right-0 top-0 w-80 h-80 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
            Placement Prep Suite
          </span>
          <h1 className="text-2xl md:text-3xl font-black mt-3 font-heading">
            Explore Careers
          </h1>
          <p className="text-slate-200 text-xs md:text-sm mt-1 max-w-xl leading-relaxed">
            Unlock complete market overviews, stack configurations, salary structures, pros/cons, and curated training blueprints for 12 core industry tracks.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-premium">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-405">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles or keywords..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-100 placeholder-slate-405 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto overflow-x-auto py-1">
          {domains.map((dom) => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border transition-all cursor-pointer whitespace-nowrap ${
                selectedDomain === dom
                  ? 'bg-indigo-650 border-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60'
              }`}
            >
              {dom}
            </button>
          ))}
        </div>
      </div>

      {/* Careers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCareers.map((career) => {
          const Icon = getCareerIcon(career.id);
          const domainGroup = getDomainGroup(career.id);
          const isBookmarked = bookmarkedIds.includes(career.id);
          return (
            <motion.div
              key={career.id}
              onClick={() => {
                bookmarkEngine.logView({ id: career.id, name: career.title, type: 'Career', url: `/career/explore/${career.id}` });
                navigate(`/career/explore/${career.id}`);
              }}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="group cursor-pointer bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl hover:border-indigo-500/40 dark:hover:border-indigo-500/40 p-5 flex flex-col justify-between shadow-premium hover:shadow-premium-lg transition-all duration-300 relative overflow-hidden h-[240px]"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

              <div>
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                    <Icon size={20} />
                  </div>
                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-405">
                    {domainGroup}
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {career.title}
                  </h3>
                  <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 font-medium">
                    {career.shortDescription}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 relative">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  {career.salaryOverview.entry} Entry
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleToggleBookmark(e, career)}
                    className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                  >
                    {isBookmarked ? (
                      <BookmarkCheck size={12} className="text-emerald-500 fill-emerald-500" />
                    ) : (
                      <Bookmark size={12} />
                    )}
                  </button>

                  <span className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Path
                    <ArrowRight size={10} />
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredCareers.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
          <span className="text-3xl mb-2">🔍</span>
          <h3 className="text-xs font-bold text-slate-855 dark:text-white uppercase">No Career Paths Match</h3>
          <p className="text-[11px] text-slate-500 mt-1">Try adjusting your search criteria or domain filter.</p>
        </div>
      )}
    </div>
  );
};

export default ExploreCareers;
