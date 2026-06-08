import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  BookOpen, 
  Award, 
  Briefcase, 
  Cpu, 
  ArrowRight,
  MonitorPlay,
  HeartHandshake
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';

const RecommendationEngine = () => {
  const { activeDomain } = useStudent();

  // Skill recommendation grids
  const skillRecs = [
    { title: "Distributed Caching (Redis)", desc: "Essential for microservices scalability. Optimizes database read requests by 90%.", tag: "Advanced", icon: Cpu },
    { title: "SQL Query Optimization", desc: "Indices, query execution planning, and prevent SQLi vulnerabilities.", tag: "Core", icon: BookOpen },
    { title: "CI/CD Deployment Runners", desc: "Automate docker build stages on GitHub self-hosted runners.", tag: "Ops", icon: Award }
  ];

  const projectRecs = [
    {
      title: "AeroPulse IoT Analytics Engine",
      desc: "FastAPI microservices scaled horizontally in K8s container pools, collecting high-frequency sensor telemetry.",
      skills: ["FastAPI", "Kubernetes", "Docker", "Redis"],
      difficulty: "Advanced"
    },
    {
      title: "SecurRoute OAuth Gateway",
      desc: "An API gateway handling route delegation, JWT extraction, rate limiting middleware, and CORS security.",
      skills: ["Node.js", "Express", "JWT", "Redis"],
      difficulty: "Intermediate"
    }
  ];

  const certRecs = [
    { name: "AWS Solutions Architect - Associate", provider: "Amazon Web Services", value: "High Placement Value" },
    { name: "Certified Kubernetes Administrator (CKA)", provider: "CNCF", value: "Premium Platform Value" },
    { name: "CompTIA Security+ Certification", provider: "CompTIA", value: "Core Security Value" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Page Header */}
      <div>
        <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">AI Skill Recommender</p>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Intelligent Recommendations Engine</h2>
        <p className="text-slate-500 text-xs mt-1">
          Dynamic recommendation logs calibrated to match your active track: <strong className="text-indigo-600 dark:text-indigo-400">{activeDomain.title}</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Skills (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-500" />
              Target Skill Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {skillRecs.map((skill, index) => {
                const Icon = skill.icon;
                return (
                  <div key={index} className="p-4 rounded-2xl border border-slate-150 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-950/30 flex flex-col justify-between min-h-[140px]">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[9px] font-black uppercase text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded">
                          {skill.tag}
                        </span>
                        <Icon size={16} className="text-slate-400" />
                      </div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-white leading-snug">{skill.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{skill.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended Capstone Projects */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base mb-4 flex items-center gap-2">
              <Briefcase size={18} className="text-indigo-500" />
              Recommended Capstone Projects
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectRecs.map((proj, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-slate-150 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-950/30 flex flex-col justify-between min-h-[180px]">
                  <div>
                    <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded w-fit">
                      {proj.difficulty}
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-800 dark:text-white mt-3 leading-snug">{proj.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{proj.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 flex flex-wrap gap-1">
                    {proj.skills.map((sk, sIdx) => (
                      <span key={sIdx} className="text-[9px] bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 px-2 py-0.5 rounded text-slate-400 font-bold">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Certifications & Careers (1 col) */}
        <div className="space-y-6">
          {/* Target Certifications */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base mb-4 flex items-center gap-2">
              <Award size={18} className="text-indigo-500" />
              Suggested Certifications
            </h3>
            <div className="space-y-3">
              {certRecs.map((cert, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-950/40 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-250 block">{cert.name}</span>
                    <span className="text-[10px] text-slate-450">{cert.provider}</span>
                  </div>
                  <span className="text-[9px] font-black uppercase text-indigo-500">{cert.value.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Advisor AI Recommendations Info */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-900/50 p-6 rounded-3xl shadow-xl text-white flex flex-col justify-between min-h-[160px]">
            <div>
              <h4 className="font-extrabold text-sm flex items-center gap-2">
                <HeartHandshake size={16} className="text-indigo-400 animate-pulse" />
                Smart Advisor Active
              </h4>
              <p className="text-[11px] text-slate-350 leading-relaxed mt-2">
                Our models analyze other engineering students in your campus major. Students who complete the **AWS Solutions Architect** certification secure tier-1 placement rates 32% faster.
              </p>
            </div>
            <button className="mt-4 py-2 bg-white hover:bg-slate-100 text-indigo-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer">
              Register Voucher Code
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RecommendationEngine;
