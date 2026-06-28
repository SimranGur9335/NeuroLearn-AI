import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, FileText, CheckSquare, Download, Sparkles, Brain } from 'lucide-react';
import { useStudent } from '../../../context/StudentContext';
import { THEME_COLOR_MAP } from '../../../components/StudentHubTheme';
import { certifications } from '../data/certifications';
import { projects } from '../data/projects';
import { resources } from '../data/resources';
import CareerHero from '../components/CareerHero';
import ResumeUploadZone from '../components/ResumeUploadZone';
import AtsMeter from '../components/AtsMeter';
import ResumeSuggestions from '../components/ResumeSuggestions';
import CareerSection from '../components/CareerSection';

const ResumeReview = () => {
  const navigate = useNavigate();
  const { profile } = useStudent();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  const [step, setStep] = useState('upload'); // 'upload' | 'analyzing' | 'results'
  const [fileName, setFileName] = useState('');

  // Interactive Checklist State
  const [checklist, setChecklist] = useState([
    { id: 1, text: "Uses active action verbs (e.g., Engineered, Orchestrated)", checked: true },
    { id: 2, text: "Quantified results included (e.g., 'reduced latency by 30%')", checked: false },
    { id: 3, text: "Fits exactly on 1 single page", checked: true },
    { id: 4, text: "Contact information (Email, Phone, Location) is present", checked: true },
    { id: 5, text: "Links to GitHub, LinkedIn, and Portfolio are active", checked: false },
    { id: 6, text: "Lists education details with GPA benchmarks clearly", checked: true },
    { id: 7, text: "Skills section highlights target role keywords explicitly", checked: false },
    { id: 8, text: "Free of grammar, spelling, or layout offset anomalies", checked: true }
  ]);

  const toggleItem = (id) => {
    setChecklist(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const startAnalysis = (file) => {
    setFileName(file.name);
    setStep('analyzing');
    setTimeout(() => {
      setStep('results');
    }, 1500);
  };

  const loadDemo = () => {
    setFileName('Samar_Resume_2026.pdf');
    setStep('analyzing');
    setTimeout(() => {
      setStep('results');
    }, 1200);
  };

  // Mock Analysis Results
  const mockAtsScore = 78;
  const mockBreakdown = [
    { name: "Keywords & Skills", value: 65 },
    { name: "Formatting & Style", value: 90 },
    { name: "Impact & Quantifying", value: 50 },
    { name: "Contact & Links", value: 85 }
  ];

  const detectedSkills = ["React", "JavaScript", "HTML5", "CSS3", "Git", "Python", "SQL"];
  const missingKeywords = ["TypeScript", "TailwindCSS", "Next.js", "Redux Toolkit", "Webpack", "Docker"];
  
  const strengths = [
    "Clean, single-page professional template formatting.",
    "No illegal table hierarchies or parsing issues detected.",
    "Strong use of programming terminology and core libraries."
  ];

  const suggestions = [
    "Increase number of quantified achievements. Try using Google's X-Y-Z formula: 'Accomplished [X] as measured by [Y], by doing [Z]'.",
    "Integrate TypeScript and Docker keywords, as they are heavily looked for in junior frontend/fullstack profiles.",
    "Add direct hyperlink tags to your GitHub profile and specific project repos."
  ];

  // Suggesting concrete items from data
  const suggestedCerts = certifications.slice(0, 2);
  const suggestedProjs = projects.slice(0, 2);
  const suggestedRes = resources.slice(2, 4);

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans pb-10 max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('/career')}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors bg-transparent border-none cursor-pointer"
      >
        <ArrowLeft size={14} />
        Back to Dashboard
      </button>

      <CareerHero
        category="Placement Prep Suite"
        title="Resume Review Console"
        description="Optimize your curriculum vitae for Automated Tracking Systems (ATS). Audit structure, verify keyword compatibility, highlight key strengths, and explore growth strategies."
      />

      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center space-y-6 max-w-2xl mx-auto"
          >
            <ResumeUploadZone
              onUploadStart={() => {}}
              onUploadComplete={startAnalysis}
            />

            <div className="text-center space-y-2">
              <span className="text-[10px] text-slate-405 font-extrabold uppercase tracking-widest block">or</span>
              <button
                onClick={loadDemo}
                className="px-4 py-2 border border-indigo-650 text-indigo-650 dark:text-indigo-400 font-bold text-[10px] uppercase tracking-wider rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all flex items-center gap-2"
              >
                <Sparkles size={12} />
                Load Demo Analysis
              </button>
            </div>
          </motion.div>
        )}

        {step === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-20 space-y-4 max-w-md mx-auto text-center"
          >
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-full animate-bounce text-indigo-650 dark:text-indigo-400">
              <Brain size={36} />
            </div>
            <h4 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider animate-pulse">
              Parsing Document Nodes...
            </h4>
            <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed font-semibold">
              Exposing text blocks, detecting domain keywords, and executing formatting alignment rules.
            </p>
          </motion.div>
        )}

        {step === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-premium">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950 rounded-lg text-indigo-650 dark:text-indigo-400">
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">{fileName}</h4>
                  <span className="text-[10px] text-slate-400 block font-mono">Target Role: Frontend Engineer (Junior)</span>
                </div>
              </div>
              <button
                onClick={() => setStep('upload')}
                className="px-3.5 py-2 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl text-[10px] font-bold uppercase tracking-wider"
              >
                Re-upload
              </button>
            </div>

            {/* Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {/* ATS Meter widget */}
              <AtsMeter score={mockAtsScore} breakdown={mockBreakdown} />

              {/* Checklist and Strengths */}
              <div className="md:col-span-2 space-y-6">
                <CareerSection title="Overview & Strengths" icon="check">
                  <div className="space-y-3">
                    {strengths.map((str, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl">
                        <span className="text-xs text-emerald-500 font-bold">✓</span>
                        <p className="text-xs text-slate-655 dark:text-slate-400 font-semibold leading-relaxed">{str}</p>
                      </div>
                    ))}
                  </div>
                </CareerSection>

                <CareerSection title="Actionable Suggestions" icon="warning">
                  <div className="space-y-3">
                    {suggestions.map((sug, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl">
                        <span className="text-xs text-amber-500 font-bold">!</span>
                        <p className="text-xs text-slate-655 dark:text-slate-400 font-semibold leading-relaxed">{sug}</p>
                      </div>
                    ))}
                  </div>
                </CareerSection>
              </div>
            </div>

            {/* Recommendations Component */}
            <ResumeSuggestions
              detectedSkills={detectedSkills}
              missingKeywords={missingKeywords}
              suggestedCertifications={suggestedCerts}
              suggestedProjects={suggestedProjs}
              suggestedResources={suggestedRes}
              onCertClick={(id) => navigate('/career/certifications')}
              onProjectClick={(id) => navigate('/career/projects')}
              onResourceClick={(url) => window.open(url, '_blank')}
            />

            {/* Interactive Checklist & Downloads */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-premium md:col-span-2 space-y-4">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-indigo-650 dark:text-indigo-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
                  <CheckSquare size={16} />
                  Self-Auditing Checklist
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                        item.checked
                          ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900 text-slate-850 dark:text-slate-200 font-bold'
                          : 'bg-white dark:bg-slate-950 border-slate-150 dark:border-slate-850 text-slate-600 dark:text-slate-400 font-semibold'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => {}}
                        className="accent-indigo-600 shrink-0"
                      />
                      <span className="text-[11px] leading-normal">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Placeholder report download */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-premium flex flex-col justify-between items-center text-center space-y-4">
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Download Evaluation Report</h4>
                  <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">Get a detailed PDF audit mapping all formatting flaws and recommended fixes.</p>
                </div>
                <button
                  onClick={() => alert("Downloading detailed evaluation analysis report PDF...")}
                  className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={14} />
                  Download Report
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeReview;
