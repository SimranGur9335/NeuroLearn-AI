import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Users, 
  Settings, 
  Sparkles,
  ArrowRight,
  School,
  CheckCircle2
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { COLLEGE_THEMES } from '../data/academicData';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { setRole, institution, setInstitution } = useStudent();

  const roles = [
    {
      id: 'student',
      title: 'Engineering Student',
      description: 'Access your active roadmap, study analytics, daily coding quests, and take skill-check quizzes.',
      icon: GraduationCap,
      color: 'from-blue-500 to-indigo-600',
      path: '/dashboard'
    },
    {
      id: 'faculty',
      title: 'Faculty Member',
      description: 'Monitor class analytics, check attendance ratios, audit at-risk lists, and review AI student grade forecasts.',
      icon: Users,
      color: 'from-purple-500 to-pink-600',
      path: '/faculty/dashboard'
    },
    {
      id: 'admin',
      title: 'Platform Admin',
      description: 'Manage Faculty/Faculty registries, publish and configure courses, inspect server load logs, and database health.',
      icon: Settings,
      color: 'from-emerald-500 to-teal-600',
      path: '/admin/dashboard'
    }
  ];

  const handleRoleClick = (roleId, path) => {
    setRole(roleId);
    navigate(path);
  };

  const currentTheme = COLLEGE_THEMES[institution] || COLLEGE_THEMES.coep;

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center relative font-sans p-6 overflow-y-auto">
      {/* Grid Overlay Graphic */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-4xl w-full relative z-10 space-y-8 py-8">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className={`bg-gradient-to-r ${currentTheme.color} p-2 rounded-xl text-white shadow-lg`}>
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <span className="font-extrabold text-sm tracking-wider uppercase text-slate-400">
              Institutional Gatekeeper
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Academic Intelligence Gateway
          </h1>
          <p className="text-slate-400 text-xs md:text-sm max-w-md mx-auto">
            Authorized portal for SPPU affiliated and autonomous universities in Pune District.
          </p>
        </div>

        {/* Institution Tenant Selector */}
        <div className="bg-slate-900/50 border border-slate-900 p-5 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <School size={16} className="text-slate-500" />
            <span>Select Campus Deployment Tenant</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {Object.values(COLLEGE_THEMES).map((theme) => {
              const isSelected = institution === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => setInstitution(theme.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[90px] relative overflow-hidden ${
                    isSelected 
                      ? `bg-slate-900 border-indigo-500 shadow-md shadow-indigo-950/20` 
                      : 'bg-slate-950/30 border-slate-900/80 hover:border-slate-800 hover:bg-slate-900/20'
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className={`text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {theme.logoText}
                    </span>
                    {isSelected && <CheckCircle2 size={12} className="text-indigo-400 shrink-0 mt-0.5" />}
                  </div>
                  <div className="mt-2.5">
                    <span className="text-xs font-bold text-white block truncate">{theme.shortName}</span>
                    <span className="text-[9px] text-slate-500 block truncate">{theme.accreditation.split('|')[0]}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Roles grid */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
            Choose Workspace Role
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((roleInfo, idx) => {
              const Icon = roleInfo.icon;
              
              return (
                <motion.div
                  key={roleInfo.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  onClick={() => handleRoleClick(roleInfo.id, roleInfo.path)}
                  className="bg-slate-900/40 border border-slate-900 hover:border-slate-800 rounded-3xl p-6 transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden cursor-pointer flex flex-col justify-between min-h-[290px] hover:shadow-xl hover:shadow-indigo-950/10"
                >
                  {/* Radial color glow on hover */}
                  <div className={`absolute -right-10 -top-10 w-32 h-32 bg-radial-gradient(circle,rgba(99,102,241,0.1)_0%,transparent_70%) pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity`} />
                  
                  <div>
                    <div className={`bg-gradient-to-br ${roleInfo.color} p-4 rounded-2xl w-fit text-white shadow-md`}>
                      <Icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mt-6 group-hover:text-indigo-400 transition-colors">
                      {roleInfo.title}
                    </h3>
                    <p className="text-slate-400 text-xs mt-3 leading-relaxed">
                      {roleInfo.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-900 flex justify-between items-center text-xs font-semibold text-slate-500 group-hover:text-indigo-400 transition-colors">
                    <span>Authorized Entry</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer info link */}
        <div className="text-center space-y-1.5 text-[10px] text-slate-500">
          <p className="font-semibold text-slate-400">{currentTheme.name}</p>
          <p>{currentTheme.accreditation}</p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
