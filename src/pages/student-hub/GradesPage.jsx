import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../services/api';
import StudentHubHeader from '../../components/StudentHubHeader';
import { useStudent } from '../../context/StudentContext';
import { THEME_COLOR_MAP } from '../../components/StudentHubTheme';
import SummaryMetricCard from '../../components/SummaryMetricCard';
import { Trophy, Award, TrendingUp } from 'lucide-react';

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
        <div className="flex flex-col items-center justify-center min-h-[30vh] space-y-4">
          <div className="w-8 h-8 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-slate-400 text-xs animate-pulse">Fetching academic grades...</span>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-400 text-sm">
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
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 overflow-hidden">
            <h3 className="font-extrabold text-sm text-slate-400 uppercase tracking-wider mb-4">Subject Marks Sheets</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-500 uppercase tracking-wider font-bold">
                    <th className="py-3 px-4">Subject Details</th>
                    <th className="py-3 px-4">Credits</th>
                    <th className="py-3 px-4 text-center">Assignments</th>
                    <th className="py-3 px-4 text-center">Quizzes</th>
                    <th className="py-3 px-4 text-center">Internals</th>
                    <th className="py-3 px-4 text-center">Practicals</th>
                    <th className="py-3 px-4 text-center font-extrabold text-white">Total Marks</th>
                    <th className="py-3 px-4 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/50">
                  {data.subject_grades.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-slate-500 font-bold">
                        No subject grades recorded yet for this term.
                      </td>
                    </tr>
                  ) : (
                    data.subject_grades.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-slate-850/30 transition-colors">
                        <td className="py-4 px-4">
                          <span className="font-extrabold text-white block text-sm">{sub.subject_name}</span>
                          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{sub.subject_code}</span>
                        </td>
                        <td className="py-4 px-4 text-slate-400 font-bold">{sub.credits}</td>
                        <td className="py-4 px-4 text-center text-slate-300">{sub.assignment_marks}</td>
                        <td className="py-4 px-4 text-center text-slate-300">{sub.quiz_marks}</td>
                        <td className="py-4 px-4 text-center text-slate-300">{sub.internal_marks}</td>
                        <td className="py-4 px-4 text-center text-slate-300">{sub.practical_marks}</td>
                        <td className={`py-4 px-4 text-center font-extrabold ${theme.text}`}>
                          {sub.total_marks}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-md font-bold text-xs ${
                            ['A+', 'A', 'B+', 'B'].includes(sub.grade)
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : sub.grade === '-'
                              ? 'bg-slate-800 text-slate-500'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
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
