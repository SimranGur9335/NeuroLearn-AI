import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../services/api';
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
  Users,
  Calendar,
  GraduationCap,
  AlertTriangle,
  Activity,
  ArrowRight,
  TrendingUp,
  Award,
  Bell,
  BookOpen,
  ClipboardCheck,
  Plus,
  Shield,
  Briefcase,
  Layers,
  Sparkles,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const selectedClass = JSON.parse(localStorage.getItem("selectedClass") || "{}");
  const facultyId = user?.faculty_id;

  const [dashboardData, setDashboardData] = useState(null);
  const [classesList, setClassesList] = useState([]);
  const [activities, setActivities] = useState([]);
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attHistory, setAttHistory] = useState([]);
  const [facultyInfo, setFacultyInfo] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [commandCenterData, setCommandCenterData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRecentActivities = async (activeId) => {
    const id = activeId || facultyId;
    if (!id) return;
    try {
      const res = await apiFetch(`/api/v1/faculty/${id}/activities?limit=4`);
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (err) {
      console.error("Failed to fetch recent activities", err);
    }
  };

  useEffect(() => {
    const fetchDashboardTelemetry = async () => {
      if (!selectedClass.class_id) return;
      setLoading(true);
      try {
        let activeFacultyId = facultyId || user?.faculty_id;
        const promises = [];

        // 1. Resolve faculty ID if not already in state
        let facPromise = null;
        if (user?.email && !facultyInfo) {
          facPromise = apiFetch(`/faculty/by-email/${user.email}`)
            .then(async res => {
              if (res.ok) {
                const facData = await res.json();
                setFacultyInfo(facData);
                if (!activeFacultyId) {
                  activeFacultyId = facData.faculty_id;
                }
              }
            })
            .catch(err => console.error("Failed to fetch faculty info", err));

          if (!activeFacultyId) {
            // Must block to get the faculty ID first
            await facPromise;
          } else {
            // Can run in parallel
            promises.push(facPromise);
          }
        }

        // 2. Fire all class-specific and faculty-specific requests in parallel

        // Dashboard summary
        const summaryPromise = apiFetch(`/class/${selectedClass.class_id}/dashboard-summary`)
          .then(async res => {
            if (res.ok) {
              const data = await res.json();
              setDashboardData(data);
            }
          })
          .catch(err => console.error("Failed to fetch dashboard summary", err));
        promises.push(summaryPromise);

        // Assignments
        const assignPromise = apiFetch(`/assignments?class_id=${selectedClass.class_id}&subject_id=${selectedClass.subject_id}`)
          .then(async res => {
            if (res.ok) {
              const data = await res.json();
              setAssignments(data.slice(0, 4));
            }
          })
          .catch(err => console.error("Failed to fetch assignments", err));
        promises.push(assignPromise);

        // Attendance history
        const attPromise = apiFetch(`/attendance/history?class_id=${selectedClass.class_id}&subject_id=${selectedClass.subject_id}`)
          .then(async res => {
            if (res.ok) {
              const data = await res.json();
              setAttHistory(data.slice(0, 6));
            }
          })
          .catch(err => console.error("Failed to fetch attendance history", err));
        promises.push(attPromise);

        // Class students with metrics (filtered by class on database level)
        const studentsPromise = apiFetch(`/class/${selectedClass.class_id}/student-metrics`)
          .then(async res => {
            if (res.ok) {
              const data = await res.json();
              setAllStudents(data);
              const atRisk = data.filter(s => s.risk_level === "High" || s.risk_level === "Medium");
              setAtRiskStudents(atRisk.slice(0, 4));
            }
          })
          .catch(err => console.error("Failed to fetch class student metrics", err));
        promises.push(studentsPromise);

        // Faculty-dependent parallel calls
        if (activeFacultyId) {
          // Classes list
          const classesPromise = apiFetch(`/faculty/${activeFacultyId}/classes`)
            .then(async res => {
              if (res.ok) {
                const data = await res.json();
                setClassesList(data);
              }
            })
            .catch(err => console.error("Failed to fetch classes list", err));
          promises.push(classesPromise);

          // Command Center data
          const commandCenterPromise = apiFetch(`/api/v1/faculty/${activeFacultyId}/dashboard-command-center?class_id=${selectedClass.class_id}&subject_id=${selectedClass.subject_id}`)
            .then(async res => {
              if (res.ok) {
                const data = await res.json();
                setCommandCenterData(data);
              }
            })
            .catch(err => console.error("Failed to fetch command center data", err));
          promises.push(commandCenterPromise);

          // Recent activities
          const activitiesPromise = apiFetch(`/api/v1/faculty/${activeFacultyId}/activities?limit=4`)
            .then(async res => {
              if (res.ok) {
                const data = await res.json();
                setActivities(data);
              }
            })
            .catch(err => console.error("Failed to fetch activities", err));
          promises.push(activitiesPromise);
        }

        // Wait for all requests to finish concurrently
        await Promise.all(promises);

      } catch (err) {
        console.error("Failed to load dashboard metrics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardTelemetry();
  }, [selectedClass.class_id, facultyId, user]);

  const attendanceChartData = attHistory.map(h => ({
    date: h.date.split("-")[2] + "/" + h.date.split("-")[1],
    "Attendance %": h.present + h.absent + h.late > 0 ? Math.round((h.present / (h.present + h.absent + h.late)) * 100) : 100
  })).reverse();

  const handleRunRiskEngine = async () => {
    try {
      const res = await apiFetch("/faculty/run-risk-engine", {
        method: "POST",
        body: JSON.stringify({ class_id: selectedClass.class_id, faculty_id: facultyId || facultyInfo?.faculty_id })
      });
      if (!res.ok) throw new Error();
      alert("Risk Engine computed current student warning tiers!");
      navigate("/faculty/risk");
    } catch {
      alert("Failed to execute Risk Calculations.");
    }
  };

  const getActivityIcon = (module) => {
    switch (module) {
      case 'attendance': return Calendar;
      case 'assignment': return ClipboardCheck;
      case 'marks': return Award;
      case 'announcement': return Bell;
      case 'risk': return AlertTriangle;
      case 'remedial': return GraduationCap;
      default: return Activity;
    }
  };

  const getActivityColor = (module) => {
    switch (module) {
      case 'attendance': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case 'assignment': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'marks': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case 'announcement': return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400';
      case 'risk': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
      case 'remedial': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      default: return 'bg-slate-500/10 text-slate-600 dark:text-slate-400';
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  // Glassmorphism Loading Skeleton
  if (loading) {
    return (
      <div className="space-y-6 font-sans text-slate-850 dark:text-slate-200 animate-pulse">
        {/* Banner Skeleton */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-[240px] rounded-3xl p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-24 h-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="w-1/2 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="w-1/3 h-5 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>
          <div className="h-0.5 bg-slate-100 dark:bg-slate-800/60 w-full" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="w-16 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="w-24 h-5 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Today's Overview Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-24 rounded-2xl p-4 space-y-3">
              <div className="w-16 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="w-20 h-6 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>

        {/* Main Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-[420px] rounded-3xl lg:col-span-2 p-6" />
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-[420px] rounded-3xl p-6" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 font-sans text-slate-800 dark:text-slate-200"
    >
      {/* Workspace Banner / Command Center Header */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-950 to-slate-900 border border-purple-900/50 p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-xl text-white">
        <div className="absolute right-0 top-0 w-80 h-80 bg-radial-gradient(circle,rgba(168,85,247,0.18)_0%,transparent_75%) pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-radial-gradient(circle,rgba(10,185,129,0.06)_0%,transparent_70%) pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-wider bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/25 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-450 animate-ping" />
                  Active Command Center
                </span>
                <span className="text-[9px] text-purple-350 font-extrabold uppercase tracking-wider bg-purple-500/15 px-3 py-1 rounded-full border border-purple-500/25">
                  {commandCenterData?.workspace_summary?.academic_year || "Academic Year"}
                </span>
                <span className="text-[9px] text-indigo-350 font-extrabold uppercase tracking-wider bg-indigo-500/15 px-3 py-1 rounded-full border border-indigo-500/25">
                  {commandCenterData?.workspace_summary?.semester || "Active Semester"}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black mt-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300 tracking-tight">
                {selectedClass.subject_name || "N/A"}
              </h1>
              <p className="text-purple-350 mt-1 text-sm font-extrabold flex items-center gap-2">
                <Layers size={14} />
                {selectedClass.class_name || "N/A"} • {selectedClass.role || "Theory"} Delivery
              </p>
            </div>
            <button
              onClick={() => navigate('/faculty/select-class')}
              className="bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black px-6 py-3.5 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-950/50 border border-purple-450/30 text-xs cursor-pointer shrink-0 self-start md:self-center"
            >
              Switch Workspace
            </button>
          </div>

          <div className="h-px bg-white/10" />

          {/* Detailed Workspace Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Lead Instructor</span>
              <p className="font-extrabold text-slate-100 text-sm flex items-center gap-1.5">
                👨‍🏫 {commandCenterData?.workspace_summary?.faculty_name || facultyInfo?.full_name || user?.name || "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Faculty Code & Rank</span>
              <p className="font-extrabold text-slate-100 text-sm">
                {commandCenterData?.workspace_summary?.faculty_code || facultyInfo?.faculty_code || "N/A"} • <span className="text-[10px] text-purple-350">{commandCenterData?.workspace_summary?.designation || facultyInfo?.designation || "N/A"}</span>
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Department</span>
              <p className="font-extrabold text-slate-100 text-sm line-clamp-1">
                {commandCenterData?.workspace_summary?.department || facultyInfo?.department || "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Institution Campus</span>
              <p className="font-extrabold text-slate-100 text-sm line-clamp-1 flex items-center gap-1">
                🏛️ {commandCenterData?.workspace_summary?.institution || facultyInfo?.institution_name || user?.institution_name || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Executive Overview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles size={18} className="text-purple-600 animate-pulse" />
            Today's Executive Overview
          </h2>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {/* Assigned Classes */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all hover:border-purple-500/25 group">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider">Courses</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{commandCenterData?.today_overview?.today_classes ?? classesList.length}</span>
              <span className="text-[8px] font-bold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded">Total</span>
            </div>
          </div>

          {/* Pending Attendance */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all hover:border-purple-500/25 group">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider">Attendance</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {commandCenterData?.today_overview?.pending_attendance === 0 ? "Marked" : "Pending"}
              </span>
              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${commandCenterData?.today_overview?.pending_attendance === 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500 animate-pulse"}`}>
                {commandCenterData?.today_overview?.pending_attendance === 0 ? "Done" : "Action"}
              </span>
            </div>
          </div>

          {/* Pending Marks */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all hover:border-purple-500/25 group">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider">Draft Marks</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{commandCenterData?.today_overview?.pending_marks ?? 0}</span>
              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${commandCenterData?.today_overview?.pending_marks > 0 ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                {commandCenterData?.today_overview?.pending_marks > 0 ? "Draft" : "Clean"}
              </span>
            </div>
          </div>

          {/* Pending Assignments */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all hover:border-purple-500/25 group">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider">Ungraded</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{commandCenterData?.today_overview?.pending_assignments ?? 0}</span>
              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${commandCenterData?.today_overview?.pending_assignments > 0 ? "bg-rose-500/10 text-rose-500 animate-pulse" : "bg-emerald-500/10 text-emerald-500"}`}>
                {commandCenterData?.today_overview?.pending_assignments > 0 ? "Review" : "Done"}
              </span>
            </div>
          </div>

          {/* High Risk Students */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all hover:border-purple-500/25 group">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider">High Risk</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className={`text-2xl font-black ${commandCenterData?.today_overview?.high_risk_students > 0 ? "text-red-500" : "text-slate-900 dark:text-white"}`}>
                {commandCenterData?.today_overview?.high_risk_students ?? 0}
              </span>
              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${commandCenterData?.today_overview?.high_risk_students > 0 ? "bg-red-500/10 text-red-500 animate-bounce" : "bg-emerald-500/10 text-emerald-500"}`}>
                {commandCenterData?.today_overview?.high_risk_students > 0 ? "Alert" : "Safe"}
              </span>
            </div>
          </div>

          {/* Upcoming Remedials */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all hover:border-purple-500/25 group">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider">Remedials</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{commandCenterData?.today_overview?.upcoming_remedials ?? 0}</span>
              <span className="text-[8px] font-bold text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded">Active</span>
            </div>
          </div>

          {/* Unread Notifications */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all hover:border-purple-500/25 group">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider">Alerts</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{commandCenterData?.today_overview?.unread_notifications ?? 0}</span>
              <span className="text-[8px] font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded">Inbox</span>
            </div>
          </div>

          {/* Unread Announcements */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all hover:border-purple-500/25 group">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider">Broadcasts</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{commandCenterData?.today_overview?.unread_announcements ?? 0}</span>
              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${commandCenterData?.today_overview?.unread_announcements > 0 ? "bg-purple-500/10 text-purple-500" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                {commandCenterData?.today_overview?.unread_announcements > 0 ? "New" : "Read"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Tasks Checklist & Attendance Trend */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Tasks Checklist Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4 hover:shadow-md transition-all">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-850 dark:text-white text-base flex items-center gap-2">
                  <ClipboardCheck size={20} className="text-purple-600 animate-pulse" />
                  My Action Items
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Dynamic workflow checklist</p>
              </div>
              <span className="text-xs font-extrabold text-purple-600 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                {commandCenterData?.my_tasks?.length || 0} Tasks Pending
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-850/60 max-h-[360px] overflow-y-auto pr-1">
              {commandCenterData?.my_tasks && commandCenterData.my_tasks.length > 0 ? (
                commandCenterData.my_tasks.map((task) => {
                  const isHigh = task.priority === 'High';
                  const isMedium = task.priority === 'Medium';

                  let priorityBadge = "text-blue-600 bg-blue-500/10 border-blue-500/20";
                  if (isHigh) priorityBadge = "text-red-600 bg-red-500/10 border-red-500/20";
                  else if (isMedium) priorityBadge = "text-amber-600 bg-amber-500/10 border-amber-500/20";

                  return (
                    <div key={task.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0 hover:bg-slate-50/50 dark:hover:bg-slate-850/20 px-2 rounded-xl transition-colors">
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${priorityBadge}`}>
                            {task.priority} Priority
                          </span>
                          <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {task.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-850 dark:text-slate-100">
                          {task.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {task.description}
                        </p>
                      </div>

                      <button
                        onClick={() => navigate(task.route)}
                        className="self-start sm:self-center px-4.5 py-2.5 bg-slate-950 hover:bg-purple-650 dark:bg-slate-800 dark:hover:bg-purple-650 text-white font-extrabold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm group shrink-0"
                      >
                        {task.action_label}
                        <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 space-y-3">
                  <div className="text-3xl">🎉</div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">All Tasks Caught Up!</h4>
                  <p className="text-xs text-slate-450 max-w-xs mx-auto">
                    Excellent work! There are no pending attendance records, drafts, or ungraded submissions for this workspace.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Lecture Attendance Trend Area Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <h3 className="font-extrabold text-slate-850 dark:text-white text-sm flex items-center gap-1.5">
              <TrendingUp size={18} className="text-purple-600" />
              Lecture Attendance Trend
            </h3>
            <div className="h-64">
              {attendanceChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={attendanceChartData}>
                    <defs>
                      <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '11px' }} />
                    <Area type="monotone" dataKey="Attendance %" stroke="#a855f7" fillOpacity={1} fill="url(#colorAtt)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  No attendance logs found to render trend line.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column - Smart Insights & Quick Actions */}
        <div className="space-y-6">
          {/* Smart Insights Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div>
              <h3 className="font-extrabold text-slate-850 dark:text-white text-base flex items-center gap-2">
                <Shield size={20} className="text-purple-600" />
                Smart Insights
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Rule-based analytical alerts</p>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {commandCenterData?.smart_insights && commandCenterData.smart_insights.length > 0 ? (
                commandCenterData.smart_insights.map((insight, idx) => {
                  let badgeColor = "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400";
                  let iconText = "ℹ️";

                  if (insight.severity === "danger") {
                    badgeColor = "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400";
                    iconText = "🚨";
                  } else if (insight.severity === "warning") {
                    badgeColor = "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400";
                    iconText = "⚠️";
                  } else if (insight.severity === "success") {
                    badgeColor = "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400";
                    iconText = "✅";
                  } else if (insight.severity === "info") {
                    badgeColor = "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400";
                    iconText = "📅";
                  }

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border ${badgeColor} space-y-1 hover:scale-[1.01] transition-transform`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs shrink-0">{iconText}</span>
                        <h4 className="font-extrabold text-[10px] uppercase tracking-wider">
                          {insight.title}
                        </h4>
                      </div>
                      <p className="text-[11px] font-semibold opacity-90 leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs font-semibold">
                  Gathering telemetry to compute insights...
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Operations */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div>
              <h3 className="font-extrabold text-slate-850 dark:text-white text-base">Quick Operations</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Frequent administrative actions</p>
            </div>

            <div className="flex flex-col space-y-2.5">
              <button
                onClick={() => navigate("/faculty/attendance")}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-xl text-xs transition-all shadow cursor-pointer text-left pl-4 flex items-center gap-2"
              >
                <Calendar size={14} />
                Record Student Attendance
              </button>
              <button
                onClick={() => navigate("/faculty/assignments")}
                className="w-full py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer text-left pl-4 flex items-center gap-2"
              >
                <Plus size={14} />
                Create Class Assignment
              </button>
              <button
                onClick={() => navigate("/faculty/gradebook")}
                className="w-full py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer text-left pl-4 flex items-center gap-2"
              >
                <ClipboardCheck size={14} />
                Input Gradebook Marks
              </button>
              <button
                onClick={() => navigate("/faculty/remedial")}
                className="w-full py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer text-left pl-4 flex items-center gap-2"
              >
                <GraduationCap size={14} />
                Schedule Remedial Session
              </button>
              <button
                onClick={handleRunRiskEngine}
                className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-650 dark:text-red-400 font-bold rounded-xl text-xs transition-all cursor-pointer text-left pl-4 flex items-center gap-2"
              >
                <AlertTriangle size={14} />
                Recalculate Early Risk
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Lists Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* At-Risk Students list */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div>
            <h3 className="font-extrabold text-slate-850 dark:text-white text-sm">Students At Academic Risk</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Immediate intervention recommended</p>
          </div>

          <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1">
            {atRiskStudents.map(student => (
              <div
                key={student.student_id}
                onClick={() => navigate("/faculty/performance")}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-850 hover:border-purple-500/35 transition-all cursor-pointer"
              >
                <div>
                  <span className="font-bold text-xs block text-slate-800 dark:text-white">{student.full_name}</span>
                  <span className="text-[9px] text-slate-400 block font-mono mt-0.5">{student.roll_no} • Att: {student.attendance}%</span>
                </div>
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${student.risk_level === "High" ? "bg-red-500/10 text-red-500 animate-pulse" : "bg-amber-500/10 text-amber-500"}`}>
                  {student.risk_level}
                </span>
              </div>
            ))}
            {atRiskStudents.length === 0 && (
              <div className="text-center p-6 text-slate-400 text-xs font-semibold">
                No students flagged in warning tiers!
              </div>
            )}
          </div>
        </div>

        {/* Active Assignments */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div>
            <h3 className="font-extrabold text-slate-850 dark:text-white text-sm">Active Assignments</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Deadlines and outlines</p>
          </div>

          <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1">
            {assignments.map(a => (
              <div
                key={a.assignment_id}
                onClick={() => navigate("/faculty/assignments")}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-850 hover:border-purple-500/35 transition-all cursor-pointer space-y-1"
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-xs text-slate-850 dark:text-slate-200 line-clamp-1">{a.title}</span>
                </div>
                <div className="flex justify-between items-center text-[9px] text-slate-400">
                  <span>Due: {a.due_date}</span>
                  <span className="font-extrabold text-purple-650">{a.total_marks} Marks</span>
                </div>
              </div>
            ))}
            {assignments.length === 0 && (
              <div className="text-center p-6 text-slate-400 text-xs font-semibold">
                No assignments registered in this class.
              </div>
            )}
          </div>
        </div>

        {/* Compact Recent Activity Feed Widget */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-850 dark:text-white text-sm flex items-center gap-1.5">
                  <Activity size={18} className="text-purple-600 animate-pulse" />
                  Recent Activity Stream
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Your recent portal actions</p>
              </div>
            </div>

            <div className="space-y-3">
              {activities.length > 0 ? (
                activities.slice(0, 4).map(act => {
                  const Icon = getActivityIcon(act.module);
                  const colorClass = getActivityColor(act.module);
                  return (
                    <div key={act.activity_id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                      <div className={`p-2 rounded-lg shrink-0 ${colorClass}`}>
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-750 dark:text-slate-200 truncate">
                          {act.action}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {act.details}
                        </p>
                      </div>
                      <span className="text-[9px] text-slate-400 font-medium shrink-0">
                        {formatTime(act.created_at)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs font-semibold">
                  No recent activities logged.
                </div>
              )}
            </div>
          </div>

          {activities.length > 0 && (
            <button
              onClick={() => navigate("/faculty/activity")}
              className="mt-2 w-full py-2.5 bg-slate-50 hover:bg-slate-150 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-purple-600 dark:text-purple-400 font-black rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 group"
            >
              <span>View Full Activity Stream</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FacultyDashboard;
