import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ArrowLeftRight, X, Search, UserCheck, Eye, Layers } from 'lucide-react';
import { apiFetch } from '../../services/api';

const EnrollmentManagement = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [targetEnrollment, setTargetEnrollment] = useState(null);

  // Form states
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");

  // History Drawer state
  const [historyStudent, setHistoryStudent] = useState(null);
  const [studentHistory, setStudentHistory] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const eRes = await apiFetch("/enrollments");
      const eData = await eRes.json();
      setEnrollments(eData);

      const sRes = await apiFetch("/students");
      const sData = await sRes.json();
      setStudents(Array.isArray(sData) ? sData : []);

      const cRes = await apiFetch("/classes");
      const cData = await cRes.json();
      setClasses(Array.isArray(cData) ? cData : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAdd = () => {
    setSelectedStudentId("");
    setSelectedClassId("");
    setShowAddModal(true);
  };

  const handleOpenTransfer = (enrollment) => {
    setTargetEnrollment(enrollment);
    setSelectedClassId(enrollment.class_id);
    setShowTransferModal(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedClassId) {
      alert("Please select both a student and a class!");
      return;
    }

    try {
      const res = await apiFetch("/enrollments", {
        method: "POST",
        body: JSON.stringify({
          student_id: parseInt(selectedStudentId),
          class_id: parseInt(selectedClassId)
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.detail || "Error enrolling student");
        return;
      }

      await loadData();
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveTransfer = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch(`/enrollments/${targetEnrollment.enrollment_id}`, {
        method: "PUT",
        body: JSON.stringify({
          student_id: targetEnrollment.student_id,
          class_id: parseInt(selectedClassId)
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.detail || "Error transferring student");
        return;
      }

      await loadData();
      setShowTransferModal(false);
      setTargetEnrollment(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove student enrollment?")) return;

    try {
      await apiFetch(`/enrollments/${id}`, {
        method: "DELETE"
      });
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const viewHistory = async (student) => {
    try {
      setHistoryStudent(student);
      const res = await apiFetch(`/enrollments/history/${student.student_id}`);
      if (res.ok) {
        const data = await res.json();
        setStudentHistory(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredEnrollments = enrollments.filter(e =>
    e.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.roll_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.class_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Academic Structure</p>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white font-sans">Enrollment Management Center</h2>
          <p className="text-slate-500 text-xs mt-1">Enroll students into designated classes, perform transfers, and review enrollment logs.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer self-start md:self-auto"
        >
          <Plus size={16} />
          <span>New Enrollment</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-3 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-2 rounded-xl w-full md:w-80 focus-within:ring-2 focus-within:ring-emerald-500/50">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search student, roll number, or class..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-slate-700 dark:text-slate-250 placeholder-slate-400 focus:outline-none w-full text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Table View */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-150 dark:border-slate-850 text-slate-400 font-bold uppercase text-[9px] tracking-wider bg-slate-50/50 dark:bg-slate-950/20">
                  <th className="py-4 pl-5">Student</th>
                  <th className="py-4">Roll No</th>
                  <th className="py-4">Assigned Class</th>
                  <th className="py-4 text-center">Semester</th>
                  <th className="py-4 text-center">Division</th>
                  <th className="py-4 text-right pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850/80">
                {filteredEnrollments.map((e) => (
                  <tr key={e.enrollment_id} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors">
                    <td className="py-3.5 pl-5 font-bold text-slate-800 dark:text-emerald-400">{e.student_name}</td>
                    <td className="py-3.5 text-slate-550 dark:text-emerald-400 font-mono">{e.roll_no}</td>
                    <td className="py-3.5 font-bold text-emerald-600 dark:text-emerald-400">{e.class_name}</td>
                    <td className="py-3.5 text-center font-bold text-slate-800 dark:text-emerald-400">{e.semester}</td>
                    <td className="py-3.5 text-center font-bold text-slate-800 dark:text-emerald-400">{e.division}</td>
                    <td className="py-3.5 text-right pr-5 space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => viewHistory(e)}
                        title="View Log History"
                        className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-blue-500 transition-all cursor-pointer inline-flex"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleOpenTransfer(e)}
                        title="Transfer Section"
                        className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer inline-flex"
                      >
                        <ArrowLeftRight size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(e.enrollment_id)}
                        title="Remove Enrollment"
                        className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-red-500 hover:text-white rounded-lg text-red-500 transition-all cursor-pointer inline-flex"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* History / Logs Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-4 pb-2 border-b border-slate-100 dark:border-slate-850 flex items-center gap-2">
              <Layers size={16} className="text-emerald-500" />
              Enrollment Audit Log
            </h3>
            {historyStudent ? (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-slate-400 block font-bold uppercase">Student</p>
                  <p className="text-sm font-black text-slate-800 dark:text-white">{historyStudent.student_name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{historyStudent.roll_no}</p>
                </div>
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {studentHistory.length === 0 ? (
                    <p className="text-[10px] text-slate-400">No enrollment history log recorded.</p>
                  ) : (
                    studentHistory.map((log, index) => (
                      <div key={index} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-[11px] leading-relaxed">
                        <div className="flex justify-between items-center mb-1">
                          <span className={`font-bold uppercase ${log.action === 'ENROLL' ? 'text-emerald-500' : log.action === 'TRANSFER' ? 'text-blue-500' : 'text-red-500'}`}>
                            {log.action}
                          </span>
                          <span className="text-[9px] text-slate-400">{log.timestamp.split(" ")[0]}</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px]">Performed by: {log.performed_by}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Select a student's view icon to inspect their academic enrollment transfer logs.</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveAdd}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Enroll Student in Class</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Select Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-white"
                  required
                >
                  <option value="">-- Choose Student --</option>
                  {students.map(s => (
                    <option key={s.student_id} value={s.student_id}>
                      {s.full_name} ({s.roll_no} - {s.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Select Class Section</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-white"
                  required
                >
                  <option value="">-- Choose Class --</option>
                  {classes.map(c => (
                    <option key={c.class_id} value={c.class_id}>
                      {c.class_name} (Sem {c.semester} - Div {c.division})
                    </option>
                  ))}
                </select>
              </div>
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
                Enroll Student
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveTransfer}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Transfer Student Section</h3>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Student</label>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-855 rounded-xl font-extrabold text-slate-700 dark:text-slate-300">
                  {targetEnrollment?.student_name} ({targetEnrollment?.roll_no})
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Select New Class Section</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                  required
                >
                  <option value="">-- Choose New Class --</option>
                  {classes.map(c => (
                    <option key={c.class_id} value={c.class_id}>
                      {c.class_name} (Sem {c.semester} - Div {c.division})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => { setShowTransferModal(false); setTargetEnrollment(null); }}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-855 rounded-xl text-slate-500 hover:bg-slate-50 font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all cursor-pointer"
              >
                Transfer Section
              </button>
            </div>
          </form>
        </div>
      )}
    </motion.div>
  );
};

export default EnrollmentManagement;
