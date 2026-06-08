import React, { useState } from 'react';
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
  Filter
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';

const StudentPerformance = () => {
  const { studentsList } = useStudent();
  const [searchTermLocal, setSearchTermLocal] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const branches = ["All", "CS", "IT", "ECE", "EEE", "ME"];

  // Filter students based on search query and branch filter
  const filteredStudents = studentsList.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTermLocal.toLowerCase()) || 
                          student.rollNumber.toLowerCase().includes(searchTermLocal.toLowerCase());
    const matchesBranch = branchFilter === "All" || student.branch === branchFilter;
    return matchesSearch && matchesBranch;
  });

  // Seeded XP growth timeline for detail drawer
  const xpGrowthData = [
    { week: "Wk 1", xp: 100 },
    { week: "Wk 2", xp: 280 },
    { week: "Wk 3", xp: 450 },
    { week: "Wk 4", xp: 720 },
    { week: "Wk 5", xp: 980 },
    { week: "Wk 6", xp: 1200 },
    { week: "Wk 7", xp: 1450 }
  ];

  // Helper subjects mapping based on student major
  const getStudentStrengths = (branch) => {
    if (branch === "CS" || branch === "IT") return ["Linear Algebra", "React Hooks", "Docker Ingress"];
    if (branch === "ECE" || branch === "EEE") return ["Digital Signal Processing", "Microcontrollers"];
    return ["Fluid Mechanics", "Thermodynamics"];
  };

  const getStudentWeaknesses = (branch) => {
    if (branch === "CS" || branch === "IT") return ["Cloud IAM Roles", "AWS Cold Starts"];
    if (branch === "ECE" || branch === "EEE") return ["Power Grid Analysis", "System Design"];
    return ["Heat Exchanger Models", "Vector Calculus"];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-purple-505 font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Class Monitoring</p>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">Student Performance Auditing</h2>
          <p className="text-slate-505 text-xs text-slate-400 mt-1">Audit individual performance trackers, GPA projections, and skills indicators.</p>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-3 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-2 rounded-xl w-full md:w-80 focus-within:ring-2 focus-within:ring-purple-500/50">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search name or roll number..." 
            value={searchTermLocal}
            onChange={(e) => setSearchTermLocal(e.target.value)}
            className="bg-transparent border-none text-slate-700 dark:text-slate-250 placeholder-slate-400 focus:outline-none w-full text-xs"
          />
        </div>

        {/* Branch Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
          <Filter size={16} className="text-slate-450 shrink-0 hidden md:block" />
          {branches.map(b => (
            <button
              key={b}
              onClick={() => setBranchFilter(b)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                branchFilter === b 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-slate-50 dark:bg-slate-950 border border-slate-250/60 dark:border-slate-850 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
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
                <th className="py-3.5 text-center">XP</th>
                <th className="py-3.5 text-right pr-5">Academic Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850/80">
              {filteredStudents.slice(0, 50).map((student) => {
                // limit lists rendering to 50 rows for performance
                return (
                  <tr 
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className="hover:bg-purple-500/5 transition-colors duration-150 cursor-pointer"
                  >
                    <td className="py-3.5 pl-5 font-bold text-slate-800 dark:text-white">{student.name}</td>
                    <td className="py-3.5 text-slate-500 dark:text-slate-400 font-mono">{student.rollNumber}</td>
                    <td className="py-3.5 text-slate-500 dark:text-slate-400 font-semibold">{student.branch}</td>
                    <td className="py-3.5 text-center font-bold text-slate-700 dark:text-slate-300">{student.attendance}%</td>
                    <td className="py-3.5 text-center font-bold text-slate-700 dark:text-slate-300">{student.quizScore}%</td>
                    <td className="py-3.5 text-center font-bold text-yellow-600 dark:text-yellow-450">{student.xp} XP</td>
                    <td className="py-3.5 text-right pr-5">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        student.status === "Safe" ? "bg-emerald-500/10 text-emerald-500" :
                        student.status === "Borderline" ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500" :
                        "bg-red-500/10 text-red-500"
                      }`}>
                        {student.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
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
                  <span className="text-[10px] text-purple-500 font-extrabold uppercase">Individual Analytics</span>
                  <h3 className="font-black text-base md:text-lg text-slate-800 dark:text-white mt-0.5 leading-tight">
                    {selectedStudent.name}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="p-1.5 rounded-lg border border-slate-250 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-505 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable details */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
                {/* Roll & Major Overview */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-3.5 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Roll Number</span>
                    <span className="font-extrabold text-slate-800 dark:text-white mt-1 block font-mono">{selectedStudent.rollNumber}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-3.5 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Major Branch</span>
                    <span className="font-extrabold text-slate-800 dark:text-white mt-1 block">{selectedStudent.branch} - {selectedStudent.year}</span>
                  </div>
                </div>

                {/* Score Indicators */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-3.5 rounded-xl flex items-center gap-3">
                    <Calendar size={18} className="text-purple-500 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Attendance</span>
                      <span className="font-black text-base text-slate-800 dark:text-white">{selectedStudent.attendance}%</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-3.5 rounded-xl flex items-center gap-3">
                    <Award size={18} className="text-purple-500 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Quiz Average</span>
                      <span className="font-black text-base text-slate-800 dark:text-white">{selectedStudent.quizScore}%</span>
                    </div>
                  </div>
                </div>

                {/* XP Projections Charts */}
                <div>
                  <h4 className="text-[10px] font-black uppercase text-slate-450 mb-3 tracking-wider flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-purple-500" />
                    Study Consistency Growth (XP)
                  </h4>
                  <div className="h-44 border border-slate-150 dark:border-slate-850 rounded-2xl bg-slate-50/20 dark:bg-slate-950/20 p-2">
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

                {/* Strength / Weakness Lists */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-450 mb-2 tracking-wider">Strong Syllabus Nodes</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {getStudentStrengths(selectedStudent.branch).map((str, sIdx) => (
                        <span key={sIdx} className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                          {str}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-450 mb-2 tracking-wider">Weak Areas & Gaps</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {getStudentWeaknesses(selectedStudent.branch).map((weak, wIdx) => (
                        <span key={wIdx} className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border border-yellow-500/10 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                          {weak}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action drawer footer */}
              <div className="p-5 border-t border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <span>AI Grade Outcome Projection:</span>
                  <span className="text-purple-600 dark:text-purple-400 font-extrabold text-sm">{selectedStudent.predictedCgpa} CGPA</span>
                </div>
                <button 
                  onClick={() => alert(`Warning summary successfully dispatched to ${selectedStudent.name}'s institutional mailbox.`)}
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
