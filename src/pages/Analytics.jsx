import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  BarChart, 
  Bar,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  Award, 
  Trophy,
  CheckCircle2, 
  AlertTriangle,
  Brain,
  Zap,
  Target,
  Loader2,
  Calendar,
  Percent,
  Flame,
  FileText
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { apiFetch } from '../services/api';
import ContributionGrid from '../components/ContributionGrid';

const Analytics = () => {
  const { xp, streak } = useStudent();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [grades, setGrades] = useState(null);
  const [quizAnalytics, setQuizAnalytics] = useState(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const [attendanceRes, gradesRes, quizRes] = await Promise.all([
          apiFetch('/student-hub/attendance'),
          apiFetch('/student-hub/grades'),
          apiFetch('/gamification/analytics')
        ]);
        
        if (attendanceRes.ok) {
          const att = await attendanceRes.json();
          setAttendance(att);
        }
        if (gradesRes.ok) {
          const grd = await gradesRes.json();
          setGrades(grd);
        }
        if (quizRes.ok) {
          const qz = await quizRes.json();
          setQuizAnalytics(qz);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching student analytics data:", err);
        setError("Failed to load database telemetry analytics. Please try again later.");
        setLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);

  const subjectGrades = useMemo(() => grades?.subject_grades || [], [grades]);
  const subjectBreakdown = useMemo(() => attendance?.subject_breakdown || [], [attendance]);
  const historyLog = useMemo(() => quizAnalytics?.history || [], [quizAnalytics]);

  // 1. Skill Data for Radar Chart (mapped from actual course total marks)
  const skillData = useMemo(() => {
    const data = subjectGrades.map(item => ({
      subject: item.subject_code || item.subject_name.substring(0, 8),
      value: item.total_marks || 0,
      fullMark: 100
    }));
    return data.length > 0 ? data : [
      { subject: 'AI/ML', value: 80, fullMark: 100 },
      { subject: 'DevOps', value: 70, fullMark: 100 },
      { subject: 'Full Stack', value: 90, fullMark: 100 },
      { subject: 'Security', value: 75, fullMark: 100 }
    ];
  }, [subjectGrades]);

  // 2. Attendance breakdown data
  const attendanceChartData = useMemo(() => {
    const data = subjectBreakdown.map(item => ({
      subject: item.subject_code || item.subject_name.substring(0, 8),
      percentage: item.percentage || 0,
    }));
    return data.length > 0 ? data : [
      { subject: 'AI/ML', percentage: 92 },
      { subject: 'DevOps', percentage: 88 },
      { subject: 'Full Stack', percentage: 95 },
      { subject: 'Security', percentage: 84 }
    ];
  }, [subjectBreakdown]);

  // 3. Quiz Score performance trends over time
  const performanceTrendData = useMemo(() => {
    const data = historyLog.map((item, index) => ({
      attempt: `Quiz #${index + 1}`,
      score: Math.round((item.score / item.total_questions) * 100),
      date: item.date
    }));
    return data.length > 0 ? data : [
      { attempt: 'Quiz #1', score: 60 },
      { attempt: 'Quiz #2', score: 75 },
      { attempt: 'Quiz #3', score: 70 },
      { attempt: 'Quiz #4', score: 90 },
      { attempt: 'Quiz #5', score: 85 }
    ];
  }, [historyLog]);

  // 4. Accuracy Data for Bar Chart (mapped from actual quiz marks normalized to %)
  const accuracyData = useMemo(() => {
    const data = subjectGrades.map(item => {
      const rawQuiz = item.quiz_marks || 0;
      const accuracy = rawQuiz <= 20 ? Math.round(rawQuiz * 5) : Math.round(rawQuiz);
      return {
        domain: item.subject_code || item.subject_name.substring(0, 8),
        accuracy: Math.min(100, accuracy)
      };
    });
    return data.length > 0 ? data : [
      { domain: 'AI/ML', accuracy: 80 },
      { domain: 'DevOps', accuracy: 70 },
      { domain: 'Full Stack', accuracy: 90 },
      { domain: 'Security', accuracy: 78 }
    ];
  }, [subjectGrades]);

  const cgpaVal = grades?.cgpa || 7.5;
  const overallAttendanceVal = attendance?.overall_percentage || 0.0;
  const passingRateVal = quizAnalytics?.passing_rate || 0.0;
  const totalQuizzesVal = quizAnalytics?.total_quizzes || 0;

  // 5. Dynamic AI Diagnostics
  const strengthSubject = useMemo(() => {
    if (subjectGrades.length === 0) return null;
    return [...subjectGrades].sort((a, b) => (b.total_marks || 0) - (a.total_marks || 0))[0];
  }, [subjectGrades]);

  const weaknessSubject = useMemo(() => {
    if (subjectGrades.length === 0) return null;
    const sorted = [...subjectGrades].sort((a, b) => (a.total_marks || 0) - (b.total_marks || 0));
    const lowest = sorted[0];
    const highest = sorted[sorted.length - 1];
    return lowest === highest && sorted.length > 1 ? sorted[1] : lowest;
  }, [subjectGrades]);

  const strengthName = strengthSubject ? strengthSubject.subject_name : "Core Foundations";
  const strengthScore = strengthSubject ? strengthSubject.total_marks : 85;
  const weaknessName = weaknessSubject ? weaknessSubject.subject_name : "Cloud Systems";
  const weaknessScore = weaknessSubject ? weaknessSubject.total_marks : 55;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
        <p className="text-slate-500 text-sm font-semibold">Analyzing database metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-6 rounded-2xl text-center max-w-md mx-auto my-12">
        <AlertTriangle className="mx-auto mb-2 text-red-500" size={32} />
        <h3 className="font-extrabold text-sm">Synchronization Error</h3>
        <p className="text-xs mt-1">{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-12 text-slate-800 dark:text-slate-100"
    >
      {/* Intro Header */}
      <div>
        <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">Metrics & Stats</p>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Performance Analytics Command Center</h2>
        <p className="text-slate-550 dark:text-slate-400 text-xs mt-1">
          Review dynamic, visual evidence of your attendance records, quiz accuracy scores, curriculum milestones, and predictions.
        </p>
      </div>

      {/* Grid Stats Header Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance KPI */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <Percent size={20} />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 uppercase block font-bold tracking-wider">Overall Attendance</span>
            <span className="text-lg font-extrabold text-slate-800 dark:text-white">{overallAttendanceVal.toFixed(1)}%</span>
          </div>
        </div>

        {/* GPA / CGPA KPI */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Award size={20} />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 uppercase block font-bold tracking-wider">Predicted CGPA</span>
            <span className="text-lg font-extrabold text-slate-800 dark:text-white">{cgpaVal.toFixed(2)} CGPA</span>
          </div>
        </div>

        {/* Quiz Success Rate KPI */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
            <Zap size={20} />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 uppercase block font-bold tracking-wider">Quiz Success Rate</span>
            <span className="text-lg font-extrabold text-slate-800 dark:text-white">{passingRateVal.toFixed(1)}%</span>
          </div>
        </div>

        {/* Daily Streak KPI */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
            <Flame size={20} />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 uppercase block font-bold tracking-wider">Daily Streak</span>
            <span className="text-lg font-extrabold text-slate-800 dark:text-white">{streak} Days</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Quiz Performance Timeline (Performance Trends) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-500" />
            Quiz Accuracy Score Performance Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis dataKey="attempt" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '12px' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line type="monotone" dataKey="score" stroke="#6366f1" name="Score Accuracy (%)" strokeWidth={3} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject wise Attendance breakdown (Attendance Trends) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-indigo-500" />
            Subject-wise Attendance Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceChartData}>
                <defs>
                  <linearGradient id="colorAttStudent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis dataKey="subject" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="percentage" stroke="#4f46e5" fillOpacity={1} fill="url(#colorAttStudent)" strokeWidth={3} name="Attendance Rate (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Domain Proficiency Radar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-4 flex items-center gap-2">
            <Brain size={18} className="text-indigo-500" />
            Syllabus Subject Proficiency Radar Index
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" radius="70%" data={skillData}>
                <PolarGrid stroke="#475569" opacity={0.2} />
                <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={10} />
                <PolarRadiusAxis stroke="#64748b" fontSize={9} />
                <Radar name="Proficiency Rate (%)" dataKey="value" stroke="#818cf8" fill="#818cf8" fillOpacity={0.25} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diagnostics & AI Career Recommendations */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-1">AI Diagnostics Command Center</h3>
            <p className="text-xs text-slate-400">Personalized feedback synced with your database scores</p>
          </div>

          <div className="space-y-4 my-6">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg shrink-0 mt-0.5">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-white">Strength: {strengthName}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Your academic records show strong mastery in {strengthName} with a grade score of {strengthScore}%. You have demonstrated consistent understanding on classroom assignments and quiz evaluations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 rounded-lg shrink-0 mt-0.5">
                <AlertTriangle size={16} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-white">Focus Area: {weaknessName}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Your current score of {weaknessScore}% in {weaknessName} indicates an opportunity for improvement. Reviewing chapter materials and logging dedicated practice quizzes in the Quiz Arena will help bolster these fundamentals.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850/80 text-[11px] text-indigo-650 dark:text-indigo-400 font-bold text-center">
            Recommendation: Refile practice runs for '{weaknessName}' inside the Quiz Arena.
          </div>
        </div>
      </div>

      {/* Activity Heatmap Grid */}
      <ContributionGrid />
    </motion.div>
  );
};

export default Analytics;
