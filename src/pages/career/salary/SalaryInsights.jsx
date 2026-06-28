import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, MapPin, Award, Building, Briefcase, Search, ArrowLeft } from 'lucide-react';
import { useStudent } from '../../../context/StudentContext';
import { THEME_COLOR_MAP } from '../../../components/StudentHubTheme';
import { salaryDatabase, topPayingSkills, highestPayingCompanies } from '../data/salary';
import CareerHero from '../components/CareerHero';
import CareerSection from '../components/CareerSection';
import CareerSearch from '../components/CareerSearch';
import CareerTag from '../components/CareerTag';

const SalaryInsights = () => {
  const navigate = useNavigate();
  const { profile } = useStudent();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  // State
  const [compareRoleA, setCompareRoleA] = useState("AI Engineer");
  const [compareRoleB, setCompareRoleB] = useState("Software Engineer");
  const [selectedMainRole, setSelectedMainRole] = useState("AI Engineer");
  const [searchQuery, setSearchQuery] = useState('');

  const dataA = salaryDatabase.find(d => d.role === compareRoleA);
  const dataB = salaryDatabase.find(d => d.role === compareRoleB);
  const mainRoleData = salaryDatabase.find(d => d.role === selectedMainRole);

  const filteredSkills = topPayingSkills.filter(s =>
    s.skill.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        title="Salary Insights & Benchmarks"
        description="Analyze standard compensation brackets across technology roles, locations, and experience tiers. Compare careers and audit high-paying stack selections."
      />

      {/* Grid: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* COMPARISON ENGINE */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-premium space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-indigo-650 dark:text-indigo-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
              <TrendingUp size={16} />
              Side-by-Side Role Comparer
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Select Role A</label>
                <select
                  value={compareRoleA}
                  onChange={(e) => setCompareRoleA(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-bold text-slate-850 dark:text-slate-200 focus:outline-none"
                >
                  {salaryDatabase.map(d => (
                    <option key={d.role} value={d.role}>{d.role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Select Role B</label>
                <select
                  value={compareRoleB}
                  onChange={(e) => setCompareRoleB(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-bold text-slate-850 dark:text-slate-200 focus:outline-none"
                >
                  {salaryDatabase.map(d => (
                    <option key={d.role} value={d.role}>{d.role}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* Role A Info */}
              <div className="p-4 border border-slate-150 dark:border-slate-850 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 space-y-3">
                <h4 className="text-xs font-black text-indigo-650 dark:text-indigo-400 uppercase tracking-wide">{compareRoleA}</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-850 pb-1.5 font-semibold text-slate-655 dark:text-slate-450">
                    <span>Entry</span>
                    <span className="font-mono text-slate-850 dark:text-white font-bold">{dataA?.entry}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-850 pb-1.5 font-semibold text-slate-655 dark:text-slate-450">
                    <span>Mid Career</span>
                    <span className="font-mono text-slate-850 dark:text-white font-bold">{dataA?.mid}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-655 dark:text-slate-450">
                    <span>Senior / Lead</span>
                    <span className="font-mono text-slate-850 dark:text-white font-bold">{dataA?.senior}</span>
                  </div>
                </div>
              </div>

              {/* Role B Info */}
              <div className="p-4 border border-slate-150 dark:border-slate-850 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 space-y-3">
                <h4 className="text-xs font-black text-indigo-650 dark:text-indigo-400 uppercase tracking-wide">{compareRoleB}</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-850 pb-1.5 font-semibold text-slate-655 dark:text-slate-450">
                    <span>Entry</span>
                    <span className="font-mono text-slate-850 dark:text-white font-bold">{dataB?.entry}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-850 pb-1.5 font-semibold text-slate-655 dark:text-slate-450">
                    <span>Mid Career</span>
                    <span className="font-mono text-slate-850 dark:text-white font-bold">{dataB?.mid}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-655 dark:text-slate-450">
                    <span>Senior / Lead</span>
                    <span className="font-mono text-slate-850 dark:text-white font-bold">{dataB?.senior}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* GEOGRAPHIC & EXPERIENCE BREAKDOWNS (Single Role Focus) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-880 p-6 rounded-2xl shadow-premium space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-indigo-650 dark:text-indigo-400 flex items-center gap-2">
                <Briefcase size={16} />
                Detailed Role Breakdowns
              </h3>

              <select
                value={selectedMainRole}
                onChange={(e) => setSelectedMainRole(e.target.value)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-850 dark:text-slate-200 focus:outline-none"
              >
                {salaryDatabase.map(d => (
                  <option key={d.role} value={d.role}>{d.role}</option>
                ))}
              </select>
            </div>

            {/* Location metrics */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <MapPin size={12} className="text-indigo-500" />
                Salary by Location (Selected Role)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(mainRoleData.locations).map(([loc, sal]) => (
                  <div key={loc} className="p-3 border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl">
                    <span className="text-[9px] font-extrabold uppercase tracking-wide text-slate-450 block">{loc}</span>
                    <span className="text-[11px] font-mono font-bold text-slate-850 dark:text-white mt-1 block">{sal}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience Growth Curve */}
            <div className="space-y-4 pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <TrendingUp size={12} className="text-indigo-500" />
                Years of Experience Career Growth Curve
              </span>
              
              <div className="relative pt-6 pb-2">
                {/* Horizontal line */}
                <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-100 dark:bg-slate-850 transform -translate-y-1/2" />
                
                <div className="relative flex justify-between items-center z-10">
                  {mainRoleData.growthProjections.map((proj, i) => (
                    <div key={proj.year} className="flex flex-col items-center text-center space-y-2">
                      <div className="w-5 h-5 rounded-full border-2 border-indigo-650 bg-white dark:bg-slate-950 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-indigo-650" />
                      </div>
                      <div>
                        <span className="text-[8px] font-extrabold uppercase text-slate-450 block">{proj.year}</span>
                        <span className="text-[10px] font-mono font-bold text-slate-800 dark:text-slate-105">₹{proj.salary} LPA Avg</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Skill Premium Multipliers */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Award size={12} className="text-indigo-500" />
                Skill Premium Multipliers (Raise Potential)
              </span>
              <div className="flex flex-wrap gap-3">
                {Object.entries(mainRoleData.skillsPremium).map(([skill, prem]) => (
                  <div key={skill} className="flex items-center gap-2 p-2 border border-slate-100 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-950/40 rounded-xl">
                    <span className="text-xs text-slate-655 dark:text-slate-300 font-bold">{skill}</span>
                    <span className="text-[9px] font-extrabold text-emerald-500 font-mono bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
                      {prem}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Sidebar widgets */}
        <div className="space-y-6">
          
          {/* TOP PAYING SKILLS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-premium space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-indigo-650 dark:text-indigo-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
              <Award size={16} />
              Top Paying Skills
            </h3>
            
            <div className="w-full">
              <CareerSearch
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills..."
              />
            </div>

            <div className="space-y-3">
              {filteredSkills.map((s, idx) => (
                <div key={idx} className="p-3 border border-slate-150 dark:border-slate-850 rounded-xl bg-slate-50/30 dark:bg-slate-950/20 flex justify-between items-center">
                  <div>
                    <h4 className="text-[11px] font-extrabold text-slate-850 dark:text-white uppercase">{s.skill}</h4>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase">{s.marketDemand} Demand</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-emerald-500 font-mono block">{s.premium} Boost</span>
                    <span className="text-[9px] text-slate-405 font-mono">Avg: {s.avgSalary}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HIGHEST PAYING TARGET EMPLOYERS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-880 p-5 rounded-2xl shadow-premium space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-indigo-650 dark:text-indigo-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
              <Building size={16} />
              Top Compensation Employers
            </h3>

            <div className="space-y-3">
              {highestPayingCompanies.map((c) => (
                <div key={c.company} className="p-3 border border-slate-100 dark:border-slate-850 rounded-xl bg-slate-50/20 dark:bg-slate-950/10 flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-slate-850 dark:text-white uppercase">{c.company}</h4>
                    <span className="text-[9px] text-slate-405 font-bold uppercase">{c.difficulty} Interview</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 font-mono block">Entry: {c.entryAvg}</span>
                    <span className="text-[9px] text-slate-400 font-mono">Senior: {c.seniorAvg}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SalaryInsights;
