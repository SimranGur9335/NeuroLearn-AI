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
  Copy,
  Eye,
  Phone,
  GraduationCap
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { apiFetch } from '../../services/api';

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
  const [formFacultyId, setFormFacultyId] = useState("");
  const [formBranch, setFormBranch] = useState("CS");
  const [formEmail, setFormEmail] = useState("");
  const [formDesignation, setFormDesignation] = useState("Assistant Professor");
  const [formPhone, setFormPhone] = useState("");

  // Credentials dialog state
  const [createdCredentials, setCreatedCredentials] = useState(null);

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
      const res = await apiFetch("/departments");
      if (res.ok) {
        const data = await res.json();
        setDepartments(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadStudents = async () => {
    try {
      const res = await apiFetch("/students");
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadFaculty = async () => {
    try {
      const res = await apiFetch("/faculty");
      if (res.ok) {
        const data = await res.json();
        setFaculty(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAdd = () => {
    setFormName("");
    setFormRoll("");
    setFormBranch("CS");
    setFormEmail("");
    setFormPhone("");
    setFormDesignation("Assistant Professor");
    setCreatedCredentials(null);
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
    e.preventDefault();
    setCreatedCredentials(null);

    if (activeTab === "students") {
      if (!formName.trim() || !formRoll.trim() || !formPhone.trim()) {
        alert("Name, Roll Number, and Phone Number are required!");
        return;
      }
    } else {
      if (!formName.trim() || !formPhone.trim()) {
        alert("Name and Phone Number are required!");
        return;
      }
    }

    try {
      if (activeTab === "students") {
        const res = await apiFetch("/v1/admin/create-student", {
          method: "POST",
          body: JSON.stringify({
            full_name: formName.trim(),
            roll_no: formRoll.trim(),
            department: formBranch,
            semester: 1,
            division: "A",
            phone: formPhone.trim()
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setCreatedCredentials(data);
          await loadStudents();
          setShowAddModal(false);
        } else {
          alert(data.detail || "Failed to create student account.");
        }
      } else {
        const res = await apiFetch("/v1/admin/create-faculty", {
          method: "POST",
          body: JSON.stringify({
            faculty_id: formFacultyId.trim(),
            full_name: formName.trim(),
            department: formBranch,
            phone: formPhone.trim()
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setCreatedCredentials(data);
          await loadFaculty();
          setShowAddModal(false);
        } else {
          alert(data.detail || "Failed to create faculty account.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during account publication.");
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();

    try {
      if (activeTab === "students") {
        const res = await apiFetch(`/students/${targetUser.student_id}`, {
          method: "PUT",
          body: JSON.stringify({
            roll_no: formRoll,
            full_name: formName,
            email: targetUser.email,
            department: formBranch,
            semester: targetUser.semester,
            division: targetUser.division
          })
        });
        if (res.ok) {
          await loadStudents();
        } else {
          alert("Failed to update student.");
        }
      } else if (activeTab === "faculty") {
        const res = await apiFetch(`/faculty/${targetUser.faculty_id}`, {
          method: "PUT",
          body: JSON.stringify({
            faculty_code: targetUser.faculty_code,
            full_name: formName,
            email: formEmail,
            department: formBranch,
            designation: formDesignation
          })
        });
        if (res.ok) {
          await loadFaculty();
        } else {
          alert("Failed to update faculty.");
        }
      }
      setShowEditModal(false);
      setTargetUser(null);
    } catch (err) {
      console.error(err);
      alert("Error updating record.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record? This action is irreversible."))
      return;

    try {
      if (activeTab === "students") {
        const res = await apiFetch(`/students/${id}`, {
          method: "DELETE"
        });
        if (res.ok) {
          await loadStudents();
        } else {
          alert("Failed to delete student.");
        }
      } else {
        const res = await apiFetch(`/faculty/${id}`, {
          method: "DELETE"
        });
        if (res.ok) {
          await loadFaculty();
        } else {
          alert("Failed to delete faculty.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting record.");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // Filter lists based on search
  const getFilteredList = () => {
    if (activeTab === "students") {
      return students.filter(
        item =>
          item.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.roll_no?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return faculty.filter(
      item =>
        item.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const activeList = getFilteredList();
  const totalPages = Math.ceil(activeList.length / itemsPerPage);
  const paginatedList = activeList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getDeptList = () => {
    return departments.length > 0 ? departments.map(d => d.department_code) : ["CS", "IT"];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Tenant LMS Control</p>
          <h2 className="text-3xl font-black text-white font-sans">User Directory Management</h2>
          <p className="text-slate-400 text-xs mt-1">Configure student and faculty profiles, generate secure credentials, and audit tenant accounts.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md cursor-pointer self-start md:self-auto transition-colors"
        >
          <Plus size={16} />
          <span>Add New {activeTab === "students" ? "Student" : "Faculty"}</span>
        </button>
      </div>

      {/* Credentials dialog */}
      <AnimatePresence>
        {createdCredentials && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-indigo-950/40 border border-indigo-500/20 p-5 rounded-3xl space-y-4 shadow-xl shadow-indigo-950/20"
          >
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-wider">
              <Sparkles size={14} />
              <span>User Account Created Successfully</span>
            </div>
            <p className="text-slate-350 text-[11px]">
              Provide these default credentials to the newly registered user. They will be forced to change their password on first login.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-850">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Generated Email Address</label>
                <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 mt-1">
                  <span className="text-xs text-white font-mono">{createdCredentials.email}</span>
                  <button onClick={() => copyToClipboard(createdCredentials.email)} className="text-slate-400 hover:text-white cursor-pointer">
                    <Copy size={13} />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Temporary Password (Phone)</label>
                <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 mt-1">
                  <span className="text-xs text-white font-mono">{createdCredentials.temporary_password}</span>
                  <button onClick={() => copyToClipboard(createdCredentials.temporary_password)} className="text-slate-400 hover:text-white cursor-pointer">
                    <Copy size={13} />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setCreatedCredentials(null)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/40 border border-slate-850 px-5 py-3 rounded-2xl backdrop-blur-md">
        {/* Toggle buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab("students"); setSearchTerm(""); setCurrentPage(1); setCreatedCredentials(null); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "students"
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-950/40 border border-slate-850 text-slate-400 hover:text-white'
              }`}
          >
            Students Directory
          </button>
          <button
            onClick={() => { setActiveTab("faculty"); setSearchTerm(""); setCurrentPage(1); setCreatedCredentials(null); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "faculty"
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-950/40 border border-slate-850 text-slate-400 hover:text-white'
              }`}
          >
            Faculty Registry
          </button>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-850 px-3 py-2 rounded-xl w-full md:w-80 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
          <Search size={16} className="text-slate-500" />
          <input
            type="text"
            placeholder={activeTab === "students" ? "Search student name, roll..." : "Search faculty name, email..."}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="bg-transparent border-none text-slate-200 placeholder-slate-550 focus:outline-none w-full text-xs"
          />
        </div>
      </div>

      {/* User Table Grid */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-3xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          {activeTab === "students" ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-850 text-slate-400 font-black uppercase text-[9px] tracking-wider bg-slate-950/40">
                  <th className="py-4 pl-5">Student Name</th>
                  <th className="py-4">Roll No</th>
                  <th className="py-4">Department</th>
                  <th className="py-4 text-center">Semester</th>
                  <th className="py-4 text-center">Division</th>
                  <th className="py-4 text-center">Email</th>
                  <th className="py-4 text-right pr-5">System Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">No student profiles found.</td>
                  </tr>
                ) : (
                  paginatedList.map(student => (
                    <tr key={student.student_id} className="border-b border-slate-900/50 hover:bg-slate-900/20 transition-colors">
                      <td className="py-3.5 pl-5 font-bold text-white">{student.full_name}</td>
                      <td className="py-3.5 text-slate-300 font-mono">{student.roll_no}</td>
                      <td className="py-3.5 text-indigo-400 font-semibold">{student.department}</td>
                      <td className="py-3.5 text-center text-slate-300 font-bold">{student.semester}</td>
                      <td className="py-3.5 text-center text-slate-300 font-bold">{student.division}</td>
                      <td className="py-3.5 text-center text-slate-300 font-bold">{student.email}</td>
                      <td className="py-3.5 text-right pr-5 space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/admin/students/${student.student_id}`)}
                          className="p-1.5 border border-slate-800 hover:bg-slate-950/60 rounded-lg text-blue-400 transition-all cursor-pointer inline-flex items-center"
                          title="View Student profile"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="p-1.5 border border-slate-800 hover:bg-slate-950/60 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer inline-flex"
                          title="Edit Info"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(student.student_id)}
                          className="p-1.5 border border-slate-800 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-red-500 transition-all cursor-pointer inline-flex"
                          title="Delete Record"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-850 text-slate-400 font-black uppercase text-[9px] tracking-wider bg-slate-950/40">
                  <th className="py-4 pl-5"> Faculty</th>
                  <th className="py-4">Department</th>
                  <th className="py-4">Designation Title</th>
                  <th className="py-4">Institution Email</th>
                  <th className="py-4 text-center">Faculty Code</th>
                  <th className="py-4 text-right pr-5">System Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">No faculty members registered.</td>
                  </tr>
                ) : (
                  paginatedList.map(faculty => (
                    <tr key={faculty.faculty_id} className="border-b border-slate-900/50 hover:bg-slate-900/20 transition-colors">
                      <td className="py-3.5 pl-5 font-bold text-white">{faculty.full_name}</td>
                      <td className="py-3.5 text-indigo-400 font-semibold">{faculty.department}</td>
                      <td className="py-3.5 text-white">{faculty.designation || "Assistant Professor"} </td>
                      <td className="py-3.5 text-white font-bold">{faculty.email}</td>
                      <td className="py-3.5 text-center text-slate-300 font-bold">{faculty.faculty_code}</td>
                      <td className="py-3.5 text-right pr-5 space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/admin/faculty/${faculty.faculty_id}`)}
                          className="p-1.5 border border-slate-800 hover:bg-slate-950/60 inline-flex items-center rounded-lg text-blue-400"
                          title="View analytics"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(faculty)}
                          className="p-1.5 border border-slate-800 hover:bg-slate-955/60 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer inline-flex"
                          title="Edit Info"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(faculty.faculty_id)}
                          className="p-1.5 border border-slate-800 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-red-500 transition-all cursor-pointer inline-flex"
                          title="Delete Record"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-850 px-6 py-4 bg-slate-950/30 text-xs font-semibold text-slate-400">
            <span>
              Showing Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950 disabled:opacity-40 hover:bg-slate-900 transition-all cursor-pointer disabled:cursor-not-allowed text-white"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950 disabled:opacity-40 hover:bg-slate-900 transition-all cursor-pointer disabled:cursor-not-allowed text-white"
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
            className="bg-slate-900 border border-slate-850 p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-850">
              <h3 className="font-extrabold text-sm text-white">
                Add New {activeTab === "students" ? "Student Account" : "Faculty Account"}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                  required
                />
              </div>

              {activeTab === "students" ? (
                <>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Enrollment No. *</label>
                    <input
                      type="text"
                      value={formRoll}
                      onChange={(e) => setFormRoll(e.target.value)}
                      placeholder="e.g. 2023CS8024"
                      className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Department Branch</label>
                    <select
                      value={formBranch}
                      onChange={(e) => setFormBranch(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white cursor-pointer"
                    >
                      {getDeptList().map(d => (
                        <option key={d} value={d} className="bg-slate-900">{d}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
                      Faculty ID *
                    </label>
                    <input
                      type="text"
                      value={formFacultyId}
                      onChange={(e) => setFormFacultyId(e.target.value)}
                      placeholder="e.g. FAC001"
                      className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-3 py-2.5 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Department Branch</label>
                    <select
                      value={formBranch}
                      onChange={(e) => setFormBranch(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white cursor-pointer"
                    >
                      {getDeptList().map(d => (
                        <option key={d} value={d} className="bg-slate-900">{d}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Password generation phone field */}
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Contact Phone (Temp Password) *</label>
                <div className="relative flex items-center bg-slate-950/60 border border-slate-850 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500">
                  <Phone size={14} className="text-slate-500 mr-2" />
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="bg-transparent border-none text-white focus:outline-none w-full font-mono"
                    required
                  />
                </div>
                <span className="text-[9px] text-slate-550 mt-1 pl-1 block">This phone number will serve as the initial login password.</span>
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 border border-slate-800 rounded-xl text-slate-400 hover:bg-slate-950 font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all cursor-pointer"
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
            className="bg-slate-900 border border-slate-850 p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-850">
              <h3 className="font-extrabold text-sm text-white">
                Modify User Details
              </h3>
              <button onClick={() => { setShowEditModal(false); setTargetUser(null); }} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Full Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                  required
                />
              </div>

              {activeTab === "students" ? (
                <>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Enrollment No. </label>
                    <input
                      type="text"
                      value={formRoll}
                      onChange={(e) => setFormRoll(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Branch</label>
                    <select
                      value={formBranch}
                      onChange={(e) => setFormBranch(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white cursor-pointer"
                    >
                      {getDeptList().map(d => (
                        <option key={d} value={d} className="bg-slate-900">{d}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Email</label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Designation</label>
                    <select
                      value={formDesignation}
                      onChange={(e) => setFormDesignation(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white cursor-pointer"
                    >
                      {["Assistant Professor", "Associate Professor", "Professor"].map(d => (
                        <option key={d} value={d} className="bg-slate-900">{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Department</label>
                    <select
                      value={formBranch}
                      onChange={(e) => setFormBranch(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white cursor-pointer"
                    >
                      {getDeptList().map(d => (
                        <option key={d} value={d} className="bg-slate-900">{d}</option>
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
                className="flex-1 py-2.5 border border-slate-800 rounded-xl text-slate-400 hover:bg-slate-950 font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all cursor-pointer"
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