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
  AlertCircle,
  User,
  MapPin
} from 'lucide-react';

const priorityConfig = {
  Urgent: { color: "bg-rose-500/10 text-rose-500 border-rose-500/20", dot: "bg-rose-500" },
  Important: { color: "bg-amber-500/10 text-amber-505 border-amber-500/20", dot: "bg-amber-500" },
  Normal: { color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", dot: "bg-emerald-555" },
};

const fmtDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short"
    });
  } catch {
    return d;
  }
};

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
  const [dashboardAnnouncements, setDashboardAnnouncements] = useState([]);
  const [remedialSessions, setRemedialSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentActivities = async (activeId) => {
    const id = activeId || facultyId;
    if (!id) return;
    try {
      const res = await apiFetch(`/api/v1/faculty/${id}/activities?limit=5`);
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
          const activitiesPromise = apiFetch(`/api/v1/faculty/${activeFacultyId}/activities?limit=5`)
            .then(async res => {
              if (res.ok) {
                const data = await res.json();
                setActivities(data);
              }
            })
            .catch(err => console.error("Failed to fetch activities", err));
          promises.push(activitiesPromise);

          // Announcements
          const announcementsPromise = apiFetch("/announcements")
            .then(async res => {
              if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                  // Filter received announcements (not self-created)
                  const receivedAnn = data.filter(
                    (ann) =>
                      !((ann.sender_type === "faculty" || ann.sender_type === "FACULTY") &&
                        Number(ann.sender_id) === Number(activeFacultyId))
                  );
                  const sorted = receivedAnn.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                  setDashboardAnnouncements(sorted.slice(0, 3));
                }
              }
            })
            .catch(err => console.error("Failed to fetch dashboard announcements", err));
          promises.push(announcementsPromise);

          // Remedial Sessions
          const remedialPromise = apiFetch(`/remedial/sessions?faculty_id=${activeFacultyId}`)
            .then(async res => {
              if (res.ok) {
                const data = await res.json();
                setRemedialSessions(data);
              }
            })
            .catch(err => console.error("Failed to fetch remedial sessions", err));
          promises.push(remedialPromise);
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

  const avgAttendance = attendanceChartData.length > 0
    ? Math.round(attendanceChartData.reduce((acc, curr) => acc + curr["Attendance %"], 0) / attendanceChartData.length)
    : 84;

  const sortedInsights = commandCenterData?.smart_insights
    ? [...commandCenterData.smart_insights]
        .sort((a, b) => {
          const priority = { danger: 1, warning: 2, info: 3, success: 4 };
          return (priority[a.severity] || 5) - (priority[b.severity] || 5);
        })
        .slice(0, 3)
    : [];

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
      case 'gradebook': return Award;
      case 'student_monitoring': return Users;
      case 'risk_prediction': return AlertTriangle;
      case 'remedial': return GraduationCap;
      case 'announcement': return Bell;
      case 'profile': return User;
      case 'authentication': return Shield;
      default: return Activity;
    }
  };

  const getActivityColor = (module) => {
    switch (module) {
      case 'attendance': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case 'assignment': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'gradebook': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case 'student_monitoring': return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400';
      case 'risk_prediction': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
      case 'remedial': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      case 'announcement': return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400';
      case 'profile': return 'bg-teal-500/10 text-teal-600 dark:text-teal-400';
      case 'authentication': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
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
      <div className="space-y-6 font-sans text-slate-855 dark:text-slate-200 animate-pulse">
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

  const upcomingRemedials = remedialSessions
    .filter(s => {
      if (s.status === 'Cancelled') return false;
      try {
        const [year, month, day] = s.session_date.split('-').map(Number);
        const [hours, minutes] = s.session_time.split(':').map(Number);
        const sessionDateTime = new Date(year, month - 1, day, hours, minutes);
        return sessionDateTime >= new Date();
      } catch {
        return true;
      }
    })
    .sort((a, b) => new Date(`${a.session_date}T${a.session_time}`) - new Date(`${b.session_date}T${b.session_time}`))
    .slice(0, 3);

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
      <div className="space-y-2">
        <span className="text-[10px] font-extrabold tracking-widest uppercase text-slate-400 dark:text-slate-500 block">
          Today's Executive Overview
        </span>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {/* Assigned Classes (Static) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-2xl shadow-sm h-full flex flex-col justify-between">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider">Courses</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{commandCenterData?.today_overview?.today_classes ?? classesList.length}</span>
              <span className="text-[8px] font-bold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded">Total</span>
            </div>
          </div>

          {/* Pending Attendance (Clickable) */}
          <div
            onClick={() => navigate('/faculty/attendance')}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-855 p-4 rounded-2xl shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col justify-between group"
          >
            <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Attendance</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {commandCenterData?.today_overview?.pending_attendance === 0 ? "Marked" : "Pending"}
              </span>
              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${commandCenterData?.today_overview?.pending_attendance === 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500 animate-pulse"}`}>
                {commandCenterData?.today_overview?.pending_attendance === 0 ? "Done" : "Action"}
              </span>
            </div>
          </div>

          {/* Pending Marks (Clickable) */}
          <div
            onClick={() => navigate('/faculty/gradebook')}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-855 p-4 rounded-2xl shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col justify-between group"
          >
            <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Draft Marks</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{commandCenterData?.today_overview?.pending_marks ?? 0}</span>
              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${commandCenterData?.today_overview?.pending_marks > 0 ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                {commandCenterData?.today_overview?.pending_marks > 0 ? "Draft" : "Clean"}
              </span>
            </div>
          </div>

          {/* Pending Assignments (Clickable) */}
          <div
            onClick={() => navigate('/faculty/assignments')}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-855 p-4 rounded-2xl shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col justify-between group"
          >
            <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Ungraded</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{commandCenterData?.today_overview?.pending_assignments ?? 0}</span>
              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${commandCenterData?.today_overview?.pending_assignments > 0 ? "bg-rose-500/10 text-rose-500 animate-pulse" : "bg-emerald-500/10 text-emerald-500"}`}>
                {commandCenterData?.today_overview?.pending_assignments > 0 ? "Review" : "Done"}
              </span>
            </div>
          </div>

          {/* High Risk Students (Clickable) */}
          <div
            onClick={() => navigate('/faculty/performance')}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-855 p-4 rounded-2xl shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col justify-between group"
          >
            <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">High Risk</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className={`text-2xl font-black ${commandCenterData?.today_overview?.high_risk_students > 0 ? "text-red-500" : "text-slate-900 dark:text-white"}`}>
                {commandCenterData?.today_overview?.high_risk_students ?? 0}
              </span>
              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${commandCenterData?.today_overview?.high_risk_students > 0 ? "bg-red-500/10 text-red-500 animate-bounce" : "bg-emerald-500/10 text-emerald-500"}`}>
                {commandCenterData?.today_overview?.high_risk_students > 0 ? "Alert" : "Safe"}
              </span>
            </div>
          </div>

          {/* Upcoming Remedials (Clickable) */}
          <div
            onClick={() => navigate('/faculty/remedial')}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-855 p-4 rounded-2xl shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col justify-between group"
          >
            <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Remedials</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{commandCenterData?.today_overview?.upcoming_remedials ?? 0}</span>
              <span className="text-[8px] font-bold text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded">Active</span>
            </div>
          </div>

          {/* Alerts (Static) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-2xl shadow-sm h-full flex flex-col justify-between">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider">Alerts</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{commandCenterData?.today_overview?.unread_notifications ?? 0}</span>
              <span className="text-[8px] font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded">Inbox</span>
            </div>
          </div>

          {/* Unread Announcements (Clickable) */}
          <div
            onClick={() => navigate('/faculty/announcements')}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-855 p-4 rounded-2xl shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col justify-between group"
          >
            <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Broadcasts</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{commandCenterData?.today_overview?.unread_announcements ?? 0}</span>
              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${commandCenterData?.today_overview?.unread_announcements > 0 ? "bg-purple-500/10 text-purple-500" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                {commandCenterData?.today_overview?.unread_announcements > 0 ? "New" : "Read"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Faculty Workspace */}
      <div className="space-y-2">
        <span className="text-[10px] font-extrabold tracking-widest uppercase text-slate-400 dark:text-slate-500 block">
          Faculty Workspace
        </span>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-4">
            {/* My Action Items (Large Card, p-6) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-slate-855 dark:text-white text-base flex items-center gap-2">
                    <ClipboardCheck size={20} className="text-purple-600" />
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
                          <h4 className="font-bold text-xs sm:text-sm text-slate-855 dark:text-slate-100">
                            {task.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-405 text-left">
                            {task.description}
                          </p>
                        </div>

                        <button
                          onClick={() => navigate(task.route)}
                          className="self-start sm:self-center px-4.5 py-2.5 bg-slate-950 hover:bg-purple-650 dark:bg-slate-800 dark:hover:bg-purple-650 text-white font-extrabold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm group shrink-0 hover:scale-[1.02] duration-200"
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

            {/* Lecture Attendance Trend (Small Card, p-5) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 space-y-4">
              <div className="flex justify-between items-baseline">
                <h3 className="font-extrabold text-slate-855 dark:text-white text-sm flex items-center gap-1.5">
                  <TrendingUp size={18} className="text-purple-600" />
                  Lecture Attendance Trend
                </h3>
                <div className="text-right">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-450 block">Average Attendance: {avgAttendance}%</span>
                  <span className="text-[10px] text-slate-450 dark:text-slate-500 block font-medium">Last 6 Lectures</span>
                </div>
              </div>

              <div className="h-44">
                {attendanceChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={attendanceChartData}>
                      <defs>
                        <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        vertical={false}
                        strokeDasharray="2 2"
                        opacity={0.08}
                      />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '11px' }} />
                      <Area type="monotone" dataKey="Attendance %" stroke="#a855f7" fillOpacity={1} fill="url(#colorAtt)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                    No attendance logs found to render trend line.
                  </div>
                )}
              </div>
            </div>

            {/* Students At Academic Risk (Small Card, p-5) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-855 dark:text-white text-base flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-500" />
                  Students At Academic Risk
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Immediate intervention recommended</p>
              </div>

              <div className="space-y-3.5 max-h-[320px] overflow-y-auto pr-1">
                {atRiskStudents.map(student => (
                  <div
                    key={student.student_id}
                    onClick={() => navigate("/faculty/performance")}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/10 hover:border-purple-500/30 transition-all cursor-pointer group"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-xs block text-slate-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{student.full_name}</span>
                      <div className="text-[10px] text-slate-400 font-medium space-x-2">
                        <span>Roll: <span className="font-mono">{student.roll_no}</span></span>
                        <span>•</span>
                        <span>Attendance: <span className="font-semibold text-slate-600 dark:text-slate-300">{student.attendance}%</span></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                        student.risk_level === "High" 
                          ? "bg-rose-500/10 text-rose-500 border-rose-500/20" 
                          : "bg-amber-500/10 text-amber-505 border-amber-500/20"
                      }`}>
                        {student.risk_level} RISK
                      </span>
                      <span className="text-[10px] font-black text-purple-600 dark:text-purple-450 flex items-center gap-0.5">
                        Monitor →
                      </span>
                    </div>
                  </div>
                ))}
                {atRiskStudents.length === 0 && (
                  <div className="flex flex-col items-center justify-center text-center p-6 bg-emerald-50/10 dark:bg-emerald-950/5 border border-dashed border-emerald-500/20 rounded-2xl space-y-1.5">
                    <span className="text-2xl">🟢</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      No students currently require intervention.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (1/3 width) */}
          <div className="space-y-4">
            {/* Faculty Hub Notices (Large Card, p-6) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 space-y-4 group">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-slate-850 dark:text-white text-sm flex items-center gap-2">
                    <Bell size={18} className="text-purple-650" />
                    Faculty Hub Notices
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Important broadcasts & updates</p>
                </div>
                {commandCenterData?.today_overview?.unread_announcements > 0 && (
                  <span className="text-[9px] font-black text-white bg-purple-655 px-2.5 py-0.5 rounded-full">
                    {commandCenterData.today_overview.unread_announcements} New
                  </span>
                )}
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {dashboardAnnouncements.length > 0 ? (
                  dashboardAnnouncements.map((ann) => {
                    const pr = priorityConfig[ann.priority] || priorityConfig.Normal;
                    return (
                      <div
                        key={ann.announcement_id}
                        onClick={() => navigate("/faculty/announcements")}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${!ann.is_read
                          ? "border-purple-500/25 bg-purple-50/15 dark:bg-purple-950/10"
                          : "border-slate-100 dark:border-slate-855 bg-slate-50/20 dark:bg-slate-900/10"
                          }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-xs text-slate-855 dark:text-slate-202 line-clamp-1">
                            {ann.title}
                          </h4>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${pr.color} shrink-0`}>
                            {ann.priority}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed text-left">
                          {ann.description}
                        </p>
                        <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-855/50 text-[9px] text-slate-400">
                          <span className="font-semibold">By {ann.sender_name || "Admin"}</span>
                          <span>{fmtDate(ann.created_at)}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-6 bg-slate-50/40 dark:bg-slate-950/10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-1.5">
                    <span className="text-2xl">📢</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      No announcements available.
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate("/faculty/announcements")}
                className="w-full py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-purple-655 dark:text-purple-450 font-black rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 group/btn hover:scale-[1.02] duration-200"
              >
                <span>View All Notices</span>
                <ArrowRight size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Upcoming Remedial Sessions (Small Card, p-5) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-850 dark:text-white text-sm flex items-center gap-2">
                  <GraduationCap size={18} className="text-purple-655" />
                  Upcoming Remedial Sessions
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Next 3 support targets</p>
              </div>

              <div className="space-y-3">
                {upcomingRemedials.length > 0 ? (
                  upcomingRemedials.map((session) => (
                    <div
                      key={session.session_id}
                      onClick={() => navigate("/faculty/remedial")}
                      className="p-3.5 rounded-xl border border-slate-150 dark:border-slate-855 bg-slate-50/40 dark:bg-slate-950/20 hover:border-purple-500/25 transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-xs text-slate-850 dark:text-slate-200 line-clamp-1">
                          {session.topic}
                        </h4>
                        <span className="text-[8px] font-black text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded shrink-0">
                          {session.subject_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-850/50 text-[9px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {session.session_date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {session.session_time}
                        </span>
                        {session.location && (
                          <span className="flex items-center gap-1 line-clamp-1 max-w-[100px]">
                            <MapPin size={10} />
                            {session.location}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-6 bg-slate-50/40 dark:bg-slate-950/10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-1.5">
                    <span className="text-2xl">🎓</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      No remedial sessions scheduled.
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate("/faculty/remedial")}
                className="w-full py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-purple-655 dark:text-purple-450 font-black rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 group/btn hover:scale-[1.02] duration-200"
              >
                <span>View All Sessions</span>
                <ArrowRight size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Smart Insights (Small Card, p-5, No scrolling, max 3) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-850 dark:text-white text-base flex items-center gap-2">
                  <Shield size={20} className="text-purple-600" />
                  Smart Insights
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Rule-based analytical alerts</p>
              </div>

              <div className="space-y-3">
                {sortedInsights.length > 0 ? (
                  sortedInsights.map((insight, idx) => {
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
                        className={`p-3 rounded-xl border ${badgeColor} space-y-1 hover:translate-x-0.5 transition-transform duration-200`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs shrink-0">{iconText}</span>
                          <h4 className="font-extrabold text-[10px] uppercase tracking-wider">
                            {insight.title}
                          </h4>
                        </div>
                        <p className="text-[11px] font-semibold opacity-90 leading-relaxed text-left">
                          {insight.description}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                    Gathering telemetry to compute insights...
                  </div>
                )}
              </div>
            </div>

            {/* Quick Operations (Small Card, p-5) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-850 dark:text-white text-base">Quick Operations</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Frequent administrative actions</p>
              </div>

              <div className="flex flex-col space-y-2.5">
                {/* Primary Filled Purple Button */}
                <button
                  onClick={() => navigate("/faculty/attendance")}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-xl text-xs transition-all shadow cursor-pointer text-left pl-4 flex items-center gap-2 hover:-translate-y-0.5 duration-300"
                >
                  <Calendar size={14} />
                  Record Attendance
                </button>
                {/* Secondary Outlined Buttons */}
                <button
                  onClick={() => navigate("/faculty/assignments")}
                  className="w-full py-3 bg-transparent hover:bg-purple-50/10 dark:hover:bg-purple-950/10 border border-slate-200 dark:border-slate-800 hover:border-purple-500/30 text-slate-700 dark:text-slate-300 font-extrabold rounded-xl text-xs transition-all cursor-pointer text-left pl-4 flex items-center gap-2 hover:-translate-y-0.5 duration-300"
                >
                  <Plus size={14} />
                  Create Assignment
                </button>
                <button
                  onClick={() => navigate("/faculty/gradebook")}
                  className="w-full py-3 bg-transparent hover:bg-purple-50/10 dark:hover:bg-purple-950/10 border border-slate-200 dark:border-slate-800 hover:border-purple-500/30 text-slate-700 dark:text-slate-300 font-extrabold rounded-xl text-xs transition-all cursor-pointer text-left pl-4 flex items-center gap-2 hover:-translate-y-0.5 duration-300"
                >
                  <ClipboardCheck size={14} />
                  Gradebook
                </button>
                <button
                  onClick={() => navigate("/faculty/remedial")}
                  className="w-full py-3 bg-transparent hover:bg-purple-50/10 dark:hover:bg-purple-950/10 border border-slate-200 dark:border-slate-800 hover:border-purple-500/30 text-slate-700 dark:text-slate-300 font-extrabold rounded-xl text-xs transition-all cursor-pointer text-left pl-4 flex items-center gap-2 hover:-translate-y-0.5 duration-300"
                >
                  <GraduationCap size={14} />
                  Schedule Remedial
                </button>
                <button
                  onClick={handleRunRiskEngine}
                  className="w-full py-3 bg-transparent hover:bg-red-50/10 dark:hover:bg-red-950/10 border border-slate-200 dark:border-slate-800 hover:border-red-500/30 text-red-600 dark:text-red-400 font-extrabold rounded-xl text-xs transition-all cursor-pointer text-left pl-4 flex items-center gap-2 hover:-translate-y-0.5 duration-300"
                >
                  <AlertTriangle size={14} />
                  Student Risk Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monitoring & Analytics Section Label & 2-Column Bottom Grid */}
      <div className="space-y-2">
        <span className="text-[10px] font-extrabold tracking-widest uppercase text-slate-400 dark:text-slate-500 block">
          Monitoring & Analytics
        </span>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Assignments Widget (Large Card, p-6) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-855 dark:text-white text-sm flex items-center gap-2">
                <ClipboardCheck size={18} className="text-purple-655" />
                Recent Assignments
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Submission tracking & status</p>
            </div>

            <div className="space-y-3.5 max-h-[320px] overflow-y-auto pr-1">
              {assignments.length > 0 ? (
                assignments.map(a => {
                  const total = a.total_count || 0;
                  const submitted = a.submitted_count || 0;
                  const pending = total - submitted;
                  const pct = total > 0 ? Math.round((submitted / total) * 100) : 0;

                  let statusBadge = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
                  if (a.status === "Draft") statusBadge = "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
                  else if (a.status === "Closed") statusBadge = "bg-rose-500/10 text-rose-605 dark:text-rose-400 border-rose-500/20";

                  return (
                    <div
                      key={a.assignment_id}
                      onClick={() => navigate("/faculty/assignments")}
                      className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850 hover:border-purple-500/35 transition-all cursor-pointer space-y-2.5 bg-slate-50/20 dark:bg-slate-950/10 group"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-xs text-slate-855 dark:text-slate-200 line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{a.title}</span>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${statusBadge} shrink-0`}>
                          {a.status || "Published"}
                        </span>
                      </div>

                      {a.status !== "Draft" && (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[9px] text-slate-400 font-extrabold">
                            <span>{submitted} / {total} Submitted</span>
                            <span className="text-amber-600 dark:text-amber-450">{pending} Pending</span>
                            <span className="text-purple-650 dark:text-purple-400">{pct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-855 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-[9px] text-slate-400 pt-1 border-t border-slate-100/50 dark:border-slate-850/50">
                        <span>Due: {a.due_date}</span>
                        <span className="font-black text-purple-605 hover:text-purple-500 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-all">
                          Manage →
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 bg-slate-50/40 dark:bg-slate-950/10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-1.5">
                  <span className="text-2xl">📚</span>
                  <p className="text-xs text-slate-550 dark:text-slate-450 font-semibold">
                    No assignments created yet.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Compact Recent Activity Feed Widget (Large Card, p-6) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-slate-855 dark:text-white text-sm flex items-center gap-1.5">
                    <Activity size={18} className="text-purple-600" />
                    Recent Activity
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Your recent portal actions</p>
                </div>
              </div>

              <div className="space-y-4">
                {activities.length > 0 ? (
                  activities.slice(0, 5).map(act => {
                    const Icon = getActivityIcon(act.module);
                    const colorClass = getActivityColor(act.module);
                    return (
                      <div key={act.activity_id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                        <div className={`p-2 rounded-lg shrink-0 ${colorClass}`}>
                          <Icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-750 dark:text-slate-200 truncate">
                            {act.action}
                          </p>
                          <p className="text-[10px] text-slate-405 truncate mt-0.5">
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
                  <div className="flex flex-col items-center justify-center text-center p-6 bg-slate-50/40 dark:bg-slate-950/10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-1.5">
                    <span className="text-2xl">⚡</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      No recent activity found.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {activities.length > 0 && (
              <button
                onClick={() => navigate("/faculty/activity")}
                className="mt-2 w-full py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-purple-600 dark:text-purple-400 font-black rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 group hover:scale-[1.02] duration-200"
              >
                <span>View Activity Log</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FacultyDashboard;
