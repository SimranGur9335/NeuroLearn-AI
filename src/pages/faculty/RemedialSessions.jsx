import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  BookOpen
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
  const [invitations, setInvitations] = useState([]);
  const [classStudents, setClassStudents] = useState([]);
  
  // Loaders & Errors
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submittingSession, setSubmittingSession] = useState(false);
  const [updatingInvitationId, setUpdatingInvitationId] = useState(null);

  // Form & Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("10:00");
  const [locationStr, setLocationStr] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");

  // Alerts
  const [alertInfo, setAlertInfo] = useState(null);

  const showAlert = (message, type = "success") => {
    setAlertInfo({ message, type });
    setTimeout(() => setAlertInfo(null), 4000);
  };

  // 1. Fetch Remedial Sessions list
  const fetchSessions = async () => {
    if (!facultyId) return;
    setLoadingSessions(true);
    try {
      const res = await fetch(`http://localhost:8000/remedial/sessions?faculty_id=${facultyId}`);
      if (!res.ok) throw new Error("Failed to fetch sessions");
      const data = await res.json();
      // Filter sessions for the active class if selected
      const filtered = selectedClass.class_id
        ? data.filter(s => s.class_id === selectedClass.class_id)
        : data;
      setSessions(filtered);
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
      const res = await fetch(`http://localhost:8000/class/${selectedClass.class_id}/students`);
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
      const res = await fetch(`http://localhost:8000/remedial/sessions/${sessionId}/invitations?faculty_id=${facultyId}`);
      if (!res.ok) throw new Error("Failed to fetch invitations");
      const data = await res.json();
      setInvitations(data);
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
        setIsModalOpen(true);
        // Clean location state so it doesn't trigger again on reload
        navigate(location.pathname, { replace: true, state: null });
      } else if (location.state?.preselectedStudentId) {
        const studId = Number(location.state.preselectedStudentId);
        setSelectedStudentIds([studId]);
        setIsModalOpen(true);
        // Clean location state so it doesn't trigger again on reload
        navigate(location.pathname, { replace: true, state: null });
      }
    }
  }, [location.state, classStudents]);

  // Handle session click
  const handleSelectSession = (session) => {
    setSelectedSession(session);
    fetchInvitations(session.session_id);
  };

  // Handle scheduling submission
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
      const res = await fetch("http://localhost:8000/remedial/sessions", {
        method: "POST",
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
        throw new Error(err.detail || "Failed to schedule session");
      }

      showAlert("Remedial session scheduled successfully!");
      setIsModalOpen(false);
      // Clear form
      setTopic("");
      setDescription("");
      setSessionDate("");
      setSessionTime("10:00");
      setLocationStr("");
      setSelectedStudentIds([]);
      // Refresh list
      fetchSessions();
    } catch (err) {
      console.error(err);
      showAlert(err.message || "Failed to schedule session", "error");
    } finally {
      setSubmittingSession(false);
    }
  };

  // Handle updating status of an individual invitation
  const handleUpdateStatus = async (invitationId, newStatus) => {
    setUpdatingInvitationId(invitationId);
    try {
      const res = await fetch(`http://localhost:8000/remedial/invitations/${invitationId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          faculty_id: facultyId
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to update invitation status");
      }

      showAlert("Attendance status updated successfully!");
      // Update local state list
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

  // Filter student checklist
  const filteredStudentsToChecklist = classStudents.filter(s => 
    s.full_name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    s.roll_no.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

  // Compute stats
  const totalSessions = sessions.length;
  const attendedCount = invitations.filter(i => i.status === "Attended").length;
  const absentCount = invitations.filter(i => i.status === "Absent").length;
  const totalLoggedAttendance = attendedCount + absentCount;
  const attendanceRate = totalLoggedAttendance > 0 
    ? Math.round((attendedCount / totalLoggedAttendance) * 100) 
    : 0;

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
      className="space-y-6 font-sans text-slate-800 dark:text-slate-200"
    >
      {/* Alert Banner */}
      <AnimatePresence>
        {alertInfo && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-white font-bold text-xs ${
              alertInfo.type === "error" ? "bg-red-500" : "bg-emerald-500"
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
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md cursor-pointer transition-all shrink-0"
        >
          <Plus size={14} /> Schedule Remedial Class
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex justify-between items-center transition-all hover:translate-y-[-2px]">
          <div>
            <span className="text-[10px] text-slate-450 uppercase block font-bold">Total Remedial Classes</span>
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
            <span className="text-[10px] text-slate-450 uppercase block font-bold">Average Attendance Rate</span>
            <span className="text-2xl font-black text-emerald-500 mt-1 block">
              {attendanceRate}% Attended
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-500 font-black">
            <CheckCircle size={18} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex justify-between items-center transition-all hover:translate-y-[-2px]">
          <div>
            <span className="text-[10px] text-slate-450 uppercase block font-bold">Active Invitations</span>
            <span className="text-2xl font-black text-blue-500 mt-1 block">
              {invitations.length} Students
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-blue-500 font-black">
            <Users size={18} />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Sessions List */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen size={18} className="text-purple-500" />
            Scheduled Review Sessions
          </h3>

          {loadingSessions ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
              <RefreshCw size={24} className="animate-spin text-purple-650" />
              <span className="text-xs">Fetching sessions...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">
              No remedial sessions scheduled for this class. Click "Schedule Remedial Class" above to set one up.
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {sessions.map((session) => {
                const isSelected = selectedSession?.session_id === session.session_id;
                return (
                  <motion.div
                    key={session.session_id}
                    onClick={() => handleSelectSession(session)}
                    whileHover={{ scale: 1.01 }}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? "bg-purple-500/10 border-purple-500 dark:border-purple-400 shadow-sm"
                        : "bg-slate-55/40 dark:bg-slate-950/40 border-slate-150 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-850/60"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {session.topic}
                      </h4>
                      <span className="text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-650 dark:text-purple-400 px-2 py-0.5 rounded-full shrink-0">
                        {session.subject_name}
                      </span>
                    </div>

                    {session.description && (
                      <p className="text-slate-400 text-xs mt-1.5 line-clamp-2">
                        {session.description}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-[10px] text-slate-450 border-t border-slate-100 dark:border-slate-800 pt-3">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{session.session_date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{session.session_time}</span>
                      </div>
                      <div className="flex items-center gap-1 ml-auto">
                        <MapPin size={12} />
                        <span>{session.location}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: Attendance / Roster list */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-6">
          {selectedSession ? (
            <div className="space-y-6">
              {/* Session Detail Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-black text-xl text-slate-900 dark:text-white">
                      {selectedSession.topic}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-3">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {selectedSession.session_date}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {selectedSession.session_time}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} /> {selectedSession.location}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSession(null);
                      setInvitations([]);
                    }}
                    className="p-1.5 bg-slate-100 dark:bg-slate-850 rounded-full hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
                {selectedSession.description && (
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    {selectedSession.description}
                  </p>
                )}
              </div>

              {/* Invitation Roster List */}
              <div className="space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users size={14} /> Invited Students & Attendance
                </h4>

                {loadingInvitations ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
                    <RefreshCw size={24} className="animate-spin text-purple-650" />
                    <span className="text-xs">Fetching roster...</span>
                  </div>
                ) : invitations.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">
                    No students invited to this session.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {invitations.map((invite) => (
                      <div
                        key={invite.invitation_id}
                        className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl"
                      >
                        <div>
                          <p className="font-extrabold text-sm text-slate-800 dark:text-white">
                            {invite.student_name}
                          </p>
                          <p className="text-slate-400 text-[10px] mt-0.5">
                            Roll No: {invite.roll_no} | {invite.email}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Attendance Status Badge */}
                          <span className={`text-[10px] font-black uppercase px-2.5 py-1.5 rounded-xl border shrink-0 ${
                            invite.status === "Attended"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : invite.status === "Absent"
                              ? "bg-red-500/10 text-red-500 border-red-500/20"
                              : invite.status === "Cancelled"
                              ? "bg-slate-500/10 text-slate-500 border-slate-500/20"
                              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          }`}>
                            {invite.status}
                          </span>

                          {/* Quick Change Select Box */}
                          <select
                            value={invite.status}
                            disabled={updatingInvitationId === invite.invitation_id}
                            onChange={(e) => handleUpdateStatus(invite.invitation_id, e.target.value)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-2 py-1 text-xs font-bold text-slate-650 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                          >
                            <option value="Invited">Invited</option>
                            <option value="Attended">Attended</option>
                            <option value="Absent">Absent</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
              <GraduationCap size={48} className="text-slate-200 dark:text-slate-800 mb-2 animate-pulse" />
              <h4 className="font-bold text-sm">No Session Selected</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Select a scheduled review session from the left column to view its student roster and record attendance.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Session Modal */}
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
                    Schedule Remedial Review
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Set up support targets, choose time/location, and select students to invite.
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
                    <label className="text-xs font-bold text-slate-450 block">Session Topic *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DBMS Normalization and Joins"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-450 block">Location / Online Link *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lab 4B or Google Meet link"
                      value={locationStr}
                      onChange={(e) => setLocationStr(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-450 block">Session Date *</label>
                    <input
                      type="date"
                      required
                      value={sessionDate}
                      onChange={(e) => setSessionDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  {/* Time */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-450 block">Start Time *</label>
                    <input
                      type="time"
                      required
                      value={sessionTime}
                      onChange={(e) => setSessionTime(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 block">Overview & Objective (Optional)</label>
                  <textarea
                    placeholder="Briefly explain the focus of this review session..."
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>

                {/* Students checklist */}
                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black uppercase text-slate-450">
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
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55/30 dark:bg-slate-950/30 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  {loadingStudents ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      Loading class students...
                    </div>
                  ) : filteredStudentsToChecklist.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs">
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
                              className="accent-purple-600 rounded"
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
                    Confirm Schedule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RemedialSessions;
