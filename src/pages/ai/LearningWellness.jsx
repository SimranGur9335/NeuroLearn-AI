// src/pages/ai/LearningWellness.jsx
import React, { useState, useEffect, useRef } from 'react';
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
  Bar
} from 'recharts';
import {
  Smile,
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
  History,
  Trash2,
  Edit2,
  Check,
  X,
  Award,
  ShieldAlert,
  Heart,
  ChevronRight,
  User,
  CheckSquare,
  Download,
  Sliders,
  Settings
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { apiFetch } from '../../services/api';
import { THEME_COLOR_MAP } from '../../components/StudentHubTheme';
import StudentHubHeader from '../../components/StudentHubHeader';

const LearningWellness = () => {
  const { profile, xp, setXp } = useStudent();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  // --- Core States ---
  const [stats, setStats] = useState(null);
  const [chartRange, setChartRange] = useState('weekly'); // daily, weekly, monthly, custom
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [reflections, setReflections] = useState([]);
  const [checkins, setCheckins] = useState([]);

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingReflections, setLoadingReflections] = useState(true);
  const [loadingCheckins, setLoadingCheckins] = useState(true);

  // --- Check-in Form State ---
  const [checkinForm, setCheckinForm] = useState({
    mood: 'focused',
    energy_level: 7,
    focus_level: 7,
    stress_level: 3,
    sleep_hours: 8.0,
    planned_study_hours: 4.0,
    learning_goal: ''
  });
  const [submittingCheckin, setSubmittingCheckin] = useState(false);
  const [checkinMessage, setCheckinMessage] = useState('');

  // --- Reflection Form State ---
  const [reflectionText, setReflectionText] = useState('');
  const [submittingReflection, setSubmittingReflection] = useState(false);
  const [editingReflectionId, setEditingReflectionId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // --- Focus Session (Pomodoro) States ---
  const [timerPreset, setTimerPreset] = useState(25); // minutes
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [timerPaused, setTimerPaused] = useState(false);
  const timerIntervalRef = useRef(null);

  // --- Focus Session History State ---
  const [focusHistory, setFocusHistory] = useState([]);
  const [loadingFocusHistory, setLoadingFocusHistory] = useState(true);

  // --- Preferences State ---
  const [preferences, setPreferences] = useState({
    pomodoro_preset: 25,
    preferred_focus_duration: 25,
    daily_study_goal: 4.0,
    daily_sleep_goal: 8.0,
    reminder_time: '09:00',
    notification_preference: true
  });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsMessage, setPrefsMessage] = useState('');
  const [showPrefsModal, setShowPrefsModal] = useState(false);

  // --- Search & Filter State ---
  const [reflectionSearch, setReflectionSearch] = useState('');
  const [activeTab, setActiveTab] = useState('insights');

  // --- Load Data ---
  const fetchStatistics = async () => {
    try {
      setLoadingStats(true);
      let url = `/v1/wellness/statistics?range=${chartRange}`;
      if (chartRange === 'custom') {
        if (startDate) url += `&start_date=${startDate}`;
        if (endDate) url += `&end_date=${endDate}`;
      }

      const res = await apiFetch(url);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to load statistics:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchReflections = async () => {
    try {
      setLoadingReflections(true);
      const res = await apiFetch('/v1/wellness/reflection/history');
      if (res.ok) {
        const data = await res.json();
        setReflections(data);
      }
    } catch (err) {
      console.error("Failed to load reflections:", err);
    } finally {
      setLoadingReflections(false);
    }
  };

  const fetchCheckins = async () => {
    try {
      setLoadingCheckins(true);
      const res = await apiFetch('/v1/wellness/checkin/history');
      if (res.ok) {
        const data = await res.json();
        setCheckins(data);
        // Pre-fill form with today's log if it exists
        const todayStr = new Date().toISOString().split('T')[0];
        const todaysLog = data.find(c => c.log_date === todayStr);
        if (todaysLog) {
          setCheckinForm({
            mood: todaysLog.mood,
            energy_level: todaysLog.energy_level,
            focus_level: todaysLog.focus_level,
            stress_level: todaysLog.stress_level,
            sleep_hours: todaysLog.sleep_hours,
            planned_study_hours: todaysLog.planned_study_hours,
            learning_goal: todaysLog.learning_goal || ''
          });
        }
      }
    } catch (err) {
      console.error("Failed to load checkins:", err);
    } finally {
      setLoadingCheckins(false);
    }
  };

  const fetchFocusHistory = async () => {
    try {
      setLoadingFocusHistory(true);
      const res = await apiFetch('/v1/wellness/focus/history');
      if (res.ok) {
        const data = await res.json();
        setFocusHistory(data);
      }
    } catch (err) {
      console.error("Failed to load focus history:", err);
    } finally {
      setLoadingFocusHistory(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const res = await apiFetch('/v1/wellness/preferences');
      if (res.ok) {
        const data = await res.json();
        setPreferences(data);
        // Pre-fill default preset for Pomodoro
        setTimerPreset(data.pomodoro_preset);
        setSecondsLeft(data.pomodoro_preset * 60);
      }
    } catch (err) {
      console.error("Failed to load wellness preferences:", err);
    }
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    setPrefsMessage('');
    try {
      const res = await apiFetch('/v1/wellness/preferences', {
        method: 'PUT',
        body: JSON.stringify(preferences)
      });
      if (res.ok) {
        const data = await res.json();
        setPreferences(data);
        setTimerPreset(data.pomodoro_preset);
        setSecondsLeft(data.pomodoro_preset * 60);
        setPrefsMessage('✓ Preferences successfully synced!');
        fetchStatistics();
        setTimeout(() => setPrefsMessage(''), 3000);
      } else {
        setPrefsMessage('Error: Failed to save preferences.');
      }
    } catch (err) {
      setPrefsMessage('Error: Connection failed.');
    } finally {
      setSavingPrefs(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [chartRange, startDate, endDate]);

  useEffect(() => {
    fetchReflections();
    fetchCheckins();
    fetchFocusHistory();
    fetchPreferences();
  }, []);

  // --- Daily Check-in Handlers ---
  const handleCheckinSubmit = async (e) => {
    e.preventDefault();
    setSubmittingCheckin(true);
    setCheckinMessage('');
    try {
      const res = await apiFetch('/v1/wellness/checkin', {
        method: 'POST',
        body: JSON.stringify(checkinForm)
      });
      if (res.ok) {
        setCheckinMessage('Daily learning metrics synchronized successfully!');
        fetchCheckins();
        fetchStatistics();
        setTimeout(() => setCheckinMessage(''), 4500);
      } else {
        const errData = await res.json();
        setCheckinMessage(`Error: ${errData.detail || 'Failed to submit check-in'}`);
      }
    } catch (err) {
      setCheckinMessage('Failed to connect to servers. Check your connection.');
    } finally {
      setSubmittingCheckin(false);
    }
  };

  // --- Reflection Handlers ---
  const handleReflectionSubmit = async (e) => {
    e.preventDefault();
    if (!reflectionText.trim()) return;
    setSubmittingReflection(true);
    try {
      const res = await apiFetch('/v1/wellness/reflection', {
        method: 'POST',
        body: JSON.stringify({ reflection_text: reflectionText })
      });
      if (res.ok) {
        setReflectionText('');
        fetchReflections();
        fetchStatistics();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReflection(false);
    }
  };

  const handleUpdateReflection = async (id) => {
    if (!editingText.trim()) return;
    try {
      const res = await apiFetch(`/v1/wellness/reflection/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ reflection_text: editingText })
      });
      if (res.ok) {
        setEditingReflectionId(null);
        setEditingText('');
        fetchReflections();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReflection = async (id) => {
    if (!confirm("Are you sure you want to delete this reflection log?")) return;
    try {
      const res = await apiFetch(`/v1/wellness/reflection/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchReflections();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Pomodoro Focus Timer Logic ---
  const startTimer = async () => {
    try {
      // If we were paused, resume the existing session in backend
      if (timerPaused && activeSessionId) {
        const res = await apiFetch(`/v1/wellness/focus/${activeSessionId}/resume`, { method: 'POST' });
        if (res.ok) {
          setTimerRunning(true);
          setTimerPaused(false);
          runLocalCountdown();
        }
      } else {
        // Start a fresh session
        const res = await apiFetch('/v1/wellness/focus/start', {
          method: 'POST',
          body: JSON.stringify({ preset_minutes: timerPreset })
        });
        if (res.ok) {
          const sessionData = await res.json();
          setActiveSessionId(sessionData.session_id);
          setSecondsLeft(timerPreset * 60);
          setTimerRunning(true);
          setTimerPaused(false);
          runLocalCountdown();
        }
      }
    } catch (err) {
      console.error("Failed to start focus session:", err);
      // Fallback local mode
      setTimerRunning(true);
      setTimerPaused(false);
      runLocalCountdown();
    }
  };

  const runLocalCountdown = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          handleSessionComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = async () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setTimerRunning(false);
    setTimerPaused(true);

    if (activeSessionId) {
      try {
        await apiFetch(`/v1/wellness/focus/${activeSessionId}/pause`, { method: 'POST' });
      } catch (err) {
        console.error("Failed to sync pause status:", err);
      }
    }
  };

  const resetTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setTimerRunning(false);
    setTimerPaused(false);
    setSecondsLeft(timerPreset * 60);
    setActiveSessionId(null);
  };

  const handleSessionComplete = async (completedNormally = false) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    const durationMin = Math.ceil(((timerPreset * 60) - secondsLeft) / 60);
    const finalStatus = completedNormally ? 'completed' : 'interrupted';

    setTimerRunning(false);
    setTimerPaused(false);
    setSecondsLeft(timerPreset * 60);

    if (activeSessionId) {
      try {
        const res = await apiFetch(`/v1/wellness/focus/${activeSessionId}/complete`, {
          method: 'POST',
          body: JSON.stringify({
            duration_minutes: durationMin,
            status: finalStatus
          })
        });
        if (res.ok) {
          const resData = await res.json();
          if (completedNormally) {
            setXp((prev) => prev + (resData.xp_earned || 50));
            alert(`🎉 Outstanding! Focus session completed successfully. You've earned +50 XP and logged your study hours!`);
          } else {
            alert(`⚠️ Focus session finished early. Logged ${durationMin} focus minutes.`);
          }
          fetchStatistics();
          fetchFocusHistory();
        }
      } catch (err) {
        console.error("Failed to complete focus session in backend:", err);
        if (completedNormally) {
          setXp((prev) => prev + 50);
          alert(`🎉 Outstanding! Focus session completed. Earned +50 XP! (Saved locally)`);
        }
      }
    } else {
      if (completedNormally) {
        setXp((prev) => prev + 50);
        alert(`🎉 Outstanding! Focus session completed. Earned +50 XP! (Saved locally)`);
      }
    }
    setActiveSessionId(null);
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Preset Selection
  const handlePresetSelect = (mins) => {
    if (timerRunning) return;
    setTimerPreset(mins);
    setSecondsLeft(mins * 60);
  };

  // Timer Text formatting
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Heuristic Diagnostics & Recommendations
  const stressVal = checkinForm.stress_level;
  const sleepVal = checkinForm.sleep_hours;

  const burnoutRisk = stressVal > 7 || (stats?.average_focus < 4 && stats?.completed_sessions < stats?.interrupted_sessions)
    ? 'High Burnout Warning'
    : stressVal > 4
      ? 'Moderate Academic Fatigue'
      : 'Optimal Focus State';

  const riskBadgeColor = burnoutRisk.includes('High')
    ? 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20'
    : burnoutRisk.includes('Moderate')
      ? 'bg-amber-500/10 text-amber-550 dark:text-amber-400 border-amber-500/20'
      : 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20';

  const filteredReflections = reflections.filter(ref =>
    ref.reflection_text.toLowerCase().includes(reflectionSearch.toLowerCase()) ||
    ref.ref_date.includes(reflectionSearch)
  );

  const sleepStatus = sleepVal >= 7.0 ? 'Optimal Rest Duration' : 'Rest Deficit Detected';
  const sleepStatusColor = sleepVal >= 7.0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-amber-550 dark:text-amber-400';

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Mood,Sleep Hours,Focus Level,Energy Level,Stress Level,Planned Study Hours,Daily Goal,Completed Focus Sessions,Total Focus Hours\n";

    const sortedCheckins = [...checkins].sort((a, b) => b.log_date.localeCompare(a.log_date));

    sortedCheckins.forEach((c) => {
      const chartDay = stats?.chart_data?.find(d => d.date === c.log_date);
      const studyHrs = chartDay ? chartDay.study : 0;
      const sessCount = chartDay ? chartDay.sessions : 0;

      const row = [
        c.log_date,
        c.mood,
        c.sleep_hours,
        c.focus_level,
        c.energy_level,
        c.stress_level,
        c.planned_study_hours,
        c.learning_goal ? `"${c.learning_goal.replace(/"/g, '""')}"` : "",
        sessCount,
        studyHrs.toFixed(2)
      ];
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NeuroLearn_Wellness_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Platform Header */}
      <StudentHubHeader
        title="Learning Wellness Studio"
        description="Track sleep hygiene, monitor cognitive stress levels, practice deep Pomodoro sessions, and correlate wellness metrics with academic consistency."
        showBackButton={true}
      />

      {/* Control Bar */}
      <div className="flex flex-wrap justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl px-6 py-4 shadow-sm gap-4">
        <div className="flex items-center gap-2">
          <Activity className="text-indigo-500 w-5 h-5 animate-pulse" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            SaaS Wellness Core Actions
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
          >
            <Download size={14} />
            Export CSV
          </button>
          <button
            onClick={() => setShowPrefsModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer"
          >
            <Settings size={14} />
            Settings
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${theme.gradient} p-8 text-white shadow-xl`}>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-white/10 backdrop-blur-md border border-white/10 uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 fill-white" />
              SaaS Wellness Core (Phase 1 Ready)
            </span>
            <h2 className="text-3xl font-black tracking-tight">
              Maintain Academic Equilibrium
            </h2>
            <p className="text-white/80 text-sm max-w-2xl leading-relaxed">
              Consistently tracking logs allows the system to identify cognitive patterns. Integrate study goals, check in daily, and verify how focus sessions impact your assignment and quiz performances.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold">
              <span className="bg-white/15 px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
                <Flame className="w-4 h-4" />
                Current Streak: {stats?.current_streak || 0} Days
              </span>
              <span className="bg-white/15 px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                Today's Check-in: {checkins.some(c => c.log_date === new Date().toISOString().split('T')[0]) ? 'Completed ✓' : 'Pending'}
              </span>
              <span className="bg-white/15 px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
                <Brain className="w-4 h-4" />
                Focus Score: {stats?.focus_score ? stats.focus_score.toFixed(1) : '0.0'}/100
              </span>
            </div>
          </div>
          <div className="shrink-0 flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-inner">
            <Brain className="w-16 h-16 text-white animate-pulse" />
          </div>
        </div>
        {/* Glow Effects */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Focus Score */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-450 uppercase text-[10px] font-black tracking-wider">Focus Performance</span>
            <Brain className={`${theme.text} w-5 h-5`} />
          </div>
          <div className="my-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {stats?.focus_score ? stats.focus_score.toFixed(1) : '0.0'}
            </span>
            <span className="text-xs text-slate-500 block mt-1">Weighted metric index</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2">
            <div
              className={`h-1.5 rounded-full ${theme.accent}`}
              style={{ width: `${Math.min(stats?.focus_score || 0, 100)}%` }}
            />
          </div>
        </div>

        {/* Weekly Study Hours */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-450 uppercase text-[10px] font-black tracking-wider">Weekly study hours</span>
            <Clock className={`${theme.text} w-5 h-5`} />
          </div>
          <div className="my-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {stats?.weekly_study_hours ? stats.weekly_study_hours.toFixed(1) : '0.0'}h
            </span>
            <span className="text-xs text-slate-500 block mt-1">Completed timer runs</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Goal: 4.0h/day (Preferences)</span>
        </div>

        {/* Completed Focus Sessions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-450 uppercase text-[10px] font-black tracking-wider">Focus Sessions count</span>
            <Flame className={`${theme.text} w-5 h-5`} />
          </div>
          <div className="my-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {stats?.completed_sessions || 0}
            </span>
            <span className="text-xs text-slate-500 block mt-1">Completed / {stats?.focus_sessions_count || 0} sessions</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            Interrupted: {stats?.interrupted_sessions || 0} sessions
          </span>
        </div>

        {/* Current Streak */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-450 uppercase text-[10px] font-black tracking-wider">Streak Calendar</span>
            <Award className={`${theme.text} w-5 h-5`} />
          </div>
          <div className="my-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {stats?.current_streak || 0} Days
            </span>
            <span className="text-xs text-slate-500 block mt-1">Longest Streak: {stats?.longest_streak || 0} Days</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Reset boundary is 24 hours</span>
        </div>
      </div>

      {/* Main Grid: Check-in, Timer, Reflections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Side: Logger Form & Focus timer */}
        <div className="lg:col-span-1 space-y-6">

          {/* Daily Learning Check-in */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-500" />
                Daily Learning Check-in
              </h3>
              <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">Sync your daily cognitive load and sleep duration metrics.</p>
            </div>

            <form onSubmit={handleCheckinSubmit} className="space-y-4 text-xs">
              {/* Mood emojis grid */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Mood Assessment</label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: 'happy', emoji: '😊', label: 'Happy' },
                    { id: 'focused', emoji: '🧠', label: 'Focused' },
                    { id: 'stressed', emoji: '😰', label: 'Stressed' },
                    { id: 'tired', emoji: '😴', label: 'Tired' },
                    { id: 'bored', emoji: '🥱', label: 'Bored' }
                  ].map((m) => {
                    const isSelected = checkinForm.mood === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setCheckinForm(prev => ({ ...prev, mood: m.id }))}
                        className={`py-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${isSelected
                            ? 'bg-indigo-550/10 border-indigo-500 text-indigo-650 dark:text-indigo-400'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 hover:border-slate-400 text-slate-500'
                          }`}
                      >
                        <span className="text-lg">{m.emoji}</span>
                        <span className="text-[9px] font-bold">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sliders: Energy, Focus, Stress */}
              <div className="space-y-3 pt-2">
                {/* Focus Level */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                    <span>Focus Level</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">{checkinForm.focus_level}/10</span>
                  </div>
                  <input
                    type="range" min="1" max="10"
                    value={checkinForm.focus_level}
                    onChange={(e) => setCheckinForm(prev => ({ ...prev, focus_level: parseInt(e.target.value) }))}
                    className="w-full h-1.5 bg-slate-100 dark:bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                {/* Energy Level */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                    <span>Energy Level</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">{checkinForm.energy_level}/10</span>
                  </div>
                  <input
                    type="range" min="1" max="10"
                    value={checkinForm.energy_level}
                    onChange={(e) => setCheckinForm(prev => ({ ...prev, energy_level: parseInt(e.target.value) }))}
                    className="w-full h-1.5 bg-slate-100 dark:bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* Stress Level */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                    <span>Stress Level</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">{checkinForm.stress_level}/10</span>
                  </div>
                  <input
                    type="range" min="1" max="10"
                    value={checkinForm.stress_level}
                    onChange={(e) => setCheckinForm(prev => ({ ...prev, stress_level: parseInt(e.target.value) }))}
                    className="w-full h-1.5 bg-slate-100 dark:bg-slate-950 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                </div>
              </div>

              {/* Number Inputs: Sleep, Planned study hours */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-black block">Sleep Hours</label>
                  <input
                    type="number" step="0.5" min="0" max="24"
                    value={checkinForm.sleep_hours}
                    onChange={(e) => setCheckinForm(prev => ({ ...prev, sleep_hours: parseFloat(e.target.value) || 8.0 }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-black block">Planned Study</label>
                  <input
                    type="number" step="0.5" min="0" max="24"
                    value={checkinForm.planned_study_hours}
                    onChange={(e) => setCheckinForm(prev => ({ ...prev, planned_study_hours: parseFloat(e.target.value) || 0.0 }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Learning goal */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-black block">Today's Learning Goal</label>
                <input
                  type="text"
                  placeholder="e.g. Complete React Routing chapter"
                  value={checkinForm.learning_goal}
                  onChange={(e) => setCheckinForm(prev => ({ ...prev, learning_goal: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingCheckin}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {submittingCheckin ? (
                  <>
                    <div className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Syncing metrics...
                  </>
                ) : (
                  <>
                    <Zap size={14} className="fill-white" />
                    Sync Wellness Vector
                  </>
                )}
              </button>
            </form>

            <AnimatePresence>
              {checkinMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-3 rounded-xl text-center text-[10px] font-extrabold ${checkinMessage.includes('Error')
                      ? 'bg-red-500/10 text-red-650 dark:text-red-400 border border-red-500/20'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20'
                    }`}
                >
                  {checkinMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pomodoro Focus Studio */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm text-center space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center justify-center gap-2">
              <Clock className="text-indigo-550" size={18} />
              Focus Studio
            </h3>

            {/* Presets grid */}
            <div className="grid grid-cols-4 gap-2 text-xs">
              {[25, 45, 60, 90].map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePresetSelect(preset)}
                  disabled={timerRunning}
                  className={`py-2 rounded-xl font-bold border transition-colors ${timerPreset === preset
                      ? 'bg-indigo-550/10 border-indigo-500 text-indigo-650 dark:text-indigo-400'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'
                    }`}
                >
                  {preset}m
                </button>
              ))}
            </div>

            {/* Countdown clock visual */}
            <div className="relative py-6 flex flex-col items-center justify-center">
              <div className="w-40 h-40 rounded-full border-4 border-slate-100 dark:border-slate-850 flex flex-col items-center justify-center relative shadow-inner">
                {/* Glow ring */}
                {timerRunning && (
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                )}
                <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                  {formatTime(secondsLeft)}
                </span>
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">
                  {timerRunning ? 'Focus active' : timerPaused ? 'Paused' : 'Ready'}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-2">
              {!timerRunning ? (
                <button
                  onClick={startTimer}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
                >
                  <Play size={14} className="fill-white" />
                  {timerPaused ? 'Resume' : 'Start Focus'}
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors cursor-pointer"
                >
                  <Pause size={14} className="fill-white" />
                  Pause
                </button>
              )}

              {(timerRunning || timerPaused) && (
                <button
                  onClick={() => handleSessionComplete(false)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer"
                >
                  <X size={14} />
                  Stop
                </button>
              )}

              <button
                onClick={resetTimer}
                disabled={timerRunning}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-550 dark:text-slate-400 hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            </div>

            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider border-t border-slate-150 dark:border-slate-850/50 pt-3">
              +50 XP awarded upon successful completion
            </p>
          </div>
        </div>

        {/* Right Side: Charts & Reflections */}
        <div className="lg:col-span-2 space-y-6">

          {/* Charts Segment */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <TrendingUp className="text-indigo-550" size={18} />
                Cognitive Analytics Stack
              </h3>

              {/* Range Selector */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {['daily', 'weekly', 'monthly', 'custom'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setChartRange(r)}
                    className={`px-3 py-1.5 rounded-lg border font-bold capitalize transition-colors ${chartRange === r
                        ? 'bg-indigo-550/10 border-indigo-500 text-indigo-650 dark:text-indigo-400'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'
                      }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Range Inputs */}
            {chartRange === 'custom' && (
              <div className="grid grid-cols-2 gap-4 mb-6 text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-550 font-bold uppercase block">Start Date</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-550 font-bold uppercase block">End Date</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Chart visualizations */}
            {loadingStats ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-64">
                <div className="animate-pulse bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 flex flex-col justify-between">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                  <div className="flex items-end space-x-2 h-36">
                    <div className="bg-slate-250 dark:bg-slate-800 rounded w-8 h-1/4" />
                    <div className="bg-slate-250 dark:bg-slate-800 rounded w-8 h-2/4" />
                    <div className="bg-slate-250 dark:bg-slate-800 rounded w-8 h-3/4" />
                    <div className="bg-slate-250 dark:bg-slate-800 rounded w-8 h-1/2" />
                    <div className="bg-slate-250 dark:bg-slate-800 rounded w-8 h-5/6" />
                  </div>
                </div>
                <div className="animate-pulse bg-slate-50 dark:bg-slate-955 border border-slate-205 dark:border-slate-850 rounded-2xl p-4 flex flex-col justify-between">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                  <div className="flex items-end space-x-2 h-36">
                    <div className="bg-slate-250 dark:bg-slate-800 rounded w-8 h-1/3" />
                    <div className="bg-slate-250 dark:bg-slate-800 rounded w-8 h-2/3" />
                    <div className="bg-slate-250 dark:bg-slate-800 rounded w-8 h-1/2" />
                    <div className="bg-slate-250 dark:bg-slate-800 rounded w-8 h-4/5" />
                    <div className="bg-slate-250 dark:bg-slate-800 rounded w-8 h-3/4" />
                  </div>
                </div>
              </div>
            ) : !stats || !stats.chart_data || stats.chart_data.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center text-slate-500">
                <Calendar size={32} className="text-slate-350 dark:text-slate-700 mb-2" />
                <span className="text-xs font-bold">No wellness logs tracked inside this date range.</span>
                <span className="text-[10px] text-slate-400 mt-1">Submit check-ins to view graphs.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Chart 1: Focus & Sleep */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-450 uppercase block tracking-wider">Affective Focus vs Sleep hours</span>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.chart_data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-850" opacity={0.6} />
                        <XAxis dataKey="day" stroke="#64748b" fontSize={9} />
                        <YAxis stroke="#64748b" fontSize={9} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ fontSize: '10px' }} />
                        <Area type="monotone" dataKey="focus" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} name="Focus Log (1-10)" />
                        <Area type="monotone" dataKey="sleep" stroke="#10b981" fill="#10b981" fillOpacity={0.1} name="Sleep Hours" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: Study Hours & Focus sessions */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-450 uppercase block tracking-wider">Completed study duration & timers</span>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.chart_data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-850" opacity={0.6} />
                        <XAxis dataKey="day" stroke="#64748b" fontSize={9} />
                        <YAxis stroke="#64748b" fontSize={9} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ fontSize: '10px' }} />
                        <Legend verticalAlign="top" height={28} iconSize={8} wrapperStyle={{ fontSize: '9px' }} />
                        <Bar dataKey="study" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Study Hours" />
                        <Bar dataKey="sessions" fill="#6366f1" radius={[4, 4, 0, 0]} name="Completed Timers" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tab Selection Header */}
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('insights')}
              className={`flex-1 pb-4 text-xs font-extrabold text-center border-b-2 transition-all cursor-pointer ${activeTab === 'insights'
                  ? 'border-indigo-500 text-indigo-655 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Sparkles size={14} />
                Diagnostics & Summaries
              </span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 pb-4 text-xs font-extrabold text-center border-b-2 transition-all cursor-pointer ${activeTab === 'history'
                  ? 'border-indigo-500 text-indigo-655 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <History size={14} />
                Focus Session History
              </span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            {activeTab === 'insights' ? (
              <div className="space-y-6">
                {/* 3 Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] text-slate-550 font-extrabold uppercase tracking-wider block mb-1">Burnout Risk</span>
                    <span className={`inline-flex self-start px-2 py-0.5 rounded text-[10px] font-bold border ${riskBadgeColor}`}>
                      {burnoutRisk}
                    </span>
                    <span className="text-[9px] text-slate-400 mt-2">Calculated from stress levels</span>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] text-slate-550 font-extrabold uppercase tracking-wider block mb-1">Sleep Hygiene</span>
                    <span className={`text-[10px] font-extrabold ${sleepStatusColor}`}>
                      {sleepStatus}
                    </span>
                    <span className="text-[9px] text-slate-400 mt-2">Target sleep: 7.5+ h</span>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] text-slate-550 font-extrabold uppercase tracking-wider block mb-1">Consistency</span>
                    <span className="text-xs font-black text-slate-800 dark:text-white">
                      {stats?.learning_consistency ? stats.learning_consistency.toFixed(1) : '0.0'}%
                    </span>
                    <span className="text-[9px] text-slate-400 mt-2">14-day activity index</span>
                  </div>
                </div>

                {/* Strongest & Weakest Habits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-1">
                    <span className="text-[10px] text-emerald-605 dark:text-emerald-400 font-extrabold uppercase tracking-wider block">Strongest Habit</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                      {stats?.average_sleep >= 7.5 ? "✓ Consistent Rest Cycle" : stats?.learning_consistency >= 70 ? "✓ Daily Learning Habit" : "✓ Focus Session Determination"}
                    </span>
                    <p className="text-[9px] text-slate-450 mt-1">Identified from logs: maintaining high metrics in this area supports cognitive baseline.</p>
                  </div>

                  <div className="p-4 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-1">
                    <span className="text-[10px] text-amber-605 dark:text-amber-400 font-extrabold uppercase tracking-wider block">Weakest Habit / Focus Area</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                      {stats?.average_sleep < 6.5 ? "⚠ Rest Duration Deficit" : stats?.average_stress > 6.0 ? "⚠ Elevated Cognitive Stress" : stats?.interrupted_sessions > stats?.completed_sessions ? "⚠ Focus Session Resilience" : "None Identified"}
                    </span>
                    <p className="text-[9px] text-slate-450 mt-1">Recommended priority for routine adjustments to optimize learning potential.</p>
                  </div>
                </div>

                {/* Summaries: Weekly & Monthly */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-2">
                    <h5 className="font-extrabold text-slate-900 dark:text-white text-[10px] uppercase tracking-wider">Weekly Learning Summary</h5>
                    <p className="text-[10px] leading-relaxed text-slate-600 dark:text-slate-400">
                      You completed <strong className="text-indigo-650 dark:text-indigo-400">{stats?.weekly_study_hours ? stats.weekly_study_hours.toFixed(1) : '0.0'}h</strong> of focused study out of your target. Your average mood focus score is <strong className="text-slate-800 dark:text-slate-200">{stats?.average_focus ? stats.average_focus.toFixed(1) : '0.0'}/10</strong> with average stress level at <strong className="text-slate-800 dark:text-slate-200">{stats?.average_stress ? stats.average_stress.toFixed(1) : '0.0'}/10</strong>.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-2">
                    <h5 className="font-extrabold text-slate-900 dark:text-white text-[10px] uppercase tracking-wider">Monthly Learning Summary</h5>
                    <p className="text-[10px] leading-relaxed text-slate-600 dark:text-slate-400">
                      Total study time accumulated is <strong className="text-indigo-650 dark:text-indigo-400">{stats?.monthly_study_hours ? stats.monthly_study_hours.toFixed(1) : '0.0'}h</strong>. You finished <strong className="text-slate-800 dark:text-slate-200">{stats?.completed_sessions || 0}</strong> focus sessions successfully. Your calculated focus index score is <strong className="text-indigo-650 dark:text-indigo-400">{stats?.focus_score ? stats.focus_score.toFixed(1) : '0.0'}/100</strong>.
                    </p>
                  </div>
                </div>

                {/* Academic Correlation Card */}
                <div className="p-4 bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 rounded-2xl space-y-3">
                  <h5 className="font-extrabold text-indigo-650 dark:text-indigo-400 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                    <Award size={14} />
                    Academic Wellness Summary
                  </h5>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-850">
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">Attendance</span>
                      <span className="text-xs font-black text-slate-800 dark:text-white">{stats?.attendance_rate ? stats.attendance_rate.toFixed(1) : '0.0'}%</span>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-850">
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">Assignments</span>
                      <span className="text-xs font-black text-slate-800 dark:text-white">{stats?.assignment_completion_rate ? stats.assignment_completion_rate.toFixed(1) : '0.0'}%</span>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-850">
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">Quiz Avg</span>
                      <span className="text-xs font-black text-slate-800 dark:text-white">{stats?.quiz_performance_rate ? stats.quiz_performance_rate.toFixed(1) : '0.0'}%</span>
                    </div>
                  </div>
                </div>

                {/* Guidelines */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-550 dark:text-slate-450">
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl flex gap-3">
                    <ShieldAlert className="text-indigo-505 shrink-0 w-5 h-5" />
                    <div>
                      <h5 className="font-extrabold text-slate-900 dark:text-white text-[10px] uppercase tracking-wider">Guideline: Rest Cycle</h5>
                      <p className="mt-1 text-[10px] leading-relaxed">
                        {sleepVal < 6.5
                          ? "Sleep is below target. Memory retention suffers during deficit. Allocate 7.5+ hours tonight."
                          : "Sleep duration is optimal. Maintaining a structured sleep routine stabilizes cognitive performance."}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl flex gap-3">
                    <Brain className="text-indigo-505 shrink-0 w-5 h-5" />
                    <div>
                      <h5 className="font-extrabold text-slate-900 dark:text-white text-[10px] uppercase tracking-wider">Guideline: Cognitive Load</h5>
                      <p className="mt-1 text-[10px] leading-relaxed">
                        {stressVal > 6
                          ? "Elevated workload pressure detected. Divide your study goals into 25-minute Pomodoro segments."
                          : "Balanced stress levels. Perfect window to tackle complex coding homework or study for quizzes."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-wider flex items-center gap-1">
                  <History size={12} />
                  Focus Timer Sessions History
                </h4>

                {loadingFocusHistory ? (
                  <div className="text-center py-8">
                    <div className="animate-spin inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mb-2" />
                    <p className="text-xs text-slate-500">Loading session history...</p>
                  </div>
                ) : focusHistory.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50 dark:bg-slate-955 text-slate-400">
                    <p className="font-bold text-xs">No focus sessions logged yet.</p>
                    <p className="text-[9px] mt-1">Start a Pomodoro session above to log your study times.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {focusHistory.map((f) => (
                      <div
                        key={f.session_id}
                        className="p-4 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-800 dark:text-white">
                              {f.preset_minutes} Min Preset
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${f.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-555 border-emerald-500/20'
                                : 'bg-red-500/10 text-red-500 border-red-500/20'
                              }`}>
                              {f.status}
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-450">
                            Started: {new Date(f.started_at).toLocaleString()}
                          </p>
                        </div>

                        <div className="text-right space-y-1">
                          <span className="text-slate-700 dark:text-slate-355 font-extrabold block">
                            Logged: {f.duration_minutes} Mins
                          </span>
                          <span className="text-[9px] text-slate-450 block">
                            {f.interruptions_count} Interruptions
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reflection Journal */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <BookOpen className="text-indigo-550" size={18} />
                Reflection Journal
              </h3>
              <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">Reflect on your weekly progress, difficulties encountered, and achievements.</p>
            </div>

            <form onSubmit={handleReflectionSubmit} className="space-y-3">
              <textarea
                rows="3"
                placeholder="Log your weekly reflection here... What did you learn? What obstacles did you encounter?"
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
              <button
                type="submit"
                disabled={submittingReflection || !reflectionText.trim()}
                className="bg-indigo-650 hover:bg-indigo-500 dark:text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {submittingReflection ? (
                  <>
                    <div className="animate-spin inline-block w-3.5 h-3.5 bg-amber-600 border-2 border-white border-t-transparent rounded-full" />
                    Saving...
                  </>

                ) : (
                  "Save Reflection Log"
                )}
              </button>
            </form>

            {/* Reflection history timeline */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-850">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-wider flex items-center gap-1">
                  <History size={12} />
                  Reflection Journal Archive
                </h4>

                <input
                  type="text"
                  placeholder="Search by text or date..."
                  value={reflectionSearch}
                  onChange={(e) => setReflectionSearch(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 rounded-xl px-3 py-1.5 text-[10px] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-xs w-full"
                />
              </div>

              {loadingReflections ? (
                <div className="text-center py-6 text-slate-555 text-xs">
                  <div className="animate-spin inline-block w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full mb-1" />
                  <p className="text-[10px]">Retrieving reflection logs...</p>
                </div>
              ) : reflections.length === 0 ? (
                <div className="text-center py-6 text-slate-555 text-xs border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-955 text-slate-400">
                  <p className="font-bold text-slate-400">No reflections logged yet.</p>
                  <p className="text-[9px] text-slate-400 mt-1">Start writing reflections to track academic milestones.</p>
                </div>
              ) : filteredReflections.length === 0 ? (
                <div className="text-center py-6 text-slate-555 text-xs border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl bg-slate-50/55 dark:bg-slate-955 text-slate-400">
                  <p className="font-bold text-slate-400">No matching reflections found.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {filteredReflections.map((ref) => (
                    <div
                      key={ref.reflection_id}
                      className="p-4 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs space-y-2 hover:border-slate-350 dark:hover:border-slate-800 transition-colors"
                    >
                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold">
                        <span className="flex items-center gap-1 text-indigo-550 dark:text-indigo-400 font-extrabold uppercase">
                          <Calendar size={10} />
                          {ref.ref_date}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingReflectionId(ref.reflection_id);
                              setEditingText(ref.reflection_text);
                            }}
                            className="text-slate-450 hover:text-indigo-550 dark:hover:text-indigo-455 p-1"
                            title="Edit"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteReflection(ref.reflection_id)}
                            className="text-slate-450 hover:text-red-500 p-1"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {editingReflectionId === ref.reflection_id ? (
                        <div className="space-y-2 pt-1">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:outline-none"
                            rows="2"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateReflection(ref.reflection_id)}
                              className="px-3 py-1 bg-indigo-655 text-white rounded-lg font-bold text-[10px] hover:bg-indigo-500 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingReflectionId(null);
                                setEditingText('');
                              }}
                              className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-650 dark:text-slate-400 rounded-lg font-bold text-[10px] hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed break-words whitespace-pre-wrap">
                          {ref.reflection_text}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Preferences Settings Modal */}
        <AnimatePresence>
          {showPrefsModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sliders className="text-indigo-500" size={18} />
                    Wellness Preferences
                  </h3>
                  <button
                    onClick={() => setShowPrefsModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handlePreferencesSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase font-black block">Pomodoro Preset</label>
                      <select
                        value={preferences.pomodoro_preset}
                        onChange={(e) => setPreferences(prev => ({ ...prev, pomodoro_preset: parseInt(e.target.value) }))}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                      >
                        <option value={25}>25 Minutes</option>
                        <option value={30}>30 Minutes</option>
                        <option value={45}>45 Minutes</option>
                        <option value={60}>60 Minutes</option>
                        <option value={90}>90 Minutes</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase font-black block">Focus Target (Min)</label>
                      <input
                        type="number"
                        value={preferences.preferred_focus_duration}
                        onChange={(e) => setPreferences(prev => ({ ...prev, preferred_focus_duration: parseInt(e.target.value) }))}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase font-black block">Study Goal (Hours)</label>
                      <input
                        type="number" step="0.5"
                        value={preferences.daily_study_goal}
                        onChange={(e) => setPreferences(prev => ({ ...prev, daily_study_goal: parseFloat(e.target.value) }))}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase font-black block">Sleep Goal (Hours)</label>
                      <input
                        type="number" step="0.5"
                        value={preferences.daily_sleep_goal}
                        onChange={(e) => setPreferences(prev => ({ ...prev, daily_sleep_goal: parseFloat(e.target.value) }))}
                        className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 items-center">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase font-black block">Reminder Time</label>
                      <input
                        type="text" placeholder="09:00"
                        value={preferences.reminder_time || '09:00'}
                        onChange={(e) => setPreferences(prev => ({ ...prev, reminder_time: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      <input
                        type="checkbox"
                        id="notif_pref"
                        checked={preferences.notification_preference}
                        onChange={(e) => setPreferences(prev => ({ ...prev, notification_preference: e.target.checked }))}
                        className="w-4 h-4 text-indigo-650 border-slate-300 rounded focus:ring-indigo-500 accent-indigo-500"
                      />
                      <label htmlFor="notif_pref" className="text-[10px] text-slate-550 font-bold uppercase cursor-pointer">
                        Send Reminders
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={savingPrefs}
                      className="flex-1 bg-indigo-650 hover:bg-indigo-500 text-white font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer"
                    >
                      {savingPrefs ? "Saving..." : "Save Preferences"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPrefsModal(false)}
                      className="flex-1 bg-slate-105 dark:bg-slate-800 text-slate-650 dark:text-slate-355 hover:bg-slate-200 font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer"
                    >
                      Close
                    </button>
                  </div>

                  {prefsMessage && (
                    <p className="text-center text-[10px] font-extrabold text-emerald-500 mt-2">
                      {prefsMessage}
                    </p>
                  )}
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};


export default LearningWellness;
