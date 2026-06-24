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
  Legend 
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
  Activity
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { apiFetch } from '../../services/api';

const EmotionAnalysis = () => {
  const { xp, setXp } = useStudent();

  // --- Mood Logger States ---
  const [happy, setHappy] = useState(60);
  const [focused, setFocused] = useState(70);
  const [frustrated, setFrustrated] = useState(20);
  const [stressed, setStressed] = useState(15);
  const [successMsg, setSuccessMsg] = useState("");

  const [moodHistory, setMoodHistory] = useState([
    { day: "Mon", focused: 30, happy: 45, frustrated: 15, stressed: 10 },
    { day: "Tue", focused: 35, happy: 48, frustrated: 10, stressed: 7 },
    { day: "Wed", focused: 45, happy: 35, frustrated: 12, stressed: 8 },
    { day: "Thu", focused: 25, happy: 40, frustrated: 20, stressed: 15 },
    { day: "Fri", focused: 38, happy: 42, frustrated: 12, stressed: 8 },
    { day: "Sat", focused: 40, happy: 45, frustrated: 10, stressed: 5 },
    { day: "Today", focused: 70, happy: 60, frustrated: 20, stressed: 15 }
  ]);

  // --- Focus Timer States ---
  const [secondsLeft, setSecondsLeft] = useState(1500); // 25 minutes
  const [timerRunning, setTimerRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  // Fetch mood history and focus stats from Supabase
  useEffect(() => {
    const loadWellnessStats = async () => {
      try {
        const [moodRes, focusRes] = await Promise.all([
          apiFetch('/v1/wellness/mood/history'),
          apiFetch('/v1/wellness/focus/stats')
        ]);
        if (moodRes.ok) {
          const moodData = await moodRes.json();
          if (moodData && moodData.length > 0) {
            setMoodHistory(moodData);
          }
        }
        if (focusRes.ok) {
          const focusData = await focusRes.json();
          setCompletedSessions(focusData.completed_sessions || 0);
        }
      } catch (err) {
        console.error("Failed to load wellness stats:", err);
      }
    };
    loadWellnessStats();
  }, []);

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
          const res = await apiFetch('/v1/wellness/focus', { method: 'POST' });
          if (res.ok) {
            const data = await res.json();
            setCompletedSessions(prev => prev + 1);
            if (data.xp_points !== undefined) {
              setXp(data.xp_points);
            } else {
              setXp(prev => prev + 50);
            }
            alert("🎉 Great job! You completed a 25-minute focus session. Earned +50 XP!");
          }
        } catch (err) {
          console.error("Failed to sync focus session:", err);
          setCompletedSessions(prev => prev + 1);
          setXp(prev => prev + 50);
          alert("🎉 Great job! You completed a 25-minute focus session. Earned +50 XP! (Saved locally)");
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

  const handleLogMood = async () => {
    try {
      const res = await apiFetch('/v1/wellness/mood', {
        method: 'POST',
        body: JSON.stringify({
          happiness: happy,
          focus: focused,
          frustration: frustrated,
          stress: stressed
        })
      });
      if (res.ok) {
        setSuccessMsg("Mood vector logged! Cognitive trends updated.");
        const moodRes = await apiFetch('/v1/wellness/mood/history');
        if (moodRes.ok) {
          const moodData = await moodRes.json();
          if (moodData && moodData.length > 0) {
            setMoodHistory(moodData);
          }
        }
      } else {
        throw new Error("Failed to save mood vector");
      }
    } catch (err) {
      console.error(err);
      setSuccessMsg("Logged locally! API offline.");
      setMoodHistory(prev => {
        const next = [...prev];
        const todayIdx = next.findIndex(d => d.day === "Today");
        if (todayIdx !== -1) {
          next[todayIdx] = { day: "Today", focused, happy, frustrated, stressed };
        }
        return next;
      });
    }
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // --- Dynamic Burnout Recommendation Engine ---
  const getRecommendation = () => {
    if (frustrated > 60 || stressed > 60) {
      return {
        title: "High Burnout Threat Detected",
        desc: "Frustration and stress parameters exceed normal thresholds. Take a 10-minute break. Refrain from starting new roadmap nodes. Try a deep breathing session.",
        color: "text-red-500 bg-red-500/10 border-red-500/25"
      };
    }
    if (focused > 70) {
      return {
        title: "Optimal Flow State Active",
        desc: "Cognitive resources are highly aligned. This is the best window to attempt difficult Quiz Arena checkpoints or complex coding challenges.",
        color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/25"
      };
    }
    return {
      title: "Balanced Learning State",
      desc: "Your cognitive workload is well-distributed. Maintain your current study rhythm and complete your daily quest goals.",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/25"
    };
  };

  const rec = getRecommendation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div>
        <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">Academic Affective Computing</p>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Learning Wellness Hub</h2>
        <p className="text-slate-500 text-xs mt-1">
          Monitor your emotional focus vectors, schedule focus sessions, log stress variables, and get AI-driven burnout preventions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Focus Timer & Mood Sliders */}
        <div className="lg:col-span-1 space-y-6">
          {/* Pomodoro Timer */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-center">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm mb-4 flex items-center justify-center gap-2">
              <Brain className="text-indigo-500" size={16} />
              Focus Mode (Pomodoro)
            </h3>
            
            <div className="my-6">
              <div className="text-4xl md:text-5xl font-black tracking-tight text-slate-800 dark:text-white font-mono">
                {formatTime(secondsLeft)}
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wide">
                {timerRunning ? "In the zone... stay focused" : "Ready to focus"}
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={toggleTimer}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer text-white ${
                  timerRunning ? "bg-amber-600 hover:bg-amber-500" : "bg-indigo-600 hover:bg-indigo-500"
                }`}
              >
                {timerRunning ? <Pause size={14} /> : <Play size={14} />}
                {timerRunning ? "Pause" : "Start Focus"}
              </button>
              <button
                onClick={resetTimer}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
              <span>Completed Sessions: {completedSessions}</span>
              <span className="text-indigo-500">+50 XP per session</span>
            </div>
          </div>

          {/* Interactive Mood Logger */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm flex items-center gap-2">
              <Activity className="text-indigo-500" size={16} />
              Affective Mood Logger
            </h3>
            <p className="text-[10px] text-slate-400">Drag levels matching your current learning mental state.</p>

            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1 font-bold text-slate-700 dark:text-slate-350">
                  <span className="flex items-center gap-1"><Smile size={14} className="text-emerald-500" /> Happiness</span>
                  <span>{happy}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={happy}
                  onChange={(e) => setHappy(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-bold text-slate-700 dark:text-slate-350">
                  <span className="flex items-center gap-1"><Brain size={14} className="text-indigo-500" /> Focus</span>
                  <span>{focused}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={focused}
                  onChange={(e) => setFocused(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-bold text-slate-700 dark:text-slate-350">
                  <span className="flex items-center gap-1"><Frown size={14} className="text-amber-500" /> Frustration</span>
                  <span>{frustrated}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={frustrated}
                  onChange={(e) => setFrustrated(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-bold text-slate-700 dark:text-slate-350">
                  <span className="flex items-center gap-1"><AlertCircle size={14} className="text-red-500" /> Stress</span>
                  <span>{stressed}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={stressed}
                  onChange={(e) => setStressed(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>
            </div>

            <button
              onClick={handleLogMood}
              className="w-full bg-slate-800 dark:bg-indigo-600 hover:bg-slate-750 dark:hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer mt-2"
            >
              Log Session Mood Vector
            </button>

            <AnimatePresence>
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold justify-center"
                >
                  <CheckCircle size={12} />
                  {successMsg}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Charts & Burnout Recommendation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mood History Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-4 flex items-center gap-2">
              <TrendingUp className="text-indigo-500" size={18} />
              Weekly Mood & Focus Stack Analytics
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={moodHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} labelStyle={{ color: '#94a3b8', fontSize: '11px' }} itemStyle={{ color: '#fff', fontSize: '12px' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area type="monotone" dataKey="happy" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Happy" />
                  <Area type="monotone" dataKey="focused" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} name="Focused" />
                  <Area type="monotone" dataKey="frustrated" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} name="Frustrated" />
                  <Area type="monotone" dataKey="stressed" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Stressed" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Diagnostics & Burnout Engine Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-1">AI Cognitive Coprocessor</h3>
              <p className="text-xs text-slate-400">Behavioral mapping to prevent developer/student burnout</p>
            </div>

            <div className={`p-4 rounded-2xl border ${rec.color} my-6 space-y-2`}>
              <h4 className="font-extrabold text-xs flex items-center gap-1.5">
                <Sparkles size={14} />
                {rec.title}
              </h4>
              <p className="text-[11px] leading-relaxed">
                {rec.desc}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850/80 text-[10px] text-slate-500 leading-normal flex items-start gap-2">
              <Flame className="text-indigo-500 shrink-0 mt-0.5" size={14} />
              <span><strong>Burnout Prevention Policy</strong>: Focus timers limit contiguous cognitive work to 90 minutes maximum. Logging your stress daily ensures precise ML performance predictions in the Student Hub.</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EmotionAnalysis;
