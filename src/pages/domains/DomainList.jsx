import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
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
  Search, 
  ArrowRight,
  TrendingUp,
  Clock,
  Briefcase
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';

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

const DomainList = () => {
  const navigate = useNavigate();
  const { domainsList, activeDomain, setActiveDomain } = useStudent();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    "Software Development",
    "Artificial Intelligence",
    "Cybersecurity",
    "Cloud & DevOps",
    "Networking",
    "Database",
    "Data",
    "Embedded",
    "Emerging Technologies",
    "Other Domains"
  ];

  const handleSetDomain = (domain, e) => {
    e.stopPropagation();
    setActiveDomain(domain);
  };

  const handleViewDetail = (domainKey) => {
    navigate(`/domains/${domainKey}`);
  };

  const filteredDomains = domainsList.filter(domain => {
    const matchesSearch = domain.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          domain.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || domain.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 font-sans text-slate-200"
    >
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/20 p-8 md:p-10 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Learning Paths</span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Dynamic Engineering Tracks</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Select a specialized core engineering domain to unlock custom curated interactive roadmaps, courses, professional certifications, hands-on projects, salary data, and interview prep guides.
          </p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search learning domains or tracks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Category select dropdown for mobile, inline scroll on desktop */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-405 text-slate-400 hover:bg-slate-850 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Domains */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDomains.map((domain) => {
          const Icon = iconMap[domain.icon] || LayoutTemplate;
          const isActive = activeDomain?.id === domain.id || activeDomain?.domain_key === domain.domain_key;

          return (
            <div
              key={domain.id}
              onClick={() => handleViewDetail(domain.domain_key)}
              className={`group flex flex-col justify-between min-h-[350px] bg-slate-900/40 hover:bg-slate-900/80 border rounded-3xl p-6 transition-all duration-300 cursor-pointer relative ${
                isActive 
                  ? 'border-indigo-500 shadow-xl shadow-indigo-500/5 ring-1 ring-indigo-500' 
                  : 'border-slate-800/80 hover:border-slate-700 hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              {/* Highlight ribbon if active */}
              {isActive && (
                <span className="absolute top-4 right-4 bg-indigo-600/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow-md border border-indigo-400/30">
                  <Sparkles size={9} className="animate-pulse" />
                  Active Domain
                </span>
              )}

              <div className="space-y-4">
                {/* Icon & Title */}
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-950 text-indigo-400 border border-slate-800 group-hover:text-indigo-300 group-hover:border-slate-700'
                  }`}>
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-white text-base leading-snug group-hover:text-indigo-350 transition-colors">
                      {domain.title}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-semibold">{domain.category}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                  {domain.description}
                </p>

                {/* Skills Chips */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {domain.skills?.slice(0, 4).map((skill) => (
                    <span 
                      key={skill}
                      className="px-2 py-0.5 bg-slate-950/60 border border-slate-800/50 rounded text-[9px] font-medium text-slate-400"
                    >
                      {skill}
                    </span>
                  ))}
                  {domain.skills?.length > 4 && (
                    <span className="px-2 py-0.5 bg-slate-950/40 rounded text-[9px] font-medium text-slate-550 text-slate-500">
                      +{domain.skills.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Metadata & CTA */}
              <div className="mt-6 space-y-4 pt-4 border-t border-slate-850">
                <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">
                  <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-850">
                    <span className="block text-[8px] text-slate-500">Duration</span>
                    <span className="block mt-0.5 text-white font-extrabold">{domain.duration}</span>
                  </div>
                  <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-850">
                    <span className="block text-[8px] text-slate-500">Difficulty</span>
                    <span className="block mt-0.5 text-indigo-400 font-extrabold">{domain.difficulty}</span>
                  </div>
                  <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-850">
                    <span className="block text-[8px] text-slate-500">Avg Salary</span>
                    <span className="block mt-0.5 text-emerald-400 font-extrabold">{domain.avgSalary || "$90k"}</span>
                  </div>
                </div>

                <div className="flex gap-2.5 text-xs">
                  {!isActive && (
                    <button
                      onClick={(e) => handleSetDomain(domain, e)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 hover:bg-slate-850 font-bold text-slate-300 transition-all cursor-pointer text-center"
                    >
                      Set Active
                    </button>
                  )}
                  <button
                    onClick={() => handleViewDetail(domain.domain_key)}
                    className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10' 
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    View Details
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredDomains.length === 0 && (
        <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4 animate-pulse">
            <Search size={20} />
          </div>
          <h3 className="font-extrabold text-white text-base">No learning tracks matched your query</h3>
          <p className="text-slate-400 text-xs mt-2 leading-relaxed">
            Try adjusting your search keywords or selection category.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default DomainList;
