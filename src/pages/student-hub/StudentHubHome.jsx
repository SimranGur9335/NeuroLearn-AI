import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  ClipboardList,
  UserCheck,
  Trophy,
  Bell,
  Calendar,
  Activity,
  ArrowRight,
  GraduationCap,
  Brain,
  BookMarked,
  Code,
  FileText,
  ClipboardCheck,
  CalendarCheck,
  Award
} from 'lucide-react';
import { apiFetch } from '../../services/api';
import { useStudent } from '../../context/StudentContext';
import { THEME_COLOR_MAP } from '../../components/StudentHubTheme';
import StudentHubCard from '../../components/StudentHubCard';
import SummaryMetricCard from '../../components/SummaryMetricCard';

const getActivityIcon = (type) => {
  const t = (type || '').toLowerCase();
  switch (t) {
    case 'assignment':
      return FileText;
    case 'quiz':
      return ClipboardCheck;
    case 'attendance':
      return CalendarCheck;
    case 'achievement':
    case 'grade':
      return Trophy;
    case 'course':
      return BookOpen;
    case 'certificate':
      return Award;
    case 'announcement':
      return Bell;
    default:
      return Activity;
  }
};

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) {
    return 'Just now';
  } else if (diffMin < 60) {
    return `${diffMin}m ago`;
  } else if (diffHr < 24) {
    return `${diffHr}h ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
  }
};

const StudentHubHome = () => {
  const navigate = useNavigate();
  const { profile } = useStudent();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    courses_count: 0,
    pending_assignments: 0,
    unread_announcements: 0,
    attendance_pct: 0.0,
    cgpa: 0.0,
    activities: []
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await apiFetch('/student-hub/dashboard-summary')
        if (!res.ok) {
          throw new Error('Failed to load operations data');
        }
        const summaryData = await res.json();
        setData(summaryData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const cards = [
    {
      id: 'courses',
      title: 'My Enrolled Courses',
      description: 'View subject credits, semester details, and assigned faculty profiles.',
      icon: BookOpen,
      badge: `${data.courses_count} Active`,
      path: '/student-hub/courses'
    },
    {
      id: 'notes',
      title: 'College Notes Repository',
      description: 'Browse, filter, and download semester-wise lecture notes & problem sheets.',
      icon: BookMarked,
      badge: 'Syllabus Notes',
      path: '/student-hub/notes'
    },
    {
      id: 'programming',
      title: 'Developer Programming Hub',
      description: 'Track DSA problems, practice languages, and check progress benchmarks.',
      icon: Code,
      badge: 'Code Practice',
      path: '/student-hub/programming'
    },
    {
      id: 'assignments',
      title: 'Assignments & Submissions',
      description: 'Check deadlines, submit files securely, and review feedback.',
      icon: ClipboardList,
      badge: data.pending_assignments > 0 ? `${data.pending_assignments} Due` : 'All Done',
      path: '/student-hub/assignments'
    },
    {
      id: 'attendance',
      title: 'Attendance History',
      description: 'Monitor overall presence, subject percentages, and date-wise trends.',
      icon: UserCheck,
      badge: `${data.attendance_pct}%`,
      path: '/student-hub/attendance'
    },
    {
      id: 'grades',
      title: 'Grades & Results',
      description: 'Analyze subject-wise internal marks, practical marks, and letter grades.',
      icon: Trophy,
      badge: `CGPA: ${data.cgpa}`,
      path: '/student-hub/grades'
    },
    {
      id: 'predictions',
      title: 'Performance Predictions',
      description: 'Calculate projected performance targets and model grades based on study parameters.',
      icon: Brain,
      badge: 'Forecast',
      path: '/student-hub/predictions'
    },
    {
      id: 'announcements',
      title: 'Announcements Bulletin',
      description: 'Read institutional alerts, class updates, and notices.',
      icon: Bell,
      badge: data.unread_announcements > 0 ? `${data.unread_announcements} New` : 'Read',
      path: '/student-hub/announcements'
    },
    {
      id: 'calendar',
      title: 'Academic Calendar',
      description: 'Keep track of college holidays, exam periods, and assignment deadlines.',
      icon: Calendar,
      badge: 'Calendar',
      path: '/student-hub/calendar'
    },

  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className={`w-10 h-10 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin`} />
        <span className="text-slate-400 text-sm font-semibold animate-pulse">Loading Student Hub...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl max-w-xl mx-auto mt-12 text-center space-y-4">
        <h2 className="text-red-400 font-extrabold text-lg">Failed to Connect to Hub</h2>
        <p className="text-slate-300 text-sm leading-relaxed">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-xl transition-all text-xs"
        >
          Try Reloading Page
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* College banner and intro */}
      <div className={`bg-gradient-to-r ${theme.gradient} border ${theme.border} p-6 rounded-3xl relative overflow-hidden shadow-xl text-white`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className={`text-xs ${theme.text} font-bold uppercase tracking-wider ${theme.bg} px-3 py-1 rounded-full border ${theme.border}`}>
              {profile.college || 'NeuroLearn Operations'}
            </span>
            <h1 className="text-2xl md:text-3xl font-black mt-3">
              Academic Operations Center
            </h1>
            <p className="text-white/80 text-sm max-w-2xl leading-relaxed">
              Welcome to your centralized student control deck. Access your course information, upload pending assignments, and review grades synced from the faculty records.
            </p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 border border-white/20 shadow-md">
            <GraduationCap className={theme.text} size={36} strokeWidth={2.2} />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryMetricCard
          title="Overall Attendance"
          value={`${data.attendance_pct}%`}
          subtext="Minimum target: 75.00%"
          icon={UserCheck}
        />
        <SummaryMetricCard
          title="Predicted CGPA"
          value={data.cgpa.toFixed(2)}
          subtext="Based on last performance"
          icon={Trophy}
        />
        <SummaryMetricCard
          title="Pending Submissions"
          value={data.pending_assignments}
          subtext="Action required soon"
          icon={ClipboardList}
        />
        <SummaryMetricCard
          title="Unread Notices"
          value={data.unread_announcements}
          subtext="Announcements bulletin"
          icon={Bell}
        />
      </div>

      {/* Main Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Operations Dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <StudentHubCard
              key={card.id}
              title={card.title}
              description={card.description}
              badge={card.badge}
              icon={card.icon}
              onClick={() => navigate(card.path)}
            />
          ))}
        </div>
      </div>

      {/* Academic Activity Feed */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className={theme.text} size={20} />
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Academic Activity Feed</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track your latest academic progress and achievements.
          </p>
        </div>

        {data.activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <span className="text-4xl mb-3" role="img" aria-label="books">📚</span>
            <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">
              No academic activity yet.
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Complete assignments, quizzes and lectures to build your learning timeline.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {data.activities.map((act, idx) => {
              const Icon = getActivityIcon(act.type);
              return (
                <div
                  key={idx}
                  className="group relative flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-500/30 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`p-3 rounded-xl ${theme.bg} ${theme.text} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {act.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                        {act.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      {formatRelativeTime(act.timestamp)}
                    </span>
                    <ArrowRight size={16} className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHubHome;
