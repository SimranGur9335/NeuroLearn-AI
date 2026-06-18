import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, X, Search, Landmark, Calendar, Hash } from 'lucide-react';
import { apiFetch } from '../../services/api';

const ClassManagement = () => {
  const [classesList, setClassesList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [academicTerms, setAcademicTerms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [targetClass, setTargetClass] = useState(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDivision, setFormDivision] = useState("A");
  const [formDept, setFormDept] = useState("");
  const [formSemester, setFormSemester] = useState("1");
  const [formTermId, setFormTermId] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const cRes = await apiFetch("/classes");
      const cData = await cRes.json();
      setClassesList(cData);

      const dRes = await apiFetch("/departments");
      const dData = await dRes.json();
      setDepartments(dData);
      if (dData.length > 0 && !formDept) {
        setFormDept(dData[0].department_code);
      }

      const tRes = await apiFetch("/academic-terms");
      const tData = await tRes.json();
      setAcademicTerms(tData);
      if (tData.length > 0 && !formTermId) {
        setFormTermId(tData[0].term_id.toString());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAdd = () => {
    setFormName("");
    setFormDivision("A");
    setFormSemester("1");
    if (departments.length > 0) setFormDept(departments[0].department_code);
    if (academicTerms.length > 0) setFormTermId(academicTerms[0].term_id.toString());
    setShowAddModal(true);
  };

  const handleOpenEdit = (cls) => {
    setTargetClass(cls);
    setFormName(cls.class_name);
    setFormDivision(cls.division || "A");
    setFormDept(cls.department || "");
    setFormSemester(cls.semester ? cls.semester.toString() : "1");
    setFormTermId(cls.term_id ? cls.term_id.toString() : "");
    setShowEditModal(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formDept || !formTermId) {
      alert("Name, Department and Academic Term are required!");
      return;
    }

    try {
      await apiFetch("/classes", {
        method: "POST",
        body: JSON.stringify({
          class_name: formName,
          division: formDivision,
          department: formDept,
          semester: parseInt(formSemester),
          term_id: parseInt(formTermId)
        })
      });
      await loadData();
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/classes/${targetClass.class_id}`, {
        method: "PUT",
        body: JSON.stringify({
          class_name: formName,
          division: formDivision,
          department: formDept,
          semester: parseInt(formSemester),
          term_id: parseInt(formTermId)
        })
      });
      await loadData();
      setShowEditModal(false);
      setTargetClass(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this class? This will remove related enrollments and assignments.")) return;

    try {
      await apiFetch(`/classes/${id}`, {
        method: "DELETE"
      });
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const getDeptOptions = () => {
    return departments.length > 0 ? departments.map(d => d.department_code) : ["CS", "IT"];
  };

  const getTermText = (termId) => {
    const term = academicTerms.find(t => t.term_id === termId);
    return term ? `${term.academic_year} (Sem ${term.semester})` : `Term ID: ${termId}`;
  };

  const filteredClasses = classesList.filter(cls =>
    cls.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cls.department && cls.department.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <h2 className="text-2xl font-black text-slate-800 dark:text-white font-sans">Class Structures Configuration</h2>
          <p className="text-slate-500 text-xs mt-1">Configure class structures, division allocations, and link classroom instances to academic terms.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer self-start md:self-auto"
        >
          <Plus size={16} />
          <span>Add New Class</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-880 px-5 py-3 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-2 rounded-xl w-full md:w-80 focus-within:ring-2 focus-within:ring-emerald-500/50">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search class name or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-slate-700 dark:text-slate-250 placeholder-slate-400 focus:outline-none w-full text-xs"
          />
        </div>
      </div>

      {/* Classes List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((cls) => (
          <div
            key={cls.class_id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[190px]"
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/10 font-mono">
                  {cls.department || "General"}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">Sem {cls.semester} - Div {cls.division || 'A'}</span>
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base leading-snug">{cls.class_name}</h3>
              
              {cls.term_id && (
                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                  <Calendar size={12} />
                  <span>Term: {getTermText(cls.term_id)}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-1.5 border-t border-slate-100 dark:border-slate-850 pt-3">
              <button
                onClick={() => handleOpenEdit(cls)}
                className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-855 rounded-lg text-slate-500 hover:text-slate-805 dark:hover:text-white transition-all cursor-pointer inline-flex"
              >
                <Edit size={12} />
              </button>
              <button
                onClick={() => handleDelete(cls.class_id)}
                className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-red-500 hover:text-white rounded-lg text-red-500 transition-all cursor-pointer inline-flex"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveAdd}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Create Class Section</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Class Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. FY Computer A"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Division</label>
                  <input
                    type="text"
                    value={formDivision}
                    onChange={(e) => setFormDivision(e.target.value)}
                    placeholder="e.g. A"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 uppercase"
                    maxLength={1}
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Semester</label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Department</label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                  >
                    {getDeptOptions().map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] dark- bold dark:text-slate-500 font-bold text-slate-400 uppercase block mb-1">Academic Term</label>
                  <select
                    value={formTermId}
                    onChange={(e) => setFormTermId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-500"
                  >
                    {academicTerms.map(t => (
                      <option key={t.term_id} value={t.term_id}>
                        {t.academic_year} (Sem {t.semester})
                      </option>
                    ))}
                  </select>
                </div>
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
                Create Class
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
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Modify Class Specifications</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Class Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Division</label>
                  <input
                    type="text"
                    value={formDivision}
                    onChange={(e) => setFormDivision(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 uppercase"
                    maxLength={1}
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Semester</label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Department</label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-500"
                  >
                    {getDeptOptions().map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Academic Term</label>
                  <select
                    value={formTermId}
                    onChange={(e) => setFormTermId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                  >
                    {academicTerms.map(t => (
                      <option key={t.term_id} value={t.term_id}>
                        {t.academic_year} (Sem {t.semester})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => { setShowEditModal(false); setTargetClass(null); }}
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

export default ClassManagement;
