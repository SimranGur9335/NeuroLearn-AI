import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Flame, 
  Heart, 
  Trophy, 
  HelpCircle, 
  Timer,
  CheckCircle,
  XCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Sparkles,
  Zap,
  Award,
  Clock,
  ChevronRight,
  Shield,
  Percent,
  CalendarCheck,
  TrendingUp,
  Activity,
  Target,
  Swords,
  Users,
  Compass,
  ArrowUpRight,
  Lock,
  Cpu,
  BarChart2,
  Briefcase,
  MapPin,
  FileText,
  Megaphone,
  Crown
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { DOMAINS, LEVEL_SYSTEM } from '../data/data';

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

const Quiz = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { 
    hearts, 
    refillHearts, 
    completeQuiz,
    xp,
    streak,
    badges,
    nodeStates,
    quizHistory,
    profile 
  } = useStudent();

  const nodeId = searchParams.get('node');
  const domainId = searchParams.get('domain');

  // fallback selections if user navigates directly to Quiz Arena without params
  const [selectedDomainId, setSelectedDomainId] = useState(DOMAINS[0].id);
  const [selectedNodeId, setSelectedNodeId] = useState(DOMAINS[0].nodes[0].id);

  // Active quiz states
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30); // 30s per question
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState(null); // stores end result object

  const timerRef = useRef(null);

  // Load active node & domain
  const activeDomainId = domainId || selectedDomainId;
  const activeNodeId = nodeId || selectedNodeId;

  const currentDomain = DOMAINS.find(d => d.id === activeDomainId) || DOMAINS[0];
  const currentNode = currentDomain.nodes.find(n => n.id === activeNodeId) || currentDomain.nodes[0];
  const questions = currentNode.quiz || [];

  // Reset quiz states when node changes
  useEffect(() => {
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizCompleted(false);
    setQuizResults(null);
  }, [nodeId, domainId]);

  // Handle countdown timer
  useEffect(() => {
    if (quizStarted && !quizCompleted && !isAnswerSubmitted) {
      setTimeLeft(30);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Auto submit as wrong
            handleSubmitAnswer(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [quizStarted, currentQuestionIndex, isAnswerSubmitted, quizCompleted]);

  const startQuiz = () => {
    if (hearts <= 0) {
      alert("You have 0 hearts! Please buy a refill in the header using XP before taking a quiz.");
      return;
    }
    setQuizStarted(true);
    setScore(0);
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswerSubmitted(false);
    setQuizCompleted(false);
  };

  const startQuizWithParams = (dId, nId) => {
    if (hearts <= 0) {
      alert("You have 0 hearts! Please refill your hearts first.");
      return;
    }
    setSelectedDomainId(dId);
    setSelectedNodeId(nId);
    setQuizStarted(true);
    setScore(0);
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswerSubmitted(false);
    setQuizCompleted(false);
  };

  const handleOptionSelect = (index) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionIndex(index);
  };

  const handleSubmitAnswer = (timeout = false) => {
    if (isAnswerSubmitted) return;
    clearInterval(timerRef.current);

    const question = questions[currentQuestionIndex];
    const isCorrect = !timeout && selectedOptionIndex === question.correctIndex;

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setIsAnswerSubmitted(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswerSubmitted(false);
    } else {
      // Quiz finished! Calculate and sync with context
      setQuizCompleted(true);
      const finalScore = score + (selectedOptionIndex === questions[currentQuestionIndex].correctIndex && !isAnswerSubmitted ? 1 : 0);
      const results = completeQuiz(currentNode.id, currentDomain.id, finalScore, questions.length);
      setQuizResults(results);
    }
  };

  const getDomainNodes = () => {
    const d = DOMAINS.find(dom => dom.id === selectedDomainId);
    return d ? d.nodes : [];
  };

  // Dynamic Level calculations
  const levelInfo = useMemo(() => {
    return calculateLevelInfo(xp);
  }, [xp]);

  // Quiz Stats computations
  const quizStats = useMemo(() => {
    const totalAttempts = quizHistory?.length || 0;
    const completedCount = Object.values(nodeStates || {}).filter(status => status === "completed").length;
    
    let totalScorePct = 0;
    let validCount = 0;
    quizHistory?.forEach(item => {
      const dom = DOMAINS.find(d => d.id === item.domainId);
      const node = dom?.nodes.find(n => n.id === item.nodeId);
      const questionsCount = node?.quiz?.length || 3;
      totalScorePct += (item.score / questionsCount) * 100;
      validCount++;
    });
    
    const avgAccuracy = validCount > 0 ? Math.round(totalScorePct / validCount) : 0;
    const totalQuizXp = quizHistory?.reduce((sum, item) => sum + (item.xpEarned || 0), 0) || 0;

    return {
      totalAttempts,
      completedCount,
      avgAccuracy,
      totalQuizXp
    };
  }, [quizHistory, nodeStates]);

  // Quiz Achievements (Filter academic/quiz badges)
  const quizAchievements = useMemo(() => {
    const quizBadgeIds = ["b1", "b3", "b10", "b12", "b15"];
    return badges?.filter(b => quizBadgeIds.includes(b.id)) || [];
  }, [badges]);

  // Daily Challenge Node selection (Deep Learning & Neural Networks)
  const dailyChallengeNode = useMemo(() => {
    const featuredDomain = DOMAINS.find(d => d.id === "ai-ml") || DOMAINS[0];
    const featuredNode = featuredDomain.nodes.find(n => n.id === "aiml-3") || featuredDomain.nodes[0];
    return {
      domainId: featuredDomain.id,
      domainTitle: featuredDomain.title,
      nodeId: featuredNode.id,
      nodeTitle: featuredNode.title,
      description: featuredNode.description,
      questionsCount: featuredNode.quiz?.length || 3,
      difficulty: featuredNode.difficulty
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-12 text-slate-800 dark:text-slate-100"
    >
      {/* 1. QUIZ DASHBOARD MODE */}
      {!quizStarted && !quizCompleted && (
        <div className="space-y-8">
          {/* HERO PROFILE DASHBOARD */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 p-6 md:p-8 shadow-2xl text-white">
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
                      Quiz Contender
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5 font-medium">{profile.branch} • {profile.year}</p>
                  
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

              {/* Heart Life and Quick Status */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-3 text-center min-w-[90px] md:min-w-[110px]">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Hearts Left</span>
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3].map((heartIndex) => (
                      <Heart 
                        key={heartIndex} 
                        size={16} 
                        className={heartIndex <= hearts ? "text-red-500 fill-red-500 animate-pulse" : "text-slate-600"} 
                      />
                    ))}
                  </div>
                </div>
                
                <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-3 text-center min-w-[90px] md:min-w-[110px]">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Daily Streak</span>
                  <span className="text-base md:text-lg font-black text-orange-400 flex items-center justify-center gap-1">
                    {streak}d <Flame size={16} className="fill-current text-orange-500" />
                  </span>
                </div>

                {hearts < 3 && (
                  <button
                    onClick={refillHearts}
                    disabled={xp < 150}
                    className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                      xp >= 150 
                        ? "bg-emerald-500 hover:bg-emerald-400 text-white border-emerald-400 cursor-pointer shadow-lg shadow-emerald-500/20" 
                        : "bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed"
                    }`}
                  >
                    Refill (+3 ❤) <span className="block text-[8px] opacity-80">150 XP</span>
                  </button>
                )}
              </div>
            </div>

            {/* Level XP Progress Bar */}
            <div className="mt-6 pt-4 border-t border-white/5 relative z-10">
              <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                <span>Quiz Progression XP</span>
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

          {/* ACTIVE ROADMAP DIRECT PARAMS CHALLENGE CARD */}
          {nodeId && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-6 rounded-3xl border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-sm flex flex-col md:flex-row justify-between items-center gap-4"
            >
              <div className="flex items-center gap-4">
                <span className="p-3 bg-indigo-500 text-white rounded-2xl">
                  <Target size={24} />
                </span>
                <div>
                  <span className="bg-indigo-600/20 text-indigo-400 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-indigo-500/30">
                    Roadmap Challenge
                  </span>
                  <h3 className="font-extrabold text-sm md:text-base text-slate-800 dark:text-white mt-1">
                    Ready to unlock {currentNode.title}?
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {currentDomain.title} • {questions.length} questions
                  </p>
                </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={() => navigate('/roadmap')}
                  className="flex-1 md:flex-none px-5 py-2.5 border border-slate-250 dark:border-slate-800 rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-850 font-semibold cursor-pointer"
                >
                  Roadmap
                </button>
                <button
                  onClick={startQuiz}
                  className="flex-1 md:flex-none px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/25 cursor-pointer"
                >
                  Start Quiz Arena
                </button>
              </div>
            </motion.div>
          )}

          {/* QUICK STATS SECTION */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div 
              whileHover={{ y: -2 }}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Attempts</span>
                <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500"><Activity size={14} /></span>
              </div>
              <div className="mt-3">
                <span className="block text-xl font-black text-slate-800 dark:text-white">{quizStats.totalAttempts}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block font-semibold">Quizzes taken</span>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -2 }}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Modules Unlocked</span>
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500"><CheckCircle size={14} /></span>
              </div>
              <div className="mt-3">
                <span className="block text-xl font-black text-slate-800 dark:text-white">{quizStats.completedCount}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block font-semibold">Completed modules</span>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -2 }}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Accuracy</span>
                <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500"><Percent size={14} /></span>
              </div>
              <div className="mt-3">
                <span className="block text-xl font-black text-slate-800 dark:text-white">{quizStats.avgAccuracy}%</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block font-semibold">Correct answers ratio</span>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -2 }}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Arena XP Earned</span>
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500"><Zap size={14} /></span>
              </div>
              <div className="mt-3">
                <span className="block text-xl font-black text-slate-800 dark:text-white">+{quizStats.totalQuizXp.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block font-semibold">Points from test runs</span>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Quiz Categories (Learning Paths) & Daily Challenge */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* DAILY CHALLENGE CARD */}
              <div className="p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 text-white relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-2.5 py-1 rounded-full border border-amber-400/30 tracking-wider">
                      <Sparkles size={10} /> Daily Arena Challenge
                    </span>
                    <h3 className="text-lg font-black tracking-tight mt-1">{dailyChallengeNode.nodeTitle}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                      {dailyChallengeNode.description}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-1">
                      <span>{dailyChallengeNode.domainTitle}</span>
                      <span>•</span>
                      <span>{dailyChallengeNode.questionsCount} Questions</span>
                      <span>•</span>
                      <span className="text-amber-400">{dailyChallengeNode.difficulty}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => startQuizWithParams(dailyChallengeNode.domainId, dailyChallengeNode.nodeId)}
                    className="w-full md:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10 cursor-pointer transition-colors shrink-0"
                  >
                    <span>Enter Arena</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* QUIZ CATEGORY CARDS (LEARNING PATHS) */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Arena Learning Paths</h3>
                  <p className="text-xs text-slate-400">Launch standard curriculum tests directly to unlock next chapters</p>
                </div>

                <div className="space-y-6">
                  {DOMAINS.map((domain) => {
                    return (
                      <div 
                        key={domain.id} 
                        className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4"
                      >
                        <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
                          <div>
                            <span className="bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 text-[9px] font-black uppercase px-2 py-0.5 rounded border border-indigo-500/20">
                              {domain.category || "Domain"}
                            </span>
                            <h4 className="font-black text-sm text-slate-800 dark:text-white mt-1">
                              {domain.title}
                            </h4>
                          </div>
                          <div className="text-right text-[10px] text-slate-400 font-bold uppercase">
                            <span>{domain.difficulty}</span>
                            <span className="block mt-0.5">{domain.duration}</span>
                          </div>
                        </div>

                        {/* List of nodes inside the domain */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {domain.nodes.map((node) => {
                            const state = nodeStates[node.id] || "locked";
                            const isLocked = state === "locked";
                            const isCompleted = state === "completed";
                            const isCurrent = state === "in_progress";

                            return (
                              <div 
                                key={node.id} 
                                className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 ${
                                  isCompleted 
                                    ? "border-emerald-500/25 bg-slate-50/20 dark:bg-slate-950/10" 
                                    : isCurrent 
                                      ? "border-indigo-500/30 bg-slate-50/30 dark:bg-indigo-950/15" 
                                      : "border-slate-200/40 dark:border-slate-800/60 opacity-60"
                                }`}
                              >
                                <div>
                                  <div className="flex justify-between items-start gap-2">
                                    <h5 className="font-bold text-xs text-slate-800 dark:text-white leading-snug line-clamp-1">
                                      {node.title}
                                    </h5>
                                    {isCompleted && (
                                      <span className="bg-emerald-500/10 text-emerald-500 p-0.5 rounded text-[8px] font-black uppercase tracking-wider border border-emerald-500/20">
                                        Passed
                                      </span>
                                    )}
                                    {isCurrent && (
                                      <span className="bg-indigo-500/10 text-indigo-500 p-0.5 rounded text-[8px] font-black uppercase tracking-wider border border-indigo-500/20 animate-pulse">
                                        Active
                                      </span>
                                    )}
                                    {isLocked && (
                                      <span className="text-slate-450 dark:text-slate-500"><Lock size={12} /></span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-2 mt-1">
                                    {node.description}
                                  </p>
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t border-slate-100/60 dark:border-slate-850/60">
                                  <span className="text-[9px] text-slate-400 font-bold uppercase">
                                    {node.difficulty} • {node.duration}
                                  </span>
                                  {!isLocked ? (
                                    <button
                                      onClick={() => startQuizWithParams(domain.id, node.id)}
                                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase cursor-pointer transition-colors ${
                                        isCompleted 
                                          ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400" 
                                          : "bg-indigo-600 hover:bg-indigo-500 text-white"
                                      }`}
                                    >
                                      {isCompleted ? "Retake" : "Launch"}
                                    </button>
                                  ) : (
                                    <span className="text-[9px] text-slate-400 font-bold uppercase py-1 px-2 bg-slate-100 dark:bg-slate-950 rounded">
                                      Locked
                                    </span>
                                  )}
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

              {/* LIVE BATTLE & TOURNAMENTS (COMING SOON) */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Arena Tournaments</h3>
                  <p className="text-xs text-slate-400">Compete with friends or department cohorts in live matchups</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* BATTLE ARENA */}
                  <div className="relative overflow-hidden p-5 rounded-3xl border border-slate-200/40 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col justify-between h-48 opacity-80 group">
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500"><Swords size={18} /></span>
                        <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          Coming Soon
                        </span>
                      </div>
                      <h4 className="font-black text-sm text-slate-800 dark:text-white mt-4">Battle Arena</h4>
                      <p className="text-[10px] text-slate-450 leading-normal mt-1">
                        Real-time PvP matching engine. Challenge classmates to speed quizzes.
                      </p>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 mt-2 block">PvP Matchmaking Mode</span>
                  </div>

                  {/* DEPARTMENT CHALLENGE */}
                  <div className="relative overflow-hidden p-5 rounded-3xl border border-slate-200/40 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col justify-between h-48 opacity-80 group">
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><Users size={18} /></span>
                        <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Coming Soon
                        </span>
                      </div>
                      <h4 className="font-black text-sm text-slate-800 dark:text-white mt-4">Dept Challenge</h4>
                      <p className="text-[10px] text-slate-450 leading-normal mt-1">
                        CS vs. IT weekly clashes. Accumulate department victory points.
                      </p>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 mt-2 block">Inter-department Clash</span>
                  </div>

                  {/* INSTITUTION CHAMPIONSHIP */}
                  <div className="relative overflow-hidden p-5 rounded-3xl border border-slate-200/40 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col justify-between h-48 opacity-80 group">
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500"><Trophy size={18} /></span>
                        <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Coming Soon
                        </span>
                      </div>
                      <h4 className="font-black text-sm text-slate-800 dark:text-white mt-4">College Cup</h4>
                      <p className="text-[10px] text-slate-455 leading-normal mt-1">
                        Large scale university tournaments. Win campus trophies and badges.
                      </p>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 mt-2 block">Annual Championship</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Achievements, Attempts, Skill Analytics, Career Readiness */}
            <div className="space-y-8">
              
              {/* QUIZ ACHIEVEMENTS SECTION */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-5">
                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Quiz Achievements</h3>
                  <p className="text-xs text-slate-400">Special achievements unlocked through testing</p>
                </div>

                <div className="space-y-4">
                  {quizAchievements.map((badge) => {
                    const Icon = iconMap[badge.icon] || Trophy;
                    const pct = badge.progress?.target > 0 ? (badge.progress.current / badge.progress.target) * 100 : 0;
                    const progressPercent = Math.round(pct);
                    const isUnlocked = badge.unlocked;

                    return (
                      <div 
                        key={badge.id} 
                        className="p-3 border border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-950/20 rounded-2xl flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className={`p-2 rounded-xl ${isUnlocked ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-850 text-slate-400'}`}>
                              <Icon size={14} />
                            </span>
                            <div>
                              <h4 className="text-xs font-black text-slate-800 dark:text-white leading-none">
                                {badge.name}
                              </h4>
                              <span className="text-[8px] text-slate-400 font-bold uppercase mt-1 block">
                                {badge.category}
                              </span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-black ${isUnlocked ? 'text-emerald-500' : 'text-indigo-500'}`}>
                            {isUnlocked ? "Earned" : `${progressPercent}%`}
                          </span>
                        </div>
                        
                        <p className="text-[9px] text-slate-550 dark:text-slate-400 leading-relaxed">
                          {badge.description}
                        </p>

                        {!isUnlocked && badge.progress && (
                          <div className="mt-1">
                            <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-600 rounded-full" 
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RECENT ATTEMPTS SECTION */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-5">
                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Recent Attempts</h3>
                  <p className="text-xs text-slate-400">History of your latest Arena runs</p>
                </div>

                <div className="space-y-3">
                  {quizHistory && quizHistory.length > 0 ? (
                    quizHistory.slice(0, 5).map((attempt, idx) => {
                      const dom = DOMAINS.find(d => d.id === attempt.domainId);
                      const node = dom?.nodes.find(n => n.id === attempt.nodeId);
                      const maxQuestions = node?.quiz?.length || 3;
                      const accuracy = Math.round((attempt.score / maxQuestions) * 100);
                      const isPassed = accuracy >= 60;

                      return (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between p-2.5 border-b border-slate-100 dark:border-slate-850 last:border-b-0"
                        >
                          <div className="min-w-0">
                            <span className="font-extrabold text-xs text-slate-800 dark:text-white block truncate">
                              {node?.title || attempt.nodeId}
                            </span>
                            <span className="text-[9px] text-slate-400 block mt-0.5">
                              {attempt.date} • {dom?.title || attempt.domainId}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`inline-block text-[10px] font-black px-1.5 py-0.5 rounded ${
                              isPassed 
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                                : "bg-red-500/10 text-red-600 dark:text-red-400"
                            }`}>
                              {attempt.score}/{maxQuestions}
                            </span>
                            <span className="block text-[9px] font-bold text-amber-500 mt-1">
                              +{attempt.xpEarned || 0} XP
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      No attempts registered yet. Make your first run!
                    </div>
                  )}
                </div>
              </div>

              {/* SKILL ANALYTICS (COMING SOON) */}
              <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm group">
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1.5px] dark:bg-slate-950/45 flex flex-col items-center justify-center z-10">
                  <span className="p-2 bg-indigo-500 text-white rounded-2xl mb-1.5 shadow-lg shadow-indigo-500/20">
                    <Lock size={16} />
                  </span>
                  <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider">
                    Coming Soon
                  </span>
                </div>

                <div className="opacity-30 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-extrabold text-slate-850 dark:text-white text-xs">Skill Analytics</h3>
                    <BarChart2 size={16} className="text-indigo-500" />
                  </div>
                  {/* Mock analytics bars */}
                  <div className="space-y-2.5">
                    {[
                      { name: "Logic & Matrix operations", val: 85, col: "bg-indigo-500" },
                      { name: "Regularization & Tuning", val: 64, col: "bg-purple-500" },
                      { name: "Network Forensics", val: 92, col: "bg-emerald-500" }
                    ].map((bar, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-500 font-bold">
                          <span>{bar.name}</span>
                          <span>{bar.val}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${bar.col}`} style={{ width: `${bar.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CAREER READINESS (COMING SOON) */}
              <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm group">
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1.5px] dark:bg-slate-950/45 flex flex-col items-center justify-center z-10">
                  <span className="p-2 bg-emerald-500 text-white rounded-2xl mb-1.5 shadow-lg shadow-emerald-500/20">
                    <Lock size={16} />
                  </span>
                  <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider">
                    Coming Soon
                  </span>
                </div>

                <div className="opacity-30 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-extrabold text-slate-850 dark:text-white text-xs">Career Readiness</h3>
                    <Briefcase size={16} className="text-emerald-500" />
                  </div>
                  {/* Mock career readiness stats */}
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-slate-850 dark:text-white block">AI / ML Engineer</span>
                        <span className="text-[8px] text-slate-400 block mt-0.5">3/4 Modules Cleared</span>
                      </div>
                      <span className="text-sm font-black text-emerald-500">75%</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 2. ACTIVE QUESTION ARENA WRAPPER */}
      {quizStarted && !quizCompleted && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Progress header with premium container */}
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 px-6 py-4 rounded-3xl shadow-md animate-fade-in">
            <div>
              <span className="bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-indigo-500/20">
                {currentDomain.title}
              </span>
              <span className="text-xs font-black text-slate-800 dark:text-white block mt-1">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>

            {/* Timer visual block */}
            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200 font-extrabold px-3 py-1.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-850">
              <Timer size={16} className={timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-indigo-500"} />
              <span className={timeLeft <= 10 ? "text-red-500" : ""}>{timeLeft}s</span>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl">
            <h3 className="font-extrabold text-slate-850 dark:text-white text-base md:text-lg mb-8 leading-relaxed">
              {questions[currentQuestionIndex].question}
            </h3>

            {/* Options List */}
            <div className="space-y-3">
              {questions[currentQuestionIndex].options.map((option, index) => {
                const isSelected = selectedOptionIndex === index;
                const isCorrect = index === questions[currentQuestionIndex].correctIndex;

                let optionStyle = "border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-350";
                
                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    optionStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold shadow-sm";
                  } else if (isSelected) {
                    optionStyle = "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold";
                  } else {
                    optionStyle = "border-slate-100 dark:border-slate-850 opacity-40 text-slate-400";
                  }
                } else if (isSelected) {
                  optionStyle = "border-indigo-600 ring-2 ring-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-bold";
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    disabled={isAnswerSubmitted}
                    className={`w-full p-4 rounded-2xl border text-left text-xs transition-all duration-150 flex items-center justify-between ${
                      !isAnswerSubmitted ? 'cursor-pointer' : ''
                    } ${optionStyle}`}
                  >
                    <span>{option}</span>
                    {isAnswerSubmitted && isCorrect && <CheckCircle size={16} className="text-emerald-500 shrink-0" />}
                    {isAnswerSubmitted && isSelected && !isCorrect && <XCircle size={16} className="text-red-500 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation panel after submit */}
            {isAnswerSubmitted && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850/80 rounded-2xl text-xs"
              >
                <span className="font-bold text-indigo-500 dark:text-indigo-400 block mb-1 uppercase text-[9px] tracking-wider">Reference Explanation:</span>
                <p className="text-slate-650 dark:text-slate-400 leading-relaxed">
                  {questions[currentQuestionIndex].explanation}
                </p>
              </motion.div>
            )}

            {/* Action Bar */}
            <div className="mt-8 flex justify-end">
              {!isAnswerSubmitted ? (
                <button
                  onClick={() => handleSubmitAnswer(false)}
                  disabled={selectedOptionIndex === null}
                  className={`px-6 py-3 rounded-xl text-xs font-bold text-white shadow-md shadow-indigo-600/10 transition-colors ${
                    selectedOptionIndex === null 
                      ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed text-slate-400 shadow-none' 
                      : 'bg-indigo-600 hover:bg-indigo-500 cursor-pointer'
                  }`}
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{currentQuestionIndex + 1 === questions.length ? 'Finish Quiz' : 'Next Question'}</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. PREMIUM RESULT SCREEN WRAPPER */}
      {quizCompleted && quizResults && (
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-8 shadow-xl text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
            {quizResults.passed ? "🏆" : "❌"}
          </div>

          <div className="space-y-2">
            <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
              quizResults.passed 
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                : "bg-red-500/10 text-red-500 border-red-500/20"
            }`}>
              {quizResults.passed ? "Prerequisite Unlocked!" : "Benchmark Not Met"}
            </span>
            <h2 className="text-xl md:text-2xl font-black text-slate-850 dark:text-white">
              {quizResults.passed ? "Quiz Arena Cleared" : "Attempt Completed"}
            </h2>
            <p className="text-slate-500 text-xs leading-relaxed max-w-sm mx-auto">
              {quizResults.passed 
                ? `Incredible job! You scored ${score}/${questions.length} and unlocked the next nodes on your learning path.`
                : `You scored ${score}/${questions.length}. A minimum score of 60% is required to advance. Take time to study and retry.`
              }
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 text-left">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">XP Gained</span>
              <span className="font-extrabold text-lg text-yellow-500 block mt-1">+{quizResults.xpReward} XP</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 text-left">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Accuracy</span>
              <span className={`font-extrabold text-lg block mt-1 ${quizResults.passed ? 'text-emerald-500' : 'text-red-500'}`}>
                {Math.round((score / questions.length) * 100)}%
              </span>
            </div>
          </div>

          {/* Action triggers */}
          <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-850">
            <button
              onClick={startQuiz}
              className="flex-1 py-3 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 text-xs text-slate-650 dark:text-slate-400 font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={14} />
              Try Again
            </button>
            <button
              onClick={() => navigate('/roadmap')}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/10 cursor-pointer"
            >
              Back to Path
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Quiz;
