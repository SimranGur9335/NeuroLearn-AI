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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 text-slate-800 dark:text-slate-100 font-sans"
    >
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 border border-indigo-900/50 p-6 md:p-8 shadow-2xl text-white">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.18)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] text-indigo-300 font-extrabold uppercase tracking-wider bg-indigo-500/10 px-3.5 py-1.5 rounded-full border border-indigo-500/20">
              {profile.college}
            </span>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight mt-4">
              Welcome back, {profile.name}!
            </h1>
            <p className="text-slate-350 text-xs md:text-sm mt-2 max-w-xl leading-relaxed">
              Your customized curriculum pathway has been generated based on active major <span className="text-indigo-300 font-extrabold">{profile.branch}</span> and latest test scores.
            </p>
          </div>
          <button 
            onClick={() => navigate('/roadmap')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 text-xs shrink-0 flex items-center gap-2 cursor-pointer self-start md:self-auto"
          >
            Resume Learning Journey
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Gamified cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* XP Level Tracker Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">Gamification Tier</h3>
              <p className="text-[10px] text-slate-400">Current progress milestone</p>
            </div>
            <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs px-3 py-1 rounded-lg font-black border border-indigo-500/20">
              Level {currentLevel}
            </span>
          </div>

          <div className="flex items-center gap-5 py-5">
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center border-4 border-slate-100 dark:border-slate-800 rounded-full">
              <div 
                className="absolute inset-0 rounded-full border-4 border-indigo-650 border-indigo-600"
                style={{ clipPath: `polygon(50% 50%, 50% 0%, ${levelProgressPercentage >= 25 ? '100% 0%' : '50% 0%'}, ${levelProgressPercentage >= 50 ? '100% 100%' : '100% 0%'}, ${levelProgressPercentage >= 75 ? '0% 100%' : '100% 100%'}, ${levelProgressPercentage === 100 ? '0% 0%' : '0% 100%'}, 50% 50%)` }}
              />
              <span className="font-black text-lg text-slate-800 dark:text-white">{currentLevel}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Total Experience</span>
              <span className="font-black text-2xl text-slate-800 dark:text-white">{xp} XP</span>
              <p className="text-[10px] text-slate-550 mt-1">
                {nextLevelXp - xp} XP needed for Level {currentLevel + 1}
              </p>
            </div>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
            <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${levelProgressPercentage}%` }} />
          </div>
        </div>

        {/* Daily Quests Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-1.5">
            <Flame className="text-orange-500 fill-current animate-pulse" size={18} />
            Daily Quests
          </h3>
          <div className="space-y-2.5">
            {dailyQuests.map((quest) => (
              <div 
                key={quest.id}
                onClick={quest.action}
                className={`p-3 rounded-xl border flex items-center justify-between text-[11px] transition-all ${
                  quest.action ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 border-slate-200 dark:border-slate-800' : 'border-slate-100 dark:border-slate-850'
                } ${
                  quest.completed 
                    ? 'bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 dark:text-slate-550 line-through' 
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className={quest.completed ? "text-emerald-500" : "text-slate-300 dark:text-slate-750"} />
                  <span className="font-bold">{quest.text}</span>
                </div>
                <span className={`px-2 py-0.5 rounded font-black text-[9px] ${
                  quest.completed 
                    ? 'bg-slate-100 dark:bg-slate-950 text-slate-400' 
                    : 'bg-indigo-500/10 text-indigo-500'
                }`}>
                  +{quest.xpReward} XP
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Active Path Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">Active Curriculum Domain</h3>
            <p className="text-[10px] text-slate-400">Recommendations map to this course</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-850/80 my-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
                <BookOpen size={15} />
              </div>
              <span className="font-black text-xs text-slate-800 dark:text-white truncate">
                {activeDomain.title}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
              {activeDomain.description}
            </p>
          </div>

          <button 
            onClick={() => navigate('/domains')}
            className="w-full py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-xs font-extrabold transition-colors cursor-pointer text-slate-700 dark:text-slate-350"
          >
            Switch Learning Track
          </button>
        </div>
      </div>

      {/* Grid of study hours */}
      <ContributionGrid />

      {/* Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Smart Recommendations List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm lg:col-span-2 hover:shadow-md transition-shadow">
          <div className="mb-4">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm flex items-center gap-1.5">
              <Sparkles className="text-indigo-500" size={18} />
              Personalized Study Materials: {activeDomain.title}
            </h3>
            <p className="text-[10px] text-slate-400">AI-curated resources calibrated to help you unlock the next roadmap nodes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {domainRecommendations.map((rec, index) => {
              const isCourse = rec.type === "Course";
              const isVideo = rec.type === "Video";
              const Icon = isCourse ? BookOpen : isVideo ? Video : Award;
              
              return (
                <div 
                  key={index}
                  className="p-4 rounded-2xl border border-slate-150 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-950/10 flex flex-col justify-between min-h-[140px] hover:border-indigo-500/30 transition-all hover:translate-y-[-2px]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        isCourse ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-450' :
                        isVideo ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-450' :
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-450'
                      }`}>
                        {rec.type}
                      </span>
                      <Icon size={14} className="text-slate-400" />
                    </div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-white line-clamp-2 leading-relaxed">
                      {rec.title}
                    </h4>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-850/80 flex justify-between items-center text-[9px]">
                    <span className="text-slate-450 font-bold truncate max-w-[90px]">{rec.provider || rec.channel || rec.issuer}</span>
                    <a 
                      href={rec.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-indigo-650 dark:text-indigo-400 font-extrabold hover:underline flex items-center gap-0.5"
                    >
                      Study
                      <ArrowRight size={10} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick analytics card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">Performance Outlook</h3>
            <p className="text-[10px] text-slate-400">Weekly evaluation logs</p>
          </div>

          <div className="space-y-3.5 my-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-550 dark:text-slate-400 font-semibold">Quiz Accuracy</span>
              <span className="font-black text-slate-800 dark:text-white">88.5%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-550 dark:text-slate-400 font-semibold">Weekly Study Time</span>
              <span className="font-black text-slate-800 dark:text-white">12.4 hrs</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-550 dark:text-slate-400 font-semibold">Weak Area Detected</span>
              <span className="font-black text-red-500 dark:text-red-400">Docker Network</span>
            </div>
          </div>

          <button 
            onClick={() => navigate('/analytics')}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
          >
            Launch Analytics Suite
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
