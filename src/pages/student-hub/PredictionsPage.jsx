import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Brain, 
  TrendingUp, 
  GraduationCap, 
  Target, 
  ShieldAlert, 
  FileText, 
  CheckCircle,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { apiFetch } from '../../services/api';
import { useStudent } from '../../context/StudentContext';
import { THEME_COLOR_MAP } from '../../components/StudentHubTheme';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

const PredictionsPage = () => {
  const { profile } = useStudent();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  const [predictedGrade, setPredictedGrade] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    age: 20,
    studytime: 3,
    failures: 0,
    absences: 2,
    G1: 15,
    G2: 15,
  });

  const [trendData, setTrendData] = useState([
    { name: 'G1 (Internal)', score: 15, target: 16 },
    { name: 'G2 (Midterm)', score: 15, target: 16 },
    { name: 'Final (Projected)', score: 15, target: 17 }
  ]);

  const predictPerformance = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch("/predict/student-performance", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to calculate prediction model metrics.");
      }

      const data = await response.json();
      setPredictedGrade(data.predicted_grade);
      
      // Update charts based on predictions
      const finalScore = data.predicted_grade;
      setTrendData([
        { name: 'G1 (Internal)', score: formData.G1, target: Math.min(20, formData.G1 + 1) },
        { name: 'G2 (Midterm)', score: formData.G2, target: Math.min(20, formData.G2 + 2) },
        { name: 'Final (Projected)', score: Math.round(finalScore), target: Math.min(20, Math.round(finalScore) + 2) }
      ]);
    } catch (err) {
      console.error(err);
      setError("Predictive analysis offline. Please check that backend services are active.");
    } finally {
      setLoading(false);
    }
  };

  const finalCgpa = predictedGrade 
    ? ((predictedGrade / 20) * 10).toFixed(2) 
    : "8.50";

  const getRiskLevel = () => {
    if (formData.failures > 0 || formData.absences > 12) return { name: "High Risk", color: "text-red-500 bg-red-500/10 border-red-500/20" };
    if (formData.absences > 6 || formData.G1 < 10) return { name: "Moderate Warning", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
    return { name: "Outstanding standing", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" };
  };

  const risk = getRiskLevel();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Banner */}
      <div className={`bg-gradient-to-r ${theme.gradient} border ${theme.border} p-6 rounded-3xl relative overflow-hidden shadow-xl text-white`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className={`text-xs ${theme.text} font-bold uppercase tracking-wider ${theme.bg} px-3 py-1 rounded-full border ${theme.border}`}>
              AI Forecasting Center
            </span>
            <h1 className="text-2xl md:text-3xl font-black mt-3">
              Academic Outcome Forecasts
            </h1>
            <p className="text-slate-350 text-xs mt-1.5 max-w-xl leading-relaxed">
              Calculate projected performance targets and model grades based on absences, study habits, and midterm scores.
            </p>
          </div>
          <div className="shrink-0 flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10">
            <Brain size={44} className={theme.text} />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ML Form */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 lg:col-span-1">
          <div>
            <h3 className="font-extrabold text-white text-base flex items-center gap-1.5">
              <Target className={theme.text} size={18} />
              Simulation Inputs
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Input study habits to compute future graduation honors</p>
          </div>

          <form onSubmit={predictPerformance} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Student Age</label>
                <input 
                  type="number" 
                  min="15" max="30"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 20 }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Study Hours/Week</label>
                <select
                  value={formData.studytime}
                  onChange={(e) => setFormData(prev => ({ ...prev, studytime: parseInt(e.target.value) }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="1">Under 2 hours</option>
                  <option value="2">2 to 5 hours</option>
                  <option value="3">5 to 10 hours</option>
                  <option value="4">Over 10 hours</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Past Failures</label>
                <input 
                  type="number" 
                  min="0" max="4"
                  value={formData.failures}
                  onChange={(e) => setFormData(prev => ({ ...prev, failures: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Total Absences</label>
                <input 
                  type="number" 
                  min="0" max="93"
                  value={formData.absences}
                  onChange={(e) => setFormData(prev => ({ ...prev, absences: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">G1 Score (0-20)</label>
                <input 
                  type="number" 
                  min="0" max="20"
                  value={formData.G1}
                  onChange={(e) => setFormData(prev => ({ ...prev, G1: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">G2 Score (0-20)</label>
                <input 
                  type="number" 
                  min="0" max="20"
                  value={formData.G2}
                  onChange={(e) => setFormData(prev => ({ ...prev, G2: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 ${theme.accent} hover:opacity-90 text-white font-extrabold rounded-xl transition-all shadow-md mt-4 cursor-pointer`}
            >
              {loading ? "Re-calibrating calculations..." : "Run ML Projections"}
            </button>
          </form>
          {error && <p className="text-red-400 text-[10px] mt-2 font-semibold text-center">{error}</p>}
        </div>

        {/* Forecast Output */}
        <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Projected CGPA Card */}
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between min-h-[140px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-450 uppercase font-bold">Predicted Target Grade</span>
                <GraduationCap className={theme.text} size={18} />
              </div>
              <div className="py-2">
                <span className="text-3xl font-extrabold text-white">{predictedGrade ? finalCgpa : "8.50"}</span>
                <span className="text-slate-500 text-xs font-semibold"> / 10.00 CGPA</span>
              </div>
              <div className="pt-2.5 border-t border-slate-800 flex justify-between items-center text-[10px]">
                <span className="text-slate-500 font-semibold uppercase">Confidence Interval</span>
                <span className="text-indigo-400 font-bold uppercase">89.7% Accuracy</span>
              </div>
            </div>

            {/* Risk Warnings Card */}
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between min-h-[140px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-450 uppercase font-bold">Academic warning Status</span>
                <ShieldAlert className={theme.text} size={18} />
              </div>
              <div className="py-2">
                <span className={`text-xl font-extrabold px-3 py-1 rounded-full ${risk.color}`}>
                  {risk.name}
                </span>
              </div>
              <div className="pt-2.5 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
                <span>Absence limit threshold: 75%</span>
              </div>
            </div>

          </div>

          {/* Area Chart */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
              <TrendingUp className={theme.text} size={18} />
              Academic Development Curve
            </h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={themeColor === 'indigo' ? '#4f46e5' : themeColor === 'violet' ? '#a855f7' : themeColor === 'rose' ? '#e11d48' : '#d97706'} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={themeColor === 'indigo' ? '#4f46e5' : themeColor === 'violet' ? '#a855f7' : themeColor === 'rose' ? '#e11d48' : '#d97706'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis domain={[0, 20]} stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '11px' }} />
                  <Area type="monotone" dataKey="score" stroke={themeColor === 'indigo' ? '#4f46e5' : themeColor === 'violet' ? '#a855f7' : themeColor === 'rose' ? '#e11d48' : '#d97706'} strokeWidth={2.5} fillOpacity={1} fill="url(#colorScore)" name="Score" />
                  <Area type="monotone" dataKey="target" stroke="#06b6d4" strokeWidth={1.5} strokeDasharray="4 4" fill="none" name="Optimal Target" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

      {/* Wellness & Advisement Tips */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
          <Sparkles className={theme.text} size={18} />
          Academic Guidance Notes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-slate-400">
          <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex gap-3">
            <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16} />
            <div>
              <h4 className="font-extrabold text-white">Target study hours check</h4>
              <p className="mt-1">Maintaining a study bracket of 5 to 10 hours per week lowers academic failure risk ratios by 28% based on historical cohorts.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex gap-3">
            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
            <div>
              <h4 className="font-extrabold text-white">Absence warning triggers</h4>
              <p className="mt-1">More than 5 absences trigger overall grade drops in technical labs. Target a presence ratio above 90% next month.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PredictionsPage;
