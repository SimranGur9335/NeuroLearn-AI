import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, Star } from 'lucide-react';
import { certifications } from '../data/certifications';
import { companies } from '../data/companies';
import { resources } from '../data/resources';
import { placementPrepData } from '../data/placement';

// Mock datasets for skills, projects, careers to search against
const careerList = [
  { id: 'ai-eng', name: 'AI Engineer', type: 'Career', desc: 'Build machine learning algorithms and LLM RAG pipelines.' },
  { id: 'swe', name: 'Software Engineer', type: 'Career', desc: 'Design scalable services and cloud infra networks.' },
  { id: 'frontend', name: 'Frontend Developer', type: 'Career', desc: 'Design rich interactive layouts and state management.' }
];

const skillsList = [
  { id: 'pytorch', name: 'PyTorch', type: 'Skill', desc: 'Deep learning calculations and neural calibrations.' },
  { id: 'react', name: 'React', type: 'Skill', desc: 'Declarative component design and reconciliation rendering.' },
  { id: 'docker', name: 'Docker', type: 'Skill', desc: 'Container packaging and microservices orchestration.' }
];

const projectsList = [
  { id: 'scholar', name: 'Google Scholar Analytics', type: 'Project', desc: 'Ingest research citations and output metric trends.' },
  { id: 'fraud', name: 'Stripe Transaction Fraud Safeguard', type: 'Project', desc: 'Realtime transactional risk categorization system.' }
];

const CareerGlobalSearch = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const lower = query.toLowerCase();
    const matches = [];

    // Search Careers
    careerList.forEach(c => {
      if (c.name.toLowerCase().includes(lower) || c.desc.toLowerCase().includes(lower)) {
        matches.push({ ...c, category: 'Careers', url: '/career' });
      }
    });

    // Search Skills
    skillsList.forEach(s => {
      if (s.name.toLowerCase().includes(lower) || s.desc.toLowerCase().includes(lower)) {
        matches.push({ ...s, category: 'Skills', url: '/career/skills' });
      }
    });

    // Search Projects
    projectsList.forEach(p => {
      if (p.name.toLowerCase().includes(lower) || p.desc.toLowerCase().includes(lower)) {
        matches.push({ ...p, category: 'Projects', url: '/career/projects' });
      }
    });

    // Search Certifications
    certifications.forEach(cert => {
      if (cert.name.toLowerCase().includes(lower) || cert.overview.toLowerCase().includes(lower)) {
        matches.push({ id: cert.id, name: cert.name, type: 'Certification', category: 'Certifications', desc: cert.overview, url: '/career/certifications' });
      }
    });

    // Search Companies
    companies.forEach(comp => {
      if (comp.name.toLowerCase().includes(lower) || comp.overview.toLowerCase().includes(lower)) {
        matches.push({ id: comp.id, name: comp.name, type: 'Company', category: 'Companies', desc: comp.overview, url: '/career/companies' });
      }
    });

    // Search Resources
    resources.forEach(res => {
      if (res.title.toLowerCase().includes(lower) || res.description.toLowerCase().includes(lower)) {
        matches.push({ id: res.id, name: res.title, type: 'Resource', category: 'Resources', desc: res.description, url: '/career/learning' });
      }
    });

    setResults(matches.slice(0, 8));
  }, [query]);

  return (
    <div className="w-full relative z-30">
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
          <Search size={16} />
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Global Search careers, skills, projects, certifications..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-100 placeholder-slate-400 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-650/20 focus:border-indigo-650 transition-all shadow-premium"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-655"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl shadow-xl max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850">
          {results.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                setQuery('');
                if (onSelect) onSelect(item);
              }}
              className="p-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-950/40 cursor-pointer flex justify-between items-center group transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-850 dark:text-white group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                    {item.name}
                  </span>
                  <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 font-mono">
                    {item.type}
                  </span>
                </div>
                <p className="text-[10px] text-slate-450 leading-relaxed font-medium line-clamp-1 max-w-md">
                  {item.desc}
                </p>
              </div>
              <ArrowRight size={12} className="text-slate-400 group-hover:text-indigo-550 group-hover:translate-x-0.5 transition-all" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CareerGlobalSearch;
