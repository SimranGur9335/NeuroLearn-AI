import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Search, 
  Mail, 
  Calendar, 
  Sparkles, 
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';

const RiskPrediction = () => {
  const { studentsList, updateStudent } = useStudent();
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("High"); // 'All' | 'High' | 'Medium' | 'Low'

  // Extract at risk students:
  // High: attendance < 75% AND quiz < 60%
  // Medium: attendance < 75% OR quiz < 62%
  // Low: all others
  const getRiskStudents = () => {
    return studentsList.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      if (riskFilter === "All") return student.status !== "Safe";
      return student.riskLevel === riskFilter;
    });
  };

  const currentRiskStudents = getRiskStudents();

  const handleSendWarning = (student) => {
    // simulated warning action
    const emailSubject = `Academic Intervention Warning - ${student.name} (${student.rollNumber})`;
    const alertMsg = `Email Dispatched to Student & Guardian!\n\nSubject: ${emailSubject}\nPrerequisites Triggered:\n- Attendance: ${student.attendance}%\n- Quiz Average: ${student.quizScore}%`;
    alert(alertMsg);

    // Update student activity logs in context!
    const updatedHistory = [
      { event: `Dispatched Risk Warning Mail (Prereqs: Att ${student.attendance}%, Quiz ${student.quizScore}%)`, date: new Date().toISOString().split('T')[0], xp: 0 },
      ...student.activityHistory
    ];
    updateStudent(student.id, { activityHistory: updatedHistory });
  };

  const handleRemedialClass = (student) => {
    alert(`Remedial invitation successfully logged for ${student.name}.\nDate: Next Saturday, 10:00 AM.\nFocus Domain: ${student.branch === 'CS' ? 'Programming Basics & DSA' : 'Engineering Core Concepts'}.`);
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
          <p className="text-xs text-red-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle size={14} className="animate-pulse" />
            Platform Academic Warnings
          </p>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">Predictive Risk Assessment reports</h2>
          <p className="text-slate-550 text-xs text-slate-400 mt-1">
            AI analysis flagging students likely to fail core curricula criteria (Attendance &lt; 75% or Quiz Average &lt; 60%).
          </p>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-450 uppercase block font-bold">High Risk Profile</span>
            <span className="text-2xl font-black text-red-500 mt-1 block">
              {studentsList.filter(s => s.riskLevel === "High").length} Students
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 font-black">!</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-450 uppercase block font-bold">Medium Risk Profile</span>
            <span className="text-2xl font-black text-yellow-600 mt-1 block">
              {studentsList.filter(s => s.riskLevel === "Medium").length} Students
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-600 font-black">~</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-450 uppercase block font-bold">Failure Projections Rate</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block">6.2%</span>
          </div>
          <span className="text-xs text-slate-400 font-bold uppercase">Target: &lt; 3.0%</span>
        </div>
      </div>

      {/* Filters & Actions Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-3 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-2 rounded-xl w-full md:w-72 focus-within:ring-2 focus-within:ring-purple-500/50">
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
                  ? level === "High" ? "bg-red-650 bg-red-600 text-white" : level === "Medium" ? "bg-yellow-600 text-white" : "bg-purple-600 text-white"
                  : "bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 text-slate-500 hover:bg-slate-100"
              }`}
            >
              {level} Risk
            </button>
          ))}
        </div>
      </div>

      {/* Reports Grid table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-150 dark:border-slate-850 text-slate-400 font-bold uppercase text-[9px] tracking-wider bg-slate-50/50 dark:bg-slate-950/20">
                <th className="py-4 pl-5">Learner</th>
                <th className="py-4">Roll Number</th>
                <th className="py-4 text-center">Attendance</th>
                <th className="py-4 text-center">Quiz Avg</th>
                <th className="py-4 text-center">Missed Quizzes</th>
                <th className="py-4 text-center">Risk Tier</th>
                <th className="py-4 text-right pr-5">Remedial Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850/80">
              {currentRiskStudents.slice(0, 30).map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                  <td className="py-3.5 pl-5 font-bold text-slate-850 dark:text-slate-150">{student.name}</td>
                  <td className="py-3.5 text-slate-400 font-mono">{student.rollNumber}</td>
                  <td className={`py-3.5 text-center font-bold ${student.attendance < 75 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                    {student.attendance}%
                  </td>
                  <td className={`py-3.5 text-center font-bold ${student.quizScore < 60 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                    {student.quizScore}%
                  </td>
                  <td className="py-3.5 text-center font-bold text-slate-500 dark:text-slate-450">{student.missedQuizzes}</td>
                  <td className="py-3.5 text-center">
                    <span className={`text-[8px] font-black uppercase px-2.5 py-0.5 rounded ${
                      student.riskLevel === "High" ? "bg-red-500/10 text-red-500" : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500"
                    }`}>
                      {student.riskLevel}
                    </span>
                  </td>
                  <td className="py-3.5 text-right pr-5 space-x-2">
                    <button 
                      onClick={() => handleSendWarning(student)}
                      className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg border border-red-500/20 transition-all cursor-pointer"
                      title="Dispatch Warning Email"
                    >
                      <Mail size={14} />
                    </button>
                    <button 
                      onClick={() => handleRemedialClass(student)}
                      className="p-2 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white rounded-lg border border-indigo-500/20 transition-all cursor-pointer"
                      title="Schedule Remedial Invite"
                    >
                      <Calendar size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {currentRiskStudents.length === 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-sm mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto mb-4 animate-pulse">
            <Sparkles size={22} />
          </div>
          <h3 className="font-extrabold text-slate-800 dark:text-white text-base">No Risk Alerts Found</h3>
          <p className="text-slate-550 text-xs text-slate-400 mt-2">
            No students match the selected risk filter criteria. Clean academic profiles projected!
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default RiskPrediction;
