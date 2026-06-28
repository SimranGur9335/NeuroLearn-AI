import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Code, 
  Terminal, 
  Cpu, 
  FileText, 
  ExternalLink, 
  Compass, 
  Play, 
  CheckCircle,
  HelpCircle,
  Clock,
  Layers,
  Wrench,
  Server,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { PROJECTS_DATA } from './projectsData';
import { useStudent } from '../../../context/StudentContext';
import { THEME_COLOR_MAP } from '../../../components/StudentHubTheme';
import { bookmarkEngine } from '../utils/bookmarkEngine';
import RelatedRecommendations from '../components/RelatedRecommendations';

// Custom GitHub SVG Icon component to bypass brand icon removal in lucide-react
const Github = ({ size = 24, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { profile } = useStudent();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  // Find project by id
  const project = PROJECTS_DATA.find(p => p.id === projectId);

  // Tab State
  const [activeTab, setActiveTab] = useState('overview');
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (project) {
      // Log view
      bookmarkEngine.logView({
        id: project.id,
        name: project.title,
        type: 'Project',
        url: `/career/projects/${project.id}`
      });
      setIsBookmarked(bookmarkEngine.isBookmarked(project.id, 'Project'));
    }
  }, [project]);

  const handleToggleBookmark = () => {
    const bookmarked = bookmarkEngine.toggleBookmark({
      id: project.id,
      name: project.title,
      type: 'Project',
      url: `/career/projects/${project.id}`
    });
    setIsBookmarked(bookmarked);
  };

  if (!project) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-bold text-red-500 font-heading">Project Not Found</h2>
        <p className="text-xs text-slate-500">The project profile matching ID "{projectId}" does not exist.</p>
        <button
          onClick={() => navigate('/career/projects')}
          className="px-4 py-2 bg-indigo-650 text-white rounded-xl text-xs font-bold"
        >
          Return to Projects list
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview & Features', icon: Code },
    { id: 'architecture', name: 'Architecture & Code', icon: Layers },
    { id: 'deployment', name: 'Deployment & Resume', icon: Server },
    { id: 'qa', name: 'Q&A & Enhancements', icon: HelpCircle }
  ];

  // Recommendations
  const relatedRecs = PROJECTS_DATA
    .filter(p => p.id !== project.id && p.category === project.category)
    .slice(0, 2)
    .map(p => ({ id: p.id, name: p.title, type: 'Project', url: `/career/projects/${p.id}` }));

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans pb-10 max-w-5xl mx-auto">
      {/* Top action row */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => navigate('/career/projects')}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back to Project Studio
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
              <span>Save Project</span>
            </>
          )}
        </button>
      </div>

      {/* Hero Banner */}
      <div className={`bg-gradient-to-r ${theme.gradient} border ${theme.border} p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-xl text-white`}>
        <div className="absolute right-0 top-0 w-80 h-80 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
            {project.category} Portfolio Project
          </span>
          <h1 className="text-2xl md:text-3xl font-black mt-3 font-heading uppercase tracking-wider">
            {project.title}
          </h1>
          <p className="text-slate-200 text-xs md:text-sm mt-2 max-w-2xl leading-relaxed">
            {project.resumeDescription}
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 dark:border-slate-850 overflow-x-auto space-x-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-indigo-655 text-indigo-650 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
            >
              <Icon size={14} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Grid Layout containing Main Panel and Recommendation Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Main Tab Content Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-2xl shadow-premium">
          {activeTab === 'overview' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/30 flex items-center gap-3">
                  <Clock className="text-indigo-500" size={18} />
                  <div>
                    <span className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block">Estimated Build Time</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">{project.estimatedTime}</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/30 flex items-center gap-3">
                  <Wrench className="text-indigo-500" size={18} />
                  <div>
                    <span className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block">Difficulty Rating</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">{project.difficulty}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-heading">Core Tech Stack</h3>
                <div className="flex flex-wrap gap-2.5">
                  {project.techStack.map((tech, idx) => (
                    <span 
                      key={idx} 
                      className="px-3.5 py-1.5 text-xs font-bold font-mono rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 text-slate-705 dark:text-slate-350"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-100 dark:border-slate-850 pt-6">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-heading">Application Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.features.map((feat, idx) => (
                    <div key={idx} className="flex gap-3 items-center border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 p-3.5 rounded-xl">
                      <CheckCircle className="text-indigo-500 shrink-0" size={14} />
                      <span className="text-xs text-slate-650 dark:text-slate-400 leading-normal font-semibold">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'architecture' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-heading">System Architecture Overview</h3>
                <p className="text-xs text-slate-655 dark:text-slate-450 leading-relaxed">
                  {project.architecture}
                </p>
              </div>

              <div className="space-y-3 border-t border-slate-100 dark:border-slate-850 pt-6">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-heading">Primary Dataset / API Source</h3>
                <p className="text-xs text-slate-655 dark:text-slate-450 leading-relaxed">
                  {project.dataset}
                </p>
              </div>

              <div className="space-y-4 border-t border-slate-100 dark:border-slate-850 pt-6">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-heading">Standard Repository Folder Structure</h3>
                <div className="p-4 bg-slate-955 border border-slate-800 rounded-xl font-mono text-[11px] text-indigo-400 whitespace-pre-wrap leading-relaxed shadow-inner">
                  {project.folderStructure}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'deployment' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-heading">Project Repository</h3>
                <p className="text-xs text-slate-500">Access starter code repositories and push changes to showcase in evaluations.</p>
                <a 
                  href={project.githubPlaceholder}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <Github size={16} />
                  <span>Initialize Portfolio Repo</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              <div className="space-y-3 border-t border-slate-100 dark:border-slate-850 pt-6">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-heading">Deployment Strategy</h3>
                <p className="text-xs text-slate-655 dark:text-slate-450 leading-relaxed">
                  {project.deployment}
                </p>
              </div>

              <div className="space-y-3 border-t border-slate-100 dark:border-slate-850 pt-6">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-heading">Resume Bullet points (Action-Verb Calibrated)</h3>
                <p className="text-xs text-slate-550">Copy this directly to your CV profiles:</p>
                <div className="p-4 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl font-sans text-xs text-slate-850 dark:text-slate-350 leading-relaxed font-semibold italic border-l-4 border-l-indigo-650 pl-6">
                  "{project.resumeDescription}"
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'qa' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-heading">Project Defense Interview Q&As</h3>
                <div className="space-y-4">
                  {project.interviewQuestions.map((qa, idx) => (
                    <div key={idx} className="p-4 border border-slate-150 dark:border-slate-850 rounded-xl bg-slate-50/40 dark:bg-slate-950/20 space-y-2">
                      <div className="flex items-start gap-2 text-xs font-bold text-slate-900 dark:text-white">
                        <HelpCircle size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                        <span>{qa.q}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-450 leading-relaxed pl-6 border-l-2 border-l-slate-200 dark:border-l-slate-800 font-medium">
                        {qa.a}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-100 dark:border-slate-850 pt-6">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-heading">Future Expansion Scope</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.futureEnhancements.map((enh, idx) => (
                    <div key={idx} className="flex gap-3 items-center border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 p-3.5 rounded-xl">
                      <CheckCircle className="text-indigo-500 shrink-0" size={14} />
                      <span className="text-xs text-slate-650 dark:text-slate-450 leading-normal font-semibold">{enh}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-100 dark:border-slate-850 pt-6">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-heading">Build References & Documentation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.resources.map((res, idx) => (
                    <a 
                      key={idx} 
                      href={res.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-4 border border-slate-200 dark:border-slate-855 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-950/40 rounded-xl flex items-center justify-between group transition-all"
                    >
                      <span className="text-xs font-bold text-slate-855 dark:text-slate-200 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                        {res.name}
                      </span>
                      <ExternalLink size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar associations */}
        <div className="space-y-6">
          
          {relatedRecs.length > 0 && (
            <RelatedRecommendations
              title="Related Portfolio Projects"
              items={relatedRecs}
              onItemClick={(item) => navigate(item.url)}
            />
          )}

          {/* Quick links & references */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl text-white">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Terminal size={16} />
              Setup Guide
            </h3>
            <p className="text-xs text-slate-350 leading-relaxed font-semibold">
              Copy standard clone parameters, checkout starter templates, and push to target evaluations directly.
            </p>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[10px] text-emerald-400">
              git clone {project.githubPlaceholder}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProjectDetail;
