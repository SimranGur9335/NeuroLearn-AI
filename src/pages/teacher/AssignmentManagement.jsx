import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  BookOpen
} from 'lucide-react';

const AssignmentManagement = () => {
  const navigate = useNavigate();
  const selectedClass = JSON.parse(localStorage.getItem("selectedClass") || "{}");
  const facultyId = Number(localStorage.getItem("faculty_id") || "7");

  // State lists
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals & Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // "create" | "edit"
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    total_marks: 100
  });

  const [isGradingOpen, setIsGradingOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradingMarks, setGradingMarks] = useState("");
  const [gradingStatus, setGradingStatus] = useState("Graded");

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
        `http://localhost:8000/assignments?class_id=${selectedClass.class_id}&subject_id=${selectedClass.subject_id}`
      );
      if (!res.ok) throw new Error("Failed to load assignments");
      const data = await res.json();
      setAssignments(data);
      setSelectedAssignment(null);
      setSubmissions([]);
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
      const res = await fetch(`http://localhost:8000/assignments/${assignmentId}/submissions`);
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
    fetchSubmissions(assign.assignment_id);
  };

  const handleOpenCreate = () => {
    setFormMode("create");
    setEditId(null);
    setFormData({
      title: "",
      description: "",
      due_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0], // 7 days from now
      total_marks: 100
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (assign, e) => {
    e.stopPropagation();
    setFormMode("edit");
    setEditId(assign.assignment_id);
    setFormData({
      title: assign.title,
      description: assign.description,
      due_date: assign.due_date,
      total_marks: assign.total_marks
    });
    setIsFormOpen(true);
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
        due_date: formData.due_date,
        total_marks: Number(formData.total_marks),
        faculty_id: facultyId
      };

      let url = "http://localhost:8000/assignments";
      let method = "POST";

      if (formMode === "edit") {
        url = `http://localhost:8000/assignments/${editId}`;
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
    } catch (err) {
      console.error(err);
      showAlert(err.message || "Failed to save assignment", "error");
    }
  };

  const handleDeleteAssignment = async (assignmentId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this assignment? All student submissions will also be deleted.")) {
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8000/assignments/${assignmentId}?faculty_id=${facultyId}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Delete operation failed");
      }

      showAlert("Assignment deleted successfully", "success");
      fetchAssignments();
    } catch (err) {
      console.error(err);
      showAlert(err.message || "Failed to delete assignment", "error");
    }
  };

  const handleOpenGrading = (sub) => {
    setSelectedSubmission(sub);
    setGradingMarks(sub.marks_obtained !== null ? sub.marks_obtained : "");
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
        faculty_id: facultyId
      };

      const res = await fetch(`http://localhost:8000/submissions/${selectedSubmission.submission_id}/grade`, {
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

  const filteredAssignments = assignments.filter((assign) =>
    assign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assign.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats calculation
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
          onClick={() => navigate('/teacher/select-class')}
          className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold px-6 py-3 rounded-xl transition-all shadow-lg"
        >
          Select Workspace Class
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-200">
      {/* Alert Header */}
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Hand: Assignments List */}
        <div className={`lg:col-span-5 space-y-4`}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold">List Assignments</h2>
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading assignments...</div>
          ) : filteredAssignments.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center text-slate-400">
              No assignments found. Click "Create Assignment" to add one.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAssignments.map((assign) => {
                const isSelected = selectedAssignment?.assignment_id === assign.assignment_id;
                const isOverdue = new Date() > new Date(assign.due_date);
                
                return (
                  <motion.div
                    whileHover={{ y: -2 }}
                    key={assign.assignment_id}
                    onClick={() => handleSelectAssignment(assign)}
                    className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 cursor-pointer transition-all ${
                      isSelected
                        ? "border-purple-500 shadow-lg shadow-purple-500/5"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                          {assign.title}
                        </h3>
                        <p className="text-slate-400 text-xs mt-1 line-clamp-2">
                          {assign.description || "No description provided."}
                        </p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={(e) => handleOpenEdit(assign, e)}
                          className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteAssignment(assign.assignment_id, e)}
                          className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3 text-xs border-t border-slate-100 dark:border-slate-800/60 pt-4">
                      <div className="flex items-center gap-1.5 text-slate-450">
                        <Calendar size={14} />
                        <span>Due {assign.due_date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-450 ml-auto">
                        <Award size={14} className="text-yellow-500" />
                        <span>Max {assign.total_marks} Marks</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px] ${
                        isOverdue
                          ? "bg-red-500/10 text-red-500 border border-red-500/20"
                          : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      }`}>
                        {isOverdue ? "Overdue" : "Active"}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Hand: Submissions Grid */}
        <div className="lg:col-span-7">
          {selectedAssignment ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              {/* Assignment Overview header inside drawer */}
              <div>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                      {selectedAssignment.title}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                      {selectedAssignment.description}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedAssignment(null);
                      setSubmissions([]);
                    }}
                    className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* KPI stats inside submissions grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                    <p className="text-slate-400 text-xs">Students</p>
                    <h4 className="text-xl font-bold mt-1">{stats.total}</h4>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                    <p className="text-emerald-500 text-xs">Graded</p>
                    <h4 className="text-xl font-bold text-emerald-500 mt-1">{stats.graded}</h4>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                    <p className="text-blue-500 text-xs">Handed-In</p>
                    <h4 className="text-xl font-bold text-blue-500 mt-1">{stats.submitted}</h4>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                    <p className="text-yellow-500 text-xs">Pending</p>
                    <h4 className="text-xl font-bold text-yellow-500 mt-1">{stats.pending}</h4>
                  </div>
                </div>
              </div>

              {/* Submissions List */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Student Submissions</h3>

                {submissionsLoading ? (
                  <div className="py-12 text-center text-slate-450">Loading submissions...</div>
                ) : submissions.length === 0 ? (
                  <div className="py-8 text-center text-slate-450 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                    No student submissions found.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="px-6 py-4 font-bold text-slate-500">Roll No</th>
                          <th className="px-6 py-4 font-bold text-slate-500">Student Name</th>
                          <th className="px-6 py-4 font-bold text-slate-500">Status</th>
                          <th className="px-6 py-4 font-bold text-slate-500 text-center">URL</th>
                          <th className="px-6 py-4 font-bold text-slate-500 text-center">Marks</th>
                          <th className="px-6 py-4 font-bold text-slate-500 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {submissions.map((sub) => {
                          let statusColor = "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
                          if (sub.status === "Graded") statusColor = "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
                          else if (sub.status === "Submitted") statusColor = "bg-blue-500/10 text-blue-500 border border-blue-500/20";
                          else if (sub.status === "Late") statusColor = "bg-red-500/10 text-red-500 border border-red-500/20";

                          return (
                            <tr key={sub.submission_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                              <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-400">
                                {sub.roll_no}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap font-extrabold text-slate-900 dark:text-white">
                                {sub.student_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${statusColor}`}>
                                  {sub.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                {sub.submission_url ? (
                                  <a
                                    href={sub.submission_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-600/15 hover:text-purple-500 transition-all text-slate-400"
                                    title="View submission link"
                                  >
                                    <ExternalLink size={14} />
                                  </a>
                                ) : (
                                  <span className="text-slate-500">—</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center font-extrabold">
                                {sub.marks_obtained !== null ? (
                                  <span className="text-purple-500">
                                    {sub.marks_obtained}
                                    <span className="text-slate-500 font-normal text-xs">/{selectedAssignment.total_marks}</span>
                                  </span>
                                ) : (
                                  <span className="text-slate-500">—</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <button
                                  onClick={() => handleOpenGrading(sub)}
                                  className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md"
                                >
                                  {sub.marks_obtained !== null ? "Re-Grade" : "Grade"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900/40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 flex flex-col items-center justify-center min-h-[400px]">
              <div className="p-4 bg-slate-100 dark:bg-slate-800/80 rounded-full mb-4">
                <FileText size={32} className="text-slate-400 dark:text-slate-600" />
              </div>
              <h3 className="font-bold text-lg text-slate-600 dark:text-slate-400 mb-1">
                Select an Assignment
              </h3>
              <p className="text-sm text-slate-450 max-w-xs">
                Choose an assignment from the list on the left to grade submissions and view performance stats.
              </p>
            </div>
          )}
        </div>
      </div>

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
              className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-850 w-full max-w-lg rounded-3xl p-6 relative z-10 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {formMode === "create" ? "Create Assignment" : "Edit Assignment"}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveAssignment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="E.g., Mid-Term Lab Project"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Description / Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter submission requirements or grading rubrics..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Total Marks *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={1000}
                      value={formData.total_marks}
                      onChange={(e) => setFormData({ ...formData, total_marks: Number(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="w-1/2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-extrabold py-3.5 rounded-xl text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold py-3.5 rounded-xl text-xs transition-colors shadow-lg"
                  >
                    {formMode === "create" ? "Publish Assignment" : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Grading Dialog/Modal */}
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
              className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-850 w-full max-w-md rounded-3xl p-6 relative z-10 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Grade Submission
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Student: {selectedSubmission?.student_name} ({selectedSubmission?.roll_no})
                  </p>
                </div>
                <button
                  onClick={() => setIsGradingOpen(false)}
                  className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {selectedSubmission?.submission_url && (
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                  <FileText className="text-purple-500" size={24} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-400">Submission Link</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {selectedSubmission.submission_url}
                    </p>
                  </div>
                  <a
                    href={selectedSubmission.submission_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-purple-500 transition-colors"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              )}

              <form onSubmit={handleSaveGrade} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Marks Obtained (Max: {selectedAssignment?.total_marks || 100}) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={selectedAssignment?.total_marks || 100}
                    value={gradingMarks}
                    onChange={(e) => setGradingMarks(e.target.value)}
                    placeholder="Enter marks..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Grading Status *
                  </label>
                  <select
                    value={gradingStatus}
                    onChange={(e) => setGradingStatus(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="Graded">Graded (Done)</option>
                    <option value="Submitted">Keep Submitted</option>
                    <option value="Late">Keep Late</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setIsGradingOpen(false)}
                    className="w-1/2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-extrabold py-3.5 rounded-xl text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold py-3.5 rounded-xl text-xs transition-colors shadow-lg"
                  >
                    Submit Grade
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssignmentManagement;
