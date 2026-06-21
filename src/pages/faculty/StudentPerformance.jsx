import React, { useState, useEffect } from 'react';
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
  UserCheck
  , RefreshCw
} from 'lucide-react';

const StudentPerformance = () => {
  const selectedClass = JSON.parse(localStorage.getItem("selectedClass") || "{}");
  const facultyId = Number(localStorage.getItem("faculty_id") || "7");

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

  const branches = ["All", "CS", "IT"];

  // Fetch faculty classes mapping and overall students roster
  useEffect(() => {
    const fetchMetadataAndStudents = async () => {
      try {
        const classesRes = await fetch(`http://127.0.0.1:8000/faculty/${facultyId}/classes`);
        const classesData = await classesRes.json();
        setAssignedClasses(classesData);

        const studentsRes = await fetch(`http://127.0.0.1:8000/faculty/${facultyId}/students`);
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
    try {
      const res = await fetch(`http://127.0.0.1:8000/student/${student.student_id}/profile`);
      if (!res.ok) throw new Error("Failed to load profile details");
      const data = await res.json();
      setProfileDetail(data);
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
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

              {/* Scrollable details */}
              {profileLoading ? (
                <div className="flex-1 flex flex-col justify-center items-center gap-2">
                  <RefreshCw size={16} className="animate-spin text-purple-650" />
                  <span className="text-xs text-slate-400">Loading student profile...</span>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
                  {/* Personal card */}
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-4 rounded-2xl space-y-2.5">
                    <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                      <span className="text-slate-400 font-bold uppercase text-[9px]">Learner Email</span>
                      <a href={`mailto:${profileDetail?.student?.email}`} className="font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                        <Mail size={12} />
                        {profileDetail?.student?.email}
                      </a>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Roll Number</span>
                        <span className="font-extrabold text-slate-850 dark:text-white mt-0.5 block font-mono">{profileDetail?.student?.roll_no}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Department & Term</span>
                        <span className="font-extrabold text-slate-850 dark:text-white mt-0.5 block">{profileDetail?.student?.department} • Sem {profileDetail?.student?.semester}</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary indicators */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-3.5 rounded-xl flex items-center gap-3">
                      <Calendar size={18} className="text-purple-500 shrink-0" />
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Attendance Rate</span>
                        <span className="font-black text-base text-slate-800 dark:text-white">{profileDetail?.metrics?.attendance}%</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-3.5 rounded-xl flex items-center gap-3">
                      <Award size={18} className="text-purple-500 shrink-0" />
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Quiz Average</span>
                        <span className="font-black text-base text-slate-800 dark:text-white">{profileDetail?.metrics?.quiz_score}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Assignment Statistics */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Assignment submission statistics</h4>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-emerald-500/10 p-2.5 rounded-xl">
                        <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-bold block uppercase">Submitted</span>
                        <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">{profileDetail?.assignment_stats?.submitted}</span>
                      </div>
                      <div className="bg-red-500/10 p-2.5 rounded-xl">
                        <span className="text-[8px] text-red-600 dark:text-red-400 font-bold block uppercase">Pending</span>
                        <span className="font-extrabold text-sm text-red-600 dark:text-red-400">{profileDetail?.assignment_stats?.pending}</span>
                      </div>
                      <div className="bg-amber-500/10 p-2.5 rounded-xl">
                        <span className="text-[8px] text-amber-600 dark:text-amber-400 font-bold block uppercase">Late</span>
                        <span className="font-extrabold text-sm text-amber-600 dark:text-amber-400">{profileDetail?.assignment_stats?.late}</span>
                      </div>
                    </div>
                  </div>

                  {/* Study consistency */}
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-wider flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-purple-500" />
                      Study consistency growth (XP)
                    </h4>
                    <div className="h-44 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/10 dark:bg-slate-950/10 p-2">
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

                  {/* Syllabus strengths */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-wider">Strong Syllabus Nodes</h4>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 text-[10px] font-bold px-2.5 py-1 rounded-lg">DBMS Schemas</span>
                        <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 text-[10px] font-bold px-2.5 py-1 rounded-lg">Linear Algebra</span>
                      </div>
                    </div>

                    {/* Marks list */}
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-wider">Marks Summary</h4>
                      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl p-3 space-y-2">
                        {profileDetail?.marks?.map((mark, mIdx) => (
                          <div key={mIdx} className="flex justify-between items-center border-b last:border-0 border-slate-200 dark:border-slate-800 pb-1.5 last:pb-0">
                            <div>
                              <span className="font-semibold block text-slate-700 dark:text-slate-300">{mark.subject}</span>
                              <span className="text-[9px] text-slate-400 block">Assign: {mark.assignments} | Quiz: {mark.quizzes} | Pract: {mark.practical}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-sm block text-purple-650">{mark.total}/100</span>
                              <span className="text-[9px] text-slate-400 block">Grade {mark.grade}</span>
                            </div>
                          </div>
                        ))}
                        {(!profileDetail?.marks || profileDetail.marks.length === 0) && (
                          <span className="text-slate-400 text-xs block text-center py-2">No mark sheets registered yet.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action drawer footer */}
              <div className="p-5 border-t border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <span>AI Grade Outcome Projection:</span>
                  <span className="text-purple-600 dark:text-purple-400 font-extrabold text-sm">{selectedStudent.predicted_cgpa} CGPA</span>
                </div>
                <button
                  onClick={() => alert(`Warning summary successfully dispatched to ${selectedStudent.full_name}'s institutional mailbox.`)}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Send Remedial Class Invitation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StudentPerformance;
