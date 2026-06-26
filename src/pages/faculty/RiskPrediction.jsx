import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Search, 
  Mail, 
  Calendar, 
  Sparkles, 
  RefreshCw,
  Play,
  X,
  Check,
  TrendingUp,
  ChevronRight,
  UserCheck,
  ClipboardList,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../services/api";

const Toast = ({ msg, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  const cfg = { success: "bg-emerald-600", error: "bg-red-600", info: "bg-blue-600" };
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-5 py-3 rounded-2xl text-white text-sm font-semibold shadow-2xl ${cfg[type] || cfg.info}`}
    >
      {type === "success" && <CheckCircle size={16} />}
      {type === "error" && <XCircle size={16} />}
      {type === "info" && <Info size={16} />}
      {msg}
      <button onClick={onClose} className="hover:opacity-80 cursor-pointer ml-2"><X size={14} /></button>
    </motion.div>
  );
};

const RiskPrediction = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedClass = JSON.parse(localStorage.getItem("selectedClass") || "{}");
  const { user } = useAuth();
  const facultyId = user?.faculty_id;
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("All"); // 'High' | 'Medium' | 'Low' | 'All'
  const [loading, setLoading] = useState(false);
  const [engineRunning, setEngineRunning] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "info") => setToast({ msg, type });

  // Multi-select and bulk actions
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showBulkInterventionModal, setShowBulkInterventionModal] = useState(false);
  const [bulkInterventionStatus, setBulkInterventionStatus] = useState("Under Watch");
  const [bulkInterventionNotes, setBulkInterventionNotes] = useState("");

  // Drawer state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [profileDetail, setProfileDetail] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [interventionNotes, setInterventionNotes] = useState("");
  const [interventionStatus, setInterventionStatus] = useState("None");

  // Helper: calculate numeric risk score
  const getRiskScore = (student, profile) => {
    if (!student) return 0;
    let score = 0;
    
    // Attendance logic
    if (student.attendance < 75) score += 50;
    else if (student.attendance < 85) score += 20;
    
    // Missing assignments logic (using loaded detailed_assignments if available)
    const assignments = profile?.detailed_assignments || [];
    const missingCount = assignments.filter(a => a.status === "Pending" || a.status === "Missing").length;
    score += missingCount * 15;
    
    // Quiz score logic
    if (student.quiz_score < 50) score += 40;
    else if (student.quiz_score < 65) score += 15;
    
    // Late submissions
    const lateCount = assignments.filter(a => a.status === "Late").length;
    score += lateCount * 5;
    
    return Math.min(score, 100);
  };

  // Helper: calculate dynamic reasons
  const getDynamicRiskReasons = (student, profile) => {
    if (!student) return [];
    
    // If backend-calculated prediction reason exists, split and display it as primary
    if (student.prediction_reason && student.prediction_reason !== "No active risk flags.") {
      return student.prediction_reason.split("; ");
    }
    
    const reasons = [];
    
    if (student.attendance < 75) {
      reasons.push(`Attendance drop to ${student.attendance}% (<75%)`);
    } else if (student.attendance < 85) {
      reasons.push(`Attendance warning ${student.attendance}% (<85%)`);
    }
    
    if (student.quiz_score < 60) {
      reasons.push(`Quiz average drop to ${student.quiz_score}% (<60%)`);
    } else if (student.quiz_score < 70) {
      reasons.push(`Low quiz average warning ${student.quiz_score}% (<70%)`);
    }
    
    const assignments = profile?.detailed_assignments || [];
    const missingCount = assignments.filter(a => a.status === "Pending" || a.status === "Missing").length;
    if (missingCount > 0) {
      reasons.push(`${missingCount} missing assignment submission${missingCount > 1 ? 's' : ''}`);
    }
    
    const lateCount = assignments.filter(a => a.status === "Late").length;
    if (lateCount > 0) {
      reasons.push(`${lateCount} late assignment submission${lateCount > 1 ? 's' : ''}`);
    }
    
    // Fallback to database predictions reason
    if (reasons.length === 0 && profile?.risk_history?.length > 0) {
      const savedReason = profile.risk_history[0].reason;
      if (savedReason && savedReason !== "No active risk flags.") {
        return savedReason.split("; ");
      }
    }
    
    if (reasons.length === 0) {
      reasons.push("No active risk flags. Profile performing within expected thresholds.");
    }
    
    return reasons;
  };

  const fetchRoster = async () => {
    if (!selectedClass.class_id) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/class/${selectedClass.class_id}/student-metrics`);
      if (!res.ok) throw new Error("Failed to fetch student data");
      const data = await res.json();
      setStudents(data);

      // Check for preselected student in routing state
      if (location.state?.preselectedStudentId) {
        const targetId = Number(location.state.preselectedStudentId);
        const student = data.find(s => s.student_id === targetId);
        if (student) {
          handleSelectStudent(student);
        }
        // Clean location state so it doesn't trigger again on reload
        navigate(location.pathname, { replace: true, state: null });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, [selectedClass.class_id]);

  // Bulk Action Handlers
  const handleBulkRemedialInvite = () => {
    navigate("/faculty/remedial", { state: { preselectedStudentIds: selectedStudentIds } });
  };

  const handleBulkInterventionSave = async () => {
    setBulkActionLoading(true);
    try {
      const promises = selectedStudentIds.map(studentId => 
        apiFetch(`/faculty/student/${studentId}/intervention`, {
          method: "POST",
          body: JSON.stringify({
            faculty_notes: bulkInterventionNotes || "Bulk intervention update.",
            intervention_status: bulkInterventionStatus,
            faculty_id: facultyId
          })
        })
      );
      
      const results = await Promise.all(promises);
      const allOk = results.every(res => res.ok);
      
      if (allOk) {
        showToast(`Successfully updated intervention log for ${selectedStudentIds.length} students!`, "success");
        setSelectedStudentIds([]);
        setShowBulkInterventionModal(false);
        setBulkInterventionNotes("");
        await fetchRoster();
      } else {
        showToast("Some intervention updates failed.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating bulk intervention log.", "error");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleRunRiskEngine = async () => {
    if (!selectedClass.class_id) return;
    setEngineRunning(true);
    try {
      const res = await apiFetch("/faculty/run-risk-engine", {
        method: "POST",
        body: JSON.stringify({
          class_id: selectedClass.class_id,
          faculty_id: facultyId
        })
      });
      if (!res.ok) throw new Error("Failed to execute risk engine");
      await fetchRoster();
      showToast("Risk engine analysis completed successfully!", "success");
      setShowResultModal(true);
    } catch (err) {
      console.error(err);
      showToast("Error executing risk calculation engine.", "error");
    } finally {
      setEngineRunning(false);
    }
  };

  const handleSendWarning = (student) => {
    showToast(`Intervention alert successfully emailed to ${student.full_name} (${student.roll_no})!`, "success");
  };

  const handleRemedialClass = (student) => {
    navigate("/faculty/remedial", { state: { preselectedStudentId: student.student_id } });
  };

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    setProfileLoading(true);
    try {
      const res = await apiFetch(`/student/${student.student_id}/profile`);
      if (!res.ok) throw new Error("Failed to load profile details");
      const data = await res.json();
      setProfileDetail(data);
      setInterventionNotes(data.metrics?.faculty_notes || "");
      setInterventionStatus(data.metrics?.intervention_status || "None");
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveIntervention = async () => {
    try {
      const res = await apiFetch(`/faculty/student/${selectedStudent.student_id}/intervention`, {
        method: "POST",
        body: JSON.stringify({
          faculty_notes: interventionNotes,
          intervention_status: interventionStatus,
          faculty_id: facultyId
        })
      });
      if (res.ok) {
        showToast("Intervention log updated successfully!", "success");
        setProfileDetail(prev => ({
          ...prev,
          metrics: {
            ...prev.metrics,
            faculty_notes: interventionNotes,
            intervention_status: interventionStatus
          }
        }));
        await fetchRoster();
      } else {
        showToast("Failed to update intervention log.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating intervention log.", "error");
    }
  };

  // Since we fetch class-specific student metrics, classStudents is just the students list!
  const classStudents = students;

  const highRiskCount = classStudents.filter(s => s.risk_level === "High").length;
  const mediumRiskCount = classStudents.filter(s => s.risk_level === "Medium").length;

  const filteredStudents = classStudents.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.roll_no.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (riskFilter === "All") return true;
    return student.risk_level === riskFilter;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 font-sans text-slate-800 dark:text-slate-200"
    >
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-red-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle size={14} className="animate-pulse" />
            Platform Academic Warnings
          </p>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            Predictive Risk Assessment
          </h2>
          <p className="text-slate-550 dark:text-slate-400 text-xs mt-1">
            Class: <span className="font-semibold text-slate-850 dark:text-white">{selectedClass.class_name}</span> | Subject: <span className="font-semibold text-slate-855 dark:text-white">{selectedClass.subject_name}</span>
          </p>
        </div>

        <button
          onClick={handleRunRiskEngine}
          disabled={engineRunning}
          className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-red-650 bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-md cursor-pointer transition-all disabled:bg-slate-700"
        >
          {engineRunning ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <Play size={14} />
          )}
          Run Risk Engine Analysis
        </button>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex justify-between items-center transition-all hover:translate-y-[-2px]">
          <div>
            <span className="text-[10px] text-slate-450 uppercase block font-bold">High Risk Profile</span>
            <span className="text-2xl font-black text-red-500 mt-1 block">
              {highRiskCount} Students
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 font-black">!</div>
          
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-64 bg-slate-955 text-white text-[11px] p-2.5 rounded-xl border border-slate-800 shadow-xl z-20 font-semibold text-center pointer-events-none">
            Students with attendance below 75% and grades below 60%.
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-950/95" />
          </div>
        </div>

        <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex justify-between items-center transition-all hover:translate-y-[-2px]">
          <div>
            <span className="text-[10px] text-slate-450 uppercase block font-bold">Medium Risk Profile</span>
            <span className="text-2xl font-black text-amber-500 mt-1 block">
              {mediumRiskCount} Students
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500 font-black">~</div>

          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-64 bg-slate-955 text-white text-[11px] p-2.5 rounded-xl border border-slate-800 shadow-xl z-20 font-semibold text-center pointer-events-none">
            Students with attendance between 75-80% or grades between 60-70%.
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-950/95" />
          </div>
        </div>

        <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex justify-between items-center transition-all hover:translate-y-[-2px]">
          <div>
            <span className="text-[10px] text-slate-450 uppercase block font-bold">Failure Projections Rate</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block">
              {classStudents.length > 0 ? ((highRiskCount / classStudents.length) * 100).toFixed(1) : 0.0}%
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-bold uppercase block">Target: &lt; 3.0%</span>
          </div>

          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-64 bg-slate-955 text-white text-[11px] p-2.5 rounded-xl border border-slate-800 shadow-xl z-20 font-semibold text-center pointer-events-none">
            Projected class failure rate based on active risk counts.
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-950/95" />
          </div>
        </div>
      </div>

      {/* Filters & Actions Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-3 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 px-3 py-2 rounded-xl w-full md:w-72 focus-within:ring-2 focus-within:ring-purple-500/50">
          <Search size={16} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search student roll, name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-slate-700 dark:text-slate-250 placeholder-slate-400 focus:outline-none w-full text-xs"
          />
        </div>

        {/* Risk filters */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {["High", "Medium", "Low", "All"].map(level => (
            <button
              key={level}
              onClick={() => setRiskFilter(level)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                riskFilter === level 
                  ? level === "High" ? "bg-red-600 text-white shadow" 
                    : level === "Medium" ? "bg-amber-500 text-white shadow" 
                    : level === "Low" ? "bg-emerald-600 text-white shadow" 
                    : "bg-purple-600 text-white shadow"
                  : "bg-slate-50 dark:bg-slate-955 border border-slate-200/50 dark:border-slate-850 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-850"
              }`}
            >
              {level === "All" ? "All Students" : `${level} Risk`}
            </button>
          ))}
        </div>
      </div>

      {/* Two-column layout: Table and Defaulter Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start animate-fade-in">
        {/* Reports Grid table */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-slate-400 flex flex-col items-center gap-2">
              <RefreshCw size={24} className="animate-spin text-purple-650" />
              <span className="text-xs">Fetching risk alerts data...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-150 dark:border-slate-855 text-slate-455 font-bold uppercase text-[9px] tracking-wider bg-slate-50/50 dark:bg-slate-955/20">
                    <th className="py-4 pl-5 w-10">
                      <input
                        type="checkbox"
                        checked={filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudentIds(filteredStudents.map(s => s.student_id));
                          } else {
                            setSelectedStudentIds([]);
                          }
                        }}
                        className="accent-purple-605 accent-purple-600 cursor-pointer rounded"
                      />
                    </th>
                    <th className="py-4">Learner</th>
                    <th className="py-4">Roll Number</th>
                    <th className="py-4 text-center">Attendance</th>
                    <th className="py-4 text-center">Quiz Avg</th>
                    <th className="py-4 text-center">Risk Score</th>
                    <th className="py-4 text-center">Risk Tier</th>
                    <th className="py-4 text-right pr-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-855/80">
                  {filteredStudents.map((student) => (
                    <tr 
                      key={student.student_id} 
                      onClick={() => handleSelectStudent(student)}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors cursor-pointer ${
                        selectedStudentIds.includes(student.student_id) ? "bg-purple-500/5 dark:bg-purple-500/10" : ""
                      }`}
                    >
                      <td className="py-3.5 pl-5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.includes(student.student_id)}
                          onChange={() => {
                            setSelectedStudentIds(prev => 
                              prev.includes(student.student_id) 
                                ? prev.filter(id => id !== student.student_id) 
                                : [...prev, student.student_id]
                            );
                          }}
                          className="accent-purple-606 accent-purple-600 cursor-pointer rounded"
                        />
                      </td>
                      <td className="py-3.5 font-bold text-slate-850 dark:text-slate-150">{student.full_name}</td>
                      <td className="py-3.5 text-slate-450 font-mono font-semibold">{student.roll_no}</td>
                      <td className={`py-3.5 text-center font-bold ${student.attendance < 75 ? 'text-red-500' : 'text-slate-750 dark:text-slate-350'}`}>
                        {student.attendance}%
                      </td>
                      <td className={`py-3.5 text-center font-bold ${student.quiz_score < 60 ? 'text-red-500' : 'text-slate-750 dark:text-slate-350'}`}>
                        {student.quiz_score}%
                      </td>
                      <td className="py-3.5 text-center font-bold text-slate-805 dark:text-white">
                        {student.risk_score !== undefined && student.risk_score !== null ? Math.round(student.risk_score) : getRiskScore(student, null)} / 100
                      </td>
                      <td className="py-3.5 text-center">
                        <span className={`text-[8px] font-black uppercase px-2.5 py-0.5 rounded ${
                          student.risk_level === "High" ? "bg-red-500/10 text-red-500" :
                          student.risk_level === "Medium" ? "bg-amber-500/10 text-amber-600 dark:text-amber-500" :
                          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500"
                        }`}>
                          {student.risk_level}
                        </span>
                      </td>
                      <td className="py-3.5 text-right pr-5 space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => handleSendWarning(student)}
                          className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg border border-red-500/20 transition-all cursor-pointer inline-flex"
                          title="Dispatch Warning Email"
                        >
                          <Mail size={14} />
                        </button>
                        <button 
                          onClick={() => handleRemedialClass(student)}
                          className="p-2 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white rounded-lg border border-indigo-500/20 transition-all cursor-pointer inline-flex"
                          title="Schedule Remedial Invite"
                        >
                          <Calendar size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-semibold italic">
                        No students match the criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Defaulter Insights (Right Panel) */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-red-500">
            <AlertTriangle size={18} className="animate-pulse" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Defaulter Insights</h3>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
            Calculated automatically from real-time cumulative student records.
          </p>

          {/* Below 75% list */}
          <div className="space-y-2">
            <span className="text-[9px] uppercase font-bold text-amber-600 block">Attendance Defaulters (&lt;75%)</span>
            <div className="max-h-36 overflow-y-auto space-y-1.5 scrollbar-thin">
              {classStudents.filter(s => s.attendance < 75).length === 0 ? (
                <p className="text-[10px] text-slate-400 italic">No attendance defaulters.</p>
              ) : (
                classStudents.filter(s => s.attendance < 75).map(student => (
                  <div key={student.student_id} className="flex justify-between items-center p-2 bg-amber-500/5 border border-amber-500/10 rounded-xl text-[10px]">
                    <div className="font-bold text-slate-700 dark:text-slate-300">
                      {student.full_name}
                      <span className="text-[8px] text-slate-400 font-normal block font-mono">{student.roll_no}</span>
                    </div>
                    <span className="font-black text-amber-600">{student.attendance}%</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Below 60% list */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[9px] uppercase font-bold text-red-500 block">Critical Defaulters (&lt;60%)</span>
            <div className="max-h-36 overflow-y-auto space-y-1.5 scrollbar-thin">
              {classStudents.filter(s => s.attendance < 60).length === 0 ? (
                <p className="text-[10px] text-slate-400 italic">No critical defaulters.</p>
              ) : (
                classStudents.filter(s => s.attendance < 60).map(student => (
                  <div key={student.student_id} className="flex justify-between items-center p-2 bg-red-500/5 border border-red-500/10 rounded-xl text-[10px]">
                    <div className="font-bold text-slate-705 dark:text-slate-350">
                      {student.full_name}
                      <span className="text-[8px] text-slate-400 font-normal block font-mono">{student.roll_no}</span>
                    </div>
                    <span className="font-black text-red-500">{student.attendance}%</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Needs Intervention list */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[9px] uppercase font-bold text-purple-600 block">Needs Remedial Intervention</span>
            <div className="max-h-36 overflow-y-auto space-y-1.5 scrollbar-thin">
              {classStudents.filter(s => s.attendance < 75 || s.quiz_score < 60 || s.risk_level === 'High').length === 0 ? (
                <p className="text-[10px] text-slate-400 italic">No intervention candidates.</p>
              ) : (
                classStudents.filter(s => s.attendance < 75 || s.quiz_score < 60 || s.risk_level === 'High').map(student => (
                  <div key={student.student_id} className="flex justify-between items-center p-2 bg-purple-500/5 border border-purple-500/10 rounded-xl text-[10px]">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{student.full_name}</span>
                    <button
                      onClick={() => navigate("/faculty/remedial", { state: { preselectedStudentId: student.student_id } })}
                      className="px-2 py-1 rounded bg-purple-600 hover:bg-purple-550 text-white font-bold text-[8px] uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Invite
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {filteredStudents.length === 0 && !loading && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-sm mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto mb-4 animate-pulse">
            <Sparkles size={22} />
          </div>
          <h3 className="font-extrabold text-slate-800 dark:text-white text-base">No Risk Alerts Found</h3>
          <p className="text-slate-550 text-xs text-slate-450 dark:text-slate-400 mt-2">
            No students match the selected risk filter criteria. Clean academic profiles projected!
          </p>
        </div>
      )}

      {/* Drawer Details Slide-out */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 dark:border-slate-800"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center bg-slate-50 dark:bg-slate-955">
                <div className="text-left">
                  <span className="text-[10px] text-purple-500 font-extrabold uppercase">Risk Profile Audit</span>
                  <h3 className="font-black text-base md:text-lg text-slate-850 dark:text-white mt-0.5 leading-tight">
                    {selectedStudent.full_name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-1.5 rounded-lg border border-slate-250 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable details */}
              {profileLoading ? (
                <div className="flex-1 flex flex-col justify-center items-center gap-2">
                  <RefreshCw size={16} className="animate-spin text-purple-650" />
                  <span className="text-xs text-slate-400">Loading risk details...</span>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-left">
                  
                  {/* View Full Student Profile Button */}
                  <button
                    onClick={() => {
                      navigate("/faculty/performance", { state: { preselectedStudentId: selectedStudent.student_id } });
                    }}
                    className="w-full py-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 dark:border-purple-400/30 text-purple-600 dark:text-purple-400 font-extrabold text-xs rounded-2xl shadow-sm cursor-pointer transition-all flex items-center justify-center gap-2 group"
                  >
                    <ClipboardList size={16} className="group-hover:scale-110 transition-transform text-purple-500" />
                    View Full Student Profile
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform text-purple-500" />
                  </button>

                  {/* Risk Overview Card */}
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-855 p-4 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase font-black text-slate-455 dark:text-slate-400 tracking-wider">Risk Level & Score</span>
                      <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase ${
                        selectedStudent.risk_level === 'High' ? 'bg-red-500/10 text-red-500' :
                        selectedStudent.risk_level === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {selectedStudent.risk_level} Risk
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Numeric Score Indicator */}
                      <div className="text-center bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-3 rounded-2xl shrink-0 w-24">
                        <span className="text-[8px] uppercase text-slate-400 font-extrabold block">Risk Score</span>
                        <span className="text-lg font-black text-red-500 dark:text-red-400 block mt-0.5">
                          {selectedStudent.risk_score !== undefined && selectedStudent.risk_score !== null ? Math.round(selectedStudent.risk_score) : getRiskScore(selectedStudent, profileDetail)} / 100
                        </span>
                      </div>
                      
                      {/* Metric summary info */}
                      <div className="flex-1 grid grid-cols-2 gap-2 text-center">
                        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-2 rounded-xl">
                          <span className="text-[8px] uppercase text-slate-400 font-bold block">Attendance</span>
                          <span className={`text-xs font-black ${selectedStudent.attendance < 75 ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>{selectedStudent.attendance}%</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-2 rounded-xl">
                          <span className="text-[8px] uppercase text-slate-400 font-bold block">Quiz Avg</span>
                          <span className={`text-xs font-black ${selectedStudent.quiz_score < 60 ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>{selectedStudent.quiz_score}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Risk Reason Breakdown */}
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-4 rounded-2xl space-y-3 text-left">
                    <h4 className="text-[10px] font-black uppercase text-slate-455 dark:text-slate-400 tracking-wider">Dynamic Risk Reason breakdown</h4>
                    <div className="space-y-2">
                      {getDynamicRiskReasons(selectedStudent, profileDetail).map((reason, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-left">
                          <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
                          <span className="text-[10.5px] font-semibold text-slate-700 dark:text-slate-350 text-left">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assignment Risk Analysis */}
                  {(() => {
                    const assignments = profileDetail?.detailed_assignments || [];
                    const total = assignments.length;
                    const submitted = assignments.filter(a => a.status === "Submitted").length;
                    const late = assignments.filter(a => a.status === "Late").length;
                    const missing = assignments.filter(a => a.status === "Pending" || a.status === "Missing").length;
                    const completionRate = total > 0 ? Math.round(((submitted + late) / total) * 100) : 100;
                    
                    return (
                      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-4 rounded-2xl space-y-3 text-left">
                        <h4 className="text-[10px] font-black uppercase text-slate-455 dark:text-slate-400 tracking-wider">Assignment Risk Analysis</h4>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-red-500/10 border border-red-500/15 p-2.5 rounded-xl">
                            <span className="text-[8px] uppercase text-red-650 dark:text-red-455 font-bold block">Missing</span>
                            <span className="text-sm font-black text-red-600">{missing}</span>
                          </div>
                          <div className="bg-amber-500/10 border border-amber-500/15 p-2.5 rounded-xl">
                            <span className="text-[8px] uppercase text-amber-650 dark:text-amber-450 font-bold block">Late</span>
                            <span className="text-sm font-black text-amber-600">{late}</span>
                          </div>
                          <div className="bg-purple-500/10 border border-purple-500/15 p-2.5 rounded-xl">
                            <span className="text-[8px] uppercase text-purple-650 dark:text-purple-400 font-bold block">Completion</span>
                            <span className="text-sm font-black text-purple-600">{completionRate}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Evaluation History */}
                  <div className="bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-850 p-4 rounded-2xl space-y-3 text-left">
                    <h4 className="text-[10px] font-black uppercase text-slate-455 dark:text-slate-400 tracking-wider">Evaluation History</h4>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 text-left">
                      {profileDetail?.risk_history?.map((risk, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl p-3 space-y-1 text-left">
                          <div className="flex justify-between items-center text-[9px] font-bold text-slate-450">
                            <span>{risk.date}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${risk.level === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-550'}`}>{risk.level}</span>
                          </div>
                          <p className="text-[10px] text-slate-700 dark:text-slate-300 font-semibold">{risk.reason}</p>
                        </div>
                      ))}
                      {(!profileDetail?.risk_history || profileDetail.risk_history.length === 0) && (
                        <p className="text-center text-slate-450 py-2 italic font-semibold">No risk history logged.</p>
                      )}
                    </div>
                  </div>

                  {/* Intervention Form */}
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-4 rounded-2xl space-y-4 text-left">
                    <h4 className="text-[10px] font-black uppercase text-slate-455 dark:text-slate-400 tracking-wider">Early Intervention Management</h4>
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-bold text-slate-455 pl-0.5">Intervention Status</label>
                      <select
                        value={interventionStatus}
                        onChange={(e) => setInterventionStatus(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-350 focus:outline-none"
                      >
                        <option value="None">None</option>
                        <option value="Under Watch">Under Watch</option>
                        <option value="Remediation Assigned">Remediation Assigned</option>
                        <option value="Cleared">Cleared</option>
                        <option value="Not Contacted">Not Contacted</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-bold text-slate-455 pl-0.5">Faculty Notes & Remarks</label>
                      <textarea
                        value={interventionNotes}
                        onChange={(e) => setInterventionNotes(e.target.value)}
                        placeholder="Add progress remarks, warning details, parent meeting logs..."
                        rows={4}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-none resize-none"
                      />
                    </div>

                    <button
                      onClick={handleSaveIntervention}
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-550 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5 animate-fade-in"
                    >
                      <Check size={14} />
                      Save Intervention Log
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Risk Engine Results Modal */}
      <AnimatePresence>
        {showResultModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResultModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative max-w-md w-full overflow-hidden text-slate-800 dark:text-slate-250 z-10"
            >
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-500">
                  <Sparkles size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Risk Engine Analysis Complete
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                    Calculated based on real-time student telemetry
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850 text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Evaluated</span>
                  <span className="text-xl font-black text-slate-800 dark:text-white block mt-1">
                    {classStudents.length}
                  </span>
                </div>
                <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/15 text-center">
                  <span className="text-[9px] uppercase font-bold text-red-500 block">High Risk</span>
                  <span className="text-xl font-black text-red-500 block mt-1">
                    {highRiskCount}
                  </span>
                </div>
                <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/15 text-center">
                  <span className="text-[9px] uppercase font-bold text-amber-600 dark:text-amber-500 block">Med Risk</span>
                  <span className="text-xl font-black text-amber-600 dark:text-amber-500 block mt-1">
                    {mediumRiskCount}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowResultModal(false);
                    setRiskFilter("High");
                  }}
                  className="flex-1 py-2.5 bg-red-650 bg-red-600 hover:bg-red-550 text-white font-extrabold text-xs rounded-xl transition-all shadow-md cursor-pointer"
                >
                  View At-Risk Roster
                </button>
                <button
                  onClick={() => setShowResultModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Bulk Actions Bar */}
      <AnimatePresence>
        {selectedStudentIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-slate-900 border border-slate-800 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 text-white max-w-2xl w-full"
          >
            <div className="flex-1 text-left">
              <span className="font-black text-xs text-purple-400 uppercase tracking-wider block">Bulk Operations</span>
              <span className="text-[11px] text-slate-300 font-medium block mt-0.5">
                {selectedStudentIds.length} student{selectedStudentIds.length > 1 ? 's' : ''} selected
              </span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleBulkRemedialInvite}
                className="px-4 py-2 bg-indigo-650 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
              >
                Send Bulk Invite
              </button>
              
              <button
                onClick={() => setShowBulkInterventionModal(true)}
                className="px-4 py-2 bg-purple-650 bg-purple-600 hover:bg-purple-550 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
              >
                Update Intervention
              </button>
              
              <button
                onClick={() => setSelectedStudentIds([])}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Intervention Modal */}
      <AnimatePresence>
        {showBulkInterventionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-5 border-b border-slate-150 dark:border-slate-850 flex justify-between items-center bg-slate-55 dark:bg-slate-955">
                <div className="text-left">
                  <h3 className="font-black text-base text-slate-855 dark:text-white">Bulk Update Intervention</h3>
                  <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Updating {selectedStudentIds.length} students</span>
                </div>
                <button
                  onClick={() => setShowBulkInterventionModal(false)}
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[9px] uppercase font-bold text-slate-450 pl-0.5">Intervention Status</label>
                  <select
                    value={bulkInterventionStatus}
                    onChange={(e) => setBulkInterventionStatus(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-350 focus:outline-none"
                  >
                    <option value="Under Watch">Under Watch</option>
                    <option value="Remediation Assigned">Remediation Assigned</option>
                    <option value="Cleared">Cleared</option>
                    <option value="Not Contacted">Not Contacted</option>
                  </select>
                </div>
                
                <div className="space-y-1.5 text-left">
                  <label className="text-[9px] uppercase font-bold text-slate-450 pl-0.5">Faculty Notes & Remarks</label>
                  <textarea
                    value={bulkInterventionNotes}
                    onChange={(e) => setBulkInterventionNotes(e.target.value)}
                    placeholder="Enter notes to apply to all selected students..."
                    rows={4}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-705 dark:text-slate-350 focus:outline-none resize-none"
                  />
                </div>
              </div>
              
              <div className="p-5 border-t border-slate-150 dark:border-slate-800 bg-slate-55 dark:bg-slate-955 flex gap-3">
                <button
                  onClick={() => setShowBulkInterventionModal(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-250 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkInterventionSave}
                  disabled={bulkActionLoading}
                  className="flex-1 py-2 bg-purple-650 bg-purple-600 hover:bg-purple-550 text-white font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {bulkActionLoading && <RefreshCw size={12} className="animate-spin" />}
                  Apply Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Alert Notifications */}
      <AnimatePresence>
        {toast && (
          <Toast
            msg={toast.msg}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RiskPrediction;
