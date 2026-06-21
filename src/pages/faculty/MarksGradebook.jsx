
import React, { useState, useEffect } from 'react';
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
  FileText
} from 'lucide-react';

const MarksGradebook = () => {
  const navigate = useNavigate();
  const selectedClass = JSON.parse(localStorage.getItem("selectedClass") || "{}");
  const facultyId = Number(localStorage.getItem("faculty_id") || "7");

  // State data
  const [studentsMarks, setStudentsMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [alertInfo, setAlertInfo] = useState(null);

  // CSV Import state
  const [csvFile, setCsvFile] = useState(null);

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
      const res = await fetch(
        `http://localhost:8000/marks?class_id=${selectedClass.class_id}&subject_id=${selectedClass.subject_id}`
      );
      if (!res.ok) throw new Error("Failed to load marks");
      const data = await res.json();
      setStudentsMarks(data);
    } catch (err) {
      console.error(err);
      showAlert("Error fetching gradebook data", "error");
    } finally {
      setLoading(false);
    }
  };

  // Real-time calculation helper
  const calculateGrade = (total) => {
    if (total >= 90) return "A+";
    if (total >= 80) return "A";
    if (total >= 70) return "B";
    if (total >= 60) return "C";
    if (total >= 50) return "D";
    return "F";
  };

  const handleMarkChange = (studentId, field, value) => {
    // Sanitize input
    let numericVal = value === "" ? 0 : parseFloat(value);
    if (isNaN(numericVal)) numericVal = 0;
    if (numericVal < 0) numericVal = 0;
    if (numericVal > 25) numericVal = 25; // Default cap of 25 per assessment component

    setStudentsMarks((prev) =>
      prev.map((s) => {
        if (s.student_id === studentId) {
          const updated = { ...s, [field]: numericVal };
          const total =
            updated.assignment_marks +
            updated.quiz_marks +
            updated.internal_marks +
            updated.practical_marks;
          updated.total_marks = Math.min(100, parseFloat(total.toFixed(2)));
          updated.grade = calculateGrade(updated.total_marks);
          return updated;
        }
        return s;
      })
    );
  };

  const handleSaveGradebook = async () => {
    setSaving(true);
    try {
      const payload = {
        class_id: selectedClass.class_id,
        subject_id: selectedClass.subject_id,
        faculty_id: facultyId,
        marks_list: studentsMarks.map((s) => ({
          student_id: s.student_id,
          assignment_marks: s.assignment_marks,
          quiz_marks: s.quiz_marks,
          internal_marks: s.internal_marks,
          practical_marks: s.practical_marks
        }))
      };

      const res = await fetch("http://localhost:8000/marks/bulk-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to submit marks bulk entry");
      }

      showAlert("Gradebook saved and students updated successfully!", "success");
      fetchGradebook();
    } catch (err) {
      console.error(err);
      showAlert(err.message || "Failed to save marks", "error");
    } finally {
      setSaving(false);
    }
  };

  // CSV Export Functionality
  const handleExportCSV = () => {
    if (studentsMarks.length === 0) return;
    
    const headers = [
      "Roll No",
      "Full Name",
      "Assignment Marks (Max 25)",
      "Quiz Marks (Max 25)",
      "Internal Marks (Max 25)",
      "Practical Marks (Max 25)",
      "Total Marks (Max 100)",
      "Grade"
    ];

    const csvRows = [headers.join(",")];
    
    studentsMarks.forEach((s) => {
      const row = [
        s.roll_no,
        `"${s.full_name}"`,
        s.assignment_marks,
        s.quiz_marks,
        s.internal_marks,
        s.practical_marks,
        s.total_marks,
        s.grade
      ];
      csvRows.push(row.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Gradebook_${selectedClass.class_name.replace(" ", "_")}_${selectedClass.subject_name.replace(" ", "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import Functionality
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

        // Map names/roll numbers to update existing studentsMarks list
        const updatedMarks = [...studentsMarks];
        let matchedCount = 0;

        // Start from row 1 (skipping header)
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length < 6) continue;

          const rollNo = cols[0];
          const assign = parseFloat(cols[2]) || 0;
          const quiz = parseFloat(cols[3]) || 0;
          const internal = parseFloat(cols[4]) || 0;
          const practical = parseFloat(cols[5]) || 0;

          const studentIdx = updatedMarks.findIndex(s => s.roll_no === rollNo);
          if (studentIdx !== -1) {
            const total = parseFloat((assign + quiz + internal + practical).toFixed(2));
            updatedMarks[studentIdx] = {
              ...updatedMarks[studentIdx],
              assignment_marks: Math.min(25, Math.max(0, assign)),
              quiz_marks: Math.min(25, Math.max(0, quiz)),
              internal_marks: Math.min(25, Math.max(0, internal)),
              practical_marks: Math.min(25, Math.max(0, practical)),
              total_marks: Math.min(100, total),
              grade: calculateGrade(total)
            };
            matchedCount++;
          }
        }

        if (matchedCount > 0) {
          setStudentsMarks(updatedMarks);
          showAlert(`Successfully imported marks for ${matchedCount} matching students! Review and save.`, "success");
        } else {
          showAlert("No matching student roll numbers found in CSV file.", "error");
        }
      } catch (err) {
        console.error(err);
        showAlert("Failed to parse CSV file layout.", "error");
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = null;
  };

  const filteredStudents = studentsMarks.filter((s) =>
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.roll_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats calculation
  const getGradebookStats = () => {
    if (studentsMarks.length === 0) return { avgScore: 0, passRate: 0, highest: 0, passCount: 0 };
    const scores = studentsMarks.map(s => s.total_marks);
    const sum = scores.reduce((a, b) => a + b, 0);
    const avgScore = parseFloat((sum / studentsMarks.length).toFixed(1));
    const highest = Math.max(...scores);
    const passCount = studentsMarks.filter(s => s.total_marks >= 50).length;
    const passRate = parseFloat(((passCount / studentsMarks.length) * 100).toFixed(1));
    
    return { avgScore, passRate, highest, passCount };
  };

  const stats = getGradebookStats();

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
          Please select a classroom first in your workspace menu to view or enter gradebook marks.
        </p>
        <button
          onClick={() => navigate('/faculty/select-class')}
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
              Marks & Gradebook
            </h1>
            <p className="text-slate-300 mt-1.5 text-xs font-semibold">
              {selectedClass.subject_name || "Database Systems"} • {selectedClass.class_name || "TE Computer A"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <label className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold px-4 py-3 rounded-xl transition-all shadow-md text-xs cursor-pointer flex items-center gap-2 border border-slate-700">
              <Upload size={14} /> Import CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
            </label>
            <button
              onClick={handleExportCSV}
              className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold px-4 py-3 rounded-xl transition-all shadow-md text-xs cursor-pointer flex items-center gap-2 border border-slate-700"
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              onClick={handleSaveGradebook}
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white font-extrabold px-5 py-3 rounded-xl transition-all shadow-lg text-xs cursor-pointer flex items-center gap-2"
            >
              <Save size={14} /> {saving ? "Saving..." : "Save Gradebook"}
            </button>
          </div>
        </div>
      </div>

      {/* Overview Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
            <Users size={20} />
          </div>
          <div>
            <p className="text-slate-400 text-xs">Total Roster</p>
            <h3 className="text-2xl font-black mt-0.5">{studentsMarks.length}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-slate-400 text-xs">Class Average</p>
            <h3 className="text-2xl font-black mt-0.5">{stats.avgScore}%</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
            <Percent size={20} />
          </div>
          <div>
            <p className="text-slate-400 text-xs">Passing Rate</p>
            <h3 className="text-2xl font-black mt-0.5">{stats.passRate}%</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-500">
            <Award size={20} />
          </div>
          <div>
            <p className="text-slate-400 text-xs">Highest Score</p>
            <h3 className="text-2xl font-black mt-0.5">{stats.highest}%</h3>
          </div>
        </div>
      </div>

      {/* Gradebook Grid Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold">LMS Marks Ledger</h2>
            <p className="text-slate-400 text-xs mt-1">
              Enter assessment scores below (out of 25 for each column). Totals and grades compile in real-time.
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading student grades...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-slate-400">No students matching query.</div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-500 w-24">Roll No</th>
                  <th className="px-6 py-4 font-bold text-slate-500 min-w-[180px]">Student Name</th>
                  <th className="px-4 py-4 font-bold text-slate-500 text-center w-28">Assignment (25)</th>
                  <th className="px-4 py-4 font-bold text-slate-500 text-center w-28">Quiz (25)</th>
                  <th className="px-4 py-4 font-bold text-slate-500 text-center w-28">Internal (25)</th>
                  <th className="px-4 py-4 font-bold text-slate-500 text-center w-28">Practical (25)</th>
                  <th className="px-6 py-4 font-bold text-slate-500 text-center w-28">Total (100)</th>
                  <th className="px-6 py-4 font-bold text-slate-500 text-center w-20">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredStudents.map((s) => {
                  let gradeColor = "text-red-500 bg-red-500/10 border border-red-500/20";
                  if (s.grade === "A+") gradeColor = "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20";
                  else if (s.grade === "A") gradeColor = "text-teal-500 bg-teal-500/10 border border-teal-500/20";
                  else if (s.grade === "B") gradeColor = "text-blue-500 bg-blue-500/10 border border-blue-500/20";
                  else if (s.grade === "C") gradeColor = "text-indigo-500 bg-indigo-500/10 border border-indigo-500/20";
                  else if (s.grade === "D") gradeColor = "text-yellow-500 bg-yellow-500/10 border border-yellow-500/20";

                  return (
                    <tr key={s.student_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-400">
                        {s.roll_no}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-extrabold text-slate-900 dark:text-white">
                        {s.full_name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="25"
                          value={s.assignment_marks}
                          onChange={(e) => handleMarkChange(s.student_id, "assignment_marks", e.target.value)}
                          className="w-full text-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1.5 focus:outline-none focus:border-purple-500 transition-colors font-semibold"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="25"
                          value={s.quiz_marks}
                          onChange={(e) => handleMarkChange(s.student_id, "quiz_marks", e.target.value)}
                          className="w-full text-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1.5 focus:outline-none focus:border-purple-500 transition-colors font-semibold"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="25"
                          value={s.internal_marks}
                          onChange={(e) => handleMarkChange(s.student_id, "internal_marks", e.target.value)}
                          className="w-full text-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1.5 focus:outline-none focus:border-purple-500 transition-colors font-semibold"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="25"
                          value={s.practical_marks}
                          onChange={(e) => handleMarkChange(s.student_id, "practical_marks", e.target.value)}
                          className="w-full text-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1.5 focus:outline-none focus:border-purple-500 transition-colors font-semibold"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-black text-slate-900 dark:text-white text-base">
                        {s.total_marks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full font-black text-xs ${gradeColor}`}>
                          {s.grade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleSaveGradebook}
            disabled={saving || studentsMarks.length === 0}
            className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white font-extrabold px-6 py-3.5 rounded-xl transition-all shadow-lg text-sm flex items-center gap-2 cursor-pointer"
          >
            <Save size={18} /> {saving ? "Saving Changes..." : "Commit Gradebook Updates"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarksGradebook;
