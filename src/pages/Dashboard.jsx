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
  CircleDot
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import ContributionGrid from '../components/ContributionGrid';
import { RECOMMENDATIONS } from '../data/data';

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile, xp, streak, activeDomain, setActiveDomain } = useStudent();

  // Calculate Level and progress
  const baseLevelXp = 1000;
  const xpPerLevel = 500;
  const currentLevel = Math.floor((xp - baseLevelXp) / xpPerLevel) + 2; // Level starts at 2 after 1000 XP
  const nextLevelXp = baseLevelXp + (currentLevel - 1) * xpPerLevel;
  const prevLevelXp = nextLevelXp - xpPerLevel;
  const xpInCurrentLevel = xp - prevLevelXp;
  const levelProgressPercentage = Math.min(100, Math.max(0, (xpInCurrentLevel / xpPerLevel) * 100));

  // Fetch contextual recommendations based on the active domain
  const domainRecommendations = RECOMMENDATIONS[activeDomain.id] || RECOMMENDATIONS["ai-ml"];

  const dailyQuests = [
    { id: 1, text: `Pass 1 Quiz in ${activeDomain.title}`, completed: false, xpReward: 50, action: () => navigate('/roadmap') },
    { id: 2, text: "Review Cryptography certification pathways", completed: false, xpReward: 30, action: () => navigate('/career') },
    { id: 3, text: "Maintain your 7-day study streak", completed: true, xpReward: 20, action: null },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-900/50 p-6 rounded-3xl relative overflow-hidden shadow-xl text-white">
        {/* Abstract design elements */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-radial-gradient(circle,rgba(99,102,241,0.15)_0%,transparent_70%) pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              {profile.college}
            </span>
            <h1 className="text-2xl md:text-3xl font-black mt-3">
              Welcome Back, {profile.name}!
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-lg">
              You are currently majoring in <span className="text-indigo-300 font-semibold">{profile.branch}</span>. Your personalized pathway has been calibrated based on your last quiz outcomes.
            </p>
          </div>
          <button 
            onClick={() => navigate('/roadmap')}
            className="bg-white hover:bg-slate-100 text-indigo-950 font-bold px-5 py-3 rounded-xl transition-all shadow-lg text-sm shrink-0 flex items-center gap-2 cursor-pointer self-start md:self-auto"
          >
            Resume Learning Path
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Stats and Quests Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* XP Level Tracker Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Gamification Level</h3>
            <span className="bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs px-2.5 py-1 rounded-full font-bold">
              Level {currentLevel}
            </span>
          </div>

          <div className="flex items-center gap-4 py-4">
            {/* Progress Circular/Radial visual placeholder (simulated with styled divs) */}
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center border-4 border-slate-100 dark:border-slate-800 rounded-full">
              <div 
                className="absolute inset-0 rounded-full border-4 border-indigo-600"
                style={{ clipPath: `polygon(50% 50%, 50% 0%, ${levelProgressPercentage >= 25 ? '100% 0%' : '50% 0%'}, ${levelProgressPercentage >= 50 ? '100% 100%' : '100% 0%'}, ${levelProgressPercentage >= 75 ? '0% 100%' : '100% 100%'}, ${levelProgressPercentage === 100 ? '0% 0%' : '0% 100%'}, 50% 50%)` }}
              />
              <span className="font-black text-xl text-slate-800 dark:text-white">{currentLevel}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Total Experience Points</span>
              <span className="font-extrabold text-2xl text-slate-800 dark:text-white">{xp} XP</span>
              <p className="text-xs text-slate-500 mt-1">
                {nextLevelXp - xp} XP to unlock Level {currentLevel + 1}
              </p>
            </div>
          </div>

          {/* Simple percentage bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
            <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${levelProgressPercentage}%` }} />
          </div>
        </div>

        {/* Daily Quests Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-md">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-base mb-4 flex items-center gap-2">
            <Flame className="text-orange-500 fill-current animate-pulse" size={18} />
            Daily Tasks & Quests
          </h3>
          <div className="space-y-3">
            {dailyQuests.map((quest) => (
              <div 
                key={quest.id}
                onClick={quest.action}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  quest.action ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40' : ''
                } ${
                  quest.completed 
                    ? 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 line-through' 
                    : 'bg-white dark:bg-slate-905 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className={quest.completed ? "text-emerald-500" : "text-slate-300 dark:text-slate-700"} />
                  <span className="font-medium">{quest.text}</span>
                </div>
                <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${
                  quest.completed 
                    ? 'bg-slate-100 dark:bg-slate-900 text-slate-400' 
                    : 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                }`}>
                  +{quest.xpReward} XP
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Active Path Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-md flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base mb-1">Active Learning Domain</h3>
            <p className="text-xs text-slate-400">Personalized recommendations adapt to this domain</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 my-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                <BookOpen size={16} />
              </div>
              <span className="font-bold text-sm text-slate-800 dark:text-white truncate">
                {activeDomain.title}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 truncate">
              {activeDomain.description}
            </p>
          </div>

          <button 
            onClick={() => navigate('/domains')}
            className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            Change Learning Domain
          </button>
        </div>
      </div>

      {/* GitHub-style calendar grid */}
      <ContributionGrid />

      {/* Recommendations & Analytics Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Smart Recommendations List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-md lg:col-span-2">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-base mb-1 flex items-center gap-2">
            <Sparkles className="text-indigo-500 animate-pulse" size={18} />
            Smart Recommendations for {activeDomain.title}
          </h3>
          <p className="text-xs text-slate-400 mb-4">AI-curated resources calibrated to help you pass the next roadmap node.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {domainRecommendations.map((rec, index) => {
              const isCourse = rec.type === "Course";
              const isVideo = rec.type === "Video";
              const Icon = isCourse ? BookOpen : isVideo ? Video : Award;
              
              return (
                <div 
                  key={index}
                  className="p-4 rounded-2xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        isCourse ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' :
                        isVideo ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' :
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                      }`}>
                        {rec.type}
                      </span>
                      <Icon size={16} className="text-slate-400" />
                    </div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-white line-clamp-2 leading-relaxed">
                      {rec.title}
                    </h4>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 font-medium truncate max-w-[100px]">{rec.provider || rec.channel || rec.issuer}</span>
                    <a 
                      href={rec.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-0.5"
                    >
                      Access
                      <ArrowRight size={10} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick analytics card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-md flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base mb-1">Performance Snapshot</h3>
            <p className="text-xs text-slate-400">Weekly calibration score</p>
          </div>

          <div className="space-y-4 my-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Quiz Accuracy</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">88.5%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Study Hours (Week)</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">12.4 hrs</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Weak Area Detected</span>
              <span className="font-bold text-red-500">Docker Network</span>
            </div>
          </div>

          <button 
            onClick={() => navigate('/analytics')}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
          >
            Open Analytics Suite
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
