import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Code, Clock, ArrowLeft, Bookmark, BookmarkCheck } from 'lucide-react';
import { PROJECTS_DATA } from './projectsData';
import { useStudent } from '../../../context/StudentContext';
import { THEME_COLOR_MAP } from '../../../components/StudentHubTheme';
import { bookmarkEngine } from '../utils/bookmarkEngine';
import { rankItemsByProfile } from '../utils/personalizationEngine';

const categories = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Industry Projects'];

const ProjectStudio = () => {
  const navigate = useNavigate();
  const { profile } = useStudent();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  // Load bookmarks on mount
  useEffect(() => {
    const list = bookmarkEngine.getBookmarks();
    setBookmarkedIds(list.filter(b => b.type === 'Project').map(b => b.id));
  }, []);

  const handleToggleBookmark = (e, proj) => {
    e.stopPropagation();
    bookmarkEngine.toggleBookmark({
      id: proj.id,
      name: proj.title,
      type: 'Project',
      url: `/career/projects/${proj.id}`
    });
    const list = bookmarkEngine.getBookmarks();
    setBookmarkedIds(list.filter(b => b.type === 'Project').map(b => b.id));
  };

  // Rank projects by profile goal
  const sortedProjects = rankItemsByProfile(PROJECTS_DATA, 'proj');

  const filteredProjects = sortedProjects.filter(proj => {
    const matchesSearch = proj.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          proj.overview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || proj.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 text-slate-800 dark:text-slate-100 font-sans pb-10 max-w-5xl mx-auto">
      {/* Back button */}
      <button 
        onClick={() => navigate('/career')}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors bg-transparent border-none cursor-pointer"
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
            Project Studio
          </h1>
          <p className="text-slate-200 text-xs md:text-sm mt-1 max-w-xl leading-relaxed">
            Build production-grade applications to highlight on your resume. Study full system architectures, folder layouts, and key deployment steps.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 border border-slate-202/80 dark:border-slate-805 p-5 rounded-2xl shadow-premium">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by tech or name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-100 placeholder-slate-400 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap gap-2 overflow-x-auto py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-indigo-650 border-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((proj) => {
          const isBookmarked = bookmarkedIds.includes(proj.id);
          return (
            <motion.div
              key={proj.id}
              onClick={() => {
                bookmarkEngine.logView({ id: proj.id, name: proj.title, type: 'Project', url: `/career/projects/${proj.id}` });
                navigate(`/career/projects/${proj.id}`);
              }}
              whileHover={{ y: -5, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="group cursor-pointer bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl hover:border-indigo-500/40 dark:hover:border-indigo-500/40 p-6 flex flex-col justify-between shadow-premium hover:shadow-premium-lg transition-all duration-300 relative overflow-hidden h-[240px]"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

              <div>
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400">
                    <Code size={18} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                      {proj.category}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold font-mono">
                      <Clock size={10} />
                      {proj.estimatedTime}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-wider">
                    {proj.title}
                  </h3>
                  <p className="mt-2 text-[11px] text-slate-650 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {proj.architecture}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 relative">
                <div className="flex gap-1.5 max-w-[60%] overflow-hidden">
                  {proj.techStack.slice(0, 3).map((tech, idx) => (
                    <span key={idx} className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-202 dark:border-slate-850 text-slate-500">
                      {tech}
                    </span>
                  ))}
                  {proj.techStack.length > 3 && (
                    <span className="text-[9px] font-bold text-slate-400">+{proj.techStack.length - 3}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleToggleBookmark(e, proj)}
                    className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                  >
                    {isBookmarked ? (
                      <BookmarkCheck size={12} className="text-emerald-500 fill-emerald-500" />
                    ) : (
                      <Bookmark size={12} />
                    )}
                  </button>

                  <span className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform shrink-0">
                    View Studio
                    <ArrowRight size={10} />
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
          <span className="text-3xl mb-2">💻</span>
          <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase">No Projects Found</h3>
          <p className="text-[11px] text-slate-500 mt-1">Try adjusting category or search parameters.</p>
        </div>
      )}
    </div>
  );
};

export default ProjectStudio;
