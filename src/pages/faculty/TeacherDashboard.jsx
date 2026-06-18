import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import {
  Users,
  Calendar,
  GraduationCap,
  AlertTriangle,
  Activity,
  ArrowRight,
  TrendingUp,
  Award,
  Bell,
  BookOpen,
  ClipboardCheck,
  Plus
} from 'lucide-react';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const selectedClass = JSON.parse(localStorage.getItem("selectedClass") || "{}");
  const facultyId = Number(localStorage.getItem("faculty_id") || "7");

  // State data
  const [dashboardData, setDashboardData] = useState(null);
  const [classesList, setClassesList] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attHistory, setAttHistory] = useState([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardTelemetry = async () => {
      if (!selectedClass.class_id) return;
      setLoading(true);
      try {
        // 1. Dashboard summary counts
        const summaryRes = await fetch(`http://localhost:8000/class/${selectedClass.class_id}/dashboard-summary`);
        const summaryData = await summaryRes.json();
        setDashboardData(summaryData);

        // 2. Classes list
        const classesRes = await fetch(`http://localhost:8000/teacher/${facultyId}/classes`);
        const classesData = await classesRes.json();
        setClassesList(classesData);

        // 3. Announcements
        const annRes = await fetch("http://localhost:8000/announcements");
        const annData = await annRes.json();
        setAnnouncements(annData.slice(0, 4));

        // 4. Assigned students (filter at-risk)
        const studentsRes = await fetch(`http://localhost:8000/teacher/${facultyId}/students`);
        const studentsData = await studentsRes.json();
        
        // Filter students in current class
        const currentClassStudents = studentsData.filter(s => 
          s.division === (selectedClass.class_name.includes(" A") ? "A" : selectedClass.class_name.includes(" B") ? "B" : "")
        );
        const atRisk = currentClassStudents.filter(s => s.risk_level === "High" || s.risk_level === "Medium");
        setAtRiskStudents(atRisk.slice(0, 4));

        // 5. Assignments
        const assignRes = await fetch(`http://localhost:8000/assignments?class_id=${selectedClass.class_id}&subject_id=${selectedClass.subject_id}`);
        const assignData = await assignRes.json();
        setAssignments(assignData.slice(0, 4));

        // 6. Attendance History
        const attRes = await fetch(`http://localhost:8000/attendance/history?class_id=${selectedClass.class_id}&subject_id=${selectedClass.subject_id}`);
        const attData = await attRes.json();
        setAttHistory(attData.slice(0, 6));

      } catch (err) {
        console.error("Failed to load dashboard metrics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardTelemetry();
  }, [selectedClass.class_id, facultyId]);

  // Transform attendance history for charts
  const attendanceChartData = attHistory.map(h => ({
    date: h.date.split("-")[2] + "/" + h.date.split("-")[1],
    "Attendance %": h.present + h.absent + h.late > 0 ? Math.round((h.present / (h.present + h.absent + h.late)) * 100) : 100
  })).reverse();

  // Handle Quick Actions
  const handleRunRiskEngine = async () => {
    try {
      const res = await fetch("http://localhost:8000/teacher/run-risk-engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ class_id: selectedClass.class_id, faculty_id: facultyId })
      });
      if (!res.ok) throw new Error();
      alert("Risk Engine computed current student warning tiers!");
      navigate("/teacher/risk");
    } catch {
      alert("Failed to execute Risk Calculations.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 font-sans text-slate-800 dark:text-slate-200"
    >
      {/* Workspace Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-950 to-slate-900 border border-purple-900/50 p-6 rounded-3xl relative overflow-hidden shadow-xl text-white">
        <div className="absolute right-0 top-0 w-64 h-64 bg-radial-gradient(circle,rgba(168,85,247,0.15)_0%,transparent_70%) pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-[10px] text-emerald-450 font-bold uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Active Workspace
            </span>
            <h1 className="text-3xl md:text-4xl font-black mt-3">
              {selectedClass.subject_name || "Database Systems"}
            </h1>
            <p className="text-slate-300 mt-1.5 text-xs font-semibold">
              {selectedClass.class_name || "TE Computer A"} • {selectedClass.role || "Theory"}
            </p>
          </div>
          <button
            onClick={() => navigate('/faculty/select-class')}
            className="bg-white hover:bg-slate-100 text-purple-950 font-extrabold px-5 py-3 rounded-xl transition-all shadow-lg text-xs cursor-pointer shrink-0"
          >
            Switch Workspace
          </button>
        </div>
      </div>

      {/* KPI Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Students */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center text-slate-450 mb-2">
            <span className="text-[10px] uppercase font-bold">Students Enrolled</span>
            <Users size={16} />
          </div>
          <span className="text-2xl font-black text-slate-800 dark:text-white">{dashboardData?.total_students || 0}</span>
        </div>

        {/* Classes Assigned */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center text-slate-450 mb-2">
            <span className="text-[10px] uppercase font-bold">Assigned Classes</span>
            <BookOpen size={16} />
          </div>
          <span className="text-2xl font-black text-slate-800 dark:text-white">{classesList.length || 0}</span>
        </div>

        {/* Average Attendance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center text-slate-450 mb-2">
            <span className="text-[10px] uppercase font-bold">Avg Attendance</span>
            <Calendar size={16} />
          </div>
          <span className="text-2xl font-black text-slate-800 dark:text-white">{dashboardData?.average_attendance || 0}%</span>
        </div>

        {/* Average Quiz Score */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center text-slate-450 mb-2">
            <span className="text-[10px] uppercase font-bold">Avg Grades</span>
            <GraduationCap size={16} />
          </div>
          <span className="text-2xl font-black text-slate-800 dark:text-white">{dashboardData?.average_quiz_score || 0}%</span>
        </div>

        {/* Students At Risk */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm col-span-2 lg:col-span-1">
          <div className="flex justify-between items-center text-slate-450 mb-2">
            <span className="text-[10px] uppercase font-bold">Students at Risk</span>
            <AlertTriangle size={16} className="text-red-500" />
          </div>
          <span className="text-2xl font-black text-red-500">{dashboardData?.students_at_risk || 0}</span>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Attendance Trend Area Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm lg:col-span-2 space-y-4">
          <h3 className="font-extrabold text-slate-850 dark:text-white text-sm flex items-center gap-2">
            <TrendingUp size={18} className="text-purple-500" />
            Lecture Attendance Trend
          </h3>
          <div className="h-64">
            {attendanceChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceChartData}>
                  <defs>
                    <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '11px' }} />
                  <Area type="monotone" dataKey="Attendance %" stroke="#a855f7" fillOpacity={1} fill="url(#colorAtt)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No attendance logs found to render trend line.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-black text-slate-850 dark:text-white text-sm">Quick Workspace Actions</h3>
            <p className="text-[10px] text-slate-450 font-bold uppercase mt-0.5">Frequent administrative tasks</p>
          </div>
          
          <div className="flex-1 flex flex-col justify-center space-y-2.5">
            <button
              onClick={() => navigate("/teacher/attendance")}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-xl text-xs transition-all shadow cursor-pointer text-left pl-4 flex items-center gap-2"
            >
              <Calendar size={14} />
              Record Student Attendance
            </button>
            <button
              onClick={() => navigate("/teacher/assignments")}
              className="w-full py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer text-left pl-4 flex items-center gap-2"
            >
              <Plus size={14} />
              Create Class Assignment
            </button>
            <button
              onClick={() => navigate("/teacher/gradebook")}
              className="w-full py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer text-left pl-4 flex items-center gap-2"
            >
              <ClipboardCheck size={14} />
              Input Gradebook Marks
            </button>
            <button
              onClick={handleRunRiskEngine}
              className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-650 dark:text-red-400 font-bold rounded-xl text-xs transition-all cursor-pointer text-left pl-4 flex items-center gap-2"
            >
              <AlertTriangle size={14} />
              Recalculate Early Risk
            </button>
          </div>
        </div>
      </div>

      {/* Analytics & Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* At-Risk Students list */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-850 dark:text-white text-sm">Students At Academic Risk</h3>
            <p className="text-[10px] text-slate-450 font-bold uppercase mt-0.5">Immediate intervention recommended</p>
          </div>

          <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
            {atRiskStudents.map(student => (
              <div
                key={student.student_id}
                onClick={() => navigate("/teacher/performance")}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-850 hover:bg-purple-500/5 transition-all cursor-pointer"
              >
                <div>
                  <span className="font-bold text-xs block text-slate-800 dark:text-white">{student.full_name}</span>
                  <span className="text-[9px] text-slate-450 block font-mono mt-0.5">{student.roll_no} • Att: {student.attendance}%</span>
                </div>
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${student.risk_level === "High" ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"}`}>
                  {student.risk_level}
                </span>
              </div>
            ))}
            {atRiskStudents.length === 0 && (
              <div className="text-center p-6 text-slate-400 text-xs font-semibold">
                No students flagged in warning tiers!
              </div>
            )}
          </div>
        </div>

        {/* Pending Assignments */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-850 dark:text-white text-sm">Active Assignments</h3>
            <p className="text-[10px] text-slate-450 font-bold uppercase mt-0.5">Deadlines and outlines</p>
          </div>

          <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
            {assignments.map(a => (
              <div
                key={a.assignment_id}
                onClick={() => navigate("/teacher/assignments")}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-850 hover:bg-purple-500/5 transition-all cursor-pointer space-y-1.5"
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-xs text-slate-850 dark:text-slate-200 line-clamp-1">{a.title}</span>
                </div>
                <div className="flex justify-between items-center text-[9px] text-slate-450">
                  <span>Due: {a.due_date}</span>
                  <span className="font-extrabold text-purple-650">{a.total_marks} Marks</span>
                </div>
              </div>
            ))}
            {assignments.length === 0 && (
              <div className="text-center p-6 text-slate-400 text-xs font-semibold">
                No assignments registered in this class.
              </div>
            )}
          </div>
        </div>

        {/* Institutional announcements */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-850 dark:text-white text-sm">Institutional Notices</h3>
            <p className="text-[10px] text-slate-450 font-bold uppercase mt-0.5">Admin & office announcements</p>
          </div>

          <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
            {announcements.map(ann => (
              <div
                key={ann.announcement_id}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Bell size={12} className="text-purple-500 shrink-0" />
                    {ann.title}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">{ann.description}</p>
              </div>
            ))}
            {announcements.length === 0 && (
              <div className="text-center p-6 text-slate-400 text-xs font-semibold">
                No announcements broadcasted.
              </div>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default TeacherDashboard;
