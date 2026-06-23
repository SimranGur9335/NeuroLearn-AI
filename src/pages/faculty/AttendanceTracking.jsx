import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { saveAs } from 'file-saver';
import {
  FileSpreadsheet,
  Search,
  Download,
  Check,
  X,
  Sparkles,
  Calendar,
  Clock,
  UserCheck,
  RefreshCw,
  ChevronRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../services/api";

const AttendanceTracking = () => {
  const navigate = useNavigate();
  const selectedClass = JSON.parse(localStorage.getItem("selectedClass") || "{}");
  const { user } = useAuth();
  const facultyId = user?.faculty_id;

  const [classes, setClasses] = useState([]);
  const [currentClass, setCurrentClass] = useState(selectedClass);
  const [students, setStudents] = useState([]);
  const [studentMetrics, setStudentMetrics] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  
  // Date and filter states (with localStorage persistence)
  const [selectedDate, setSelectedDate] = useState(
    localStorage.getItem("attendanceSelectedDate") || new Date().toISOString().split("T")[0]
  );
  const [activeTab, setActiveTab] = useState("grid"); // 'grid' | 'history' | 'monthly'
  
  // Stats and history states
  const [summary, setSummary] = useState({ present: 0, absent: 0, late: 0 });
  const [history, setHistory] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState({ dates: [], matrix: [] });
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  // Persistence of selectedDate
  useEffect(() => {
    localStorage.setItem("attendanceSelectedDate", selectedDate);
  }, [selectedDate]);

  // Fetch classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await apiFetch(`/faculty/${facultyId}/classes`);
        if (res.ok) {
          const data = await res.json();
          setClasses(data);
          // Fallback if current class is empty
          if (!currentClass.class_id && data.length > 0) {
            setCurrentClass(data[0]);
            localStorage.setItem("selectedClass", JSON.stringify(data[0]));
          }
        }
      } catch (err) {
        console.error("Error loading workspace classes:", err);
      }
    };
    fetchClasses();
  }, [facultyId]);

  // Load cumulative student metrics (for defaulter list)
  const loadStudentMetrics = async () => {
    if (!currentClass.class_id) return;
    try {
      const res = await apiFetch(`/class/${currentClass.class_id}/student-metrics`);
      if (res.ok) {
        const data = await res.json();
        setStudentMetrics(data);
      }
    } catch (err) {
      console.error("Error loading student metrics:", err);
    }
  };

  useEffect(() => {
    if (currentClass.class_id) {
      loadStudentMetrics();
    }
  }, [currentClass.class_id]);

  // Load attendance grid for selected date
  const loadDailyGrid = async () => {
    if (!currentClass.class_id) return;
    setLoading(true);
    try {
      const res = await apiFetch(
        `/attendance/records?class_id=${currentClass.class_id}&subject_id=${currentClass.subject_id}&date=${selectedDate}`
      );
      if (!res.ok) throw new Error("Failed to load attendance records");
      const data = await res.json();
      setStudents(data);
      
      // Map statuses
      const statusMap = {};
      data.forEach(s => {
        statusMap[s.student_id] = s.status;
      });
      setAttendanceStatus(statusMap);
      
      // Calculate summary on current page
      let p = 0, a = 0, l = 0;
      data.forEach(s => {
        if (s.status === "Present") p++;
        else if (s.status === "Absent") a++;
        else if (s.status === "Late") l++;
      });
      setSummary({ present: p, absent: a, late: l });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load history list
  const loadHistory = async () => {
    if (!currentClass.class_id) return;
    try {
      const res = await apiFetch(
        `/attendance/history?class_id=${currentClass.class_id}&subject_id=${currentClass.subject_id}`
      );
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Load monthly matrix
  const loadMonthlyReport = async () => {
    if (!currentClass.class_id) return;
    try {
      const res = await apiFetch(
        `/attendance/monthly-report?class_id=${currentClass.class_id}&subject_id=${currentClass.subject_id}&month=${currentMonth}&year=${currentYear}`
      );
      const data = await res.json();
      setMonthlyReport(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger loads based on active tabs
  useEffect(() => {
    if (activeTab === "grid") {
      loadDailyGrid();
      loadStudentMetrics();
    } else if (activeTab === "history") {
      loadHistory();
    } else if (activeTab === "monthly") {
      loadMonthlyReport();
    }
  }, [currentClass.class_id, currentClass.subject_id, selectedDate, activeTab, currentMonth, currentYear]);

  // Bulk actions handlers
  const handleBulkMark = (status) => {
    const updated = { ...attendanceStatus };
    students.forEach(s => {
      updated[s.student_id] = status;
    });
    setAttendanceStatus(updated);
    
    // Update local summary
    const count = students.length;
    setSummary({
      present: status === "Present" ? count : 0,
      absent: status === "Absent" ? count : 0,
      late: status === "Late" ? count : 0
    });
  };

  // Save Attendance to database
  const handleSaveAttendance = async () => {
    try {
      const payload = {
        class_id: currentClass.class_id,
        subject_id: currentClass.subject_id,
        faculty_id: facultyId,
        date: selectedDate,
        records: Object.keys(attendanceStatus).map(sid => ({
          student_id: Number(sid),
          status: attendanceStatus[sid]
        }))
      };

      const res = await apiFetch("/attendance/save", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save attendance");
      alert("Attendance Saved and Logged Successfully!");
      loadDailyGrid();
      loadStudentMetrics();
    } catch (err) {
      console.error(err);
      alert("Error saving attendance records!");
    }
  };

  // Export Monthly Grid as CSV
  const handleExportCSV = () => {
    if (!monthlyReport.matrix || monthlyReport.matrix.length === 0) {
      alert("No data available to export");
      return;
    }
    const headers = ["Roll No", "Full Name", ...monthlyReport.dates];
    const rows = monthlyReport.matrix.map(row => [
      row.roll_no,
      row.full_name,
      ...monthlyReport.dates.map(d => row.attendance[d] || "-")
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `Monthly_Attendance_Report_Class_${currentClass.class_id}_Subject_${currentClass.subject_id}.csv`);
  };

  const filteredStudents = students.filter(
    s => s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         s.roll_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate advanced metrics
  const totalStudents = students.length;
  const presentPct = totalStudents > 0 ? Math.round((summary.present / totalStudents) * 100) : 0;
  const absentPct = totalStudents > 0 ? Math.round((summary.absent / totalStudents) * 100) : 0;
  
  // Calculate historical rate & trend text
  const avgRate = history.length > 0
    ? Math.round(history.reduce((acc, h) => {
        const total = h.present + h.absent + h.late;
        const rate = total > 0 ? (h.present / total) * 100 : 100;
        return acc + rate;
      }, 0) / history.length)
    : 85;
  const todayRate = (summary.present + summary.absent + summary.late) > 0
    ? Math.round((summary.present / (summary.present + summary.absent + summary.late)) * 100)
    : 100;
  const diff = todayRate - avgRate;
  const trendText = diff > 2 
    ? `Improved (+${diff}% vs avg)` 
    : diff < -2 
      ? `Declining (${diff}% vs avg)` 
      : `Stable (matches avg)`;

  // Defaulter metrics from studentMetrics
  const defaulters = studentMetrics.filter(s => s.attendance < 75);
  const criticalDefaulters = studentMetrics.filter(s => s.attendance < 60);

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
          <p className="text-xs text-purple-650 font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Attendance Matrix
          </p>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            Lecture Attendance & Progress
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              Class: <span className="font-semibold text-slate-800 dark:text-white">{currentClass.class_name}</span> | Subject: <span className="font-semibold text-slate-800 dark:text-white">{currentClass.subject_name}</span>
            </p>
            <div className="flex items-center gap-1.5 border-l border-slate-300 dark:border-slate-700 pl-4">
              <span className="text-slate-450 dark:text-slate-500 text-xs font-black uppercase tracking-wider">Workspace:</span>
              <select
                value={currentClass.class_id ? `${currentClass.class_id}-${currentClass.subject_id}` : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    const [cid, sid] = val.split("-").map(Number);
                    const match = classes.find(c => c.class_id === cid && c.subject_id === sid);
                    if (match) {
                      setCurrentClass(match);
                      localStorage.setItem("selectedClass", JSON.stringify(match));
                    }
                  }
                }}
                className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-purple-500/50 cursor-pointer"
              >
                {classes.map(c => (
                  <option key={`${c.class_id}-${c.subject_id}`} value={`${c.class_id}-${c.subject_id}`}>
                    {c.class_name} - {c.subject_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-200/60 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-1.5 rounded-2xl gap-1.5 shrink-0">
          <button
            onClick={() => setActiveTab("grid")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "grid" ? "bg-purple-600 text-white shadow-md" : "hover:text-slate-900 dark:hover:text-white text-slate-550"}`}
          >
            Mark Daily
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "history" ? "bg-purple-600 text-white shadow-md" : "hover:text-slate-900 dark:hover:text-white text-slate-550"}`}
          >
            History Log
          </button>
          <button
            onClick={() => setActiveTab("monthly")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "monthly" ? "bg-purple-600 text-white shadow-md" : "hover:text-slate-900 dark:hover:text-white text-slate-550"}`}
          >
            Monthly Matrix
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* GRID TAB (MARK ATTENDANCE) */}
        {activeTab === "grid" && (
          <motion.div
            key="grid"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
          >
            {/* Control Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm items-center">
              {/* Date Input */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block pl-1">Lecture Date</label>
                <div className="relative flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 px-3 py-2 rounded-xl focus-within:ring-2 focus-within:ring-purple-500/50">
                  <Calendar size={16} className="text-slate-400 mr-2.5 shrink-0" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent border-none text-xs text-slate-700 dark:text-slate-250 focus:outline-none w-full cursor-pointer"
                  />
                </div>
                <div className="flex gap-1.5 mt-1.5 pl-1">
                  <button
                    type="button"
                    onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
                    className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-purple-600 hover:text-white transition-all cursor-pointer"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() - 1);
                      setSelectedDate(d.toISOString().split("T")[0]);
                    }}
                    className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-purple-600 hover:text-white transition-all cursor-pointer"
                  >
                    Yesterday
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() - 2);
                      setSelectedDate(d.toISOString().split("T")[0]);
                    }}
                    className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-purple-600 hover:text-white transition-all cursor-pointer"
                  >
                    Day Before
                  </button>
                </div>
              </div>

              {/* Search input */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block pl-1">Search Students</label>
                <div className="relative flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 px-3 py-2 rounded-xl focus-within:ring-2 focus-within:ring-purple-500/50">
                  <Search size={16} className="text-slate-400 mr-2.5 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search roll, name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none text-xs text-slate-700 dark:text-slate-250 focus:outline-none w-full"
                  />
                </div>
              </div>

              {/* Bulk Actions */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 block pl-1">Bulk Selection</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkMark("Present")}
                    className="flex-1 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all cursor-pointer"
                  >
                    All Present
                  </button>
                  <button
                    onClick={() => handleBulkMark("Absent")}
                    className="flex-1 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold transition-all cursor-pointer"
                  >
                    All Absent
                  </button>
                  <button
                    onClick={() => handleBulkMark("Late")}
                    className="flex-1 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold transition-all cursor-pointer"
                  >
                    All Late
                  </button>
                </div>
              </div>
            </div>

            {/* Attendance Summary Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/15 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Present %</span>
                  <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{presentPct}%</h3>
                  <span className="text-[9px] text-slate-400 font-semibold">{summary.present} / {totalStudents} Students</span>
                </div>
                <UserCheck size={28} className="text-emerald-500/30 shrink-0" />
              </div>

              <div className="bg-red-500/10 border border-red-500/15 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400">Absent %</span>
                  <h3 className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">{absentPct}%</h3>
                  <span className="text-[9px] text-slate-400 font-semibold">{summary.absent} / {totalStudents} Students</span>
                </div>
                <X size={28} className="text-red-500/30 shrink-0" />
              </div>

              <div className="bg-indigo-500/10 border border-indigo-500/15 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">Total Students</span>
                  <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{totalStudents}</h3>
                  <span className="text-[9px] text-slate-400 font-semibold">Active Roster Size</span>
                </div>
                <Clock size={28} className="text-indigo-500/30 shrink-0" />
              </div>

              <div className="bg-purple-500/10 border border-purple-500/15 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] uppercase font-bold text-purple-650 dark:text-purple-400">Attendance Trend</span>
                  <h3 className="text-md font-black text-purple-600 dark:text-purple-400 mt-2">{trendText}</h3>
                  <span className="text-[9px] text-slate-400 font-semibold">Class Avg Rate: {avgRate}%</span>
                </div>
                <TrendingUp size={28} className="text-purple-500/30 shrink-0" />
              </div>
            </div>

            {/* Split layout: Students roster table (Left) + Defaulters list (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Daily Table */}
              <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden h-fit">
                {loading ? (
                  <div className="p-10 text-center text-slate-400 flex flex-col items-center gap-2">
                    <RefreshCw size={24} className="animate-spin text-purple-650" />
                    <span className="text-xs">Fetching registry data...</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-150 dark:border-slate-850 text-slate-400 font-bold uppercase text-[9px] tracking-wider bg-slate-50/50 dark:bg-slate-950/20">
                          <th className="py-3.5 pl-5">Student Details</th>
                          <th className="py-3.5">Roll Number</th>
                          <th className="py-3.5 text-center w-80 pr-5">Attendance Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850/80">
                        {filteredStudents.map(student => (
                          <tr key={student.student_id} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/40 transition-colors">
                            <td className="py-3.5 pl-5 font-bold text-slate-800 dark:text-white">{student.full_name}</td>
                            <td className="py-3.5 text-slate-500 dark:text-slate-400 font-mono font-semibold">{student.roll_no}</td>
                            <td className="py-3.5 pr-5">
                              <div className="flex gap-1.5 justify-end">
                                <button
                                  onClick={() => {
                                    setAttendanceStatus(prev => ({ ...prev, [student.student_id]: "Present" }));
                                    setSummary(prev => {
                                      const old = attendanceStatus[student.student_id];
                                      return {
                                        present: prev.present + 1,
                                        absent: old === "Absent" ? prev.absent - 1 : prev.absent,
                                        late: old === "Late" ? prev.late - 1 : prev.late
                                      };
                                    });
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all cursor-pointer ${attendanceStatus[student.student_id] === "Present" ? "bg-emerald-500 text-white shadow" : "bg-slate-100 dark:bg-slate-950 text-slate-400 dark:text-slate-500 hover:bg-slate-200"}`}
                                >
                                  Present
                                </button>
                                <button
                                  onClick={() => {
                                    setAttendanceStatus(prev => ({ ...prev, [student.student_id]: "Absent" }));
                                    setSummary(prev => {
                                      const old = attendanceStatus[student.student_id];
                                      return {
                                        present: old === "Present" ? prev.present - 1 : prev.present,
                                        absent: prev.absent + 1,
                                        late: old === "Late" ? prev.late - 1 : prev.late
                                      };
                                    });
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all cursor-pointer ${attendanceStatus[student.student_id] === "Absent" ? "bg-red-500 text-white shadow" : "bg-slate-100 dark:bg-slate-950 text-slate-400 dark:text-slate-500 hover:bg-slate-200"}`}
                                >
                                  Absent
                                </button>
                                <button
                                  onClick={() => {
                                    setAttendanceStatus(prev => ({ ...prev, [student.student_id]: "Late" }));
                                    setSummary(prev => {
                                      const old = attendanceStatus[student.student_id];
                                      return {
                                        present: old === "Present" ? prev.present - 1 : prev.present,
                                        absent: old === "Absent" ? prev.absent - 1 : prev.absent,
                                        late: prev.late + 1
                                      };
                                    });
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all cursor-pointer ${attendanceStatus[student.student_id] === "Late" ? "bg-amber-500 text-white shadow" : "bg-slate-100 dark:bg-slate-950 text-slate-400 dark:text-slate-500 hover:bg-slate-200"}`}
                                >
                                  Late
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Defaulter Insights (Right) */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
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
                    <div className="max-h-40 overflow-y-auto space-y-1.5 scrollbar-thin">
                      {defaulters.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic">No defaulters in this class.</p>
                      ) : (
                        defaulters.map(student => (
                          <div key={student.student_id} className="flex justify-between items-center p-2 bg-amber-500/5 border border-amber-500/10 rounded-xl text-[10px]">
                            <div className="font-bold text-slate-700 dark:text-slate-300">
                              {student.full_name}
                              <span className="text-[8px] text-slate-400 font-normal block">{student.roll_no}</span>
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
                    <div className="max-h-40 overflow-y-auto space-y-1.5 scrollbar-thin">
                      {criticalDefaulters.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic">No critical defaulters.</p>
                      ) : (
                        criticalDefaulters.map(student => (
                          <div key={student.student_id} className="flex justify-between items-center p-2 bg-red-500/5 border border-red-500/10 rounded-xl text-[10px]">
                            <div className="font-bold text-slate-700 dark:text-slate-350">
                              {student.full_name}
                              <span className="text-[8px] text-slate-400 font-normal block">{student.roll_no}</span>
                            </div>
                            <span className="font-black text-red-500">{student.attendance}%</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Needs Intervention List */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[9px] uppercase font-bold text-purple-600 block">Needs Remedial Intervention</span>
                    <div className="max-h-40 overflow-y-auto space-y-1.5 scrollbar-thin font-medium">
                      {defaulters.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic">No remedial actions required.</p>
                      ) : (
                        defaulters.map(student => (
                          <div key={student.student_id} className="flex justify-between items-center p-2 bg-purple-500/5 border border-purple-500/10 rounded-xl text-[10px]">
                            <div className="font-bold text-slate-700 dark:text-slate-300">
                              {student.full_name}
                            </div>
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
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveAttendance}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-xl transition-all shadow-lg shadow-purple-600/20 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={16} />
                Save Attendance Record
              </button>
            </div>
          </motion.div>
        )}

        {/* HISTORY LOG TAB */}
        {activeTab === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4"
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-150 dark:border-slate-850 text-slate-400 font-bold uppercase text-[9px] tracking-wider bg-slate-50/50 dark:bg-slate-950/20">
                      <th className="py-3.5 pl-5">Date</th>
                      <th className="py-3.5 text-center">Present Students</th>
                      <th className="py-3.5 text-center">Absent Students</th>
                      <th className="py-3.5 text-center">Late Students</th>
                      <th className="py-3.5 text-center">Attendance Rate</th>
                      <th className="py-3.5 text-center">Status</th>
                      <th className="py-3.5 text-right pr-5">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850/80">
                    {history.map(row => {
                      const total = row.present + row.absent + row.late;
                      const rate = total > 0 ? Math.round((row.present / total) * 100) : 0;
                      const statusLabel = rate >= 85 ? "Excellent" : rate >= 75 ? "Good" : "Needs Review";
                      const statusColor = rate >= 85 
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                        : rate >= 75 
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" 
                          : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20";
                      return (
                        <tr key={row.date} className="hover:bg-slate-50/20 dark:hover:bg-slate-850/20 transition-colors">
                          <td className="py-3.5 pl-5 font-bold text-slate-700 dark:text-slate-350">{row.date}</td>
                          <td className="py-3.5 text-center text-emerald-500 font-bold">{row.present}</td>
                          <td className="py-3.5 text-center text-red-500 font-bold">{row.absent}</td>
                          <td className="py-3.5 text-center text-amber-500 font-bold">{row.late}</td>
                          <td className="py-3.5 text-center text-slate-800 dark:text-slate-200 font-bold">{rate}%</td>
                          <td className="py-3.5 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${statusColor}`}>
                              {statusLabel}
                            </span>
                          </td>
                          <td className="py-3.5 text-right pr-5">
                            <button
                              onClick={() => {
                                setSelectedDate(row.date);
                                setActiveTab("grid");
                              }}
                              className="text-purple-600 hover:text-purple-500 font-bold cursor-pointer inline-flex items-center gap-0.5"
                            >
                              <span>Edit Grid</span>
                              <ChevronRight size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {history.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400 font-medium text-xs">
                          No historical logs recorded for this class yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* MONTHLY MATRIX TAB */}
        {activeTab === "monthly" && (
          <motion.div
            key="monthly"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4"
          >
            {/* Filter monthly header */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-3 rounded-2xl shadow-sm gap-3">
              <div className="flex gap-2">
                <select
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(Number(e.target.value))}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString('en', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number(e.target.value))}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-xs font-bold text-slate-750 dark:text-slate-300 cursor-pointer shadow-sm"
              >
                <FileSpreadsheet size={15} className="text-emerald-500" />
                Export Monthly CSV Report
              </button>
            </div>

            {/* Matrix spreadsheet */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-150 dark:border-slate-850 text-slate-400 font-bold uppercase text-[9px] tracking-wider bg-slate-50/50 dark:bg-slate-950/20">
                      <th className="py-3.5 pl-5 sticky left-0 bg-white dark:bg-slate-900 z-10 shadow-md">Learner Details</th>
                      <th className="py-3.5">Roll Number</th>
                      {monthlyReport.dates.map(date => {
                        const day = date.split('-')[2];
                        return (
                          <th key={date} className="py-3.5 text-center min-w-[42px] px-1 font-mono font-bold">
                            {day}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850/80">
                    {monthlyReport.matrix.map(student => (
                      <tr key={student.student_id} className="hover:bg-slate-50/30 dark:hover:bg-slate-850/30 transition-colors">
                        <td className="py-3.5 pl-5 font-bold text-slate-800 dark:text-white sticky left-0 bg-white dark:bg-slate-900 z-10 shadow-md">
                          {student.full_name}
                        </td>
                        <td className="py-3.5 text-slate-500 dark:text-slate-400 font-mono font-semibold">{student.roll_no}</td>
                        {monthlyReport.dates.map(date => {
                          const status = student.attendance[date] || "-";
                          let color = "text-slate-400";
                          if (status === "Present") color = "text-emerald-500 font-bold";
                          else if (status === "Absent") color = "text-red-500 font-bold";
                          else if (status === "Late") color = "text-amber-500 font-bold";
                          return (
                            <td key={date} className={`py-3.5 text-center ${color}`}>
                              {status === "Present" ? "P" : status === "Absent" ? "A" : status === "Late" ? "L" : "-"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    {monthlyReport.matrix.length === 0 && (
                      <tr>
                        <td colSpan={10} className="p-8 text-center text-slate-400 font-medium text-xs">
                          No attendance data recorded in the selected month.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AttendanceTracking;
