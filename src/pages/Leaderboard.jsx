import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Award,
  Flame,
  Star,
  Sparkles,
  Search,
  GraduationCap,
  Zap,
  Percent,
  TrendingUp,
  Activity,
  BarChart2,
  CheckCircle,
  XCircle,
  Users,
  ChevronRight,
  Shield,
  FileText,
  Clock,
  Compass,
  Cpu,
  Megaphone,
  Crown
} from 'lucide-react';
import { apiFetch } from '../services/api';
import { useStudent } from '../context/StudentContext';
import { THEME_COLOR_MAP } from '../components/StudentHubTheme';

// Map icon strings to Lucide components
const iconMap = {
  Trophy,
  Award,
  CalendarCheck: CheckCircle,
  Flame,
  MapPin: Activity,
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

const Leaderboard = () => {
  const { profile } = useStudent();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  // Tabs: "leaderboard" | "badges" | "analytics"
  const [activeTab, setActiveTab] = useState("leaderboard");

  // Leaderboard parameters
  const [leaderboardType, setLeaderboardType] = useState("student"); // "student" | "faculty"
  const [leaderboardFilter, setLeaderboardFilter] = useState("institution"); // "institution" | "department" | "semester" | "weekly"
  const [searchQuery, setSearchQuery] = useState("");

  // Loaded states
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [badgesData, setBadgesData] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch gamification metrics
  const loadStats = async () => {
    try {
      const res = await apiFetch('/gamification/stats');
      if (res.ok) {
        const data = await res.json();
        setStatsData(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch badges lists
  const loadBadges = async () => {
    try {
      const res = await apiFetch('/gamification/badges');
      if (res.ok) {
        const data = await res.json();
        setBadgesData(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch leaderboard standings
  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/gamification/leaderboard?type=${leaderboardType}&filter=${leaderboardFilter}`);
      if (!res.ok) {
        throw new Error("Failed to load leaderboard database records.");
      }
      const data = await res.json();
      setLeaderboardData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch quiz analytics history
  const loadAnalytics = async () => {
    try {
      const res = await apiFetch('/gamification/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // On tab change or parameter change
  useEffect(() => {
    loadStats();
    loadBadges();
    loadAnalytics();
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [leaderboardType, leaderboardFilter]);

  // Search filtered leaderboard
  const searchedLeaderboard = useMemo(() => {
    if (!searchQuery) return leaderboardData;
    const query = searchQuery.toLowerCase();
    return leaderboardData.filter(s =>
      s.name.toLowerCase().includes(query) ||
      (s.branch && s.branch.toLowerCase().includes(query)) ||
      (s.designation && s.designation.toLowerCase().includes(query))
    );
  }, [leaderboardData, searchQuery]);

  // Podium (Top 3)
  const podiumList = useMemo(() => {
    const sorted = [...leaderboardData];
    const top = sorted.slice(0, 3);
    const podium = [];
    if (top[1]) podium.push({ ...top[1], place: 2, icon: "🥈" });
    if (top[0]) podium.push({ ...top[0], place: 1, icon: "🥇" });
    if (top[2]) podium.push({ ...top[2], place: 3, icon: "🥉" });
    return podium;
  }, [leaderboardData]);

  // Current user row in leaderboard list
  const currentUserRow = useMemo(() => {
    return leaderboardData.find(s =>
      s.name.includes("You") ||
      s.name === profile.name ||
      s.rollNumber === profile.rollNumber ||
      (leaderboardType === "faculty" && s.name === profile.name)
    );
  }, [leaderboardData, profile, leaderboardType]);

  const isCurrentUserInSearchResults = useMemo(() => {
    return searchedLeaderboard.some(s =>
      s.name.includes("You") ||
      s.name === profile.name ||
      s.rollNumber === profile.rollNumber
    );
  }, [searchedLeaderboard, profile]);

  // Badge categories group mapping
  const badgeCategories = [
    { id: "academic", name: "Academic Excellence", color: "from-blue-500 to-indigo-600", desc: "Top classroom and quiz performers" },
    { id: "attendance", name: "Attendance", color: "from-orange-500 to-red-600", desc: "Consistency and presence in portal & lectures" },
    { id: "assignments", name: "Assignments", color: "from-teal-500 to-emerald-600", desc: "Completing tasks, project submissions & timelines" },
    { id: "skills", name: "Learning & Skills", color: "from-purple-500 to-pink-600", desc: "Expanding tech capabilities and knowledge bases" },
    { id: "community", name: "Community & Events", color: "from-cyan-500 to-blue-600", desc: "Technical club participations & campus engagement" },
    { id: "elite", name: "Elite Achievements", color: "from-yellow-500 to-amber-600", desc: "High-tier university prestige markers" }
  ];

  const categorizedBadges = useMemo(() => {
    return badgeCategories.map(cat => {
      const matched = badgesData.filter(b => b.category === cat.name);
      return { ...cat, badges: matched };
    });
  }, [badgesData]);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Profile Level Hero Section */}
      {statsData && (
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 p-6 md:p-8 shadow-2xl text-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 md:gap-6">
              <span className="text-4xl md:text-5xl p-4 rounded-3xl bg-white/10 backdrop-blur-md border border-white/10 shadow-inner">
                {profile.avatar || "🚀"}
              </span>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl md:text-2xl font-black tracking-tight">{profile.name}</h2>
                  <span className="bg-indigo-50 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-indigo-400/30 tracking-wider">
                    {profile.role === 'student' ? 'Active Scholar' : 'Elite Mentor'}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-0.5 font-medium">{profile.branch} • {profile.year}</p>

                {profile.role === 'student' && (
                  <div className="mt-3 flex items-center gap-3">
                    <span className="bg-white/10 text-indigo-300 text-xs px-2.5 py-0.5 rounded-md font-bold backdrop-blur-sm">
                      Lvl {statsData.level} — {statsData.level_name}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {statsData.xp.toLocaleString()} XP Points
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick stats grid */}
            {profile.role === 'student' && (
              <div className="grid grid-cols-3 gap-3 md:gap-4 w-full md:w-auto">
                <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-3 text-center min-w-[90px] md:min-w-[110px]">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cohort Rank</span>
                  <span className="text-base md:text-lg font-black text-indigo-400">#{statsData.rank}</span>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-3 text-center min-w-[90px] md:min-w-[110px]">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Daily Streak</span>
                  <span className="text-base md:text-lg font-black text-orange-400 flex items-center justify-center gap-1">
                    {statsData.streak}d <Flame size={16} className="fill-current text-orange-500" />
                  </span>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-3 text-center min-w-[90px] md:min-w-[110px]">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Achievements</span>
                  <span className="text-base md:text-lg font-black text-teal-400">
                    {statsData.badges_unlocked} Unlocked
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* XP Progress Bar */}
          {profile.role === 'student' && (
            <div className="mt-6 pt-4 border-t border-white/5 relative z-10">
              <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                <span>XP Level Progression</span>
                <span>{statsData.progress_percent}% to Next Level</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950/80 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${statsData.progress_percent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Secondary Tab Switcher */}
      {profile?.role === 'student' && (
        <div className="flex items-center justify-center bg-slate-900/60 border border-slate-800 p-1.5 rounded-2xl max-w-lg mx-auto">
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === "leaderboard"
                ? `${theme.bg} ${theme.text} border border-indigo-500/20 shadow-md`
                : 'text-slate-400 hover:text-white'
              }`}
          >
            <Trophy size={14} /> Campus Leaderboard
          </button>
          <button
            onClick={() => setActiveTab("badges")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === "badges"
                ? `${theme.bg} ${theme.text} border border-indigo-500/20 shadow-md`
                : 'text-slate-400 hover:text-white'
              }`}
          >
            <Award size={14} /> Badge Vault
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === "analytics"
                ? `${theme.bg} ${theme.text} border border-indigo-500/20 shadow-md`
                : 'text-slate-400 hover:text-white'
              }`}
          >
            <BarChart2 size={14} /> Quiz Analytics
          </button>
        </div>
      )}

      {/* 3. Render Active Tab */}
      <AnimatePresence mode="wait">
        {activeTab === "leaderboard" && (
          <motion.div
            key="leaderboard-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Podium (Top 3) */}
            {podiumList.length > 0 && (
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-sm">
                <h3 className="font-extrabold text-white text-md mb-6 flex items-center gap-2">
                  <Trophy className="text-yellow-500" size={18} />
                  Top Standings Podium
                </h3>

                <div className="grid grid-cols-3 gap-3 md:gap-6 items-end pt-8 pb-4 max-w-xl mx-auto">
                  {podiumList.map((member) => {
                    const isRank1 = member.place === 1;
                    const isUser = member.name.includes("You") || member.name === profile.name;

                    return (
                      <div key={member.id} className="flex flex-col items-center">
                        <div className="relative group mb-3">
                          <div className={`w-14 h-14 md:w-20 md:h-20 rounded-full bg-slate-900 flex items-center justify-center text-2xl md:text-4xl shadow-lg border-4 transition-transform duration-300 group-hover:scale-105 ${isRank1
                              ? 'border-yellow-400 dark:border-yellow-500 w-16 h-16 md:w-24 md:h-24 shadow-yellow-500/10'
                              : member.place === 2
                                ? 'border-slate-400'
                                : 'border-amber-600'
                            } ${isUser ? 'ring-4 ring-indigo-500/40 ring-offset-2 ring-offset-slate-950' : ''}`}>
                            {member.avatar || "🚀"}
                          </div>

                          <span className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow border border-slate-900 ${isRank1
                              ? 'bg-yellow-400 text-slate-950 text-sm'
                              : member.place === 2
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                            {member.icon}
                          </span>
                        </div>

                        <div className="text-center w-full max-w-[120px]">
                          <h4 className={`text-xs md:text-sm font-black truncate ${isUser ? 'text-indigo-400' : 'text-white'}`}>
                            {member.name}
                          </h4>
                          <p className="text-[10px] text-slate-500 font-bold uppercase truncate tracking-wider mt-0.5">
                            {member.branch || "Scholar"}
                          </p>
                        </div>

                        <div className={`w-full mt-4 rounded-t-2xl flex flex-col justify-end items-center p-3 text-center border-t shadow-inner ${isRank1
                            ? 'h-28 md:h-36 bg-gradient-to-b from-yellow-500/10 via-yellow-500/5 to-transparent border-yellow-500/35'
                            : member.place === 2
                              ? 'h-20 md:h-26 bg-gradient-to-b from-slate-400/10 via-slate-400/5 to-transparent border-slate-400/30'
                              : 'h-16 md:h-20 bg-gradient-to-b from-amber-600/10 via-amber-600/5 to-transparent border-amber-600/30'
                          }`}>
                          <span className="block text-xs font-black text-slate-200">
                            {member.xp?.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                            XP
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Standings Filter Controls */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center border-b border-slate-800 pb-4">
                {/* Board selector */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setLeaderboardType("student");
                      setLeaderboardFilter("institution");
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${leaderboardType === "student"
                        ? `${theme.bg} ${theme.text} border-indigo-500/50`
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                  >
                    🏆 Student Leaderboard
                  </button>
                  <button
                    onClick={() => {
                      setLeaderboardType("faculty");
                      setLeaderboardFilter("institution");
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${leaderboardType === "faculty"
                        ? `${theme.bg} ${theme.text} border-indigo-500/50`
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                  >
                    👨‍🏫 Faculty Leaderboard
                  </button>
                </div>

                {/* Sub filters */}
                {leaderboardType === "student" && (
                  <div className="flex overflow-x-auto gap-1 bg-slate-950 p-1 rounded-xl border border-slate-805 max-w-full">
                    {[
                      { id: "institution", name: "Campus" },
                      { id: "department", name: "Department" },
                      { id: "semester", name: "Semester" },
                      { id: "weekly", name: "Weekly Sprint" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setLeaderboardFilter(tab.id)}
                        className={`text-[10px] md:text-xs font-black uppercase px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${leaderboardFilter === tab.id
                            ? 'bg-indigo-650 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                          }`}
                      >
                        {tab.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Standings Table */}
              <div className="space-y-4">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, major, or code..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-slate-700 text-white placeholder-slate-500"
                  />
                </div>

                <div className="overflow-x-auto border border-slate-800/80 rounded-2xl bg-slate-950/20">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase text-[9px] tracking-wider bg-slate-950/40">
                        <th className="py-3 pl-4 text-center w-12">Rank</th>
                        <th className="py-3 pl-2">Name</th>
                        <th className="py-3">{leaderboardType === 'student' ? 'Department' : 'Designation'}</th>
                        {leaderboardType === 'student' && <th className="py-3">Semester</th>}
                        <th className="py-3 text-center">{leaderboardType === 'student' ? 'Streak' : 'Activity'}</th>
                        <th className="py-3 text-right pr-4">XP Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center">
                            <div className="w-6 h-6 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
                            <span className="text-slate-500 text-xs font-semibold">Loading standings...</span>
                          </td>
                        </tr>
                      ) : searchedLeaderboard.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500">
                            No matching profiles found in cohort.
                          </td>
                        </tr>
                      ) : (
                        searchedLeaderboard.map((item) => {
                          const isCurrentUser = item.name.includes("You") || item.name === profile.name;
                          const medal = item.rank === 1 ? "🥇" : item.rank === 2 ? "🥈" : item.rank === 3 ? "🥉" : null;

                          return (
                            <tr
                              key={item.id}
                              className={`transition-colors duration-150 ${isCurrentUser
                                  ? 'bg-indigo-500/10 hover:bg-indigo-500/15 font-bold border-l-4 border-l-indigo-600'
                                  : 'hover:bg-slate-900/40'
                                }`}
                            >
                              <td className="py-3.5 pl-4 text-center font-extrabold text-slate-400">
                                {medal ? <span className="text-sm">{medal}</span> : item.rank}
                              </td>
                              <td className="py-3.5 pl-2">
                                <div className="flex items-center gap-3">
                                  <span className="text-base w-7 h-7 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center">
                                    {item.avatar || "🚀"}
                                  </span>
                                  <span className={isCurrentUser ? 'text-indigo-400 font-extrabold' : 'text-slate-200 font-semibold'}>
                                    {item.name}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3.5 text-slate-400 font-medium">
                                {leaderboardType === 'student' ? item.branch : item.designation}
                              </td>
                              {leaderboardType === 'student' && (
                                <td className="py-3.5 text-slate-400 font-medium">
                                  {item.year || "3rd Year"}
                                </td>
                              )}
                              <td className="py-3.5 text-center">
                                {leaderboardType === 'student' ? (
                                  item.streak > 0 ? (
                                    <div className="inline-flex items-center gap-0.5 text-orange-500 font-extrabold bg-orange-500/5 px-2 py-0.5 rounded border border-orange-500/10 text-[10px]">
                                      <Flame size={10} className="fill-current" />
                                      <span>{item.streak}d</span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-650">-</span>
                                  )
                                ) : (
                                  <span className="text-indigo-400 font-bold bg-indigo-500/5 px-2 py-0.5 rounded-full border border-indigo-500/10 text-[10px]">
                                    Active Tasking
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 text-right pr-4 font-black text-white">
                                {item.xp?.toLocaleString()} XP
                              </td>
                            </tr>
                          );
                        })
                      )}

                      {/* Sticky current user indicator if not visible */}
                      {!isCurrentUserInSearchResults && currentUserRow && searchQuery === "" && (
                        <>
                          <tr className="bg-slate-900/60">
                            <td colSpan={6} className="py-1 text-center text-[9px] uppercase font-bold text-slate-500">
                              ... Out of view standings ...
                            </td>
                          </tr>
                          <tr className="bg-indigo-500/15 font-bold border-l-4 border-l-indigo-600 shadow-md">
                            <td className="py-3.5 pl-4 text-center font-extrabold text-indigo-400">
                              {currentUserRow.rank}
                            </td>
                            <td className="py-3.5 pl-2">
                              <div className="flex items-center gap-3">
                                <span className="text-base w-7 h-7 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center">
                                  {currentUserRow.avatar || "🚀"}
                                </span>
                                <span className="text-indigo-400">
                                  {currentUserRow.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 text-slate-400 font-medium">
                              {leaderboardType === 'student' ? currentUserRow.branch : currentUserRow.designation}
                            </td>
                            {leaderboardType === 'student' && (
                              <td className="py-3.5 text-slate-400 font-medium">
                                {currentUserRow.year}
                              </td>
                            )}
                            <td className="py-3.5 text-center">
                              <div className="inline-flex items-center gap-0.5 text-orange-500 font-extrabold bg-orange-500/5 px-2 py-0.5 rounded border border-orange-500/10 text-[10px]">
                                <Flame size={10} className="fill-current" />
                                <span>{currentUserRow.streak}d</span>
                              </div>
                            </td>
                            <td className="py-3.5 text-right pr-4 font-black text-white">
                              {currentUserRow.xp?.toLocaleString()} XP
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "badges" && (
          <motion.div
            key="badges-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {badgesData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
                <span className="text-slate-500 text-sm font-semibold animate-pulse mt-2">Loading prestige achievements...</span>
              </div>
            ) : (
              <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-8">
                <div>
                  <h3 className="font-extrabold text-white text-md">Your Engineering Badge Vault</h3>
                  <p className="text-xs text-slate-450">Complete syllabus tasks, attendances, and quiz clearance to unlock prestigious markers.</p>
                </div>

                <div className="space-y-8">
                  {categorizedBadges.map((category) => {
                    if (category.badges.length === 0) return null;
                    return (
                      <div key={category.id} className="space-y-4">
                        <div className="pb-2 border-b border-slate-800">
                          <h4 className="text-sm font-black text-white flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${category.color}`} />
                            {category.name}
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">{category.desc}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                          {category.badges.map((badge) => {
                            const Icon = iconMap[badge.icon] || Trophy;
                            const isUnlocked = badge.unlocked;

                            return (
                              <div
                                key={badge.id}
                                className={`p-4 rounded-2xl border flex flex-col justify-between relative transition-all duration-300 ${isUnlocked
                                    ? 'border-indigo-500/25 bg-slate-900 shadow-inner'
                                    : 'border-slate-800/80 bg-slate-950/10 opacity-55 hover:opacity-90'
                                  }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className={`p-2.5 rounded-2xl bg-gradient-to-br shadow-md ${isUnlocked
                                      ? category.color + ' text-white'
                                      : 'from-slate-800 to-slate-900 text-slate-500'
                                    }`}>
                                    <Icon size={16} />
                                  </div>

                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${isUnlocked
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      : 'bg-slate-900 border border-slate-800 text-slate-500'
                                    }`}>
                                    {isUnlocked ? "Unlocked" : "Locked"}
                                  </span>
                                </div>

                                <div className="mt-4 space-y-1">
                                  <h5 className="font-extrabold text-xs text-white truncate">
                                    {badge.name}
                                  </h5>
                                  <p className="text-[10px] text-slate-450 leading-normal line-clamp-2">
                                    {badge.description}
                                  </p>
                                </div>

                                {/* Progress slider (if locked) */}
                                {!isUnlocked && badge.progress && (
                                  <div className="mt-3 pt-2 border-t border-slate-850">
                                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
                                      <span>Progress</span>
                                      <span>{badge.progress.current} / {badge.progress.target}</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-900 rounded-full mt-1 overflow-hidden">
                                      <div
                                        className="h-full bg-indigo-650 rounded-full"
                                        style={{ width: `${Math.round((badge.progress.current / badge.progress.target) * 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "analytics" && (
          <motion.div
            key="analytics-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {!analyticsData ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
                <span className="text-slate-500 text-sm font-semibold animate-pulse mt-2">Aggregating quiz telemetry...</span>
              </div>
            ) : analyticsData.total_quizzes === 0 ? (
              <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-12 text-center text-slate-500 max-w-lg mx-auto space-y-2">
                <BarChart2 size={48} className="mx-auto text-slate-850" />
                <h3 className="text-white font-extrabold text-md">No Quiz Data</h3>
                <p className="text-xs text-slate-400">Complete curriculum quizzes on your roadmap paths to initialize performance analytics here.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats Summary Ring Widgets */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Passing Rate Circle */}
                  <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl text-center space-y-4 flex flex-col items-center justify-center shadow-lg">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Quiz Passing Rate</span>
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                        <circle cx="48" cy="48" r="40" stroke="#6366f1" strokeWidth="8" fill="transparent"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - analyticsData.passing_rate / 100)}
                          strokeLinecap="round" />
                      </svg>
                      <span className="absolute text-lg font-black text-white">{analyticsData.passing_rate}%</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-semibold">{analyticsData.passed_quizzes} out of {analyticsData.total_quizzes} cleared</span>
                  </div>

                  {/* Avg Score Indicator */}
                  <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl text-center space-y-4 flex flex-col items-center justify-center shadow-lg">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Average Accuracy</span>
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                        <circle cx="48" cy="48" r="40" stroke="#ec4899" strokeWidth="8" fill="transparent"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - analyticsData.avg_score / 100)}
                          strokeLinecap="round" />
                      </svg>
                      <span className="absolute text-lg font-black text-white">{analyticsData.avg_score}%</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-semibold">Weighted accuracy score</span>
                  </div>

                  {/* Quizzes Count Stats */}
                  <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl text-center flex flex-col justify-between shadow-lg">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-4">Quiz Attempts Summary</span>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-450">Total Attempted</span>
                        <strong className="text-white text-lg">{analyticsData.total_quizzes}</strong>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-450">Quizzes Passed</span>
                        <strong className="text-emerald-400 text-lg">{analyticsData.passed_quizzes}</strong>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-450">Attempts Failed</span>
                        <strong className="text-rose-400 text-lg">{analyticsData.total_quizzes - analyticsData.passed_quizzes}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attempt History List */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4">
                  <h3 className="font-extrabold text-white text-md flex items-center gap-2">
                    <Activity className="text-indigo-400" size={16} /> Quiz Performance Log History
                  </h3>

                  <div className="overflow-hidden border border-slate-805 rounded-2xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase text-[9px] tracking-wider bg-slate-950/40">
                          <th className="py-3 pl-4">Attempt Index</th>
                          <th className="py-3">Date Completed</th>
                          <th className="py-3 text-center">Questions Scored</th>
                          <th className="py-3 text-center">Score Accuracy</th>
                          <th className="py-3 text-right pr-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {analyticsData.history.map((h, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/40 text-slate-350">
                            <td className="py-3.5 pl-4 font-bold">Attempt #{idx + 1}</td>
                            <td className="py-3.5">{h.date}</td>
                            <td className="py-3.5 text-center font-semibold">{h.score} / {h.total_questions}</td>
                            <td className="py-3.5 text-center font-bold">{Math.round((h.score / h.total_questions) * 100)}%</td>
                            <td className="py-3.5 text-right pr-4 font-bold">
                              {h.passed ? (
                                <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 text-[10px]">
                                  <CheckCircle size={10} /> Passed
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10 text-[10px]">
                                  <XCircle size={10} /> Failed
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Leaderboard;
