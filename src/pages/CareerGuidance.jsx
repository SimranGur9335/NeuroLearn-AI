import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  Award, 
  ChevronRight, 
  X, 
  Target, 
  GraduationCap, 
  ArrowRight, 
  Search, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  ShieldAlert, 
  Cpu, 
  Sparkles, 
  AlertCircle, 
  Compass, 
  HelpCircle, 
  BarChart3, 
  Layers, 
  Lock, 
  ExternalLink, 
  CheckCircle
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { 
  CAREER_ROLES, 
  COMPANIES, 
  INDUSTRY_TRENDS, 
  RESOURCE_LIBRARY, 
  PLACEMENT_TOOLKIT 
} from '../data/careerData';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { apiFetch } from '../services/api';

const CareerGuidance = () => {
  const { nodeStates, xp } = useStudent() || { nodeStates: {}, xp: 1450 };

  // --- Persistent target career state ---
  const [selectedPathId, setSelectedPathId] = useState(() => {
    return localStorage.getItem('neurolearn_target_career') || 'ai-engineer';
  });

  // --- Active Tab State ---
  const [activeTab, setActiveTab] = useState('dashboard');

  // --- Currency Toggle for Salary Section ---
  const [salaryCurrency, setSalaryCurrency] = useState('INR'); // 'INR' | 'USD'

  // --- Search & Filters for Recruiter Hub ---
  const [companySearch, setCompanySearch] = useState('');
  const [companyDifficulty, setCompanyDifficulty] = useState('all');

  // --- Search & Filters for Learning Resources ---
  const [resourceCategory, setResourceCategory] = useState('All');

  // Fetch target career path from Supabase on mount
  useEffect(() => {
    const fetchTargetCareer = async () => {
      try {
        const res = await apiFetch('/v1/student/target-career');
        if (res.ok) {
          const data = await res.json();
          if (data && data.target_career) {
            setSelectedPathId(data.target_career);
            localStorage.setItem('neurolearn_target_career', data.target_career);
          }
        }
      } catch (err) {
        console.error("Failed to load target career:", err);
      }
    };
    fetchTargetCareer();
  }, []);

  // Set the selected path, sync with local storage, and save to Supabase
  const handleSelectPath = async (id) => {
    setSelectedPathId(id);
    localStorage.setItem('neurolearn_target_career', id);
    try {
      await apiFetch('/v1/student/target-career', {
        method: 'POST',
        body: JSON.stringify({ target_career: id })
      });
    } catch (err) {
      console.error("Failed to sync target career path:", err);
    }
  };

  // Find the selected career metadata
  const activeCareer = useMemo(() => {
    return CAREER_ROLES.find(c => c.id === selectedPathId) || CAREER_ROLES[0];
  }, [selectedPathId]);

  // Translate completed/in-progress student quiz modules into concrete skills
  const acquiredSkills = useMemo(() => {
    const list = [];
    if (!nodeStates) return list;

    if (nodeStates['aiml-1'] === 'completed') list.push('Python', 'Linear Algebra');
    if (nodeStates['aiml-2'] === 'completed') list.push('Supervised Learning', 'Unsupervised Learning', 'Scikit-Learn');
    if (nodeStates['aiml-3'] === 'completed') list.push('Deep Learning', 'Neural Networks', 'PyTorch/Tensorflow');
    if (nodeStates['aiml-4'] === 'completed') list.push('Generative AI', 'LLMs', 'Transformers');

    if (nodeStates['cyber-1'] === 'completed') list.push('Network Security', 'Networking Protocols');
    if (nodeStates['cyber-2'] === 'completed') list.push('Web Vulnerabilities', 'OWASP Top 10');
    if (nodeStates['cyber-3'] === 'completed') list.push('Cryptography', 'PKI');
    if (nodeStates['cyber-4'] === 'completed') list.push('Incident Response', 'Forensics');

    if (nodeStates['fs-1'] === 'completed') list.push('HTML/CSS', 'JavaScript', 'Git');
    if (nodeStates['fs-2'] === 'completed') list.push('React & Node.js', 'React Framework', 'React Hooks');
    if (nodeStates['fs-3'] === 'completed') list.push('REST APIs', 'SQL & NoSQL Databases', 'Databases (SQL/NoSQL)');
    if (nodeStates['fs-4'] === 'completed') list.push('Redis Caching', 'System Design');

    if (nodeStates['cloud-1'] === 'completed') list.push('AWS/Azure', 'Cloud Compute (AWS/GCP)', 'Cloud Basics');
    if (nodeStates['cloud-2'] === 'completed') list.push('Serverless Architecture');
    if (nodeStates['cloud-3'] === 'completed') list.push('IAM Access Security', 'Cloud Security');
    if (nodeStates['cloud-4'] === 'completed') list.push('Docker & Kubernetes', 'Microservices');

    if (nodeStates['devops-1'] === 'completed') list.push('Linux CLI', 'Shell Scripting', 'Linux Systems');
    if (nodeStates['devops-2'] === 'completed') list.push('Docker & Kubernetes', 'Containerization');
    if (nodeStates['devops-3'] === 'completed') list.push('CI/CD', 'CI/CD & Testing frameworks');
    if (nodeStates['devops-4'] === 'completed') list.push('Infrastructure as Code', 'Terraform IaC');

    if (nodeStates['ds-1'] === 'completed') list.push('Statistics');
    if (nodeStates['ds-2'] === 'completed') list.push('Exploratory Data Analysis', 'Data Cleaning');
    if (nodeStates['ds-3'] === 'completed') list.push('Statistical Modeling');
    if (nodeStates['ds-4'] === 'completed') list.push('Distributed Computing');

    return list;
  }, [nodeStates]);

  const inProgressSkills = useMemo(() => {
    const list = [];
    if (!nodeStates) return list;

    if (nodeStates['aiml-1'] === 'in_progress') list.push('Python', 'Linear Algebra');
    if (nodeStates['aiml-2'] === 'in_progress') list.push('Supervised Learning', 'Unsupervised Learning', 'Scikit-Learn');
    if (nodeStates['aiml-3'] === 'in_progress') list.push('Deep Learning', 'Neural Networks', 'PyTorch/Tensorflow');
    if (nodeStates['aiml-4'] === 'in_progress') list.push('Generative AI', 'LLMs', 'Transformers');

    if (nodeStates['cyber-1'] === 'in_progress') list.push('Network Security', 'Networking Protocols');
    if (nodeStates['cyber-2'] === 'in_progress') list.push('Web Vulnerabilities', 'OWASP Top 10');
    if (nodeStates['cyber-3'] === 'in_progress') list.push('Cryptography', 'PKI');
    if (nodeStates['cyber-4'] === 'in_progress') list.push('Incident Response', 'Forensics');

    if (nodeStates['fs-1'] === 'in_progress') list.push('HTML/CSS', 'JavaScript', 'Git');
    if (nodeStates['fs-2'] === 'in_progress') list.push('React & Node.js', 'React Framework', 'React Hooks');
    if (nodeStates['fs-3'] === 'in_progress') list.push('REST APIs', 'SQL & NoSQL Databases', 'Databases (SQL/NoSQL)');
    if (nodeStates['fs-4'] === 'in_progress') list.push('Redis Caching', 'System Design');

    if (nodeStates['cloud-1'] === 'in_progress') list.push('AWS/Azure', 'Cloud Compute (AWS/GCP)', 'Cloud Basics');
    if (nodeStates['cloud-2'] === 'in_progress') list.push('Serverless Architecture');
    if (nodeStates['cloud-3'] === 'in_progress') list.push('IAM Access Security', 'Cloud Security');
    if (nodeStates['cloud-4'] === 'in_progress') list.push('Docker & Kubernetes', 'Microservices');

    if (nodeStates['devops-1'] === 'in_progress') list.push('Linux CLI', 'Shell Scripting', 'Linux Systems');
    if (nodeStates['devops-2'] === 'in_progress') list.push('Docker & Kubernetes', 'Containerization');
    if (nodeStates['devops-3'] === 'in_progress') list.push('CI/CD', 'CI/CD & Testing frameworks');
    if (nodeStates['devops-4'] === 'in_progress') list.push('Infrastructure as Code', 'Terraform IaC');

    if (nodeStates['ds-1'] === 'in_progress') list.push('Statistics');
    if (nodeStates['ds-2'] === 'in_progress') list.push('Exploratory Data Analysis', 'Data Cleaning');
    if (nodeStates['ds-3'] === 'in_progress') list.push('Statistical Modeling');
    if (nodeStates['ds-4'] === 'in_progress') list.push('Distributed Computing');

    return list;
  }, [nodeStates]);

  // Combine the required skills for the selected career path
  const allRequiredSkills = useMemo(() => {
    const req = activeCareer.skillsRequired;
    return [...req.Beginner, ...req.Intermediate, ...req.Advanced];
  }, [activeCareer]);

  // Compute Skill Matches (Completed, In Progress, Missing)
  const skillAnalysis = useMemo(() => {
    const completed = [];
    const inProgress = [];
    const missing = [];

    allRequiredSkills.forEach(skill => {
      // Direct string matching or partial checks
      if (acquiredSkills.includes(skill) || acquiredSkills.some(s => s.toLowerCase() === skill.toLowerCase())) {
        completed.push(skill);
      } else if (inProgressSkills.includes(skill) || inProgressSkills.some(s => s.toLowerCase() === skill.toLowerCase())) {
        inProgress.push(skill);
      } else {
        missing.push(skill);
      }
    });

    return { completed, inProgress, missing };
  }, [allRequiredSkills, acquiredSkills, inProgressSkills]);

  // Compute dynamic Career Readiness Score
  const readinessMetrics = useMemo(() => {
    const total = allRequiredSkills.length;
    const completed = skillAnalysis.completed.length;
    const baseMatchPercent = total > 0 ? (completed / total) * 100 : 0;
    
    // Add dynamic XP factor (10% weight max for 3000 XP)
    const xpBonus = Math.min(10, Math.round((xp / 3000) * 10));
    const finalScore = Math.min(100, Math.round(baseMatchPercent * 0.9 + xpBonus));

    let status = "Novice Explorer";
    let color = "text-red-500 border-red-500/20 bg-red-500/10";
    if (finalScore >= 30 && finalScore < 60) {
      status = "Competent Candidate";
      color = "text-amber-500 border-amber-500/20 bg-amber-500/10";
    } else if (finalScore >= 60 && finalScore < 85) {
      status = "Placement Ready";
      color = "text-indigo-500 border-indigo-500/20 bg-indigo-500/10";
    } else if (finalScore >= 85) {
      status = "Pre-Placement Elite";
      color = "text-emerald-500 border-emerald-500/20 bg-emerald-500/10";
    }

    return { score: finalScore, status, color };
  }, [allRequiredSkills, skillAnalysis, xp]);

  // Map skill name to platform curriculum nodes to suggest next milestone
  const getMilestoneForSkill = (skill) => {
    const sk = skill.toLowerCase();
    if (sk.includes('python') || sk.includes('algebra')) {
      return { domainId: 'ai-ml', nodeName: 'Python Foundations & Linear Algebra' };
    }
    if (sk.includes('supervised') || sk.includes('unsupervised') || sk.includes('scikit')) {
      return { domainId: 'ai-ml', nodeName: 'Supervised & Unsupervised Learning' };
    }
    if (sk.includes('deep learning') || sk.includes('neural') || sk.includes('pytorch') || sk.includes('tensorflow')) {
      return { domainId: 'ai-ml', nodeName: 'Deep Learning & Neural Networks' };
    }
    if (sk.includes('generative') || sk.includes('llm') || sk.includes('transformer')) {
      return { domainId: 'ai-ml', nodeName: 'Generative AI & LLMs' };
    }
    if (sk.includes('network') || sk.includes('protocol')) {
      return { domainId: 'cybersecurity', nodeName: 'Network Security & Protocols' };
    }
    if (sk.includes('vulnerabilities') || sk.includes('owasp')) {
      return { domainId: 'cybersecurity', nodeName: 'Web Vulnerabilities & OWASP Top 10' };
    }
    if (sk.includes('cryptography') || sk.includes('pki')) {
      return { domainId: 'cybersecurity', nodeName: 'Cryptography & PKI' };
    }
    if (sk.includes('incident') || sk.includes('forensics')) {
      return { domainId: 'cybersecurity', nodeName: 'Incident Response & Forensics' };
    }
    if (sk.includes('html') || sk.includes('javascript') || sk.includes('git')) {
      return { domainId: 'full-stack', nodeName: 'Frontend Foundations & Modern ES6+' };
    }
    if (sk.includes('react') || sk.includes('hooks')) {
      return { domainId: 'full-stack', nodeName: 'React Framework & Hooks' };
    }
    if (sk.includes('rest api') || sk.includes('database') || sk.includes('sql')) {
      return { domainId: 'full-stack', nodeName: 'REST APIs, Express & Databases' };
    }
    if (sk.includes('caching') || sk.includes('system design')) {
      return { domainId: 'full-stack', nodeName: 'Caching & System Design' };
    }
    if (sk.includes('aws') || sk.includes('azure') || sk.includes('cloud')) {
      return { domainId: 'cloud', nodeName: 'Global Infrastructure & Core AWS Services' };
    }
    if (sk.includes('serverless') || sk.includes('lambda')) {
      return { domainId: 'cloud', nodeName: 'Serverless Architecture (Lambda & APIs)' };
    }
    if (sk.includes('iam') || sk.includes('cloud security')) {
      return { domainId: 'cloud', nodeName: 'Cloud Security & Identity (IAM)' };
    }
    if (sk.includes('kubernetes') || sk.includes('docker') || sk.includes('microservice')) {
      return { domainId: 'cloud', nodeName: 'Microservices & Kubernetes Orchestration' };
    }
    if (sk.includes('linux') || sk.includes('shell') || sk.includes('bash')) {
      return { domainId: 'devops', nodeName: 'Linux CLI & Shell Scripting' };
    }
    if (sk.includes('docker') || sk.includes('containerization')) {
      return { domainId: 'devops', nodeName: 'Containerization with Docker' };
    }
    if (sk.includes('ci/cd') || sk.includes('actions') || sk.includes('pipeline')) {
      return { domainId: 'devops', nodeName: 'CI/CD & GitHub Actions' };
    }
    if (sk.includes('terraform') || sk.includes('infrastructure as code')) {
      return { domainId: 'devops', nodeName: 'Infrastructure as Code (Terraform)' };
    }
    if (sk.includes('statistics')) {
      return { domainId: 'data-science', nodeName: 'Descriptive & Inferential Statistics' };
    }
    if (sk.includes('exploratory') || sk.includes('cleaning')) {
      return { domainId: 'data-science', nodeName: 'Exploratory Data Analysis (EDA) & Cleaning' };
    }
    if (sk.includes('forecasting') || sk.includes('modeling')) {
      return { domainId: 'data-science', nodeName: 'Statistical Modeling & Forecasting' };
    }
    if (sk.includes('spark') || sk.includes('distributed')) {
      return { domainId: 'data-science', nodeName: 'Distributed Computing & Big Data (Spark)' };
    }
    return null;
  };

  // Determine next milestone
  const nextMilestone = useMemo(() => {
    // Check in-progress first
    for (const skill of skillAnalysis.inProgress) {
      const match = getMilestoneForSkill(skill);
      if (match) return match;
    }
    // Then check missing
    for (const skill of skillAnalysis.missing) {
      const match = getMilestoneForSkill(skill);
      if (match) return match;
    }
    return { domainId: null, nodeName: "Complete portfolio projects and take external certifications." };
  }, [skillAnalysis]);

  // Salary data computed for Recharts
  const rechartsSalaryData = useMemo(() => {
    return activeCareer.salaries.map(s => ({
      name: s.name,
      val: salaryCurrency === 'INR' ? s.salaryINR : s.salaryUSD
    }));
  }, [activeCareer, salaryCurrency]);

  // Filtered Company List
  const filteredCompanies = useMemo(() => {
    return COMPANIES.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(companySearch.toLowerCase()) || 
                            c.commonSkills.some(s => s.toLowerCase().includes(companySearch.toLowerCase()));
      const matchesDiff = companyDifficulty === 'all' || c.difficulty.toLowerCase() === companyDifficulty.toLowerCase();
      return matchesSearch && matchesDiff;
    });
  }, [companySearch, companyDifficulty]);

  // Filtered Resource List
  const filteredResources = useMemo(() => {
    if (resourceCategory === 'All') {
      return Object.entries(RESOURCE_LIBRARY).flatMap(([cat, list]) => 
        list.map(r => ({ ...r, category: cat }))
      );
    }
    return RESOURCE_LIBRARY[resourceCategory]?.map(r => ({ ...r, category: resourceCategory })) || [];
  }, [resourceCategory]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">Placement & Career Intelligence</p>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">Career Intelligence & Placement Operating System</h2>
          <p className="text-slate-500 text-xs mt-1">
            Analyze skill gaps, track salary benchmarks, view recruiter profiles, and discover learning roadmaps dynamically.
          </p>
        </div>
        
        {/* Selected target selector */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-2xl shrink-0">
          <Target size={14} className="text-indigo-500" />
          <span className="text-xs font-semibold text-slate-500">Target Path:</span>
          <select
            value={selectedPathId}
            onChange={(e) => handleSelectPath(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-none border-none cursor-pointer"
          >
            {CAREER_ROLES.map(role => (
              <option key={role.id} value={role.id} className="dark:bg-slate-950 dark:text-white">
                {role.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-250 dark:border-slate-800 pb-px">
        {[
          { id: 'dashboard', label: 'Command Center', icon: Cpu },
          { id: 'intelligence', label: 'Deep Intelligence', icon: Briefcase },
          { id: 'roadmap', label: 'Roadmap & Gaps', icon: Layers },
          { id: 'salaries', label: 'Salaries', icon: DollarSign },
          { id: 'companies', label: 'Recruiters', icon: GraduationCap },
          { id: 'projects', label: 'Projects & Resources', icon: BookOpen },
          { id: 'toolkit', label: 'Placement Toolkit', icon: FileText },
          { id: 'trends', label: 'Industry Trends', icon: TrendingUp }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-all border-b-2 -mb-0.5 cursor-pointer ${
                isActive 
                  ? 'border-indigo-500 text-indigo-650 dark:text-indigo-400' 
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="min-h-[450px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* 1. Command Center Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Readiness Score Card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 bg-indigo-500/5 rounded-full blur-xl" />
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Readiness Index</span>
                        <span className="bg-indigo-500/10 text-indigo-500 p-2 rounded-xl">
                          <Cpu size={16} />
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-slate-800 dark:text-white tracking-tight">
                          {readinessMetrics.score}%
                        </span>
                        <span className="text-xs font-semibold text-slate-400">Complete</span>
                      </div>
                      {/* Bar graph */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full mt-4 overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${readinessMetrics.score}%` }} 
                        />
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${readinessMetrics.color}`}>
                        {readinessMetrics.status}
                      </span>
                    </div>
                  </div>

                  {/* Selected Career Path Summary */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Role Profile</span>
                      <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mt-2 leading-tight">
                        {activeCareer.title}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 leading-relaxed line-clamp-3">
                        {activeCareer.overview}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Demand Status</span>
                        <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 mt-0.5">
                          <TrendingUp size={12} /> {activeCareer.demand}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Experience Difficulty</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block mt-0.5">
                          {activeCareer.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Next Recommended Milestone */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm border-l-4 border-l-indigo-500">
                    <div>
                      <div className="flex items-center gap-1.5 text-indigo-500">
                        <Sparkles size={14} className="shrink-0" />
                        <span className="text-xs font-bold uppercase tracking-wider">Next Recommended Milestone</span>
                      </div>
                      
                      {nextMilestone.domainId ? (
                        <div className="mt-3">
                          <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                            Domain: {nextMilestone.domainId.toUpperCase()}
                          </span>
                          <h4 className="font-extrabold text-slate-800 dark:text-white text-sm mt-2">
                            {nextMilestone.nodeName}
                          </h4>
                          <p className="text-slate-400 text-[11px] mt-1">
                            Complete the corresponding domain quizzes to master the matching skills required.
                          </p>
                        </div>
                      ) : (
                        <div className="mt-3">
                          <h4 className="font-extrabold text-slate-800 dark:text-white text-sm">
                            {nextMilestone.nodeName}
                          </h4>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                      <button 
                        onClick={() => setActiveTab('roadmap')} 
                        className="w-full py-2 bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-100 dark:hover:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 border border-indigo-500/15 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        Launch Skill Gap Analyzer
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Skill Completion Summary Cards */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-sm mb-4">Required Career Skills Tracker</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center gap-4">
                      <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Acquired Skills</span>
                        <span className="text-lg font-black text-emerald-500">{skillAnalysis.completed.length} / {allRequiredSkills.length}</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center gap-4">
                      <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl animate-pulse">
                        <AlertCircle size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">In Progress Skills</span>
                        <span className="text-lg font-black text-amber-500">{skillAnalysis.inProgress.length}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-500/5 border border-slate-500/10 rounded-2xl flex items-center gap-4">
                      <div className="p-3 bg-slate-500/10 text-slate-450 rounded-xl">
                        <X size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Unexplored Skills</span>
                        <span className="text-lg font-black text-slate-600 dark:text-slate-400">{skillAnalysis.missing.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Smart Recommendations & Voucher Hub */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Skill Recommendations */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm lg:col-span-2 space-y-4">
                    <h3 className="font-extrabold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                      <Sparkles size={16} className="text-indigo-500" />
                      AI Skill & Capstone Recommendations ({activeCareer.title})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/30">
                        <span className="text-[9px] font-black uppercase text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded">
                          Advanced Skill
                        </span>
                        <h4 className="font-bold text-xs text-slate-800 dark:text-white mt-2">Distributed Caching (Redis)</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          Highly recommended for {activeCareer.title}. Optimizes database read latency and system scaling during heavy workloads.
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/30">
                        <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                          Target Capstone
                        </span>
                        <h4 className="font-bold text-xs text-slate-800 dark:text-white mt-2">AeroPulse IoT Analytics Engine</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          FastAPI + Redis + K8s cluster modeling IoT telemetry. Perfect project addition to build your placement profile.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Certification Voucher Panel */}
                  <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 border border-indigo-500/25 p-6 rounded-3xl shadow-lg text-white flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 text-indigo-300">
                          <Award size={14} className="text-indigo-400" />
                          Academic Voucher Hub
                        </h4>
                        <span className="text-[9px] bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                          Active
                        </span>
                      </div>
                      <p className="text-[11px] text-indigo-200 leading-relaxed font-medium">
                        Student program benefit: Get 70% off **AWS Certified Solutions Architect** or **CKA** certification exams.
                      </p>
                      <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl mt-3 text-center">
                        <span className="text-[10px] text-slate-450 uppercase font-bold block">Exclusive Promo Code</span>
                        <span className="text-sm font-mono font-bold text-indigo-300 select-all">NEUROLEARN-CLOUD-70</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => alert("Redirecting to AWS Academy portal to register voucher: NEUROLEARN-CLOUD-70")}
                      className="mt-4 py-2 bg-white hover:bg-slate-100 text-indigo-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors focus:outline-none"
                    >
                      Redeem AWS Academy Voucher
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>

                {/* Grid List of 11 Tracks (Career Explorer View inside dashboard) */}
                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-sm mb-4">Explore All Placement Pathways</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {CAREER_ROLES.map((role) => {
                      const isCurrent = role.id === selectedPathId;
                      return (
                        <div 
                          key={role.id}
                          onClick={() => handleSelectPath(role.id)}
                          className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 group ${
                            isCurrent 
                              ? 'border-indigo-500 ring-2 ring-indigo-500/10' 
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start mb-3">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                role.difficulty === "Beginner" ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' :
                                role.difficulty === "Intermediate" ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400' :
                                'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400'
                              }`}>
                                {role.difficulty}
                              </span>
                              <span className="text-[10px] text-emerald-500 font-extrabold flex items-center gap-0.5">
                                <TrendingUp size={10} />
                                {role.demand} Demand
                              </span>
                            </div>

                            <h4 className="font-extrabold text-slate-800 dark:text-white text-sm group-hover:text-indigo-500 transition-colors">
                              {role.title}
                            </h4>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1.5 leading-relaxed line-clamp-3">
                              {role.overview}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-xs">
                            <div>
                              <span className="text-[9px] text-slate-400 block font-semibold">Fresher Salary Average</span>
                              <span className="font-black text-slate-700 dark:text-slate-300 text-xs">
                                ₹{role.salaries[0].salaryINR} LPA / ${(role.salaries[0].salaryUSD/1000)}k
                              </span>
                            </div>
                            <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-[11px] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                              Analyze
                              <ChevronRight size={12} />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Deep Intelligence Tab */}
            {activeTab === 'intelligence' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-8">
                {/* Introduction */}
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                    <Briefcase className="text-indigo-500" size={18} />
                    Deep Career Profile: {activeCareer.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 leading-relaxed">
                    {activeCareer.overview}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Day in the Life Workflow */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Compass size={14} className="text-indigo-500" />
                      Day in the Life (Realistic Workflow)
                    </h4>
                    <div className="relative border-l-2 border-slate-100 dark:border-slate-800 pl-4 space-y-4">
                      {activeCareer.dayInLife.map((step, idx) => (
                        <div key={idx} className="relative">
                          {/* Circle indicator */}
                          <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-900" />
                          <span className="text-[10px] text-indigo-500 font-bold block">{step.time}</span>
                          <p className="text-slate-750 dark:text-slate-350 text-xs font-semibold mt-0.5">
                            {step.task}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Hidden Industry Realities */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <ShieldAlert size={14} className="text-red-500" />
                        Unfiltered Industry Realities
                      </h4>
                      <div className="space-y-2.5">
                        {activeCareer.hiddenTruths.map((truth, idx) => (
                          <div key={idx} className="p-3.5 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-start gap-2.5">
                            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                            <p className="text-red-950 dark:text-red-300 text-xs leading-relaxed font-medium">
                              {truth}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tools Used */}
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Actual Industry Tools & Frameworks</h4>
                      <div className="flex flex-wrap gap-2">
                        {activeCareer.tools.map((tool, idx) => (
                          <span 
                            key={idx}
                            className="bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-800/80 text-slate-750 dark:text-slate-300 text-xs font-bold px-3 py-1 rounded-xl"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Future Scope */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-850">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Target Career Trajectory Progression</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {activeCareer.futureScope.map((scope, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl relative overflow-hidden">
                        {/* Connecting Arrow */}
                        {idx < 3 && (
                          <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-2.5 z-10 text-slate-300 dark:text-slate-800">
                            <ChevronRight size={18} />
                          </div>
                        )}
                        <span className="text-[10px] text-indigo-500 block font-bold">Step {idx + 1}</span>
                        <h5 className="font-extrabold text-slate-800 dark:text-white text-xs mt-1 leading-tight">{scope.level}</h5>
                        <span className="text-[9px] text-slate-400 block mt-1 font-semibold">Exp: {scope.experience}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. Roadmaps & Gap Analyzer Tab */}
            {activeTab === 'roadmap' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visual Placement Roadmap */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-extrabold text-slate-800 dark:text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                      <Compass size={16} className="text-indigo-500" />
                      Step-by-Step Learning Roadmap
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">
                      Sequential progression mapping for {activeCareer.title}.
                    </p>
                  </div>

                  {/* Steps list */}
                  <div className="relative border-l-2 border-slate-100 dark:border-slate-800 pl-6 space-y-6">
                    {activeCareer.roadmap.map((step, idx) => {
                      // Determine status based on index matching completion percentile
                      const activeStepsCount = Math.ceil((readinessMetrics.score / 100) * activeCareer.roadmap.length);
                      
                      let status = "locked";
                      let bgClass = "bg-slate-200 dark:bg-slate-800 text-slate-400";
                      let borderClass = "border-slate-100 dark:border-slate-850";
                      
                      if (idx < activeStepsCount) {
                        status = "completed";
                        bgClass = "bg-emerald-500 text-white";
                        borderClass = "border-emerald-100 dark:border-emerald-950/20";
                      } else if (idx === activeStepsCount) {
                        status = "in_progress";
                        bgClass = "bg-indigo-500 text-white animate-pulse";
                        borderClass = "border-indigo-100 dark:border-indigo-950/20";
                      }

                      return (
                        <div key={idx} className="relative">
                          {/* Badge indicator */}
                          <div className={`absolute -left-[35px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${bgClass}`}>
                            {status === "completed" ? "✓" : idx + 1}
                          </div>
                          
                          <div className={`p-4 border rounded-2xl bg-slate-50/20 dark:bg-slate-950/40 ${borderClass}`}>
                            <p className="text-xs font-bold text-slate-750 dark:text-slate-350 leading-relaxed">
                              {step}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Skill Gap Analyzer */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-extrabold text-slate-800 dark:text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                      <Layers size={16} className="text-indigo-500" />
                      Dynamic Skill Gap Analyzer
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">
                      Compare target skills vs your academic milestones.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {/* Completed */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                        Acquired Competencies ({skillAnalysis.completed.length})
                      </span>
                      {skillAnalysis.completed.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {skillAnalysis.completed.map((skill, idx) => (
                            <span 
                              key={idx} 
                              className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs px-3 py-1 rounded-xl flex items-center gap-1"
                            >
                              <CheckCircle size={12} />
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-450 italic">No skills completed yet. Complete domain courses & quizzes.</span>
                      )}
                    </div>

                    {/* In Progress */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                        In Progress ({skillAnalysis.inProgress.length})
                      </span>
                      {skillAnalysis.inProgress.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {skillAnalysis.inProgress.map((skill, idx) => (
                            <span 
                              key={idx} 
                              className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs px-3 py-1 rounded-xl flex items-center gap-1"
                            >
                              <AlertCircle size={12} className="animate-spin" />
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-450 italic">No skills currently in progress.</span>
                      )}
                    </div>

                    {/* Missing */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                        Missing Competencies ({skillAnalysis.missing.length})
                      </span>
                      {skillAnalysis.missing.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {skillAnalysis.missing.map((skill, idx) => (
                            <span 
                              key={idx} 
                              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-medium text-xs px-3 py-1 rounded-xl flex items-center gap-1"
                            >
                              <Lock size={10} />
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-450 italic">No missing skills! You are fully prepped for this role.</span>
                      )}
                    </div>
                  </div>

                  {/* Informational Alert */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl text-[11px] leading-relaxed text-slate-550 dark:text-slate-400">
                    <span className="font-extrabold text-slate-750 dark:text-slate-200 block mb-1">How is this calculated?</span>
                    The platform maps your completed and in-progress learning domains (e.g. Python linear algebra, network security) to the target skills. Non-platform skills (e.g. wireframing) will render as missing, directing you to complete the corresponding external courses and certifications listed in the resources catalog.
                  </div>
                </div>
              </div>
            )}

            {/* 4. Salaries Tab */}
            {activeTab === 'salaries' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="font-extrabold text-slate-800 dark:text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign size={16} className="text-indigo-500" />
                      Salary Intelligence Progression
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">
                      Verified industry compensation benchmarks by experience tier.
                    </p>
                  </div>
                  
                  {/* Currency Switcher */}
                  <div className="flex border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shrink-0">
                    <button
                      onClick={() => setSalaryCurrency('INR')}
                      className={`px-3 py-1.5 text-[11px] font-bold cursor-pointer ${
                        salaryCurrency === 'INR' 
                          ? 'bg-indigo-650 text-white' 
                          : 'bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                      }`}
                    >
                      INR (Lakhs/Annum)
                    </button>
                    <button
                      onClick={() => setSalaryCurrency('USD')}
                      className={`px-3 py-1.5 text-[11px] font-bold cursor-pointer ${
                        salaryCurrency === 'USD' 
                          ? 'bg-indigo-650 text-white' 
                          : 'bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                      }`}
                    >
                      USD (Annual)
                    </button>
                  </div>
                </div>

                {/* Recharts chart */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-2xl">
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={rechartsSalaryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis 
                        stroke="#64748b" 
                        fontSize={11} 
                        tickLine={false} 
                        tickFormatter={(val) => salaryCurrency === 'INR' ? `₹${val}L` : `$${val/1000}k`} 
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                        labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                        formatter={(val) => [
                          salaryCurrency === 'INR' ? `₹${val} Lakhs Per Annum` : `$${val.toLocaleString()} USD`, 
                          'Average Annual Salary'
                        ]}
                      />
                      <Bar dataKey="val" fill="#6366f1" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {activeCareer.salaries.map((s, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">{s.name} Level</span>
                      <span className="text-base font-black text-slate-700 dark:text-slate-200 mt-1 block">
                        {salaryCurrency === 'INR' ? `₹${s.salaryINR} LPA` : `$${s.salaryUSD.toLocaleString()}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Company Intelligence Hub Tab */}
            {activeTab === 'companies' && (
              <div className="space-y-6">
                {/* Search & Filter bar */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search company or skill requirements..." 
                      value={companySearch}
                      onChange={(e) => setCompanySearch(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <select
                    value={companyDifficulty}
                    onChange={(e) => setCompanyDifficulty(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2 text-xs font-bold text-slate-650 dark:text-slate-400 focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="medium">Medium Difficulty</option>
                    <option value="hard">Hard Difficulty</option>
                    <option value="expert">Expert Difficulty</option>
                  </select>
                </div>

                {/* Companies Profiles Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredCompanies.map((c) => (
                    <div 
                      key={c.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-extrabold text-slate-800 dark:text-white text-base">{c.name}</h4>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          c.difficulty === "Easy" ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' :
                          c.difficulty === "Medium" ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400' :
                          'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                        }`}>
                          {c.difficulty} Difficulty
                        </span>
                      </div>

                      {/* Hiring process */}
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Hiring Pipeline Structure</span>
                        <div className="space-y-2">
                          {c.hiringProcess.map((step, idx) => (
                            <div key={idx} className="flex gap-3 text-xs leading-relaxed">
                              <span className="font-black text-indigo-500 shrink-0">{idx + 1}.</span>
                              <div>
                                <span className="font-bold text-slate-850 dark:text-white">{step.step}</span>:{" "}
                                <span className="text-slate-500 dark:text-slate-400">{step.desc}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Common skills sought */}
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Common Skills Assessed</span>
                        <div className="flex flex-wrap gap-1.5">
                          {c.commonSkills.map((skill, idx) => (
                            <span 
                              key={idx}
                              className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 text-slate-600 dark:text-slate-400 text-[10px] font-bold px-2.5 py-0.5 rounded-lg"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Key Prep Areas */}
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Interview Preparation Focus Areas</span>
                        <ul className="list-disc list-inside text-xs text-slate-500 dark:text-slate-400 space-y-1">
                          {c.preparationAreas.map((area, idx) => (
                            <li key={idx}>{area}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}

                  {filteredCompanies.length === 0 && (
                    <div className="col-span-2 text-center py-12 text-slate-450 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                      <HelpCircle size={36} className="mx-auto text-slate-350 mb-2" />
                      <p className="text-sm font-semibold">No companies match your filters.</p>
                      <p className="text-xs mt-1">Try tweaking the search query or difficulty option.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 6. Projects & Resources Tab */}
            {activeTab === 'projects' && (
              <div className="space-y-8">
                {/* Project Recommendations */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-extrabold text-slate-800 dark:text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                      <Layers size={16} className="text-indigo-500" />
                      Curated Project Recommendations ({activeCareer.title})
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">
                      Build your portfolio with progressive projects mapped directly to target skills.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(activeCareer.projects).map(([level, proj]) => (
                      <div 
                        key={level}
                        className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] text-slate-800 dark:text-white font-extrabold bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded uppercase">
                              {level} Level
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">{proj.stack}</span>
                          </div>

                          <h4 className="font-black text-slate-800 dark:text-white text-sm leading-tight">
                            {proj.title}
                          </h4>
                          <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 leading-relaxed">
                            {proj.desc}
                          </p>
                          <div className="mt-4 p-3 bg-white dark:bg-slate-900/60 border border-slate-150 dark:border-slate-850 rounded-xl text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                            <span className="font-bold text-slate-800 dark:text-white block mb-0.5">Implementation Guidance:</span>
                            {proj.guide}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850">
                          <button className="w-full py-2 bg-indigo-650 hover:bg-indigo-550 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer">
                            Configure Project Goals
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Structured Resource Library */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="font-extrabold text-slate-800 dark:text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen size={16} className="text-indigo-500" />
                        Learning Resource Library
                      </h3>
                      <p className="text-slate-400 text-xs mt-1">
                        Access official manuals, preparation platforms, and certifications.
                      </p>
                    </div>

                    {/* Filter categories */}
                    <div className="flex flex-wrap gap-1 border border-slate-200 dark:border-slate-850 p-1 rounded-xl">
                      {['All', 'Courses', 'Documentation', 'PracticePlatforms', 'Books', 'Certifications'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setResourceCategory(cat)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            resourceCategory === cat 
                              ? 'bg-indigo-500 text-white' 
                              : 'bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                          }`}
                        >
                          {cat === 'PracticePlatforms' ? 'Practice' : cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Resource Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map((res, idx) => (
                      <div 
                        key={idx}
                        className="p-5 border border-slate-150 dark:border-slate-850 rounded-2xl bg-slate-50/20 dark:bg-slate-950/40 flex flex-col justify-between space-y-4"
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] text-indigo-500 font-extrabold uppercase">
                              {res.category === 'PracticePlatforms' ? 'Practice' : res.category}
                            </span>
                            {res.cost && (
                              <span className="text-[9px] text-emerald-500 font-black uppercase">
                                {res.cost}
                              </span>
                            )}
                            {res.difficulty && (
                              <span className="text-[9px] text-slate-450 font-bold uppercase">
                                {res.difficulty}
                              </span>
                            )}
                          </div>

                          <h4 className="font-extrabold text-slate-800 dark:text-white text-xs mt-2 leading-tight">
                            {res.title}
                          </h4>
                          {res.provider && (
                            <span className="text-[10px] text-slate-400 block mt-0.5 font-semibold">
                              Provider: {res.provider}
                            </span>
                          )}
                          {res.author && (
                            <span className="text-[10px] text-slate-400 block mt-0.5 font-semibold">
                              Author: {res.author}
                            </span>
                          )}
                          {res.issuer && (
                            <span className="text-[10px] text-slate-400 block mt-0.5 font-semibold">
                              Issuer: {res.issuer}
                            </span>
                          )}
                          <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-2 leading-relaxed">
                            {res.desc || "Official study references, guidelines, and API catalogs."}
                          </p>
                        </div>

                        {res.url && (
                          <a 
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-1.5 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                          >
                            Explore Resource
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 7. Placement Toolkit Tab */}
            {activeTab === 'toolkit' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={16} className="text-indigo-500" />
                    Placement Preparation Toolkit
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Industry manuals and checklists to clear coding and HR rounds.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Resume writing advice */}
                  <div className="p-5 border border-slate-150 dark:border-slate-850 rounded-2xl bg-slate-50/20 dark:bg-slate-950/40 space-y-3">
                    <h4 className="font-black text-slate-800 dark:text-white text-sm">
                      {PLACEMENT_TOOLKIT.resumeGuidance.title}
                    </h4>
                    <div className="space-y-2">
                      {PLACEMENT_TOOLKIT.resumeGuidance.sections.map((sec, idx) => (
                        <div key={idx} className="text-xs">
                          <span className="font-bold text-slate-700 dark:text-slate-200">{sec.name}</span>:{" "}
                          <span className="text-slate-500 dark:text-slate-400 leading-relaxed">{sec.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ATS Optimization */}
                  <div className="p-5 border border-slate-150 dark:border-slate-850 rounded-2xl bg-slate-50/20 dark:bg-slate-950/40 space-y-3">
                    <h4 className="font-black text-slate-800 dark:text-white text-sm">
                      {PLACEMENT_TOOLKIT.atsOptimization.title}
                    </h4>
                    <ul className="list-disc list-inside text-xs text-slate-550 dark:text-slate-400 space-y-1.5 leading-relaxed">
                      {PLACEMENT_TOOLKIT.atsOptimization.guidelines.map((rule, idx) => (
                        <li key={idx}>{rule}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Interview Checklist */}
                  <div className="p-5 border border-slate-150 dark:border-slate-850 rounded-2xl bg-slate-50/20 dark:bg-slate-950/40 space-y-3">
                    <h4 className="font-black text-slate-800 dark:text-white text-sm">
                      {PLACEMENT_TOOLKIT.interviewPrep.title}
                    </h4>
                    <ul className="list-disc list-inside text-xs text-slate-550 dark:text-slate-400 space-y-1.5 leading-relaxed">
                      {PLACEMENT_TOOLKIT.interviewPrep.steps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Aptitude Prep */}
                  <div className="p-5 border border-slate-150 dark:border-slate-850 rounded-2xl bg-slate-50/20 dark:bg-slate-950/40 space-y-3">
                    <h4 className="font-black text-slate-800 dark:text-white text-sm">
                      {PLACEMENT_TOOLKIT.aptitudePrep.title}
                    </h4>
                    <div className="space-y-2">
                      {PLACEMENT_TOOLKIT.aptitudePrep.topics.map((topic, idx) => (
                        <div key={idx} className="text-xs">
                          <span className="font-bold text-slate-700 dark:text-slate-200">{topic.category}:</span>{" "}
                          <span className="text-slate-500 dark:text-slate-400 leading-relaxed">
                            {topic.topics.join(', ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* HR STAR Questions */}
                <div className="p-5 border border-slate-150 dark:border-slate-850 rounded-2xl bg-slate-50/20 dark:bg-slate-950/40 space-y-3">
                  <h4 className="font-black text-slate-800 dark:text-white text-sm">
                    {PLACEMENT_TOOLKIT.hrInterview.title}
                  </h4>
                  <ul className="list-disc list-inside text-xs text-slate-550 dark:text-slate-400 space-y-1.5 leading-relaxed">
                    {PLACEMENT_TOOLKIT.hrInterview.tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 8. Industry Trends Tab */}
            {activeTab === 'trends' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Trending Skills */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 col-span-2">
                    <div>
                      <h3 className="font-extrabold text-slate-800 dark:text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp size={16} className="text-indigo-500" />
                        Trending Industry Skills
                      </h3>
                      <p className="text-slate-450 text-xs mt-1">Skills displaying highest quarter-on-quarter demand growth.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {INDUSTRY_TRENDS.trendingSkills.map((trend, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl">
                          <div className="flex justify-between items-start">
                            <h4 className="font-extrabold text-slate-800 dark:text-white text-xs">{trend.name}</h4>
                            <span className="text-[9px] text-emerald-500 font-black uppercase bg-emerald-500/10 px-2 py-0.5 rounded">
                              {trend.growth}
                            </span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1.5 leading-relaxed">
                            {trend.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Emerging Technologies */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <div>
                      <h3 className="font-extrabold text-slate-800 dark:text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                        <Cpu size={16} className="text-indigo-500" />
                        Emerging Technologies
                      </h3>
                      <p className="text-slate-450 text-xs mt-1">Tech domains entering production cycles.</p>
                    </div>

                    <div className="space-y-3">
                      {INDUSTRY_TRENDS.emergingTechnologies.map((tech, idx) => (
                        <div key={idx} className="p-3.5 border border-slate-150 dark:border-slate-850 rounded-xl bg-slate-50/20 dark:bg-slate-950/40">
                          <h4 className="font-extrabold text-slate-850 dark:text-slate-250 text-xs">{tech.name}</h4>
                          <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1 leading-relaxed">{tech.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Industry Insights */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-extrabold text-slate-800 dark:text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen size={16} className="text-indigo-500" />
                      Executive Industry Insights
                    </h3>
                    <p className="text-slate-450 text-xs mt-1">Expert opinions on company placement requirements.</p>
                  </div>

                  <div className="space-y-3">
                    {INDUSTRY_TRENDS.industryInsights.map((insight, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl text-xs leading-relaxed text-slate-750 dark:text-slate-350">
                        {insight}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Future Features (Locked Sections) */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
        <h3 className="font-extrabold text-slate-800 dark:text-white text-sm mb-4">Unlocking in Next Curriculum Update</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { title: "AI Career Mentor", desc: "Automated chat feedback." },
            { title: "Resume Analyzer", desc: "ATS checker & keywords." },
            { title: "Mock Interview Arena", desc: "Interactive AI coding panel." },
            { title: "Internship Finder", desc: "Real-time scraper tracker." },
            { title: "Job Match Engine", desc: "Profile mapping filters." },
            { title: "Salary Predictor", desc: "Advanced regression sweeps." }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="p-4 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-900 rounded-2xl relative overflow-hidden group select-none"
            >
              <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-indigo-600 text-white p-1.5 rounded-xl">
                  <Lock size={14} />
                </div>
              </div>
              <div className="flex flex-col h-full justify-between gap-1.5">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Coming Soon</span>
                  <h4 className="font-extrabold text-slate-650 dark:text-slate-400 text-xs mt-1 leading-tight">{item.title}</h4>
                </div>
                <p className="text-[9px] text-slate-450 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CareerGuidance;
