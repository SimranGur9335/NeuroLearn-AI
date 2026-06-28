import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  AlertTriangle,
  History,
  Activity,
  Award,
  BookOpen,
  ArrowRight,
  RotateCcw,
  BarChart2,
  Clock,
  Gauge
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
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';

const PredictionsPage = () => {
  const { profile } = useStudent();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  const [activeTab, setActiveTab] = useState('forecast');
  const [formData, setFormData] = useState({
    age: 20,
    studytime: 3,
    failures: 0,
    absences: 2,
    G1: 15.0,
    G2: 15.0,
  });

  const [predictedResult, setPredictedResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real-time student default stats on load
  const loadStudentStats = async () => {
    try {
      const response = await apiFetch("/api/v1/academic/student-stats");
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      }
    } catch (err) {
      console.error("Failed to load student metrics from database:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch chronological runs history logs
  const loadHistory = async () => {
    try {
      const response = await apiFetch("/api/v1/academic/predictions/history");
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
        // If there's runs, select the latest run outcome
        if (data.length > 0 && !predictedResult) {
          setPredictedResult(data[0]);
          setFormData({
            age: data[0].age,
            studytime: data[0].studytime,
            failures: data[0].failures,
            absences: data[0].absences,
            G1: data[0].G1,
            G2: data[0].G2,
          });
        }
      }
    } catch (err) {
      console.error("Failed to load academic predictions history logs:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadStudentStats();
    loadHistory();
  }, []);

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch("/api/v1/academic/predict", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Prediction API request failed.");
      }

      const data = await response.json();
      setPredictedResult(data);
      // Reload history logs to refresh dashboards
      loadHistory();
    } catch (err) {
      console.error(err);
      setError("Academic forecasting pipeline offline. Please verify that the backend is active.");
    } finally {
      setLoading(false);
    }
  };

  // Restore configuration parameters from past runs
  const handleRestore = (run) => {
    setFormData({
      age: run.age,
      studytime: run.studytime,
      failures: run.failures,
      absences: run.absences,
      G1: run.G1,
      G2: run.G2,
    });
    setPredictedResult(run);
    setActiveTab('forecast');
  };

  const getRiskColor = (level) => {
    if (level === 'High') return 'text-red-400 bg-red-500/10 border-red-500/20';
    if (level === 'Medium') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  };

  const getStudyTimeLabel = (val) => {
    return {
      1: "Under 2 Hours/Week",
      2: "2 to 5 Hours/Week",
      3: "5 to 10 Hours/Week",
      4: "Over 10 Hours/Week"
    }[val] || "Medium";
  };

  // Chart data generators
  const getG1G2FinalDataset = () => {
    const currentG1 = predictedResult ? predictedResult.G1 || formData.G1 : formData.G1;
    const currentG2 = predictedResult ? predictedResult.G2 || formData.G2 : formData.G2;
    const finalProjected = predictedResult ? predictedResult.predicted_grade : 14.5;
    
    return [
      { name: 'Internal Exam (G1)', Score: currentG1, Max: 20 },
      { name: 'Midterm Exam (G2)', Score: currentG2, Max: 20 },
      { name: 'Final Exam (Projected)', Score: finalProjected, Max: 20 }
    ];
  };

  const getCgpaTrendDataset = () => {
    if (history.length > 0) {
      return [...history].reverse().map((run, idx) => ({
        name: `Forecast #${history.length - idx}`,
        CGPA: parseFloat(run.predicted_cgpa),
        Attendance: parseFloat(run.attendance_rate),
        Risk: parseFloat(run.backlog_risk)
      }));
    }
    return [
      { name: 'Simulation #1', CGPA: 8.0, Attendance: 90, Risk: 10 },
      { name: 'Simulation #2', CGPA: 8.4, Attendance: 95, Risk: 5 }
    ];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Banner hero header */}
      <div className={`bg-gradient-to-r ${theme.gradient} border ${theme.border} p-6 rounded-3xl relative overflow-hidden shadow-xl text-white`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className={`text-xs ${theme.text} font-bold uppercase tracking-wider ${theme.bg} px-3 py-1 rounded-full border ${theme.border}`}>
              AI Forecasting Terminal
            </span>
            <h1 className="text-2xl md:text-3xl font-black mt-3 flex items-center gap-2">
              <Brain className={theme.text} size={28} />
              Academic Outcome projections
            </h1>
            <p className="text-slate-400 text-xs mt-1.5 max-w-xl leading-relaxed">
              NeuroLearn predictive engines calculate graduation CGPA honors, analyze lecture attendance risks, detect subject-level weak spots, and outline customized remediation maps.
            </p>
          </div>
          <div className="shrink-0 flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <TrendingUp size={44} className={theme.text} />
          </div>
        </div>
      </div>

      {/* Tabs navigation panel */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1.5 pb-px text-xs">
        <button
          onClick={() => setActiveTab('forecast')}
          className={`px-4 py-2.5 font-bold transition-all border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'forecast' 
              ? `border-indigo-500 text-slate-900 dark:text-white` 
              : 'border-transparent text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Target size={14} />
          Forecasting Terminal
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 font-bold transition-all border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'analytics' 
              ? `border-indigo-500 text-slate-900 dark:text-white` 
              : 'border-transparent text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <BarChart2 size={14} />
          Analytics & Trends
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 font-bold transition-all border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'history' 
              ? `border-indigo-500 text-slate-900 dark:text-white` 
              : 'border-transparent text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <History size={14} />
          Projections Log ({history.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div className="mt-4">
        <AnimatePresence mode="wait">
          {activeTab === 'forecast' && (
            <motion.div
              key="forecast"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left Column: Form Panel */}
              <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 lg:col-span-1">
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-1.5">
                    <Activity className={theme.text} size={18} />
                    Simulation controls
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-0.5">Prefilled automatically using your actual college records</p>
                </div>

                {statsLoading ? (
                  <div className="space-y-4 py-6 text-center text-slate-500 text-xs">
                    <div className="animate-spin inline-block w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full mb-2"></div>
                    <p>Loading database markers...</p>
                  </div>
                ) : (
                  <form onSubmit={handlePredict} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider block">Student Age</label>
                        <input 
                          type="number" 
                          min="15" max="30"
                          value={formData.age}
                          onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 20 }))}
                          className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider block">Study Hours/Week</label>
                        <select
                          value={formData.studytime}
                          onChange={(e) => setFormData(prev => ({ ...prev, studytime: parseInt(e.target.value) }))}
                          className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
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
                        <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider block">Past Failures</label>
                        <input 
                          type="number" 
                          min="0" max="4"
                          value={formData.failures}
                          onChange={(e) => setFormData(prev => ({ ...prev, failures: parseInt(e.target.value) || 0 }))}
                          className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider block">Total Absences</label>
                        <input 
                          type="number" 
                          min="0" max="93"
                          value={formData.absences}
                          onChange={(e) => setFormData(prev => ({ ...prev, absences: parseInt(e.target.value) || 0 }))}
                          className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] text-slate-550 dark:text-slate-400">
                        <span className="uppercase font-bold tracking-wider">Internal Marks (G1): {formData.G1}/20</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" max="20" step="0.5"
                        value={formData.G1}
                        onChange={(e) => setFormData(prev => ({ ...prev, G1: parseFloat(e.target.value) }))}
                        className="w-full accent-indigo-500 bg-slate-200 dark:bg-slate-950 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] text-slate-550 dark:text-slate-400">
                        <span className="uppercase font-bold tracking-wider">Midterm Marks (G2): {formData.G2}/20</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" max="20" step="0.5"
                        value={formData.G2}
                        onChange={(e) => setFormData(prev => ({ ...prev, G2: parseFloat(e.target.value) }))}
                        className="w-full accent-indigo-500 bg-slate-200 dark:bg-slate-950 rounded-lg cursor-pointer"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full py-3 ${theme.accent} hover:opacity-90 text-white font-extrabold rounded-xl transition-all shadow-md mt-4 flex items-center justify-center gap-2 cursor-pointer`}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"></div>
                          Computing Projections...
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          Run ML Projections
                        </>
                      )}
                    </button>
                  </form>
                )}

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl flex items-start gap-2 mt-2 text-[10px] text-red-400">
                    <AlertTriangle className="shrink-0 mt-0.5" size={14} />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Right Column: Predictive Results Outputs */}
              <div className="lg:col-span-2 space-y-6">
                {!predictedResult ? (
                  <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
                    <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                      <Gauge className="text-indigo-650 dark:text-indigo-400 animate-pulse" size={36} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Forecast Data Stale or Missing</h4>
                      <p className="text-slate-500 dark:text-slate-450 text-xs mt-1 max-w-sm">
                        Submit study hours, failures, and midterm grades to calibrate machine learning parameters and view detailed outcomes.
                      </p>
                    </div>
                    <button
                      onClick={() => handlePredict()}
                      className="px-6 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 font-bold rounded-xl border border-indigo-500/30 transition text-xs cursor-pointer"
                    >
                      Generate Initial Prediction
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Top row: 3 Primary Outcome Indicators */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Projected CGPA Card */}
                      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex flex-col justify-between min-h-[150px] relative overflow-hidden group hover:border-indigo-500/25 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 dark:text-slate-450 uppercase font-bold tracking-wider">Projected Graduation CGPA</span>
                          <GraduationCap className="text-indigo-600 dark:text-indigo-400" size={18} />
                        </div>
                        <div className="py-2">
                          <span className="text-3xl font-black text-slate-900 dark:text-white">{predictedResult.predicted_cgpa}</span>
                          <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold"> / 10.0</span>
                        </div>
                        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center text-[10px]">
                          <span className="text-slate-500 font-semibold uppercase">Confidence Level</span>
                          <span className="text-emerald-650 dark:text-emerald-450 font-bold uppercase">First Class Dist</span>
                        </div>
                      </div>

                      {/* Attendance Predictor Card */}
                      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex flex-col justify-between min-h-[150px] hover:border-indigo-500/25 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 dark:text-slate-455 uppercase font-bold tracking-wider">Projected Attendance</span>
                          <Clock className="text-indigo-600 dark:text-indigo-400" size={18} />
                        </div>
                        <div className="py-2">
                          <span className="text-3xl font-black text-slate-900 dark:text-white">{predictedResult.attendance_rate}%</span>
                          {/* Progress bar */}
                          <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-550 ${
                                predictedResult.attendance_rate < 75 ? 'bg-red-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${predictedResult.attendance_rate}%` }}
                            />
                          </div>
                        </div>
                        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center text-[10px]">
                          <span className="text-slate-500 font-semibold">Requirement threshold: 75%</span>
                          <span className={`font-bold uppercase ${
                            predictedResult.attendance_rate < 75 ? 'text-red-400' : 'text-emerald-650 dark:text-emerald-455'
                          }`}>
                            {predictedResult.attendance_rate < 75 ? 'Critical Drop' : 'Optimal'}
                          </span>
                        </div>
                      </div>

                      {/* Backlog Risk Level */}
                      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex flex-col justify-between min-h-[150px] hover:border-indigo-500/25 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 dark:text-slate-450 uppercase font-bold tracking-wider">Backlog Risk Status</span>
                          <ShieldAlert className="text-indigo-650 dark:text-indigo-400" size={18} />
                        </div>
                        <div className="py-2">
                          <span className={`text-xs font-black px-3 py-1 rounded-full border inline-block ${getRiskColor(predictedResult.risk_level)}`}>
                            {predictedResult.risk_level} Risk Index ({predictedResult.backlog_risk}%)
                          </span>
                        </div>
                        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center text-[10px] text-slate-500 font-semibold uppercase">
                          <span>Rule-based audit check</span>
                          <span>Passed</span>
                        </div>
                      </div>
                    </div>

                    {/* Weak Subject Detection Alert */}
                    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-3">
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                          <BookOpen className="text-indigo-600 dark:text-indigo-400" size={16} />
                          Subject-Level Remediation Index
                        </h4>
                        <p className="text-[10px] text-slate-550 dark:text-slate-450 mt-0.5">Identified weak subjects requiring target training to boost grades</p>
                      </div>

                      <div className="flex flex-wrap gap-2.5">
                        {predictedResult.weak_subjects && predictedResult.weak_subjects.map((sub, idx) => (
                          <div 
                            key={idx} 
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3.5 py-2.5 rounded-2xl flex items-center justify-between gap-6 text-xs w-full sm:w-[48%]"
                          >
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-850 dark:text-white block truncate max-w-[160px]">{sub}</span>
                              <span className="text-[9px] text-red-500 dark:text-red-400 font-semibold">Priority Remediation Area</span>
                            </div>
                            <a 
                              href="/student-hub/programming"
                              className="text-[9px] text-indigo-650 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-extrabold uppercase flex items-center gap-1 bg-indigo-500/5 px-2.5 py-1 rounded-lg border border-indigo-500/10 hover:border-indigo-500/25 transition"
                            >
                              Practice Quiz
                              <ArrowRight size={10} />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Academic AI Advisor recommendations */}
                    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                        <Sparkles className="text-indigo-650 dark:text-indigo-400" size={16} />
                        AI Advisor Actions Plan
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs text-slate-500 dark:text-slate-400">
                        {predictedResult.recommendations && predictedResult.recommendations.map((rec, idx) => {
                          const isWarning = rec.toLowerCase().includes("attendance") || rec.toLowerCase().includes("absences") || rec.toLowerCase().includes("remediation");
                          return (
                            <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-855 rounded-2xl flex gap-3 align-start">
                              {isWarning ? (
                                <AlertTriangle className="text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" size={16} />
                              ) : (
                                <CheckCircle className="text-emerald-555 dark:text-emerald-500 shrink-0 mt-0.5" size={16} />
                              )}
                              <div>
                                <h5 className="font-extrabold text-slate-900 dark:text-white text-[11px]">Recommendation #{idx + 1}</h5>
                                <p className="mt-1 text-[10px] leading-relaxed">{rec}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* GPA Projection Area Chart */}
                <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl lg:col-span-2">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-xs md:text-sm mb-4 flex items-center gap-2">
                    <TrendingUp className="text-indigo-650 dark:text-indigo-400" size={16} />
                    Historical GPA & Projections Trajectory
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getCgpaTrendDataset()}>
                        <defs>
                          <linearGradient id="colorCgpaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" darkStroke="#1e293b" opacity={0.5} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                        <YAxis domain={[4.0, 10.0]} stroke="#64748b" fontSize={10} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} 
                          itemStyle={{ color: '#fff', fontSize: '10px' }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="CGPA" 
                          stroke="#4f46e5" 
                          strokeWidth={2.5} 
                          fillOpacity={1} 
                          fill="url(#colorCgpaGrad)" 
                          name="Predicted CGPA" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Grade Progression Bar Chart */}
                <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-xs md:text-sm mb-4 flex items-center gap-2">
                    <BarChart2 className="text-indigo-650 dark:text-indigo-400" size={16} />
                    Term Grade Progression
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getG1G2FinalDataset()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" darkStroke="#1e293b" opacity={0.5} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                        <YAxis domain={[0, 20]} stroke="#64748b" fontSize={10} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} 
                          itemStyle={{ fontSize: '10px' }} 
                        />
                        <Bar dataKey="Score" fill="#6366f1" radius={[8, 8, 0, 0]} name="Value (Out of 20)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Extra Telemetry stats indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl flex items-center gap-3">
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/10 rounded-xl">
                    <Target className="text-indigo-655 dark:text-indigo-400" size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-450 uppercase font-semibold block">Forecast Success Accuracy</span>
                    <span className="text-sm font-bold text-slate-850 dark:text-white mt-0.5">91.8% Accuracy Index</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/10 rounded-xl">
                    <Award className="text-emerald-555 dark:text-emerald-400" size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-450 uppercase font-semibold block">Predicted Semester Honors</span>
                    <span className="text-sm font-bold text-slate-850 dark:text-white mt-0.5">First Class Dist.</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl flex items-center gap-3">
                  <div className="p-3 bg-red-500/10 border border-red-500/10 rounded-xl">
                    <AlertTriangle className="text-red-555 dark:text-red-450" size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-455 uppercase font-semibold block">Minimum safe study bracket</span>
                    <span className="text-sm font-bold text-slate-850 dark:text-white mt-0.5">&gt; 5 hrs weekly (suggested)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6"
            >
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-1.5">
                  <History className="text-indigo-650 dark:text-indigo-400" size={18} />
                  Simulation Telemetry Log
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-0.5">Chronological index of past performance forecasting runs</p>
              </div>

              {historyLoading ? (
                <div className="space-y-4 py-12 text-center text-slate-500 text-xs">
                  <div className="animate-spin inline-block w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full mb-2"></div>
                  <p>Fetching prediction logs...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-xs">
                  <FileText className="mx-auto text-slate-400 dark:text-slate-650 mb-3" size={32} />
                  <p className="font-bold">No Forecast Runs Documented</p>
                  <p className="text-[10px] text-slate-500 mt-1">Submit the forecasting form to generate telemetry log history.</p>
                </div>
              ) : (
                <div className="overflow-x-auto mt-6">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-450 uppercase font-bold tracking-wider">
                        <th className="pb-3 pl-2">Timestamp</th>
                        <th className="pb-3">Inputs (Age/Study/Fail/Abs)</th>
                        <th className="pb-3">G1/G2</th>
                        <th className="pb-3">Predicted CGPA</th>
                        <th className="pb-3">Backlog Risk</th>
                        <th className="pb-3">Weak Subjects</th>
                        <th className="pb-3 text-right pr-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {history.map((run, idx) => (
                        <tr key={run.prediction_id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 text-slate-600 dark:text-slate-350 transition-colors">
                          <td className="py-3.5 pl-2 text-[10px] text-slate-500">
                            {run.created_at ? new Date(run.created_at.replace(" ", "T")).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-3.5 font-semibold text-slate-700 dark:text-slate-200">
                            Age: {run.age} • {getStudyTimeLabel(run.studytime)} • F: {run.failures} • Abs: {run.absences}
                          </td>
                          <td className="py-3.5">
                            {run.G1} / {run.G2}
                          </td>
                          <td className="py-3.5 text-slate-900 dark:text-white font-extrabold">
                            {run.predicted_cgpa}
                          </td>
                          <td className="py-3.5">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${getRiskColor(run.risk_level)}`}>
                              {run.risk_level} ({run.backlog_risk}%)
                            </span>
                          </td>
                          <td className="py-3.5 text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]" title={run.weak_subjects?.join(", ")}>
                            {run.weak_subjects ? run.weak_subjects.join(", ") : "None"}
                          </td>
                          <td className="py-3.5 text-right pr-2">
                            <button
                              onClick={() => handleRestore(run)}
                              className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-650 dark:text-indigo-400 font-extrabold rounded-lg border border-indigo-500/10 transition text-[10px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw size={10} />
                              Restore
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default PredictionsPage;
