import React, { useState } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Cpu, 
  ChevronRight,
  Clock,
  Sparkles,
  GraduationCap,
  Layers,
  ArrowRight
} from 'lucide-react';
import ChatSearch from './ChatSearch';

const MentorSidebar = ({
  sessions = [],
  activeSessionId,
  onSelectSession,
  onCreateNewChat,
  onRenameSession,
  onDeleteSession,
  isOpen,
  onClose,
  theme,
  mentorInsights = null
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // Filter sessions by search query
  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group sessions by date
  const groupSessionsByDate = (sessionList) => {
    const groups = {
      today: [],
      yesterday: [],
      previous: []
    };

    const now = new Date();
    const todayStr = now.toDateString();
    
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    sessionList.forEach(session => {
      const date = new Date(session.updated_at || session.created_at);
      const dateStr = date.toDateString();

      if (dateStr === todayStr) {
        groups.today.push(session);
      } else if (dateStr === yesterdayStr) {
        groups.yesterday.push(session);
      } else {
        groups.previous.push(session);
      }
    });

    return groups;
  };

  const grouped = groupSessionsByDate(filteredSessions);

  const startRename = (e, session) => {
    e.stopPropagation();
    setEditingId(session.session_id);
    setEditTitle(session.title);
  };

  const handleRenameSubmit = (sessionId) => {
    if (editTitle.trim() && editTitle.trim() !== '') {
      onRenameSession(sessionId, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e, sessionId) => {
    if (e.key === 'Enter') {
      handleRenameSubmit(sessionId);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const handleDelete = (e, sessionId) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this chat session?")) {
      onDeleteSession(sessionId);
    }
  };

  const renderSessionItem = (session) => {
    const isActive = session.session_id === activeSessionId;
    const isEditing = session.session_id === editingId;

    return (
      <div
        key={session.session_id}
        onClick={() => !isEditing && onSelectSession(session.session_id)}
        className={`p-3 rounded-xl border transition-all duration-150 flex items-center justify-between group cursor-pointer ${
          isActive
            ? `${theme.bg} ${theme.border} border-indigo-500/30 text-indigo-900 dark:text-indigo-200 font-extrabold shadow-sm`
            : 'border-slate-100/10 dark:border-slate-850/10 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-650 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <MessageSquare size={13} className={isActive ? theme.text : 'text-slate-400 shrink-0'} />
          
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => handleRenameSubmit(session.session_id)}
              onKeyDown={(e) => handleKeyDown(e, session.session_id)}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white dark:bg-slate-950 border border-slate-350 dark:border-slate-800 rounded px-1.5 py-0.5 text-xs text-slate-850 dark:text-white focus:outline-none"
              autoFocus
            />
          ) : (
            <span className="text-[11.5px] truncate font-medium pr-1 select-none">
              {session.title}
            </span>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={(e) => startRename(e, session)}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 rounded transition-colors"
              title="Rename session"
            >
              <Edit2 size={11} />
            </button>
            <button
              onClick={(e) => handleDelete(e, session.session_id)}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-650 dark:hover:text-red-400 rounded transition-colors"
              title="Delete session"
            >
              <Trash2 size={11} />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderSection = (title, list) => {
    if (list.length === 0) return null;
    return (
      <div className="space-y-1.5">
        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider block px-1">
          {title}
        </span>
        <div className="space-y-1">
          {list.map(renderSessionItem)}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <div className={`
        fixed top-0 bottom-0 left-0 z-40 w-72 bg-white dark:bg-slate-905 border-r border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between space-y-6 transition-transform duration-300 lg:static lg:translate-x-0 lg:z-0 lg:h-full lg:rounded-3xl lg:border lg:shadow-xs shrink-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:flex'}
      `}>
        <div className="space-y-5 flex flex-col min-h-0 flex-1">
          {/* Header & New Chat button */}
          <div className="space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-xs text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={14} className="text-indigo-500" />
                Mentor Archives
              </h3>
              {isOpen && (
                <button
                  onClick={onClose}
                  className="lg:hidden text-slate-400 hover:text-slate-650 p-1"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button
              onClick={() => {
                onCreateNewChat();
                if (isOpen) onClose();
              }}
              className={`w-full py-2.5 rounded-xl border border-dashed border-indigo-500/40 hover:border-indigo-500 ${theme.bg} ${theme.text} hover:shadow-sm font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer`}
            >
              <Plus size={14} /> New Mentorship Chat
            </button>
          </div>

          {/* Search Box */}
          <div className="shrink-0">
            <ChatSearch value={searchQuery} onChange={setSearchQuery} />
          </div>

          {/* Session History List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-thin">
            {filteredSessions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
                {searchQuery ? "No matching archives found" : "No mentorship records"}
              </div>
            ) : (
              <>
                {renderSection("Today", grouped.today)}
                {renderSection("Yesterday", grouped.yesterday)}
                {renderSection("Previous Chats", grouped.previous)}
              </>
            )}

            {/* AI Insights & Recommendations */}
            {mentorInsights && (
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h3 className="font-extrabold text-slate-800 dark:text-white text-xs flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles size={14} className="text-indigo-500 animate-pulse" />
                  AI Learning Suggestions
                </h3>

                {mentorInsights.quizzes && mentorInsights.quizzes.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[9px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider block">Quiz Suggestions</span>
                    {mentorInsights.quizzes.map((quiz, i) => (
                      <a
                        key={i}
                        href={quiz.url}
                        className="p-2.5 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 hover:border-emerald-500/20 rounded-xl text-[11px] font-bold text-emerald-605 dark:text-emerald-400 flex items-center justify-between transition-all"
                      >
                        <span className="flex items-center gap-1">
                          <GraduationCap size={12} />
                          {quiz.title}
                        </span>
                        <ArrowRight size={12} />
                      </a>
                    ))}
                  </div>
                )}

                {mentorInsights.career && mentorInsights.career.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[9px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider block">Career Alignment</span>
                    {mentorInsights.career.map((car, i) => (
                      <a
                        key={i}
                        href={car.url}
                        className="p-2.5 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 hover:border-indigo-500/20 rounded-xl text-[11px] font-bold text-indigo-650 dark:text-indigo-400 flex items-center justify-between transition-all"
                      >
                        <span className="flex items-center gap-1">
                          <Layers size={12} />
                          {car.title}
                        </span>
                        <ArrowRight size={12} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom context memory widget */}
        <div className="bg-slate-50 dark:bg-slate-950/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-2 text-[10px] text-slate-500 leading-relaxed shrink-0">
          <Cpu size={14} className="text-indigo-500 shrink-0 mt-0.5" />
          <span>Equipped with learning wellness logs & academic performance vectors.</span>
        </div>
      </div>
    </>
  );
};

export default MentorSidebar;
