import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, BookOpen, Calendar, MapPin, School, Mail, Hash } from 'lucide-react';
import { apiFetch } from '../../services/api';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentProfile();
  }, [id]);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/students/${id}`);
      if (!res.ok) throw new Error("Student not found");
      const data = await res.json();
      setStudent(data);

      const histRes = await apiFetch(`/enrollments/history/${id}`);
      if (histRes.ok) {
        const histData = await histRes.json();
        setHistory(histData);
      }
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

  if (!student) {
    return (
      <div className="text-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
        <p className="text-slate-500 text-sm mb-4">Student record not found or error loading profile.</p>
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
          <h2 className="text-2xl font-black text-slate-800 dark:text-white font-sans">Student Profile Center</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 lg:col-span-2">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-850">
            <div className="h-16 w-16 bg-emerald-600/10 text-emerald-500 rounded-2xl flex items-center justify-center">
              <User size={32} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white">{student.full_name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Roll Number: {student.roll_no}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl">
              <Hash className="text-emerald-500" size={18} />
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Roll Number</span>
                <span className="font-mono text-slate-700 dark:text-slate-350">{student.roll_no}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl">
              <Mail className="text-emerald-500" size={18} />
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Institution Email</span>
                <span className="font-semibold text-slate-700 dark:text-slate-350">{student.email || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl">
              <School className="text-emerald-500" size={18} />
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Department Code</span>
                <span className="font-bold text-slate-700 dark:text-slate-350">{student.department}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl">
              <Calendar className="text-emerald-500" size={18} />
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Academic Semester & Division</span>
                <span className="font-bold text-slate-700 dark:text-slate-350">Sem {student.semester} - Div {student.division}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enrollment Side Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-4 pb-2 border-b border-slate-100 dark:border-slate-850">
              Enrollment Information
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                <span className="text-[10px] text-slate-450 dark:text-slate-400 block font-bold uppercase mb-1">Assigned Class</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  {student.enrollment?.class_name || "Not Enrolled"}
                </span>
              </div>

              <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                <span className="text-[10px] text-slate-450 dark:text-slate-400 block font-bold uppercase mb-1">Assigned Course</span>
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                  {student.enrollment?.course_title || "No Course Mapped"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-150 dark:border-slate-850 pt-4">
            <h4 className="font-bold text-slate-700 dark:text-slate-350 text-xs mb-3">Academic Log History</h4>
            {history.length === 0 ? (
              <p className="text-[10px] text-slate-400">No enrollment activities recorded.</p>
            ) : (
              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {history.map((h, i) => (
                  <div key={i} className="flex justify-between items-center text-[10px] bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-850">
                    <span className="font-bold text-emerald-600">{h.action}</span>
                    <span className="text-slate-400">{h.timestamp.split(" ")[0]}</span>
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

export default StudentProfile;
