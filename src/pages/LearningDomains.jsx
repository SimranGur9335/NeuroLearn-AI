import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BrainCircuit, 
  ShieldAlert, 
  LayoutTemplate, 
  Cloud, 
  Infinity, 
  BarChart3,
  Search,
  BookOpen,
  ArrowRight,
  Sparkles,
  Award,
  CheckCircle
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { DOMAINS } from '../data/data';

const iconMap = {
  BrainCircuit: BrainCircuit,
  ShieldAlert: ShieldAlert,
  LayoutTemplate: LayoutTemplate,
  Cloud: Cloud,
  Infinity: Infinity,
  BarChart3: BarChart3
};

const LearningDomains = () => {
  const navigate = useNavigate();
  const { activeDomain, setActiveDomain, nodeStates, searchTerm } = useStudent();
  const [filter, setFilter] = useState("All");

  const categories = ["All", "Popular", "Backend", "Data", "Security", "Ops"];

  // Calculate dynamic progress for each domain based on student context states
  const getDomainProgress = (domainId) => {
    const domain = DOMAINS.find(d => d.id === domainId);
    if (!domain) return 0;
    const totalNodes = domain.nodes.length;
    const completedNodes = domain.nodes.filter(n => nodeStates[n.id] === "completed").length;
    return Math.round((completedNodes / totalNodes) * 100);
  };

  const handleSetDomain = (domain) => {
    setActiveDomain(domain);
  };

  const handleStartRoadmap = (domain) => {
    setActiveDomain(domain);
    navigate('/roadmap');
  };

  // Filter logic
  const filteredDomains = DOMAINS.filter(domain => {
    // Search query filter
    const matchesSearch = domain.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          domain.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    // Category filter
    if (filter === "All") return true;
    if (filter === "Popular") return domain.popular;
    return domain.category === filter;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">Engineering Tracks</p>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">Choose Your Learning Domain</h2>
          <p className="text-slate-500 text-xs mt-1">Select a core computer science or engineering track to build custom skill-graphs.</p>
        </div>
      </div>

      {/* Category Pills Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filter === cat
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Domains Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDomains.map((domain) => {
          const Icon = iconMap[domain.icon] || BookOpen;
          const isActive = activeDomain.id === domain.id;
          const progress = getDomainProgress(domain.id);

          return (
            <div 
              key={domain.id}
              className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 flex flex-col justify-between min-h-[340px] transition-all duration-300 relative ${
                isActive 
                  ? 'ring-2 ring-indigo-500 border-indigo-500 dark:ring-indigo-500 dark:border-indigo-500 shadow-xl' 
                  : 'border-slate-200 dark:border-slate-800 hover:shadow-lg hover:-translate-y-1'
              }`}
            >
              {/* Highlight ribbon if active */}
              {isActive && (
                <span className="absolute top-4 right-4 bg-indigo-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <Sparkles size={10} />
                  Active Domain
                </span>
              )}

              <div>
                {/* Icon & Title */}
                <div className="flex items-center gap-4">
                  <div className={`p-3.5 rounded-2xl ${
                    isActive 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400'
                  }`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 dark:text-white text-base">
                      {domain.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-semibold">{domain.difficulty} • {domain.duration}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-4 leading-relaxed">
                  {domain.description}
                </p>

                {/* Salary benchmark */}
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850 mt-4 text-[11px]">
                  <span className="text-slate-500">Average Starting Package</span>
                  <span className="font-extrabold text-indigo-600 dark:text-cyan-400">{domain.avgSalary}</span>
                </div>
              </div>

              {/* Progress & Actions */}
              <div className="mt-6 space-y-4">
                {/* Progress bar */}
                <div>
                  <div className="flex justify-between items-center text-[10px] mb-1.5 font-bold">
                    <span className="text-slate-400">Track Progress</span>
                    <span className="text-slate-600 dark:text-slate-350">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-850 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 text-xs pt-1">
                  {!isActive && (
                    <button
                      onClick={() => handleSetDomain(domain)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 font-bold text-slate-700 dark:text-slate-350 transition-colors cursor-pointer"
                    >
                      Set Active
                    </button>
                  )}
                  <button
                    onClick={() => handleStartRoadmap(domain)}
                    className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/10' 
                        : 'bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-800 dark:text-white'
                    }`}
                  >
                    Open Roadmap
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredDomains.length === 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-805 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <Search size={22} />
          </div>
          <h3 className="font-extrabold text-slate-800 dark:text-white text-base">No Matching Tracks</h3>
          <p className="text-slate-500 text-xs mt-2">
            No engineering domains found matching "{searchTerm}". Try updating your search queries in the header bar.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default LearningDomains;
