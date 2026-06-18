import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, X, Calendar, Layers } from 'lucide-react';
import { apiFetch } from '../../services/api';

const AcademicStructure = () => {
  const [terms, setTerms] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [targetTerm, setTargetTerm] = useState(null);

  // Form states
  const [formYear, setFormYear] = useState("");
  const [formSemester, setFormSemester] = useState("");

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      const res = await apiFetch("/academic-terms");
      const data = await res.json();
      setTerms(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAdd = () => {
    setFormYear("2023-2024");
    setFormSemester("1");
    setShowAddModal(true);
  };

  const handleOpenEdit = (term) => {
    setTargetTerm(term);
    setFormYear(term.academic_year);
    setFormSemester(term.semester.toString());
    setShowEditModal(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("/academic-terms", {
        method: "POST",
        body: JSON.stringify({
          academic_year: formYear,
          semester: parseInt(formSemester)
        })
      });
      await loadTerms();
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/academic-terms/${targetTerm.term_id}`, {
        method: "PUT",
        body: JSON.stringify({
          academic_year: formYear,
          semester: parseInt(formSemester)
        })
      });
      await loadTerms();
      setShowEditModal(false);
      setTargetTerm(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this academic term structure?")) return;

    try {
      await apiFetch(`/academic-terms/${id}`, {
        method: "DELETE"
      });
      await loadTerms();
    } catch (err) {
      console.error(err);
    }
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
          <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Institution Setup</p>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white font-sans">Academic Structure Center</h2>
          <p className="text-slate-500 text-xs mt-1">Configure academic years, semester cycles, and institutional term frameworks.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer self-start md:self-auto"
        >
          <Plus size={16} />
          <span>Add Academic Term</span>
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {terms.map((term) => (
          <div
            key={term.term_id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[160px]"
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/10 font-mono">
                  Term ID: {term.term_id}
                </span>
                <Calendar size={18} className="text-slate-450 text-slate-400" />
              </div>
              <h3 className="font-extrabold text-slate-850 dark:text-white text-base leading-snug">Academic Year: {term.academic_year}</h3>
              <p className="text-xs text-slate-500 mt-1">Semester: <span className="font-extrabold text-emerald-600">{term.semester}</span></p>
            </div>

            <div className="mt-4 flex justify-end gap-1.5 border-t border-slate-100 dark:border-slate-850 pt-3">
              <button
                onClick={() => handleOpenEdit(term)}
                className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-855 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer inline-flex"
              >
                <Edit size={12} />
              </button>
              <button
                onClick={() => handleDelete(term.term_id)}
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
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Add Academic Term</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Academic Year</label>
                <input
                  type="text"
                  value={formYear}
                  onChange={(e) => setFormYear(e.target.value)}
                  placeholder="e.g. 2023-2024"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Semester</label>
                <input
                  type="number"
                  value={formSemester}
                  onChange={(e) => setFormSemester(e.target.value)}
                  min={1}
                  max={8}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                  required
                />
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
                Add Term
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
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Modify Academic Term</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Academic Year</label>
                <input
                  type="text"
                  value={formYear}
                  onChange={(e) => setFormYear(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Semester</label>
                <input
                  type="number"
                  value={formSemester}
                  onChange={(e) => setFormSemester(e.target.value)}
                  min={1}
                  max={8}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
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

export default AcademicStructure;
