import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Send, Plus, Megaphone, AlertTriangle, Info,
  CheckCircle, XCircle, Loader2, Paperclip, Eye,
  ChevronRight, Calendar, Users, BookOpen, Inbox,
  RefreshCw, Download, X, Search, MoreVertical, Edit2,
  Trash2, Filter, ArrowRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../services/api";

/* ── Helpers & Config ── */
const priorityConfig = {
  Urgent: { color: "bg-rose-500/10 text-rose-500 border-rose-500/20", dot: "bg-rose-500 text-rose-600" },
  Important: { color: "bg-amber-500/10 text-amber-500 border-amber-500/20", dot: "bg-amber-500 text-amber-600" },
  Normal: { color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", dot: "bg-emerald-500 text-emerald-600" },
};

const fmtDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return d;
  }
};

const fmtWeekAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString();
};

/* ── Shared Small Components ── */
const Toast = ({ msg, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  const cfg = { success: "bg-emerald-600", error: "bg-rose-600", info: "bg-blue-600" };
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl text-white text-sm font-semibold shadow-2xl ${cfg[type] || cfg.info}`}
    >
      {type === "success" && <CheckCircle size={16} />}
      {type === "error" && <XCircle size={16} />}
      {type === "info" && <Info size={16} />}
      <span>{msg}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80 transition-opacity"><X size={14} /></button>
    </motion.div>
  );
};

const SkeletonCard = () => (
  <div className="border border-slate-150 dark:border-slate-800/60 rounded-2xl p-5 space-y-3 bg-white dark:bg-slate-900 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" />
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
    </div>
    <div className="h-px bg-slate-100 dark:bg-slate-800" />
    <div className="flex justify-between items-center">
      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
    </div>
  </div>
);

const EmptyState = ({ icon: Icon, title, sub }) => (
  <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500 space-y-3">
    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-full">
      <Icon size={40} className="opacity-40 text-slate-500" />
    </div>
    <p className="font-extrabold text-sm text-slate-700 dark:text-slate-300">{title}</p>
    {sub && <p className="text-xs text-slate-450 dark:text-slate-400 text-center max-w-xs">{sub}</p>}
  </div>
);

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════ */
const FacultyAnnouncements = () => {
  const { user } = useAuth();
  const facultyId = user?.faculty_id;
  const userId = user?.user_id;

  const [activeTab, setActiveTab] = useState("received");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Lists and stats
  const [received, setReceived] = useState([]);
  const [sentAnnouncements, setSentAnnouncements] = useState([]);
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState({ received: 0, sent: 0, unread: 0, thisWeek: 0 });

  // Compose State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState("Class");
  const [selectedClass, setSelectedClass] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");

  // Search, Filters & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [targetFilter, setTargetFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // Interaction States
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Dropdown reference
  const menuRef = useRef(null);

  // Close context menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Fetch announcements
  const loadAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/announcements");
      if (!res.ok) throw new Error("Failed to load announcements from backend.");
      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error("Backend returned invalid data structure:", data);
        return;
      }

      // Filter: self-created vs received
      const sentList = data.filter(
        (ann) =>
          (ann.sender_type === "faculty" || ann.sender_type === "FACULTY") &&
          Number(ann.sender_id) === Number(facultyId)
      );

      const receivedList = data.filter(
        (ann) =>
          !((ann.sender_type === "faculty" || ann.sender_type === "FACULTY") &&
            Number(ann.sender_id) === Number(facultyId))
      );

      const unreadCount = receivedList.filter((a) => !a.is_read).length;
      const weekAgoStr = fmtWeekAgo();
      const thisWeekCount = receivedList.filter((a) => {
        if (!a.created_at) return false;
        return new Date(a.created_at).toISOString() >= weekAgoStr;
      }).length;

      setReceived(receivedList);
      setSentAnnouncements(sentList);
      setStats({
        received: receivedList.length,
        sent: sentList.length,
        unread: unreadCount,
        thisWeek: thisWeekCount
      });
    } catch (err) {
      console.error("Error loading announcements:", err);
      setToast({ msg: "Error fetching announcements.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [facultyId]);

  // Load initial data
  useEffect(() => {
    loadAnnouncements();
    const fetchClasses = async () => {
      if (facultyId) {
        try {
          const res = await apiFetch(`/faculty/${facultyId}/classes`);
          if (res.ok) {
            const data = await res.json();
            setClasses(data);
          }
        } catch (err) {
          console.error("Failed to load assigned classes:", err);
        }
      }
    };
    fetchClasses();
  }, [facultyId, loadAnnouncements]);

  // Mark single announcement as read
  const handleMarkAsRead = async (announcementId) => {
    try {
      const res = await apiFetch(`/announcements/${announcementId}/read`, {
        method: "POST"
      });
      if (res.ok) {
        setReceived((prev) =>
          prev.map((a) =>
            a.announcement_id === announcementId ? { ...a, is_read: true } : a
          )
        );
        setStats((prev) => ({
          ...prev,
          unread: Math.max(0, prev.unread - 1)
        }));
      }
    } catch (err) {
      console.error("Failed to mark announcement as read:", err);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const res = await apiFetch("/announcements/read-all", {
        method: "POST"
      });
      if (res.ok) {
        setReceived((prev) => prev.map((a) => ({ ...a, is_read: true })));
        setStats((prev) => ({
          ...prev,
          unread: 0
        }));
        setToast({ msg: "All received announcements marked as read.", type: "success" });
      } else {
        throw new Error("Failed backend action.");
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      setToast({ msg: "Failed to mark all as read.", type: "error" });
    }
  };

  // Create Announcement
  const handlePublish = async () => {
    if (!title.trim() || !message.trim()) {
      setToast({ msg: "Title and message are required.", type: "error" });
      return;
    }
    if (targetType === "Class" && !selectedClass) {
      setToast({ msg: "Please select a target class.", type: "error" });
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiFetch("/announcements", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          description: message.trim(),
          sender_type: "faculty",
          sender_id: Number(facultyId),
          target_type: targetType,
          target_id: targetType === "Class" ? Number(selectedClass) : null,
          priority: priority,
          attachment_url: attachmentUrl.trim() || null,
          attachment_name: attachmentName.trim() || null
        })
      });

      if (!res.ok) throw new Error("Failed to publish announcement.");

      setToast({ msg: "Announcement Published Successfully!", type: "success" });
      setTitle("");
      setMessage("");
      setSelectedClass("");
      setPriority("Normal");
      setAttachmentUrl("");
      setAttachmentName("");
      loadAnnouncements();
      setActiveTab("sent"); // Auto-switch to Sent tab
    } catch (err) {
      console.error(err);
      setToast({ msg: err.message || "Failed to publish announcement.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Announcement
  const handleSaveChanges = async () => {
    if (!editingAnnouncement.title.trim() || !editingAnnouncement.description.trim()) {
      setToast({ msg: "Title and message are required.", type: "error" });
      return;
    }
    if (editingAnnouncement.target_type === "Class" && !editingAnnouncement.target_id) {
      setToast({ msg: "Please select a target class.", type: "error" });
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiFetch(`/announcements/${editingAnnouncement.announcement_id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editingAnnouncement.title.trim(),
          description: editingAnnouncement.description.trim(),
          sender_type: "faculty",
          sender_id: Number(facultyId),
          target_type: editingAnnouncement.target_type,
          target_id: editingAnnouncement.target_type === "Class" ? Number(editingAnnouncement.target_id) : null,
          priority: editingAnnouncement.priority,
          attachment_url: editingAnnouncement.attachment_url?.trim() || null,
          attachment_name: editingAnnouncement.attachment_name?.trim() || null
        })
      });

      if (!res.ok) throw new Error("Failed to update announcement.");

      setToast({ msg: "Announcement updated successfully!", type: "success" });
      setEditingAnnouncement(null);
      loadAnnouncements();
      if (selectedAnnouncement && selectedAnnouncement.announcement_id === editingAnnouncement.announcement_id) {
        setSelectedAnnouncement(null); // Reset detail drawer if it was open
      }
    } catch (err) {
      console.error(err);
      setToast({ msg: err.message || "Failed to update announcement.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Announcement
  const handleDeleteConfirm = async () => {
    try {
      setSubmitting(true);
      const res = await apiFetch(`/announcements/${deletingAnnouncement.announcement_id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete announcement.");

      setToast({ msg: "Announcement deleted successfully.", type: "success" });
      setDeletingAnnouncement(null);
      loadAnnouncements();
      if (selectedAnnouncement && selectedAnnouncement.announcement_id === deletingAnnouncement.announcement_id) {
        setSelectedAnnouncement(null); // Reset detail drawer
      }
    } catch (err) {
      console.error(err);
      setToast({ msg: "Failed to delete announcement.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  // Simulate file selection and create mock URL
  const simulateAttachmentUpload = (e, isEdit = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const mockUrl = `https://neurolearn-ai.edu/files/uploads/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
      if (isEdit) {
        setEditingAnnouncement((prev) => ({
          ...prev,
          attachment_name: file.name,
          attachment_url: mockUrl
        }));
      } else {
        setAttachmentName(file.name);
        setAttachmentUrl(mockUrl);
      }
      setToast({ msg: `Simulated upload for ${file.name}`, type: "info" });
    }
  };

  // Open drawer and mark as read
  const handleCardClick = (ann) => {
    setSelectedAnnouncement(ann);
    if (activeTab === "received" && !ann.is_read) {
      handleMarkAsRead(ann.announcement_id);
    }
  };

  // Filter & Sort Logic
  const processList = (list) => {
    return list
      .filter((ann) => {
        const matchesSearch =
          ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ann.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (ann.sender_name || "").toLowerCase().includes(searchQuery.toLowerCase());

        const matchesPriority = priorityFilter === "All" || ann.priority === priorityFilter;
        const matchesTarget = targetFilter === "All" || ann.target_type === targetFilter;

        return matchesSearch && matchesPriority && matchesTarget;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.created_at) - new Date(a.created_at);
        } else if (sortBy === "oldest") {
          return new Date(a.created_at) - new Date(b.created_at);
        } else if (sortBy === "priority") {
          const weights = { Urgent: 3, Important: 2, Normal: 1 };
          return (weights[b.priority] || 1) - (weights[a.priority] || 1);
        }
        return 0;
      });
  };

  const processedReceived = processList(received);
  const processedSent = processList(sentAnnouncements);

  const tabs = [
    { id: "received", label: "Received", icon: Inbox, count: received.length },
    { id: "sent", label: "Sent", icon: Send, count: sentAnnouncements.length },
    { id: "compose", label: "Compose", icon: Plus, count: null }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 font-sans text-slate-800 dark:text-slate-200"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-purple-650 dark:text-purple-400 font-extrabold uppercase tracking-wider">
            Communication Center
          </p>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Faculty Announcements
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage incoming notices and communicate with classes.
          </p>
        </div>

        {activeTab === "received" && stats.unread > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs transition-all shadow-md hover:scale-[1.01] cursor-pointer self-start sm:self-center"
          >
            <CheckCircle size={14} />
            Mark All as Read
          </button>
        )}
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Received", value: stats.received, icon: Inbox, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/10" },
          { label: "Sent", value: stats.sent, icon: Send, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/10" },
          { label: "Unread", value: stats.unread, icon: Bell, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/10" },
          { label: "This Week", value: stats.thisWeek, icon: Calendar, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/10" }
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</p>
              <span className={`p-1.5 rounded-lg border ${bg}`}><Icon size={14} className={color} /></span>
            </div>
            <p className={`text-3xl font-black ${color}`}>
              {loading ? <span className="text-slate-300 dark:text-slate-700">—</span> : value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Tabs Navigation ── */}
      <div className="flex gap-2 flex-wrap border-b border-slate-100 dark:border-slate-850 pb-2">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black transition-all border cursor-pointer ${activeTab === id
              ? "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/20"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850/50"
              }`}
          >
            <Icon size={13} />
            {label}
            {count !== null && (
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${activeTab === id ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-850 text-slate-500"
                  }`}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Search & Filter Controls ── */}
      {(activeTab === "received" || activeTab === "sent") && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 rounded-3xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 shadow-sm">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notices..."
              className="w-full pl-9 pr-8 py-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-slate-800 dark:text-white transition-all placeholder:text-slate-450"
            />
            <span className="absolute left-3 top-3.5 text-slate-400">
              <Search size={13} />
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1 shrink-0">Priority</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-slate-800 dark:text-white cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">🔴 Urgent</option>
              <option value="Important">🟡 Important</option>
              <option value="Normal">🟢 Normal</option>
            </select>
          </div>

          {/* Target Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1 shrink-0">Target</span>
            <select
              value={targetFilter}
              onChange={(e) => setTargetFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-slate-800 dark:text-white cursor-pointer"
            >
              <option value="All">All Targets</option>
              <option value="Class">Class</option>
              <option value="Department">Department</option>
              <option value="Faculty">Faculty</option>
              <option value="Institution">Institution</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1 shrink-0">Sort</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-slate-800 dark:text-white cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Priority (High to Low)</option>
            </select>
          </div>
        </div>
      )}

      {/* ── Content Area ── */}
      <AnimatePresence mode="wait">
        {/* ══════════ RECEIVED TAB ══════════ */}
        {activeTab === "received" && (
          <motion.div
            key="received"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-black text-slate-800 dark:text-white text-sm">Received Notices</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">
                  From admin, departments, and institution
                </p>
              </div>
              {stats.unread > 0 && (
                <span className="bg-purple-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full">
                  {stats.unread} unread
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3">
              {loading ? (
                [1, 2, 3].map((i) => <SkeletonCard key={i} />)
              ) : processedReceived.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title={searchQuery || priorityFilter !== "All" || targetFilter !== "All" ? "No matching announcements" : "No announcements received yet"}
                  sub={searchQuery || priorityFilter !== "All" || targetFilter !== "All" ? "Try relaxing your search or filter parameters." : "Admin notices and institution-wide broadcasts will appear here."}
                />
              ) : (
                processedReceived.map((ann) => {
                  const pr = priorityConfig[ann.priority] || priorityConfig.Normal;
                  return (
                    <motion.div
                      key={ann.announcement_id}
                      layout
                      onClick={() => handleCardClick(ann)}
                      className={`border rounded-2xl p-4.5 transition-all cursor-pointer group relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 ${!ann.is_read
                        ? "border-purple-500/30 bg-purple-50/15 dark:bg-purple-950/10 hover:bg-purple-50/25"
                        : "border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850/50"
                        }`}
                    >
                      {!ann.is_read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-purple-600 rounded-full" />
                      )}
                      <div className="flex gap-3.5 items-start flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0 mt-0.5 border border-purple-200/20">
                          <Megaphone size={16} className="text-purple-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-slate-850 dark:text-white text-sm group-hover:text-purple-650 dark:group-hover:text-purple-400 transition-colors">
                                {ann.title}
                              </h4>
                              {ann.is_edited ? (
                                <span className="text-[8px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase font-bold">
                                  Edited
                                </span>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {!ann.is_read && (
                                <span className="bg-purple-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                                  New
                                </span>
                              )}
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${pr.color}`}>
                                {ann.priority || "Normal"}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2 pr-4">
                            {ann.description}
                          </p>
                          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-850/60 text-[10px] text-slate-400">
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
                      <div className="self-end md:self-center shrink-0 flex items-center gap-2">
                        {ann.attachment_url && (
                          <a
                            href={ann.attachment_url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors text-slate-600 dark:text-slate-300"
                            title={ann.attachment_name || "Download Attachment"}
                          >
                            <Download size={13} />
                          </a>
                        )}
                        <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {/* ══════════ SENT TAB ══════════ */}
        {activeTab === "sent" && (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 shadow-sm"
          >
            <div className="mb-5">
              <h3 className="font-black text-slate-800 dark:text-white text-sm">Sent Announcements</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">
                Broadcasts you have published
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {loading ? (
                [1, 2].map((i) => <SkeletonCard key={i} />)
              ) : processedSent.length === 0 ? (
                <EmptyState
                  icon={Send}
                  title={searchQuery || priorityFilter !== "All" || targetFilter !== "All" ? "No matching announcements" : "No announcements sent yet"}
                  sub={searchQuery || priorityFilter !== "All" || targetFilter !== "All" ? "Try relaxing your search or filter parameters." : "Use the 'Compose' tab to broadcast a message to your classes."}
                />
              ) : (
                processedSent.map((ann) => {
                  const pr = priorityConfig[ann.priority] || priorityConfig.Normal;
                  const isMenuOpen = activeMenuId === ann.announcement_id;
                  return (
                    <div
                      key={ann.announcement_id}
                      onClick={() => handleCardClick(ann)}
                      className="border border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-2xl p-4.5 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-all cursor-pointer relative group flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex gap-3.5 items-start flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200/20">
                          <Send size={15} className="text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-slate-800 dark:text-white text-sm group-hover:text-purple-650 dark:group-hover:text-purple-400 transition-colors">
                                {ann.title}
                              </h4>
                              {ann.is_edited ? (
                                <span className="text-[8px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase font-bold">
                                  Edited
                                </span>
                              ) : null}
                            </div>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${pr.color} shrink-0`}>
                              {ann.priority || "Normal"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2 pr-4">
                            {ann.description}
                          </p>
                          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <BookOpen size={10} />
                              Target: {ann.target_type}
                              {ann.target_id ? <span className="opacity-60">#{ann.target_id}</span> : null}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={10} /> {fmtDate(ann.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Menu Operations */}
                      <div className="self-end md:self-center shrink-0 flex items-center gap-2 relative">
                        {ann.attachment_url && (
                          <a
                            href={ann.attachment_url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors text-slate-600 dark:text-slate-300"
                            title={ann.attachment_name || "Attachment"}
                          >
                            <Download size={13} />
                          </a>
                        )}

                        {/* Three dot actions */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(isMenuOpen ? null : ann.announcement_id);
                            }}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                          >
                            <MoreVertical size={14} />
                          </button>

                          {isMenuOpen && (
                            <div
                              ref={menuRef}
                              className="absolute right-0 mt-1 w-32 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl shadow-xl z-20 overflow-hidden text-xs py-1"
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingAnnouncement({ ...ann });
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5 cursor-pointer"
                              >
                                <Edit2 size={12} className="text-purple-650" />
                                Edit Notice
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingAnnouncement(ann);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-rose-50 dark:hover:bg-rose-950/35 text-rose-600 font-bold flex items-center gap-1.5 cursor-pointer border-t border-slate-100 dark:border-slate-800"
                              >
                                <Trash2 size={12} className="text-rose-500" />
                                Delete Notice
                              </button>
                            </div>
                          )}
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {/* ══════════ COMPOSE TAB ══════════ */}
        {activeTab === "compose" && (
          <motion.div
            key="compose"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm"
          >
            <div className="mb-6">
              <h3 className="font-black text-slate-800 dark:text-white text-sm">Compose Announcement</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">
                Broadcast a notice to classes or the entire institution
              </p>
            </div>

            <div className="space-y-5 max-w-2xl">
              {/* Title */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">
                  Announcement Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mid-Semester Exam Schedule Update"
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl px-4 py-3 text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Priority Level</label>
                <div className="flex gap-2 flex-wrap">
                  {["Normal", "Important", "Urgent"].map((p) => {
                    const pr = priorityConfig[p];
                    return (
                      <button
                        key={p}
                        onClick={() => setPriority(p)}
                        className={`px-7 py-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${priority === p
                          ? pr.color + " border-purple-500/50 shadow-sm hover:scale-[1.01]"
                          : "border-slate-200 dark:border-slate-750 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                      >
                        <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${pr.dot.split(" ")[0]}`} />
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Type */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Target Recipients</label>
                <div className="flex gap-2">
                  {["Class", "Institution"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTargetType(t)}
                      className={`px-7 py-3 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center gap-1.5 ${targetType === t
                        ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                        : "border-slate-200 dark:border-slate-750 text-slate-500 hover:border-purple-305"
                        }`}
                    >
                      {t === "Class" ? <BookOpen size={12} /> : <Users size={12} />}
                      {t === "Class" ? "Specific Class" : "All (Institution)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Class Selector */}
              {targetType === "Class" && (
                <div className="animate-fadeIn">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">
                    Select Target Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all cursor-pointer"
                  >
                    <option value="">Select a class…</option>
                    {classes.length === 0 ? (
                      <option disabled>No classes assigned — contact admin</option>
                    ) : (
                      classes.map((c) => (
                        <option key={`${c.class_id}-${c.subject_id}`} value={c.class_id}>
                          {c.class_name} — {c.subject_name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">
                  Message Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your announcement details here…"
                  className="w-full border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl px-4 py-3 text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all resize-none"
                />
                <p className="text-[10px] text-slate-400 mt-1 text-right">{message.length} characters</p>
              </div>

              {/* Attachments Section */}
              <div className="bg-slate-50/55 dark:bg-slate-800/40 p-4.5 border border-slate-150 dark:border-slate-800/80 rounded-2xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Paperclip size={13} className="text-purple-650" />
                    Attach Files & Assets
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold uppercase">Optional</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">Attachment Name</label>
                    <input
                      type="text"
                      value={attachmentName}
                      onChange={(e) => setAttachmentName(e.target.value)}
                      placeholder="e.g. syllabus_revised.pdf"
                      className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">Attachment URL</label>
                    <input
                      type="text"
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                      placeholder="e.g. https://domain.com/file.pdf"
                      className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Upload Simulator */}
                <div className="flex items-center gap-3">
                  <label className="px-3 py-2 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                    <Download size={12} className="text-slate-400" />
                    Simulate Upload File
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => simulateAttachmentUpload(e, false)}
                    />
                  </label>
                  {(attachmentUrl || attachmentName) && (
                    <button
                      onClick={() => {
                        setAttachmentUrl("");
                        setAttachmentName("");
                      }}
                      className="text-xs text-rose-500 hover:underline font-semibold cursor-pointer"
                    >
                      Clear Attachment
                    </button>
                  )}
                </div>
              </div>

              {/* Publish button */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handlePublish}
                  disabled={submitting}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-505 disabled:bg-purple-600/50 text-white font-black px-6 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-purple-500/20 cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Publishing…
                    </>
                  ) : (
                    <>
                      <Megaphone size={14} /> Publish Announcement
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setTitle("");
                    setMessage("");
                    setPriority("Normal");
                    setSelectedClass("");
                    setAttachmentUrl("");
                    setAttachmentName("");
                  }}
                  className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 text-xs font-black transition-colors cursor-pointer"
                >
                  Clear Fields
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════ SLIDING DETAIL DRAWER ══════════ */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-sm z-50 flex justify-end"
            onClick={() => setSelectedAnnouncement(null)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 24, stiffness: 180 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Top */}
              <div className="space-y-5">
                <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-855 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-purple-650 dark:text-purple-400 uppercase tracking-widest block">Announcement Details</span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1 leading-snug">
                      {selectedAnnouncement.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedAnnouncement(null)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Badges & Meta */}
                <div className="flex flex-wrap gap-2">
                  <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border ${(priorityConfig[selectedAnnouncement.priority] || priorityConfig.Normal).color
                    }`}>
                    {selectedAnnouncement.priority} Priority
                  </span>
                  <span className="text-[9px] font-black px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                    Target: {selectedAnnouncement.target_type}
                  </span>
                  {selectedAnnouncement.is_edited ? (
                    <span className="text-[9px] font-black px-2.5 py-1 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      ✏️ Edited Notice
                    </span>
                  ) : null}
                </div>

                {/* Details Card */}
                <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-3">
                  <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users size={12} /> Sender
                    </span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">
                      {selectedAnnouncement.sender_name}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> Published
                    </span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">
                      {fmtDate(selectedAnnouncement.created_at)}
                    </span>
                  </div>
                </div>

                {/* Announcement Description */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Notice Message</span>
                  <div className="p-4.5 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800/80 rounded-2xl text-sm leading-relaxed text-slate-700 dark:text-slate-350 whitespace-pre-wrap">
                    {selectedAnnouncement.description}
                  </div>
                </div>

                {/* Attachment info */}
                {selectedAnnouncement.attachment_url ? (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Attachment</span>
                    <div className="flex items-center justify-between p-3.5 border border-slate-200 dark:border-slate-850 rounded-2xl hover:border-purple-500/30 transition-all bg-slate-50/20 dark:bg-slate-900/40">
                      <div className="flex items-center gap-2 min-w-0">
                        <Paperclip size={14} className="text-purple-650 shrink-0" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                          {selectedAnnouncement.attachment_name || "Download Attachment"}
                        </span>
                      </div>
                      <a
                        href={selectedAnnouncement.attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-505 text-white font-extrabold rounded-lg text-[10px] transition-all cursor-pointer"
                      >
                        <Download size={10} />
                        Download
                      </a>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Drawer Bottom Actions */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-850 flex gap-2">
                {Number(selectedAnnouncement.sender_id) === Number(facultyId) &&
                  (selectedAnnouncement.sender_type === "faculty" || selectedAnnouncement.sender_type === "FACULTY") ? (
                  <>
                    <button
                      onClick={() => {
                        setEditingAnnouncement({ ...selectedAnnouncement });
                      }}
                      className="flex-1 py-3 bg-purple-600 hover:bg-purple-505 text-white font-black rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
                    >
                      <Edit2 size={13} />
                      Edit Notice
                    </button>
                    <button
                      onClick={() => {
                        setDeletingAnnouncement(selectedAnnouncement);
                      }}
                      className="py-3 px-5 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setSelectedAnnouncement(null)}
                    className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-black rounded-xl text-xs transition-all cursor-pointer text-center"
                  >
                    Close Notice View
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════ EDIT MODAL ══════════ */}
      <AnimatePresence>
        {editingAnnouncement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
                <div>
                  <h3 className="font-black text-slate-850 dark:text-white text-base">Edit Announcement</h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Modify announcement details</p>
                </div>
                <button
                  onClick={() => setEditingAnnouncement(null)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-250"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Title */}
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1 block">Announcement Title</label>
                  <input
                    type="text"
                    value={editingAnnouncement.title}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })}
                    className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl px-4 py-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1.5 block">Priority Level</label>
                  <div className="flex gap-2">
                    {["Normal", "Important", "Urgent"].map((p) => {
                      const pr = priorityConfig[p];
                      const isSel = editingAnnouncement.priority === p;
                      return (
                        <button
                          key={p}
                          onClick={() => setEditingAnnouncement({ ...editingAnnouncement, priority: p })}
                          className={`px-3 py-1.5 rounded-lg border font-black transition-all cursor-pointer ${isSel ? pr.color + " border-purple-500/50" : "border-slate-200 dark:border-slate-700 text-slate-500"
                            }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Target */}
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1.5 block">Target Recipients</label>
                  <div className="flex gap-2">
                    {["Class", "Institution"].map((t) => {
                      const isSel = editingAnnouncement.target_type === t;
                      return (
                        <button
                          key={t}
                          onClick={() => setEditingAnnouncement({ ...editingAnnouncement, target_type: t })}
                          className={`px-3.5 py-1.5 rounded-lg border font-black transition-all cursor-pointer ${isSel ? "bg-purple-600 text-white border-purple-600" : "border-slate-200 dark:border-slate-700 text-slate-500"
                            }`}
                        >
                          {t === "Class" ? "Specific Class" : "All (Institution)"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Target Class dropdown */}
                {editingAnnouncement.target_type === "Class" && (
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1 block">Target Class</label>
                    <select
                      value={editingAnnouncement.target_id || ""}
                      onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, target_id: e.target.value })}
                      className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl px-4 py-2.5 font-bold focus:outline-none"
                    >
                      <option value="">Select a class…</option>
                      {classes.map((c) => (
                        <option key={`${c.class_id}-${c.subject_id}`} value={c.class_id}>
                          {c.class_name} — {c.subject_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Message Body */}
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1 block">Message Content</label>
                  <textarea
                    rows={4}
                    value={editingAnnouncement.description}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, description: e.target.value })}
                    className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-850 dark:text-white rounded-xl px-4 py-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
                  />
                </div>

                {/* Attachments inside Edit */}
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-150 dark:border-slate-800/80 space-y-3">
                  <span className="font-bold text-[9px] uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Paperclip size={12} className="text-purple-650" />
                    Modify Attachments
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] font-extrabold text-slate-400 uppercase mb-0.5 block">File Name</label>
                      <input
                        type="text"
                        value={editingAnnouncement.attachment_name || ""}
                        onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, attachment_name: e.target.value })}
                        className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-805 dark:text-white rounded px-2 py-1.5 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-extrabold text-slate-400 uppercase mb-0.5 block">File URL</label>
                      <input
                        type="text"
                        value={editingAnnouncement.attachment_url || ""}
                        onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, attachment_url: e.target.value })}
                        className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded px-2 py-1.5 font-bold"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="px-3 py-1.5 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-extrabold transition-all flex items-center gap-1 cursor-pointer">
                      <Download size={11} className="text-slate-400" />
                      Upload New File
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => simulateAttachmentUpload(e, true)}
                      />
                    </label>
                    {(editingAnnouncement.attachment_url || editingAnnouncement.attachment_name) && (
                      <button
                        onClick={() => {
                          setEditingAnnouncement({
                            ...editingAnnouncement,
                            attachment_url: null,
                            attachment_name: null
                          });
                        }}
                        className="text-[10px] text-rose-500 hover:underline font-extrabold cursor-pointer"
                      >
                        Remove Attachment
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit Modal Footer */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-850">
                <button
                  onClick={() => setEditingAnnouncement(null)}
                  className="px-4 py-2.5 bg-slate-600 dark:bg-slate-850 hover:bg-slate-600 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-black rounded-xl text-xs cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={submitting}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-505 disabled:bg-purple-600/50 text-white font-black rounded-xl text-xs cursor-pointer transition-all shadow-md flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 size={12} className="animate-spin" /> : null}
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {deletingAnnouncement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto text-rose-500">
                <AlertTriangle size={24} className="animate-bounce" />
              </div>

              <div className="space-y-1">
                <h3 className="font-black text-slate-850 dark:text-white text-base">Delete Announcement?</h3>
                <p className="text-xs text-slate-450 dark:text-slate-400">
                  Are you absolutely sure? This will permanently remove the notice{" "}
                  <span className="font-bold text-slate-800 dark:text-white">"{deletingAnnouncement.title}"</span>. This action cannot
                  be undone.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setDeletingAnnouncement(null)}
                  className="flex-1 py-2.5 bg-slate-600 dark:bg-slate-850 hover:bg-slate-600 dark:hover:bg-slate-805 text-slate-700 dark:text-slate-300 font-black rounded-xl text-xs cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-500/50 text-white font-black rounded-xl text-xs cursor-pointer transition-all shadow-md shadow-rose-500/15"
                >
                  {submitting ? "Deleting..." : "Delete Notice"}
                </button>
              </div>
            </motion.div>
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