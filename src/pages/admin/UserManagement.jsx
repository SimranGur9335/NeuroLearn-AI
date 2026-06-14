import React, { useState, useEffect } from 'react';
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
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserManagement = () => {

  const [activeTab, setActiveTab] = useState("students"); // 'students' | 'faculty'
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
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();


  useEffect(() => {
    loadStudents();
    loadFaculty();
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/departments");
      const data = await res.json();
      setDepartments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadStudents = async () => {
    const res = await fetch("http://127.0.0.1:8000/students");
    const data = await res.json();
    setStudents(data);
  };

  const loadFaculty = async () => {
    const res = await fetch("http://127.0.0.1:8000/faculty");
    const data = await res.json();
    setFaculty(data);
  };

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
    setFormName(user.full_name || "");
    setFormRoll(user.roll_no || "");
    setFormBranch(user.department || "CS");
    setFormEmail(user.email || "");
    setFormDesignation(user.designation || "Assistant Professor");
    setShowEditModal(true);
  };

  const handleSaveAdd = async (e) => {
    if (activeTab === "students") {

      if (!formName.trim() || !formRoll.trim()) {
        alert("Name and Roll Number are required!");
        return;
      }

    } else {

      if (!formName.trim() || !formEmail.trim()) {
        alert("Name and Email are required!");
        return;
      }

    }
    if (activeTab === "students") {

      await fetch(
        "http://127.0.0.1:8000/students",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            roll_no: formRoll,
            full_name: formName,
            email: `${formRoll}@student.com`,
            department: formBranch,
            semester: 1,
            division: "A"
          })
        }
      );

      await loadStudents();

    } else {

      await fetch("http://127.0.0.1:8000/faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          faculty_code: `FAC-${Date.now()}`,
          full_name: formName,
          email: formEmail,
          department: formBranch,
          designation: formDesignation
        })
      });

      await loadFaculty();

    }


    setShowAddModal(false);
  };

  const handleSaveEdit = async (e) => {

    e.preventDefault();

    if (activeTab === "students") {

      await fetch(
        `http://127.0.0.1:8000/students/${targetUser.student_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            roll_no: formRoll,
            full_name: formName,
            email: targetUser.email,
            department: formBranch,
            semester: targetUser.semester,
            division: targetUser.division
          })
        }
      );

      await loadStudents();

    }

    else if (activeTab === "faculty") {

      await fetch(
        `http://127.0.0.1:8000/faculty/${targetUser.faculty_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            faculty_code: targetUser.faculty_code,
            full_name: formName,
            email: formEmail,
            department: formBranch,
            designation: formDesignation
          })
        }
      );

      await loadFaculty();

    }

    setShowEditModal(false);
    setTargetUser(null);

  };

  const handleDelete = async (id) => {

    if (!window.confirm("Delete this record?"))
      return;

    if (activeTab === "students") {

      await fetch(
        `http://127.0.0.1:8000/students/${id}`,
        {
          method: "DELETE"
        }
      );

      await loadStudents();

    } else {

      await fetch(
        `http://127.0.0.1:8000/faculty/${id}`,
        {
          method: "DELETE"
        }
      );

      await loadFaculty();

    }

  };

  // Filter lists based on search
  const getFilteredList = () => {

    if (activeTab === "students") {

      return students.filter(
        item =>
          item.full_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||

          item.roll_no
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );

    }

    return faculty.filter(
      item =>
        item.full_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||

        item.email
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );

  };

  const activeList = getFilteredList();
  const totalPages = Math.ceil(activeList.length / itemsPerPage);
  const paginatedList = activeList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getDeptList = () => {
    return departments.length > 0 ? departments.map(d => d.department_code) : ["CS", "IT", "ECE", "EEE", "ME"];
  };

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
            onClick={() => { setActiveTab("students"); setSearchTerm(""); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "students" ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-555 text-slate-500'
              }`}
          >
            Students Directory
          </button>
          <button
            onClick={() => { setActiveTab("faculty"); setSearchTerm(""); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "faculty" ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-555 text-slate-500'
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
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
                  <th className="py-4 pl-5">Student Name</th>
                  <th className="py-4">Roll No</th>
                  <th className="py-4">Department</th>
                  <th className="py-4 text-center">Semester</th>
                  <th className="py-4 text-center">Division</th>
                  <th className="py-4 text-center pr-5">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850/80">
                {paginatedList.map(student => (
                  <tr key={student.student_id} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors">
                    <td className="py-3.5 pl-5 font-bold dark:text-yellow-200 text-slate-800 dark:text-slate-150">{student.full_name}</td>
                    <td className="py-3.5 text-slate-550 dark:text-yellow-200 font-mono">{student.roll_no}</td>
                    <td className="py-3.5 text-slate-500 dark:text-yellow-200 font-semibold">{student.department}</td>
                    <td className="py-3.5 text-center dark:text-yellow-200 font-bold">{student.semester}</td>
                    <td className="py-3.5 text-center dark:text-yellow-200 font-bold">{student.division}</td>
                    <td className="py-3.5 text-center dark:text-yellow-200 font-bold">{student.email}</td>
                    <td className="py-3.5 text-right pr-5 space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/admin/students/${student.student_id}`)}
                        className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-blue-500 hover:text-blue-600 transition-all cursor-pointer inline-flex items-center"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(student)}
                        className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer inline-flex"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(student.student_id)}
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
                  <th className="py-4 pl-5 dark">Teacher Faculty</th>
                  <th className="py-4">Department</th>
                  <th className="py-4">Designation Title</th>
                  <th className="py-4">Institution Email</th>
                  <th className="py-4 text-center">Faculty Code</th>
                  <th className="py-4 text-right pr-5">System Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850/80">
                {paginatedList.map(teacher => (
                  <tr key={teacher.faculty_id} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors">
                    <td className="py-3.5 pl-5 dark:text-yellow-200 text-slate-800 dark:text-slate-150 ">{teacher.full_name}</td>
                    <td className="py-3.5 pl-5 dark:text-yellow-200 text-slate-800 dark:text-slate-150 ">{teacher.department}</td>
                    <td className="py-3.5 pl-5 text-slate-700 dark:text-yellow-200  dark:text-slate-600 ">{teacher.designation}</td>
                    <td className="py-3.5 pl-5 text-slate-700 dark:text-yellow-200  dark:text-slate-600 ">{teacher.email}</td>
                    <td className="py-3.5 text-center dark:text-yellow-200 font-bold text-slate-700 dark:text-slate-350">{teacher.faculty_code}</td>
                    <td className="py-3.5 text-right pr-5 space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/admin/faculty/${teacher.faculty_id}`)}
                        className="p-1.5 border border-slate-200 dark:border-slate-800 inline-flex items-center rounded-lg text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-850"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(teacher)}
                        className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer inline-flex"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(teacher.faculty_id)}
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
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 px-6 py-4 bg-slate-50/20 dark:bg-slate-950/20 text-xs">
            <span className="text-slate-500">
              Showing Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-850 font-bold transition-all cursor-pointer disabled:cursor-not-allowed text-slate-700 dark:text-slate-300"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-850 font-bold transition-all cursor-pointer disabled:cursor-not-allowed text-slate-700 dark:text-slate-300"
              >
                Next
              </button>
            </div>
          </div>
        )}
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
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-205"
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
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-850 dark:text-slate-205 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Branch</label>
                    <select
                      value={formBranch}
                      onChange={(e) => setFormBranch(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-205"
                    >
                      {getDeptList().map(d => (
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
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-205"
                    >
                      {getDeptList().map(d => (
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
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-855">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">
                Modify User Details
              </h3>
              <button onClick={() => { setShowEditModal(false); setTargetUser(null); }} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
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
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-205"
                    >
                      {getDeptList().map(d => (
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
                      {getDeptList().map(d => (
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