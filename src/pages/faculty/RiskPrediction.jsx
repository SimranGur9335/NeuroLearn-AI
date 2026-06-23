import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ChevronRight
} from 'lucide-react';
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../services/api";

const RiskPrediction = () => {
  const navigate = useNavigate();
  const selectedClass = JSON.parse(localStorage.getItem("selectedClass") || "{}");
  const { user } = useAuth();
  const facultyId = user?.faculty_id;
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("High"); // 'High' | 'Medium' | 'All'
  const [loading, setLoading] = useState(false);
  const [engineRunning, setEngineRunning] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  // Drawer state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [profileDetail, setProfileDetail] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [interventionNotes, setInterventionNotes] = useState("");
  const [interventionStatus, setInterventionStatus] = useState("None");

  const fetchRoster = async () => {
    if (!selectedClass.class_id) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/faculty/${facultyId}/students`);
      if (!res.ok) throw new Error("Failed to fetch student data");
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, [selectedClass.class_id]);

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
      setShowResultModal(true);
    } catch (err) {
      console.error(err);
      alert("Error executing risk calculation engine.");
    } finally {
      setEngineRunning(false);
    }
  };

  const handleSendWarning = (student) => {
    alert(`Intervention alert successfully emailed to ${student.full_name} (${student.roll_no}) at ${student.full_name.toLowerCase().replace(' ', '')}@neurolearn.ai.`);
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
        alert("Intervention log updated successfully!");
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
        alert("Failed to update intervention log.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating intervention log.");
    }
  };

  // filter students belonging to current class
  const classStudents = students.filter(s => 
    s.division === (selectedClass.class_name.includes(" A") ? "A" : selectedClass.class_name.includes(" B") ? "B" : "")
  );

  const highRiskCount = classStudents.filter(s => s.risk_level === "High").length;
  const mediumRiskCount = classStudents.filter(s => s.risk_level === "Medium").length;

  const filteredStudents = classStudents.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.roll_no.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (riskFilter === "All") return student.risk_level === "High" || student.risk_level === "Medium";
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
          {["High", "Medium", "All"].map(level => (
            <button
              key={level}
              onClick={() => setRiskFilter(level)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                riskFilter === level 
                  ? level === "High" ? "bg-red-600 text-white shadow" : level === "Medium" ? "bg-amber-500 text-white shadow" : "bg-purple-600 text-white shadow"
                  : "bg-slate-50 dark:bg-slate-955 border border-slate-200/50 dark:border-slate-850 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-850"
              }`}
            >
              {level} Risk
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
                  <tr className="border-b border-slate-150 dark:border-slate-855 text-slate-400 font-bold uppercase text-[9px] tracking-wider bg-slate-50/50 dark:bg-slate-950/20">
                    <th className="py-4 pl-5">Learner</th>
                    <th className="py-4">Roll Number</th>
                    <th className="py-4 text-center">Attendance</th>
                    <th className="py-4 text-center">Quiz Avg</th>
                    <th className="py-4 text-center">Risk Tier</th>
                    <th className="py-4 text-right pr-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-855/80">
                  {filteredStudents.map((student) => (
                    <tr 
                      key={student.student_id} 
                      onClick={() => handleSelectStudent(student)}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 pl-5 font-bold text-slate-850 dark:text-slate-150">{student.full_name}</td>
                      <td className="py-3.5 text-slate-450 font-mono font-semibold">{student.roll_no}</td>
                      <td className={`py-3.5 text-center font-bold ${student.attendance < 75 ? 'text-red-500' : 'text-slate-750 dark:text-slate-350'}`}>
                        {student.attendance}%
                      </td>
                      <td className={`py-3.5 text-center font-bold ${student.quiz_score < 60 ? 'text-red-500' : 'text-slate-750 dark:text-slate-350'}`}>
                        {student.quiz_score}%
                      </td>
                      <td className="py-3.5 text-center">
                        <span className={`text-[8px] font-black uppercase px-2.5 py-0.5 rounded ${
                          student.risk_level === "High" ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-600 dark:text-amber-505"
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
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold italic">
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
                <div>
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
                <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
                  {/* Risk Overview Card */}
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-4 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase font-bold text-slate-400">Risk Assessment Tier</span>
                      <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase ${
                        selectedStudent.risk_level === 'High' ? 'bg-red-500/10 text-red-500' :
                        selectedStudent.risk_level === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {selectedStudent.risk_level} Risk
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-2 rounded-xl">
                        <span className="text-[8px] uppercase text-slate-400 font-bold block">Attendance</span>
                        <span className={`text-xs font-black ${selectedStudent.attendance < 75 ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>{selectedStudent.attendance}%</span>
                      </div>
                      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-2 rounded-xl">
                        <span className="text-[8px] uppercase text-slate-400 font-bold block">Quiz Avg</span>
                        <span className={`text-xs font-black ${selectedStudent.quiz_score < 60 ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>{selectedStudent.quiz_score}%</span>
                      </div>
                      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-2 rounded-xl">
                        <span className="text-[8px] uppercase text-slate-400 font-bold block">CGPA Proj</span>
                        <span className="text-xs font-black text-purple-600">{profileDetail?.metrics?.predicted_cgpa || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Section 1: Risk Reason Breakdown */}
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-4 rounded-2xl space-y-2.5">
                    <h4 className="text-[10px] font-black uppercase text-slate-450 dark:text-slate-400 tracking-wider">Telemetry Risk Analysis</h4>
                    <div className="space-y-2 leading-relaxed font-semibold text-slate-750 dark:text-slate-350">
                      <div className="flex justify-between items-center p-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl">
                        <span>Attendance Risk:</span>
                        <span className={selectedStudent.attendance < 75 ? "text-red-500 font-bold" : "text-emerald-500"}>
                          {selectedStudent.attendance < 75 ? "Critically Low (<75%)" : "Satisfactory"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl">
                        <span>Performance Risk:</span>
                        <span className={selectedStudent.quiz_score < 60 ? "text-red-500 font-bold" : "text-emerald-500"}>
                          {selectedStudent.quiz_score < 60 ? "Low Quiz Averages (<60%)" : "Good"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl">
                        <span>Assignment Compliance:</span>
                        {(() => {
                          const total = profileDetail?.assignments?.length || 0;
                          const completed = profileDetail?.assignments?.filter(a => a.status === "Submitted" || a.status === "Late").length || 0;
                          const missing = total - completed;
                          return (
                            <span className={missing > 1 ? "text-red-500 font-bold" : "text-emerald-500"}>
                              {missing > 0 ? `${missing} Missing Submissions` : "Fully Compliant"}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Risk History */}
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-4 rounded-2xl space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-slate-450 dark:text-slate-400 tracking-wider">Evaluation History</h4>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {profileDetail?.risk_history?.map((risk, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl p-3 space-y-1">
                          <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                            <span>{risk.date}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${risk.level === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>{risk.level}</span>
                          </div>
                          <p className="text-[10px] text-slate-700 dark:text-slate-350 font-semibold">{risk.reason}</p>
                        </div>
                      ))}
                      {(!profileDetail?.risk_history || profileDetail.risk_history.length === 0) && (
                        <p className="text-center text-slate-455 py-2 italic font-semibold">No risk history logged.</p>
                      )}
                    </div>
                  </div>

                  {/* Section 3: Intervention Form */}
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-4 rounded-2xl space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-slate-455 dark:text-slate-400 tracking-wider">Early Intervention Management</h4>
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-bold text-slate-400 pl-0.5">Intervention Status</label>
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
                      <label className="text-[9px] uppercase font-bold text-slate-400 pl-0.5">Faculty Notes & Remarks</label>
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
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-550 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    >
                      <Check size={14} />
                      Save Intervention Log
                    </button>
                  </div>
                </div>
              )}

              {/* Action drawer footer */}
              {!profileLoading && profileDetail && (
                <div className="p-5 border-t border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-955 flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => {
                      navigate("/faculty/remedial", { state: { preselectedStudentId: selectedStudent.student_id } });
                    }}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-550 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer animate-pulse"
                  >
                    Send Remedial Class Invitation
                  </button>
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
    </motion.div>
  );
};

export default RiskPrediction;
