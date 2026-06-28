import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  BookOpen, 
  Code, 
  MessageSquare, 
  Bookmark, 
  BookmarkCheck,
  ExternalLink, 
  GraduationCap, 
  Play, 
  CheckCircle,
  FileText,
  HelpCircle,
  Compass
} from 'lucide-react';
import { SKILLS_DATA } from './skillsData';
import { useStudent } from '../../../context/StudentContext';
import { THEME_COLOR_MAP } from '../../../components/StudentHubTheme';
import { bookmarkEngine } from '../utils/bookmarkEngine';
import RelatedRecommendations from '../components/RelatedRecommendations';

const SkillDetail = () => {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const { profile } = useStudent();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  // Find skill by id
  const skill = SKILLS_DATA.find(s => s.id === skillId);

  // Tab State
  const [activeTab, setActiveTab] = useState('syllabus');
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (skill) {
      // Log view
      bookmarkEngine.logView({
        id: skill.id,
        name: skill.title,
        type: 'Skill',
        url: `/career/skills/${skill.id}`
      });
      setIsBookmarked(bookmarkEngine.isBookmarked(skill.id, 'Skill'));
    }
  }, [skill]);

  const handleToggleBookmark = () => {
    const bookmarked = bookmarkEngine.toggleBookmark({
      id: skill.id,
      name: skill.title,
      type: 'Skill',
      url: `/career/skills/${skill.id}`
    });
    setIsBookmarked(bookmarked);
  };

  if (!skill) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-bold text-red-500 font-heading">Skill Not Found</h2>
        <p className="text-xs text-slate-500">The skill track matching ID "{skillId}" does not exist.</p>
        <button
          onClick={() => navigate('/career/skills')}
          className="px-4 py-2 bg-indigo-650 hover:bg-indigo-650 text-white rounded-xl text-xs font-bold"
        >
          Return to Skills List
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'syllabus', name: 'Overview & Syllabus', icon: BookOpen },
    { id: 'projects', name: 'Projects & Practice', icon: Code },
    { id: 'interview', name: 'Interview Prep & Cheat Sheet', icon: MessageSquare },
    { id: 'study', name: 'Courses & References', icon: GraduationCap }
  ];

  // Companion skills
  const relatedRecs = SKILLS_DATA
    .filter(s => s.id !== skill.id && s.category === skill.category)
    .slice(0, 2)
    .map(s => ({ id: s.id, name: s.title, type: 'Skill', url: `/career/skills/${s.id}` }));

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans pb-10 max-w-5xl mx-auto">
      {/* Top action row */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => navigate('/career/skills')}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back to Skills List
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
              <span>Save Skill Track</span>
            </>
          )}
        </button>
      </div>

      {/* Hero Banner */}
      <div className={`bg-gradient-to-r ${theme.gradient} border ${theme.border} p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-xl text-white`}>
        <div className="absolute right-0 top-0 w-80 h-80 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
            {skill.category} Track
          </span>
          <h1 className="text-2xl md:text-3xl font-black mt-3 font-heading uppercase tracking-wider">
            {skill.title}
          </h1>
          <p className="text-slate-200 text-xs md:text-sm mt-2 max-w-2xl leading-relaxed">
            {skill.overview}
          </p>
        </div>
      </div>

      {/* Tabs Selection Menu */}
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

      {/* Grid layout: main panel + companion recommendations sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Main Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-2xl shadow-premium">
          {activeTab === 'syllabus' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/30 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Difficulty</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">{skill.difficulty}</span>
                </div>
                <div className="p-4 rounded-xl border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/30 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Prerequisites</span>
                  <div className="flex flex-wrap gap-2">
                    {skill.prerequisites.map((prereq, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-[10px] font-bold text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-950">
                        {prereq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-heading">Core Syllabus Topics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skill.topics.map((topic, idx) => (
                    <div key={idx} className="flex gap-3 items-center border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 p-3.5 rounded-xl">
                      <CheckCircle className="text-indigo-500 shrink-0" size={14} />
                      <span className="text-xs text-slate-650 dark:text-slate-400 leading-normal font-semibold">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-100 dark:border-slate-850 pt-6">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-heading">Structured Learning Path</h3>
                <div className="relative border-l-2 border-l-slate-200 dark:border-l-slate-800 pl-6 ml-2 space-y-6">
                  {skill.learningPath.map((step, idx) => (
                    <div key={idx} className="relative">
                      <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-indigo-500 bg-white dark:bg-slate-950 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      </span>
                      <h4 className="text-xs text-slate-655 dark:text-slate-400 font-semibold leading-relaxed">{step}</h4>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'projects' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-heading">Practice Sandboxes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skill.practiceResources.map((res, idx) => (
                    <a 
                      key={idx} 
                      href={res.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-4 border border-slate-200 dark:border-slate-850 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-955/40 rounded-xl flex items-center justify-between group transition-all"
                    >
                      <span className="text-xs font-bold text-slate-850 dark:text-slate-200 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                        {res.name}
                      </span>
                      <ExternalLink size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-100 dark:border-slate-850 pt-6">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-heading">Mini Projects (Beginner-Friendly)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skill.miniProjects.map((proj, idx) => (
                    <div key={idx} className="p-4 border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl space-y-1">
                      <span className="text-[9px] font-bold text-indigo-500 uppercase font-mono">Mini Project {idx+1}</span>
                      <p className="text-xs text-slate-850 dark:text-slate-350 font-bold leading-normal">{proj}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-100 dark:border-slate-850 pt-6">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-heading">Major Projects (Portfolio-Grade)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skill.majorProjects.map((proj, idx) => (
                    <div key={idx} className="p-4 border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl space-y-1">
                      <span className="text-[9px] font-bold text-indigo-500 uppercase font-mono">Major Project {idx+1}</span>
                      <p className="text-xs text-slate-850 dark:text-slate-350 font-bold leading-normal">{proj}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'interview' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-heading">Shorthand Cheat Sheet</h3>
                <div className="p-4 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl font-mono text-[11px] text-indigo-650 dark:text-indigo-400 whitespace-pre-wrap leading-relaxed shadow-sm">
                  {skill.cheatSheet}
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-100 dark:border-slate-850 pt-6">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-heading">High-Yield Interview Q&As</h3>
                <div className="space-y-4">
                  {skill.interviewQuestions.map((qa, idx) => (
                    <div key={idx} className="p-4 border border-slate-150 dark:border-slate-855 rounded-xl bg-slate-50/40 dark:bg-slate-950/20 space-y-2">
                      <div className="flex items-start gap-2 text-xs font-bold text-slate-900 dark:text-white">
                        <HelpCircle size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                        <span>{qa.q}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pl-6 border-l-2 border-l-slate-200 dark:border-l-slate-800">
                        {qa.a}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'study' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-heading">Official Documentation</h3>
                <a 
                  href={skill.officialDocs} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-850 rounded-xl hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-950/40 text-xs font-bold text-slate-700 dark:text-slate-350 transition-all"
                >
                  <Compass size={14} className="text-indigo-500" />
                  Launch Developer Docs
                  <ExternalLink size={12} />
                </a>
              </div>

              <div className="space-y-4 border-t border-slate-100 dark:border-slate-850 pt-6">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-heading">Recommended Literature</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skill.books.map((book, idx) => (
                    <div key={idx} className="p-4 border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-955/40 rounded-xl flex items-center gap-3">
                      <Bookmark size={18} className="text-indigo-500 shrink-0" />
                      <span className="text-xs text-slate-850 dark:text-slate-300 font-bold leading-normal">{book}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-100 dark:border-slate-850 pt-6">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-heading">Structured Courses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skill.courses.map((course, idx) => (
                    <div key={idx} className="p-4 border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-955/40 rounded-xl flex items-center gap-3">
                      <GraduationCap className="text-indigo-500 shrink-0" size={18} />
                      <span className="text-xs text-slate-850 dark:text-slate-300 font-bold leading-normal">{course}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-100 dark:border-slate-850 pt-6">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-heading font-heading">Video Tutorials</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skill.videos.map((vid, idx) => (
                    <div key={idx} className="p-4 border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-955/40 rounded-xl flex items-center gap-3">
                      <Play className="text-indigo-500 shrink-0" size={18} />
                      <span className="text-xs text-slate-850 dark:text-slate-300 font-bold leading-normal">{vid}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar recommendations */}
        <div className="space-y-6">
          {relatedRecs.length > 0 && (
            <RelatedRecommendations
              title="Companion Skill Tracks"
              items={relatedRecs}
              onItemClick={(item) => navigate(item.url)}
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default SkillDetail;
