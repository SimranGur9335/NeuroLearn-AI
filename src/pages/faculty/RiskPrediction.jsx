import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Search, 
  Mail, 
  Calendar, 
  Sparkles, 
  RefreshCw,
  Play
} from 'lucide-react';

const RiskPrediction = () => {
  const selectedClass = JSON.parse(localStorage.getItem("selectedClass") || "{}");
  const facultyId = Number(localStorage.getItem("faculty_id") || "7");

  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("High"); // 'High' | 'Medium' | 'All'
  const [loading, setLoading] = useState(false);
  const [engineRunning, setEngineRunning] = useState(false);

  const fetchRoster = async () => {
    if (!selectedClass.class_id) return;
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/faculty/${facultyId}/students`);
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
      const res = await fetch("http://127.0.0.1:8000/faculty/run-risk-engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_id: selectedClass.class_id,
          faculty_id: facultyId
        })
      });
      if (!res.ok) throw new Error("Failed to execute risk engine");
      const data = await res.json();
      alert(data.message || "Risk prediction analysis completed.");
      await fetchRoster();
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
    alert(`Remedial invitation successfully logged for ${student.full_name}.\nDate: Next Saturday, 10:00 AM.\nFocus: DBMS Normalization and Query Tuning.`);
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
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Class: <span className="font-semibold text-slate-800 dark:text-white">{selectedClass.class_name}</span> | Subject: <span className="font-semibold text-slate-800 dark:text-white">{selectedClass.subject_name}</span>
          </p>
        </div>

        <button
          onClick={handleRunRiskEngine}
          disabled={engineRunning}
          className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-gradient-to-r from-red-650 to-red-500 bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-md cursor-pointer transition-all disabled:bg-slate-700"
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-450 uppercase block font-bold">High Risk Profile</span>
            <span className="text-2xl font-black text-red-500 mt-1 block">
              {highRiskCount} Students
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 font-black">!</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-450 uppercase block font-bold">Medium Risk Profile</span>
            <span className="text-2xl font-black text-amber-500 mt-1 block">
              {mediumRiskCount} Students
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500 font-black">~</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-450 uppercase block font-bold">Failure Projections Rate</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block">
              {classStudents.length > 0 ? ((highRiskCount / classStudents.length) * 100).toFixed(1) : 0.0}%
            </span>
          </div>
          <span className="text-xs text-slate-400 font-bold uppercase">Target: &lt; 3.0%</span>
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
                  ? level === "High" ? "bg-red-650 bg-red-600 text-white shadow" : level === "Medium" ? "bg-amber-500 text-white shadow" : "bg-purple-650 bg-purple-600 text-white shadow"
                  : "bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-850"
              }`}
            >
              {level} Risk
            </button>
          ))}
        </div>
      </div>

      {/* Reports Grid table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400 flex flex-col items-center gap-2">
            <RefreshCw size={24} className="animate-spin text-purple-650" />
            <span className="text-xs">Fetching risk alerts data...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-150 dark:border-slate-850 text-slate-400 font-bold uppercase text-[9px] tracking-wider bg-slate-50/50 dark:bg-slate-950/20">
                  <th className="py-4 pl-5">Learner</th>
                  <th className="py-4">Roll Number</th>
                  <th className="py-4 text-center">Attendance</th>
                  <th className="py-4 text-center">Quiz Avg</th>
                  <th className="py-4 text-center">Risk Tier</th>
                  <th className="py-4 text-right pr-5">Remedial Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850/80">
                {filteredStudents.map((student) => (
                  <tr key={student.student_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                    <td className="py-3.5 pl-5 font-bold text-slate-850 dark:text-slate-150">{student.full_name}</td>
                    <td className="py-3.5 text-slate-400 font-mono font-semibold">{student.roll_no}</td>
                    <td className={`py-3.5 text-center font-bold ${student.attendance < 75 ? 'text-red-500' : 'text-slate-700 dark:text-slate-350'}`}>
                      {student.attendance}%
                    </td>
                    <td className={`py-3.5 text-center font-bold ${student.quiz_score < 60 ? 'text-red-500' : 'text-slate-700 dark:text-slate-350'}`}>
                      {student.quiz_score}%
                    </td>
                    <td className="py-3.5 text-center">
                      <span className={`text-[8px] font-black uppercase px-2.5 py-0.5 rounded ${
                        student.risk_level === "High" ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-600 dark:text-amber-500"
                      }`}>
                        {student.risk_level}
                      </span>
                    </td>
                    <td className="py-3.5 text-right pr-5 space-x-2">
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
              </tbody>
            </table>
          </div>
        )}
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
    </motion.div>
  );
};

export default RiskPrediction;
