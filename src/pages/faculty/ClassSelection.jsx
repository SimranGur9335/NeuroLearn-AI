import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, GraduationCap, ArrowRight, LogOut, Sparkles, Layers, BookMarked, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../services/api';

const ClassSelection = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [facultyInfo, setFacultyInfo] = useState(null);
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const email = user?.email || "";

    useEffect(() => {
        const fetchFacultyAndClasses = async () => {
            if (!email) {
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                // 1. Fetch faculty details by email
                const facultyRes = await apiFetch(`/faculty/by-email/${email}`);
                if (!facultyRes.ok) {
                    throw new Error(`Failed to load faculty profile (Status: ${facultyRes.status})`);
                }
                const facultyData = await facultyRes.json();
                setFacultyInfo(facultyData);

                // 2. Fetch classes assigned to this faculty
                const classesRes = await apiFetch(`/faculty/${facultyData.faculty_id}/classes`);
                if (!classesRes.ok) {
                    throw new Error(`Failed to load assigned classes (Status: ${classesRes.status})`);
                }
                const classesData = await classesRes.json();
                setClasses(classesData);
            } catch (err) {
                console.error("Error fetching faculty workspaces:", err);
                setError(err.message || "An error occurred while loading your workspaces.");
            } finally {
                setLoading(false);
            }
        };

        fetchFacultyAndClasses();
    }, [email]);

    const handleSelect = (cls) => {
        // Save to both key names for absolute compatibility across different versions of faculty components
        localStorage.setItem("selectedClass", JSON.stringify(cls));
        localStorage.setItem("current_class", JSON.stringify(cls));
        navigate('/faculty/dashboard');
    };

    const handleLogoutClick = () => {
        logout();
        navigate('/login');
    };

    // Container Framer Motion variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300 relative overflow-hidden">
            {/* Ambient decorative background glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-900/10 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 dark:bg-emerald-900/10 rounded-full blur-[150px] pointer-events-none -z-10" />

            {/* Navigation Header */}
            <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-50 transition-colors">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30">
                            <Sparkles size={20} className="animate-pulse" />
                        </div>
                        <div>
                            <span className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500 dark:from-purple-400 dark:to-indigo-300">
                                NeuroLearn AI
                            </span>
                            <span className="text-[10px] block font-bold text-slate-400 uppercase tracking-wider -mt-1">
                                Portal Suite
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col text-right">
                            <span className="font-bold text-sm text-slate-700 dark:text-slate-200">
                                {facultyInfo?.full_name || user?.name || "Faculty Member"}
                            </span>
                            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                                {facultyInfo?.designation || "Educator"}
                            </span>
                        </div>

                        {user?.avatar && (
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-xl shadow-inner">
                                {user.avatar}
                            </div>
                        )}

                        <button
                            onClick={handleLogoutClick}
                            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-all cursor-pointer"
                            title="Log Out"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Hero / Greeting Section */}
                <div className="mb-12">
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-purple-600 dark:text-purple-400 font-extrabold uppercase tracking-wider text-xs bg-purple-500/10 px-3.5 py-1.5 rounded-full inline-block mb-3 border border-purple-500/20"
                    >
                        Academic Year 2026-2027
                    </motion.p>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black tracking-tight text-slate-950 dark:text-white"
                    >
                        Welcome Back, {facultyInfo?.full_name?.split(" ")[0] || user?.name?.split(" ")[0] || "Professor"}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-550 dark:text-slate-400 mt-4 max-w-3xl text-sm md:text-base leading-relaxed"
                    >
                        Select a teaching workspace below to access course telemetry, record attendance,
                        manage assignments, update early-warning risk predictions, and run AI academic tools.
                    </motion.p>
                </div>

                {/* KPI/Profile Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <motion.div
                        whileHover={{ y: -4 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/85 dark:border-slate-800/85 shadow-sm flex items-center gap-4 transition-all"
                    >
                        <div className="p-3.5 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 shrink-0">
                            <Layers size={24} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-extrabold uppercase tracking-wider">Assigned Workspaces</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                                {loading ? "..." : classes.length}
                            </h3>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -4 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/85 dark:border-slate-800/85 shadow-sm flex items-center gap-4 transition-all"
                    >
                        <div className="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                            <BookMarked size={24} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-extrabold uppercase tracking-wider">Department</p>
                            <h3 className="text-lg font-black text-slate-850 dark:text-white mt-1 line-clamp-1">
                                {loading ? "..." : (facultyInfo?.department || "Computer Engineering")}
                            </h3>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -4 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/85 dark:border-slate-800/85 shadow-sm flex items-center gap-4 transition-all"
                    >
                        <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                            <UserCheck size={24} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-extrabold uppercase tracking-wider">Teaching Role</p>
                            <h3 className="text-lg font-black text-slate-850 dark:text-white mt-1 line-clamp-1">
                                {loading ? "..." : (facultyInfo?.designation || "Faculty Educator")}
                            </h3>
                        </div>
                    </motion.div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-800/80 mb-12" />

                {/* Heading for selection */}
                <div className="flex items-center gap-3 mb-8">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        Your Active Teaching Workspaces
                    </h2>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {classes.length} Courses
                    </span>
                </div>

                {/* Main Content Area */}
                {loading ? (
                    /* Beautiful Glassmorphism Loading Skeleton */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5 animate-pulse">
                                <div className="flex justify-between items-center">
                                    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                                    <div className="w-16 h-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4" />
                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/2" />
                                </div>
                                <div className="h-1 bg-slate-100 dark:bg-slate-800/50 my-2" />
                                <div className="space-y-2">
                                    <div className="flex justify-between"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" /><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" /></div>
                                    <div className="flex justify-between"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" /><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" /></div>
                                </div>
                                <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-full mt-4" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    /* Error State Component */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-8 rounded-3xl bg-red-500/10 border border-red-500/20 text-center max-w-xl mx-auto my-10 space-y-4"
                    >
                        <div className="mx-auto w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 text-2xl font-bold">
                            ⚠️
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Workspace Loading Failed</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            {error}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs cursor-pointer transition-all shadow-md shadow-red-500/25"
                        >
                            Retry Loading
                        </button>
                    </motion.div>
                ) : classes.length === 0 ? (
                    /* Empty Workspace State */
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl mx-auto space-y-5"
                    >
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto text-3xl">
                            📚
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Classes Assigned</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
                            We couldn't find any teaching classes mapped to your profile. Please contact the Academic Administrator or Registrar's Office to configure your course mappings in the ERP.
                        </p>
                        <button
                            onClick={handleLogoutClick}
                            className="mt-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3 rounded-xl text-xs cursor-pointer transition-all"
                        >
                            Back to Sign In
                        </button>
                    </motion.div>
                ) : (
                    /* Beautiful Animated Workspaces Grid */
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
                    >
                        {classes.map((cls) => {
                            // Assign beautiful color themes to different roles dynamically
                            const isTheory = cls.role?.toLowerCase() === 'theory';
                            const isPractical = cls.role?.toLowerCase() === 'practical' || cls.role?.toLowerCase() === 'lab';
                            const isProject = cls.role?.toLowerCase()?.includes('project') || cls.role?.toLowerCase()?.includes('guide');
                            
                            let themeColorClass = "bg-purple-500/10 text-purple-600 dark:text-purple-400";
                            if (isTheory) themeColorClass = "bg-purple-500/10 text-purple-600 dark:text-purple-400";
                            else if (isPractical) themeColorClass = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
                            else if (isProject) themeColorClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400";

                            return (
                                <motion.div
                                    variants={itemVariants}
                                    whileHover={{ y: -6, scale: 1.015, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)" }}
                                    key={`${cls.class_id}-${cls.subject_id}`}
                                    onClick={() => handleSelect(cls)}
                                    className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/85 rounded-3xl p-6 cursor-pointer hover:border-purple-500/40 dark:hover:border-purple-500/30 shadow-sm transition-all flex flex-col justify-between h-[300px] relative overflow-hidden group"
                                >
                                    {/* Inner decorative light on hover */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-radial-gradient(circle,rgba(168,85,247,0.06)_0%,transparent_70%) pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity duration-300" />

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className={`p-3 rounded-2xl ${themeColorClass} transition-colors`}>
                                                <BookOpen size={22} />
                                            </div>
                                            <span className="text-[10px] px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                                                Active
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                {cls.subject_name}
                                            </h2>
                                            <p className="text-slate-400 dark:text-slate-400 text-sm font-semibold flex items-center gap-1">
                                                <span>Class:</span>
                                                <span className="text-slate-800 dark:text-slate-200">{cls.class_name}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mt-4">
                                        <div className="h-px bg-slate-100 dark:bg-slate-800/60" />

                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <span className="text-slate-400 font-bold uppercase text-[9px] block tracking-wider">Delivery Mode</span>
                                                <span className="font-extrabold text-slate-700 dark:text-slate-300 block mt-0.5">
                                                    {cls.role || "Theory"}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 font-bold uppercase text-[9px] block tracking-wider">Academic Term</span>
                                                <span className="font-extrabold text-slate-700 dark:text-slate-300 block mt-0.5">
                                                    Semester 5
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            className="w-full bg-slate-900 hover:bg-purple-600 dark:bg-slate-800 dark:hover:bg-purple-600 text-white py-3.5 rounded-2xl font-extrabold flex items-center justify-center gap-2 transition-all text-xs cursor-pointer shadow-sm group-hover:shadow-md group-hover:shadow-purple-500/10"
                                        >
                                            Open Workspace
                                            <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </main>
        </div>
    );
};

export default ClassSelection;