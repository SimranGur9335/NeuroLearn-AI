import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, BookOpen, Layers, Award, Landmark } from 'lucide-react';
import { apiFetch } from '../../services/api';

const CourseSubjectMapping = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const cRes = await apiFetch("/courses");
      const cData = await cRes.json();
      setCourses(cData);
      if (cData.length > 0 && !selectedCourse) {
        setSelectedCourse(cData[0]);
      }

      const sRes = await apiFetch("/subjects");
      const sData = await sRes.json();
      setSubjects(sData);

      const mRes = await apiFetch("/course-subject-mappings");
      const mData = await mRes.json();
      setMappings(mData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAdd = () => {
    setSelectedSubjectId("");
    setShowAddModal(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (!selectedSubjectId || !selectedCourse) {
      alert("Please select a subject!");
      return;
    }

    try {
      const res = await apiFetch("/course-subject-mappings", {
        method: "POST",
        body: JSON.stringify({
          course_id: selectedCourse.course_id,
          subject_id: parseInt(selectedSubjectId)
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.detail || "Error mapping subject");
        return;
      }

      await loadData();
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (mappingId) => {
    if (!window.confirm("Remove subject from this curriculum structure?")) return;

    try {
      await apiFetch(`/course-subject-mappings/${mappingId}`, {
        method: "DELETE"
      });
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter mappings for the currently selected course
  const currentCourseMappings = mappings.filter(m => selectedCourse && m.course_id === selectedCourse.course_id);

  // Group current course subjects by semester
  const semesterGroups = currentCourseMappings.reduce((acc, curr) => {
    const sem = curr.semester || 1;
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(curr);
    return acc;
  }, {});

  // Find subjects that are NOT mapped to the current course yet
  const availableSubjects = subjects.filter(s => {
    return !currentCourseMappings.some(m => m.subject_id === s.subject_id);
  });

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
          <p className="text-xs text-emerald-505 font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Curriculum Structure</p>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white font-sans">Course-Subject Mapping</h2>
          <p className="text-slate-500 text-xs mt-1">Bind subjects to course profiles, design syllabus tracks, and visualize structures.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Course Selection list */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-xs uppercase tracking-wider mb-2 text-slate-400">Select Course</h3>
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {courses.map((course) => (
              <button
                key={course.course_id}
                onClick={() => setSelectedCourse(course)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all text-xs font-bold ${
                  selectedCourse && selectedCourse.course_id === course.course_id
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                }`}
              >
                <div className="font-mono text-[9px] uppercase opacity-75 mb-1">{course.course_code}</div>
                <div className="truncate">{course.course_title}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Curriculum Structure Visualization */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm lg:col-span-3 space-y-6">
          {selectedCourse ? (
            <>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-850">
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/10 font-mono mr-2">
                    {selectedCourse.course_code}
                  </span>
                  <h3 className="inline text-base font-black text-slate-850 dark:text-white align-middle">{selectedCourse.course_title}</h3>
                  <p className="text-[11px] text-slate-400 mt-1">Syllabus structure by semester</p>
                </div>
                <button
                  onClick={handleOpenAdd}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer whitespace-nowrap"
                >
                  <Plus size={14} />
                  <span>Map Subject</span>
                </button>
              </div>

              {Object.keys(semesterGroups).length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  No subjects have been mapped to this course curriculum yet. Click "Map Subject" to begin.
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {Object.keys(semesterGroups)
                    .sort((a, b) => parseInt(a) - parseInt(b))
                    .map((sem) => (
                      <div key={sem} className="relative pl-12 space-y-3">
                        {/* Timeline semester node */}
                        <div className="absolute left-3.5 top-1 h-5 w-5 rounded-full bg-emerald-600 border-4 border-white dark:border-slate-900 flex items-center justify-center font-bold text-[9px] text-white"></div>
                        <h4 className="font-extrabold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Semester {sem}</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {semesterGroups[sem].map((mapItem) => (
                            <div
                              key={mapItem.mapping_id}
                              className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl flex justify-between items-center text-xs"
                            >
                              <div>
                                <span className="font-mono text-[9px] text-slate-400 uppercase block font-bold mb-0.5">
                                  {mapItem.subject_code}
                                </span>
                                <span className="font-black text-slate-850 dark:text-slate-200">
                                  {mapItem.subject_name}
                                </span>
                                <span className="text-[10px] text-slate-400 block mt-1">
                                  Credits: <span className="font-bold text-emerald-500">{mapItem.credits || 0}</span>
                                </span>
                              </div>
                              <button
                                onClick={() => handleDelete(mapItem.mapping_id)}
                                className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-red-500 hover:text-white rounded-lg text-red-500 transition-all cursor-pointer inline-flex"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-center py-12 text-xs text-slate-400">Loading courses...</p>
          )}
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
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Map Subject to Course</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Course Profile</label>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl font-bold text-slate-800 dark:text-white">
                  {selectedCourse?.course_title} ({selectedCourse?.course_code})
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Select Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                  required
                >
                  <option value="">-- Choose Subject --</option>
                  {availableSubjects.map(s => (
                    <option key={s.subject_id} value={s.subject_id}>
                      {s.subject_name} ({s.subject_code} - Sem {s.semester})
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
                Map Subject
              </button>
            </div>
          </form>
        </div>
      )}
    </motion.div>
  );
};

export default CourseSubjectMapping;
