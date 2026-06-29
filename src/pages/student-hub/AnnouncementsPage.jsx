import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../services/api';
import StudentHubHeader from '../../components/StudentHubHeader';
import { useStudent } from '../../context/StudentContext';
import { THEME_COLOR_MAP } from '../../components/StudentHubTheme';
import { Bell, Check, Megaphone, User, Clock } from 'lucide-react';

const AnnouncementsSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[1, 2, 3].map((n) => (
      <div key={n} className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl h-32 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-6 w-1/4 bg-slate-200 dark:bg-slate-850 rounded-md" />
          <div className="h-6 w-12 bg-slate-200 dark:bg-slate-850 rounded-md" />
        </div>
        <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-850 rounded-md" />
        <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-850 rounded-md" />
      </div>
    ))}
  </div>
);

const AnnouncementsPage = () => {
  const { profile } = useStudent();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/student-hub/announcements');
      if (!res.ok) {
        throw new Error('Failed to load announcements');
      }
      const data = await res.json();
      setAnnouncements(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleMarkAsRead = async (announcementId) => {
    try {
      const response = await apiFetch(`/announcements/${announcementId}/read`, {
        method: 'POST'
      });
      if (response.ok) {
        // Update local state directly to prevent a full reload layout shift
        setAnnouncements(prev => 
          prev.map(ann => 
            ann.announcement_id === announcementId 
              ? { ...ann, is_read: true } 
              : ann
          )
        );
      }
    } catch (err) {
      console.error("Failed to mark announcement as read:", err);
    }
  };

  return (
    <div className="space-y-6">
      <StudentHubHeader 
        title="Announcements Bulletin" 
        description="Stay updated with notices, exam scheduling details, and department alerts."
        showBackButton={true}
      />

      {loading ? (
        <AnnouncementsSkeleton />
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-650 dark:text-red-400 text-sm">
          {error}
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-2xl text-center text-slate-500 dark:text-slate-400 text-sm">
          No announcements have been published for you yet.
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div 
              key={ann.announcement_id}
              className={`bg-white dark:bg-slate-900/60 border ${ann.is_read ? 'border-slate-100 dark:border-slate-850' : `border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg` // highlighting unread
              } rounded-2xl p-6 hover:border-indigo-500/30 hover:shadow-md transition-all duration-300 relative overflow-hidden`}
            >
              {/* Subtle unread glow bar on the left */}
              {!ann.is_read && (
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme.accent}`} />
              )}
 
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] uppercase font-bold tracking-widest ${
                      ann.target_type === 'Institution' 
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : ann.target_type === 'Department'
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    } px-2.5 py-0.5 rounded-md`}>
                      {ann.target_type} Notice
                    </span>
                    {!ann.is_read && (
                      <span className={`text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded ${theme.accent} text-white`}>
                        New Alert
                      </span>
                    )}
                  </div>
 
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-snug">{ann.title}</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{ann.description}</p>
                  </div>
 
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <User size={13} />
                      Sender: {ann.sender_name} ({ann.sender_type})
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      {new Date(ann.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
 
                {/* Mark read button */}
                {!ann.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(ann.announcement_id)}
                    className={`shrink-0 self-start md:self-auto bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer`}
                  >
                    <Check size={14} />
                    <span>Acknowledge</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;
