import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../services/api';
import StudentHubHeader from '../../components/StudentHubHeader';
import { useStudent } from '../../context/StudentContext';
import { THEME_COLOR_MAP } from '../../components/StudentHubTheme';
import { BookOpen, User, Calendar, Award } from 'lucide-react';

const CoursesPage = () => {
  const { profile } = useStudent();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await apiFetch('/student-hub/courses');
        if (!res.ok) {
          throw new Error('Failed to load courses');
        }
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="space-y-6">
      <StudentHubHeader 
        title="My Enrolled Courses" 
        description="Verify your current semester registrations, academic credits weight, and faculty mappings."
        showBackButton={true}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] space-y-4">
          <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-slate-500 dark:text-slate-400 text-xs animate-pulse">Loading subject enrollments...</span>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-650 dark:text-red-400 text-sm">
          {error}
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center text-slate-500 dark:text-slate-400 text-sm">
          You are not currently enrolled in any subjects for this term.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, idx) => (
            <div 
              key={idx}
              className={`bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-indigo-500/30 hover:shadow-md transition-all duration-300 relative group overflow-hidden`}
            >
              <div className="absolute right-0 top-0 -mr-4 -mt-4 w-20 h-20 bg-slate-950/[0.01] dark:bg-white/[0.01] rounded-full group-hover:bg-slate-950/[0.03] dark:group-hover:bg-white/[0.03] transition-colors" />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-bold tracking-widest ${theme.text} ${theme.bg} border ${theme.border} px-2.5 py-0.5 rounded-md`}>
                    {course.subject_code}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Calendar size={12} />
                    Semester {course.semester}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                    {course.subject_name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Award size={12} className={theme.text} />
                    <span>{course.credits} Credits Weight</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-850 ${theme.text} shrink-0`}>
                    <User size={14} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold tracking-wider">Assigned Faculty</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-300">{course.faculty_name}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
