import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileSpreadsheet, 
  Search, 
  Download, 
  Check, 
  X,
  Sparkles,
  Award
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';

const AttendanceTracking = () => {
  const { studentsList } = useStudent();
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");

  const branches = ["All", "CS", "IT", "ECE", "EEE", "ME"];

  // Filter students based on search and branch
  const filteredStudents = studentsList.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = branchFilter === "All" || student.branch === branchFilter;
    return matchesSearch && matchesBranch;
  });

  const handleExport = (type) => {
    alert(`Report compiling successful!\n\nExport Format: ${type.toUpperCase()}\nTarget List: ${branchFilter} Branch Registry\nRecords Count: ${filteredStudents.length} Students\n\nTriggering browser mock download...`);
  };

  // Seeded mock monthly logs grid (P/A statuses for last 5 days)
  const getMockAttendanceRow = (attendance) => {
    // Generate a fixed pattern of P and A based on attendance percentage
    if (attendance >= 90) return ["P", "P", "P", "P", "P"];
    if (attendance >= 80) return ["P", "P", "A", "P", "P"];
    if (attendance >= 70) return ["P", "A", "P", "P", "A"];
    return ["A", "P", "A", "P", "A"];
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
          <p className="text-xs text-purple-650 font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Registry Audits</p>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">Attendance & Curriculum Progress Registry</h2>
          <p className="text-slate-500 text-xs mt-1">
            Access logs of student lecture attendance, monthly completion indicators, and download official college records.
          </p>
        </div>
        
        {/* Export Buttons */}
        <div className="flex gap-2 shrink-0">
          <button 
            onClick={() => handleExport("csv")}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-xs font-bold text-slate-700 dark:text-slate-350 cursor-pointer"
          >
            <FileSpreadsheet size={14} className="text-emerald-500" />
            Export CSV
          </button>
          <button 
            onClick={() => handleExport("pdf")}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md cursor-pointer"
          >
            <Download size={14} />
            Export PDF Report
          </button>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-3 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-2 rounded-xl w-full md:w-80 focus-within:ring-2 focus-within:ring-purple-500/50">
          <Search size={16} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search student roll, name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-slate-700 dark:text-slate-250 placeholder-slate-400 focus:outline-none w-full text-xs"
          />
        </div>

        {/* Branch Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {branches.map(b => (
            <button
              key={b}
              onClick={() => setBranchFilter(b)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                branchFilter === b 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-550 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Attendance Spreadsheet Grid Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-150 dark:border-slate-850 text-slate-400 font-bold uppercase text-[9px] tracking-wider bg-slate-50/50 dark:bg-slate-950/20">
                <th className="py-4 pl-5">Student</th>
                <th className="py-4">Roll Number</th>
                <th className="py-4 text-center">Mon (01)</th>
                <th className="py-4 text-center">Tue (02)</th>
                <th className="py-4 text-center">Wed (03)</th>
                <th className="py-4 text-center">Thu (04)</th>
                <th className="py-4 text-center">Fri (05)</th>
                <th className="py-4 text-center">Quiz Average</th>
                <th className="py-4 text-right pr-5">Attendance Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850/80">
              {filteredStudents.slice(0, 35).map((student) => {
                const logs = getMockAttendanceRow(student.attendance);
                return (
                  <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                    <td className="py-3.5 pl-5 font-bold text-slate-800 dark:text-slate-150">{student.name}</td>
                    <td className="py-3.5 text-slate-400 font-mono">{student.rollNumber}</td>
                    {logs.map((log, lIdx) => (
                      <td key={lIdx} className="py-3.5 text-center">
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black ${
                          log === "P" 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {log}
                        </span>
                      </td>
                    ))}
                    <td className="py-3.5 text-center font-bold text-slate-700 dark:text-slate-350">{student.quizScore}%</td>
                    <td className="py-3.5 text-right pr-5">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-slate-100 dark:bg-slate-850 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${student.attendance < 75 ? 'bg-red-500' : 'bg-purple-600'}`} 
                            style={{ width: `${student.attendance}%` }} 
                          />
                        </div>
                        <span className={`font-black w-10 text-right ${student.attendance < 75 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                          {student.attendance}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default AttendanceTracking;
