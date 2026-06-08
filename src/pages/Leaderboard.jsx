import React from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  Flame, 
  Shield, 
  Brain, 
  Box, 
  CheckCircle,
  Trophy,
  Users,
  Search,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { LEADERBOARD } from '../data/data';

const iconMap = {
  Award: Award,
  Flame: Flame,
  Shield: Shield,
  Brain: Brain,
  Box: Box,
  CheckCircle: CheckCircle
};

const Leaderboard = () => {
  const { badges, xp, streak } = useStudent();

  // Dynamically update the user's score on the leaderboard based on active global context!
  // Find "Aarav Singh (You)" in the mock leaderboard and update their XP/streak to reflect active stats
  const activeLeaderboard = LEADERBOARD.map(user => {
    if (user.name.includes("You")) {
      return {
        ...user,
        xp: xp,
        streak: streak,
        solved: Math.floor(xp / 150) + 1 // mock solved quizzes based on XP math
      };
    }
    return user;
  });

  // Sort leaderboard in descending order based on XP
  const sortedLeaderboard = [...activeLeaderboard].sort((a, b) => b.xp - a.xp);
  
  // Re-map ranks after sorting
  const finalLeaderboard = sortedLeaderboard.map((user, idx) => ({
    ...user,
    rank: idx + 1
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Page Header */}
      <div>
        <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">Achievements & Stats</p>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Gamification Hub</h2>
        <p className="text-slate-500 text-xs mt-1">
          Collect engineering credentials, unlock special topic badges, and check your rank on the campus-wide leaderboard.
        </p>
      </div>

      {/* Badges and Achievements Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Your Engineering Badges</h3>
            <p className="text-xs text-slate-400">Complete curriculum achievements to unlock badges</p>
          </div>
          <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs px-2.5 py-1 rounded-full font-bold border border-indigo-500/10">
            {badges.filter(b => b.unlocked).length} of {badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map((badge) => {
            const IconComponent = iconMap[badge.icon] || Award;
            const isUnlocked = badge.unlocked;

            return (
              <div 
                key={badge.id}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-between text-center relative group transition-all duration-300 ${
                  isUnlocked 
                    ? 'border-indigo-500/20 bg-slate-50/50 dark:bg-slate-950/30' 
                    : 'border-slate-150 dark:border-slate-850 opacity-40 hover:opacity-60'
                }`}
              >
                {/* Badge Icon bubble */}
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                  isUnlocked ? badge.color : 'from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-850'
                } flex items-center justify-center text-white shadow-md relative`}>
                  <IconComponent size={20} />
                  {isUnlocked && (
                    <span className="absolute -top-1 -right-1 bg-indigo-600 w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white dark:border-slate-900">
                      <Sparkles size={8} className="text-white" />
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-white line-clamp-1">
                    {badge.name}
                  </h4>
                </div>

                {/* Hover Details Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-950 text-white text-[10px] p-2.5 rounded-xl border border-slate-800 shadow-md w-44 z-50 text-center pointer-events-none">
                  <p className="font-bold text-indigo-400">{badge.name}</p>
                  <p className="text-slate-300 mt-1 leading-relaxed">{badge.description}</p>
                  <span className={`block font-black mt-1.5 ${isUnlocked ? 'text-emerald-500' : 'text-slate-500'}`}>
                    {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Campus Leaderboard Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base flex items-center gap-2">
              <Trophy className="text-yellow-500" size={20} />
              Campus Rankings
            </h3>
            <p className="text-xs text-slate-400">Weekly leaderboard based on cumulative study XP metrics</p>
          </div>
        </div>

        {/* Scrollable Table container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-150 dark:border-slate-850 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                <th className="pb-3 pl-3">Rank</th>
                <th className="pb-3">Learner</th>
                <th className="pb-3">Engineering Major</th>
                <th className="pb-3 text-center">Streak</th>
                <th className="pb-3 text-center">Modules Passed</th>
                <th className="pb-3 text-right pr-3">Experience Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850/80">
              {finalLeaderboard.map((user) => {
                const isCurrentUser = user.name.includes("You");
                const isTopThree = user.rank <= 3;
                const medal = user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : user.rank === 3 ? "🥉" : null;

                return (
                  <tr 
                    key={user.rank}
                    className={`transition-colors duration-200 ${
                      isCurrentUser 
                        ? 'bg-indigo-500/5 hover:bg-indigo-500/10 font-semibold' 
                        : 'hover:bg-slate-50/50 dark:hover:bg-slate-850/20'
                    }`}
                  >
                    {/* Rank cell */}
                    <td className="py-4 pl-3 font-extrabold text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        {medal ? (
                          <span className="text-base">{medal}</span>
                        ) : (
                          <span className="w-5 text-center text-xs text-slate-400">{user.rank}</span>
                        )}
                      </div>
                    </td>

                    {/* Learner name/avatar */}
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 flex items-center justify-center">
                          {user.avatar}
                        </span>
                        <div>
                          <span className={`text-slate-800 dark:text-white ${isCurrentUser ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'font-medium'}`}>
                            {user.name}
                          </span>
                          {isCurrentUser && (
                            <span className="ml-2 bg-indigo-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded">You</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Major / branch */}
                    <td className="py-4 text-slate-500 dark:text-slate-400">{user.branch}</td>

                    {/* Streak fire count */}
                    <td className="py-4 text-center">
                      {user.streak > 0 ? (
                        <div className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-500 font-extrabold bg-orange-500/5 px-2 py-0.5 rounded border border-orange-500/10 text-[10px]">
                          <Flame size={12} className="fill-current" />
                          <span>{user.streak}d</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Solved/passed modules count */}
                    <td className="py-4 text-center text-slate-600 dark:text-slate-300 font-bold">{user.solved}</td>

                    {/* XP Score */}
                    <td className="py-4 text-right pr-3 font-extrabold text-slate-800 dark:text-white text-sm">
                      <span className="text-yellow-600 dark:text-yellow-400 mr-1">T</span>
                      {user.xp.toLocaleString()} XP
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default Leaderboard;
