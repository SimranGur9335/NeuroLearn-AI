import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  Sparkles,
  BookOpen,
  Award,
  Users
} from 'lucide-react';
import { apiFetch } from '../../services/api';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    apiFetch("/courses")
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch((err) => console.error(err));

    apiFetch("/departments")
      .then((res) => res.json())
      .then((data) => setDepartments(data))
      .catch((err) => console.error(err));
  }, []);

  // CRUD modal variables
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [targetCourse, setTargetCourse] = useState(null);

  // Form states
  const [formCode, setFormCode] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDept, setFormDept] = useState("CS");
  const [formCategory, setFormCategory] = useState("AI/ML");
  const [formDuration, setFormDuration] = useState("40 Hours");

  const handleOpenAdd = () => {
    setFormCode("");
    setFormTitle("");
    setFormDept("CS");
    setFormCategory("AI/ML");
    setFormDuration("40 Hours");
    setShowAddModal(true);
  };

  const handleOpenEdit = (course) => {
    setTargetCourse(course);
    setFormCode(course.course_code);
    setFormTitle(course.course_title);
    setFormDept(course.department);
    setFormCategory(course.category);
    setFormDuration(course.duration);
    setShowEditModal(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();

    try {
      await apiFetch(
        "/courses",
        {
          method: "POST",
          body: JSON.stringify({
            course_code: formCode,
            course_title: formTitle,
            department: formDept,
            category: formCategory,
            duration: formDuration
          })
        }
      );

      const response = await apiFetch("/courses");
      const data = await response.json();
      setCourses(data);
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();

    try {
      await apiFetch(
        `/courses/${targetCourse.course_id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            course_code: formCode,
            course_title: formTitle,
            department: formDept,
            category: formCategory,
            duration: formDuration
          })
        }
      );

      const response = await apiFetch("/courses");
      const data = await response.json();
      setCourses(data);
      setShowEditModal(false);
      setTargetCourse(null);
    }
    catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm("Delete this course?"))
      return;

    try {
      await apiFetch(`/courses/${courseId}`, { method: "DELETE" });
      const response = await apiFetch("/courses");
      const data = await response.json();
      setCourses(data);
    } catch (err) {
      console.error(err);
    }
  };

  const getDeptList = () => {
    return departments.length > 0 ? departments.map(d => d.department_code) : ["CS", "IT"];
  };

  const filteredCourses = courses.filter(course =>
    course.course_title
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||

    course.course_code
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
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
          <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider">LMS Management</p>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white font-sans">Curriculum Catalogue Master</h2>
          <p className="text-slate-500 text-xs mt-1">Configure study syllabi, map course categories, and track enrollments.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer self-start md:self-auto"
        >
          <Plus size={16} />
          <span>Publish New Course</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-3 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-2 rounded-xl w-full md:w-80 focus-within:ring-2 focus-within:ring-emerald-500/50">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search course title or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-slate-700 dark:text-slate-250 placeholder-slate-400 focus:outline-none w-full text-xs"
          />
        </div>
      </div>

      {/* Courses Catalog Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.course_id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[200px]"
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] font-black uppercase text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/10">
                  {course.course_code}
                </span>
                <span className="text-[10px] font-bold text-slate-850">{course.duration}</span>
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base leading-snug">{course.course_title}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-1">Department: {course.department} • Category: {course.category}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Users size={14} />
                <span className="font-bold">{course.enrollment_count} Enrolled</span>
              </div>

              <div className="space-x-1 flex">
                <button
                  onClick={() => handleOpenEdit(course)}
                  className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-500 hover:text-slate-805 dark:hover:text-white transition-all cursor-pointer"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => handleDelete(course.course_id)}
                  className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-red-500 hover:text-white rounded-lg text-red-500 transition-all cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CRUD Modals */}
      {/* Add Course */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveAdd}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Publish Course Curriculum</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Course Code</label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="e.g. CEN-308"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Course Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Distributed Database Systems"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Department</label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                  >
                    {getDeptList().map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                  >
                    {["AI/ML", "Cybersecurity", "Full Stack", "DevOps", "Cloud", "Data Science", "Hardware", "Electrical", "Mechanical"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Duration</label>
                <input
                  type="text"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  placeholder="e.g. 45 Hours"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
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
                Publish Course
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Course */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Modify Course Specifications</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Course Code</label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Course Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Department</label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                  >
                    {getDeptList().map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                  >
                    {["AI/ML", "Cybersecurity", "Full Stack", "DevOps", "Cloud", "Data Science", "Hardware", "Electrical", "Mechanical"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Duration</label>
                <input
                  type="text"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => { setShowEditModal(false); setTargetCourse(null); }}
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

export default CourseManagement;
