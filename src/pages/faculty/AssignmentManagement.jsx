import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from "../../context/AuthContext";
import { uploadToSupabase } from '../../utils/supabaseClient';
import {
  ClipboardList,
  Plus,
  Search,
  Calendar,
  ChevronRight,
  Download,
  GraduationCap,
  Trash2,
  Edit,
  X,
  AlertTriangle,
  CheckCircle,
  FileText,
  Clock,
  UserCheck,
  Award,
  ExternalLink,
  BookOpen,
  UploadCloud,
  FileDown,
  Link,
  MessageSquare,
  Eye,
  Check,
  AlertCircle
} from 'lucide-react';

const AssignmentManagement = () => {
  const navigate = useNavigate();
  const selectedClass = JSON.parse(localStorage.getItem("selectedClass") || "{}");
  const { user } = useAuth();
  const facultyId = user?.faculty_id;
  const institutionId = user?.institution_id || 1;

  // State lists
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals & Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // "create" | "edit"
  const [editId, setEditId] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    due_date: "",
    due_time: "23:59",
    total_marks: 100,
    status: "Published",
    attachment_url: "",
    attachment_name: "",
    attachment_type: "",
    attachment_size: 0
  });

  // Grading Modal states
  const [isGradingOpen, setIsGradingOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradingMarks, setGradingMarks] = useState("");
  const [gradingFeedback, setGradingFeedback] = useState("");
  const [gradingStatus, setGradingStatus] = useState("Graded");

  // Deletion Modal states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteTitle, setDeleteTitle] = useState("");

  // Alerts
  const [alertInfo, setAlertInfo] = useState(null);

  const showAlert = (message, type = "success") => {
    setAlertInfo({ message, type });
    setTimeout(() => setAlertInfo(null), 4000);
  };

  useEffect(() => {
    if (!selectedClass.class_id) {
      setLoading(false);
      return;
    }
    fetchAssignments();
  }, [selectedClass.class_id]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/assignments?class_id=${selectedClass.class_id}&subject_id=${selectedClass.subject_id}`
      );
      if (!res.ok) throw new Error("Failed to load assignments");
      const data = await res.json();
      setAssignments(data);
    } catch (err) {
      console.error(err);
      showAlert("Error fetching assignments", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    setSubmissionsLoading(true);
    try {
      const res = await fetch(`/assignments/${assignmentId}/submissions`);
      if (!res.ok) throw new Error("Failed to fetch submissions");
      const data = await res.json();
      setSubmissions(data);
    } catch (err) {
      console.error(err);
      showAlert("Error fetching submissions", "error");
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleSelectAssignment = (assign) => {
    setSelectedAssignment(assign);
    setIsDrawerOpen(true);
    fetchSubmissions(assign.assignment_id);
  };

  const handleCloseIntake = async () => {
    try {
      const res = await fetch(`http://localhost:8000/assignments/${selectedAssignment.assignment_id}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faculty_id: facultyId })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to close intake");
      }
      showAlert("Submission intake closed successfully!", "success");
      const updated = { ...selectedAssignment, status: "Closed" };
      setSelectedAssignment(updated);
      setAssignments(prev => prev.map(a => a.assignment_id === updated.assignment_id ? updated : a));
    } catch (err) {
      console.error(err);
      showAlert(err.message || "Failed to close intake", "error");
    }
  };

  const handleReopenIntake = async () => {
    try {
      const res = await fetch(`http://localhost:8000/assignments/${selectedAssignment.assignment_id}/reopen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faculty_id: facultyId })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to reopen assignment");
      }
      showAlert("Assignment reopened successfully! Students can submit work again.", "success");
      const updated = { ...selectedAssignment, status: "Published" };
      setSelectedAssignment(updated);
      setAssignments(prev => prev.map(a => a.assignment_id === updated.assignment_id ? updated : a));
    } catch (err) {
      console.error(err);
      showAlert(err.message || "Failed to reopen assignment", "error");
    }
  };

  const handlePublishDraft = async (assign) => {
    try {
      const payload = {
        subject_id: assign.subject_id,
        class_id: assign.class_id,
        title: assign.title,
        description: assign.description,
        instructions: assign.instructions || "",
        due_date: assign.due_date,
        due_time: assign.due_time || "23:59",
        total_marks: Number(assign.total_marks),
        status: "Published",
        attachment_url: assign.attachment_url || "",
        attachment_name: assign.attachment_name || "",
        attachment_type: assign.attachment_type || "",
        attachment_size: assign.attachment_size ? Number(assign.attachment_size) : 0,
        faculty_id: facultyId
      };

      const res = await fetch(`/assignments/${assign.assignment_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Publishing failed");
      }

      showAlert("Assignment published and student notifications dispatched!", "success");
      fetchAssignments();
      if (selectedAssignment?.assignment_id === assign.assignment_id) {
        const updated = { ...selectedAssignment, status: "Published" };
        setSelectedAssignment(updated);
        fetchSubmissions(assign.assignment_id);
      }
    } catch (err) {
      console.error(err);
      showAlert(err.message || "Failed to publish assignment", "error");
    }
  };

  const handleOpenCreate = () => {
    setFormMode("create");
    setEditId(null);
    setFormData({
      title: "",
      description: "",
      instructions: "",
      due_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      due_time: "23:59",
      total_marks: 100,
      status: "Published",
      attachment_url: "",
      attachment_name: "",
      attachment_type: "",
      attachment_size: 0
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (assign, e) => {
    if (e) e.stopPropagation();
    setFormMode("edit");
    setEditId(assign.assignment_id);
    setFormData({
      title: assign.title,
      description: assign.description,
      instructions: assign.instructions || "",
      due_date: assign.due_date,
      due_time: assign.due_time || "23:59",
      total_marks: assign.total_marks,
      status: assign.status || "Published",
      attachment_url: assign.attachment_url || "",
      attachment_name: assign.attachment_name || "",
      attachment_type: assign.attachment_type || "",
      attachment_size: assign.attachment_size || 0
    });
    setIsFormOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingFile(true);
      const safeFilename = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const folderPath = `resources/${selectedClass.class_id}/${Date.now()}_${safeFilename}`;
      
      const uploadUrl = await uploadToSupabase(file, folderPath);
      
      setFormData(prev => ({
        ...prev,
        attachment_url: uploadUrl,
        attachment_name: file.name,
        attachment_type: file.name.split('.').pop().toUpperCase(),
        attachment_size: file.size
      }));
      showAlert("Supporting resource uploaded successfully!", "success");
    } catch (err) {
      console.error(err);
      showAlert("File upload failed: " + err.message, "error");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRemoveAttachment = () => {
    setFormData(prev => ({
      ...prev,
      attachment_url: "",
      attachment_name: "",
      attachment_type: "",
      attachment_size: 0
    }));
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.due_date) {
      showAlert("Please enter a valid title and due date.", "error");
      return;
    }

    try {
      const payload = {
        subject_id: selectedClass.subject_id,
        class_id: selectedClass.class_id,
        title: formData.title,
        description: formData.description,
        instructions: formData.instructions,
        due_date: formData.due_date,
        due_time: formData.due_time,
        total_marks: Number(formData.total_marks),
        status: formData.status,
        attachment_url: formData.attachment_url || null,
        attachment_name: formData.attachment_name || null,
        attachment_type: formData.attachment_type || null,
        attachment_size: formData.attachment_size ? Number(formData.attachment_size) : null,
        faculty_id: facultyId
      };

      let url = "/assignments";
      let method = "POST";

      if (formMode === "edit") {
        url = `/assignments/${editId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Save operation failed");
      }

      showAlert(
        `Assignment successfully ${formMode === "create" ? "created" : "updated"}!`,
        "success"
      );
      setIsFormOpen(false);
      fetchAssignments();
      if (formMode === "edit" && selectedAssignment?.assignment_id === editId) {
        // Refresh drawer too
        const updated = { ...selectedAssignment, ...payload };
        setSelectedAssignment(updated);
      }
    } catch (err) {
      console.error(err);
      showAlert(err.message || "Failed to save assignment", "error");
    }
  };

  const handleOpenDelete = (assignmentId, title, e) => {
    if (e) e.stopPropagation();
    setDeleteId(assignmentId);
    setDeleteTitle(title);
    setIsDeleteOpen(true);
  };

  const handleDeleteAssignment = async () => {
    try {
      const res = await fetch(
        `/assignments/${deleteId}?faculty_id=${facultyId}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Delete operation failed");
      }

      showAlert("Assignment deleted successfully", "success");
      setIsDeleteOpen(false);
      setIsDrawerOpen(false);
      setSelectedAssignment(null);
      fetchAssignments();
    } catch (err) {
      console.error(err);
      showAlert(err.message || "Failed to delete assignment", "error");
    }
  };

  const handleOpenGrading = (sub) => {
    setSelectedSubmission(sub);
    setGradingMarks(sub.marks_obtained !== null ? sub.marks_obtained : "");
    setGradingFeedback(sub.feedback || "");
    setGradingStatus(sub.status === "Pending" ? "Graded" : sub.status);
    setIsGradingOpen(true);
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (gradingMarks === "" || isNaN(Number(gradingMarks))) {
      showAlert("Please enter valid marks.", "error");
      return;
    }

    const marksVal = Number(gradingMarks);
    if (marksVal < 0 || marksVal > (selectedAssignment?.total_marks || 100)) {
      showAlert(`Marks must be between 0 and ${selectedAssignment?.total_marks || 100}`, "error");
      return;
    }

    try {
      const payload = {
        marks_obtained: marksVal,
        status: gradingStatus,
        feedback: gradingFeedback,
        faculty_id: facultyId
      };

      const res = await fetch(`/submissions/${selectedSubmission.submission_id}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to grade submission");
      }

      showAlert("Submission graded successfully!", "success");
      setIsGradingOpen(false);
      fetchSubmissions(selectedAssignment.assignment_id);
    } catch (err) {
      console.error(err);
      showAlert(err.message || "Failed to submit grading", "error");
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const filteredAssignments = assignments.filter((assign) =>
    assign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assign.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSubmissionsStats = () => {
    const total = submissions.length;
    const graded = submissions.filter(s => s.status === "Graded").length;
    const submitted = submissions.filter(s => s.status === "Submitted" || s.status === "Late").length;
    const pending = submissions.filter(s => s.status === "Pending").length;
    return { total, graded, submitted, pending };
  };

  const stats = getSubmissionsStats();

  if (!selectedClass.class_id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-slate-900 rounded-3xl border border-slate-800">
        <div className="p-4 bg-purple-500/10 rounded-full mb-6">
          <BookOpen className="text-purple-500" size={48} />
        </div>
        <h2 className="text-2xl font-bold dark:text-white text-slate-800 mb-2">
          No Classroom Selected
        </h2>
        <p className="text-slate-400 max-w-md mb-6">
          Please select a classroom first in your workspace menu to view or manage academic assignments.
        </p>
        <button
          onClick={() => navigate('/faculty/select-class')}
          className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold px-6 py-3 rounded-xl transition-all shadow-lg cursor-pointer"
        >
          Select Workspace Class
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-200">
      {/* Alert Banner */}
      <AnimatePresence>
        {alertInfo && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-3 rounded-2xl border shadow-xl ${
              alertInfo.type === "success"
                ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-300"
                : "bg-red-950/80 border-red-500/30 text-red-300"
            } backdrop-blur-md`}
          >
            {alertInfo.type === "success" ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
            <span className="font-semibold text-sm">{alertInfo.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workspace Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-950 to-slate-900 border border-purple-900/50 p-6 rounded-3xl relative overflow-hidden shadow-xl text-white">
        <div className="absolute right-0 top-0 w-64 h-64 bg-radial-gradient(circle,rgba(168,85,247,0.15)_0%,transparent_70%) pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Active Workspace
            </span>
            <h1 className="text-3xl md:text-4xl font-black mt-3">
              Assignment Management
            </h1>
            <p className="text-slate-300 mt-1.5 text-xs font-semibold">
              {selectedClass.subject_name || "Database Systems"} • {selectedClass.class_name || "TE Computer A"}
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="bg-white hover:bg-slate-100 text-purple-950 font-extrabold px-5 py-3 rounded-xl transition-all shadow-lg text-xs cursor-pointer shrink-0 flex items-center gap-2"
          >
            <Plus size={16} /> Create Assignment
          </button>
        </div>
      </div>

      {/* Assignments Dashboard List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-850 dark:text-white">Active Curriculum Coursework</h2>
            <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Manage drafts, publish deadlines, and grade outcomes</p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-11 pr-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 font-semibold flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            Loading academic curriculum...
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl font-semibold">
            No coursework tasks found. Click "Create Assignment" to dispatch a new one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.map((assign) => {
              const isOverdue = new Date() > new Date(assign.due_date);
              const submitted = assign.submitted_count || 0;
              const total = assign.total_count || 0;
              const progress = total > 0 ? Math.round((submitted / total) * 100) : 0;

              let badgeStyle = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
              if (assign.status === "Draft") badgeStyle = "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
              else if (assign.status === "Closed") badgeStyle = "bg-rose-500/10 text-rose-500 border-rose-500/20";

              return (
                <motion.div
                  whileHover={{ y: -3 }}
                  key={assign.assignment_id}
                  className="bg-slate-50/40 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-3xl p-5 flex flex-col justify-between hover:shadow-lg transition-all"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <span className={`text-[8px] font-black uppercase px-2.5 py-0.5 rounded-full border ${badgeStyle}`}>
                        {assign.status || "Published"}
                      </span>
                      {assign.status === "Draft" && (
                        <button
                          onClick={() => handlePublishDraft(assign)}
                          className="bg-purple-600 hover:bg-purple-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-sm flex items-center gap-0.5 cursor-pointer"
                        >
                          <UserCheck size={8} /> Publish
                        </button>
                      )}
                    </div>
                    
                    <h3 className="font-extrabold text-base text-slate-850 dark:text-white line-clamp-1">
                      {assign.title}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1.5 line-clamp-2 min-h-[32px]">
                      {assign.description || "No description provided."}
                    </p>

                    {assign.status !== "Draft" && (
                      <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between text-[10px] text-slate-450 font-bold">
                          <span>Progress: {submitted}/{total} Submissions</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-850/50 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-slate-400 uppercase font-black">Deadline</p>
                      <p className="text-xs font-bold text-slate-650 dark:text-slate-300 flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400" />
                        {assign.due_date}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(assign)}
                        className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500/40 rounded-xl text-slate-400 hover:text-purple-600 transition-colors cursor-pointer"
                        title="Edit Coursework"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => handleSelectAssignment(assign)}
                        className="bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/30 text-purple-650 dark:text-purple-400 font-extrabold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                      >
                        View & Grade <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Side Slide-in Detail Drawer */}
      <AnimatePresence>
        {isDrawerOpen && selectedAssignment && (
          <div className="fixed inset-0 z-40 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Panel */}
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-screen max-w-2xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between"
              >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between bg-slate-50/50 dark:bg-slate-950/10">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[8px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        selectedAssignment.status === "Draft" 
                          ? "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
                          : selectedAssignment.status === "Closed"
                            ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      }`}>
                        {selectedAssignment.status || "Published"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Max: {selectedAssignment.total_marks} Marks
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mt-2">
                      {selectedAssignment.title}
                    </h2>
                    <p className="text-slate-400 text-xs mt-1 font-semibold">
                      Due Date: {selectedAssignment.due_date} at {selectedAssignment.due_time || "23:59"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsDrawerOpen(false)}
                      className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer text-slate-500"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-3 bg-purple-50/20 dark:bg-slate-950/30 p-4 rounded-2xl border border-purple-500/10">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block w-full mb-1">Lifecycle Actions</span>
                    {selectedAssignment.status === "Draft" && (
                      <button
                        onClick={() => handlePublishDraft(selectedAssignment)}
                        className="bg-purple-650 hover:bg-purple-650/90 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <UserCheck size={14} /> Publish Coursework
                      </button>
                    )}
                    {selectedAssignment.status === "Published" && (
                      <button
                        onClick={handleCloseIntake}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Clock size={14} /> Close Submission Intake
                      </button>
                    )}
                    {selectedAssignment.status === "Closed" && (
                      <button
                        onClick={handleReopenIntake}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Clock size={14} /> Reopen Submissions
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEdit(selectedAssignment)}
                      className="bg-white hover:bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 font-extrabold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Edit size={14} /> Edit details
                    </button>
                    <button
                      onClick={() => handleOpenDelete(selectedAssignment.assignment_id, selectedAssignment.title)}
                      className="bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-extrabold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer ml-auto"
                    >
                      <Trash2 size={14} /> Delete Coursework
                    </button>
                  </div>

                  {/* Description & Instructions */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</h3>
                      <p className="text-sm mt-1.5 text-slate-650 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {selectedAssignment.description || "No description provided."}
                      </p>
                    </div>

                    {selectedAssignment.instructions && (
                      <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Academic Instructions</h3>
                        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 mt-1.5">
                          <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed font-mono">
                            {selectedAssignment.instructions}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Supporting Attachments */}
                  {selectedAssignment.attachment_url && (
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Supporting Coursework Material</h3>
                      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-600">
                            <FileText size={22} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                              {selectedAssignment.attachment_name || "Attachment File"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                              {selectedAssignment.attachment_type || "File"} • {selectedAssignment.attachment_size ? formatBytes(selectedAssignment.attachment_size) : "N/A"}
                            </p>
                          </div>
                        </div>
                        <a
                          href={selectedAssignment.attachment_url}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 p-2.5 rounded-xl transition-colors shadow-sm"
                        >
                          <FileDown size={18} />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Progress telemetry */}
                  {selectedAssignment.status !== "Draft" && (
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-3">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Real-time submissions progress</h3>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850 shadow-sm">
                          <p className="text-[9px] font-black uppercase text-slate-400">Total</p>
                          <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{stats.total}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850 shadow-sm">
                          <p className="text-[9px] font-black uppercase text-emerald-500">Graded</p>
                          <p className="text-lg font-bold text-emerald-500 mt-0.5">{stats.graded}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850 shadow-sm">
                          <p className="text-[9px] font-black uppercase text-blue-500">Submitted</p>
                          <p className="text-lg font-bold text-blue-500 mt-0.5">{stats.submitted}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850 shadow-sm">
                          <p className="text-[9px] font-black uppercase text-yellow-500">Pending</p>
                          <p className="text-lg font-bold text-yellow-500 mt-0.5">{stats.pending}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submissions section */}
                  <div className="space-y-3.5">
                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Student Submission Registry</h3>

                    {submissionsLoading ? (
                      <div className="py-8 text-center text-slate-450 font-semibold">Loading student submissions...</div>
                    ) : submissions.length === 0 ? (
                      <div className="py-8 text-center text-slate-450 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                        No submissions recorded for this class.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {submissions.map((sub) => {
                          let statusBadge = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
                          if (sub.status === "Graded") statusBadge = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
                          else if (sub.status === "Submitted") statusBadge = "bg-blue-500/10 text-blue-500 border-blue-500/20";
                          else if (sub.status === "Late") statusBadge = "bg-rose-500/10 text-rose-500 border-rose-500/20";

                          return (
                            <div
                              key={sub.submission_id}
                              className="bg-slate-50/40 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              <div className="flex items-start gap-3">
                                <div className="p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 font-extrabold text-xs">
                                  {sub.roll_no}
                                </div>
                                <div>
                                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                                    {sub.student_name}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${statusBadge}`}>
                                      {sub.status || "Pending"}
                                    </span>
                                    {sub.submitted_at && (
                                      <span className="text-[9px] text-slate-400 font-bold">
                                        Submitted {sub.submitted_at.split(' ')[0]}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 self-end sm:self-auto">
                                <div className="flex gap-1">
                                  {sub.submission_url && (
                                    <a
                                      href={sub.submission_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-purple-500 transition-colors shadow-sm"
                                      title={sub.submission_file_name || "View submission file"}
                                    >
                                      <FileDown size={14} />
                                    </a>
                                  )}
                                  {sub.external_url && (
                                    <a
                                      href={sub.external_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-indigo-500 transition-colors shadow-sm"
                                      title="View external work link"
                                    >
                                      <Link size={14} />
                                    </a>
                                  )}
                                </div>

                                <div className="text-right">
                                  {sub.marks_obtained !== null ? (
                                    <div className="text-xs font-black text-slate-900 dark:text-white mr-1">
                                      <span className="text-purple-650 dark:text-purple-400">{sub.marks_obtained}</span>
                                      <span className="text-slate-400 font-semibold">/{selectedAssignment.total_marks}</span>
                                    </div>
                                  ) : (
                                    <p className="text-[9px] font-bold text-slate-400 uppercase mr-1">Not Graded</p>
                                  )}
                                </div>

                                {selectedAssignment.status !== "Draft" && sub.status !== "Pending" && (
                                  <button
                                    onClick={() => handleOpenGrading(sub)}
                                    className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md cursor-pointer"
                                  >
                                    {sub.marks_obtained !== null ? "Grade" : "Grade"}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer details */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 text-center text-[10px] font-bold text-slate-400 uppercase">
                  Classroom: {selectedClass.class_name} • Subject: {selectedClass.subject_name}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Assignment Create/Edit Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl p-6 relative z-10 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {formMode === "create" ? "Create Coursework Assignment" : "Edit Coursework Assignment"}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveAssignment} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                    Assignment Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="E.g., Generative AI & Deep Learning Project"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                      Due Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.due_time}
                      onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                      Total Marks *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={1000}
                      value={formData.total_marks}
                      onChange={(e) => setFormData({ ...formData, total_marks: Number(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                      Initial Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      <option value="Published">Published (Notify Students Immediately)</option>
                      <option value="Draft">Draft (Keep Hidden to Polish Later)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                    Description / General Overview
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter an outline of the coursework task..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                    Academic Instructions & Rubrics
                  </label>
                  <textarea
                    rows={3}
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="Provide specific guidelines, file constraints, or a detailed marking rubric..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-purple-500 transition-colors font-mono"
                  />
                </div>

                {/* File attachment uploader */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                    Supporting Coursework Material
                  </label>
                  
                  {formData.attachment_url ? (
                    <div className="bg-purple-50/20 dark:bg-slate-950 border border-purple-500/20 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="text-purple-600 shrink-0" size={20} />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {formData.attachment_name}
                          </p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                            {formData.attachment_type} • {formatBytes(formData.attachment_size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveAttachment}
                        className="text-red-500 hover:text-red-400 p-1 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-purple-500/50 rounded-2xl p-5 text-center transition-colors">
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        disabled={uploadingFile}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".pdf,.docx,.ppt,.pptx,.zip,image/*"
                      />
                      <div className="flex flex-col items-center justify-center gap-2">
                        {uploadingFile ? (
                          <>
                            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400">Uploading resource file...</p>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="text-slate-400" size={24} />
                            <p className="text-xs font-bold text-slate-850 dark:text-slate-300">
                              Upload attachment document
                            </p>
                            <p className="text-[9px] text-slate-450">
                              PDF, DOCX, PPT, PPTX, ZIP or Images (Max 15MB)
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="w-1/2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-extrabold py-3.5 rounded-xl text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingFile}
                    className="w-1/2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold py-3.5 rounded-xl text-xs transition-colors shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    {formMode === "create" ? "Dispatch Coursework" : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Grading Modal */}
      <AnimatePresence>
        {isGradingOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGradingOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl p-6 relative z-10 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Submit Academic Grade
                  </h3>
                  <p className="text-slate-400 text-xs mt-1 font-semibold">
                    Student: {selectedSubmission?.student_name} • Roll: {selectedSubmission?.roll_no}
                  </p>
                </div>
                <button
                  onClick={() => setIsGradingOpen(false)}
                  className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Submitted documents overview */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                <span className="text-[8px] font-black uppercase text-slate-400 block">Submitted Coursework Deliverables</span>
                
                {selectedSubmission?.submission_url ? (
                  <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-850 shadow-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="text-purple-500 shrink-0" size={18} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {selectedSubmission.submission_file_name || "Submitted File"}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">
                          {selectedSubmission.submission_file_size ? formatBytes(selectedSubmission.submission_file_size) : "Uploaded Attachment"}
                        </p>
                      </div>
                    </div>
                    <a
                      href={selectedSubmission.submission_url}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-500 hover:text-purple-600 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
                    >
                      <Download size={14} />
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-semibold italic">No file attachment uploaded.</p>
                )}

                {selectedSubmission?.external_url && (
                  <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-850 shadow-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <ExternalLink className="text-indigo-500 shrink-0" size={16} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          External Deliverable URL
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold truncate">
                          {selectedSubmission.external_url}
                        </p>
                      </div>
                    </div>
                    <a
                      href={selectedSubmission.external_url}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
                    >
                      <Link size={14} />
                    </a>
                  </div>
                )}
              </div>

              <form onSubmit={handleSaveGrade} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                      Marks Obtained (Max: {selectedAssignment?.total_marks || 100}) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={selectedAssignment?.total_marks || 100}
                      value={gradingMarks}
                      onChange={(e) => setGradingMarks(e.target.value)}
                      placeholder="Enter score..."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-purple-500 transition-colors font-bold text-purple-650"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                      Grading Status *
                    </label>
                    <select
                      value={gradingStatus}
                      onChange={(e) => setGradingStatus(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      <option value="Graded">Graded (Mark Complete)</option>
                      <option value="Submitted">Keep Submitted</option>
                      <option value="Late">Keep Late</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                    Grading Feedback & Remarks
                  </label>
                  <textarea
                    rows={3}
                    value={gradingFeedback}
                    onChange={(e) => setGradingFeedback(e.target.value)}
                    placeholder="Provide constructive feedback, highlight corrections, or outline rubrics details..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setIsGradingOpen(false)}
                    className="w-1/2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-extrabold py-3.5 rounded-xl text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold py-3.5 rounded-xl text-xs transition-colors shadow-lg cursor-pointer"
                  >
                    Submit Grade
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Safe Deletion Modal */}
      <AnimatePresence>
        {isDeleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border-2 border-red-500/20 w-full max-w-md rounded-3xl p-6 relative z-10 shadow-2xl space-y-5 text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle size={32} />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Confirm Accidental Data Protection
                </h3>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  You are about to permanently delete the coursework assignment:
                </p>
                <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-xl">
                  <p className="text-sm font-black text-red-650 dark:text-red-400 line-clamp-2">
                    {deleteTitle}
                  </p>
                </div>
                <p className="text-[11px] text-slate-400 font-bold leading-relaxed pt-1 text-left">
                  ⚠️ WARNING: This action is irreversible. All student files, grades, feedback, and submission timelines associated with this coursework will be immediately destroyed from database nodes.
                </p>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-850">
                <button
                  onClick={() => setIsDeleteOpen(false)}
                  className="w-1/2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-extrabold py-3.5 rounded-xl text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  No, Keep It
                </button>
                <button
                  onClick={handleDeleteAssignment}
                  className="w-1/2 bg-red-600 hover:bg-red-500 text-white font-extrabold py-3.5 rounded-xl text-xs transition-colors shadow-lg cursor-pointer"
                >
                  Yes, Delete Forever
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssignmentManagement;
