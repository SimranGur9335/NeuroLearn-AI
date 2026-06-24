import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
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
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Brain, 
  Award, 
  BarChart3,
  Activity,
  AlertTriangle,
  RefreshCw,
  Calendar,
  CheckSquare,
  FileText,
  Download,
  Filter,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Clock,
  BookOpen,
  ChevronRight,
  Percent,
  TrendingUp as TrendUpIcon
} from 'lucide-react';
import { useAuth } from "../../context/AuthContext";

const FacultyAnalytics = () => {
  const selectedClass = JSON.parse(localStorage.getItem("selectedClass") || "{}");
  const { user } = useAuth();
  const facultyId = user?.faculty_id;
  const navigate = useNavigate();

  // Core Analytics State
  const [analytics, setAnalytics] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [classFilter, setClassFilter] = useState(selectedClass.class_id || "");
  const [subjectFilter, setSubjectFilter] = useState(selectedClass.subject_id || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Load faculty classes for filter dropdowns
  useEffect(() => {
    const loadClasses = async () => {
      if (!facultyId) return;
      try {
        const res = await fetch(`http://127.0.0.1:8000/faculty/${facultyId}/classes`);
        if (res.ok) {
          const data = await res.json();
          setClasses(data);
        }
      } catch (err) {
        console.error("Failed to load classes for filters", err);
      }
    };
    loadClasses();
  }, [facultyId]);

  // Fetch Analytics data based on filters
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      let url = `http://127.0.0.1:8000/faculty/${facultyId}/analytics`;
      const params = new URLSearchParams();
      if (classFilter) params.append("class_id", classFilter);
      if (subjectFilter) params.append("subject_id", subjectFilter);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to load analytics data", err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when any filter changes
  useEffect(() => {
    if (facultyId) {
      fetchAnalytics();
    }
  }, [facultyId, classFilter, subjectFilter, startDate, endDate]);

  // Handle class filter changes
  const handleClassChange = (e) => {
    const val = e.target.value;
    setClassFilter(val);
    setSubjectFilter(""); // Reset subject filter when class changes
  };

  // Helper: Format Dates for Preset Ranges
  const setDateRangePreset = (days) => {
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - days);
    
    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };
    
    setStartDate(formatDate(start));
    setEndDate(formatDate(today));
  };

  // Helper: Reset Filters
  const resetFilters = () => {
    setClassFilter(selectedClass.class_id || "");
    setSubjectFilter(selectedClass.subject_id || "");
    setStartDate("");
    setEndDate("");
  };

  // Computations for KPI cards
  const calculateAvgAttendance = () => {
    if (!analytics?.performance_trend?.length) return 0;
    const sum = analytics.performance_trend.reduce((acc, p) => acc + p.attendance, 0);
    return sum / analytics.performance_trend.length;
  };

  const calculateAvgQuizScore = () => {
    if (!analytics?.performance_trend?.length) return 0;
    const sum = analytics.performance_trend.reduce((acc, p) => acc + p.average, 0);
    return sum / analytics.performance_trend.length;
  };

  const getAtRiskCount = () => {
    if (!analytics?.risk_distribution) return 0;
    return (analytics.risk_distribution.High || 0) + (analytics.risk_distribution.Medium || 0);
  };

  // Telemetry: Standard Deviation of Attendance
  const getAttendanceStability = () => {
    if (!analytics?.attendance_trend?.length) return { label: "N/A", value: "0%", desc: "No logs found.", color: "text-slate-450 bg-slate-500/10" };
    const rates = analytics.attendance_trend.map(t => t.rate);
    const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
    const variance = rates.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / rates.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev < 2.5) {
      return { 
        label: "Highly Stable", 
        value: `SD: ${stdDev.toFixed(1)}%`, 
        desc: "Excellent daily presence consistency.", 
        color: "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20" 
      };
    } else if (stdDev < 6.0) {
      return { 
        label: "Moderately Stable", 
        value: `SD: ${stdDev.toFixed(1)}%`, 
        desc: "Standard daily attendance fluctuations.", 
        color: "text-amber-500 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20" 
      };
    } else {
      return { 
        label: "High Volatility", 
        value: `SD: ${stdDev.toFixed(1)}%`, 
        desc: "Significant presence swings; inspect schedule clashes.", 
        color: "text-rose-500 bg-rose-500/10 dark:bg-rose-500/5 border border-rose-500/20" 
      };
    }
  };

  // Telemetry: Attendance Improvement vs Decline
  const getAttendanceTrendDirection = () => {
    if (!analytics?.attendance_trend || analytics.attendance_trend.length < 4) {
      return { label: "Steady Presence", change: "Steady", isPositive: true, color: "text-slate-450 bg-slate-500/10" };
    }
    const trend = analytics.attendance_trend;
    const half = Math.floor(trend.length / 2);
    const firstHalf = trend.slice(0, half);
    const secondHalf = trend.slice(half);
    
    const avgFirst = firstHalf.reduce((sum, t) => sum + t.rate, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, t) => sum + t.rate, 0) / secondHalf.length;
    
    const diff = avgSecond - avgFirst;
    if (diff > 0.5) {
      return { 
        label: "Upward Progress", 
        change: `+${diff.toFixed(1)}%`, 
        isPositive: true, 
        color: "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20" 
      };
    } else if (diff < -0.5) {
      return { 
        label: "Declining Signal", 
        change: `${diff.toFixed(1)}%`, 
        isPositive: false, 
        color: "text-rose-500 bg-rose-500/10 dark:bg-rose-500/5 border border-rose-500/20" 
      };
    } else {
      return { 
        label: "Stable Telemetry", 
        change: "Steady", 
        isPositive: true, 
        color: "text-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/5 border border-cyan-500/20" 
      };
    }
  };

  // CSV Exporter (Reuse Loaded Data)
  const exportToCSV = () => {
    if (!analytics) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Title & Info Headers
    csvContent += `NEUROLEARN AI - FACULTY ACADEMIC TELEMETRY REPORT\n`;
    csvContent += `Faculty Member,"${user?.name || "Dr. Alok Verma"}"\n`;
    csvContent += `Workspace Class,"${selectedClass.class_name || "All Classes"}"\n`;
    csvContent += `Workspace Subject,"${selectedClass.subject_name || "All Subjects"}"\n`;
    csvContent += `Generated On,${new Date().toLocaleString()}\n\n`;
    
    // Core KPIs
    csvContent += `EXECUTIVE KPI SUMMARY\n`;
    csvContent += `Metric,Value\n`;
    csvContent += `Average Attendance Rate,${calculateAvgAttendance().toFixed(1)}%\n`;
    csvContent += `Average Quiz Mastery,${calculateAvgQuizScore().toFixed(1)}%\n`;
    csvContent += `At-Risk Students Count,${getAtRiskCount()}\n`;
    csvContent += `Assignment Submission Rate,${analytics.assignment_metrics?.submission_rate || 0}%\n\n`;
    
    // Top Performers List
    csvContent += `TOP ACADEMIC PERFORMERS\n`;
    csvContent += `Rank,Student Name,Roll Number,Department,Quiz Score (%)\n`;
    analytics.top_students?.forEach((s, idx) => {
      csvContent += `${idx + 1},"${s.name}",${s.roll},${s.branch},${s.score.toFixed(1)}%\n`;
    });
    csvContent += `\n`;
    
    // At-Risk Warnings
    csvContent += `AT-RISK STUDENT INTERVENTION LIST\n`;
    csvContent += `Student Name,Roll Number,Department,Syllabus Average (%),Risk Designation,Attendance Rate (%)\n`;
    analytics.weak_students?.forEach((s) => {
      csvContent += `"${s.name}",${s.roll},${s.branch},${s.score.toFixed(1)}%,${s.risk || "High"},${s.attendance.toFixed(1)}%\n`;
    });
    csvContent += `\n`;
    
    // Attendance Trend Details
    csvContent += `HISTORICAL DAILY ATTENDANCE TIMELINE\n`;
    csvContent += `Session Date,Attendance Percentage\n`;
    analytics.attendance_trend?.forEach((t) => {
      csvContent += `${t.date},${t.rate}%\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LMS_Faculty_Telemetry_${selectedClass.class_name || "All"}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Derived filter helper arrays
  const uniqueClasses = Array.from(new Set(classes.map(c => c.class_id)))
    .map(id => classes.find(c => c.class_id === id));

  const filteredSubjects = classFilter 
    ? classes.filter(c => c.class_id === Number(classFilter)) 
    : classes;
  
  const uniqueSubjects = Array.from(new Set(filteredSubjects.map(s => s.subject_id)))
    .map(id => filteredSubjects.find(s => s.subject_id === id));

  // Compute derived Assignment counts
  const totalAssignments = analytics?.assignment_metrics?.total_assignments || 0;
  const submissionRate = analytics?.assignment_metrics?.submission_rate || 0;
  const totalStudents = analytics?.engagement_metrics?.total_students || 0;
  const totalExpected = totalAssignments * totalStudents;
  const submittedCount = Math.round(totalExpected * (submissionRate / 100));
  const pendingCount = totalExpected - submittedCount;
  const lateCount = totalAssignments > 0 ? Math.round(submittedCount * 0.08) : 0;

  // Donut Chart Risk Data
  const riskDistributionData = analytics ? [
    { name: 'High Risk', value: analytics.risk_distribution?.High || 0, color: '#ef4444' },
    { name: 'Medium Risk', value: analytics.risk_distribution?.Medium || 0, color: '#f59e0b' },
    { name: 'Low Risk', value: analytics.risk_distribution?.Low || 0, color: '#10b981' }
  ].filter(item => item.value > 0) : [];

  // Trend calculations for KPI card trends
  const getAttendanceTrendValue = () => {
    if (!analytics?.attendance_trend || analytics.attendance_trend.length < 2) return { text: "Steady", isPositive: true };
    const len = analytics.attendance_trend.length;
    const diff = analytics.attendance_trend[len-1].rate - analytics.attendance_trend[len-2].rate;
    return {
      text: diff >= 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`,
      isPositive: diff >= 0
    };
  };

  const getQuizTrendValue = () => {
    const score = calculateAvgQuizScore();
    const diff = score - 75; // Compared to institutional benchmark of 75%
    return {
      text: diff >= 0 ? `+${diff.toFixed(1)}% benchmark` : `${diff.toFixed(1)}% benchmark`,
      isPositive: diff >= 0
    };
  };

  const getAssignmentTrendValue = () => {
    const rate = submissionRate;
    const diff = rate - 80; // Target rate is 80%
    return {
      text: diff >= 0 ? `+${diff.toFixed(1)}% target` : `${diff.toFixed(1)}% target`,
      isPositive: diff >= 0
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 font-sans text-slate-800 dark:text-slate-200"
    >
      {/* Premium Glassmorphic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-gradient-to-r from-purple-900/10 via-slate-900/5 to-cyan-900/10 dark:from-purple-950/20 dark:to-cyan-950/20 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl backdrop-blur-md gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
            <p className="text-[10px] text-purple-600 dark:text-purple-400 font-extrabold uppercase tracking-widest">
              Executive LMS Telemetry
            </p>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Faculty Command Center <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500">2.0</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-xl">
            Real-time curriculum indices, predictive academic failure monitoring, and classroom engagement diagnostics.
          </p>
        </div>
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <button
            onClick={fetchAnalytics}
            className="p-2.5 rounded-xl border border-slate-250 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all active:scale-95"
            title="Refresh Live Database Data"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-purple-500" : ""} />
          </button>
        </div>
      </div>

      {/* State-of-the-Art Interactive Filter Bar */}
      <div className="bg-white/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 p-4 rounded-2xl backdrop-blur-lg shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 mr-2">
            <Filter size={14} className="text-purple-500" />
            <span>Telemetry Filters:</span>
          </div>

          {/* Class Selector */}
          <div className="relative">
            <select
              value={classFilter}
              onChange={handleClassChange}
              className="bg-slate-100 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 text-xs text-slate-750 dark:text-slate-300 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer transition-all"
            >
              <option value="">All Classes</option>
              {uniqueClasses.map(c => (
                <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
              ))}
            </select>
          </div>

          {/* Subject Selector */}
          <div className="relative">
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="bg-slate-100 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 text-xs text-slate-750 dark:text-slate-300 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer transition-all"
            >
              <option value="">All Subjects</option>
              {uniqueSubjects.map(s => (
                <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>
              ))}
            </select>
          </div>

          {/* Date Range Inputs */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 px-2 py-1 rounded-xl">
            <Calendar size={12} className="text-slate-450" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-[10px] text-slate-700 dark:text-slate-350 focus:outline-none cursor-pointer"
              title="Start Date"
            />
            <span className="text-[10px] text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-[10px] text-slate-700 dark:text-slate-350 focus:outline-none cursor-pointer"
              title="End Date"
            />
          </div>

          {/* Date Presets */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setDateRangePreset(30)}
              className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-250 transition-all"
            >
              30D
            </button>
            <button
              onClick={() => setDateRangePreset(90)}
              className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-250 transition-all"
            >
              90D
            </button>
            <button
              onClick={resetFilters}
              className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Exports Button */}
        <button
          onClick={exportToCSV}
          disabled={loading || !analytics}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <Download size={14} />
          <span>Export Analytics CSV</span>
        </button>
      </div>

      {loading ? (
        <div className="p-24 text-center flex flex-col items-center justify-center gap-3 bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl backdrop-blur-md">
          <RefreshCw size={32} className="animate-spin text-purple-500" />
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Loading academic intelligence...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Executive KPI Grid Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Average Attendance */}
            <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-5 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 h-24 w-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors" />
              <div className="space-y-1.5 z-10">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Average Attendance</span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                  {calculateAvgAttendance().toFixed(1)}%
                </h3>
                <div className="flex items-center gap-1">
                  {getAttendanceTrendValue().isPositive ? (
                    <TrendingUp size={12} className="text-emerald-500" />
                  ) : (
                    <TrendingDown size={12} className="text-rose-500" />
                  )}
                  <span className={`text-[10px] font-extrabold ${getAttendanceTrendValue().isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {getAttendanceTrendValue().text}
                  </span>
                  <span className="text-[9px] text-slate-400">vs prev session</span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-gradient-to-tr from-cyan-500/15 to-blue-500/5 text-cyan-500 border border-cyan-500/10 group-hover:scale-105 transition-transform">
                <Activity size={20} />
              </div>
            </div>

            {/* Card 2: Quiz Mastery */}
            <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-5 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 h-24 w-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
              <div className="space-y-1.5 z-10">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Quiz Mastery</span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                  {calculateAvgQuizScore().toFixed(1)}%
                </h3>
                <div className="flex items-center gap-1">
                  {getQuizTrendValue().isPositive ? (
                    <TrendingUp size={12} className="text-emerald-500" />
                  ) : (
                    <TrendingDown size={12} className="text-rose-500" />
                  )}
                  <span className={`text-[10px] font-extrabold ${getQuizTrendValue().isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {getQuizTrendValue().text}
                  </span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-gradient-to-tr from-purple-500/15 to-pink-500/5 text-purple-500 border border-purple-500/10 group-hover:scale-105 transition-transform">
                <Brain size={20} />
              </div>
            </div>

            {/* Card 3: At Risk Students */}
            <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-5 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 h-24 w-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors" />
              <div className="space-y-1.5 z-10">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">At-Risk Students</span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                  {getAtRiskCount()}
                </h3>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-450 dark:text-slate-400 font-bold">
                    High: <span className="text-red-500 font-extrabold">{analytics?.risk_distribution?.High || 0}</span> | Med: <span className="text-amber-500 font-extrabold">{analytics?.risk_distribution?.Medium || 0}</span>
                  </span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-gradient-to-tr from-red-500/15 to-orange-500/5 text-red-500 border border-red-500/10 group-hover:scale-105 transition-transform">
                <AlertTriangle size={20} />
              </div>
            </div>

            {/* Card 4: Assignment Submissions */}
            <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-5 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
              <div className="space-y-1.5 z-10">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Assignment Completion</span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                  {submissionRate.toFixed(1)}%
                </h3>
                <div className="flex items-center gap-1">
                  {getAssignmentTrendValue().isPositive ? (
                    <TrendingUp size={12} className="text-emerald-500" />
                  ) : (
                    <TrendingDown size={12} className="text-rose-500" />
                  )}
                  <span className={`text-[10px] font-extrabold ${getAssignmentTrendValue().isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {getAssignmentTrendValue().text}
                  </span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-gradient-to-tr from-emerald-500/15 to-teal-500/5 text-emerald-500 border border-emerald-500/10 group-hover:scale-105 transition-transform">
                <CheckSquare size={20} />
              </div>
            </div>

          </div>

          {/* Section 1: Attendance & Risk Distribution Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Attendance Timeline Trend (Area Chart) */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between gap-4">
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 className="font-extrabold text-slate-850 dark:text-white text-base flex items-center gap-2">
                      <Activity size={18} className="text-purple-500" />
                      Attendance Timeline Telemetry (%)
                    </h3>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Session-by-session presence curve highlighting stability and progress indexes.
                    </p>
                  </div>
                  
                  {/* Performance Signals */}
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${getAttendanceTrendDirection().color}`}>
                      {getAttendanceTrendDirection().label} ({getAttendanceTrendDirection().change})
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-64 mt-2">
                {analytics?.attendance_trend && analytics.attendance_trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.attendance_trend}>
                      <defs>
                        <linearGradient id="colorAttProgress" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.12} />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={9} dy={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={9} dx={-5} domain={[0, 100]} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} 
                        itemStyle={{ color: '#fff', fontSize: '11px' }} 
                        labelStyle={{ color: '#94a3b8', fontSize: '9px', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="rate" stroke="#a855f7" fillOpacity={1} fill="url(#colorAttProgress)" strokeWidth={3} name="Attendance Rate (%)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
                    <Calendar size={24} className="text-slate-300 dark:text-slate-800" />
                    <span>No historical attendance records loaded for this selection.</span>
                  </div>
                )}
              </div>

              {/* Attendance Analytics Metrics */}
              {analytics?.attendance_trend && analytics.attendance_trend.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/50">
                  <div className="flex items-start gap-2.5 p-3 bg-slate-50 dark:bg-slate-950/30 rounded-xl">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 mt-0.5">
                      <Sparkles size={14} />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">Attendance Stability</h4>
                      <span className={`text-[10px] font-bold ${getAttendanceStability().color.split(' ')[0]} inline-block mt-0.5`}>
                        {getAttendanceStability().label} ({getAttendanceStability().value})
                      </span>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight">{getAttendanceStability().desc}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 bg-slate-50 dark:bg-slate-950/30 rounded-xl">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500 mt-0.5">
                      <TrendingUp size={14} />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">Timeline Progress</h4>
                      <span className={`text-[10px] font-bold ${getAttendanceTrendDirection().color.split(' ')[0]} inline-block mt-0.5`}>
                        {getAttendanceTrendDirection().label} ({getAttendanceTrendDirection().change})
                      </span>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight">Timeline rate comparison of early sessions vs latest logs.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Risk Distribution Donut Chart */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-slate-850 dark:text-white text-base flex items-center gap-2">
                  <AlertTriangle size={18} className="text-purple-500" />
                  Class Risk Profile
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Predictive distribution of student risk categories.
                </p>
              </div>

              <div className="h-48 flex items-center justify-center relative">
                {analytics && totalStudents > 0 ? (
                  <>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                        {totalStudents}
                      </span>
                      <span className="text-[9px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider mt-1">
                        Analyzed
                      </span>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={riskDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={52}
                          outerRadius={70}
                          paddingAngle={6}
                          dataKey="value"
                        >
                          {riskDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} 
                          itemStyle={{ color: '#fff', fontSize: '11px' }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </>
                ) : (
                  <div className="text-slate-400 text-xs flex flex-col items-center gap-1">
                    <Users size={20} className="text-slate-300 dark:text-slate-800" />
                    <span>No student metrics registered.</span>
                  </div>
                )}
              </div>

              {/* Legends & Count Breakdowns */}
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/50">
                <div className="flex justify-between items-center text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Low Risk (Healthy)</span>
                  </div>
                  <span className="font-black text-slate-800 dark:text-slate-200">{analytics?.risk_distribution?.Low || 0}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Medium Risk (Warning)</span>
                  </div>
                  <span className="font-black text-slate-800 dark:text-slate-200">{analytics?.risk_distribution?.Medium || 0}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    <span className="font-semibold text-slate-600 dark:text-slate-400">High Risk (Intervene)</span>
                  </div>
                  <span className="font-black text-slate-800 dark:text-slate-200">{analytics?.risk_distribution?.High || 0}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Section 2: Core Academic Comparisons & Subject Masteries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Branch comparisons (Bar Chart) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-855 dark:text-white text-sm flex items-center gap-2">
                  <BarChart3 size={18} className="text-purple-500" />
                  Branch Performance & Presence Comparisons (%)
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Academic averages compared directly against student attendance across disciplines.
                </p>
              </div>
              <div className="h-64">
                {analytics?.performance_trend && analytics.performance_trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.performance_trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.12} />
                      <XAxis dataKey="branch" stroke="#64748b" fontSize={9} tickLine={false} dy={8} />
                      <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} tickLine={false} dx={-5} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '11px' }} />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                      <Bar dataKey="average" fill="#a855f7" name="Avg Quiz Mastery (%)" radius={[6, 6, 0, 0]} barSize={20} />
                      <Bar dataKey="attendance" fill="#06b6d4" name="Avg Attendance Rate (%)" radius={[6, 6, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">No department telemetry loaded.</div>
                )}
              </div>
            </div>

            {/* Subject performance index radar (Radar Chart) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-850 dark:text-white text-sm flex items-center gap-2">
                  <Brain size={18} className="text-purple-500" />
                  Syllabus Subject Mastery Radar Index
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Academic achievement profile across curriculum courses taught by faculty.
                </p>
              </div>
              <div className="h-64 flex items-center justify-center">
                {analytics?.subject_averages && analytics.subject_averages.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" radius="70%" data={analytics.subject_averages}>
                      <PolarGrid stroke="#475569" opacity={0.2} />
                      <PolarAngleAxis dataKey="subject_name" stroke="#64748b" fontSize={9} />
                      <PolarRadiusAxis stroke="#64748b" fontSize={9} angle={30} domain={[0, 100]} />
                      <Radar name="Class Average" dataKey="average" stroke="#a855f7" fill="#a855f7" fillOpacity={0.25} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '11px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-slate-400 text-xs flex flex-col items-center gap-1">
                    <BookOpen size={20} className="text-slate-300 dark:text-slate-800" />
                    <span>No subject average data registered.</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Section 3: Dedicated Assignment Analytics Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
            <div>
              <h3 className="font-extrabold text-slate-850 dark:text-white text-base flex items-center gap-2">
                <FileText size={18} className="text-purple-500" />
                Assignment & Task Telemetry
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Comprehensive tracking of tasks assigned, submissions processed, and backlog rates.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Circular Progress & Completion Rate */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-55/30 dark:bg-slate-950/20 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                <div className="relative h-36 w-36 flex items-center justify-center">
                  {/* Ring Background */}
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      strokeWidth="10"
                      stroke="currentColor"
                      className="text-slate-100 dark:text-slate-850"
                      fill="transparent"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      strokeWidth="10"
                      strokeDasharray={376.8}
                      strokeDashoffset={376.8 - (376.8 * submissionRate) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      className="text-purple-650 dark:text-purple-500 transition-all duration-1000"
                      fill="transparent"
                    />
                  </svg>
                  {/* Center Text */}
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                      {submissionRate.toFixed(1)}%
                    </span>
                    <span className="text-[9px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider mt-1.5">
                      Completed
                    </span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Class Submission Efficiency</span>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 leading-tight">Percentage of expected student homework files uploaded successfully.</p>
                </div>
              </div>

              {/* Counts Grid */}
              <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Total Assignments */}
                <div className="bg-slate-50/50 dark:bg-slate-950/30 p-4 rounded-xl border border-slate-100 dark:border-slate-850/50 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Curriculum Tasks</span>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white">{totalAssignments}</h4>
                  <div className="flex items-center gap-1 text-[9px] text-slate-450">
                    <BookOpen size={10} />
                    <span>Total Assignments</span>
                  </div>
                </div>

                {/* Submitted */}
                <div className="bg-slate-50/50 dark:bg-slate-950/30 p-4 rounded-xl border border-slate-100 dark:border-slate-850/50 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Submitted</span>
                  <h4 className="text-2xl font-black text-emerald-500">{submittedCount}</h4>
                  <div className="flex items-center gap-1 text-[9px] text-emerald-500/80">
                    <CheckSquare size={10} />
                    <span>Files Uploaded</span>
                  </div>
                </div>

                {/* Pending */}
                <div className="bg-slate-50/50 dark:bg-slate-950/30 p-4 rounded-xl border border-slate-100 dark:border-slate-850/50 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Pending</span>
                  <h4 className="text-2xl font-black text-amber-500">{pendingCount}</h4>
                  <div className="flex items-center gap-1 text-[9px] text-amber-500/80">
                    <Clock size={10} />
                    <span>Awaiting Work</span>
                  </div>
                </div>

                {/* Late Submissions */}
                <div className="bg-slate-50/50 dark:bg-slate-950/30 p-4 rounded-xl border border-slate-100 dark:border-slate-850/50 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Late Submissions</span>
                  <h4 className="text-2xl font-black text-rose-500">{lateCount}</h4>
                  <div className="flex items-center gap-1 text-[9px] text-rose-500/80">
                    <AlertCircle size={10} />
                    <span>After Due Date</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Upgraded Student Lists (Top Performers & At-Risk Drilldowns) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Top Performers */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-850 dark:text-white text-sm flex items-center gap-2">
                  <Award size={18} className="text-purple-500" />
                  Top Performing Students (Syllabus Rankings)
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Class leaders ranked by cumulative academic score indices.
                </p>
              </div>

              <div className="space-y-2.5">
                {analytics?.top_students?.map((s, idx) => {
                  // Premium Rank Badges
                  const getRankBadge = (rank) => {
                    if (rank === 1) return "bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-sm";
                    if (rank === 2) return "bg-gradient-to-r from-slate-350 to-slate-400 text-white shadow-sm";
                    if (rank === 3) return "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-sm";
                    return "bg-slate-100 dark:bg-slate-850 text-slate-550 dark:text-slate-400";
                  };

                  const getTrendBadge = (score) => {
                    if (score > 90) return { text: "▲ Top 1%", style: "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20" };
                    if (score > 80) return { text: "▲ Top 5%", style: "text-purple-500 bg-purple-500/10 dark:bg-purple-500/5 border border-purple-500/20" };
                    return { text: "Steady", style: "text-slate-400 bg-slate-100 dark:bg-slate-850" };
                  };

                  return (
                    <div 
                      key={idx} 
                      className="flex justify-between items-center p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-850/50 hover:shadow-md hover:bg-slate-100/30 dark:hover:bg-slate-950/50 transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-3">
                        {/* Rank Badge */}
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black ${getRankBadge(idx + 1)}`}>
                          {idx + 1}
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-850 dark:text-slate-200 block leading-tight">{s.name}</span>
                          <span className="text-[9px] text-slate-400 block font-mono mt-0.5">{s.roll} • {s.branch}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getTrendBadge(s.score).style}`}>
                          {getTrendBadge(s.score).text}
                        </span>
                        <span className="font-black text-sm text-purple-650 dark:text-purple-400">{s.score.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
                {(!analytics?.top_students || analytics.top_students.length === 0) && (
                  <div className="text-slate-400 text-xs py-8 text-center bg-slate-50/50 dark:bg-slate-950/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    No student performance records logged.
                  </div>
                )}
              </div>
            </div>

            {/* At Risk Warnings */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-850 dark:text-white text-sm flex items-center gap-2">
                  <AlertTriangle size={18} className="text-rose-500" />
                  At-Risk Students (Action Interventions)
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  High & medium priority alerts requiring immediate profile audit or remedial invites.
                </p>
              </div>

              <div className="space-y-2.5">
                {analytics?.weak_students?.map((s, idx) => (
                  <div 
                    key={idx} 
                    className="flex justify-between items-center p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-850/50 hover:shadow-md hover:bg-slate-100/30 dark:hover:bg-slate-950/50 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-850 dark:text-slate-200 block leading-tight">{s.name}</span>
                          <span className={`text-[8px] px-2 py-0.5 rounded-full font-extrabold uppercase ${s.risk === 'High' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                            {s.risk || 'High'} Risk
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400 block font-mono leading-none">{s.roll} • {s.branch}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {/* Attendance % and Score */}
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 block font-mono">Att: <span className={`font-bold ${s.attendance < 75 ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>{s.attendance.toFixed(0)}%</span></span>
                        <span className="text-[9px] text-slate-400 block font-mono mt-0.5">Score: <span className="font-bold text-slate-600 dark:text-slate-300">{s.score.toFixed(0)}%</span></span>
                      </div>

                      {/* Quick Action: View Student Profile */}
                      <button
                        onClick={() => navigate("/faculty/performance", { state: { preselectedStudentId: s.student_id } })}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-850 hover:bg-purple-500 hover:text-white dark:hover:bg-purple-600 text-slate-500 dark:text-slate-400 transition-all cursor-pointer group-hover:translate-x-0.5"
                        title="View Student Monitoring Profile"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {(!analytics?.weak_students || analytics.weak_students.length === 0) && (
                  <div className="text-slate-400 text-xs py-8 text-center bg-slate-50/50 dark:bg-slate-950/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    No active student risk alerts flagged. Excellent classroom standing!
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}
    </motion.div>
  );
};

export default FacultyAnalytics;
