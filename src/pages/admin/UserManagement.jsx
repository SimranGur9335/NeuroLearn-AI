import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  X, 
  Sparkles,
  Users,
  Settings,
  BookOpen
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';

const UserManagement = () => {
  const { 
    studentsList, 
    teachersList, 
    addStudent, 
    updateStudent, 
    deleteStudent,
    addTeacher,
    updateTeacher,
    deleteTeacher
  } = useStudent();

  const [activeTab, setActiveTab] = useState("students"); // 'students' | 'teachers'
  const [searchTerm, setSearchTerm] = useState("");

  // CRUD overlays
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [targetUser, setTargetUser] = useState(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formRoll, setFormRoll] = useState("");
  const [formBranch, setFormBranch] = useState("CS");
  const [formEmail, setFormEmail] = useState("");
  const [formDesignation, setFormDesignation] = useState("Assistant Professor");

  const handleOpenAdd = () => {
    setFormName("");
    setFormRoll("");
    setFormBranch("CS");
    setFormEmail("");
    setFormDesignation("Assistant Professor");
    setShowAddModal(true);
  };

  const handleOpenEdit = (user) => {
    setTargetUser(user);
    setFormName(user.name);
    setFormRoll(user.rollNumber || "");
    setFormBranch(user.branch || "CS");
    setFormEmail(user.email || "");
    setFormDesignation(user.designation || "Assistant Professor");
    setShowEditModal(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      alert("Name and Email are required!");
      return;
    }

    if (activeTab === "students") {
      const newStudent = {
        id: `ST-${1000 + studentsList.length + 1}`,
        name: formName,
        rollNumber: formRoll || `2023${formBranch}${8000 + studentsList.length}`,
        branch: formBranch,
        year: "1st Year",
        attendance: 90,
        quizScore: 80,
        xp: 500,
        streak: 0,
        status: "Safe",
        riskLevel: "Low",
        predictedCgpa: 8.0,
        placementReadiness: "Medium",
        missedQuizzes: 0,
        weeklyMood: { happy: 60, focused: 30, frustrated: 5, stressed: 5 },
        activityHistory: [{ event: "Registered on platform", date: new Date().toISOString().split('T')[0], xp: 10 }]
      };
      addStudent(newStudent);
    } else {
      const newTeacher = {
        id: `t-${teachersList.length + 1}`,
        name: formName,
        department: formBranch,
        designation: formDesignation,
        email: formEmail,
        courses: ["CEN-301"]
      };
      addTeacher(newTeacher);
    }

    setShowAddModal(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (activeTab === "students") {
      updateStudent(targetUser.id, {
        name: formName,
        rollNumber: formRoll,
        branch: formBranch
      });
    } else {
      updateTeacher(targetUser.id, {
        name: formName,
        department: formBranch,
        designation: formDesignation,
        email: formEmail
      });
    }

    setShowEditModal(false);
    setTargetUser(null);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this user record?")) {
      if (activeTab === "students") {
        deleteStudent(id);
      } else {
        deleteTeacher(id);
      }
    }
  };

  // Filter lists based on search
  const getFilteredList = () => {
    if (activeTab === "students") {
      return studentsList.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 30); // render max 30 for performance
    } else {
      return teachersList.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  };

  const activeList = getFilteredList();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider">LMS Management</p>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white font-sans">User Directory Control</h2>
          <p className="text-slate-500 text-xs mt-1">Configure student and faculty profiles, create records, and delete accounts.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer self-start md:self-auto"
        >
          <Plus size={16} />
          <span>Add New {activeTab === "students" ? "Student" : "Teacher"}</span>
        </button>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-3 rounded-2xl shadow-sm">
        {/* Toggle buttons */}
        <div className="flex gap-2">
          <button 
            onClick={() => { setActiveTab("students"); setSearchTerm(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "students" ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-550 text-slate-500'
            }`}
          >
            Students Directory
          </button>
          <button 
            onClick={() => { setActiveTab("teachers"); setSearchTerm(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "teachers" ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-555 text-slate-500'
            }`}
          >
            Faculty Registry
          </button>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-2 rounded-xl w-full md:w-80 focus-within:ring-2 focus-within:ring-emerald-500/50">
          <Search size={16} className="text-slate-400" />
          <input 
            type="text" 
            placeholder={activeTab === "students" ? "Search student name, roll..." : "Search teacher name, email..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-slate-700 dark:text-slate-250 placeholder-slate-400 focus:outline-none w-full text-xs"
          />
        </div>
      </div>

      {/* User Table Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === "students" ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-150 dark:border-slate-850 text-slate-400 font-bold uppercase text-[9px] tracking-wider bg-slate-50/50 dark:bg-slate-950/20">
                  <th className="py-4 pl-5">Student Learner</th>
                  <th className="py-4">Roll Number</th>
                  <th className="py-4">Branch Department</th>
                  <th className="py-4 text-center">Attendance</th>
                  <th className="py-4 text-center">Quiz Avg</th>
                  <th className="py-4 text-center">XP Points</th>
                  <th className="py-4 text-right pr-5">System Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850/80">
                {activeList.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors">
                    <td className="py-3.5 pl-5 font-bold text-slate-800 dark:text-slate-150">{student.name}</td>
                    <td className="py-3.5 text-slate-550 dark:text-slate-400 font-mono">{student.rollNumber}</td>
                    <td className="py-3.5 text-slate-500 dark:text-slate-400 font-semibold">{student.branch}</td>
                    <td className="py-3.5 text-center font-bold">{student.attendance}%</td>
                    <td className="py-3.5 text-center font-bold">{student.quizScore}%</td>
                    <td className="py-3.5 text-center text-yellow-600 font-bold">{student.xp} XP</td>
                    <td className="py-3.5 text-right pr-5 space-x-1.5">
                      <button 
                        onClick={() => handleOpenEdit(student)}
                        className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer inline-flex"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(student.id)}
                        className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-red-500 hover:text-white rounded-lg text-red-500 transition-all cursor-pointer inline-flex"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-150 dark:border-slate-850 text-slate-400 font-bold uppercase text-[9px] tracking-wider bg-slate-50/50 dark:bg-slate-950/20">
                  <th className="py-4 pl-5">Teacher Faculty</th>
                  <th className="py-4">Department</th>
                  <th className="py-4">Designation Title</th>
                  <th className="py-4">Institution Email</th>
                  <th className="py-4 text-center">Assigned Courses</th>
                  <th className="py-4 text-right pr-5">System Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850/80">
                {activeList.map(teacher => (
                  <tr key={teacher.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors">
                    <td className="py-3.5 pl-5 font-bold text-slate-800 dark:text-slate-150">{teacher.name}</td>
                    <td className="py-3.5 text-slate-500 dark:text-slate-400 font-semibold">{teacher.department}</td>
                    <td className="py-3.5 text-slate-500 dark:text-slate-400">{teacher.designation}</td>
                    <td className="py-3.5 text-slate-550 dark:text-slate-450 font-mono">{teacher.email}</td>
                    <td className="py-3.5 text-center font-bold text-slate-600 dark:text-slate-350">{teacher.courses.join(', ')}</td>
                    <td className="py-3.5 text-right pr-5 space-x-1.5">
                      <button 
                        onClick={() => handleOpenEdit(teacher)}
                        className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer inline-flex"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(teacher.id)}
                        className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-red-500 hover:text-white rounded-lg text-red-500 transition-all cursor-pointer inline-flex"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* CRUD Modals overlay */}
      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleSaveAdd}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">
                Add New {activeTab === "students" ? "Student Account" : "Faculty Account"}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-205"
                  required
                />
              </div>

              {activeTab === "students" ? (
                <>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Roll Number</label>
                    <input 
                      type="text" 
                      value={formRoll}
                      onChange={(e) => setFormRoll(e.target.value)}
                      placeholder="e.g. 2023CS8024"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-850 dark:text-slate-205 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Branch</label>
                    <select
                      value={formBranch}
                      onChange={(e) => setFormBranch(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-205"
                    >
                      {["CS", "IT", "ECE", "EEE", "ME"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Institution Email</label>
                    <input 
                      type="email" 
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="e.g. faculty.name@apex.edu"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-205 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Designation</label>
                    <select
                      value={formDesignation}
                      onChange={(e) => setFormDesignation(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-205"
                    >
                      {["Assistant Professor", "Associate Professor", "Professor"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Department</label>
                    <select
                      value={formBranch}
                      onChange={(e) => setFormBranch(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-205"
                    >
                      {["CS", "IT", "ECE", "EEE", "ME"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 pt-3">
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-500 hover:bg-slate-50 font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all cursor-pointer"
              >
                Publish Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleSaveEdit}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">
                Modify User Details
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-805 dark:text-slate-200"
                  required
                />
              </div>

              {activeTab === "students" ? (
                <>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Roll Number</label>
                    <input 
                      type="text" 
                      value={formRoll}
                      onChange={(e) => setFormRoll(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-855 dark:text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Branch</label>
                    <select
                      value={formBranch}
                      onChange={(e) => setFormBranch(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-205"
                    >
                      {["CS", "IT", "ECE", "EEE", "ME"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Email</label>
                    <input 
                      type="email" 
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-805 dark:text-slate-200 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Designation</label>
                    <select
                      value={formDesignation}
                      onChange={(e) => setFormDesignation(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-205"
                    >
                      {["Assistant Professor", "Associate Professor", "Professor"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Department</label>
                    <select
                      value={formBranch}
                      onChange={(e) => setFormBranch(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-205"
                    >
                      {["CS", "IT", "ECE", "EEE", "ME"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 pt-3">
              <button 
                type="button"
                onClick={() => { setShowEditModal(false); setTargetUser(null); }}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-500 hover:bg-slate-50 font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all cursor-pointer"
              >
                Save Updates
              </button>
            </div>
          </form>
        </div>
      )}
    </motion.div>
  );
};

export default UserManagement;
