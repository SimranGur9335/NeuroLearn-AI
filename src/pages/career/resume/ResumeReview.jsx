import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  FileText, 
  CheckSquare, 
  Download, 
  Sparkles, 
  Brain, 
  Clock, 
  CheckCircle,
  Rocket
} from 'lucide-react';
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

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNotifySubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      const waitlist = JSON.parse(localStorage.getItem('neurolearn_resume_waitlist') || '[]');
      if (!waitlist.includes(email.trim())) {
        waitlist.push(email.trim());
        localStorage.setItem('neurolearn_resume_waitlist', JSON.stringify(waitlist));
      }
    }, 1200);
  };

  // Mock Analysis Results for background blur visualization
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
    "Increase number of quantified achievements. Try using Google's X-Y-Z formula.",
    "Integrate TypeScript and Docker keywords.",
    "Add direct hyperlink tags to your GitHub profile."
  ];

  const suggestedCerts = certifications.slice(0, 2);
  const suggestedProjs = projects.slice(0, 2);
  const suggestedRes = resources.slice(2, 4);

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans pb-10 max-w-5xl mx-auto relative">
      {/* Back button (outside of the blur zone so it remains interactive) */}
      <div className="flex justify-between items-center relative z-20">
        <button
          onClick={() => navigate('/career')}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </button>
      </div>

      {/* Relative parent container holding blurred content and coming-soon banner */}
      <div className="relative rounded-3xl overflow-hidden">
        
        {/* Blurry Background Elements representing the full screen feature set */}
        <div className="filter blur-[5px] opacity-40 pointer-events-none select-none space-y-6 transition-all duration-300">
          <CareerHero
            category="Placement Prep Suite"
            title="Resume Review Console"
            description="Optimize your curriculum vitae for Automated Tracking Systems (ATS). Audit structure, verify keyword compatibility, highlight key strengths, and explore growth strategies."
          />

          <div className="flex flex-col items-center space-y-6 max-w-2xl mx-auto">
            <ResumeUploadZone
              onUploadStart={() => {}}
              onUploadComplete={() => {}}
            />
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-premium">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950 rounded-lg text-indigo-650 dark:text-indigo-400">
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">Samar_Resume_2026.pdf</h4>
                  <span className="text-[10px] text-slate-400 block font-mono">Target Role: Frontend Engineer (Junior)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              <AtsMeter score={mockAtsScore} breakdown={mockBreakdown} />
              
              <div className="md:col-span-2 space-y-6">
                <CareerSection title="Overview & Strengths" icon="check">
                  <div className="space-y-3">
                    {strengths.map((str, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl">
                        <span className="text-xs text-emerald-500 font-bold">✓</span>
                        <p className="text-xs text-slate-655 dark:text-slate-400 font-semibold">{str}</p>
                      </div>
                    ))}
                  </div>
                </CareerSection>
              </div>
            </div>

            <ResumeSuggestions
              detectedSkills={detectedSkills}
              missingKeywords={missingKeywords}
              suggestedCertifications={suggestedCerts}
              suggestedProjects={suggestedProjs}
              suggestedResources={suggestedRes}
              onCertClick={() => {}}
              onProjectClick={() => {}}
              onResourceClick={() => {}}
            />
          </div>
        </div>

        {/* Coming Soon Glassmorphic Centered Banner */}
        <div className="absolute inset-0 z-10 flex items-center justify-center p-6 bg-slate-950/5 dark:bg-slate-950/20 backdrop-blur-[2px]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="max-w-md w-full bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6 relative text-center"
          >
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
            
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-650 dark:text-indigo-400">
                <Rocket size={22} className="animate-bounce" />
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider font-heading">
                ATS Resume Auditor
              </h2>
              <span className="inline-block text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900">
                Coming Soon
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                We're calibrating an NLP-based resume parsing model. Upload your resume to verify formatting correctness, check target keyword weights, and predict placement pipeline matches.
              </p>
            </div>

            {/* Waitlist Subscription */}
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div 
                  key="form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 pt-2 text-left"
                >
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <Clock size={14} className="text-indigo-600" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wide">Join the Waitlist</span>
                  </div>
                  <form onSubmit={handleNotifySubmit} className="flex gap-2">
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@neurolearn.ai"
                      className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-650/20 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none transition-all"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-indigo-600 hover:bg-indigo-750 disabled:bg-slate-100 text-white font-extrabold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0"
                    >
                      {loading ? 'Adding...' : 'Notify Me'}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-2 space-y-3"
                >
                  <div className="mx-auto w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center text-emerald-500">
                    <CheckCircle size={20} className="animate-pulse" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Registered Successfully!</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal max-w-xs mx-auto">
                    We will notify you at <strong className="text-slate-700 dark:text-slate-300">{email}</strong> as soon as the ATS parser model is integrated.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default ResumeReview;
