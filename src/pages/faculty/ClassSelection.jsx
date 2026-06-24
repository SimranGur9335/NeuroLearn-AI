import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, GraduationCap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const ClassSelection = () => {
    const [classes, setClasses] = useState([]);
    const navigate = useNavigate();
    const { user } = useAuth();
    const email = user?.email || "[EMAIL_ADDRESS]";

    useEffect(() => {
        const resolveAndFetch = async () => {
            try {
                const res = await fetch(`/faculty/by-email/${email}`);
                if (!res.ok) throw new Error("Failed to resolve faculty");
                const data = await res.json();
                localStorage.setItem("faculty_id", data.faculty_id);
                localStorage.setItem("faculty_name", data.full_name);
                localStorage.setItem("faculty_email", data.email);

                const classesRes = await fetch(`/faculty/${data.faculty_id}/classes`);
                const classesData = await classesRes.json();
                setClasses(classesData);
            } catch (err) {
                console.error("Error loading workspace data", err);
            }
        };
        resolveAndFetch();
    }, [email]);

    

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 font-sans">
            <div className="max-w-6xl mx-auto">

                <div className="mb-10">
                    <p className="text-emerald-500 font-bold uppercase tracking-wider text-sm">
                        Faculty Workspace
                    </p>

                    <h1 className="text-5xl font-black text-slate-900 dark:text-white mt-2">
                        Welcome Back, {user?.name || "Dr. Alok Verma"}
                    </h1>

                    <p className="text-slate-500 mt-3 max-w-2xl">
                        Select a teaching workspace to access attendance,
                        student performance, risk insights and AI-powered
                        academic tools.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800">
                        <p className="text-slate-500 text-sm">Active Classes</p>
                        <h3 className="text-3xl dark:text-white font-black mt-2">
                            {classes.length}
                        </h3>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800">
                        <p className="text-slate-300 text-sm">Teaching Role</p>
                        <h3 className="text-xl dark:text-white font-bold mt-2">
                            Faculty
                        </h3>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800">
                        <p className="text-slate-500 text-sm">Workspace Status</p>
                        <h3 className="text-xl font-bold mt-2 text-emerald-500">
                            Active
                        </h3>
                    </div>

                </div>

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

                    {classes.map((cls) => (

                        <motion.div
                            whileHover={{ y: -6 }}
                            key={`${cls.class_id}-${cls.subject_id}`}
                            onClick={() => handleSelect(cls)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 cursor-pointer shadow-sm hover:shadow-xl transition-all"
                        >

                            <div className="flex items-center justify-between mb-5">

                                <div className="p-3 rounded-2xl bg-emerald-500/10">
                                    <BookOpen
                                        size={22}
                                        className="text-emerald-500"
                                    />
                                </div>

                                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold">
                                    Active
                                </span>

                            </div>

                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                                {cls.subject_name}
                            </h2>

                            <p className="text-slate-500 mt-2">
                                {cls.class_name}
                            </p>

                            <div className="mt-6 space-y-2">

                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-300">Role</span>
                                    <span className="font-semibold dark:text-slate-300">
                                        {cls.role}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-300">Semester</span>
                                    <span className="font-semibold dark:text-slate-300">
                                        Semester 5
                                    </span>
                                </div>

                            </div>

                            <button
                                type="button"
                                className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                            >
                                Open Workspace
                                <ArrowRight size={16} />
                            </button>

                        </motion.div>

                    ))}

                </div>

            </div>
        </div>
    );
};

export default ClassSelection;