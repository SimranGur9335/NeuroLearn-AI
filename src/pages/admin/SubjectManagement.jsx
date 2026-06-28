import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Edit,
    Trash2,
    X,
    Search,
    Users,
    Settings,
    Save,
    AlertTriangle
} from 'lucide-react';
import { apiFetch } from '../../services/api';

const SubjectManagement = () => {
    const [subjects, setSubjects] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        apiFetch("/subjects")
            .then((res) => res.json())
            .then((data) => setSubjects(data))
            .catch((err) => console.error(err));

        apiFetch("/departments")
            .then((res) => res.json())
            .then((data) => setDepartments(data))
            .catch((err) => console.error(err));
    }, []);

    // CRUD modal variables
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [targetSubject, setTargetSubject] = useState(null);

    // Form states
    const [formCode, setFormCode] = useState("");
    const [formName, setFormName] = useState("");
    const [formCredits, setFormCredits] = useState(4);
    const [formSemester, setFormSemester] = useState(5);
    const [formDept, setFormDept] = useState("CS");

    // Assessment template & structure states
    const [showAssessmentsModal, setShowAssessmentsModal] = useState(false);
    const [selectedSubjectForAssessments, setSelectedSubjectForAssessments] = useState(null);
    const [academicYear, setAcademicYear] = useState("2026-2027");
    const [assessmentComponents, setAssessmentComponents] = useState([]);

    const handleOpenAssessments = async (subject) => {
        setSelectedSubjectForAssessments(subject);
        setAcademicYear("2026-2027");
        try {
            const res = await apiFetch(`/api/v1/subjects/${subject.subject_id}/assessments?academic_year=2026-2027`);
            if (res.ok) {
                const data = await res.json();
                setAssessmentComponents(data.length > 0 ? data : [
                    { name: "Assignment", category: "INTERNAL", max_marks: 25, weightage: 25, display_order: 1, is_mandatory: true, visible_to_students: true, editable_by_faculty: true },
                    { name: "Quiz", category: "INTERNAL", max_marks: 25, weightage: 25, display_order: 2, is_mandatory: true, visible_to_students: true, editable_by_faculty: true },
                    { name: "Internal Exam", category: "INTERNAL", max_marks: 25, weightage: 25, display_order: 3, is_mandatory: true, visible_to_students: true, editable_by_faculty: true },
                    { name: "Practical Lab", category: "EXTERNAL", max_marks: 25, weightage: 25, display_order: 4, is_mandatory: true, visible_to_students: true, editable_by_faculty: true }
                ]);
            }
        } catch (err) {
            console.error(err);
        }
        setShowAssessmentsModal(true);
    };

    const handleAcademicYearChange = async (year) => {
        setAcademicYear(year);
        if (!selectedSubjectForAssessments) return;
        try {
            const res = await apiFetch(`/api/v1/subjects/${selectedSubjectForAssessments.subject_id}/assessments?academic_year=${year}`);
            if (res.ok) {
                const data = await res.json();
                setAssessmentComponents(data.length > 0 ? data : [
                    { name: "Assignment", category: "INTERNAL", max_marks: 25, weightage: 25, display_order: 1, is_mandatory: true, visible_to_students: true, editable_by_faculty: true },
                    { name: "Quiz", category: "INTERNAL", max_marks: 25, weightage: 25, display_order: 2, is_mandatory: true, visible_to_students: true, editable_by_faculty: true },
                    { name: "Internal Exam", category: "INTERNAL", max_marks: 25, weightage: 25, display_order: 3, is_mandatory: true, visible_to_students: true, editable_by_faculty: true },
                    { name: "Practical Lab", category: "EXTERNAL", max_marks: 25, weightage: 25, display_order: 4, is_mandatory: true, visible_to_students: true, editable_by_faculty: true }
                ]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveAssessments = async () => {
        if (assessmentComponents.length === 0) {
            alert("Please add at least one assessment component.");
            return;
        }
        for (let comp of assessmentComponents) {
            if (!comp.name.trim()) {
                alert("Component Name cannot be empty.");
                return;
            }
            if (Number(comp.max_marks) <= 0) {
                alert(`Max Marks for ${comp.name} must be greater than 0.`);
                return;
            }
            if (Number(comp.weightage) <= 0) {
                alert(`Weightage for ${comp.name} must be greater than 0.`);
                return;
            }
        }

        try {
            const response = await apiFetch(
                `/api/v1/subjects/${selectedSubjectForAssessments.subject_id}/assessments`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        academic_year: academicYear,
                        components: assessmentComponents.map((c, idx) => ({
                            name: c.name,
                            category: c.category,
                            max_marks: Number(c.max_marks),
                            weightage: Number(c.weightage),
                            display_order: idx + 1,
                            is_mandatory: !!c.is_mandatory,
                            visible_to_students: !!c.visible_to_students,
                            editable_by_faculty: !!c.editable_by_faculty
                        }))
                    })
                }
            );
            if (response.ok) {
                setShowAssessmentsModal(false);
                setSelectedSubjectForAssessments(null);
                alert("Assessment structure updated successfully!");
            } else {
                const errData = await response.json();
                alert(`Error: ${errData.detail || "Unknown error"}`);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to save assessment structure.");
        }
    };

    const handleOpenAdd = () => {
        setFormCode("");
        setFormName("");
        setFormCredits(4);
        setFormSemester(5);
        setFormDept("CS");

        setShowAddModal(true);
    };

    const handleOpenEdit = (subject) => {
        setTargetSubject(subject);
        setFormCode(subject.subject_code);
        setFormName(subject.subject_name);
        setFormDept(subject.department);
        setFormSemester(subject.semester);
        setFormCredits(subject.credits);
        setShowEditModal(true);
    };

    const handleSaveAdd = async (e) => {
        e.preventDefault();

        try {
            await apiFetch(
                "/subjects",
                {
                    method: "POST",
                    body: JSON.stringify({
                        subject_code: formCode,
                        subject_name: formName,
                        department: formDept,
                        semester: formSemester,
                        credits: formCredits
                    })
                }
            );

            const response = await apiFetch("/subjects");
            const data = await response.json();
            setSubjects(data);
            setShowAddModal(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();

        try {
            await apiFetch(
                `/subjects/${targetSubject.subject_id}`,
                {
                    method: "PUT",
                    body: JSON.stringify({
                        subject_code: formCode,
                        subject_name: formName,
                        department: formDept,
                        semester: formSemester,
                        credits: formCredits
                    })
                }
            );

            const response = await apiFetch("/subjects");
            const data = await response.json();
            setSubjects(data);
            setShowEditModal(false);
            setTargetSubject(null);
        }
        catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (subjectId) => {
        if (!window.confirm("Delete this subject?"))
            return;

        try {
            await apiFetch(
                `/subjects/${subjectId}`,
                {
                    method: "DELETE"
                }
            );

            const response = await apiFetch("/subjects");
            const data = await response.json();
            setSubjects(data);
        } catch (err) {
            console.error(err);
        }
    };

    const getDeptList = () => {
        return departments.length > 0 ? departments.map(d => d.department_code) : ["CS", "IT"];
    };

    const filteredSubjects = subjects.filter(subject =>
        subject.subject_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||

        subject.subject_code
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
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white font-sans">Subject Management Center  </h2>
                    <p className="text-slate-500 text-xs mt-1">Configure study syllabi, map subject categories, and track enrollments.</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer self-start md:self-auto"
                >
                    <Plus size={16} />
                    <span>Publish New Subject</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-3 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-2 rounded-xl w-full md:w-80 focus-within:ring-2 focus-within:ring-emerald-500/50">
                    <Search size={16} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search subject title or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none text-slate-700 dark:text-slate-250 placeholder-slate-400 focus:outline-none w-full text-xs"
                    />
                </div>
            </div>

            {/* Subjects Catalog Grid List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSubjects.map((subject) => (
                    <div
                        key={subject.subject_id}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[200px]"
                    >
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[9px] font-black uppercase text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/10">
                                    {subject.subject_code}
                                </span>
                                <span className="text-[10px] text-slate-450 font-semibold">{subject.semester}</span>
                            </div>
                            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base leading-snug">{subject.subject_name}</h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-1">Department: {subject.department} • Semester: {subject.semester} • Credits: {subject.credits}</p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-xs">
                            <div className="flex items-center gap-1.5 text-slate-400">
                                <Users size={14} />
                                <span className="font-bold">
                                    {subject.credits} Credits
                                </span>
                            </div>

                            <div className="space-x-1 flex">
                                <button
                                    onClick={() => handleOpenAssessments(subject)}
                                    className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-indigo-600 hover:text-white rounded-lg text-indigo-500 transition-all cursor-pointer"
                                    title="Configure Gradebook Structure"
                                >
                                    <Settings size={14} />
                                </button>
                                <button
                                    onClick={() => handleOpenEdit(subject)}
                                    className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-500 hover:text-slate-805 dark:hover:text-white transition-all cursor-pointer"
                                >
                                    <Edit size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(subject.subject_id)}
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
            {/* Add Subject */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form
                        onSubmit={handleSaveAdd}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4"
                    >
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
                            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Publish Subject Curriculum</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Subject Code</label>
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
                                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Subject Title</label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
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
                                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Semester</label>
                                    <select
                                        value={formSemester}
                                        onChange={(e) => setFormSemester(Number(e.target.value))}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                            <option key={sem} value={sem}>
                                                Semester {sem}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Credits</label>
                                <input
                                    type="number"
                                    value={formCredits}
                                    onChange={(e) => setFormCredits(Number(e.target.value))}
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
                                Publish Subject
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Edit Subject */}
            {showEditModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form
                        onSubmit={handleSaveEdit}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4"
                    >
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
                            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Modify Subject Specifications</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Subject Code</label>
                                <input
                                    type="text"
                                    value={formCode}
                                    onChange={(e) => setFormCode(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 font-mono"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Subject Title</label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
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
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                                    >
                                        {getDeptList().map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Semester</label>
                                    <select
                                        value={formSemester}
                                        onChange={(e) => setFormSemester(Number(e.target.value))}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                            <option key={sem} value={sem}>
                                                Semester {sem}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Credits</label>
                                <input
                                    type="number"
                                    value={formCredits}
                                    onChange={(e) => setFormCredits(Number(e.target.value))}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-3">
                            <button
                                type="button"
                                onClick={() => { setShowEditModal(false); setTargetSubject(null); }}
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
            {/* Assessment Structure Modal */}
            {showAssessmentsModal && selectedSubjectForAssessments && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-4xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
                            <div>
                                <h3 className="font-extrabold text-base text-slate-850 dark:text-white">
                                    Configure Assessments: {selectedSubjectForAssessments.subject_name}
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Academic Year: {academicYear} • Semester {selectedSubjectForAssessments.semester} • Code: {selectedSubjectForAssessments.subject_code}
                                </p>
                            </div>
                            <button
                                onClick={() => { setShowAssessmentsModal(false); setSelectedSubjectForAssessments(null); }}
                                className="text-slate-400 hover:text-slate-650 dark:hover:text-white cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Top Controls: Academic Year */}
                        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-955 p-3 rounded-2xl border border-slate-100 dark:border-slate-850">
                            <div className="flex items-center gap-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Academic Year:</label>
                                <select
                                    value={academicYear}
                                    onChange={(e) => handleAcademicYearChange(e.target.value)}
                                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="2026-2027">2026-2027</option>
                                    <option value="2025-2026">2025-2026</option>
                                    <option value="2024-2025">2024-2025</option>
                                </select>
                            </div>
                            <span className="text-[11px] text-slate-600 font-medium">
                                Note: Changing year loads configured structure for that academic cycle.
                            </span>
                        </div>

                        {/* Component list builder */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Assessment Components</span>
                                <button
                                    type="button"
                                    onClick={() => setAssessmentComponents([
                                        ...assessmentComponents,
                                        { name: "", category: "INTERNAL", max_marks: 50, weightage: 20, display_order: assessmentComponents.length + 1, is_mandatory: true, visible_to_students: true, editable_by_faculty: true }
                                    ])}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold shadow cursor-pointer"
                                >
                                    <Plus size={12} />
                                    <span>Add Component</span>
                                </button>
                            </div>

                            <div className="border border-slate-200 dark:border-slate-855 rounded-2xl overflow-hidden text-xs">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-955 text-[10px] text-slate-450 uppercase font-black tracking-wider border-b border-slate-200 dark:border-slate-800">
                                            <th className="px-4 py-3">Component Name</th>
                                            <th className="px-4 py-3 w-32">Group / Type</th>
                                            <th className="px-4 py-3 w-32 text-right">Max Marks</th>
                                            <th className="px-4 py-3 w-32 text-right">Weightage %</th>
                                            <th className="px-4 py-3 text-center">Settings</th>
                                            <th className="px-4 py-3 text-center w-12">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-150 dark:divide-slate-850 bg-white dark:bg-slate-900">
                                        {assessmentComponents.map((comp, index) => (
                                            <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-855/20">
                                                {/* Name */}
                                                <td className="px-4 py-4">
                                                    <input
                                                        type="text"
                                                        value={comp.name}
                                                        onChange={(e) => {
                                                            const newComps = [...assessmentComponents];
                                                            newComps[index].name = e.target.value;
                                                            setAssessmentComponents(newComps);
                                                        }}
                                                        placeholder="e.g., Mid Sem, Quiz 1..."
                                                        className="w-full bg-slate-50  dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 "
                                                    />
                                                </td>

                                                {/* Category */}
                                                <td className="px-4 py-4">
                                                    <select
                                                        value={comp.category}
                                                        onChange={(e) => {
                                                            const newComps = [...assessmentComponents];
                                                            newComps[index].category = e.target.value;
                                                            setAssessmentComponents(newComps);
                                                        }}
                                                        className="w-full dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-250 font-bold"
                                                    >
                                                        <option value="INTERNAL">INTERNAL</option>
                                                        <option value="EXTERNAL">EXTERNAL</option>
                                                    </select>
                                                </td>

                                                {/* Max Marks */}
                                                <td className="px-4 py-2.5">
                                                    <input
                                                        type="number"
                                                        value={comp.max_marks}
                                                        onChange={(e) => {
                                                            const newComps = [...assessmentComponents];
                                                            newComps[index].max_marks = Number(e.target.value);
                                                            setAssessmentComponents(newComps);
                                                        }}
                                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-5 py-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-right text-slate-800 dark:text-slate-200" />
                                                </td>

                                                {/* Weightage */}
                                                <td className="px-4 py-2.5">
                                                    <input
                                                        type="number"
                                                        value={comp.weightage}
                                                        onChange={(e) => {
                                                            const newComps = [...assessmentComponents];
                                                            newComps[index].weightage = Number(e.target.value);
                                                            setAssessmentComponents(newComps);
                                                        }}
                                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-700 dark:border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-right text-slate-800 dark:text-slate-200"
                                                    />
                                                </td>

                                                {/* Boolean Toggles */}
                                                <td className="px-4 py-2.5">
                                                    <div className="flex items-center justify-center gap-4 text-[10px] font-bold">
                                                        <label className="flex items-center gap-1 select-none cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={!!comp.is_mandatory}
                                                                onChange={(e) => {
                                                                    const newComps = [...assessmentComponents];
                                                                    newComps[index].is_mandatory = e.target.checked;
                                                                    setAssessmentComponents(newComps);
                                                                }}
                                                                className="accent-indigo-600 rounded"
                                                            />
                                                            <span className="text-slate-500">Mandatory</span>
                                                        </label>

                                                        <label className="flex items-center gap-1 select-none cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={!!comp.visible_to_students}
                                                                onChange={(e) => {
                                                                    const newComps = [...assessmentComponents];
                                                                    newComps[index].visible_to_students = e.target.checked;
                                                                    setAssessmentComponents(newComps);
                                                                }}
                                                                className="accent-indigo-600 rounded"
                                                            />
                                                            <span className="text-slate-500">Visible</span>
                                                        </label>

                                                        <label className="flex items-center gap-1 select-none cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={!!comp.editable_by_faculty}
                                                                onChange={(e) => {
                                                                    const newComps = [...assessmentComponents];
                                                                    newComps[index].editable_by_faculty = e.target.checked;
                                                                    setAssessmentComponents(newComps);
                                                                }}
                                                                className="accent-indigo-600 rounded"
                                                            />
                                                            <span className="text-slate-500">Editable</span>
                                                        </label>
                                                    </div>
                                                </td>

                                                {/* Delete button */}
                                                <td className="px-4 py-2.5 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setAssessmentComponents(assessmentComponents.filter((_, idx) => idx !== index));
                                                        }}
                                                        className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md cursor-pointer transition-colors"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Weightage Calculation Summary & Warnings */}
                        {(() => {
                            const totalWeight = assessmentComponents.reduce((sum, c) => sum + Number(c.weightage || 0), 0);
                            const isNot100 = totalWeight !== 100;
                            return (
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-850">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                                            Total Weightage Summary:
                                        </span>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-black ${isNot100 ? "text-amber-600 bg-amber-500/10 border border-amber-500/20" : "text-emerald-600 bg-emerald-500/10 border border-emerald-500/20"}`}>
                                            {totalWeight}%
                                        </span>
                                    </div>
                                    {isNot100 && (
                                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500 text-[11px] font-bold">
                                            <AlertTriangle size={14} />
                                            <span>Warning: Combined weightage does not equal 100%. System will scale grades relatively.</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        {/* Bottom Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => { setShowAssessmentsModal(false); setSelectedSubjectForAssessments(null); }}
                                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveAssessments}
                                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs"
                            >
                                <Save size={14} />
                                <span>Save Assessment Structure</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default SubjectManagement;

