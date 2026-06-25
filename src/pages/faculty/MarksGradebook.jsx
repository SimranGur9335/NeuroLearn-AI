import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSpreadsheet,
  Save,
  Search,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Award,
  BookOpen,
  Users,
  Percent,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  FileText,
  Eye,
  EyeOff,
  UserCheck,
  RefreshCw,
  SlidersHorizontal,
  X,
  Sliders,
  HelpCircle
} from 'lucide-react';
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../services/api";

const MarksGradebook = () => {
  const navigate = useNavigate();
  const selectedClass = JSON.parse(localStorage.getItem("selectedClass") || "{}");
  const { user } = useAuth();
  const facultyId = user?.faculty_id;

  // Gradebook data
  const [assessmentStructure, setAssessmentStructure] = useState([]);
  const [studentsMarks, setStudentsMarks] = useState([]);
  const [originalMarks, setOriginalMarks] = useState([]); // for change detection
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, PASSED, FAILED, AT_RISK, UNPUBLISHED
  
  // Input validations & error tracking
  const [errors, setErrors] = useState({}); // key: `${studentId}_${assessmentId}`, value: error message
  const [alertInfo, setAlertInfo] = useState(null);

  // Student Drilldown Drawer State
  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState(null);
  const [drawerDetail, setDrawerDetail] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerTab, setDrawerTab] = useState("academics"); // academics, interventions
  const [interventionNotes, setInterventionNotes] = useState("");
  const [interventionStatus, setInterventionStatus] = useState("Not Contacted");
  const [savingIntervention, setSavingIntervention] = useState(false);

  const showAlert = (message, type = "success") => {
    setAlertInfo({ message, type });
    setTimeout(() => setAlertInfo(null), 4000);
  };

  useEffect(() => {
    if (!selectedClass.class_id) {
      setLoading(false);
      return;
    }
    fetchGradebook();
  }, [selectedClass.class_id]);

  const fetchGradebook = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(
        `/marks?class_id=${selectedClass.class_id}&subject_id=${selectedClass.subject_id}`
      );
      if (!res.ok) throw new Error("Failed to load marks");
      const data = await res.json();
      
      const structure = data.assessment_structure || [];
      const marksList = data.students_marks || [];
      
      setAssessmentStructure(structure);
      
      // Map students marks ensuring all configured components exist in the marks dict
      const normalizedMarks = marksList.map(s => {
        const studentMarksDict = { ...s.marks };
        structure.forEach(c => {
          if (studentMarksDict[c.subject_assessment_id] === undefined) {
            studentMarksDict[c.subject_assessment_id] = 0;
          }
        });
        return {
          ...s,
          marks: studentMarksDict
        };
      });

      setStudentsMarks(normalizedMarks);
      // Keep a deep copy of original marks for change tracking
      setOriginalMarks(JSON.parse(JSON.stringify(normalizedMarks)));
      setErrors({});
    } catch (err) {
      console.error(err);
      showAlert("Error fetching gradebook data", "error");
    } finally {
      setLoading(false);
    }
  };

  // Real-time grade mapping helper
  const calculateGrade = (total) => {
    if (total >= 90) return "A+";
    if (total >= 80) return "A";
    if (total >= 70) return "B";
    if (total >= 60) return "C";
    if (total >= 50) return "D";
    return "F";
  };

  // Check if a row has modifications
  const isRowEdited = (studentId) => {
    const current = studentsMarks.find(s => s.student_id === studentId);
    const original = originalMarks.find(s => s.student_id === studentId);
    if (!current || !original) return false;
    return JSON.stringify(current.marks) !== JSON.stringify(original.marks);
  };

  // Get total count of edited students
  const editedCount = useMemo(() => {
    let count = 0;
    studentsMarks.forEach(s => {
      if (isRowEdited(s.student_id)) count++;
    });
    return count;
  }, [studentsMarks, originalMarks]);

  // Handle live mark input edits
  const handleMarkChange = (studentId, assessmentId, value) => {
    let numericVal = value === "" ? 0 : parseFloat(value);
    if (isNaN(numericVal)) numericVal = 0;
    if (numericVal < 0) numericVal = 0;

    const comp = assessmentStructure.find(c => c.subject_assessment_id === Number(assessmentId));
    const maxMarks = comp ? comp.max_marks : 100;

    // Real-time validation check
    let cellError = null;
    if (numericVal > maxMarks) {
      cellError = `Max: ${maxMarks}`;
    }

    setErrors(prev => {
      const next = { ...prev };
      const key = `${studentId}_${assessmentId}`;
      if (cellError) {
        next[key] = cellError;
      } else {
        delete next[key];
      }
      return next;
    });

    setStudentsMarks(prev =>
      prev.map(s => {
        if (s.student_id === studentId) {
          const updatedMarks = { ...s.marks, [assessmentId]: numericVal };
          
          // Recalculate dynamic weighted total score: (marks_obtained / max_marks) * weightage
          let weightedSum = 0;
          let totalWeightage = 0;
          
          assessmentStructure.forEach(c => {
            const marksObt = updatedMarks[c.subject_assessment_id] || 0;
            if (c.max_marks > 0) {
              weightedSum += (marksObt / c.max_marks) * c.weightage;
              totalWeightage += c.weightage;
            }
          });

          const overallTotal = totalWeightage > 0 ? parseFloat(((weightedSum / totalWeightage) * 100).toFixed(2)) : 0;
          const finalTotal = Math.min(100, Math.max(0, overallTotal));

          return {
            ...s,
            marks: updatedMarks,
            total_marks: finalTotal,
            grade: calculateGrade(finalTotal)
          };
        }
        return s;
      })
    );
  };

  // Submit Gradebook: Save Draft (isPublish=false) or Publish (isPublish=true)
  const handleSaveGradebook = async (isPublish = false) => {
    if (Object.keys(errors).length > 0) {
      showAlert("Please resolve all mark validation errors before saving.", "error");
      return;
    }

    if (isPublish) setPublishing(true);
    else setSaving(true);

    try {
      const payload = {
        class_id: selectedClass.class_id,
        subject_id: selectedClass.subject_id,
        faculty_id: facultyId,
        custom_marks_list: studentsMarks.map(s => ({
          student_id: s.student_id,
          marks: Object.fromEntries(
            Object.entries(s.marks).map(([k, v]) => [k, parseFloat(v)])
          )
        })),
        is_publish: isPublish
      };

      const res = await apiFetch("/marks/bulk-entry", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to submit gradebook updates");
      }

      showAlert(
        isPublish
          ? "Gradebook published! Student portals updated instantly."
          : "Gradebook draft saved successfully!",
        "success"
      );
      
      await fetchGradebook();
    } catch (err) {
      console.error(err);
      showAlert(err.message || "Failed to save marks", "error");
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  // Discard local changes and reload
  const handleDiscardChanges = () => {
    if (window.confirm("Discard all unsaved changes and reload original marks?")) {
      setStudentsMarks(JSON.parse(JSON.stringify(originalMarks)));
      setErrors({});
      showAlert("Changes discarded.", "success");
    }
  };

  // CSV Export Functionality
  const handleExportCSV = () => {
    if (studentsMarks.length === 0) return;
    
    const headers = ["Roll No", "Full Name"];
    assessmentStructure.forEach(c => {
      headers.push(`${c.name} (Max ${c.max_marks})`);
    });
    headers.push("Total Marks (100)", "Grade", "Status");

    const csvRows = [headers.join(",")];
    
    studentsMarks.forEach((s) => {
      const row = [s.roll_no, `"${s.full_name}"`];
      assessmentStructure.forEach(c => {
        row.push(s.marks[c.subject_assessment_id] || 0);
      });
      row.push(s.total_marks, s.grade, s.is_published ? "Published" : "Draft");
      csvRows.push(row.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Gradebook_${selectedClass.class_name.replace(/ /g, "_")}_${selectedClass.subject_name.replace(/ /g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import Functionality (Supports Dynamic Column Headers)
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
        
        if (lines.length < 2) {
          showAlert("CSV file appears to be empty or lacks data rows", "error");
          return;
        }

        const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
        
        const rollIdx = headers.findIndex(h => h.includes("roll"));
        if (rollIdx === -1) {
          showAlert("CSV must contain a 'Roll No' column", "error");
          return;
        }

        // Map column index for each dynamic component
        const compIndices = {};
        assessmentStructure.forEach(c => {
          const idx = headers.findIndex(h => h.includes(c.name.toLowerCase()));
          if (idx !== -1) {
            compIndices[c.subject_assessment_id] = idx;
          }
        });

        if (Object.keys(compIndices).length === 0) {
          showAlert("No matching assessment component columns found. Make sure headers contain component names.", "error");
          return;
        }

        const updatedMarks = [...studentsMarks];
        let matchedCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length <= Math.max(rollIdx, ...Object.values(compIndices))) continue;

          const rollNo = cols[rollIdx];
          const studentIdx = updatedMarks.findIndex(s => s.roll_no.toLowerCase() === rollNo.toLowerCase());
          
          if (studentIdx !== -1) {
            const studentMarksDict = { ...updatedMarks[studentIdx].marks };
            
            assessmentStructure.forEach(c => {
              const colIdx = compIndices[c.subject_assessment_id];
              if (colIdx !== undefined) {
                let val = parseFloat(cols[colIdx]);
                if (isNaN(val)) val = 0;
                studentMarksDict[c.subject_assessment_id] = Math.min(c.max_marks, Math.max(0, val));
              }
            });

            // Recalculate totals
            let weightedSum = 0;
            let totalWeightage = 0;
            assessmentStructure.forEach(c => {
              const val = studentMarksDict[c.subject_assessment_id] || 0;
              weightedSum += (val / c.max_marks) * c.weightage;
              totalWeightage += c.weightage;
            });
            const overallTotal = totalWeightage > 0 ? parseFloat(((weightedSum / totalWeightage) * 100).toFixed(2)) : 0;
            const finalTotal = Math.min(100, Math.max(0, overallTotal));

            updatedMarks[studentIdx] = {
              ...updatedMarks[studentIdx],
              marks: studentMarksDict,
              total_marks: finalTotal,
              grade: calculateGrade(finalTotal)
            };
            matchedCount++;
          }
        }

        if (matchedCount > 0) {
          setStudentsMarks(updatedMarks);
          showAlert(`Imported marks for ${matchedCount} matching students! Review and save.`, "success");
        } else {
          showAlert("No matching student roll numbers found in CSV.", "error");
        }
      } catch (err) {
        console.error(err);
        showAlert("Failed to parse CSV file layout.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  // Fetch detailed profile for student drilldown drawer
  const handleOpenStudentDrawer = async (student) => {
    setSelectedStudentForDrawer(student);
    setDrawerLoading(true);
    setDrawerTab("academics");
    try {
      const res = await apiFetch(`/student/${student.student_id}/profile`);
      if (!res.ok) throw new Error("Failed to load profile details");
      const data = await res.json();
      setDrawerDetail(data);
      setInterventionNotes(data.metrics?.faculty_notes || "");
      setInterventionStatus(data.metrics?.intervention_status || "Not Contacted");
    } catch (err) {
      console.error(err);
      showAlert("Failed to load student details", "error");
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleSaveIntervention = async () => {
    setSavingIntervention(true);
    try {
      const res = await apiFetch(`/faculty/student/${selectedStudentForDrawer.student_id}/intervention`, {
        method: "POST",
        body: JSON.stringify({
          faculty_notes: interventionNotes,
          intervention_status: interventionStatus,
          faculty_id: facultyId
        })
      });
      if (res.ok) {
        showAlert("Intervention notes saved successfully!", "success");
        setDrawerDetail(prev => ({
          ...prev,
          metrics: {
            ...prev.metrics,
            faculty_notes: interventionNotes,
            intervention_status: interventionStatus
          }
        }));
      } else {
        showAlert("Failed to save intervention notes.", "error");
      }
    } catch (err) {
      console.error(err);
      showAlert("Error saving notes.", "error");
    } finally {
      setSavingIntervention(false);
    }
  };

  // Filter students marks list
  const filteredStudents = useMemo(() => {
    return studentsMarks.filter((s) => {
      const matchesSearch =
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.roll_no.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      switch (filterStatus) {
        case "PASSED":
          return s.total_marks >= 50;
        case "FAILED":
          return s.total_marks < 50;
        case "AT_RISK":
          return s.total_marks < 60; // Needs attention threshold
        case "UNPUBLISHED":
          return !s.is_published;
        default:
          return true;
      }
    });
  }, [studentsMarks, searchTerm, filterStatus]);

  // Summary KPIs calculations
  const stats = useMemo(() => {
    if (studentsMarks.length === 0) {
      return { avgScore: 0, passRate: 0, highest: 0, lowest: 0, pendingCount: 0, totalRoster: 0 };
    }
    const scores = studentsMarks.map(s => s.total_marks);
    const sum = scores.reduce((a, b) => a + b, 0);
    const avgScore = parseFloat((sum / studentsMarks.length).toFixed(1));
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const passCount = studentsMarks.filter(s => s.total_marks >= 50).length;
    const passRate = parseFloat(((passCount / studentsMarks.length) * 100).toFixed(1));

    // Calculate pending entries (students with 0 for any mandatory component)
    let pendingCount = 0;
    const mandatoryComps = assessmentStructure.filter(c => c.is_mandatory);
    studentsMarks.forEach(s => {
      const hasMissing = mandatoryComps.some(c => !s.marks[c.subject_assessment_id] || s.marks[c.subject_assessment_id] === 0);
      if (hasMissing) pendingCount++;
    });

    return { avgScore, passRate, highest, lowest, pendingCount, totalRoster: studentsMarks.length };
  }, [studentsMarks, assessmentStructure]);

  // Group assessment columns: INTERNAL vs EXTERNAL
  const internalAssessments = useMemo(() => {
    return assessmentStructure.filter(c => c.category === 'INTERNAL');
  }, [assessmentStructure]);

  const externalAssessments = useMemo(() => {
    return assessmentStructure.filter(c => c.category === 'EXTERNAL');
  }, [assessmentStructure]);

  // Calculate sum of max marks for groups
  const internalMaxSum = useMemo(() => {
    return internalAssessments.reduce((sum, c) => sum + c.max_marks, 0);
  }, [internalAssessments]);

  const externalMaxSum = useMemo(() => {
    return externalAssessments.reduce((sum, c) => sum + c.max_marks, 0);
  }, [externalAssessments]);

  // Calculate dynamic component averages for Drilldowndrawer comparison
  const componentAverages = useMemo(() => {
    const averages = {};
    assessmentStructure.forEach(c => {
      const total = studentsMarks.reduce((sum, s) => sum + (s.marks[c.subject_assessment_id] || 0), 0);
      averages[c.subject_assessment_id] = studentsMarks.length > 0 ? parseFloat((total / studentsMarks.length).toFixed(1)) : 0;
    });
    return averages;
  }, [studentsMarks, assessmentStructure]);

  // Grade Distribution Counts
  const gradeDistribution = useMemo(() => {
    const counts = { "A+": 0, "A": 0, "B": 0, "C": 0, "D": 0, "F": 0 };
    studentsMarks.forEach(s => {
      if (counts[s.grade] !== undefined) counts[s.grade]++;
    });
    return counts;
  }, [studentsMarks]);

  // Top Achievers and At-Risk Lists for the insights panel
  const topAchievers = useMemo(() => {
    return [...studentsMarks]
      .filter(s => s.total_marks >= 80)
      .sort((a, b) => b.total_marks - a.total_marks)
      .slice(0, 4);
  }, [studentsMarks]);

  const atRiskStudents = useMemo(() => {
    return [...studentsMarks]
      .filter(s => s.total_marks > 0 && s.total_marks < 60)
      .sort((a, b) => a.total_marks - b.total_marks)
      .slice(0, 4);
  }, [studentsMarks]);

  if (!selectedClass.class_id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-slate-950 rounded-3xl border border-slate-800">
        <div className="p-4 bg-indigo-500/10 rounded-full mb-6">
          <BookOpen className="text-indigo-500" size={48} />
        </div>
        <h2 className="text-2xl font-bold dark:text-white text-slate-800 mb-2">
          No Classroom Selected
        </h2>
        <p className="text-slate-400 max-w-md mb-6">
          Please select a classroom first in your workspace menu to view or enter gradebook marks.
        </p>
        <button
          onClick={() => navigate('/faculty/select-class')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-6 py-3 rounded-xl transition-all shadow-lg text-xs cursor-pointer"
        >
          Select Workspace Class
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-200">
      {/* Alert Header Toast */}
      <AnimatePresence>
        {alertInfo && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-3 rounded-2xl border shadow-2xl ${
              alertInfo.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300"
                : "bg-red-950/90 border-red-500/30 text-red-300"
            } backdrop-blur-md`}
          >
            {alertInfo.type === "success" ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
            <span className="font-semibold text-xs">{alertInfo.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workspace Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-950/50 p-6 rounded-3xl relative overflow-hidden shadow-xl text-white">
        <div className="absolute right-0 top-0 w-64 h-64 bg-radial-gradient(circle,rgba(99,102,241,0.15)_0%,transparent_70%) pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-indigo-400 font-black uppercase tracking-wider bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                LMS Workspace Active
              </span>
              <span className="text-[9px] text-emerald-400 font-black uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Seeded
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black mt-3 tracking-tight">
              ERP Marks & Gradebook
            </h1>
            <p className="text-slate-300 mt-1.5 text-xs font-semibold">
              {selectedClass.subject_name || "Database Systems"} • {selectedClass.class_name || "TE Computer A"}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <label className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold px-4 py-2.5 rounded-xl transition-all shadow-md text-xs cursor-pointer flex items-center gap-1.5 border border-slate-700">
              <Upload size={14} /> 
              <span>Import CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
            </label>
            <button
              onClick={handleExportCSV}
              className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold px-4 py-2.5 rounded-xl transition-all shadow-md text-xs cursor-pointer flex items-center gap-1.5 border border-slate-700"
            >
              <Download size={14} /> 
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => handleSaveGradebook(false)}
              disabled={saving || publishing}
              className="bg-slate-800 hover:bg-indigo-900/50 hover:text-indigo-200 text-white font-extrabold px-4 py-2.5 rounded-xl transition-all shadow-md text-xs cursor-pointer flex items-center gap-1.5 border border-indigo-800/30"
            >
              <EyeOff size={14} /> 
              <span>{saving ? "Saving..." : "Save Draft"}</span>
            </button>
            <button
              onClick={() => handleSaveGradebook(true)}
              disabled={saving || publishing}
              className="bg-indigo-650 hover:bg-indigo-650 text-white font-extrabold px-5 py-2.5 rounded-xl transition-all shadow-lg text-xs cursor-pointer flex items-center gap-1.5"
            >
              <Eye size={14} /> 
              <span>{publishing ? "Publishing..." : "Publish to Portal"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-500">
            <Users size={18} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">Roster Size</p>
            <h3 className="text-xl font-black mt-0.5">{stats.totalRoster}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500">
            <TrendingUp size={18} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">Class Avg</p>
            <h3 className="text-xl font-black mt-0.5">{stats.avgScore}%</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500">
            <Percent size={18} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">Pass Rate</p>
            <h3 className="text-xl font-black mt-0.5">{stats.passRate}%</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-yellow-500/10 rounded-xl text-yellow-500">
            <Award size={18} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">Range</p>
            <h3 className="text-sm font-black mt-0.5">{stats.lowest}% - {stats.highest}%</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center gap-3 col-span-2 md:col-span-1">
          <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500 animate-pulse">
            <AlertTriangle size={18} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">Incomplete</p>
            <h3 className="text-xl font-black mt-0.5">{stats.pendingCount} students</h3>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grade Distribution CSS Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-850 dark:text-white">Grade Distribution</h3>
              <p className="text-[10px] text-slate-400">Relative curve analysis of overall student totals.</p>
            </div>
            <span className="text-[10px] text-indigo-500 font-bold bg-indigo-500/10 px-2.5 py-1 rounded-full">
              Dynamic Curve
            </span>
          </div>

          <div className="flex items-end justify-between h-48 pt-6 px-4">
            {Object.entries(gradeDistribution).map(([grade, count]) => {
              const maxCount = Math.max(...Object.values(gradeDistribution), 1);
              const pct = (count / maxCount) * 100;
              let barColor = "from-indigo-600 to-indigo-500";
              if (grade === "A+") barColor = "from-emerald-600 to-emerald-500";
              else if (grade === "A") barColor = "from-teal-600 to-teal-500";
              else if (grade === "F") barColor = "from-red-600 to-red-500 animate-pulse";
              
              return (
                <div key={grade} className="flex flex-col items-center gap-2 w-12 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all bg-slate-950 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow z-30">
                    {count} Students
                  </div>
                  
                  {/* Bar */}
                  <div className="w-8 bg-slate-100 dark:bg-slate-950 rounded-t-lg h-36 flex items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`w-full bg-gradient-to-t ${barColor} rounded-t-lg shadow-sm`}
                    />
                  </div>
                  <span className="text-[10px] font-black text-slate-450">{grade}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Students Insights List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-sm text-slate-850 dark:text-white">Performance Insights</h3>
            <p className="text-[10px] text-slate-400">Instant tracking of high-risk and top-performing learners.</p>
          </div>

          <div className="space-y-4">
            {/* Top Performers */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/10">
                Top Performers
              </span>
              <div className="divide-y divide-slate-100 dark:divide-slate-850 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl p-2.5 space-y-2">
                {topAchievers.map(s => (
                  <div 
                    key={s.student_id} 
                    onClick={() => handleOpenStudentDrawer(s)}
                    className="flex justify-between items-center text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-500 cursor-pointer pt-1.5 first:pt-0"
                  >
                    <span>{s.full_name}</span>
                    <span className="font-black text-emerald-600">{s.total_marks}% ({s.grade})</span>
                  </div>
                ))}
                {topAchievers.length === 0 && <div className="text-center text-slate-400 text-[10px] py-2">No students currently above 80%.</div>}
              </div>
            </div>

            {/* At Risk */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-red-500 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/10">
                Needs Attention
              </span>
              <div className="divide-y divide-slate-100 dark:divide-slate-850 bg-slate-50/50 dark:bg-slate-955/20 rounded-2xl p-2.5 space-y-2">
                {atRiskStudents.map(s => (
                  <div 
                    key={s.student_id} 
                    onClick={() => handleOpenStudentDrawer(s)}
                    className="flex justify-between items-center text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-red-500 cursor-pointer pt-1.5 first:pt-0"
                  >
                    <span>{s.full_name}</span>
                    <span className="font-black text-red-500">{s.total_marks}% ({s.grade})</span>
                  </div>
                ))}
                {atRiskStudents.length === 0 && <div className="text-center text-slate-400 text-[10px] py-2">All students are performing comfortably.</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Ledger Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        
        {/* Ledger Header & Search/Filters */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-850 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="text-indigo-500" />
              <span>Academic Assessment Ledger</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Double-click a student row for performance analytics and risk tracking.
            </p>
          </div>

          {/* Filtering Tools */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl gap-1 overflow-x-auto scrollbar-none w-full sm:w-auto">
              {[
                { id: "ALL", label: "All" },
                { id: "PASSED", label: "Passed (>=50)" },
                { id: "FAILED", label: "Failed (<50)" },
                { id: "AT_RISK", label: "At-Risk (<60)" },
                { id: "UNPUBLISHED", label: "Drafts Only" }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id)}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    filterStatus === f.id
                      ? "bg-indigo-650 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-850"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Filter by student name or roll..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Sticky Headers & Sticky Columns Ledger Table */}
        {loading ? (
          <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw size={24} className="animate-spin text-indigo-500" />
            <span className="text-xs font-semibold">Seeding and compiling dynamic assessment ledger...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-semibold text-xs">
            No student records matching your active filters.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-h-[600px] overflow-y-auto scrollbar-thin">
            <table className="w-full border-collapse text-left text-xs table-fixed">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
                {/* Category Groupings Row */}
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase text-slate-450 tracking-wider">
                  <th className="px-4 py-2 bg-slate-100 dark:bg-slate-955 sticky left-0 z-45 w-[90px] border-r border-slate-200 dark:border-slate-800">Student ID</th>
                  <th className="px-4 py-2 bg-slate-100 dark:bg-slate-955 sticky left-[90px] z-45 w-[160px] border-r border-slate-200 dark:border-slate-800">Student Profile</th>
                  
                  {/* Internal Assessments Header Group */}
                  <th 
                    colSpan={internalAssessments.length + (internalAssessments.length > 0 ? 1 : 0)} 
                    className="px-4 py-2 text-center bg-indigo-500/5 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-r border-slate-200 dark:border-slate-800"
                  >
                    INTERNAL ASSESSMENT (Max {internalMaxSum} Marks)
                  </th>
                  
                  {/* External Assessments Header Group */}
                  <th 
                    colSpan={externalAssessments.length + (externalAssessments.length > 0 ? 1 : 0)} 
                    className="px-4 py-2 text-center bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-r border-slate-200 dark:border-slate-800"
                  >
                    EXTERNAL ASSESSMENT (Max {externalMaxSum} Marks)
                  </th>
                  
                  {/* Final Results Header Group */}
                  <th colSpan={4} className="px-4 py-2 text-center bg-slate-100 dark:bg-slate-955 text-slate-600 dark:text-slate-300">
                    FINAL ACADEMIC RESULT
                  </th>
                </tr>

                {/* Subcomponent Headers Row */}
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold text-slate-450">
                  {/* Left Column Sticky Spacers */}
                  <th className="px-4 py-3 bg-slate-50 dark:bg-slate-950 sticky left-0 z-40 border-r border-slate-100 dark:border-slate-850">Roll No</th>
                  <th className="px-4 py-3 bg-slate-50 dark:bg-slate-950 sticky left-[90px] z-40 border-r border-slate-100 dark:border-slate-850">Full Name</th>
                  
                  {/* Render Internals */}
                  {internalAssessments.map(c => (
                    <th key={c.subject_assessment_id} className="px-2 py-3 text-center w-24 border-r border-slate-100 dark:border-slate-850">
                      <span className="block truncate" title={c.name}>{c.name}</span>
                      <span className="block text-[8px] text-slate-400 font-bold mt-0.5">Max: {c.max_marks} • Wt: {c.weightage}%</span>
                    </th>
                  ))}
                  {internalAssessments.length > 0 && (
                    <th className="px-2 py-3 text-center bg-indigo-500/5 dark:bg-indigo-500/10 w-24 border-r border-slate-200 dark:border-slate-800 font-black text-indigo-500">
                      Internal Total
                    </th>
                  )}
                  
                  {/* Render Externals */}
                  {externalAssessments.map(c => (
                    <th key={c.subject_assessment_id} className="px-2 py-3 text-center w-24 border-r border-slate-100 dark:border-slate-850">
                      <span className="block truncate" title={c.name}>{c.name}</span>
                      <span className="block text-[8px] text-slate-400 font-bold mt-0.5">Max: {c.max_marks} • Wt: {c.weightage}%</span>
                    </th>
                  ))}
                  {externalAssessments.length > 0 && (
                    <th className="px-2 py-3 text-center bg-emerald-500/5 dark:bg-emerald-500/10 w-24 border-r border-slate-200 dark:border-slate-800 font-black text-emerald-500">
                      External Total
                    </th>
                  )}
                  
                  {/* Result Columns */}
                  <th className="px-4 py-3 text-center w-24 border-r border-slate-100 dark:border-slate-850 font-black">Weighted Total</th>
                  <th className="px-4 py-3 text-center w-20 border-r border-slate-100 dark:border-slate-850 font-black">Grade</th>
                  <th className="px-4 py-3 text-center w-24 border-r border-slate-100 dark:border-slate-850 font-black">Portal Status</th>
                  <th className="px-4 py-3 text-center w-16 font-black">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60">
                {filteredStudents.map((s) => {
                  let gradeColor = "text-red-500 bg-red-500/10 border border-red-500/20";
                  if (s.grade === "A+") gradeColor = "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20";
                  else if (s.grade === "A") gradeColor = "text-teal-500 bg-teal-500/10 border border-teal-500/20";
                  else if (s.grade === "B") gradeColor = "text-blue-500 bg-blue-500/10 border border-blue-500/20";
                  else if (s.grade === "C") gradeColor = "text-indigo-500 bg-indigo-500/10 border border-indigo-500/20";
                  else if (s.grade === "D") gradeColor = "text-yellow-500 bg-yellow-500/10 border border-yellow-500/20";

                  const isEdited = isRowEdited(s.student_id);

                  // Calculate sub-totals for the client side rendering
                  let studentInternalSum = 0;
                  internalAssessments.forEach(c => {
                    studentInternalSum += parseFloat(s.marks[c.subject_assessment_id] || 0);
                  });

                  let studentExternalSum = 0;
                  externalAssessments.forEach(c => {
                    studentExternalSum += parseFloat(s.marks[c.subject_assessment_id] || 0);
                  });

                  return (
                    <tr 
                      key={s.student_id} 
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-850/30 transition-colors ${
                        isEdited ? "bg-amber-500/5 dark:bg-amber-500/5" : ""
                      }`}
                    >
                      {/* Roll No Sticky */}
                      <td className="px-4 py-3 bg-white dark:bg-slate-900 sticky left-0 z-20 font-bold text-slate-400 border-r border-slate-100 dark:border-slate-850 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-1.5">
                          {isEdited && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" title="Unsaved changes" />}
                          <span>{s.roll_no}</span>
                        </div>
                      </td>
                      
                      {/* Name Sticky */}
                      <td className="px-4 py-3 bg-white dark:bg-slate-900 sticky left-[90px] z-20 font-black text-slate-850 dark:text-white border-r border-slate-100 dark:border-slate-850 shadow-[2px_0_5px_rgba(0,0,0,0.02)] truncate">
                        <button 
                          onClick={() => handleOpenStudentDrawer(s)}
                          className="text-left hover:text-indigo-500 focus:outline-none truncate"
                        >
                          {s.full_name}
                        </button>
                      </td>

                      {/* Render Internal Inputs */}
                      {internalAssessments.map(c => {
                        const cellKey = `${s.student_id}_${c.subject_assessment_id}`;
                        const errorMsg = errors[cellKey];
                        return (
                          <td key={c.subject_assessment_id} className="px-2 py-2 whitespace-nowrap relative border-r border-slate-100 dark:border-slate-850">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max={c.max_marks}
                              value={s.marks[c.subject_assessment_id] || 0}
                              disabled={!c.editable_by_faculty}
                              onChange={(e) => handleMarkChange(s.student_id, c.subject_assessment_id, e.target.value)}
                              className={`w-full text-center bg-slate-50 dark:bg-slate-950 border rounded-xl px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold transition-all ${
                                errorMsg 
                                  ? "border-red-500 ring-1 ring-red-500 bg-red-50/20 text-red-500" 
                                  : "border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                              }`}
                            />
                            {errorMsg && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none" title={errorMsg}>
                                <AlertTriangle size={12} />
                              </span>
                            )}
                          </td>
                        );
                      })}
                      {internalAssessments.length > 0 && (
                        <td className="px-2 py-3 text-center bg-indigo-500/5 dark:bg-indigo-500/10 font-bold text-slate-700 dark:text-slate-350 border-r border-slate-200 dark:border-slate-800">
                          {studentInternalSum.toFixed(1)} / {internalMaxSum}
                        </td>
                      )}

                      {/* Render External Inputs */}
                      {externalAssessments.map(c => {
                        const cellKey = `${s.student_id}_${c.subject_assessment_id}`;
                        const errorMsg = errors[cellKey];
                        return (
                          <td key={c.subject_assessment_id} className="px-2 py-2 whitespace-nowrap relative border-r border-slate-100 dark:border-slate-850">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max={c.max_marks}
                              value={s.marks[c.subject_assessment_id] || 0}
                              disabled={!c.editable_by_faculty}
                              onChange={(e) => handleMarkChange(s.student_id, c.subject_assessment_id, e.target.value)}
                              className={`w-full text-center bg-slate-50 dark:bg-slate-955 border rounded-xl px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold transition-all ${
                                errorMsg 
                                  ? "border-red-500 ring-1 ring-red-500 bg-red-50/20 text-red-500" 
                                  : "border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                              }`}
                            />
                            {errorMsg && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none" title={errorMsg}>
                                <AlertTriangle size={12} />
                              </span>
                            )}
                          </td>
                        );
                      })}
                      {externalAssessments.length > 0 && (
                        <td className="px-2 py-3 text-center bg-emerald-500/5 dark:bg-emerald-500/10 font-bold text-slate-700 dark:text-slate-350 border-r border-slate-200 dark:border-slate-800">
                          {studentExternalSum.toFixed(1)} / {externalMaxSum}
                        </td>
                      )}

                      {/* Overall Weighted Total score out of 100 */}
                      <td className="px-4 py-3 whitespace-nowrap text-center font-black text-slate-900 dark:text-white text-sm border-r border-slate-100 dark:border-slate-850">
                        {s.total_marks}%
                      </td>

                      {/* Overall grade */}
                      <td className="px-4 py-3 whitespace-nowrap text-center border-r border-slate-100 dark:border-slate-850">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full font-black text-[10px] ${gradeColor}`}>
                          {s.grade}
                        </span>
                      </td>

                      {/* Publishing state */}
                      <td className="px-4 py-3 whitespace-nowrap text-center border-r border-slate-100 dark:border-slate-850">
                        {s.is_published ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase">
                            <CheckCircle size={10} /> Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black uppercase">
                            <EyeOff size={10} /> Draft
                          </span>
                        )}
                      </td>

                      {/* Drilldown trigger */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleOpenStudentDrawer(s)}
                          className="p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg hover:bg-indigo-500 hover:text-white hover:border-indigo-500 text-slate-400 transition-all cursor-pointer"
                          title="Open student performance drilldown"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom Bar: Action triggers */}
        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-850">
          <button
            onClick={() => handleSaveGradebook(false)}
            disabled={saving || publishing || studentsMarks.length === 0}
            className="bg-indigo-650 hover:bg-indigo-500 disabled:bg-indigo-900/40 disabled:text-indigo-300 text-white font-extrabold px-6 py-3.5 rounded-xl transition-all shadow-lg text-xs flex items-center gap-2 cursor-pointer"
          >
            <Save size={16} /> 
            <span>{saving ? "Saving Changes..." : "Commit Gradebook Updates"}</span>
          </button>
        </div>
      </div>

      {/* Floating Change Detection Bar */}
      <AnimatePresence>
        {editedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-950/95 border border-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 backdrop-blur-md max-w-xl w-full justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <div>
                <span className="font-extrabold text-xs block">Unsaved Gradebook Changes</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                  You have modified grades for {editedCount} students.
                </span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleDiscardChanges}
                className="px-3.5 py-2 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer"
              >
                Discard
              </button>
              <button
                onClick={() => handleSaveGradebook(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer"
              >
                Save Draft
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-out Student Detail Drawer */}
      <AnimatePresence>
        {selectedStudentForDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudentForDrawer(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl h-full flex flex-col justify-between z-10"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                <div>
                  <span className="text-[10px] text-indigo-500 font-extrabold uppercase">Learner Gradebook Drilldown</span>
                  <h3 className="font-black text-base md:text-lg text-slate-850 dark:text-white mt-0.5 leading-tight">
                    {selectedStudentForDrawer.full_name}
                  </h3>
                  <p className="text-[10px] text-slate-450 font-semibold mt-0.5">
                    Roll No: {selectedStudentForDrawer.roll_no} • Semester {selectedClass.semester}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStudentForDrawer(null)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Tabs Navigation */}
              {!drawerLoading && drawerDetail && (
                <div className="flex border-b border-slate-100 dark:border-slate-800 overflow-x-auto scrollbar-none shrink-0 bg-slate-50 dark:bg-slate-955 px-3 py-1 gap-1">
                  {[
                    { id: "academics", label: "Academic Breakdown" },
                    { id: "interventions", label: "Risk & Interventions" }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setDrawerTab(t.id)}
                      className={`px-3 py-2 text-[10px] font-extrabold uppercase rounded-lg transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                        drawerTab === t.id 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : 'text-slate-550 hover:bg-slate-100 dark:hover:bg-slate-850'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Scrollable details */}
              {drawerLoading ? (
                <div className="flex-1 flex flex-col justify-center items-center gap-2">
                  <RefreshCw size={20} className="animate-spin text-indigo-500" />
                  <span className="text-xs text-slate-400">Compiling profile telemetry...</span>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-5 text-xs text-left">
                  {drawerTab === "academics" && drawerDetail && (
                    <div className="space-y-6">
                      {/* Overall Marks Card */}
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 border border-slate-250 dark:border-slate-850 p-5 rounded-2xl flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Overall Weighted Score</span>
                          <h3 className="text-3xl font-black text-slate-850 dark:text-white mt-1">
                            {selectedStudentForDrawer.total_marks}%
                          </h3>
                        </div>
                        <span className={`inline-block px-4 py-2 rounded-xl font-black text-base ${
                          selectedStudentForDrawer.grade === "A+" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                          selectedStudentForDrawer.grade === "A" ? "bg-teal-500/10 text-teal-500 border border-teal-500/20" :
                          selectedStudentForDrawer.grade === "F" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                          "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20"
                        }`}>
                          {selectedStudentForDrawer.grade}
                        </span>
                      </div>

                      {/* Component breakdown against class average */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Component Performance Comparison</h4>
                        <div className="space-y-4">
                          {assessmentStructure.map(c => {
                            const studentVal = selectedStudentForDrawer.marks[c.subject_assessment_id] || 0;
                            const classAvg = componentAverages[c.subject_assessment_id] || 0;
                            const maxVal = c.max_marks;
                            
                            // percentages
                            const studentPct = maxVal > 0 ? (studentVal / maxVal) * 100 : 0;
                            const avgPct = maxVal > 0 ? (classAvg / maxVal) * 100 : 0;

                            return (
                              <div key={c.subject_assessment_id} className="space-y-1.5">
                                <div className="flex justify-between items-center font-bold text-[11px]">
                                  <span className="text-slate-700 dark:text-slate-350">{c.name}</span>
                                  <span className="text-slate-500">
                                    <span className="text-slate-850 dark:text-white font-black">{studentVal}</span> / {maxVal} (Avg: {classAvg})
                                  </span>
                                </div>
                                
                                {/* Comparison progress bar */}
                                <div className="w-full bg-slate-100 dark:bg-slate-950 h-3 rounded-full overflow-hidden relative border border-slate-200 dark:border-slate-850">
                                  {/* Class average marker */}
                                  <div 
                                    className="absolute top-0 bottom-0 w-0.5 bg-indigo-400 z-10" 
                                    style={{ left: `${avgPct}%` }}
                                    title={`Class Avg: ${classAvg}`}
                                  />
                                  {/* Student value */}
                                  <div 
                                    className={`h-full rounded-full ${
                                      studentVal >= classAvg 
                                        ? "bg-gradient-to-r from-emerald-600 to-emerald-500" 
                                        : "bg-gradient-to-r from-indigo-600 to-indigo-500"
                                    }`}
                                    style={{ width: `${studentPct}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-[8px] text-slate-400 font-bold">
                                  <span>0%</span>
                                  <span className="text-indigo-400">● Class Average ({classAvg})</span>
                                  <span>100%</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {drawerTab === "interventions" && drawerDetail && (
                    <div className="space-y-6">
                      {/* Telemetry quick indicators */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-4 rounded-xl text-left">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">Attendance Rate</span>
                          <span className={`font-black text-xl block mt-1 ${
                            drawerDetail.metrics?.attendance < 75 ? "text-red-500 animate-pulse" :
                            drawerDetail.metrics?.attendance < 85 ? "text-amber-500" : "text-emerald-500"
                          }`}>
                            {drawerDetail.metrics?.attendance}%
                          </span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-4 rounded-xl text-left">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">Predicted CGPA</span>
                          <span className="font-black text-xl text-slate-850 dark:text-white block mt-1">
                            {drawerDetail.metrics?.predicted_cgpa || "3.2"}
                          </span>
                        </div>
                        <div className="bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-4 rounded-xl text-left">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">XP Gamified Points</span>
                          <span className="font-black text-xl text-yellow-600 dark:text-yellow-400 block mt-1">
                            {drawerDetail.metrics?.xp_points || 0} XP
                          </span>
                        </div>
                        <div className="bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-4 rounded-xl text-left">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">Calculated Risk level</span>
                          <span className={`font-black text-base block mt-1 uppercase ${
                            drawerDetail.metrics?.risk_level === 'High' ? 'text-red-500' :
                            drawerDetail.metrics?.risk_level === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
                          }`}>
                            {drawerDetail.metrics?.risk_level || "Low"} Risk
                          </span>
                        </div>
                      </div>

                      {/* Faculty notes and intervention triggers */}
                      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl space-y-4">
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-850 dark:text-white">Intervention Log</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">Log counseling sessions or support status.</p>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Intervention Status</label>
                            <select
                              value={interventionStatus}
                              onChange={(e) => setInterventionStatus(e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-350 font-bold"
                            >
                              <option value="Not Contacted">Not Contacted</option>
                              <option value="Contacted">Contacted / Notified</option>
                              <option value="In Progress">Support In Progress</option>
                              <option value="Resolved">Resolved / Cleared</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Faculty Notes / Action Items</label>
                            <textarea
                              rows={4}
                              value={interventionNotes}
                              onChange={(e) => setInterventionNotes(e.target.value)}
                              placeholder="e.g. Student needs assistance with nested loops; advised to attend Saturday support session..."
                              className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-300 placeholder-slate-400 leading-relaxed font-semibold text-xs"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={handleSaveIntervention}
                            disabled={savingIntervention}
                            className="w-full bg-indigo-650 hover:bg-indigo-500 text-white font-extrabold py-2.5 rounded-xl transition-all shadow text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            {savingIntervention ? (
                              <>
                                <RefreshCw size={14} className="animate-spin" />
                                <span>Saving Notes...</span>
                              </>
                            ) : (
                              <>
                                <UserCheck size={14} />
                                <span>Save Intervention Log</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Drawer footer */}
              <div className="p-5 border-t border-slate-100 dark:border-slate-850 flex gap-3 bg-slate-50 dark:bg-slate-955 shrink-0">
                <button
                  onClick={() => setSelectedStudentForDrawer(null)}
                  className="w-full py-2.5 border border-slate-250 dark:border-slate-800 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-850 font-bold transition-all text-xs cursor-pointer"
                >
                  Close Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarksGradebook;
