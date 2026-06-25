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
  Brain
} from 'lucide-react';
import { apiFetch } from '../../services/api';
import { useStudent } from '../../context/StudentContext';
import { THEME_COLOR_MAP } from '../../components/StudentHubTheme';
import StudentHubCard from '../../components/StudentHubCard';
import SummaryMetricCard from '../../components/SummaryMetricCard';

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
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className={`w-10 h-10 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin`} />
        <span className="text-slate-400 text-sm font-semibold animate-pulse">Initializing academic database connection...</span>
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
            <p className="text-slate-300 text-sm mt-1 max-w-xl leading-relaxed">
              Welcome to your centralized student control deck. Access your course information, upload pending assignments, and review grades synced from the faculty records.
            </p>
          </div>
          <div className="shrink-0 flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10">
            <GraduationCap size={44} className={theme.text} />
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
        <h2 className="text-lg font-extrabold text-white">Operations Dashboard</h2>
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

      {/* Recent Activity Timeline */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Activity className={theme.text} size={20} />
          <h2 className="text-lg font-extrabold text-white">Academic Activity Stream</h2>
        </div>

        {data.activities.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm">
            No recent academic activity found. Everything is quiet!
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
            {data.activities.map((act, idx) => (
              <div key={idx} className="relative group">
                {/* Dot */}
                <div className={`absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 ${theme.border} group-hover:scale-125 transition-transform duration-200`} />

                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="text-sm font-extrabold text-white group-hover:text-slate-300 transition-colors">
                      {act.title}
                    </h4>
                    <span className="text-xs text-slate-500 font-medium">
                      {new Date(act.timestamp).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {act.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHubHome;
