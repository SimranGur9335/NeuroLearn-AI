import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion as motionFramer, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  LayoutTemplate, 
  BrainCircuit, 
  ShieldAlert, 
  Cloud, 
  Infinity, 
  Database, 
  BarChart3, 
  Cpu, 
  Sparkles, 
  Gamepad2,
  Clock,
  Briefcase,
  TrendingUp,
  Award,
  BookOpen,
  FileCode,
  CheckCircle,
  Play,
  Lock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Video,
  Building
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { apiFetch } from '../../services/api';
import { THEME_COLOR_MAP } from '../../components/StudentHubTheme';

const iconMap = {
  LayoutTemplate: LayoutTemplate,
  BrainCircuit: BrainCircuit,
  ShieldAlert: ShieldAlert,
  Cloud: Cloud,
  Infinity: Infinity,
  Database: Database,
  BarChart3: BarChart3,
  Cpu: Cpu,
  Sparkles: Sparkles,
  Gamepad2: Gamepad2
};

const DomainDetail = () => {
  const { domainKey } = useParams();
  const navigate = useNavigate();
  const { activeDomain, setActiveDomain, nodeStates, profile } = useStudent();
  
  const [domain, setDomain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("roadmap"); // roadmap | career | courses | projects | interview
  const [expandedQuizNode, setExpandedQuizNode] = useState(null);
  const [expandedPrepIndex, setExpandedPrepIndex] = useState(null);

  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/v1/domains/${domainKey}`);
        if (res.ok) {
          const data = await res.json();
          setDomain(data);
        } else {
          setError("Failed to fetch domain details. It may not exist.");
        }
      } catch (err) {
        console.error(err);
        setError("Network error: Could not reach the backend service.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [domainKey]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold">Loading track curriculum...</span>
      </div>
    );
  }

  if (error || !domain) {
    return (
      <div className="text-center p-8 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md mx-auto space-y-4 shadow-sm">
        <h3 className="font-extrabold text-red-500 dark:text-red-400 text-base">Error Loading Track</h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs">{error || "Domain not found."}</p>
        <button 
          onClick={() => navigate('/domains')}
          className="px-5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
        >
          Back to Domains
        </button>
      </div>
    );
  }

  const Icon = iconMap[domain.icon] || LayoutTemplate;
  const isActive = activeDomain?.id === domain.id || activeDomain?.domain_key === domain.domain_key;

  // Group roadmap nodes by level: Beginner, Intermediate, Advanced, Expert
  const groupedNodes = {
    Beginner: domain.nodes?.filter(n => n.difficulty === "Beginner") || [],
    Intermediate: domain.nodes?.filter(n => n.difficulty === "Intermediate") || [],
    Advanced: domain.nodes?.filter(n => n.difficulty === "Advanced") || [],
    Expert: domain.nodes?.filter(n => n.difficulty === "Expert") || []
  };

  const handleTakeQuiz = (nodeId) => {
    navigate(`/quiz?node=${nodeId}&domain=${domain.id}`);
  };

  return (
    <motionFramer.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 font-sans text-slate-800 dark:text-slate-100 pb-12"
    >
      {/* Back Button */}
      <button
        onClick={() => navigate('/domains')}
        className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft size={14} />
        Back to Learning Tracks
      </button>

      {/* Domain Core Banner */}
      <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="flex items-center gap-5 relative z-10">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-indigo-500 dark:text-indigo-400 shrink-0 shadow-sm">
            <Icon size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={`text-[10px] ${theme.bg} ${theme.text} font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${theme.border}`}>
                {domain.category}
              </span>
              {isActive && (
                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-1">
                  <Sparkles size={8} />
                  Active Focus
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-850 dark:text-white mt-1 leading-snug">{domain.title}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs max-w-2xl mt-1.5 leading-relaxed">{domain.description}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2.5 w-full md:w-auto relative z-10 shrink-0">
          {!isActive ? (
            <button
              onClick={() => setActiveDomain(domain)}
              className={`px-6 py-3 ${theme.accent} text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/10 hover:opacity-90 transition-opacity cursor-pointer text-center`}
            >
              Set as Active Track
            </button>
          ) : (
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 text-center shadow-sm">
              Active Focus Track
            </div>
          )}
        </div>
      </div>

      {/* Skills list banner */}
      <div className="bg-slate-50 dark:bg-slate-900/10 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 flex flex-wrap items-center gap-2 shadow-sm">
        <span className="text-[10px] text-slate-450 dark:text-slate-500 uppercase font-black tracking-wider mr-2">Core Skills Unlocked:</span>
        {domain.skills?.map((skill) => (
          <span 
            key={skill}
            className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-300 shadow-sm"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800/80 overflow-x-auto pb-px scrollbar-none">
        {[
          { id: "roadmap", label: "Roadmap Curriculum" },
          { id: "career", label: "Career & Placements" },
          { id: "courses", label: "Courses & Certifications" },
          { id: "projects", label: "Hands-on Projects" },
          { id: "interview", label: "Interview Preparation" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 border-b-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'border-indigo-500 dark:border-indigo-400 text-slate-900 dark:text-white'
                : 'border-transparent text-slate-450 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-250'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        <AnimatePresence mode="wait">
          {activeTab === "roadmap" && (
            <motionFramer.div
              key="roadmap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Iterating Roadmap Levels */}
              {["Beginner", "Intermediate", "Advanced", "Expert"].map((level) => {
                const nodes = groupedNodes[level] || [];
                if (nodes.length === 0) return null;

                return (
                  <div key={level} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        level === "Beginner" ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20" :
                        level === "Intermediate" ? "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20" :
                        level === "Advanced" ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20" :
                        "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20"
                      }`}>
                        {level} Level
                      </span>
                      <div className="h-px bg-slate-200 dark:bg-slate-800/80 flex-1" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {nodes.map((node) => {
                        const state = nodeStates[node.id] || "locked"; // 'completed', 'in_progress', 'locked'
                        const isCompleted = state === "completed";
                        const isInProgress = state === "in_progress";
                        const isLocked = state === "locked";

                        return (
                          <div 
                            key={node.id}
                            className={`p-5 rounded-2xl border bg-white dark:bg-slate-900/20 flex flex-col justify-between transition-all duration-200 shadow-sm ${
                              isCompleted ? 'border-emerald-200 dark:border-emerald-500/20 hover:border-emerald-400' :
                              isInProgress ? 'border-indigo-500/40 ring-1 ring-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.05)]' :
                              'border-slate-200 dark:border-slate-850 opacity-80 dark:opacity-65'
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-3">
                                <h4 className="font-extrabold text-sm text-slate-800 dark:text-white leading-snug">{node.title}</h4>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 font-bold">{node.duration}</span>
                              </div>
                              <p className="text-slate-500 dark:text-slate-405 text-[11px] leading-relaxed mt-2">{node.description}</p>
                            </div>

                            {/* Node details / drawer action elements inline */}
                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 flex flex-col gap-3">
                              {/* Study Resources */}
                              {node.resources && node.resources.length > 0 && (
                                <div className="space-y-1.5">
                                  <span className="text-[8px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider block">Recommended Study:</span>
                                  <div className="flex flex-wrap gap-2">
                                    {node.resources.map((res, rIndex) => (
                                      <a
                                        key={rIndex}
                                        href={res.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-850 dark:hover:text-indigo-300 font-bold hover:underline"
                                      >
                                        {res.type === 'video' ? <Video size={10} /> : <BookOpen size={10} />}
                                        {res.title}
                                        <ExternalLink size={8} />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex items-center justify-between mt-1 text-[10px]">
                                <span className="text-slate-450 dark:text-slate-550 font-bold uppercase tracking-wider text-[9px]">
                                  Status: <span className={isCompleted ? "text-emerald-600 dark:text-emerald-400" : isInProgress ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}>
                                    {state.replace('_', ' ')}
                                  </span>
                                </span>
                                {!isLocked ? (
                                  <button
                                    onClick={() => handleTakeQuiz(node.id)}
                                    className={`px-3 py-1.5 rounded-lg font-black uppercase flex items-center gap-1 cursor-pointer transition-colors ${
                                      isCompleted 
                                        ? "bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20" 
                                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                                    }`}
                                  >
                                    <Sparkles size={10} />
                                    {isCompleted ? "Retake Quiz" : "Launch Quiz"}
                                  </button>
                                ) : (
                                  <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500 font-bold py-1 px-2.5 bg-slate-50 dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-850">
                                    <Lock size={10} />
                                    Locked
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </motionFramer.div>
          )}

          {activeTab === "career" && (
            <motionFramer.div
              key="career"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Salary Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl text-center shadow-sm">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Entry Level Salary</span>
                  <div className="text-2xl font-black text-slate-850 dark:text-white mt-1">{domain.salary?.entry || "$50k"}</div>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 block">Junior engineer / 0-2 yrs exp</span>
                </div>
                <div className="bg-indigo-50/50 dark:bg-indigo-955/20 border border-indigo-200 dark:border-indigo-900/40 p-5 rounded-2xl text-center ring-1 ring-indigo-500/5 shadow-sm">
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">Average Mid Level</span>
                  <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">{domain.salary?.mid || domain.avgSalary || "$85k"}</div>
                  <span className="text-[9px] text-indigo-500 dark:text-indigo-300 mt-1 block font-semibold">Mid-tier / 3-5 yrs exp</span>
                </div>
                <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl text-center shadow-sm">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Senior Level Salary</span>
                  <div className="text-2xl font-black text-slate-850 dark:text-white mt-1">{domain.salary?.senior || "$120k"}</div>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 block">Team lead / Architect / 6+ yrs exp</span>
                </div>
              </div>

              {/* Salary Trend Alert */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl flex items-center justify-between text-xs text-emerald-650 dark:text-emerald-400 shadow-sm">
                <div className="flex items-center gap-2.5 font-bold">
                  <TrendingUp size={16} />
                  Market Trend: {domain.salary?.trend || "High Demand (+6% YoY)"}
                </div>
                <span className="text-[10px] opacity-75 font-semibold">Updated 2026 data</span>
              </div>

              {/* Placement Companies */}
              <div className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-850 dark:text-white">Top Placing Partners</h3>
                  <p className="text-slate-450 dark:text-slate-500 text-[10px]">Hiring companies recruiting from this track cohort</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {domain.placements?.map((p, idx) => (
                    <div 
                      key={idx}
                      className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-150 dark:border-slate-850 rounded-2xl flex items-center gap-3 shadow-sm"
                    >
                      <span className="p-2.5 bg-white dark:bg-slate-900 text-indigo-500 dark:text-indigo-400 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <Building size={16} />
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-800 dark:text-white truncate">{p.company}</h4>
                        <p className="text-slate-400 dark:text-slate-500 text-[9px] font-semibold mt-0.5">{p.role}</p>
                        <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold mt-1 block">{p.salary || "Competitive"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motionFramer.div>
          )}

          {activeTab === "courses" && (
            <motionFramer.div
              key="courses"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Courses Section */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-sm text-slate-850 dark:text-white">Recommended Courses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {domain.courses?.map((c, idx) => (
                    <div 
                      key={idx}
                      className="p-4 bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between min-h-[140px] shadow-sm"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[8px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                            {c.provider}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">{c.duration}</span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-800 dark:text-white mt-2 leading-snug">{c.title}</h4>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-850/60">
                        <span className="text-[10px] text-amber-500 font-black">★ {c.rating}</span>
                        {c.url && (
                          <a 
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-indigo-650 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-0.5"
                          >
                            Enroll
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications Section */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-850">
                <h3 className="font-extrabold text-sm text-slate-850 dark:text-white">Industry-Recognized Certifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {domain.certifications?.map((cert, idx) => (
                    <div 
                      key={idx}
                      className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-2xl flex items-center gap-3.5 shadow-sm"
                    >
                      <div className="p-3 bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-805 rounded-xl shadow-sm">
                        <Award size={20} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-xs text-slate-800 dark:text-white leading-tight">{cert.title}</h4>
                        <div className="flex items-center gap-2.5 text-[9px] text-slate-450 dark:text-slate-500 font-bold uppercase mt-1">
                          <span>{cert.issuer}</span>
                          <span>•</span>
                          <span>{cert.cost}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motionFramer.div>
          )}

          {activeTab === "projects" && (
            <motionFramer.div
              key="projects"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Projects List */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-850 dark:text-white">Hands-on Capstone Projects</h3>
                  <p className="text-slate-450 dark:text-slate-500 text-[10px]">Consolidate learning milestones by building complete solutions</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {domain.projects?.map((proj, idx) => (
                    <div 
                      key={idx}
                      className="p-5 bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm"
                    >
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 text-[9px] font-bold rounded">
                            {proj.difficulty} Project
                          </span>
                          <span className="text-[10px] text-slate-400"><FileCode size={14} /></span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-800 dark:text-white mt-3 leading-snug">{proj.title}</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-relaxed mt-2">{proj.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 text-[9px] text-slate-400 dark:text-slate-500 font-bold leading-normal">
                        <span className="block uppercase text-slate-450 dark:text-slate-550 text-[8px] font-black">Project Deliverable:</span>
                        <p className="text-slate-650 dark:text-slate-400 mt-0.5 font-medium">{proj.deliverable}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* General Learning Resources */}
              {domain.learning_resources && domain.learning_resources.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-855">
                  <h3 className="font-extrabold text-sm text-slate-850 dark:text-white">Resource Bibliography</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {domain.learning_resources.map((res, idx) => (
                      <a 
                        key={idx}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-2xl flex items-center justify-between group hover:border-indigo-500 dark:hover:border-slate-700 transition-colors shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="p-2 bg-slate-50 dark:bg-slate-900 text-indigo-500 dark:text-indigo-400 rounded-xl border border-slate-200 dark:border-slate-800 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 shadow-sm">
                            <BookOpen size={14} />
                          </span>
                          <div>
                            <h4 className="font-bold text-xs text-slate-800 dark:text-white truncate max-w-[200px]">{res.title}</h4>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 block uppercase font-bold mt-0.5">{res.type} by {res.author || "Author"}</span>
                          </div>
                        </div>
                        <ExternalLink size={12} className="text-slate-400 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motionFramer.div>
          )}

          {activeTab === "interview" && (
            <motionFramer.div
              key="interview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div>
                <h3 className="font-extrabold text-sm text-slate-850 dark:text-white">Technical Interview Preparation</h3>
                <p className="text-slate-450 dark:text-slate-500 text-[10px]">Review key concepts frequently queried during recruitment cycles</p>
              </div>

              <div className="space-y-3">
                {domain.interview_prep?.map((prep, idx) => {
                  const isExpanded = expandedPrepIndex === idx;

                  return (
                    <div 
                      key={idx}
                      className="border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden bg-white dark:bg-slate-900/10 shadow-sm"
                    >
                      <button
                        onClick={() => setExpandedPrepIndex(isExpanded ? null : idx)}
                        className="w-full flex items-center justify-between p-4 text-left font-bold text-xs text-slate-800 dark:text-slate-205 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                            prep.level === "Advanced" ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20" :
                            prep.level === "Intermediate" ? "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20" :
                            "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
                          }`}>
                            {prep.level}
                          </span>
                          <span className="pr-4 leading-normal text-slate-800 dark:text-slate-200">{prep.question}</span>
                        </div>
                        {isExpanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motionFramer.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-slate-100 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-950/40"
                          >
                            <p className="p-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                              {prep.answer}
                            </p>
                          </motionFramer.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motionFramer.div>
          )}
        </AnimatePresence>
      </div>
    </motionFramer.div>
  );
};

export default DomainDetail;
