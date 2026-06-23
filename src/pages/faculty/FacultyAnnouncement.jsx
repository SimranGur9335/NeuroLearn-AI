import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Send, Plus, Megaphone, AlertTriangle, Info,
  CheckCircle, XCircle, Loader2, Paperclip, Eye,
  ChevronRight, Calendar, Users, BookOpen, Inbox,
  RefreshCw, Download, X
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

/* ── helpers ── */
const priorityConfig = {
  Urgent:    { color: "bg-red-500/10 text-red-500 border-red-500/20",    dot: "bg-red-500" },
  Important: { color: "bg-amber-500/10 text-amber-500 border-amber-500/20", dot: "bg-amber-500" },
  Normal:    { color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", dot: "bg-emerald-500" },
};

const fmtDate = (d) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return d; }
};

const fmtWeekAgo = () => {
  const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString();
};

const Toast = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const cfg = { success: "bg-emerald-600", error: "bg-red-600", info: "bg-blue-600" };
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl text-white text-sm font-semibold shadow-2xl ${cfg[type] || cfg.info}`}>
      {type === "success" && <CheckCircle size={16} />}
      {type === "error"   && <XCircle size={16} />}
      {type === "info"    && <Info size={16} />}
      {msg}
      <button onClick={onClose}><X size={14} /></button>
    </motion.div>
  );
};

const SkeletonCard = () => (
  <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-2 animate-pulse">
    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-full" />
    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
  </div>
);

const EmptyState = ({ icon: Icon, title, sub }) => (
  <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
    <Icon size={40} className="opacity-30" />
    <p className="font-bold text-sm">{title}</p>
    {sub && <p className="text-xs text-slate-400">{sub}</p>}
  </div>
);

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
const FacultyAnnouncements = () => {
  const { user } = useAuth();
  const facultyId = user?.faculty_id;

  /* ── tabs ── */
  const [activeTab, setActiveTab] = useState("received");

  /* ── data ── */
  const [received,   setReceived]   = useState([]);
  const [sent,       setSent]       = useState([]);
  const [classes,    setClasses]    = useState([]);

  /* ── ui state ── */
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast,      setToast]      = useState(null);

  /* ── compose form ── */
  const [title,       setTitle]       = useState("");
  const [message,     setMessage]     = useState("");
  const [priority,    setPriority]    = useState("Normal");
  const [targetType,  setTargetType]  = useState("Class");
  const [selectedClass, setSelectedClass] = useState("");
  const [attachment,  setAttachment]  = useState(null);

  const showToast = useCallback((msg, type = "info") => setToast({ msg, type }), []);

  /* ── fetch announcements ── */
  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements");
      if (!res.ok) {
        if (res.status === 401) { showToast("Session expired — please log in again.", "error"); }
        else { showToast(`Failed to load announcements (${res.status})`, "error"); }
        setReceived([]); setSent([]);
        return;
      }
      const data = await res.json();
      if (!Array.isArray(data)) { setReceived([]); setSent([]); return; }

      const weekAgo = fmtWeekAgo();
      setReceived(data.filter(a => a.sender_type !== "faculty" || a.sender_id !== facultyId));
      setSent(data.filter(a => a.sender_type === "faculty" && a.sender_id === facultyId));
    } catch (err) {
      console.error("Announcements fetch error:", err);
      showToast("Network error loading announcements.", "error");
      setReceived([]); setSent([]);
    } finally {
      setLoading(false);
    }
  }, [facultyId, showToast]);

  /* ── fetch classes ── */
  const loadClasses = useCallback(async () => {
    if (!facultyId) return;
    try {
      const res = await fetch(`/faculty/${facultyId}/classes`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setClasses(data);
    } catch (err) {
      console.error("Classes fetch error:", err);
    }
  }, [facultyId]);

  useEffect(() => {
    loadAnnouncements();
    loadClasses();
  }, [loadAnnouncements, loadClasses]);

  /* ── mark as read ── */
  const handleMarkRead = async (id) => {
    try {
      const res = await fetch(`/api/announcements/${id}/read`, { method: "POST" });
      if (res.ok) {
        setReceived(prev => prev.map(a => a.announcement_id === id ? { ...a, is_read: true } : a));
      }
    } catch (err) { console.error("Mark read error:", err); }
  };

  /* ── publish announcement ── */
  const handlePublish = async () => {
    if (!title.trim()) { showToast("Title is required.", "error"); return; }
    if (!message.trim()) { showToast("Message body is required.", "error"); return; }
    if (targetType === "Class" && !selectedClass) { showToast("Please select a target class.", "error"); return; }

    setSubmitting(true);
    try {
      const body = {
        title: title.trim(),
        description: message.trim(),
        target_type: targetType,
        target_id: targetType === "Class" ? Number(selectedClass) : null,
        priority,
      };

      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.detail || `Error ${res.status}`, "error");
        return;
      }

      showToast("Announcement published successfully!", "success");
      setTitle(""); setMessage(""); setPriority("Normal");
      setSelectedClass(""); setAttachment(null);
      setActiveTab("sent");
      await loadAnnouncements();
    } catch (err) {
      console.error("Publish error:", err);
      showToast("Failed to publish announcement.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── derived stats ── */
  const weekAgoDate = new Date(); weekAgoDate.setDate(weekAgoDate.getDate() - 7);
  const unreadCount   = received.filter(a => !a.is_read).length;
  const thisWeekCount = [...received, ...sent].filter(a => new Date(a.created_at) >= weekAgoDate).length;

  const tabs = [
    { id: "received", label: "Received", icon: Inbox,    count: received.length },
    { id: "sent",     label: "Sent",     icon: Send,     count: sent.length },
    { id: "compose",  label: "Compose",  icon: Plus,     count: null },
  ];

  /* ════════════════════════ RENDER ════════════════════════ */
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }} className="space-y-6 font-sans">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-[10px] text-purple-500 font-black uppercase tracking-widest mb-1">
            Communication Center
          </p>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">
            Faculty Announcements
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Manage notices and broadcast messages to your classes.
          </p>
        </div>
        <button onClick={loadAnnouncements} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Received",   value: received.length, icon: Inbox,    color: "text-blue-500",   bg: "bg-blue-500/10" },
          { label: "Sent",       value: sent.length,     icon: Send,     color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Unread",     value: unreadCount,     icon: Bell,     color: "text-amber-500",  bg: "bg-amber-500/10" },
          { label: "This Week",  value: thisWeekCount,   icon: Calendar, color: "text-emerald-500",bg: "bg-emerald-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</p>
              <span className={`p-1.5 rounded-lg ${bg}`}><Icon size={14} className={color} /></span>
            </div>
            <p className={`text-3xl font-black ${color}`}>
              {loading ? <span className="text-slate-300 dark:text-slate-700">—</span> : value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all border ${
              activeTab === id
                ? "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/20"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
            }`}>
            <Icon size={13} />
            {label}
            {count !== null && (
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                activeTab === id ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800"
              }`}>{count}</span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ══════════ RECEIVED TAB ══════════ */}
        {activeTab === "received" && (
          <motion.div key="received" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-black text-slate-800 dark:text-white text-sm">Received Notices</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">
                  From admin and institution
                </p>
              </div>
              {unreadCount > 0 && (
                <span className="bg-purple-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="space-y-3">
              {loading ? (
                [1,2,3].map(i => <SkeletonCard key={i} />)
              ) : received.length === 0 ? (
                <EmptyState icon={Inbox} title="No announcements received yet"
                  sub="Admin notices and institution-wide broadcasts will appear here." />
              ) : received.map(ann => {
                const pr = priorityConfig[ann.priority] || priorityConfig.Normal;
                return (
                  <motion.div key={ann.announcement_id} layout
                    onClick={() => !ann.is_read && handleMarkRead(ann.announcement_id)}
                    className={`border rounded-2xl p-4 transition-all cursor-pointer group relative overflow-hidden ${
                      !ann.is_read
                        ? "border-purple-500/30 bg-purple-50/40 dark:bg-purple-950/20 hover:bg-purple-50/60"
                        : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}>
                    {!ann.is_read && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-purple-500 rounded-full" />
                    )}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0 mt-0.5">
                        <Megaphone size={14} className="text-purple-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <h4 className="font-black text-slate-800 dark:text-white text-sm">{ann.title}</h4>
                          <div className="flex items-center gap-2 shrink-0">
                            {!ann.is_read && (
                              <span className="bg-purple-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">New</span>
                            )}
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${pr.color}`}>
                              {ann.priority || "Normal"}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                          {ann.description}
                        </p>
                        {ann.attachment_url && (
                          <a href={ann.attachment_url} target="_blank" rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors">
                            <Download size={11} /> {ann.attachment_name || "Download Attachment"}
                          </a>
                        )}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Users size={10} />
                            {ann.sender_name || "System"}
                            <span className="opacity-50">·</span>
                            Target: {ann.target_type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={10} /> {fmtDate(ann.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ══════════ SENT TAB ══════════ */}
        {activeTab === "sent" && (
          <motion.div key="sent" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
            <div className="mb-5">
              <h3 className="font-black text-slate-800 dark:text-white text-sm">Sent Announcements</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">
                Broadcasts you have published
              </p>
            </div>
            <div className="space-y-3">
              {loading ? (
                [1,2].map(i => <SkeletonCard key={i} />)
              ) : sent.length === 0 ? (
                <EmptyState icon={Send} title="No announcements sent yet"
                  sub='Use the "Compose" tab to broadcast a message to your class.' />
              ) : sent.map(ann => {
                const pr = priorityConfig[ann.priority] || priorityConfig.Normal;
                return (
                  <div key={ann.announcement_id}
                    className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Send size={13} className="text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <h4 className="font-black text-slate-800 dark:text-white text-sm">{ann.title}</h4>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${pr.color}`}>
                            {ann.priority || "Normal"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                          {ann.description}
                        </p>
                        {ann.attachment_url && (
                          <a href={ann.attachment_url} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors">
                            <Download size={11} /> {ann.attachment_name || "Attachment"}
                          </a>
                        )}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <BookOpen size={10} />
                            Target: {ann.target_type}
                            {ann.target_id && <span className="opacity-60">#{ann.target_id}</span>}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={10} /> {fmtDate(ann.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ══════════ COMPOSE TAB ══════════ */}
        {activeTab === "compose" && (
          <motion.div key="compose" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
            <div className="mb-6">
              <h3 className="font-black text-slate-800 dark:text-white text-sm">Compose Announcement</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">
                Broadcast a notice to your assigned classes
              </p>
            </div>

            <div className="space-y-5 max-w-2xl">
              {/* Title */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">
                  Announcement Title <span className="text-red-500">*</span>
                </label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Mid-Semester Exam Schedule Update"
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl px-4 py-3 text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition" />
              </div>

              {/* Priority */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Priority</label>
                <div className="flex gap-2 flex-wrap">
                  {["Normal", "Important", "Urgent"].map(p => {
                    const pr = priorityConfig[p];
                    return (
                      <button key={p} onClick={() => setPriority(p)}
                        className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${
                          priority === p ? pr.color + " scale-105" : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300"
                        }`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${pr.dot}`} />
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Type */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Target</label>
                <div className="flex gap-2">
                  {["Class", "Institution"].map(t => (
                    <button key={t} onClick={() => setTargetType(t)}
                      className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${
                        targetType === t
                          ? "bg-purple-600 text-white border-purple-600"
                          : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-purple-300"
                      }`}>
                      {t === "Class" ? <><BookOpen size={11} className="inline mr-1" />Specific Class</> : <><Users size={11} className="inline mr-1" />All (Institution)</>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Class selector */}
              {targetType === "Class" && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">
                    Select Class <span className="text-red-500">*</span>
                  </label>
                  <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition">
                    <option value="">Select a class…</option>
                    {classes.length === 0
                      ? <option disabled>No classes assigned — contact admin</option>
                      : classes.map(c => (
                        <option key={`${c.class_id}-${c.subject_id}`} value={c.class_id}>
                          {c.class_name} — {c.subject_name}
                        </option>
                      ))
                    }
                  </select>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">
                  Message Body <span className="text-red-500">*</span>
                </label>
                <textarea rows={5} value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Write your announcement message here…"
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl px-4 py-3 text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition resize-none" />
                <p className="text-[10px] text-slate-400 mt-1 text-right">{message.length} characters</p>
              </div>

              {/* Publish */}
              <div className="flex items-center gap-3 pt-1">
                <button onClick={handlePublish} disabled={submitting}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 text-white font-black px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-purple-500/20">
                  {submitting
                    ? <><Loader2 size={14} className="animate-spin" /> Publishing…</>
                    : <><Megaphone size={14} /> Publish Announcement</>}
                </button>
                <button onClick={() => { setTitle(""); setMessage(""); setPriority("Normal"); setSelectedClass(""); }}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold transition-colors">
                  Clear
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && <Toast key="toast" msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default FacultyAnnouncements;