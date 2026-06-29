import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../services/api';
import StudentHubHeader from '../../components/StudentHubHeader';
import { useStudent } from '../../context/StudentContext';
import { THEME_COLOR_MAP } from '../../components/StudentHubTheme';
import SummaryMetricCard from '../../components/SummaryMetricCard';
import { Trophy, Award, TrendingUp } from 'lucide-react';

const GradesSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((n) => (
        <div key={n} className="h-28 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-3xl" />
      ))}
    </div>
    <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 h-96 space-y-4">
      <div className="h-6 w-1/4 bg-slate-200 dark:bg-slate-800 rounded-md" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="h-10 bg-slate-100/70 dark:bg-slate-800/30 rounded-md" />
        ))}
      </div>
    </div>
  </div>
);

const GradesEmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 space-y-4">
    <svg className="w-16 h-16 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    <div className="text-center">
      <h3 className="font-extrabold text-slate-700 dark:text-slate-300 text-sm mb-1">No Academic Records</h3>
      <p className="text-xs text-slate-500 max-w-xs">No subject grades or marks sheets have been recorded by the faculty yet for this semester.</p>
    </div>
  </div>
);

const GradesPage = () => {
  const { profile } = useStudent();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    cgpa: 0.0,
    gpa: 0.0,
    subject_grades: []
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);
        const res = await apiFetch('/student-hub/grades');
        if (!res.ok) {
          throw new Error('Failed to load grades');
        }
        const gradesData = await res.json();
        setData(gradesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, []);

  return (
    <div className="space-y-6">
      <StudentHubHeader 
        title="Grades & Academic Standing" 
        description="Verify your marks sheets. All grades are pulled directly from faculty gradebooks."
        showBackButton={true}
      />

      {loading ? (
        <GradesSkeleton />
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-650 dark:text-red-400 text-sm">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          {/* CGPA Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryMetricCard 
              title="Cumulative GPA (CGPA)" 
              value={data.cgpa.toFixed(2)} 
              subtext="Aggregated across terms" 
              icon={Trophy} 
            />
            <SummaryMetricCard 
              title="Active Semester GPA" 
              value={data.gpa.toFixed(2)} 
              subtext="Current semester standing" 
              icon={Award} 
            />
            <SummaryMetricCard 
              title="Degree Status" 
              value="In Progress" 
              subtext="B.Tech Computer Science" 
              icon={TrendingUp} 
            />
          </div>
 
          {/* Grades Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 overflow-hidden">
            <h3 className="font-extrabold text-sm text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-4">Subject Marks Sheets</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                    <th className="py-3 px-4">Subject Details</th>
                    <th className="py-3 px-4">Credits</th>
                    <th className="py-3 px-4 text-center">Assignments</th>
                    <th className="py-3 px-4 text-center">Quizzes</th>
                    <th className="py-3 px-4 text-center">Internals</th>
                    <th className="py-3 px-4 text-center">Practicals</th>
                    <th className="py-3 px-4 text-center font-extrabold text-slate-900 dark:text-white">Total Marks</th>
                    <th className="py-3 px-4 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-850/50">
                  {data.subject_grades.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-4">
                        <GradesEmptyState />
                      </td>
                    </tr>
                  ) : (
                    data.subject_grades.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-850/30 transition-colors">
                        <td className="py-4 px-4">
                          <span className="font-extrabold text-slate-900 dark:text-white block text-sm">{sub.subject_name}</span>
                          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{sub.subject_code}</span>
                        </td>
                        <td className="py-4 px-4 text-slate-650 dark:text-slate-400 font-bold">{sub.credits}</td>
                        <td className="py-4 px-4 text-center text-slate-700 dark:text-slate-300">{sub.assignment_marks}</td>
                        <td className="py-4 px-4 text-center text-slate-700 dark:text-slate-300">{sub.quiz_marks}</td>
                        <td className="py-4 px-4 text-center text-slate-700 dark:text-slate-300">{sub.internal_marks}</td>
                        <td className="py-4 px-4 text-center text-slate-700 dark:text-slate-300">{sub.practical_marks}</td>
                        <td className={`py-4 px-4 text-center font-extrabold ${theme.text}`}>
                          {sub.total_marks}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-md font-bold text-xs ${
                            ['A+', 'A', 'B+', 'B'].includes(sub.grade)
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : sub.grade === '-'
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-500'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          }`}>
                            {sub.grade}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradesPage;
