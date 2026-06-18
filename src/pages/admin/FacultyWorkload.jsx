import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layers, User, Award, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { apiFetch } from '../../services/api';

const FacultyWorkload = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [workload, setWorkload] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFaculty();
  }, []);

  const loadFaculty = async () => {
    try {
      const res = await apiFetch("/faculty");
      const data = await res.json();
      setFacultyList(data);
      if (data.length > 0) {
        setSelectedFaculty(data[0]);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFaculty) {
      fetchWorkload(selectedFaculty.faculty_id);
    }
  }, [selectedFaculty]);

  const fetchWorkload = async (facultyId) => {
    try {
      setLoading(true);
      const res = await apiFetch(`/faculty/${facultyId}/workload`);
      const data = await res.json();
      setWorkload(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Optimal":
        return <CheckCircle className="text-emerald-500" size={20} />;
      case "Overloaded":
        return <AlertTriangle className="text-red-500 animate-pulse" size={20} />;
      case "Underloaded":
        return <AlertTriangle className="text-amber-500" size={20} />;
      default:
        return <HelpCircle className="text-slate-400" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Optimal":
        return "text-emerald-600 bg-emerald-500/10 border-emerald-500/20";
      case "Overloaded":
        return "text-red-600 bg-red-500/10 border-red-500/20";
      case "Underloaded":
        return "text-amber-600 bg-amber-500/10 border-amber-500/20";
      default:
        return "text-slate-500 bg-slate-500/10 border-slate-500/20";
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
          <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Faculty Operations</p>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white font-sans">Faculty Workload Control</h2>
          <p className="text-slate-500 text-xs mt-1">Oversee faculty teaching hour allocations, credits mapping, and workload balancing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Faculty List selection panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-xs uppercase tracking-wider mb-2 text-slate-400">Select Faculty</h3>
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {facultyList.map((f) => (
              <button
                key={f.faculty_id}
                onClick={() => setSelectedFaculty(f)}
                className={`w-full text-left p-3 rounded-2xl border transition-all text-xs font-bold ${
                  selectedFaculty && selectedFaculty.faculty_id === f.faculty_id
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-md"
                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                }`}
              >
                <div className="font-mono text-[9px] uppercase opacity-75 mb-0.5">{f.faculty_code}</div>
                <div>{f.full_name}</div>
                <div className="text-[10px] text-slate-400 font-normal mt-1">{f.designation} ({f.department})</div>
              </button>
            ))}
          </div>
        </div>

        {/* Workload Telemetry Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm lg:col-span-3 space-y-6">
          {selectedFaculty ? (
            <>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-850">
                <div>
                  <h3 className="text-base font-black text-slate-800 dark:text-white">{selectedFaculty.full_name}</h3>
                  <p className="text-[11px] text-slate-550 dark:text-slate-400 mt-1">{selectedFaculty.designation} • Department: {selectedFaculty.department}</p>
                </div>
                {workload && (
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${getStatusColor(workload.workload_status)}`}>
                    {getStatusIcon(workload.workload_status)}
                    {workload.workload_status} Workload
                  </span>
                )}
              </div>

              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                </div>
              ) : workload ? (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-955 p-4 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center gap-4 text-xs">
                      <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                        <Layers size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Total Classes Assigned</span>
                        <span className="text-xl font-extrabold text-slate-800 dark:text-bold">{workload.total_classes} Classes</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-955 p-4 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center gap-4 text-xs">
                      <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
                        <Award size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Teaching Credit Weights</span>
                        <span className="text-xl font-extrabold text-slate-800 dark:text-bold">{workload.total_credits} Credits</span>
                      </div>
                    </div>
                  </div>

                  {/* Assignments List */}
                  <div>
                    <h4 className="font-extrabold text-slate-800 dark:text-white text-xs uppercase tracking-wider mb-3 text-slate-400">Assigned Curriculum Classes</h4>
                    {workload.details.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No lecture classes assigned currently.</p>
                    ) : (
                      <div className="space-y-2">
                        {workload.details.map((d, index) => (
                          <div key={index} className="p-4 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-2xl flex justify-between items-center text-xs">
                            <div>
                              <p className="font-black text-slate-850 dark:text-slate-200">{d.subject_name}</p>
                              <p className="text-[10px] text-slate-400 mt-1">Class Section: <span className="font-bold text-indigo-500">{d.class_name}</span></p>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                                {d.credits} Credits
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-center py-12 text-xs text-slate-400">Loading workload...</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FacultyWorkload;
