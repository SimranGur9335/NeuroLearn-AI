import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Trophy, 
  Compass, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  BookOpen,
  Video,
  Award,
  CircleDot,
  Zap,
  Target
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import ContributionGrid from '../components/ContributionGrid';
import { RECOMMENDATIONS } from '../data/data';

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile, xp, streak, activeDomain } = useStudent();

  // Calculate Level and progress dynamically
  const baseLevelXp = 1000;
  const xpPerLevel = 500;
  const currentLevel = Math.floor((xp - baseLevelXp) / xpPerLevel) + 2; 
  const nextLevelXp = baseLevelXp + (currentLevel - 1) * xpPerLevel;
  const prevLevelXp = nextLevelXp - xpPerLevel;
  const xpInCurrentLevel = xp - prevLevelXp;
  const levelProgressPercentage = Math.min(100, Math.max(0, (xpInCurrentLevel / xpPerLevel) * 100));

  // Recommendations based on the active domain
  const domainRecommendations = RECOMMENDATIONS[activeDomain.id] || RECOMMENDATIONS["ai-ml"];

  const dailyQuests = [
    { id: 1, text: `Clear 1 Quiz node in ${activeDomain.title}`, completed: false, xpReward: 50, action: () => navigate('/roadmap') },
    { id: 2, text: "Review active industry certification routes", completed: false, xpReward: 30, action: () => navigate('/career') },
    { id: 3, text: "Maintain active study consistency streak", completed: true, xpReward: 20, action: null },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 text-slate-800 dark:text-slate-100 font-sans"
    >
      {/* Welcome Hero Banner */}
      <div 
        className="relative overflow-hidden rounded-2xl border border-indigo-500/20 p-6 md:p-8 shadow-premium text-white"
        style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 50%, #2563EB 100%)' }}
      >
        <div className="absolute right-0 top-0 w-80 h-80 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] text-white/80 font-mono font-bold uppercase tracking-wider bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
              {profile.college}
            </span>
            <h1 className="text-xl md:text-3xl font-bold tracking-tight mt-4 text-white font-heading">
              Welcome back, {profile.name}
            </h1>
            <p className="text-white/80 text-xs md:text-sm mt-2 max-w-xl leading-relaxed">
              Your customized curriculum pathway has been generated based on active major <span className="text-white font-semibold">{profile.branch}</span> and latest test scores.
            </p>
          </div>
          <button 
            onClick={() => navigate('/roadmap')}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm hover:translate-y-[-1px] text-xs shrink-0 flex items-center gap-2 cursor-pointer backdrop-blur-md self-start md:self-auto"
          >
            Resume Pathway
            <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Gamified cards - Broken Visual Symmetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* XP Level Tracker Card - Compact, rounded-2xl */}
        <div className="lg:col-span-4 bg-white dark:bg-brand-card border border-slate-200 dark:border-brand-border p-5 rounded-2xl shadow-premium flex flex-col justify-between hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider font-heading">Milestones</h3>
              <p className="text-[10px] text-slate-400 dark:text-brand-muted font-mono">XP System stats</p>
            </div>
            <span className="bg-brand-primary/5 text-brand-primary text-[10px] px-2 py-0.5 rounded-lg font-bold border border-brand-primary/20">
              LVL {currentLevel}
            </span>
          </div>

          <div className="flex items-center gap-4 py-4">
            <div className="relative w-12 h-12 shrink-0 flex items-center justify-center border-2 border-slate-100 dark:border-brand-borderlight rounded-full bg-slate-50 dark:bg-brand-cardlight">
              <span className="font-mono text-sm font-bold text-slate-800 dark:text-white">{currentLevel}</span>
            </div>
            <div className="min-w-0">
              <span className="text-[9px] text-slate-400 dark:text-brand-muted block uppercase font-mono">Total Points</span>
              <span className="font-bold text-xl text-slate-800 dark:text-white font-mono">{xp} XP</span>
              <p className="text-[9px] text-slate-500 mt-0.5 font-mono">
                {nextLevelXp - xp} XP to LVL {currentLevel + 1}
              </p>
            </div>
          </div>

          <div className="w-full bg-slate-100 dark:bg-brand-border h-1.5 rounded-full overflow-hidden">
            <div className="bg-brand-primary h-full transition-all duration-500" style={{ width: `${levelProgressPercentage}%` }} />
          </div>
        </div>

        {/* Daily Quests Card - Dashed border, rounded-2xl */}
        <div className="lg:col-span-5 bg-slate-50/50 dark:bg-brand-card/40 border border-dashed border-slate-350 dark:border-brand-borderlight p-6 rounded-2xl shadow-sm hover:shadow transition-shadow">
          <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5 font-heading">
            <Flame className="text-brand-accent fill-current animate-pulse" size={14} />
            Daily Tasks
          </h3>
          <div className="space-y-2">
            {dailyQuests.map((quest) => (
              <div 
                key={quest.id}
                onClick={quest.action}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-[10px] transition-all ${
                  quest.action ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-brand-cardlight/40 border-slate-200 dark:border-brand-border' : 'border-slate-150 dark:border-brand-border/60'
                } ${
                  quest.completed 
                    ? 'bg-slate-100/50 dark:bg-brand-dark/20 text-slate-400 dark:text-brand-muted/65 line-through' 
                    : 'bg-white dark:bg-brand-card text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 size={13} className={quest.completed ? "text-brand-secondary" : "text-slate-300 dark:text-brand-borderlight"} />
                  <span className="font-medium truncate">{quest.text}</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded-lg font-mono text-[9px] shrink-0 ${
                  quest.completed 
                    ? 'bg-slate-150 dark:bg-brand-dark text-slate-400' 
                    : 'bg-brand-primary/5 text-brand-primary border border-brand-primary/10'
                }`}>
                  +{quest.xpReward} XP
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Active Path Card - Accent Left Border, rounded-2xl */}
        <div className="lg:col-span-3 bg-white dark:bg-brand-card border-y border-r border-slate-200 dark:border-brand-border border-l-4 border-l-brand-primary p-5 rounded-r-2xl rounded-l-md shadow-premium flex flex-col justify-between hover:shadow transition-shadow">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Curriculum Path</h3>
            <p className="text-[10px] text-slate-400 dark:text-brand-muted font-mono">Active tracking track</p>
          </div>

          <div className="bg-slate-50 dark:bg-brand-dark/40 p-3 rounded-xl border border-slate-150 dark:border-brand-borderlight/60 my-2">
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate block">
              {activeDomain.title}
            </span>
            <p className="text-[10px] text-slate-500 dark:text-brand-muted mt-1 line-clamp-2">
              {activeDomain.description}
            </p>
          </div>

          <button 
            onClick={() => navigate('/domains')}
            className="w-full py-2 rounded-xl border border-slate-200 dark:border-brand-border hover:bg-slate-50 dark:hover:bg-brand-cardlight text-[10px] font-bold transition-colors cursor-pointer text-slate-650 dark:text-slate-350"
          >
            Switch Domain
          </button>
        </div>
      </div>

      {/* Grid of study hours */}
      <ContributionGrid />

      {/* Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Smart Recommendations List - Redesigned asymmetry */}
        <div className="bg-slate-50/50 dark:bg-brand-card/40 border border-slate-200 dark:border-brand-border p-6 rounded-2xl lg:col-span-2 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5 font-heading">
              <Sparkles className="text-brand-primary" size={14} />
              AI Study Pathways: {activeDomain.title}
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-brand-muted">Calibrated learning units generated for your skill metrics.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {domainRecommendations.map((rec, index) => {
              const isCourse = rec.type === "Course";
              const isVideo = rec.type === "Video";
              const Icon = isCourse ? BookOpen : isVideo ? Video : Award;
              
              // Vary layout structure based on card index to break symmetry
              const isHorizontal = index === 0;

              return (
                <div 
                  key={index}
                  className={`p-4 rounded-2xl border border-slate-200 dark:border-brand-border bg-white dark:bg-brand-card flex transition-all hover:-translate-y-0.5 hover:shadow-sm ${
                    isHorizontal ? 'sm:col-span-2 flex-row justify-between items-start gap-4' : 'flex-col justify-between min-h-[140px]'
                  }`}
                >
                  <div className={isHorizontal ? 'flex-1 min-w-0' : ''}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-lg font-mono ${
                        isCourse ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' :
                        isVideo ? 'bg-red-50 text-brand-danger dark:bg-rose-950/40 dark:text-brand-danger' :
                        'bg-emerald-50 text-brand-secondary dark:bg-teal-950/40 dark:text-brand-secondary'
                      }`}>
                        {rec.type}
                      </span>
                      {!isHorizontal && <Icon size={12} className="text-slate-400" />}
                    </div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-white line-clamp-2 leading-relaxed">
                      {rec.title}
                    </h4>
                    {isHorizontal && (
                      <p className="text-[9px] text-slate-400 mt-1 font-mono truncate">{rec.provider || rec.channel || rec.issuer}</p>
                    )}
                  </div>
                  <div className={`pt-2 flex justify-between items-center text-[9px] ${
                    isHorizontal ? 'flex-col items-end gap-3 shrink-0' : 'mt-2 border-t border-slate-100 dark:border-brand-borderlight/60'
                  }`}>
                    {!isHorizontal && (
                      <span className="text-slate-450 dark:text-brand-muted truncate max-w-[80px] font-mono">{rec.provider || rec.channel || rec.issuer}</span>
                    )}
                    <a 
                      href={rec.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-brand-primary font-bold hover:underline flex items-center gap-0.5"
                    >
                      Study
                      <ArrowRight size={8} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick analytics card - Redesigned as a minimal list table widget */}
        <div className="bg-white dark:bg-brand-card border border-slate-250 dark:border-brand-border p-5 rounded-2xl flex flex-col justify-between shadow-premium">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider font-heading">Evaluation logs</h3>
            <p className="text-[10px] text-slate-400 dark:text-brand-muted">Performance Outlook metrics</p>
          </div>

          <div className="space-y-2.5 my-4 font-mono text-xs text-slate-650 dark:text-slate-350">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-brand-borderlight">
              <span className="font-sans text-slate-500 dark:text-brand-muted">Quiz Accuracy</span>
              <span className="font-semibold text-slate-850 dark:text-white">88.5%</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-brand-borderlight">
              <span className="font-sans text-slate-500 dark:text-brand-muted">Weekly Study Time</span>
              <span className="font-semibold text-slate-850 dark:text-white">12.4 hrs</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="font-sans text-slate-500 dark:text-brand-muted flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-danger animate-pulse" />
                Weak Area
              </span>
              <span className="font-semibold text-brand-danger">Docker Network</span>
            </div>
          </div>

          <button 
            onClick={() => navigate('/analytics')}
            className="w-full py-2 bg-brand-primary hover:bg-indigo-650 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer hover:translate-y-[-0.5px]"
          >
            Launch Analytics Suite
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;

