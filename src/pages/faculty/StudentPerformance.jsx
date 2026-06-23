import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import {
  Search,
  X,
  Sparkles,
  TrendingUp,
  ChevronRight,
  Award,
  Calendar,
  Filter,
  BookOpen,
  Mail,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../services/api";

const StudentPerformance = () => {
  const navigate = useNavigate();
  const selectedClass = JSON.parse(localStorage.getItem("selectedClass") || "{}");
  const { user } = useAuth();
  const facultyId = user?.faculty_id;
  // Roster lists
  const [students, setStudents] = useState([]);
  const [assignedClasses, setAssignedClasses] = useState([]);

  // Filtering & Search
  const [searchTermLocal, setSearchTermLocal] = useState("");
  const [classFilter, setClassFilter] = useState(selectedClass.class_name || "All");
  const [subjectFilter, setSubjectFilter] = useState(selectedClass.subject_name || "All");
  const [branchFilter, setBranchFilter] = useState("All");

  // Selected profile drawer
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [profileDetail, setProfileDetail] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [drawerTab, setDrawerTab] = useState("overview");
  const [interventionNotes, setInterventionNotes] = useState("");
  const [interventionStatus, setInterventionStatus] = useState("None");

  const branches = ["All", "CS", "IT"];

  // Fetch faculty classes mapping and overall students roster
  useEffect(() => {
    const fetchMetadataAndStudents = async () => {
      try {
        const classesRes = await apiFetch(`/faculty/${facultyId}/classes`);
        const classesData = await classesRes.json();
        setAssignedClasses(classesData);

        const studentsRes = await apiFetch(`/faculty/${facultyId}/students`);
        const studentsData = await studentsRes.json();
        setStudents(studentsData);
      } catch (err) {
        console.error("Error fetching student performance metadata", err);
      }
    };
    fetchMetadataAndStudents();
  }, [facultyId]);

  // Fetch detailed profile for drawer
  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    setProfileLoading(true);
    setDrawerTab("overview");
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
        
        // Refresh overall students list
        const rosterRes = await apiFetch(`/faculty/${facultyId}/students`);
        if (rosterRes.ok) {
          const rosterData = await rosterRes.json();
          setStudents(rosterData);
        }
      } else {
        alert("Failed to update intervention log.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating intervention log.");
    }
  };

  // Filter lists based on inputs
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.full_name.toLowerCase().includes(searchTermLocal.toLowerCase()) ||
      student.roll_no.toLowerCase().includes(searchTermLocal.toLowerCase());

    const matchesBranch = branchFilter === "All" || student.department === branchFilter;

    // Class filter matching (Check if student is in selected class)
    // To match correctly: we look up the class_name from our assignedClasses or verify.
    // If student has branch/division that maps to class division.
    // Actually, we can check if we want to filter by class name or branch.
    // Let's implement filters:
    const matchesClass = classFilter === "All" || student.division === (classFilter.includes(" A") ? "A" : classFilter.includes(" B") ? "B" : "");
    const matchesSubject = subjectFilter === "All" || true; // Subject filter is theoretical since students study multiple subjects in a class

    return matchesSearch && matchesBranch && matchesClass && matchesSubject;
  });

  // Unique list values
  const uniqueClassNames = Array.from(new Set(assignedClasses.map(c => c.class_name)));
  const uniqueSubjectNames = Array.from(new Set(assignedClasses.map(c => c.subject_name)));

  // Mock static timeline for area chart
  const xpGrowthData = [
    { week: "Wk 1", xp: 100 },
    { week: "Wk 2", xp: 280 },
    { week: "Wk 3", xp: 450 },
    { week: "Wk 4", xp: 720 },
    { week: "Wk 5", xp: 980 },
    { week: "Wk 6", xp: 1200 },
    { week: "Wk 7", xp: 1450 }
  ];

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
            Class Monitoring
          </p>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            Student Monitoring Center
          </h2>
          <p className="text-slate-550 dark:text-slate-400 text-xs mt-1">
            Audit individual student metrics, risk logs, and grade calculations dynamically.
          </p>
        </div>
      </div>

      {/* Filters Dashboard Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
        {/* Search */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 block pl-1">Search Student</label>
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 px-3 py-2 rounded-xl focus-within:ring-2 focus-within:ring-purple-500/50">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search name or roll..."
              value={searchTermLocal}
              onChange={(e) => setSearchTermLocal(e.target.value)}
              className="bg-transparent border-none text-slate-700 dark:text-slate-250 placeholder-slate-400 focus:outline-none w-full text-xs"
            />
          </div>
        </div>

        {/* Class Filter */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 block pl-1">Class Filter</label>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-350 focus:outline-none"
          >
            <option value="All">All Classes</option>
            {uniqueClassNames.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Subject Filter */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 block pl-1">Subject Filter</label>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-350 focus:outline-none"
          >
            <option value="All">All Subjects</option>
            {uniqueSubjectNames.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Branch Filters */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 block pl-1">Branch Filter</label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {branches.map(b => (
              <button
                key={b}
                onClick={() => setBranchFilter(b)}
                className={`px-3 py-2 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer shrink-0 ${branchFilter === b
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 text-slate-600 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-850'
                  }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="text-purple-600 dark:text-purple-400 font-extrabold text-xs">
        Total Students Filtered: {filteredStudents.length}
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-150 dark:border-slate-850 text-slate-400 font-bold uppercase text-[9px] tracking-wider bg-slate-50/50 dark:bg-slate-950/20">
                <th className="py-3.5 pl-5">Learner</th>
                <th className="py-3.5">Roll Number</th>
                <th className="py-3.5">Branch</th>
                <th className="py-3.5 text-center">Attendance</th>
                <th className="py-3.5 text-center">Quiz Average</th>
                <th className="py-3.5 text-center">XP Points</th>
                <th className="py-3.5 text-right pr-5">Risk Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850/80">
              {filteredStudents.map((student) => (
                <tr
                  key={student.student_id}
                  onClick={() => handleSelectStudent(student)}
                  className="hover:bg-purple-500/5 dark:hover:bg-purple-500/10 transition-colors duration-150 cursor-pointer"
                >
                  <td className="py-3.5 pl-5 font-bold text-slate-800 dark:text-white">{student.full_name}</td>
                  <td className="py-3.5 text-slate-505 dark:text-slate-400 font-mono font-semibold">{student.roll_no}</td>
                  <td className="py-3.5 text-slate-505 dark:text-slate-400 font-bold">{student.department} - {student.division}</td>
                  <td className="py-3.5 text-center font-bold text-slate-700 dark:text-slate-300">{student.attendance}%</td>
                  <td className="py-3.5 text-center font-bold text-slate-700 dark:text-slate-300">{student.quiz_score}%</td>
                  <td className="py-3.5 text-center font-bold text-yellow-600 dark:text-yellow-400">{student.xp_points} XP</td>
                  <td className="py-3.5 text-right pr-5">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${student.risk_level === "Low" ? "bg-emerald-500/10 text-emerald-500" :
                      student.risk_level === "Medium" ? "bg-amber-500/10 text-amber-600 dark:text-amber-500" :
                        "bg-red-500/10 text-red-500"
                      }`}>
                      {student.risk_level}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-medium text-xs">
                    No student records found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Profile Detail Drawer (Slide-out) */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl h-full flex flex-col justify-between z-10"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                <div>
                  <span className="text-[10px] text-purple-500 font-extrabold uppercase">Individual profile</span>
                  <h3 className="font-black text-base md:text-lg text-slate-800 dark:text-white mt-0.5 leading-tight">
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

              {/* Drawer Tabs Navigation */}
              {!profileLoading && profileDetail && (
                <div className="flex border-b border-slate-100 dark:border-slate-800 overflow-x-auto scrollbar-none shrink-0 bg-slate-50 dark:bg-slate-955 px-3 py-1 gap-1">
                  {[
                    { id: "overview", label: "Overview" },
                    { id: "attendance", label: "Attendance" },
                    { id: "academics", label: "Academics" },
                    { id: "assignments", label: "Assignments" },
                    { id: "intervention", label: "Interventions" }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setDrawerTab(t.id)}
                      className={`px-3 py-2 text-[10px] font-extrabold uppercase rounded-lg transition-all cursor-pointer shrink-0 whitespace-nowrap ${drawerTab === t.id ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-850'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Scrollable details */}
              {profileLoading ? (
                <div className="flex-1 flex flex-col justify-center items-center gap-2">
                  <RefreshCw size={16} className="animate-spin text-purple-650" />
                  <span className="text-xs text-slate-400">Loading student profile...</span>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-5 text-xs">
                  {drawerTab === "overview" && (
                    <div className="space-y-6">
                      {/* Personal card */}
                      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-4 rounded-2xl space-y-2.5">
                        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                          <span className="text-slate-450 dark:text-slate-500 font-bold uppercase text-[9px]">Learner Email</span>
                          <a href={`mailto:${profileDetail?.student?.email}`} className="font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                            <Mail size={12} />
                            {profileDetail?.student?.email}
                          </a>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[9px] text-slate-450 dark:text-slate-550 font-bold block uppercase">Roll Number</span>
                            <span className="font-extrabold text-slate-850 dark:text-white mt-0.5 block font-mono">{profileDetail?.student?.roll_no}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-455 dark:text-slate-550 font-bold block uppercase">Department & Term</span>
                            <span className="font-extrabold text-slate-850 dark:text-white mt-0.5 block">{profileDetail?.student?.department} • Sem {profileDetail?.student?.semester}</span>
                          </div>
                        </div>
                      </div>

                      {/* Summary indicators */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-3.5 rounded-xl flex items-center gap-3">
                          <Calendar size={18} className="text-purple-500 shrink-0" />
                          <div>
                            <span className="text-[9px] text-slate-450 dark:text-slate-550 font-bold block uppercase">Attendance Rate</span>
                            <span className="font-black text-base text-slate-800 dark:text-white">{profileDetail?.metrics?.attendance}%</span>
                          </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-3.5 rounded-xl flex items-center gap-3">
                          <Award size={18} className="text-purple-500 shrink-0" />
                          <div>
                            <span className="text-[9px] text-slate-450 dark:text-slate-550 font-bold block uppercase">Quiz Average</span>
                            <span className="font-black text-base text-slate-800 dark:text-white">{profileDetail?.metrics?.quiz_score}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Risk Indicators */}
                      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-4 rounded-2xl space-y-2.5">
                        <h4 className="text-[10px] font-black uppercase text-slate-450 dark:text-slate-400 tracking-wider">Academic Risk Indicators</h4>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-650 dark:text-slate-450">Current Risk Evaluation:</span>
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${
                            profileDetail?.metrics?.risk_level === 'High' ? 'bg-red-500/10 text-red-500' :
                            profileDetail?.metrics?.risk_level === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-emerald-500/10 text-emerald-500'
                          }`}>
                            {profileDetail?.metrics?.risk_level || "Low"} Risk
                          </span>
                        </div>
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase mb-1">Reason Breakdown</span>
                          <p className="text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                            {profileDetail?.risk_history && profileDetail.risk_history.length > 0
                              ? profileDetail.risk_history[0].reason
                              : (profileDetail?.metrics?.attendance < 75 ? "Flagged due to low lecture attendance (<75%)." : "Sufficient overall metrics recorded.")
                            }
                          </p>
                        </div>
                      </div>

                      {/* Study consistency */}
                      <div>
                        <h4 className="text-[10px] font-black uppercase text-slate-450 dark:text-slate-400 mb-3 tracking-wider flex items-center gap-1.5">
                          <TrendingUp size={14} className="text-purple-500" />
                          Study consistency growth (XP)
                        </h4>
                        <div className="h-44 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/10 dark:bg-slate-955/10 p-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={xpGrowthData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                              <XAxis dataKey="week" stroke="#64748b" fontSize={9} />
                              <YAxis stroke="#64748b" fontSize={9} />
                              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '10px' }} />
                              <Area type="monotone" dataKey="xp" stroke="#a855f7" fill="#a855f7" fillOpacity={0.15} strokeWidth={2} name="XP Accumulated" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  )}

                  {drawerTab === "attendance" && (
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase text-slate-450 dark:text-slate-400 tracking-wider">Daily Attendance Breakdown</h4>
                      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl p-3 max-h-[350px] overflow-y-auto space-y-2">
                        {profileDetail?.attendance_history?.map((att, idx) => (
                          <div key={idx} className="flex justify-between items-center border-b last:border-0 border-slate-200 dark:border-slate-800 pb-2 last:pb-0">
                            <span className="font-semibold text-slate-700 dark:text-slate-350">{att.date}</span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                              att.status === "Present" ? "bg-emerald-500/10 text-emerald-500" :
                              att.status === "Late" ? "bg-amber-500/10 text-amber-600 dark:text-amber-500" :
                              "bg-red-500/10 text-red-500"
                            }`}>
                              {att.status}
                            </span>
                          </div>
                        ))}
                        {(!profileDetail?.attendance_history || profileDetail.attendance_history.length === 0) && (
                          <div className="text-center text-slate-450 dark:text-slate-500 py-4 font-semibold">
                            No attendance history recorded.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {drawerTab === "academics" && (
                    <div className="space-y-4">
                      <div className="bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-850 rounded-2xl p-4 space-y-3">
                        <h5 className="font-black text-slate-800 dark:text-white uppercase text-[9px] tracking-wider">Subject Mark Roster</h5>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-[10px]">
                            <thead>
                              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[8px] tracking-wider">
                                <th className="py-2 pl-1">Subject</th>
                                <th className="py-2 text-center">Internals</th>
                                <th className="py-2 text-center">Assignments</th>
                                <th className="py-2 text-center">Quizzes</th>
                                <th className="py-2 text-center">Practical</th>
                                <th className="py-2 text-center">Total</th>
                                <th className="py-2 text-center pr-1">Grade</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-850/50">
                              {profileDetail?.marks?.map((m, idx) => (
                                <tr key={idx} className="text-slate-700 dark:text-slate-350">
                                  <td className="py-2 pl-1 font-bold">{m.subject_name}</td>
                                  <td className="py-2 text-center">{m.internal_marks}</td>
                                  <td className="py-2 text-center">{m.assignments_marks}</td>
                                  <td className="py-2 text-center">{m.quizzes_marks}</td>
                                  <td className="py-2 text-center">{m.practical_marks}</td>
                                  <td className="py-2 text-center font-black text-slate-800 dark:text-white">{m.total_marks}</td>
                                  <td className="py-2 text-center pr-1"><span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-black">{m.grade || "N/A"}</span></td>
                                </tr>
                              ))}
                              {(!profileDetail?.marks || profileDetail.marks.length === 0) && (
                                <tr>
                                  <td colSpan={7} className="text-center py-4 text-slate-450 italic">No subject marks recorded.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl p-4 space-y-3">
                        <h5 className="font-black text-slate-800 dark:text-white uppercase text-[9px] tracking-wider">Quiz Performance Logs</h5>
                        <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                          {profileDetail?.quizzes?.map((q, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl text-[10px]">
                              <span className="font-bold text-slate-700 dark:text-slate-350">{q.title}</span>
                              <span className="font-black text-purple-600">{q.score} / {q.total_questions} Questions</span>
                            </div>
                          ))}
                          {(!profileDetail?.quizzes || profileDetail.quizzes.length === 0) && (
                            <p className="text-slate-455 dark:text-slate-500 italic text-center py-2">No quiz attempts found.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {drawerTab === "assignments" && (
                    <div className="space-y-4">
                      {/* Completion stats calculations */}
                      {(() => {
                        const total = profileDetail?.assignments?.length || 0;
                        const submitted = profileDetail?.assignments?.filter(a => a.status === "Submitted").length || 0;
                        const late = profileDetail?.assignments?.filter(a => a.status === "Late").length || 0;
                        const missing = profileDetail?.assignments?.filter(a => a.status === "Missing" || a.status === "Pending").length || 0;
                        const rate = total > 0 ? Math.round(((submitted + late) / total) * 100) : 100;
                        return (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <div className="bg-emerald-500/10 border border-emerald-500/15 p-2 rounded-xl text-center">
                              <span className="text-[8px] uppercase text-emerald-600 dark:text-emerald-400 font-bold block">Submitted</span>
                              <span className="text-sm font-black text-emerald-600">{submitted}</span>
                            </div>
                            <div className="bg-amber-500/10 border border-amber-500/15 p-2 rounded-xl text-center">
                              <span className="text-[8px] uppercase text-amber-600 dark:text-amber-450 font-bold block">Late</span>
                              <span className="text-sm font-black text-amber-600">{late}</span>
                            </div>
                            <div className="bg-red-500/10 border border-red-500/15 p-2 rounded-xl text-center">
                              <span className="text-[8px] uppercase text-red-650 dark:text-red-450 font-bold block">Missing</span>
                              <span className="text-sm font-black text-red-600">{missing}</span>
                            </div>
                            <div className="bg-purple-500/10 border border-purple-500/15 p-2 rounded-xl text-center">
                              <span className="text-[8px] uppercase text-purple-650 dark:text-purple-400 font-bold block">Completion</span>
                              <span className="text-sm font-black text-purple-600">{rate}%</span>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl p-4 space-y-3">
                        <h5 className="font-black text-slate-800 dark:text-white uppercase text-[9px] tracking-wider">Submissions Log</h5>
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                          {profileDetail?.assignments?.map((assign, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl p-3 flex justify-between items-center">
                              <div className="space-y-0.5 max-w-[70%]">
                                <h5 className="font-extrabold text-slate-850 dark:text-white line-clamp-1">{assign.title}</h5>
                                <span className="text-[9px] text-slate-450 dark:text-slate-400 font-bold">
                                  Score: <span className="text-purple-600 font-extrabold">{assign.score !== null ? `${assign.score} Marks` : "Not Graded"}</span>
                                </span>
                              </div>
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded shrink-0 ${
                                assign.status === "Submitted" ? "bg-emerald-500/10 text-emerald-500" :
                                assign.status === "Late" ? "bg-amber-500/10 text-amber-600 dark:text-amber-500" :
                                "bg-red-500/10 text-red-500"
                              }`}>
                                {assign.status}
                              </span>
                            </div>
                          ))}
                          {(!profileDetail?.assignments || profileDetail.assignments.length === 0) && (
                            <div className="text-center text-slate-455 py-4 font-semibold italic">
                              No assignments logged.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {drawerTab === "intervention" && (
                    <div className="space-y-4">
                      {/* Early Intervention status updates */}
                      <div className="space-y-4 bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-850 rounded-2xl p-4">
                        <h5 className="font-black text-slate-850 dark:text-white uppercase text-[9px] tracking-wider">Update Early Intervention Log</h5>
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
                          className="w-full py-2.5 bg-purple-600 hover:bg-purple-550 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all"
                        >
                          Save Intervention Log
                        </button>
                      </div>

                      {/* Remedial History */}
                      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl p-4 space-y-3">
                        <h5 className="font-black text-slate-850 dark:text-white uppercase text-[9px] tracking-wider">Remedial Session Invitations Log</h5>
                        <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                          {profileDetail?.remedial_history?.map((session, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-155 dark:border-slate-850 rounded-xl p-3.5 space-y-1.5 text-[10px]">
                              <div className="flex justify-between items-start">
                                <h6 className="font-black text-slate-850 dark:text-white">{session.subject_name || "Remedial Session"}</h6>
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                  session.status === "Attended" ? "bg-emerald-500/10 text-emerald-500" :
                                  session.status === "Absent" ? "bg-red-500/10 text-red-500" :
                                  session.status === "Scheduled" ? "bg-blue-500/10 text-blue-500" :
                                  "bg-amber-500/10 text-amber-600 dark:text-amber-500"
                                }`}>
                                  {session.status || "Pending"}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-slate-450 dark:text-slate-400 font-bold">
                                <div>Date: {session.session_date}</div>
                                <div>Time: {session.session_time || "N/A"}</div>
                              </div>
                            </div>
                          ))}
                          {(!profileDetail?.remedial_history || profileDetail.remedial_history.length === 0) && (
                            <p className="text-center text-slate-455 py-2 italic font-semibold">
                              No remedial class history.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action drawer footer */}
              {!profileLoading && profileDetail && (
                <div className="p-5 border-t border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 flex flex-col gap-2 shrink-0">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                    <span>AI Grade Outcome Projection:</span>
                    <span className="text-purple-600 dark:text-purple-400 font-extrabold text-sm">{profileDetail?.metrics?.predicted_cgpa || selectedStudent.predicted_cgpa} CGPA</span>
                  </div>
                  <button
                    onClick={() => {
                      navigate("/faculty/remedial", { state: { preselectedStudentId: selectedStudent.student_id } });
                    }}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
                  >
                    Send Remedial Class Invitation
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StudentPerformance;
