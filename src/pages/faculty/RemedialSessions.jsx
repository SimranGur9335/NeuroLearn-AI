import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from "../../services/api";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Search,
  X,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Award,
  BookOpen,
  Edit,
  Trash2,
  Check,
  Play,
  ChevronRight,
  ClipboardList,
  FileText
} from 'lucide-react';
import { useAuth } from "../../context/AuthContext";

const RemedialSessions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedClass = JSON.parse(localStorage.getItem("selectedClass") || "{}");
  const { user } = useAuth();
  const facultyId = user?.faculty_id;

  // State Management
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [classStudents, setClassStudents] = useState([]);

  // Loaders & Errors
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submittingSession, setSubmittingSession] = useState(false);
  const [updatingInvitationId, setUpdatingInvitationId] = useState(null);
  const [savingNotes, setSavingNotes] = useState(false);
  const [cancellingSession, setCancellingSession] = useState(false);

  // Form & Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editSessionId, setEditSessionId] = useState(null);
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("10:00");
  const [locationStr, setLocationStr] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");

  // Upgraded Lifecycle Modals & Form State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("Faculty Unavailable");
  const [customCancellationReason, setCustomCancellationReason] = useState("");
  
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [startingSession, setStartingSession] = useState(false);
  
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  // Search & Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [classFilter, setClassFilter] = useState("All");

  // Completion Notes state (inside drawer)
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [outcome, setOutcome] = useState("");
  const [remarks, setRemarks] = useState("");
  const [recommendation, setRecommendation] = useState("");

  // Alerts
  const [alertInfo, setAlertInfo] = useState(null);

  const showAlert = (message, type = "success") => {
    setAlertInfo({ message, type });
    setTimeout(() => setAlertInfo(null), 4000);
  };

  // Helper: Calculate session status based on lifecycle
  const getSessionStatus = (session) => {
    if (session.status === 'Cancelled') return 'Cancelled';
    if (session.status === 'Completed') return 'Completed';
    if (session.status === 'In Progress') return 'In Progress';

    // If active, determine if it is Today or Upcoming based on calendar day
    try {
      const [year, month, day] = session.session_date.split('-').map(Number);
      const sessionDateOnly = new Date(year, month - 1, day);
      
      const now = new Date();
      const todayDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Same day check
      const isToday = sessionDateOnly.getTime() === todayDateOnly.getTime();

      if (isToday) {
        return 'Today';
      } else {
        return 'Upcoming';
      }
    } catch (e) {
      return 'Upcoming';
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Upcoming':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'Today':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'In Progress':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Cancelled':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  // 1. Fetch Remedial Sessions list
  const fetchSessions = async () => {
    if (!facultyId) return;
    setLoadingSessions(true);
    try {
      const res = await apiFetch(`/remedial/sessions?faculty_id=${facultyId}`);
      if (!res.ok) throw new Error("Failed to fetch sessions");
      const data = await res.json();
      
      // Filter sessions for the active class if selected
      const filtered = selectedClass.class_id
        ? data.filter(s => s.class_id === selectedClass.class_id)
        : data;
      setSessions(filtered);
      
      // If a session is currently open in the drawer, sync its data
      if (selectedSession) {
        const updated = filtered.find(s => s.session_id === selectedSession.session_id);
        if (updated) {
          setSelectedSession(updated);
        }
      }
    } catch (err) {
      console.error(err);
      showAlert("Error loading remedial sessions", "error");
    } finally {
      setLoadingSessions(false);
    }
  };

  // 2. Fetch Class Students (for invitation checklist)
  const fetchClassStudents = async () => {
    if (!selectedClass.class_id) return;
    setLoadingStudents(true);
    try {
      const res = await apiFetch(`/class/${selectedClass.class_id}/students`);
      if (!res.ok) throw new Error("Failed to fetch class students");
      const data = await res.json();
      setClassStudents(data);
    } catch (err) {
      console.error(err);
      showAlert("Failed to load class roster", "error");
    } finally {
      setLoadingStudents(false);
    }
  };

  // 3. Fetch Invitations for a selected session
  const fetchInvitations = async (sessionId) => {
    setLoadingInvitations(true);
    try {
      const res = await apiFetch(`/remedial/sessions/${sessionId}/invitations`);
      if (!res.ok) throw new Error("Failed to fetch invitations");
      const data = await res.json();
      // Map "Attended" to "Present" for UI consistency
      const mapped = data.map(inv => ({
        ...inv,
        status: inv.status === "Attended" ? "Present" : inv.status
      }));
      setInvitations(mapped);
    } catch (err) {
      console.error(err);
      showAlert("Failed to load session roster", "error");
    } finally {
      setLoadingInvitations(false);
    }
  };

  // Load initial data
  useEffect(() => {
    if (selectedClass.class_id) {
      fetchSessions();
      fetchClassStudents();
    }
  }, [selectedClass.class_id]);

  // Handle incoming routing state (preselected student / students)
  useEffect(() => {
    if (classStudents.length > 0) {
      if (location.state?.preselectedStudentIds) {
        const studentIds = location.state.preselectedStudentIds.map(Number);
        setSelectedStudentIds(studentIds);
        setEditMode(false);
        setIsModalOpen(true);
        navigate(location.pathname, { replace: true, state: null });
      } else if (location.state?.preselectedStudentId) {
        const studId = Number(location.state.preselectedStudentId);
        setSelectedStudentIds([studId]);
        setEditMode(false);
        setIsModalOpen(true);
        navigate(location.pathname, { replace: true, state: null });
      }
    }
  }, [location.state, classStudents]);

  // Handle session click -> Open Drawer
  const handleSelectSession = (session) => {
    setSelectedSession(session);
    setIsDrawerOpen(true);
    fetchInvitations(session.session_id);
    
    // Set up notes form
    setOutcome(session.outcome || "");
    setRemarks(session.remarks || "");
    setRecommendation(session.recommendation || "");
    setIsEditingNotes(!session.outcome);
  };

  // Handle scheduling or editing submission
  const handleScheduleSession = async (e) => {
    e.preventDefault();
    if (!topic || !sessionDate || !sessionTime || !locationStr) {
      showAlert("Please fill in all required fields", "error");
      return;
    }
    if (selectedStudentIds.length === 0) {
      showAlert("Please select at least one student to invite", "error");
      return;
    }

    setSubmittingSession(true);
    try {
      const url = editMode ? `/remedial/sessions/${editSessionId}` : `/remedial/sessions`;
      const method = editMode ? "PUT" : "POST";
      
      const res = await apiFetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_id: selectedClass.class_id,
          subject_id: selectedClass.subject_id,
          topic,
          description,
          session_date: sessionDate,
          session_time: sessionTime,
          location: locationStr,
          student_ids: selectedStudentIds,
          faculty_id: facultyId
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || `Failed to ${editMode ? 'update' : 'schedule'} session`);
      }

      showAlert(`Remedial session ${editMode ? 'updated' : 'scheduled'} successfully!`);
      setIsModalOpen(false);
      // Clear form
      setTopic("");
      setDescription("");
      setSessionDate("");
      setSessionTime("10:00");
      setLocationStr("");
      setSelectedStudentIds([]);
      setEditMode(false);
      setEditSessionId(null);
      // Refresh list
      fetchSessions();
    } catch (err) {
      console.error(err);
      showAlert(err.message || `Failed to ${editMode ? 'update' : 'schedule'} session`, "error");
    } finally {
      setSubmittingSession(false);
    }
  };

  // Handle editing upcoming session (open modal in edit mode)
  const handleEditSession = (session) => {
    setEditMode(true);
    setEditSessionId(session.session_id);
    setTopic(session.topic);
    setDescription(session.description || "");
    setSessionDate(session.session_date);
    setSessionTime(session.session_time);
    setLocationStr(session.location);
    
    // Set invited students
    setLoadingInvitations(true);
    apiFetch(`/remedial/sessions/${session.session_id}/invitations`)
      .then(res => res.json())
      .then(data => {
        setSelectedStudentIds(data.map(i => i.student_id));
        setIsModalOpen(true);
      })
      .catch(err => {
        console.error(err);
        showAlert("Failed to load session roster for editing", "error");
      })
      .finally(() => setLoadingInvitations(false));
  };

  // Handle updating status of an individual invitation
  const handleUpdateStatus = async (invitationId, newStatus) => {
    // Map Present to Attended for backend compatibility
    const backendStatus = newStatus === "Present" ? "Attended" : newStatus;
    setUpdatingInvitationId(invitationId);
    try {
      const res = await apiFetch(`/remedial/invitations/${invitationId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: backendStatus,
          faculty_id: facultyId
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to update invitation status");
      }

      // Update local state list immediately for real-time stats updates
      setInvitations(prev => prev.map(inv =>
        inv.invitation_id === invitationId ? { ...inv, status: newStatus } : inv
      ));
    } catch (err) {
      console.error(err);
      showAlert(err.message || "Failed to update attendance status", "error");
    } finally {
      setUpdatingInvitationId(null);
    }
  };

  // Handle starting a session (POST to start endpoint)
  const handleStartSession = async () => {
    setStartingSession(true);
    try {
      const res = await apiFetch(`/remedial/sessions/${selectedSession.session_id}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faculty_id: facultyId })
      });

      if (!res.ok) throw new Error("Failed to start session");
      showAlert("Remedial session started successfully! Attendance is now active.");
      setIsStartModalOpen(false);
      fetchSessions(); // Refresh list to get updated status
    } catch (err) {
      console.error(err);
      showAlert("Failed to start session", "error");
    } finally {
      setStartingSession(false);
    }
  };

  // Handle saving completion notes and updating status to Completed
  const handleSaveNotes = async () => {
    if (!outcome.trim() || !remarks.trim() || !recommendation.trim()) {
      showAlert("Please fill in all completion fields", "error");
      return;
    }
    setSavingNotes(true);
    try {
      const res = await apiFetch(`/remedial/sessions/${selectedSession.session_id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          faculty_id: facultyId,
          outcome,
          remarks,
          recommendation
        })
      });

      if (!res.ok) throw new Error("Failed to save completion notes");
      showAlert("Remedial session completed and academic summary recorded!");
      setIsEditingNotes(false);
      setIsCompleteModalOpen(false);
      fetchSessions(); // Refresh list to get updated status and notes
    } catch (err) {
      console.error(err);
      showAlert("Failed to save completion notes", "error");
    } finally {
      setSavingNotes(false);
    }
  };

  // Handle cancelling a session with a structured reason
  const handleCancelSession = async () => {
    const finalReason = cancellationReason === "Other" ? customCancellationReason : cancellationReason;
    if (!finalReason.trim()) {
      showAlert("Please select or enter a cancellation reason", "error");
      return;
    }

    setCancellingSession(true);
    try {
      const res = await apiFetch(`/remedial/sessions/${selectedSession.session_id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          faculty_id: facultyId,
          cancellation_reason: finalReason
        })
      });

      if (!res.ok) throw new Error("Failed to cancel session");
      showAlert("Remedial session cancelled successfully!");
      setIsCancelModalOpen(false);
      setIsDrawerOpen(false);
      setSelectedSession(null);
      fetchSessions();
    } catch (err) {
      console.error(err);
      showAlert("Failed to cancel session", "error");
    } finally {
      setCancellingSession(false);
    }
  };

  const toggleStudentSelection = (studId) => {
    setSelectedStudentIds(prev =>
      prev.includes(studId) ? prev.filter(id => id !== studId) : [...prev, studId]
    );
  };

  const handleSelectAllStudents = () => {
    if (selectedStudentIds.length === classStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(classStudents.map(s => s.student_id));
    }
  };

  // Filter student checklist inside modal
  const filteredStudentsToChecklist = classStudents.filter(s =>
    s.full_name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    s.roll_no.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

  // Dynamic values for Subjects and Classes filters
  const uniqueSubjects = ["All", ...new Set(sessions.map(s => s.subject_name))];
  const uniqueClasses = ["All", ...new Set(sessions.map(s => s.class_name))];

  // Client-side filtering logic
  const filteredSessions = sessions.filter(session => {
    const status = getSessionStatus(session);
    
    // 1. Status Filter
    if (statusFilter !== "All" && status !== statusFilter) return false;
    
    // 2. Subject Filter
    if (subjectFilter !== "All" && session.subject_name !== subjectFilter) return false;
    
    // 3. Class Filter
    if (classFilter !== "All" && session.class_name !== classFilter) return false;
    
    // 4. Search Query
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const matchesTopic = session.topic?.toLowerCase().includes(query);
      const matchesSubject = session.subject_name?.toLowerCase().includes(query);
      const matchesClass = session.class_name?.toLowerCase().includes(query);
      const matchesStudents = session.student_names?.toLowerCase().includes(query);
      return matchesTopic || matchesSubject || matchesClass || matchesStudents;
    }
    
    return true;
  });

  // Compute stats based on ALL sessions
  const totalSessions = sessions.length;
  
  // Calculate average attendance across completed sessions
  // Note: we can compute this using a local aggregation or just simple client side sum
  const completedSessions = sessions.filter(s => getSessionStatus(s) === 'Completed');
  // For simplicity, let's keep the existing stats formula or compute them elegantly:
  const upcomingCount = sessions.filter(s => getSessionStatus(s) === 'Upcoming' || getSessionStatus(s) === 'Today').length;
  const completedCount = completedSessions.length;
  
  // Real-time drawer stats
  const totalInvited = invitations.length;
  const presentCount = invitations.filter(i => i.status === "Present" || i.status === "Attended").length;
  const absentCount = invitations.filter(i => i.status === "Absent").length;
  const attendanceRate = totalInvited > 0 ? Math.round((presentCount / totalInvited) * 100) : 0;

  if (!selectedClass.class_id) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
        <GraduationCap size={64} className="text-slate-300 dark:text-slate-700 animate-bounce mb-4" />
        <h3 className="text-xl font-black text-slate-800 dark:text-white">No Classroom Selected</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mt-2">
          Please select an active classroom workspace from the Class Selector to manage remedial sessions.
        </p>
        <button
          onClick={() => navigate('/faculty/select-class')}
          className="mt-5 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
        >
          Go to Class Selector
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 font-sans text-slate-800 dark:text-slate-200 relative overflow-hidden"
    >
      {/* Alert Banner */}
      <AnimatePresence>
        {alertInfo && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-white font-bold text-xs ${
              alertInfo.type === "error" ? "bg-rose-500" : "bg-emerald-500"
            }`}
          >
            {alertInfo.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
            <span>{alertInfo.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <GraduationCap size={14} className="animate-pulse" />
            Remedial & Support Center
          </p>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            Remedial Session Registry
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Class: <span className="font-semibold text-slate-800 dark:text-white">{selectedClass.class_name}</span> | Subject: <span className="font-semibold text-slate-800 dark:text-white">{selectedClass.subject_name}</span>
          </p>
        </div>

        <button
          onClick={() => {
            setEditMode(false);
            setEditSessionId(null);
            setTopic("");
            setDescription("");
            setSessionDate("");
            setSessionTime("10:00");
            setLocationStr("");
            setSelectedStudentIds([]);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md cursor-pointer transition-all shrink-0"
        >
          <Plus size={14} /> Schedule Remedial Class
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex justify-between items-center transition-all hover:translate-y-[-2px]">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-bold">Total Remedial Classes</span>
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 block">
              {totalSessions} Sessions
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 font-black">
            <Calendar size={18} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex justify-between items-center transition-all hover:translate-y-[-2px]">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-bold">Completed Support Target</span>
            <span className="text-2xl font-black text-emerald-500 mt-1 block">
              {completedCount} Completed
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-500 font-black">
            <CheckCircle size={18} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex justify-between items-center transition-all hover:translate-y-[-2px]">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-bold">Upcoming Remedial Tasks</span>
            <span className="text-2xl font-black text-blue-500 mt-1 block">
              {upcomingCount} Scheduled
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-blue-500 font-black">
            <Users size={18} />
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-3 items-center">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by topic, student name, subject, or class..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55/20 dark:bg-slate-950/25 text-xs focus:outline-none focus:ring-2 focus:ring-purple-550 focus:border-transparent text-slate-800 dark:text-slate-200 placeholder-slate-400"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status filter */}
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider ml-1">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-55/40 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-650 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Today">Today</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Subject filter */}
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider ml-1">Subject</span>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="bg-slate-55/40 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-655 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
            >
              {uniqueSubjects.map(sub => (
                <option key={sub} value={sub}>{sub === "All" ? "All Subjects" : sub}</option>
              ))}
            </select>
          </div>

          {/* Class filter */}
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider ml-1">Class</span>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="bg-slate-55/40 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-655 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
            >
              {uniqueClasses.map(cls => (
                <option key={cls} value={cls}>{cls === "All" ? "All Classes" : cls}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sessions Grid */}
      {loadingSessions ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-44 rounded-2xl animate-pulse p-5 space-y-4">
              <div className="flex justify-between">
                <div className="w-1/2 h-5 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="w-16 h-5 bg-slate-200 dark:bg-slate-800 rounded-full" />
              </div>
              <div className="w-full h-10 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="w-20 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="w-20 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
          <BookOpen size={48} className="text-slate-355 dark:text-slate-700 animate-pulse mb-3" />
          <h4 className="font-extrabold text-slate-850 dark:text-white text-base">No Remedial Sessions Found</h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            No scheduled classes match your search query or filter settings. Try adjusting your search criteria or schedule a new remedial class.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => {
            const status = getSessionStatus(session);
            const isSelected = selectedSession?.session_id === session.session_id;
            
            return (
              <motion.div
                key={session.session_id}
                onClick={() => handleSelectSession(session)}
                whileHover={{ y: -4, scale: 1.01 }}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 text-left cursor-pointer transition-all flex flex-col justify-between shadow-sm relative group overflow-hidden ${
                  isSelected
                    ? "border-purple-500 ring-1 ring-purple-500/30 shadow-md shadow-purple-500/5"
                    : "border-slate-150 dark:border-slate-850 hover:border-purple-500/35 hover:shadow-md"
                }`}
              >
                {/* Status Indicator Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  status === "Upcoming" ? "bg-blue-500" :
                  status === "Today" ? "bg-amber-500" :
                  status === "In Progress" ? "bg-purple-500" :
                  status === "Completed" ? "bg-emerald-500" : "bg-rose-500"
                }`} />

                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${getStatusBadgeStyle(status)}`}>
                      {status}
                    </span>
                    <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                      {session.subject_name}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">
                      {session.topic}
                    </h4>
                    {session.description && (
                      <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                        {session.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[10px] text-slate-450">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Calendar size={12} className="text-slate-400" /> {session.session_date}</span>
                    <span className="flex items-center gap-1"><Clock size={12} className="text-slate-400" /> {session.session_time}</span>
                  </div>
                  <span className="text-[10px] text-purple-650 dark:text-purple-400 font-black flex items-center gap-0.5 group-hover:underline">
                    {status === 'Completed' ? 'View Summary' : status === 'Cancelled' ? 'View Reason' : 'View Details'} 
                    <ChevronRight size={12} className="shrink-0" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Professional Right-side Drawer (Session Details, Attendance & Completion Notes) */}
      <AnimatePresence>
        {isDrawerOpen && selectedSession && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsDrawerOpen(false);
                setSelectedSession(null);
              }}
              className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.35 }}
              className="fixed top-0 right-0 z-50 h-full w-full max-w-xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex justify-between items-center shrink-0">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-purple-650 dark:text-purple-400 tracking-wider">
                    {selectedSession.subject_name} • {selectedSession.class_name || selectedClass.class_name}
                  </span>
                  <h3 className="font-black text-xl text-slate-900 dark:text-white leading-tight pr-4">
                    {selectedSession.topic}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setSelectedSession(null);
                  }}
                  className="p-1.5 bg-slate-100 hover:bg-slate-250 dark:bg-slate-850 dark:hover:bg-slate-750 text-slate-500 rounded-full cursor-pointer transition-colors shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Status and Action Panel */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Status:</span>
                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${getStatusBadgeStyle(getSessionStatus(selectedSession))}`}>
                      {getSessionStatus(selectedSession)}
                    </span>
                  </div>

                  {/* Action triggers based on status */}
                  <div className="flex items-center gap-2">
                    {/* Start Session (Visible only when Today) */}
                    {getSessionStatus(selectedSession) === "Today" && (
                      <button
                        type="button"
                        onClick={() => setIsStartModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black rounded-lg shadow-md transition-all cursor-pointer border-none"
                      >
                        <Play size={11} /> Start Session
                      </button>
                    )}

                    {/* Complete Session (Visible only when In Progress) */}
                    {getSessionStatus(selectedSession) === "In Progress" && (
                      <button
                        type="button"
                        onClick={() => {
                          setOutcome("");
                          setRemarks("");
                          setRecommendation("");
                          setIsCompleteModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black rounded-lg shadow-md transition-all cursor-pointer border-none"
                      >
                        <CheckCircle size={11} /> Complete Session
                      </button>
                    )}

                    {/* Edit Session (Upcoming or Today) */}
                    {(getSessionStatus(selectedSession) === "Upcoming" || getSessionStatus(selectedSession) === "Today") && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsDrawerOpen(false);
                          handleEditSession(selectedSession);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/30 dark:hover:bg-purple-950/50 text-purple-650 dark:text-purple-400 text-[10px] font-black rounded-lg border border-purple-200/20 transition-all cursor-pointer"
                      >
                        <Edit size={11} /> Edit Session
                      </button>
                    )}

                    {/* Cancel Session (Upcoming or Today) */}
                    {(getSessionStatus(selectedSession) === "Upcoming" || getSessionStatus(selectedSession) === "Today") && (
                      <button
                        type="button"
                        onClick={() => {
                          setCancellationReason("Faculty Unavailable");
                          setCustomCancellationReason("");
                          setIsCancelModalOpen(true);
                        }}
                        disabled={cancellingSession}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-[10px] font-black rounded-lg border border-rose-200/20 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {cancellingSession ? <RefreshCw size={11} className="animate-spin" /> : <Trash2 size={11} />}
                        Cancel Session
                      </button>
                    )}
                  </div>
                </div>                  {/* Cancellation Reason Banner (Visible if Cancelled) */}
                  {getSessionStatus(selectedSession) === "Cancelled" && selectedSession.cancellation_reason && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-1">
                      <span className="text-[9px] font-black uppercase text-rose-600 dark:text-rose-400 block">Reason for Cancellation</span>
                      <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                        {selectedSession.cancellation_reason}
                      </p>
                    </div>
                  )}

                  {/* Session Details Card */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <ClipboardList size={14} className="text-purple-500" /> Session Specifications
                    </h4>

                    <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850/60 rounded-2xl p-4 grid grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Lead Faculty</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{selectedSession.faculty_name || user?.name}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Location / Venue</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <MapPin size={11} className="text-slate-400 shrink-0" />
                          {selectedSession.location}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Scheduled Date</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <Calendar size={11} className="text-slate-400 shrink-0" />
                          {selectedSession.session_date}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Start Time</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <Clock size={11} className="text-slate-400 shrink-0" />
                          {selectedSession.session_time}
                        </p>
                      </div>
                      {selectedSession.description && (
                        <div className="col-span-2 space-y-1 border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-1">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Overview & Objectives</span>
                          <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-semibold">
                            {selectedSession.description}
                          </p>
                        </div>
                      )}
                      {selectedSession.completed_at && (
                        <div className="col-span-2 space-y-1 border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-1">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Completion Timestamp</span>
                          <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <Clock size={11} className="text-slate-400 shrink-0" />
                            {new Date(selectedSession.completed_at).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                {/* Attendance Summary and Metrics */}
                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Users size={14} className="text-purple-500" /> Attendance Telemetry
                  </h4>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850 text-center">
                      <span className="text-[8px] text-slate-400 font-extrabold uppercase block">Invited</span>
                      <span className="text-base font-black text-slate-800 dark:text-white mt-1 block">{totalInvited}</span>
                    </div>
                    <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/10 text-center">
                      <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase block">Present</span>
                      <span className="text-base font-black text-emerald-500 mt-1 block">{presentCount}</span>
                    </div>
                    <div className="bg-rose-500/5 dark:bg-rose-500/10 p-3.5 rounded-xl border border-rose-500/10 text-center">
                      <span className="text-[8px] text-rose-600 dark:text-rose-400 font-extrabold uppercase block">Absent</span>
                      <span className="text-base font-black text-rose-500 mt-1 block">{absentCount}</span>
                    </div>
                    <div className="bg-purple-500/5 dark:bg-purple-500/10 p-3.5 rounded-xl border border-purple-500/10 text-center">
                      <span className="text-[8px] text-purple-600 dark:text-purple-400 font-extrabold uppercase block">Rate</span>
                      <span className="text-base font-black text-purple-500 mt-1 block">{attendanceRate}%</span>
                    </div>
                  </div>

                  {/* Attendance Roster Checklist */}
                  <div className="border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-950/80 px-4 py-3 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>Student Name</span>
                      <span>Attendance Status</span>
                    </div>

                    {loadingInvitations ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                        <RefreshCw size={20} className="animate-spin text-purple-600" />
                        <span className="text-[10px]">Fetching session roster...</span>
                      </div>
                    ) : invitations.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs font-bold">
                        No students are invited to this session.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-850/60 max-h-[260px] overflow-y-auto pr-1">
                        {invitations.map((invite) => {
                          const isCancelled = getSessionStatus(selectedSession) === "Cancelled";
                          return (
                            <div
                              key={invite.invitation_id}
                              className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors"
                            >
                              <div className="text-left pr-4">
                                <p className="font-extrabold text-xs text-slate-800 dark:text-white">
                                  {invite.student_name}
                                </p>
                                <p className="text-slate-400 dark:text-slate-500 text-[9px] mt-0.5 font-semibold">
                                  Roll No: {invite.roll_no} | Div {invite.division || "A"}
                                </p>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {getSessionStatus(selectedSession) === "In Progress" ? (
                                  <>
                                    {/* Present Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStatus(invite.invitation_id, "Present")}
                                      disabled={updatingInvitationId === invite.invitation_id}
                                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black cursor-pointer transition-all ${
                                        invite.status === "Present" || invite.status === "Attended"
                                          ? "bg-emerald-500 text-white shadow-sm border-none"
                                          : "bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-550 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850"
                                      }`}
                                    >
                                      Present
                                    </button>
                                    {/* Absent Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStatus(invite.invitation_id, "Absent")}
                                      disabled={updatingInvitationId === invite.invitation_id}
                                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black cursor-pointer transition-all ${
                                        invite.status === "Absent"
                                          ? "bg-rose-500 text-white shadow-sm border-none"
                                          : "bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-550 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850"
                                      }`}
                                    >
                                      Absent
                                    </button>
                                  </>
                                ) : (
                                  /* Read-only status badges for other lifecycle states */
                                  <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black border ${
                                    invite.status === "Present" || invite.status === "Attended"
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                      : invite.status === "Absent"
                                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                      : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
                                  }`}>
                                    {invite.status === "Present" || invite.status === "Attended" ? "Present" : invite.status === "Absent" ? "Absent" : "Invited"}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Completion Notes Section (Read-Only Academic Summary) */}
                {getSessionStatus(selectedSession) === "Completed" && (
                  <div className="space-y-4 border-t border-slate-100 dark:border-slate-800/80 pt-6">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FileText size={14} className="text-purple-500" /> Academic Summary & Follow-up
                    </h4>

                    <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850/60 rounded-2xl p-4 space-y-3.5">
                      <div>
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Session Outcome</span>
                        <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed mt-1 font-semibold whitespace-pre-line">
                          {selectedSession.outcome || "N/A"}
                        </p>
                      </div>
                      <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Faculty Remarks</span>
                        <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed mt-1 font-semibold whitespace-pre-line">
                          {selectedSession.remarks || "N/A"}
                        </p>
                      </div>
                      <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Next Recommendations</span>
                        <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed mt-1 font-semibold whitespace-pre-line">
                          {selectedSession.recommendation || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Schedule / Edit Session Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 shrink-0">
                <div>
                  <h3 className="font-black text-xl text-slate-900 dark:text-white">
                    {editMode ? "Modify Scheduled Review" : "Schedule Remedial Review"}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">
                    {editMode 
                      ? "Update session specifications, location, timing, and invited students roster."
                      : "Set up support targets, choose time/location, and select students to invite."
                    }
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 bg-slate-200 dark:bg-slate-850 hover:bg-slate-300 dark:hover:bg-slate-750 text-slate-500 rounded-full cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body / Scrollable Form */}
              <form onSubmit={handleScheduleSession} className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Topic */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase block">Session Topic *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DBMS Normalization and Joins"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full px-4 py-2.5 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-slate-250"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase block">Location / Online Link *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lab 4B or Google Meet link"
                      value={locationStr}
                      onChange={(e) => setLocationStr(e.target.value)}
                      className="w-full px-4 py-2.5 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-slate-250"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase block">Session Date *</label>
                    <input
                      type="date"
                      required
                      value={sessionDate}
                      onChange={(e) => setSessionDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-805 dark:text-slate-100"
                    />
                  </div>

                  {/* Time */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase block">Start Time *</label>
                    <input
                      type="time"
                      required
                      value={sessionTime}
                      onChange={(e) => setSessionTime(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-805 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase block">Overview & Objective (Optional)</label>
                  <textarea
                    placeholder="Briefly explain the focus of this review session..."
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-slate-808 dark:text-slate-200 placeholder-slate-400"
                  />
                </div>

                {/* Students checklist */}
                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black uppercase text-slate-400">
                      Select Students to Invite * ({selectedStudentIds.length} Selected)
                    </label>
                    <button
                      type="button"
                      onClick={handleSelectAllStudents}
                      className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer"
                    >
                      {selectedStudentIds.length === classStudents.length ? "Clear All" : "Select All Class"}
                    </button>
                  </div>

                  {/* Search Roster checklist */}
                  <div className="relative">
                    <Search size={14} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search students by name or roll number..."
                      value={studentSearchTerm}
                      onChange={(e) => setStudentSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55/30 dark:bg-slate-950/30 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-800 dark:text-slate-250"
                    />
                  </div>

                  {loadingStudents ? (
                    <div className="text-center py-6 text-slate-450 text-xs font-bold">
                      Loading class students...
                    </div>
                  ) : filteredStudentsToChecklist.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs font-bold">
                      No students found matching your criteria.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                      {filteredStudentsToChecklist.map((student) => {
                        const isChecked = selectedStudentIds.includes(student.student_id);
                        return (
                          <div
                            key={student.student_id}
                            onClick={() => toggleStudentSelection(student.student_id)}
                            className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all select-none ${
                              isChecked
                                ? "bg-purple-500/10 border-purple-500/30 dark:border-purple-400/30"
                                : "bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-850/60"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="accent-purple-650 rounded"
                            />
                            <div className="text-left">
                              <p className="text-xs font-bold text-slate-850 dark:text-slate-100">
                                {student.full_name}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {student.roll_no} | Div {student.division || "N/A"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingSession}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl text-xs shadow-md cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {submittingSession && <RefreshCw size={12} className="animate-spin" />}
                    {editMode ? "Save Changes" : "Confirm Schedule"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Start Session Confirmation Modal */}
      <AnimatePresence>
        {isStartModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-6"
            >
              <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center shrink-0">
                  <Play size={20} className="fill-current" />
                </div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  Start Remedial Session?
                </h3>
              </div>

              <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                Are you ready to commence the session <strong>"{selectedSession?.topic}"</strong>? This will transition the session status to <strong>"In Progress"</strong> and unlock the student attendance roster.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStartModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={handleStartSession}
                  disabled={startingSession}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl text-xs shadow-md cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {startingSession && <RefreshCw size={12} className="animate-spin" />}
                  Commence Session
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancel Session Modal */}
      <AnimatePresence>
        {isCancelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-6"
            >
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center shrink-0">
                  <AlertCircle size={20} />
                </div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  Cancel Remedial Session?
                </h3>
              </div>

              <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                Please specify the reason for cancelling the session <strong>"{selectedSession?.topic}"</strong>. This action is permanent.
              </p>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider ml-1">Cancellation Reason *</label>
                  <select
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="Faculty Unavailable">Faculty Unavailable</option>
                    <option value="Institutional Holiday / Postponed">Institutional Holiday / Postponed</option>
                    <option value="Low Student Attendance expected">Low Student Attendance expected</option>
                    <option value="Technical / Infrastructure Issue">Technical / Infrastructure Issue</option>
                    <option value="Other">Other (Specify below)</option>
                  </select>
                </div>

                {cancellationReason === "Other" && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider ml-1">Custom Reason *</label>
                    <textarea
                      rows={2}
                      placeholder="Enter the custom cancellation reason..."
                      value={customCancellationReason}
                      onChange={(e) => setCustomCancellationReason(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-slate-808 dark:text-slate-200 placeholder-slate-400"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={handleCancelSession}
                  disabled={cancellingSession}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs shadow-md cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {cancellingSession && <RefreshCw size={12} className="animate-spin" />}
                  Cancel Session
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Complete Session Modal */}
      <AnimatePresence>
        {isCompleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-6"
            >
              <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/5 flex items-center justify-center shrink-0">
                  <CheckCircle size={20} />
                </div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  Record Academic Summary & Complete
                </h3>
              </div>

              <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                Please log the academic outcome for session <strong>"{selectedSession?.topic}"</strong>. Doing so will permanently lock the attendance registry.
              </p>

              <div className="space-y-4">
                {/* Outcome */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider ml-1">Session Outcome *</label>
                  <textarea
                    rows={3}
                    placeholder="What was discussed, student performance, key takeaways..."
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-purple-550 resize-none text-slate-808 dark:text-slate-200 placeholder-slate-400 font-semibold"
                  />
                </div>

                {/* Remarks */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider ml-1">Faculty Remarks *</label>
                  <textarea
                    rows={2}
                    placeholder="Observations on student understanding or difficulties..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-purple-550 resize-none text-slate-808 dark:text-slate-200 placeholder-slate-400 font-semibold"
                  />
                </div>

                {/* Recommendation */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider ml-1">Next Recommendation *</label>
                  <textarea
                    rows={2}
                    placeholder="Next steps (e.g. recommend self-study on module X, follow-up test...)"
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-purple-550 resize-none text-slate-808 dark:text-slate-200 placeholder-slate-400 font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCompleteModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-550 text-white font-black rounded-xl text-xs shadow-md cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingNotes && <RefreshCw size={12} className="animate-spin" />}
                  Log Outcome & Lock
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RemedialSessions;
