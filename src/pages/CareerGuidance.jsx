import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  Award, 
  ChevronRight, 
  X,
  Target,
  GraduationCap
} from 'lucide-react';
import { CAREER_TRACKS } from '../data/data';

const CareerGuidance = () => {
  const [selectedTrack, setSelectedTrack] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Intro Header */}
      <div>
        <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">Placement & Career Pathing</p>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Career Integration Suite</h2>
        <p className="text-slate-500 text-xs mt-1">
          Bridge the gap between academic subjects and industry benchmarks. Map certificate vouchers and salary progression to your study roadmap.
        </p>
      </div>

      {/* Grid List of Tracks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CAREER_TRACKS.map((track) => (
          <div 
            key={track.id}
            onClick={() => setSelectedTrack(track)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 group"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="bg-indigo-500/10 text-indigo-500 p-2.5 rounded-xl">
                  <Briefcase size={20} />
                </div>
                <span className="text-[10px] text-emerald-500 font-black uppercase bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/10 flex items-center gap-1">
                  <TrendingUp size={10} />
                  {track.growthRate.split(' ')[0]} Growth
                </span>
              </div>

              <h3 className="font-extrabold text-slate-800 dark:text-white text-base md:text-lg leading-tight">
                {track.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 leading-relaxed line-clamp-3">
                {track.description}
              </p>

              {/* Skills Pills */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {track.skills.slice(0, 4).map((skill, sIdx) => (
                  <span key={sIdx} className="bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-medium text-[9px] px-2 py-0.5 rounded border border-slate-200/40 dark:border-slate-800/40">
                    {skill}
                  </span>
                ))}
                {track.skills.length > 4 && (
                  <span className="text-slate-400 text-[9px] font-semibold self-center ml-1">+{track.skills.length - 4} more</span>
                )}
              </div>
            </div>

            {/* Bottom Salary Benchmark Indicator */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Entry Salary Benchmark</span>
                <span className="font-extrabold text-slate-700 dark:text-slate-250 text-sm mt-0.5 block">{track.salaryBeginner}</span>
              </div>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Explore Tracks
                <ChevronRight size={14} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Slide-out detail drawer */}
      <AnimatePresence>
        {selectedTrack && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTrack(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl h-full flex flex-col justify-between z-10"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                <div>
                  <span className="text-[10px] text-indigo-500 font-extrabold uppercase">Career Target Profile</span>
                  <h3 className="font-black text-base md:text-lg text-slate-800 dark:text-white mt-0.5 leading-tight">
                    {selectedTrack.title}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedTrack(null)}
                  className="p-1.5 rounded-lg border border-slate-250 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-450 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Scope & Role Description</h4>
                  <p className="text-slate-600 dark:text-slate-350 text-xs leading-relaxed">
                    {selectedTrack.description}
                  </p>
                </div>

                {/* Salary Benchmarks */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Salary Progressions</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl">
                      <span className="text-[9px] text-slate-450 uppercase block font-bold">Entry Level (Junior)</span>
                      <span className="text-lg font-extrabold text-slate-700 dark:text-slate-200 mt-1 block">{selectedTrack.salaryBeginner}</span>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl">
                      <span className="text-[9px] text-slate-450 uppercase block font-bold">Experienced (Senior/Principal)</span>
                      <span className="text-lg font-extrabold text-emerald-500 mt-1 block">{selectedTrack.salaryExperienced}</span>
                    </div>
                  </div>
                </div>

                {/* Skills required list */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Key Core Skill Competencies</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTrack.skills.map((skill, index) => (
                      <span key={index} className="bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 border border-indigo-500/10 text-xs font-bold px-3 py-1 rounded-xl">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Certifications suggested mapping */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Target Industry Credentials</h4>
                  <div className="space-y-2.5">
                    {selectedTrack.certifications.map((cert, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-slate-150 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-950/40"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Award size={16} className="text-indigo-500 shrink-0" />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{cert.name}</span>
                        </div>
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded shrink-0 ${
                          cert.difficulty === "Easy" ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' :
                          cert.difficulty === "Medium" ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400' :
                          cert.difficulty === "Hard" ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' :
                          'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400'
                        }`}>
                          {cert.difficulty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer footer link */}
              <div className="p-5 border-t border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-950">
                <button
                  onClick={() => setSelectedTrack(null)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold shadow-md cursor-pointer"
                >
                  Configure Career Study Goals
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CareerGuidance;
