import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Map, CheckCircle2, ChevronRight, Circle, Sparkles } from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { THEME_COLOR_MAP } from '../../components/StudentHubTheme';

const CareerRoadmap = () => {
  const navigate = useNavigate();
  const { profile } = useStudent();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  // Static roadmap milestones
  const milestones = [
    {
      id: 1,
      title: "Foundations & Coding Basics",
      description: "Master a primary language (Python, JavaScript, Go, Java) and Core Data Structures & Algorithms (DSA). Solve 100+ basic tasks.",
      status: "completed",
      time: "Month 1-2",
      tasks: [
        "Complete Python/JavaScript syntax bootcamp.",
        "Master Arrays, Lists, Maps, and Stack structures.",
        "Practice daily coding challenges on Leetcode."
      ]
    },
    {
      id: 2,
      title: "Domain Specialization",
      description: "Deep dive into your target role stack. Pick up frameworks, backend servers, databases, or statistical modeling libraries.",
      status: "current",
      time: "Month 3-4",
      tasks: [
        "Learn core web frameworks (React.js, FastAPI, Node.js).",
        "Understand databases (PostgreSQL relational and MongoDB schemas).",
        "Build secure RESTful API integrations."
      ]
    },
    {
      id: 3,
      title: "Portfolio Development",
      description: "Assemble portfolio-grade projects. Build applications, document designs, set up continuous integrations (CI/CD), and push to GitHub.",
      status: "upcoming",
      time: "Month 5",
      tasks: [
        "Create 2 portfolio-grade projects from Project Studio.",
        "Write clean README specifications and host live URLs.",
        "Contribute to open-source or publish modular packages."
      ]
    },
    {
      id: 4,
      title: "Placement Preparation & Mocks",
      description: "Refine resumes, publish LinkedIn bios, study technical questionnaires, and practice mock behavioral defenses.",
      status: "upcoming",
      time: "Month 6",
      tasks: [
        "Draft CV using clean action-verb templates.",
        "Practice 50+ domain interview questionnaires.",
        "Attend mock scheduling calls with mentors."
      ]
    },
    {
      id: 5,
      title: "Target Applications & Placements",
      description: "Leverage referral connections, monitor placement schedules, run application cold emails, and land target career roles.",
      status: "upcoming",
      time: "Ongoing",
      tasks: [
        "List target dream companies and contact recruiters.",
        "Submit portfolios across job platform boards.",
        "Complete technical tests and secure offer letters."
      ]
    }
  ];

  const [activeStep, setActiveStep] = useState(2);

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans pb-10 max-w-4xl mx-auto">
      {/* Back button */}
      <button 
        onClick={() => navigate('/career')}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Dashboard
      </button>

      {/* Header Banner */}
      <div className={`bg-gradient-to-r ${theme.gradient} border ${theme.border} p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-xl text-white`}>
        <div className="absolute right-0 top-0 w-80 h-80 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
            Interactive Tracks
          </span>
          <h1 className="text-2xl md:text-3xl font-black mt-3 font-heading">
            Career Roadmap
          </h1>
          <p className="text-slate-200 text-xs md:text-sm mt-1 max-w-xl leading-relaxed">
            Visualize your structured milestone-by-milestone journey to target placements. Complete checkpoints to progress your profile readiness score.
          </p>
        </div>
      </div>

      {/* Main Roadmap Timeline Layout */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-2xl shadow-premium space-y-8">
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
          <Map size={16} />
          Your Milestones Timeline
        </h3>

        <div className="relative border-l-2 border-l-slate-200 dark:border-l-slate-800 pl-8 ml-4 space-y-10">
          {milestones.map((step) => {
            const isCompleted = step.status === 'completed';
            const isCurrent = step.status === 'current';
            const isUpcoming = step.status === 'upcoming';
            const isActive = activeStep === step.id;

            return (
              <div key={step.id} className="relative">
                {/* Node indicator icons */}
                <span 
                  onClick={() => setActiveStep(step.id)}
                  className={`absolute -left-[45px] top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all z-10 ${
                    isCompleted 
                      ? 'bg-emerald-500 border-emerald-400 text-white shadow-sm'
                      : isCurrent
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md scale-110'
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={16} />
                  ) : isCurrent ? (
                    <Sparkles size={14} className="animate-pulse" />
                  ) : (
                    <Circle size={10} className="fill-current" />
                  )}
                </span>

                {/* Content Card */}
                <div 
                  className={`p-5 rounded-2xl border transition-all duration-300 ${
                    isActive 
                      ? 'border-indigo-500/30 bg-slate-50/50 dark:bg-slate-950/40 shadow-sm' 
                      : 'border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{step.id}. {step.title}</span>
                      {isCurrent && (
                        <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-mono font-bold uppercase">
                          Active Step
                        </span>
                      )}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold font-mono">{step.time}</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-450 leading-relaxed font-semibold">
                    {step.description}
                  </p>

                  {/* Tasks Sublist */}
                  {isActive && (
                    <div className="mt-4 border-t border-slate-200/60 dark:border-slate-800/60 pt-4 space-y-2">
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">Required Checklist Tasks:</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {step.tasks.map((task, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-start gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 text-xs font-semibold text-slate-700 dark:text-slate-400"
                          >
                            <input 
                              type="checkbox" 
                              defaultChecked={isCompleted} 
                              className="mt-0.5 accent-indigo-600 cursor-pointer"
                            />
                            <span>{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CareerRoadmap;
