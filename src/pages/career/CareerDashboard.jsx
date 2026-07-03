import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  Map,
  Award,
  Code,
  Building2,
  FileBadge,
  FileText,
  MessageSquare,
  GraduationCap,
  BookOpen,
  Coins,
  TrendingUp,
  Briefcase,
  Star,
  Bookmark,
  History,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { THEME_COLOR_MAP } from '../../components/StudentHubTheme';
import CareerCard from './shared/CareerCard';
import CareerGlobalSearch from './components/CareerGlobalSearch';
import { bookmarkEngine } from './utils/bookmarkEngine';
import { getProfilePreferences, rankItemsByProfile } from './utils/personalizationEngine';
import CareerSection from './components/CareerSection';
import RelatedRecommendations from './components/RelatedRecommendations';

const CareerDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useStudent();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  // Local storage states
  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState([]);
  const [preferences, setPreferences] = useState({});

  useEffect(() => {
    setBookmarks(bookmarkEngine.getBookmarks());
    setHistory(bookmarkEngine.getHistory());
    setPreferences(getProfilePreferences());
  }, []);

  const handleGlobalSearchSelect = (item) => {
    // Log view history
    bookmarkEngine.logView({ id: item.id || item.name, name: item.name, type: item.type, url: item.url });
    setHistory(bookmarkEngine.getHistory());

    // Navigate to the respective sub-module page
    navigate(item.url);
  };

  const dashboardCards = [
    {
      id: 'explore-careers',
      title: 'Explore Careers',
      description: 'Discover high-demand roles, day-in-the-life overviews, salaries, and growth trajectories.',
      icon: Compass,
      badge: 'Roles',
      path: '/career/explore'
    },
    {
      id: 'career-roadmap',
      title: 'Career Roadmap',
      description: 'Visualize your structured milestone-by-milestone journey to target roles.',
      icon: Map,
      badge: 'Interactive',
      path: '/career/roadmap'
    },
    {
      id: 'skills',
      title: 'Skills',
      description: 'Master core tech stack layers with structured curriculum modules, cheat sheets, and books.',
      icon: Award,
      badge: 'Curriculum',
      path: '/career/skills'
    },
    {
      id: 'projects',
      title: 'Projects',
      description: 'Build portfolio-grade software projects across different difficulty tiers.',
      icon: Code,
      badge: 'Portfolio',
      path: '/career/projects'
    },
    {
      id: 'companies',
      title: 'Companies',
      description: 'Research target dream employers, hiring bars, interview structures, and details.',
      icon: Building2,
      badge: 'Directory',
      path: '/career/companies'
    },
    {
      id: 'certifications',
      title: 'Certifications',
      description: 'Browse recommended industry certifications to boost resume validation.',
      icon: FileBadge,
      badge: 'Credentials',
      path: '/career/certifications'
    },
    {
      id: 'resume-review',
      title: 'Resume Review',
      description: 'Access templates, standard action-verb check-sheets, and layout best practices.',
      icon: FileText,
      badge: 'CV Builder',
      path: '/career/resume'
    },
    {
      id: 'interview-practice',
      title: 'Interview Practice',
      description: 'Review domain-specific technical & behavioral interview questionnaire banks.',
      icon: MessageSquare,
      badge: 'Prep Q&A',
      path: '/career/interview'
    },
    {
      id: 'placement-prep',
      title: 'Placement Prep',
      description: 'Navigate mock calendars, placement aptitude sheets, and recruitment guidelines.',
      icon: GraduationCap,
      badge: 'Jobs Deck',
      path: '/career/placement'
    },
    {
      id: 'learning-hub',
      title: 'Learning Hub',
      description: 'Explore high-yield video courses, books, and reference documentation indices.',
      icon: BookOpen,
      badge: 'Knowledge',
      path: '/career/learning'
    },
    {
      id: 'salary-insights',
      title: 'Salary Insights',
      description: 'Analyze compensations across entry-level to staff-tier roles in key technology sectors.',
      icon: Coins,
      badge: 'Analytics',
      path: '/career/salary'
    },
    {
      id: 'tech-trends',
      title: 'Tech Trends',
      description: 'Stay ahead of emerging tools, packages, and frameworks shaping the industry.',
      icon: TrendingUp,
      badge: 'Live Trends',
      path: '/career/trends'
    }
  ];

  // Quick actions
  const quickActions = [
    { name: "Continue Learning", path: "/career/learning" },
    { name: "Resume Review", path: "/career/resume" },
    { name: "Start Interview Practice", path: "/career/interview" },
    { name: "View Companies", path: "/career/companies" }
  ];

  // Personalized mock recommendations
  const goalLower = (preferences.careerGoal || '').toLowerCase();
  const isAI = goalLower.includes('ai') || goalLower.includes('ml') || goalLower.includes('data');

  const personalizedRecommendations = isAI
    ? [
        { name: "AI Systems Engineer", type: "Target Career", url: "/career/explore" },
        { name: "Deep Learning Specialization", type: "Resource", url: "/career/learning" },
        { name: "AWS Machine Learning Specialty", type: "Certification", url: "/career/certifications" }
      ]
    : [
        { name: "Frontend Architecture Specialist", type: "Target Career", url: "/career/explore" },
        { name: "Next.js Advanced App Routing", type: "Resource", url: "/career/learning" },
        { name: "Meta Front-End Certificate", type: "Certification", url: "/career/certifications" }
      ];

  return (
    <div className="space-y-6 md:space-y-8 text-slate-800 dark:text-slate-100 font-sans pb-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Premium Hero Banner */}
      <div className={`bg-gradient-to-r ${theme.gradient} border ${theme.border} p-6 md:p-10 rounded-3xl relative overflow-hidden shadow-xl text-white`}>
        <div className="absolute right-0 top-0 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12)_0%,transparent_70%)] pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className={`text-xs ${theme.text} font-extrabold uppercase tracking-wider ${theme.bg} px-3.5 py-1.5 rounded-lg border ${theme.border} backdrop-blur-sm`}>
              {profile?.college || 'NeuroLearn Career Center'}
            </span>
            <h1 className="text-3xl md:text-4xl font-black mt-4 font-heading">
              Career Journey
            </h1>
            <p className="text-slate-200 text-sm md:text-base mt-2 max-w-2xl leading-relaxed font-medium">
              Build your skills, explore careers, prepare for placements, and achieve your dream role. Explore specialized modules crafted for premium industry readiness.
            </p>
          </div>
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 border border-white/20 shadow-md shrink-0 self-start md:self-auto">
            <Briefcase className="text-white" size={40} strokeWidth={1.8} />
          </div>
        </div>
      </div>

      {/* Global search overlay widget */}
      <div className="max-w-2xl mx-auto w-full">
        <CareerGlobalSearch onSelect={handleGlobalSearchSelect} />
      </div>

      {/* Main Grid: Features and Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        
        {/* Core Menu Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white font-heading">
                Placement Suite & Dashboard
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Navigate through specific areas to level up your resume, knowledge, and career positioning.
              </p>
            </div>
            {preferences.careerGoal && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 rounded-xl">
                <Sparkles size={12} className="text-indigo-500 animate-pulse" />
                <span className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 uppercase">
                  Goal: {preferences.careerGoal}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {dashboardCards.map((card) => (
              <CareerCard
                key={card.id}
                title={card.title}
                description={card.description}
                badge={card.badge}
                icon={card.icon}
                onClick={() => {
                  bookmarkEngine.logView({ id: card.id, name: card.title, type: card.badge, url: card.path });
                  setHistory(bookmarkEngine.getHistory());
                  navigate(card.path);
                }}
              />
            ))}
          </div>
        </div>

        {/* Sidebar widgets */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-6 rounded-2xl shadow-premium space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-indigo-650 dark:text-indigo-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
              <Sparkles size={16} />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {quickActions.map((act) => (
                <button
                  key={act.name}
                  onClick={() => navigate(act.path)}
                  className="w-full text-left p-3 border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 hover:border-indigo-500/40 hover:bg-slate-100/30 rounded-xl text-xs font-bold text-slate-850 dark:text-slate-200 transition-all flex justify-between items-center group cursor-pointer"
                >
                  <span>{act.name}</span>
                  <ArrowRight size={12} className="text-slate-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Personalization Recommendations */}
          <RelatedRecommendations
            title="Personalized For You"
            items={personalizedRecommendations}
            onItemClick={(item) => navigate(item.url)}
          />

          {/* Bookmarks */}
          <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-6 rounded-2xl shadow-premium space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-indigo-650 dark:text-indigo-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
              <Bookmark size={16} />
              Saved Bookmarks
            </h3>
            {bookmarks.length > 0 ? (
              <div className="space-y-2.5">
                {bookmarks.map((b, i) => (
                  <div
                    key={i}
                    onClick={() => navigate(b.url)}
                    className="p-3 border border-slate-100 dark:border-slate-850 rounded-xl bg-slate-50/20 dark:bg-slate-950/10 cursor-pointer hover:bg-slate-100/40 transition-all flex justify-between items-center"
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{b.name}</span>
                    <span className="text-[9px] font-mono text-slate-400 uppercase">{b.type}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">
                You haven't bookmarked any pathways, projects, or certifications yet.
              </p>
            )}
          </div>

          {/* Recently Viewed History */}
          <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-6 rounded-2xl shadow-premium space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-indigo-650 dark:text-indigo-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
              <History size={16} />
              Recently Viewed
            </h3>
            {history.length > 0 ? (
              <div className="space-y-2.5">
                {history.slice(0, 4).map((h, i) => (
                  <div
                    key={i}
                    onClick={() => navigate(h.url)}
                    className="p-3 border border-slate-100 dark:border-slate-850 rounded-xl bg-slate-50/20 dark:bg-slate-950/10 cursor-pointer hover:bg-slate-100/40 transition-all flex justify-between items-center"
                  >
                    <span className="text-xs font-bold text-slate-850 dark:text-slate-200">{h.name}</span>
                    <span className="text-[9px] font-mono text-slate-400 uppercase">{h.type}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">
                Your recently viewed path links will appear here.
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default CareerDashboard;
