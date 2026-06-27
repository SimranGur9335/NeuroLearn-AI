import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';
import { 
  Smile, 
  Frown, 
  Brain, 
  Zap, 
  AlertCircle, 
  Sparkles,
  Flame,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  TrendingUp,
  Activity,
  Moon,
  Clock,
  BookOpen,
  Calendar,
  History
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { apiFetch } from '../../services/api';

const EmotionAnalysis = () => {
  const { xp, setXp } = useStudent();

  // --- Logger Inputs ---
  const [happy, setHappy] = useState(60);
  const [focused, setFocused] = useState(70);
  const [frustrated, setFrustrated] = useState(20);
  const [stressed, setStressed] = useState(15);
  const [sleepHours, setSleepHours] = useState(7.5);
  const [studyHours, setStudyHours] = useState(4.0);
  const [selectedHabits, setSelectedHabits] = useState(["Spaced Repetition"]);
  const [recommendations, setRecommendations] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [historyLoading, setHistoryLoading] = useState(true);

  // --- Habits checklist definitions ---
  const HABITS_LIST = [
    "Active Recall",
    "Spaced Repetition",
    "Feynman Technique",
    "Mind Mapping",
    "Pomodoro Method",
    "Group Explanations"
  ];

  const [moodHistory, setMoodHistory] = useState([
    { day: "Mon", happy: 45, focused: 30, frustrated: 15, stressed: 10, sleep_hours: 7.0, study_hours: 3.0, learning_habits: ["Active Recall"], recommendations: [] },
    { day: "Tue", happy: 48, focused: 35, frustrated: 10, stressed: 7, sleep_hours: 8.0, study_hours: 4.0, learning_habits: ["Spaced Repetition"], recommendations: [] },
    { day: "Wed", happy: 35, focused: 45, frustrated: 12, stressed: 8, sleep_hours: 6.5, study_hours: 5.0, learning_habits: ["Feynman Technique"], recommendations: [] },
    { day: "Thu", happy: 40, focused: 25, frustrated: 20, stressed: 15, sleep_hours: 5.5, study_hours: 6.0, learning_habits: ["Pomodoro Method"], recommendations: [] },
    { day: "Fri", happy: 42, focused: 38, frustrated: 12, stressed: 8, sleep_hours: 7.5, study_hours: 4.5, learning_habits: ["Mind Mapping"], recommendations: [] },
    { day: "Sat", happy: 45, focused: 40, frustrated: 10, stressed: 5, sleep_hours: 8.5, study_hours: 2.0, learning_habits: ["Active Recall"], recommendations: [] },
    { day: "Today", happy: 60, focused: 70, frustrated: 20, stressed: 15, sleep_hours: 7.5, study_hours: 4.0, learning_habits: ["Spaced Repetition", "Active Recall"], recommendations: ["Aim for an honors grade", "Limit contiguous focus hours"] }
  ]);

  // --- Focus Timer States ---
  const [secondsLeft, setSecondsLeft] = useState(1500); // 25 minutes
  const [timerRunning, setTimerRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  // Load history from API
  const loadWellnessStats = async () => {
    try {
      const [moodRes, focusRes] = await Promise.all([
        apiFetch('/api/v1/wellness/mood/history'),
        apiFetch('/api/v1/focus/stats') // fallback or custom endpoints
      ]);
      
      if (moodRes.ok) {
        const moodData = await moodRes.json();
        if (moodData && moodData.length > 0) {
          setMoodHistory(moodData);
          // Set recommendations from the latest log entry
          const latestLog = moodData[moodData.length - 1];
          if (latestLog.recommendations && latestLog.recommendations.length > 0) {
            setRecommendations(latestLog.recommendations);
          }
        }
      }
      
      // Try fetching focus stats if they exist
      try {
        const fStatsRes = await apiFetch('/api/v1/wellness/focus/stats');
        if (fStatsRes.ok) {
          const focusData = await fStatsRes.json();
          setCompletedSessions(focusData.completed_sessions || 0);
        }
      } catch (fErr) {
        if (focusRes && focusRes.ok) {
          const focusData = await focusRes.json();
          setCompletedSessions(focusData.completed_sessions || 0);
        }
      }
    } catch (err) {
      console.error("Failed to load wellness stats:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadWellnessStats();
  }, []);

  // Pomodoro Focus Timer ticker
  useEffect(() => {
    let interval = null;
    if (timerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && timerRunning) {
      setTimerRunning(false);
      setSecondsLeft(1500);
      
      const completeFocus = async () => {
        try {
          const res = await apiFetch('/api/v1/wellness/focus', { method: 'POST' });
          if (res.ok) {
            const data = await res.json();
            setCompletedSessions(prev => prev + 1);
            
            // Auto increment self-reported study hours for the day by 25 mins
            setStudyHours(prev => Math.round((prev + 0.42) * 100) / 100);
            
            if (data.xp_points !== undefined) {
              setXp(data.xp_points);
            } else {
              setXp(prev => prev + 50);
            }
            alert("🎉 Awesome job! You completed a 25-minute Pomodoro session. Earned +50 XP and logged +0.42 study hours!");
          }
        } catch (err) {
          console.error("Failed to sync focus session with database:", err);
          setCompletedSessions(prev => prev + 1);
          setStudyHours(prev => Math.round((prev + 0.42) * 100) / 100);
          setXp(prev => prev + 50);
          alert("🎉 Awesome job! You completed a 25-minute Pomodoro session. Earned +50 XP! (Saved locally)");
        }
      };
      completeFocus();
    }
    return () => clearInterval(interval);
  }, [timerRunning, secondsLeft]);

  const toggleTimer = () => setTimerRunning(!timerRunning);
  const resetTimer = () => {
    setTimerRunning(false);
    setSecondsLeft(1500);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Habit checkbox toggle handler
  const handleHabitToggle = (habit) => {
    setSelectedHabits(prev => 
      prev.includes(habit) 
        ? prev.filter(h => h !== habit) 
        : [...prev, habit]
    );
  };

  // Submit Logger Vector to Backend
  const handleLogMood = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    try {
      const res = await apiFetch('/api/v1/wellness/mood', {
        method: 'POST',
        body: JSON.stringify({
          happiness: happy,
          focus: focused,
          frustration: frustrated,
          stress: stressed,
          sleep_hours: sleepHours,
          study_hours: studyHours,
          learning_habits: selectedHabits
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSuccessMsg("Cognitive wellness vector logged successfully!");
        if (data.recommendations) {
          setRecommendations(data.recommendations);
        }
        // Refresh logs history
        loadWellnessStats();
      } else {
        throw new Error("Failed to save wellness log");
      }
    } catch (err) {
      console.error(err);
      setSuccessMsg("Logged locally! API fallback recommendations loaded.");
      
      // Fallback Recommendations Heuristics
      const localRecs = [];
      if (sleepHours < 6) {
        localRecs.push(`Sleep (${sleepHours}h) is low. Try to get 7.5+ hours tonight to support memory recovery.`);
      } else {
        localRecs.push("Sleep quantity is optimal! Maintain a consistent schedule for cognitive health.");
      }
      if (stressed > 60 || frustrated > 60) {
        localRecs.push("High stress levels logged. Use Pomodoro timers to chunk learning and schedule a rest.");
      } else {
        localRecs.push("Stress is minimal. Perfect window to tackle challenging programming assignments.");
      }
      if (selectedHabits.length < 2) {
        localRecs.push("Integrate active recall or spaced repetition into your logs to improve memory retention.");
      } else {
        localRecs.push("Great active learning habits logged today! Keep practicing spaced repetition.");
      }
      setRecommendations(localRecs);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  // UI Diagnosis Warning Level
  const getStressAlert = () => {
    if (stressed > 70) return { title: "Severe Academic Stress", color: "text-red-400 bg-red-500/10 border-red-500/20" };
    if (stressed > 40) return { title: "Moderate Workload Strain", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    return { title: "Stable Cognitive Load", color: "text-emerald-450 bg-emerald-500/10 border-emerald-500/20" };
  };

  const stressStatus = getStressAlert();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 text-slate-300"
    >
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden shadow-xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider bg-indigo-500/5 px-3 py-1 rounded-full border border-indigo-500/10">
              Cognitive Wellness Terminal
            </span>
            <h1 className="text-2xl md:text-3xl font-black mt-3 flex items-center gap-2">
              <Brain className="text-indigo-400" size={28} />
              Learning Wellness Dashboard
            </h1>
            <p className="text-slate-400 text-xs mt-1.5 max-w-xl leading-relaxed">
              Track daily stress levels, schedule Pomodoro focus timers, correlate sleep quality against study habits, and review personalized AI health diagnostics.
            </p>
          </div>
          <div className="shrink-0 flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <Activity className="text-indigo-400 animate-pulse" size={44} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Logger Sliders & Timer */}
        <div className="lg:col-span-1 space-y-6">
          {/* Pomodoro Focus Timer */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-3xl text-center">
            <h3 className="font-extrabold text-white text-sm mb-4 flex items-center justify-center gap-2">
              <Clock className="text-indigo-400" size={16} />
              Focus Mode Timer (Pomodoro)
            </h3>
            
            <div className="my-6">
              <div className="text-4xl md:text-5xl font-black tracking-tight text-white font-mono">
                {formatTime(secondsLeft)}
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wide">
                {timerRunning ? "Focus state active... remain seated" : "Ready to engage focus"}
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={toggleTimer}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer text-white ${
                  timerRunning ? "bg-amber-600 hover:bg-amber-500" : "bg-indigo-650 hover:bg-indigo-500"
                }`}
              >
                {timerRunning ? <Pause size={14} /> : <Play size={14} />}
                {timerRunning ? "Pause" : "Start Focus"}
              </button>
              <button
                onClick={resetTimer}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 transition-colors cursor-pointer"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
              <span>Completed Sessions: {completedSessions}</span>
              <span className="text-indigo-400 font-bold">+50 XP / focus session</span>
            </div>
          </div>

          {/* Interactive Sliders Form */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-3xl space-y-4">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
              <Activity className="text-indigo-400" size={16} />
              Log Daily Wellness Metrics
            </h3>
            <p className="text-[10px] text-slate-450">Correlate habits, study, and mood metrics for precise diagnostics.</p>

            <form onSubmit={handleLogMood} className="space-y-4 text-xs">
              {/* Mood group */}
              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>HAPPINESS: {happy}%</span>
                  </div>
                  <input
                    type="range" min="0" max="100" value={happy}
                    onChange={(e) => setHappy(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>FOCUS: {focused}%</span>
                  </div>
                  <input
                    type="range" min="0" max="100" value={focused}
                    onChange={(e) => setFocused(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>FRUSTRATION: {frustrated}%</span>
                  </div>
                  <input
                    type="range" min="0" max="100" value={frustrated}
                    onChange={(e) => setFrustrated(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>STRESS: {stressed}%</span>
                  </div>
                  <input
                    type="range" min="0" max="100" value={stressed}
                    onChange={(e) => setStressed(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                </div>
              </div>

              {/* Sleep & Study group */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Sleep duration</label>
                  <input 
                    type="number" step="0.5" min="0" max="24"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(parseFloat(e.target.value) || 8.0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Study hours today</label>
                  <input 
                    type="number" step="0.5" min="0" max="24"
                    value={studyHours}
                    onChange={(e) => setStudyHours(parseFloat(e.target.value) || 0.0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Learning Habits Grid */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Active Learning Habits Practiced</label>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  {HABITS_LIST.map((habit) => {
                    const isSelected = selectedHabits.includes(habit);
                    return (
                      <button
                        key={habit}
                        type="button"
                        onClick={() => handleHabitToggle(habit)}
                        className={`p-2 rounded-xl text-left border transition-all truncate flex items-center gap-1.5 ${
                          isSelected 
                            ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" 
                            : "bg-slate-950 border-slate-850 text-slate-450 hover:border-slate-800"
                        }`}
                      >
                        <CheckCircle size={10} className={isSelected ? "text-indigo-400" : "text-transparent"} />
                        {habit}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-650 hover:opacity-90 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"></div>
                    Syncing cognitive metrics...
                  </>
                ) : (
                  <>
                    <Zap size={14} />
                    Sync Wellness Vector
                  </>
                )}
              </button>
            </form>

            <AnimatePresence>
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-extrabold justify-center mt-2"
                >
                  <CheckCircle size={12} className="text-emerald-400" />
                  {successMsg}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Charts & Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cognitive Warning indicator */}
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl flex flex-col justify-between min-h-[130px] hover:border-indigo-500/25 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Cognitive Status</span>
                <Brain className="text-indigo-400" size={16} />
              </div>
              <div className="py-2">
                <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${stressStatus.color}`}>
                  {stressStatus.title}
                </span>
              </div>
              <span className="text-[9px] text-slate-500 font-semibold uppercase">Based on logged stress values</span>
            </div>

            {/* Sleep indicator */}
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl flex flex-col justify-between min-h-[130px] hover:border-indigo-500/25 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Last logged Sleep</span>
                <Moon className="text-indigo-400" size={16} />
              </div>
              <div className="py-1">
                <span className="text-2xl font-black text-white">{sleepHours} Hours</span>
                <p className="text-[9px] text-slate-400 mt-0.5">Average target: 7-8 hours</p>
              </div>
              <span className="text-[9px] text-slate-500 font-semibold uppercase">{sleepHours < 6 ? 'Deficit Warning' : 'Optimal'}</span>
            </div>

            {/* Study indicator */}
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl flex flex-col justify-between min-h-[130px] hover:border-indigo-500/25 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Today's study time</span>
                <Flame className="text-indigo-400" size={16} />
              </div>
              <div className="py-1">
                <span className="text-2xl font-black text-white">{studyHours} Hours</span>
                <p className="text-[9px] text-slate-400 mt-0.5">Self-reported + Pomodoro runs</p>
              </div>
              <span className="text-[9px] text-slate-500 font-semibold uppercase">Logged Today</span>
            </div>
          </div>

          {/* Analytics Tabs with Dual Charts */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-white text-xs md:text-sm flex items-center gap-1.5">
                <TrendingUp className="text-indigo-400" size={16} />
                Cognitive Analytics stack
              </h3>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Stacked Mood Area Chart */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-450 uppercase block tracking-wider">Affective Mind State Logs</span>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={moodHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                      <XAxis dataKey="day" stroke="#64748b" fontSize={9} />
                      <YAxis stroke="#64748b" fontSize={9} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ fontSize: '10px' }} />
                      <Area type="monotone" dataKey="happy" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.1} name="Happiness" />
                      <Area type="monotone" dataKey="focused" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} name="Focus" />
                      <Area type="monotone" dataKey="frustrated" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} name="Frustration" />
                      <Area type="monotone" dataKey="stressed" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} name="Stress" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Correlation Sleep vs Study Hours Chart */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-450 uppercase block tracking-wider">Sleep Hours vs Study Hours correlation</span>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={moodHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                      <XAxis dataKey="day" stroke="#64748b" fontSize={9} />
                      <YAxis stroke="#64748b" fontSize={9} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ fontSize: '10px' }} />
                      <Legend verticalAlign="top" height={28} iconSize={8} wrapperStyle={{ fontSize: '9px' }} />
                      <Bar dataKey="sleep_hours" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Sleep (Hrs)" />
                      <Bar dataKey="study_hours" fill="#7C3AED" radius={[4, 4, 0, 0]} name="Study (Hrs)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* AI recommendations log diagnostics */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h4 className="font-extrabold text-white text-xs flex items-center gap-1.5">
              <Sparkles className="text-indigo-400" size={16} />
              AI Cognitive Diagnostics & Preventions
            </h4>
            
            {recommendations.length === 0 ? (
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex items-center gap-2.5 text-xs text-slate-450">
                <Sparkles className="text-indigo-400 animate-pulse shrink-0" size={16} />
                <span>Log your mood metrics to compile personalized AI burnout recommendations.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs text-slate-450">
                {recommendations.map((recStr, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-950 border border-slate-850 rounded-2xl flex gap-3 align-start">
                    <CheckCircle className="text-indigo-400 shrink-0 mt-0.5" size={16} />
                    <div>
                      <h5 className="font-extrabold text-white text-[10px] uppercase tracking-wider">Advisor Checkpoint #{idx + 1}</h5>
                      <p className="mt-1 text-[10px] leading-relaxed text-slate-400">{recStr}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Table history log archive */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
            <div>
              <h3 className="font-extrabold text-white text-xs md:text-sm flex items-center gap-1.5">
                <History className="text-indigo-400" size={16} />
                Chronological Wellness Archive
              </h3>
              <p className="text-[9px] text-slate-450 mt-0.5">Logs audit index of student affect and study habits logs</p>
            </div>

            {historyLoading ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                <div className="animate-spin inline-block w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full mb-1"></div>
                <p>Retrieving logs...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-[11px] text-slate-400">
                  <thead>
                    <tr className="border-b border-slate-800 text-[9px] text-slate-450 uppercase font-bold tracking-wider">
                      <th className="pb-2.5 pl-1">Day/Date</th>
                      <th className="pb-2.5">Mood Metrics (H/F/Fr/St)</th>
                      <th className="pb-2.5">Sleep/Study Hours</th>
                      <th className="pb-2.5">Active Habits Practiced</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {moodHistory.map((run, idx) => (
                      <tr key={idx} className="hover:bg-slate-950/40 text-slate-350 transition-colors">
                        <td className="py-3 pl-1 text-[10px] text-slate-500">
                          <span className="font-bold text-slate-400 block">{run.day}</span>
                          <span className="text-[9px]">{run.date || 'Baseline'}</span>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2 text-[10px]">
                            <span className="text-emerald-450">H:{run.happy}%</span>
                            <span className="text-indigo-400">F:{run.focused}%</span>
                            <span className="text-amber-500">Fr:{run.frustrated}%</span>
                            <span className="text-red-400">St:{run.stressed}%</span>
                          </div>
                        </td>
                        <td className="py-3 font-semibold text-white">
                          Sleep: {run.sleep_hours}h • Study: {run.study_hours}h
                        </td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-1 max-w-[220px]">
                            {run.learning_habits && run.learning_habits.map((h) => (
                              <span key={h} className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/5 border border-indigo-500/10 text-indigo-300">
                                {h}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
        </div>

      </div>
    </motion.div>
  );
};

export default EmotionAnalysis;
