import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, UserCheck, BookOpen, Briefcase, Mail, Award, Landmark, Layers } from 'lucide-react';
import { apiFetch } from '../../services/api';

const FacultyProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacultyProfile();
  }, [id]);

  const fetchFacultyProfile = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/faculty/${id}`);
      if (!res.ok) throw new Error("Faculty not found");
      const data = await res.json();
      setFaculty(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="text-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
        <p className="text-slate-500 text-sm mb-4">Faculty record not found or error loading profile.</p>
        <button
          onClick={() => navigate('/admin/users')}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/users')}
          className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer inline-flex"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider">LMS Profiles</p>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white font-sans">Faculty Profile Center</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 lg:col-span-2">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-850">
            <div className="h-16 w-16 bg-emerald-600/10 text-emerald-500 rounded-2xl flex items-center justify-center">
              <UserCheck size={32} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white">{faculty.full_name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Designation: {faculty.designation}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl">
              <Briefcase className="text-emerald-500" size={18} />
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Designation</span>
                <span className="font-semibold text-slate-700 dark:text-slate-350">{faculty.designation || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl">
              <Mail className="text-emerald-500" size={18} />
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Institution Email</span>
                <span className="font-semibold text-slate-700 dark:text-slate-350">{faculty.email || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl">
              <Landmark className="text-emerald-500" size={18} />
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Department Code</span>
                <span className="font-bold text-slate-700 dark:text-slate-350">{faculty.department}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl">
              <Award className="text-emerald-500" size={18} />
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Faculty Code</span>
                <span className="font-mono text-slate-700 dark:text-slate-350 font-bold">{faculty.faculty_code}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Subjects & Classes */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-4 pb-2 border-b border-slate-100 dark:border-slate-850 flex items-center gap-2">
              <Layers size={16} className="text-emerald-500" />
              Assigned Subjects
            </h3>
            {faculty.assigned_subjects.length === 0 ? (
              <p className="text-xs text-slate-400">No subjects currently assigned.</p>
            ) : (
              <div className="space-y-2">
                {faculty.assigned_subjects.map((sub) => (
                  <div key={sub.subject_id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{sub.subject_name}</span>
                    <span className="font-mono text-[10px] text-slate-400 font-bold uppercase bg-slate-200/50 dark:bg-slate-800/80 px-2 py-0.5 rounded">
                      {sub.subject_code}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-4 pb-2 border-b border-slate-100 dark:border-slate-850 flex items-center gap-2">
              <BookOpen size={16} className="text-indigo-500" />
              Assigned Classes
            </h3>
            {faculty.assigned_classes.length === 0 ? (
              <p className="text-xs text-slate-400">No classes currently assigned.</p>
            ) : (
              <div className="space-y-2">
                {faculty.assigned_classes.map((cls) => (
                  <div key={cls.class_id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {cls.class_name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FacultyProfile;
