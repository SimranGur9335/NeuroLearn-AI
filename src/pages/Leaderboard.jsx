import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Award, 
  BookOpen, 
  CalendarCheck, 
  Flame, 
  MapPin, 
  FileText, 
  Clock, 
  Shield, 
  CheckCircle, 
  Compass, 
  Cpu, 
  Users, 
  Megaphone, 
  Crown,
  User, 
  Zap, 
  Percent, 
  Star, 
  Sparkles, 
  ChevronRight, 
  Search, 
  GraduationCap,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { 
  BADGES, 
  LEVEL_SYSTEM, 
  BADGE_CATEGORIES, 
  XP_BREAKDOWN_TEMPLATE, 
  LEADERBOARD_FILTERS 
} from '../data/data';

// Map icon strings to Lucide icon components
const iconMap = {
  Trophy,
  Award,
  BookOpen,
  CalendarCheck,
  Flame,
  MapPin,
  FileText,
  Clock,
  Shield,
  CheckCircle,
  Compass,
  Cpu,
  Users,
  Megaphone,
  Crown
};

// Helper to calculate level information dynamically from XP and LEVEL_SYSTEM constants
const calculateLevelInfo = (currentXp) => {
  const currentLevel = LEVEL_SYSTEM.find(lvl => currentXp >= lvl.minXp && currentXp <= lvl.maxXp) 
    || LEVEL_SYSTEM[LEVEL_SYSTEM.length - 1];
  
  const levelRange = currentLevel.maxXp - currentLevel.minXp;
  const progressXp = currentXp - currentLevel.minXp;
  const reqXpForNext = currentLevel.maxXp === Infinity ? 0 : (currentLevel.maxXp - currentLevel.minXp + 1);
  
  const progressPercent = currentLevel.maxXp === Infinity 
    ? 100 
    : Math.min(100, Math.max(0, (progressXp / reqXpForNext) * 100));
    
  return {
    level: currentLevel.level,
    name: currentLevel.name,
    minXp: currentLevel.minXp,
    maxXp: currentLevel.maxXp === Infinity ? "Max" : currentLevel.maxXp,
    progressPercent: Math.round(progressPercent),
    progressXp,
    reqXpForNext
  };
};

// Helper to normalize branch names to map departments consistently
const normalizeBranch = (branch) => {
  if (!branch) return "";
  const b = branch.toUpperCase();
  if (b.includes("COMPUTER") || b.includes("CS")) return "CS";
  if (b.includes("INFORMATION") || b.includes("IT")) return "IT";
  return branch;
};

const Leaderboard = () => {
  const { badges, xp, streak, studentsList, profile } = useStudent();
  const [activeTab, setActiveTab] = useState("institution");
  const [searchQuery, setSearchQuery] = useState("");

  // Normalize branch name for grouping
  const userBranchNormalized = useMemo(() => {
    return normalizeBranch(profile.branch);
  }, [profile.branch]);

  // Dynamic Level metrics
  const levelInfo = useMemo(() => {
    return calculateLevelInfo(xp);
  }, [xp]);

  // Inject current context student stats dynamically into the registry payload
  const activeStudentsList = useMemo(() => {
    const list = studentsList || [];
    const updatedList = list.map(student => {
      const isUser = student.name.includes("You") || student.name === profile.name || student.rollNumber === profile.rollNumber;
      if (isUser) {
        return {
          ...student,
          name: `${profile.name} (You)`,
          xp: xp,
          streak: streak,
          avatar: profile.avatar || "🚀",
          branch: userBranchNormalized,
          year: profile.year || "3rd Year"
        };
      }
      return student;
    });

    const hasUser = updatedList.some(student => student.name.includes("You"));
    if (!hasUser) {
      updatedList.push({
        id: "ST-USER-CURRENT",
        name: `${profile.name} (You)`,
        rollNumber: profile.rollNumber,
        branch: userBranchNormalized,
        year: profile.year || "3rd Year",
        attendance: 88,
        quizScore: 85,
        xp: xp,
        streak: streak,
        avatar: profile.avatar || "🚀",
        status: "Safe",
        riskLevel: "Low"
      });
    }

    return updatedList;
  }, [studentsList, profile, xp, streak, userBranchNormalized]);

  // Dynamic ranking calculations based on tab rules
  const sortedAndFilteredStudents = useMemo(() => {
    let list = [...activeStudentsList];

    if (activeTab === "department") {
      list = list.filter(s => normalizeBranch(s.branch) === userBranchNormalized);
    } else if (activeTab === "semester") {
      list = list.filter(s => s.year === profile.year);
    } else if (activeTab === "weekly") {
      // Sort deterministically simulating a weekly XP sub-period
      list = list.map(s => ({
        ...s,
        weeklyXp: Math.round((s.xp * 0.18) + (s.streak * 8) + (s.id ? s.id.charCodeAt(s.id.length - 1) * 2.5 : 10))
      }));
      list.sort((a, b) => b.weeklyXp - a.weeklyXp);
    }

    if (activeTab !== "weekly") {
      list.sort((a, b) => b.xp - a.xp);
    }

    // Dynamic rank mapping on sorted slice
    return list.map((student, idx) => ({
      ...student,
      rank: idx + 1
    }));
  }, [activeStudentsList, activeTab, userBranchNormalized, profile.year]);

  // Current User's active rank and total cohort count
  const currentUserRankInfo = useMemo(() => {
    const user = sortedAndFilteredStudents.find(s => s.name.includes("You"));
    return user ? { rank: user.rank, total: sortedAndFilteredStudents.length } : { rank: 1, total: 100 };
  }, [sortedAndFilteredStudents]);

  // Overall global percentile calculated dynamically
  const rankPercentile = useMemo(() => {
    const sortedAll = [...activeStudentsList].sort((a, b) => b.xp - a.xp);
    const userIdx = sortedAll.findIndex(s => s.name.includes("You"));
    const rank = userIdx === -1 ? 100 : userIdx + 1;
    const total = sortedAll.length;
    const pct = (rank / total) * 100;
    return pct < 1 ? "Top 1%" : `Top ${Math.round(pct)}%`;
  }, [activeStudentsList]);

  // Filter list by user search input
  const searchedStudents = useMemo(() => {
    if (!searchQuery) return sortedAndFilteredStudents;
    const query = searchQuery.toLowerCase();
    return sortedAndFilteredStudents.filter(s => 
      s.name.toLowerCase().includes(query) || 
      (s.branch && s.branch.toLowerCase().includes(query)) ||
      (s.year && s.year.toLowerCase().includes(query))
    );
  }, [sortedAndFilteredStudents, searchQuery]);

  // Top 3 Podium Aggregators
  const topThree = useMemo(() => {
    const top = sortedAndFilteredStudents.slice(0, 3);
    const podium = [];
    // Render order: 2nd place, 1st place, 3rd place
    if (top[1]) podium.push({ ...top[1], place: 2, icon: "🥈" });
    if (top[0]) podium.push({ ...top[0], place: 1, icon: "🥇" });
    if (top[2]) podium.push({ ...top[2], place: 3, icon: "🥉" });
    return podium;
  }, [sortedAndFilteredStudents]);

  // Identify next 3 badges closest to unlocking
  const nextBadgesToUnlock = useMemo(() => {
    return badges
      .filter(b => !b.unlocked && b.progress)
      .map(b => {
        const pct = b.progress.target > 0 ? (b.progress.current / b.progress.target) * 100 : 0;
        return { ...b, progressPercent: Math.round(pct) };
      })
      .sort((a, b) => b.progressPercent - a.progressPercent)
      .slice(0, 3);
  }, [badges]);

  // Analytics dashboard details
  const analyticsMetrics = useMemo(() => {
    const unlockedCount = badges.filter(b => b.unlocked).length;
    const totalCount = badges.length;
    const nextBadgeStr = nextBadgesToUnlock[0] 
      ? `${nextBadgesToUnlock[0].name} (${nextBadgesToUnlock[0].progressPercent}%)`
      : "Complete!";

    return [
      { id: "level", title: "Current Level", value: `Lvl ${levelInfo.level}`, subtitle: levelInfo.name, icon: GraduationCap, color: "text-indigo-500 bg-indigo-500/10", border: "border-indigo-500/20" },
      { id: "xp", title: "Total Experience", value: `${xp.toLocaleString()} XP`, subtitle: "All-time points", icon: Zap, color: "text-amber-500 bg-amber-500/10", border: "border-amber-500/20" },
      { id: "rank", title: "Global Standing", value: rankPercentile, subtitle: `Rank #${currentUserRankInfo.rank}`, icon: Percent, color: "text-rose-500 bg-rose-500/10", border: "border-rose-500/20" },
      { id: "badges", title: "Credentials Unlocked", value: `${unlockedCount} / ${totalCount}`, subtitle: "Badges earned", icon: Award, color: "text-teal-500 bg-teal-500/10", border: "border-teal-500/20" },
      { id: "streak", title: "Daily Streak", value: `${streak} Days`, subtitle: "Flame active", icon: Flame, color: "text-orange-500 bg-orange-500/10", border: "border-orange-500/20" },
      { id: "next_badge", title: "Target Track", value: nextBadgesToUnlock[0] ? nextBadgesToUnlock[0].name : "Finished", subtitle: nextBadgeStr, icon: Star, color: "text-purple-500 bg-purple-500/10", border: "border-purple-500/20" }
    ];
  }, [badges, xp, streak, levelInfo, rankPercentile, currentUserRankInfo, nextBadgesToUnlock]);

  // Dynamically group badges list by categories
  const categorizedBadges = useMemo(() => {
    return BADGE_CATEGORIES.map(cat => {
      const matched = badges.filter(b => b.category === cat.name);
      return {
        ...cat,
        badges: matched
      };
    });
  }, [badges]);

  // Dynamic user row in active search
  const isCurrentUserInSearchResults = useMemo(() => {
    return searchedStudents.some(s => s.name.includes("You"));
  }, [searchedStudents]);

  const currentUserRow = useMemo(() => {
    return sortedAndFilteredStudents.find(s => s.name.includes("You"));
  }, [sortedAndFilteredStudents]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-12 text-slate-800 dark:text-slate-100"
    >
      {/* 1. HERO PROFILE SECTION */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 p-6 md:p-8 shadow-2xl text-white">
        {/* Subtle decorative mesh background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 md:gap-6">
            <span className="text-4xl md:text-5xl p-4 rounded-3xl bg-white/10 backdrop-blur-md border border-white/10 shadow-inner">
              {profile.avatar || "🚀"}
            </span>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-black tracking-tight">{profile.name}</h2>
                <span className="bg-indigo-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-indigo-400/30 tracking-wider">
                  Active Scholar
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5 font-medium">{profile.branch} • {profile.year}</p>
              
              {/* Level & XP progression indicator */}
              <div className="mt-3 flex items-center gap-3">
                <span className="bg-white/10 text-indigo-300 text-xs px-2.5 py-0.5 rounded-md font-bold backdrop-blur-sm">
                  Lvl {levelInfo.level} — {levelInfo.name}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {xp.toLocaleString()} / {levelInfo.maxXp === "Max" ? "Max" : levelInfo.maxXp.toLocaleString()} XP
                </span>
              </div>
            </div>
          </div>

          {/* Quick status summary cards */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 w-full md:w-auto">
            <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-3 text-center min-w-[90px] md:min-w-[110px]">
              <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cohort Rank</span>
              <span className="text-base md:text-lg font-black text-indigo-400">#{currentUserRankInfo.rank}</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-3 text-center min-w-[90px] md:min-w-[110px]">
              <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Streak</span>
              <span className="text-base md:text-lg font-black text-orange-400 flex items-center justify-center gap-1">
                {streak}d <Flame size={16} className="fill-current text-orange-500" />
              </span>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-3 text-center min-w-[90px] md:min-w-[110px]">
              <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Badges</span>
              <span className="text-base md:text-lg font-black text-teal-400">
                {badges.filter(b => b.unlocked).length}/{badges.length}
              </span>
            </div>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="mt-6 pt-4 border-t border-white/5 relative z-10">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
            <span>Level Progress</span>
            <span>{levelInfo.progressPercent}% to Next Level</span>
          </div>
          <div className="w-full h-2.5 bg-slate-950/80 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${levelInfo.progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* 2. ACHIEVEMENT ANALYTICS CARD */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {analyticsMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.id}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {metric.title}
                </span>
                <span className={`p-1.5 rounded-lg ${metric.color}`}>
                  <Icon size={14} />
                </span>
              </div>
              <div className="mt-3">
                <span className="block text-base md:text-lg font-black text-slate-800 dark:text-white line-clamp-1">
                  {metric.value}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block font-semibold line-clamp-1">
                  {metric.subtitle}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Primary Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column (2 cols wide on desktop) for Leaderboard & Podium */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 3. TOP 3 PODIUM */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base mb-6 flex items-center gap-2">
              <Trophy className="text-yellow-500" size={20} />
              Academic Leaderboard Podium
            </h3>
            
            <div className="grid grid-cols-3 gap-3 md:gap-6 items-end pt-8 pb-4 max-w-xl mx-auto">
              
              {/* Podium Positions mapping */}
              {topThree.map((student) => {
                const isRank1 = student.place === 1;
                const isUser = student.name.includes("You");
                
                return (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: student.place * 0.15 }}
                    className="flex flex-col items-center"
                  >
                    {/* Floating Avatar bubble */}
                    <div className="relative group mb-3">
                      <div className={`w-14 h-14 md:w-20 md:h-20 rounded-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center text-2xl md:text-4xl shadow-lg border-4 transition-transform duration-300 group-hover:scale-105 ${
                        isRank1 
                          ? 'border-yellow-400 dark:border-yellow-500 w-16 h-16 md:w-24 md:h-24 shadow-yellow-500/10' 
                          : student.place === 2 
                            ? 'border-slate-300 dark:border-slate-400' 
                            : 'border-amber-600'
                      } ${isUser ? 'ring-4 ring-indigo-500/40 ring-offset-2 dark:ring-offset-slate-900' : ''}`}>
                        {student.avatar || "👨‍💻"}
                      </div>
                      
                      {/* Rank badge marker */}
                      <span className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow border border-white dark:border-slate-900 ${
                        isRank1 
                          ? 'bg-yellow-400 text-slate-950 text-sm' 
                          : student.place === 2 
                            ? 'bg-slate-200 text-slate-700' 
                            : 'bg-amber-100 text-amber-800'
                      }`}>
                        {student.icon}
                      </span>
                    </div>

                    {/* Student details */}
                    <div className="text-center w-full max-w-[120px]">
                      <h4 className={`text-xs md:text-sm font-black truncate ${isUser ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-white'}`}>
                        {student.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase truncate tracking-wider mt-0.5">
                        {student.branch}
                      </p>
                    </div>

                    {/* Podium Column block */}
                    <div className={`w-full mt-4 rounded-t-2xl flex flex-col justify-end items-center p-3 text-center border-t shadow-inner ${
                      isRank1 
                        ? 'h-28 md:h-36 bg-gradient-to-b from-yellow-500/10 via-yellow-500/5 to-transparent border-yellow-500/35' 
                        : student.place === 2 
                          ? 'h-20 md:h-26 bg-gradient-to-b from-slate-400/10 via-slate-400/5 to-transparent border-slate-400/30' 
                          : 'h-16 md:h-20 bg-gradient-to-b from-amber-600/10 via-amber-600/5 to-transparent border-amber-600/30'
                    }`}>
                      <span className="block text-xs font-black text-slate-700 dark:text-slate-200">
                        {activeTab === "weekly" ? student.weeklyXp?.toLocaleString() : student.xp?.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                        XP
                      </span>
                    </div>
                  </motion.div>
                );
              })}

            </div>
          </div>

          {/* 4. ADVANCED LEADERBOARD TABLE */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-6">
            
            {/* Filters Navigation and Search */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Campus Leaderboard</h3>
                  <p className="text-xs text-slate-400">Explore cohort standings across academic filters</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                {/* Scrollable Tab Panel */}
                <div className="flex overflow-x-auto gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/40 dark:border-slate-800/50 max-w-full">
                  {LEADERBOARD_FILTERS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`text-[10px] md:text-xs font-black uppercase px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                          isActive 
                            ? 'bg-indigo-600 text-white shadow' 
                            : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                      >
                        {tab.name}
                      </button>
                    );
                  })}
                </div>

                {/* Real-time search bar */}
                <div className="relative min-w-[200px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by student or major..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Leaderboard Table Grid Container */}
            <div className="overflow-x-auto border border-slate-150 dark:border-slate-850/80 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-150 dark:border-slate-850 text-slate-400 font-bold uppercase text-[9px] tracking-wider bg-slate-50/50 dark:bg-slate-950/20">
                    <th className="py-3 pl-4 text-center w-12">Rank</th>
                    <th className="py-3 pl-2">Student</th>
                    <th className="py-3">Department</th>
                    <th className="py-3">Semester Group</th>
                    <th className="py-3 text-center">Streak</th>
                    <th className="py-3 text-right pr-4">XP Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60">
                  {searchedStudents.length > 0 ? (
                    searchedStudents.slice(0, 20).map((student) => {
                      const isCurrentUser = student.name.includes("You");
                      const medal = student.rank === 1 ? "🥇" : student.rank === 2 ? "🥈" : student.rank === 3 ? "🥉" : null;

                      return (
                        <tr 
                          key={student.id}
                          className={`transition-colors duration-150 ${
                            isCurrentUser 
                              ? 'bg-indigo-500/10 dark:bg-indigo-500/5 hover:bg-indigo-500/15 dark:hover:bg-indigo-500/10 font-bold border-l-4 border-l-indigo-600' 
                              : 'hover:bg-slate-50/50 dark:hover:bg-slate-850/10'
                          }`}
                        >
                          {/* Rank cell */}
                          <td className="py-3.5 pl-4 text-center font-extrabold text-slate-500 dark:text-slate-400">
                            {medal ? <span className="text-sm">{medal}</span> : student.rank}
                          </td>

                          {/* Student profile */}
                          <td className="py-3.5 pl-2">
                            <div className="flex items-center gap-3">
                              <span className="text-base w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center">
                                {student.avatar || "👨‍💻"}
                              </span>
                              <div>
                                <span className={`text-slate-800 dark:text-white ${isCurrentUser ? 'text-indigo-600 dark:text-indigo-400' : 'font-semibold'}`}>
                                  {student.name}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Branch / Department */}
                          <td className="py-3.5 text-slate-500 dark:text-slate-400 font-medium">
                            {student.branch || "CS"}
                          </td>

                          {/* Year / Semester */}
                          <td className="py-3.5 text-slate-500 dark:text-slate-400 font-medium">
                            {student.year || "3rd Year"}
                          </td>

                          {/* Streak */}
                          <td className="py-3.5 text-center">
                            {student.streak > 0 ? (
                              <div className="inline-flex items-center gap-0.5 text-orange-600 dark:text-orange-500 font-extrabold bg-orange-500/5 px-2 py-0.5 rounded border border-orange-500/10 text-[10px]">
                                <Flame size={10} className="fill-current" />
                                <span>{student.streak}d</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-600">-</span>
                            )}
                          </td>

                          {/* XP Score */}
                          <td className="py-3.5 text-right pr-4 font-black text-slate-700 dark:text-white">
                            {activeTab === "weekly" ? student.weeklyXp?.toLocaleString() : student.xp?.toLocaleString()} XP
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        <AlertCircle className="mx-auto text-slate-300 dark:text-slate-700 mb-2" size={24} />
                        No learners found matching search.
                      </td>
                    </tr>
                  )}

                  {/* Dynamic user sticky indicator if out of top search list */}
                  {!isCurrentUserInSearchResults && currentUserRow && searchQuery === "" && (
                    <>
                      <tr className="bg-slate-50 dark:bg-slate-950/40">
                        <td colSpan={6} className="py-1 text-center text-[9px] uppercase font-bold text-slate-400 bg-slate-100/30 dark:bg-slate-950/10">
                          ... Out of view standings ...
                        </td>
                      </tr>
                      <tr className="bg-indigo-500/15 dark:bg-indigo-500/5 font-bold border-l-4 border-l-indigo-600 shadow-md">
                        <td className="py-3.5 pl-4 text-center font-extrabold text-slate-600 dark:text-slate-300">
                          {currentUserRow.rank}
                        </td>
                        <td className="py-3.5 pl-2">
                          <div className="flex items-center gap-3">
                            <span className="text-base w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center">
                              {currentUserRow.avatar || "🚀"}
                            </span>
                            <span className="text-indigo-600 dark:text-indigo-400">
                              {currentUserRow.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 text-slate-500 dark:text-slate-400 font-medium">
                          {currentUserRow.branch}
                        </td>
                        <td className="py-3.5 text-slate-500 dark:text-slate-400 font-medium">
                          {currentUserRow.year}
                        </td>
                        <td className="py-3.5 text-center">
                          <div className="inline-flex items-center gap-0.5 text-orange-600 dark:text-orange-500 font-extrabold bg-orange-500/5 px-2 py-0.5 rounded border border-orange-500/10 text-[10px]">
                            <Flame size={10} className="fill-current" />
                            <span>{currentUserRow.streak}d</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-right pr-4 font-black text-slate-700 dark:text-white">
                          {activeTab === "weekly" ? currentUserRow.weeklyXp?.toLocaleString() : currentUserRow.xp?.toLocaleString()} XP
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column (1 col wide on desktop) for Badge Progress and XP Breakdown */}
        <div className="space-y-8">
          
          {/* 5. BADGE PROGRESS SYSTEM (Next to Unlock) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-5">
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Next Badges to Unlock</h3>
              <p className="text-xs text-slate-400">Locked achievements closest to completion</p>
            </div>

            <div className="space-y-4">
              {nextBadgesToUnlock.map((badge) => {
                const Icon = iconMap[badge.icon] || Trophy;
                return (
                  <div key={badge.id} className="p-3.5 border border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-950/20 rounded-2xl flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400">
                          <Icon size={16} />
                        </span>
                        <div>
                          <h4 className="text-xs font-black text-slate-800 dark:text-white leading-none">
                            {badge.name}
                          </h4>
                          <span className="text-[9px] text-slate-400 font-bold tracking-wider mt-0.5 block">
                            {badge.category}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                        {badge.progressPercent}%
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                      Condition: {badge.unlockCondition}
                    </p>

                    {/* Progress slider bar */}
                    <div>
                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 mb-1">
                        <span>Current Progress</span>
                        <span>{badge.progress.current} / {badge.progress.target}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 rounded-full" 
                          style={{ width: `${badge.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 6. XP BREAKDOWN CARD */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base">XP Breakdown</h3>
              <p className="text-xs text-slate-400">Analysis of weekly activity distributions</p>
            </div>

            <div className="space-y-4">
              {XP_BREAKDOWN_TEMPLATE.map((item) => (
                <div key={item.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${item.color}`} />
                      {item.name}
                    </span>
                    <span>+{item.xp} XP ({item.percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center">
                <span className="text-xs font-black text-slate-800 dark:text-white">This Week Total</span>
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                  +{XP_BREAKDOWN_TEMPLATE.reduce((acc, curr) => acc + curr.xp, 0)} XP
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 7. BADGE CATEGORIES */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-8">
        <div>
          <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Your Engineering Badges</h3>
          <p className="text-xs text-slate-400">Complete curriculum and campus achievements to earn prestige badges</p>
        </div>

        {/* Categorized Badges Grid container */}
        <div className="space-y-8">
          {categorizedBadges.map((category) => {
            return (
              <div key={category.id} className="space-y-4">
                <div className="pb-2 border-b border-slate-100 dark:border-slate-850">
                  <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${category.color}`} />
                    {category.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{category.desc}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                  {category.badges.map((badge) => {
                    const Icon = iconMap[badge.icon] || Trophy;
                    const isUnlocked = badge.unlocked;

                    return (
                      <div
                        key={badge.id}
                        className={`p-4 rounded-2xl border flex flex-col justify-between relative group transition-all duration-300 ${
                          isUnlocked 
                            ? 'border-indigo-500/25 bg-slate-50/30 dark:bg-slate-950/15' 
                            : 'border-slate-200/40 dark:border-slate-800/60 opacity-60 hover:opacity-95'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* Colored/greyscale icon bubble */}
                          <div className={`p-3 rounded-2xl bg-gradient-to-br shadow-md ${
                            isUnlocked 
                              ? category.color + ' text-white' 
                              : 'from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-850 text-slate-400 dark:text-slate-500'
                          }`}>
                            <Icon size={18} />
                          </div>

                          {/* Unlock status mark */}
                          {isUnlocked ? (
                            <span className="p-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-md text-[8px] font-black uppercase tracking-wider">
                              Unlocked
                            </span>
                          ) : (
                            <span className="p-0.5 bg-slate-200/30 dark:bg-slate-800/30 border border-slate-300/20 text-slate-400 rounded-md text-[8px] font-black uppercase tracking-wider">
                              Locked
                            </span>
                          )}
                        </div>

                        <div className="mt-4">
                          <h5 className="font-extrabold text-xs text-slate-800 dark:text-white truncate">
                            {badge.name}
                          </h5>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal line-clamp-2 mt-1">
                            {badge.description}
                          </p>
                        </div>

                        {/* Progress display (if applicable) */}
                        {!isUnlocked && badge.progress && (
                          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-850/60">
                            <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                              <span>Progress</span>
                              <span>{badge.progress.current}/{badge.progress.target}</span>
                            </div>
                            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                              <div 
                                className="h-full bg-slate-400 dark:bg-slate-600 rounded-full"
                                style={{ width: `${(badge.progress.current / badge.progress.target) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Hover Detail Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-950 text-white text-[10px] p-2.5 rounded-xl border border-slate-800 shadow-xl w-48 z-40 text-center pointer-events-none">
                          <p className="font-black text-indigo-400">{badge.name}</p>
                          <p className="text-slate-300 mt-1 leading-normal font-semibold">{badge.description}</p>
                          <p className="text-slate-500 mt-1.5 font-bold uppercase">Condition: {badge.unlockCondition}</p>
                          <div className="mt-2 pt-1 border-t border-slate-800 flex justify-between items-center font-black">
                            <span className="text-amber-500">+{badge.xpReward} XP</span>
                            <span className={isUnlocked ? 'text-emerald-400' : 'text-rose-500'}>
                              {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                            </span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default Leaderboard;
