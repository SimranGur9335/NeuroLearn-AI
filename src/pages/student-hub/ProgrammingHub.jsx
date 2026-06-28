import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutTemplate,
  Infinity as InfinityIcon,
  TrendingUp,
  BrainCircuit,
  Cpu,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Trophy,
  Code,
  Award,
  CheckCircle,
  FolderOpen,
  ArrowRight,
  User,
  Settings,
  CircleDot
} from 'lucide-react';
import { apiFetch } from '../../services/api';
import { useStudent } from '../../context/StudentContext';
import { THEME_COLOR_MAP } from '../../components/StudentHubTheme';
import BackToHubButton from '../../components/BackToHubButton';

const ICON_MAP = {
  LayoutTemplate: LayoutTemplate,
  Infinity: InfinityIcon,
  TrendingUp: TrendingUp,
  BrainCircuit: BrainCircuit,
  Cpu: Cpu,
  Sparkles: Sparkles
};

const DIFFICULTY_COLORS = {
  easy: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  hard: 'bg-rose-500/10 text-rose-650 dark:text-rose-400 border-rose-500/20'
};

const PLATFORM_COLORS = {
  leetcode: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border-yellow-500/25',
  codeforces: 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/25',
  hackerrank: 'bg-green-500/15 text-green-650 dark:text-green-300 border-green-500/25',
  github: 'bg-slate-500/15 text-slate-650 dark:text-slate-350 border-slate-500/25',
  practice: 'bg-purple-500/15 text-purple-650 dark:text-purple-300 border-purple-500/25'
};

const ProgrammingHub = () => {
  const { profile } = useStudent();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  // Data states
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState(null);
  
  // Loading states
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState(null);

  // Active Category (DSA or Languages)
  const [activeCategory, setActiveCategory] = useState('All');

  // Expanded topics map: { [topic_id]: boolean }
  const [expandedTopics, setExpandedTopics] = useState({});

  // Action toggling state to prevent spam
  const [togglingId, setTogglingId] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await apiFetch('/programming/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error loading programming stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchTopicsAndQuestions = async () => {
    try {
      setLoadingTopics(true);
      setLoadingQuestions(true);

      const [topicsRes, questionsRes] = await Promise.all([
        apiFetch('/programming/topics'),
        apiFetch('/programming/questions')
      ]);

      if (!topicsRes.ok || !questionsRes.ok) {
        throw new Error('Failed to retrieve Programming Hub maps.');
      }

      const topicsData = await topicsRes.json();
      const questionsData = await questionsRes.json();

      setTopics(topicsData);
      setQuestions(questionsData);

      // Expand first topic by default if available
      if (topicsData.length > 0) {
        setExpandedTopics({ [topicsData[0].topic_id]: true });
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoadingTopics(false);
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    fetchTopicsAndQuestions();
    fetchStats();
  }, []);

  const toggleTopic = (topicId) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  const handleToggleComplete = async (questionId) => {
    if (togglingId === questionId) return;
    try {
      setTogglingId(questionId);
      const res = await apiFetch(`/programming/questions/${questionId}/toggle-complete`, {
        method: 'POST'
      });

      if (!res.ok) {
        throw new Error('Failed to sync checklist.');
      }

      const resData = await res.json();
      
      // Update local question state
      setQuestions(prev => 
        prev.map(q => 
          q.question_id === questionId 
            ? { ...q, completed: resData.completed } 
            : q
        )
      );

      // Refresh Stats live
      await fetchStats();
    } catch (err) {
      console.error("Error toggling question:", err);
    } finally {
      setTogglingId(null);
    }
  };

  // Filter topics by active category
  const filteredTopics = topics.filter(t => 
    activeCategory === 'All' || t.category.toLowerCase() === activeCategory.toLowerCase()
  );

  return (
    <div className="space-y-8">
      {/* Header breadcrumb & info */}
      <div className="flex flex-col gap-4">
        <BackToHubButton />
        <div className={`bg-gradient-to-r ${theme.gradient} border ${theme.border} p-6 rounded-3xl relative overflow-hidden shadow-xl text-white`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <span className={`text-xs ${theme.text} font-bold uppercase tracking-wider ${theme.bg} px-3 py-1 rounded-full border ${theme.border}`}>
                Skill Accelerator
              </span>
              <h1 className="text-2xl md:text-3xl font-black mt-3 flex items-center gap-2">
                <Code size={28} className={theme.text} /> Developer Programming Hub
              </h1>
              <p className="text-slate-300 text-sm mt-1 max-w-xl leading-relaxed">
                Elevate your algorithmic problem solving. Track progress across DSA concepts, master core language parameters, and benchmark practice sheets.
              </p>
            </div>
            <div className="shrink-0 flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10">
              <Award size={40} className={theme.text} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary Panel */}
      {!loadingStats && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Solved Stats Card */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden shadow-lg">
            <div className="absolute right-0 top-0 -mr-6 -mt-6 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Progress</span>
                <Trophy size={18} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.total_solved}</span>
                <span className="text-xs text-slate-500">/ {stats.total_questions} solved</span>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>Completion</span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  {stats.total_questions > 0 
                    ? Math.round((stats.total_solved / stats.total_questions) * 100) 
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800/80">
                <div 
                  className={`h-full ${theme.accent} rounded-full transition-all duration-550`} 
                  style={{ width: `${stats.total_questions > 0 ? (stats.total_solved / stats.total_questions) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Difficulty Metrics Card */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Difficulty Breakdown</span>
            <div className="space-y-3">
              {['easy', 'medium', 'hard'].map((diff) => {
                const s = stats.difficulty_breakdown[diff];
                const pct = s.total > 0 ? Math.round((s.solved / s.total) * 100) : 0;
                const barColor = diff === 'easy' ? 'bg-emerald-500' : diff === 'medium' ? 'bg-amber-500' : 'bg-rose-500';
                return (
                  <div key={diff} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="capitalize text-slate-700 dark:text-slate-300">{diff}</span>
                      <span className="text-slate-500">{s.solved}/{s.total} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${barColor} rounded-full`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Platform Stats Card */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-lg">
            <span className="text-xs font-bold text-slate-555 dark:text-slate-400 uppercase tracking-wider block">Platform Solved Shares</span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {Object.entries(stats.platform_breakdown).map(([plat, pStats]) => {
                if (pStats.total === 0) return null;
                return (
                  <div key={plat} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-2.5 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-slate-900 dark:text-white text-[11px] leading-tight">{plat}</p>
                      <span className="text-[10px] text-slate-500 font-medium">Solved</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 leading-tight">{pStats.solved}</p>
                      <span className="text-[9px] text-slate-500 dark:text-slate-600">/ {pStats.total}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Category Filters and Accordions */}
      <div className="space-y-6">
        {/* Category Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-850 pb-4">
          <div className="flex gap-2">
            {['All', 'DSA', 'Languages'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300 ${
                  activeCategory === cat
                    ? `${theme.bg} ${theme.text} border-indigo-500/50 scale-105`
                    : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat === 'All' ? 'All Content' : cat === 'DSA' ? 'Data Structures & Algorithms' : 'Programming Languages'}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-500 font-semibold hidden sm:inline-block">
            {filteredTopics.length} core learning folders
          </span>
        </div>

        {/* Loading / Error states for topics */}
        {loadingTopics ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
            <span className="text-slate-500 text-sm font-semibold animate-pulse">Mapping curriculum database nodes...</span>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl text-center text-red-400 max-w-lg mx-auto">
            {error}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTopics.map((topic) => {
              const TopicIcon = ICON_MAP[topic.icon] || Code;
              const isExpanded = !!expandedTopics[topic.topic_id];
              const topicQuestions = questions.filter(q => q.topic_id === topic.topic_id);
              const solvedCount = topicQuestions.filter(q => q.completed).length;
              
              return (
                <div 
                  key={topic.topic_id} 
                  className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                    isExpanded 
                      ? 'border-indigo-500/30 bg-slate-50 dark:bg-slate-900/60' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80 bg-white dark:bg-slate-900/30'
                  }`}
                >
                  {/* Topic Accordion Header */}
                  <div 
                    onClick={() => toggleTopic(topic.topic_id)}
                    className="p-5 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 ${theme.text}`}>
                        <TopicIcon size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{topic.title}</h3>
                          <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                            topic.category === 'DSA' 
                              ? 'bg-blue-500/10 text-blue-605 dark:text-blue-400 border border-blue-500/20' 
                              : 'bg-violet-500/10 text-violet-605 dark:text-violet-400 border border-violet-500/20'
                          }`}>
                            {topic.category}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed hidden sm:block">
                          {topic.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Topic solved progress pill */}
                      <span className="text-xs font-bold text-slate-500 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-1 rounded-xl">
                        Solved: <strong className="text-indigo-600 dark:text-indigo-400">{solvedCount}</strong> / {topicQuestions.length}
                      </span>
                      {isExpanded ? <ChevronUp size={18} className="text-slate-500 dark:text-slate-400" /> : <ChevronDown size={18} className="text-slate-500 dark:text-slate-400" />}
                    </div>
                  </div>

                  {/* Accordion Questions Content */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden bg-slate-50/50 dark:bg-slate-955/60 border-t border-slate-200 dark:border-slate-850/80"
                      >
                        <div className="p-4 space-y-2">
                          {topicQuestions.length === 0 ? (
                            <div className="text-center py-6 text-slate-500 dark:text-slate-650 text-xs">
                              No practice sheets loaded under this folder. Check back later!
                            </div>
                          ) : (
                            topicQuestions.map((q) => (
                              <div 
                                key={q.question_id}
                                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                                  q.completed 
                                    ? 'border-indigo-500/20 bg-indigo-500/5' 
                                    : 'border-slate-200 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-800 bg-white dark:bg-slate-950/60'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {/* Custom Checkbox Action */}
                                  <button
                                    onClick={() => handleToggleComplete(q.question_id)}
                                    disabled={togglingId !== null}
                                    className="focus:outline-none p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 transition-colors"
                                  >
                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                      q.completed 
                                        ? 'bg-indigo-650 border-indigo-500 text-white' 
                                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950'
                                    }`}>
                                      {q.completed && <CheckCircle size={13} className="fill-white text-indigo-650" />}
                                    </div>
                                  </button>
                                  
                                  <div>
                                    <h4 className={`text-xs font-bold transition-colors ${q.completed ? 'text-slate-500 dark:text-slate-300 line-through' : 'text-slate-900 dark:text-white'}`}>
                                      {q.title}
                                    </h4>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  {/* Difficulty Badge */}
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                                    DIFFICULTY_COLORS[q.difficulty.toLowerCase()] || DIFFICULTY_COLORS.easy
                                  }`}>
                                    {q.difficulty}
                                  </span>

                                  {/* Platform Badge */}
                                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md border hidden sm:inline-block ${
                                    PLATFORM_COLORS[q.platform.toLowerCase()] || PLATFORM_COLORS.practice
                                  }`}>
                                    {q.platform}
                                  </span>

                                  {/* Solve Link */}
                                  <a 
                                    href={q.url} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-800 text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-all"
                                  >
                                    <ExternalLink size={12} />
                                  </a>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgrammingHub;
