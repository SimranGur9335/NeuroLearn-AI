import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  School, 
  Sparkles, 
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Users,
  Settings,
  CheckCircle2
} from 'lucide-react';
import { apiFetch } from '../services/api';

const THEME_MAP = {
  violet: {
    accent: 'bg-violet-600 hover:bg-violet-500',
    text: 'text-violet-400',
    border: 'border-violet-500/30 hover:border-violet-400',
    glow: 'from-violet-500 to-fuchsia-600 shadow-violet-950/20'
  },
  rose: {
    accent: 'bg-rose-600 hover:bg-rose-500',
    text: 'text-rose-400',
    border: 'border-rose-500/30 hover:border-rose-400',
    glow: 'from-rose-500 to-pink-600 shadow-rose-950/20'
  },
  amber: {
    accent: 'bg-amber-600 hover:bg-amber-500',
    text: 'text-amber-400',
    border: 'border-amber-500/30 hover:border-amber-400',
    glow: 'from-amber-500 to-yellow-600 shadow-amber-950/20'
  },
  indigo: {
    accent: 'bg-indigo-600 hover:bg-indigo-500',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30 hover:border-indigo-400',
    glow: 'from-indigo-500 to-cyan-600 shadow-indigo-950/20'
  }
};

const SelectInstitution = () => {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState([]);
  const [selectedInst, setSelectedInst] = useState(null);
  const [step, setStep] = useState(1); // 1: Select Institution, 2: Select Role
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const res = await apiFetch('/v1/institutions');
        if (res.ok) {
          const data = await res.json();
          setInstitutions(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInstitutions();
  }, []);

  const handleInstitutionSelect = (inst) => {
    setSelectedInst(inst);
    setStep(2);
  };

  const handleRoleSelect = (roleId) => {
    // Navigate to Login with query params or state
    navigate('/login', { 
      state: { 
        institutionId: selectedInst.institution_id,
        role: roleId
      }
    });
  };

  const activeTheme = THEME_MAP[selectedInst?.theme_color] || THEME_MAP.indigo;

  const roles = [
    {
      id: 'student',
      title: 'Student Roster',
      description: 'Access study roadmaps, complete MCQ quiz modules, and track performance scores.',
      icon: GraduationCap,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'faculty',
      title: 'Faculty Member',
      description: 'Conduct class mapping, input attendance, and inspect student metrics.',
      icon: Users,
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'admin',
      title: 'Institution Admin',
      description: 'Administer campus departments, create faculty/student registries, and check server logs.',
      icon: Settings,
      color: 'from-emerald-500 to-teal-600'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Sparkles size={40} className="text-indigo-500 animate-spin" />
        <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mt-6 animate-pulse">
          Loading Campus List...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center relative font-sans p-6 overflow-y-auto">
      {/* Grid Overlay Graphic */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-4xl w-full relative z-10 space-y-8 py-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-950/40">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <span className="font-extrabold text-sm tracking-wider uppercase text-slate-400">
              NeuroLearn Access Portal
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Academic Intelligence Gateway
          </h1>
          <p className="text-slate-400 text-xs md:text-sm max-w-md mx-auto">
            Choose your campus tenant and login role to access study resources and reports.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-slate-900/50 border border-slate-900 p-6 rounded-3xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
                  1. Select Your Campus Tenant
                </span>
                <button 
                  onClick={() => navigate('/apply-institution')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  Onboard your college <ArrowRight size={14} />
                </button>
              </div>

              {institutions.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs bg-slate-950/40 rounded-2xl border border-slate-900">
                  No active campuses found in registry.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {institutions.map((inst) => {
                    const themeObj = THEME_MAP[inst.theme_color] || THEME_MAP.indigo;
                    return (
                      <button
                        key={inst.institution_id}
                        onClick={() => handleInstitutionSelect(inst)}
                        className="p-5 rounded-2xl bg-slate-950/30 border border-slate-900/80 hover:border-slate-800 hover:bg-slate-900/20 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[110px] relative overflow-hidden"
                      >
                        <div className="flex justify-between items-start w-full">
                          {inst.logo_url ? (
                            <img src={inst.logo_url} alt={inst.short_name} className="w-8 h-8 object-contain rounded-lg bg-slate-950 p-0.5 border border-slate-850" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-400 flex items-center justify-center">
                              <School size={16} />
                            </div>
                          )}
                          <span className="text-[9px] font-black tracking-widest uppercase bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                            {inst.short_name}
                          </span>
                        </div>
                        <div className="mt-4">
                          <span className="text-xs font-bold text-white block truncate">{inst.institution_name}</span>
                          <span className="text-[9px] text-slate-500 block truncate">{inst.domain_name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white cursor-pointer transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Institution List
                </button>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-850 px-3.5 py-1.5 rounded-full text-[11px] font-bold text-indigo-400">
                  <School size={12} />
                  <span>Selected: {selectedInst.institution_name}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
                  2. Choose Workspace Role
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {roles.map((roleInfo, idx) => {
                    const Icon = roleInfo.icon;
                    return (
                      <motion.div
                        key={roleInfo.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.08 }}
                        onClick={() => handleRoleSelect(roleInfo.id)}
                        className={`bg-slate-900/40 border border-slate-900 hover:border-slate-800 rounded-3xl p-6 transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden cursor-pointer flex flex-col justify-between min-h-[260px] hover:shadow-xl`}
                      >
                        <div className={`absolute -right-10 -top-10 w-32 h-32 bg-radial-gradient(circle,rgba(99,102,241,0.1)_0%,transparent_70%) pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity`} />
                        
                        <div>
                          <div className={`bg-gradient-to-br ${roleInfo.color} p-4 rounded-2xl w-fit text-white shadow-md`}>
                            <Icon size={24} />
                          </div>
                          <h3 className="text-lg font-bold text-white mt-6 group-hover:text-indigo-400 transition-colors">
                            {roleInfo.title}
                          </h3>
                          <p className="text-slate-400 text-xs mt-3 leading-relaxed">
                            {roleInfo.description}
                          </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-900 flex justify-between items-center text-xs font-semibold text-slate-500 group-hover:text-indigo-400 transition-colors">
                          <span>Authenticate Session</span>
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SelectInstitution;
