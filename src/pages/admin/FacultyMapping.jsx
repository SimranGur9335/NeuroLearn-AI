import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Search, 
  Users, 
  BookOpen, 
  Layers, 
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { apiFetch } from '../../services/api';
import { useBranding } from '../../context/BrandingContext';

const FacultyMapping = () => {
  const [faculty, setFaculty] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // CRUD state variables
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [targetMapping, setTargetMapping] = useState(null);

  const { branding } = useBranding() || {};

  // Form states
  const [facultyId, setFacultyId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [classId, setClassId] = useState("");
  const [academicYear, setAcademicYear] = useState("2026-27");

  useEffect(() => {
    if (branding?.academicYear) {
      setAcademicYear(branding.academicYear);
    }
  }, [branding?.academicYear]);

  useEffect(() => {
    setIsLoading(true);
    
    const fetchDependencies = async () => {
      try {
        const [facRes, subRes, classRes] = await Promise.all([
          apiFetch("/faculty"),
          apiFetch("/subjects"),
          apiFetch("/classes")
        ]);

        if (facRes.ok) {
          const facData = await facRes.json();
          setFaculty(facData);
          if (facData.length > 0) setFacultyId(facData[0].faculty_id.toString());
        }

        if (subRes.ok) {
          const subData = await subRes.json();
          setSubjects(subData);
          if (subData.length > 0) setSubjectId(subData[0].subject_id.toString());
        }

        if (classRes.ok) {
          const classData = await classRes.json();
          setClasses(classData);
          if (classData.length > 0) setClassId(classData[0].class_id.toString());
        }

        await loadMappings();
      } catch (err) {
        console.error("Error loading dependencies:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDependencies();
  }, []);

  const loadMappings = async () => {
    try {
      const response = await apiFetch("/faculty-mapping");
      if (!response.ok) {
        throw new Error("Failed to load mappings");
      }
      const data = await response.json();
      setMappings(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAdd = () => {
    if (faculty.length > 0) setFacultyId(faculty[0].faculty_id.toString());
    if (subjects.length > 0) setSubjectId(subjects[0].subject_id.toString());
    if (classes.length > 0) setClassId(classes[0].class_id.toString());
    setAcademicYear(branding?.academicYear || "2026-27");
    setShowAddModal(true);
  };

  const handleOpenEdit = (mapping) => {
    setTargetMapping(mapping);
    setFacultyId(mapping.faculty_id?.toString() || "");
    setSubjectId(mapping.subject_id?.toString() || "");
    setClassId(mapping.class_id?.toString() || "");
    setAcademicYear(mapping.academic_year || "");
    setShowEditModal(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (!facultyId || !subjectId || !classId || !academicYear.trim()) {
      alert("All fields are required to assign faculty!");
      return;
    }

    try {
      const res = await apiFetch(
        "/faculty-mapping",
        {
          method: "POST",
          body: JSON.stringify({
            faculty_id: Number(facultyId),
            subject_id: Number(subjectId),
            class_id: Number(classId),
            academic_year: academicYear
          })
        }
      );

      if (!res.ok) {
        throw new Error("Failed to save assignment. Double check selection details.");
      }

      await loadMappings();
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
      alert(err.message || "An error occurred while saving the assignment.");
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!facultyId || !subjectId || !classId || !academicYear.trim()) {
      alert("All fields are required!");
      return;
    }

    try {
      const res = await apiFetch(
        `/faculty-mapping/${targetMapping.mapping_id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            faculty_id: Number(facultyId),
            subject_id: Number(subjectId),
            class_id: Number(classId),
            academic_year: academicYear
          })
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update mapping assignment.");
      }

      await loadMappings();
      setShowEditModal(false);
      setTargetMapping(null);
    } catch (err) {
      console.error(err);
      alert(err.message || "An error occurred while updating the assignment.");
    }
  };

  const handleDelete = async (mappingId) => {
    if (!window.confirm("Are you sure you want to delete this faculty mapping assignment?")) {
      return;
    }

    try {
      const res = await apiFetch(
        `/faculty-mapping/${mappingId}`,
        {
          method: "DELETE"
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete mapping assignment.");
      }
      
      await loadMappings();
    } catch (err) {
      console.error(err);
      alert(err.message || "An error occurred while deleting the assignment.");
    }
  };

  const filteredMappings = mappings.filter(m => {
    const facultyName = m.faculty_name || "";
    const subjectName = m.subject_name || "";
    const className = m.class_name || "";
    return (
      facultyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      className.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
          <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Faculty & LMS Oversight</p>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white font-sans">Faculty Curriculum Assignments</h2>
          <p className="text-slate-500 text-xs mt-1">Map faculty professors to academic subjects and classroom divisions.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer self-start md:self-auto transition-all duration-200 hover:shadow-emerald-600/20 hover:scale-[1.02]"
        >
          <Plus size={16} />
          <span>Assign New Faculty</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Mappings</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{mappings.length}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Faculty</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mt-0.5">
              {new Set(mappings.map(m => m.faculty_id).filter(Boolean)).size}
            </h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-pink-500/10 text-pink-500 rounded-xl">
            <BookOpen size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Subjects</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mt-0.5">
              {new Set(mappings.map(m => m.subject_id).filter(Boolean)).size}
            </h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Layers size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class Divisions</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mt-0.5">
              {new Set(mappings.map(m => m.class_id).filter(Boolean)).size}
            </h3>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-3 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl w-full md:w-80 focus-within:ring-2 focus-within:ring-emerald-500/50">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search faculty name, subject, or class..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none w-full text-xs"
          />
        </div>
      </div>

      {/* Assignments Table Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-12 text-center text-slate-450 dark:text-slate-400 font-bold animate-pulse text-xs">
              Loading current curriculum assignments...
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[9px] tracking-wider bg-slate-50/50 dark:bg-slate-950/20">
                  <th className="py-4 pl-5">Faculty Member</th>
                  <th className="py-4">Subject Assignment</th>
                  <th className="py-4 text-center">Class Division</th>
                  <th className="py-4 text-center">Academic Year</th>
                  <th className="py-4 text-right pr-5">Oversight Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredMappings.map((mapping) => (
                  <tr key={mapping.mapping_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 pl-5 font-bold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-[10px]">
                          {mapping.faculty_name
                            ? mapping.faculty_name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase()
                            : 'F'}
                        </div>
                        <span>{mapping.faculty_name || "Unknown Faculty"}</span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-350 font-medium">
                      <div className="flex items-center gap-1.5">
                        <BookOpen size={14} className="text-slate-400" />
                        <span>{mapping.subject_name || "No Subject Assigned"}</span>
                      </div>
                    </td>
                    <td className="py-4 text-center text-slate-500 dark:text-slate-400">
                      <span className="bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200/40 dark:border-slate-700/40 font-bold">
                        {mapping.class_name || "N/A"}
                      </span>
                    </td>
                    <td className="py-4 text-center text-slate-500 font-mono font-bold dark:text-slate-400">
                      {mapping.academic_year}
                    </td>
                    <td className="py-4 text-right pr-5 space-x-1.5">
                      <button
                        onClick={() => handleOpenEdit(mapping)}
                        className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer inline-flex items-center"
                        title="Edit Mapping Assignment"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(mapping.mapping_id)}
                        className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-red-500 hover:text-white rounded-lg text-red-500 transition-all cursor-pointer inline-flex items-center"
                        title="Revoke Assignment"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredMappings.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400 font-bold">
                      No faculty mappings or teaching assignments registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* CRUD Overlay Modals */}
      <AnimatePresence>
        {/* Add Assignment Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.form
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onSubmit={handleSaveAdd}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Sparkles size={16} className="text-emerald-500" />
                  Assign Faculty
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Faculty selector */}
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Faculty Member</label>
                  {faculty.length === 0 ? (
                    <div className="flex items-center gap-1.5 p-2 bg-amber-500/10 border border-amber-500/25 text-amber-600 rounded-xl text-[10px] font-bold">
                      <AlertTriangle size={14} />
                      <span>No faculty found. Add faculty in User Directory first.</span>
                    </div>
                  ) : (
                    <select
                      value={facultyId}
                      onChange={(e) => setFacultyId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 font-bold"
                    >
                      {faculty.map(item => (
                        <option key={item.faculty_id} value={item.faculty_id}>{item.full_name}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Subject selector */}
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Syllabus Subject</label>
                  {subjects.length === 0 ? (
                    <div className="flex items-center gap-1.5 p-2 bg-amber-500/10 border border-amber-500/25 text-amber-600 rounded-xl text-[10px] font-bold">
                      <AlertTriangle size={14} />
                      <span>No subjects found. Add subjects in Subject Hub first.</span>
                    </div>
                  ) : (
                    <select
                      value={subjectId}
                      onChange={(e) => setSubjectId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                    >
                      {subjects.map(item => (
                        <option key={item.subject_id} value={item.subject_id}>[{item.subject_code}] {item.subject_name}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Class selector */}
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Classroom Division</label>
                  {classes.length === 0 ? (
                    <div className="flex items-center gap-1.5 p-2 bg-amber-500/10 border border-amber-500/25 text-amber-600 rounded-xl text-[10px] font-bold">
                      <AlertTriangle size={14} />
                      <span>No class divisions found. Create courses/divisions first.</span>
                    </div>
                  ) : (
                    <select
                      value={classId}
                      onChange={(e) => setClassId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 font-bold"
                    >
                      {classes.map(item => (
                        <option key={item.class_id} value={item.class_id}>{item.class_name} ({item.department})</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Academic Year input */}
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Academic Year / Term</label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="e.g. 2026-27"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={faculty.length === 0 || subjects.length === 0 || classes.length === 0}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Assign Faculty
                </button>
              </div>
            </motion.form>
          </div>
        )}

        {/* Edit Assignment Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.form
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onSubmit={handleSaveEdit}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Edit size={15} className="text-emerald-500" />
                  Modify Mapping
                </h3>
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setTargetMapping(null); }}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Faculty selector */}
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Faculty Member</label>
                  <select
                    value={facultyId}
                    onChange={(e) => setFacultyId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 font-bold"
                  >
                    {faculty.map(item => (
                      <option key={item.faculty_id} value={item.faculty_id}>{item.full_name}</option>
                    ))}
                  </select>
                </div>

                {/* Subject selector */}
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Syllabus Subject</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                  >
                    {subjects.map(item => (
                      <option key={item.subject_id} value={item.subject_id}>[{item.subject_code}] {item.subject_name}</option>
                    ))}
                  </select>
                </div>

                {/* Class selector */}
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Classroom Division</label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 font-bold"
                  >
                    {classes.map(item => (
                      <option key={item.class_id} value={item.class_id}>{item.class_name} ({item.department})</option>
                    ))}
                  </select>
                </div>

                {/* Academic Year input */}
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Academic Year / Term</label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setTargetMapping(null); }}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FacultyMapping;