import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  CheckCircle, 
  PlayCircle, 
  X, 
  BookOpen, 
  Video, 
  Award,
  ArrowRight,
  Sparkles,
  Play
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';

const Roadmap = () => {
  const navigate = useNavigate();
  const { activeDomain, nodeStates } = useStudent();
  const [selectedNode, setSelectedNode] = useState(null);

  const handleNodeClick = (node) => {
    const state = nodeStates[node.id];
    if (state === "locked") {
      alert("This roadmap section is locked! Complete the prerequisite modules first to unlock it.");
      return;
    }
    setSelectedNode(node);
  };

  const handleTakeQuiz = (node) => {
    setSelectedNode(null);
    navigate(`/quiz?node=${node.id}&domain=${activeDomain.id}`);
  };

  return (
    <div className="relative min-h-screen font-sans text-slate-800 dark:text-slate-100 pb-12">
      {/* Intro Header */}
      <div className="mb-8">
        <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">Active Curriculum</p>
        <h2 className="text-2xl font-black text-slate-850 dark:text-white">{activeDomain.title} Roadmap</h2>
        <p className="text-slate-550 dark:text-slate-400 text-xs mt-1">
          Pass module skill quizzes to secure experience points, claim achievements, and advance along the path.
        </p>
      </div>

      {/* Roadmap Graph Area */}
      <div className="max-w-xl mx-auto py-8 relative">
        {/* Connecting Vertical Track */}
        <div className="absolute left-[39px] md:left-1/2 top-4 bottom-4 w-1 bg-slate-200 dark:bg-slate-800 -translate-x-1/2 pointer-events-none rounded-full" />

        {/* Dynamic Nodes Mapping */}
        <div className="space-y-12 relative">
          {activeDomain.nodes.map((node, index) => {
            const state = nodeStates[node.id] || "locked"; // 'completed', 'in_progress', 'locked'
            const isCompleted = state === "completed";
            const isInProgress = state === "in_progress";
            const isLocked = state === "locked";

            return (
              <div 
                key={node.id}
                className={`flex flex-col md:flex-row items-start md:items-center gap-6 relative ${
                  index % 2 === 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Node Milestone Icon Connector */}
                <div 
                  className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 border-4 z-10 transition-all duration-300 relative left-0 md:left-1/2 md:-translate-x-1/2 cursor-pointer shadow-md ${
                    isCompleted ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-500 hover:scale-105' :
                    isInProgress ? 'bg-indigo-50 dark:bg-slate-900 border-indigo-600 text-indigo-600 hover:scale-105 shadow-[0_0_15px_rgba(99,102,241,0.45)]' :
                    'bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                  onClick={() => handleNodeClick(node)}
                >
                  {isCompleted && <CheckCircle size={22} className="fill-current bg-white dark:bg-emerald-950 rounded-full" />}
                  {isInProgress && <Play size={20} className="fill-current text-indigo-600 dark:text-indigo-400 ml-1 animate-pulse" />}
                  {isLocked && <Lock size={18} />}
                  
                  {/* Phase number indicator */}
                  <span className="absolute -top-1.5 -right-1.5 bg-slate-200 dark:bg-slate-800 text-[9px] font-black text-slate-500 w-5 h-5 rounded-full flex items-center justify-center border border-white dark:border-slate-900 shadow-sm">
                    {index + 1}
                  </span>
                </div>

                {/* Node Card Details Panel */}
                <div 
                  onClick={() => handleNodeClick(node)}
                  className={`flex-1 w-full bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
                    isLocked ? 'opacity-65 cursor-not-allowed border-slate-200 dark:border-slate-800/80' :
                    isInProgress ? 'border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-500/10' :
                    'border-slate-200 dark:border-slate-800 hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      node.difficulty === "Beginner" ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-450' :
                      node.difficulty === "Intermediate" ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-450' :
                      'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-450'
                    }`}>
                      {node.difficulty}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{node.duration}</span>
                  </div>

                  <h3 className="font-extrabold text-sm md:text-base text-slate-800 dark:text-white mt-2 leading-snug">
                    {node.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                    {node.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                      Status: {state.replace('_', ' ')}
                    </span>
                    {!isLocked && (
                      <span className="text-indigo-650 dark:text-indigo-400 font-extrabold flex items-center gap-0.5 hover:underline">
                        Open Modules
                        <ArrowRight size={12} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide-out detail Drawer (Framer Motion) */}
      <AnimatePresence>
        {selectedNode && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Dark blur overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNode(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-[2px]"
            />

            {/* Sliding Panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl h-full flex flex-col justify-between z-10"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                <div>
                  <span className="text-[10px] text-indigo-500 font-black uppercase tracking-wider">Syllabus Details</span>
                  <h3 className="font-extrabold text-base md:text-lg text-slate-800 dark:text-white mt-1 leading-snug">
                    {selectedNode.title}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Description</h4>
                  <p className="text-slate-600 dark:text-slate-350 text-xs leading-relaxed font-medium">
                    {selectedNode.description}
                  </p>
                </div>

                {/* Educational Resources */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">Study Resources & Materials</h4>
                  <div className="space-y-2.5">
                    {selectedNode.resources.map((res, rIndex) => {
                      const isVid = res.type === 'video';
                      const isArt = res.type === 'article';
                      const Icon = isVid ? Video : isArt ? BookOpen : Award;

                      return (
                        <a
                          key={rIndex}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-150 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
                        >
                          <div className={`p-2.5 rounded-xl shrink-0 ${
                            isVid ? 'bg-red-500/10 text-red-500' :
                            isArt ? 'bg-blue-500/10 text-blue-505 text-blue-500' :
                            'bg-emerald-500/10 text-emerald-500'
                          }`}>
                            <Icon size={15} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-750 dark:text-slate-200 truncate">{res.title}</p>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 block">{res.type} Reference</span>
                          </div>
                          <ArrowRight size={12} className="text-slate-400 shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Drawer Actions */}
              <div className="p-5 border-t border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 flex flex-col gap-3">
                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <span>Requirement to unlock next node:</span>
                  <span className="text-emerald-500">Score &gt;= 60%</span>
                </div>
                <button
                  onClick={() => handleTakeQuiz(selectedNode)}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles size={15} />
                  Launch Skill Quiz
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Roadmap;
