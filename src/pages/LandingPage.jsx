import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Terminal, 
  Map, 
  Award, 
  Cpu, 
  ChevronRight, 
  Users, 
  BookOpen, 
  ShieldCheck, 
  GraduationCap 
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const stats = [
    { value: "15,000+", label: "Active Engineering Students", icon: Users },
    { value: "94%", label: "Quiz Completion Rate", icon: ShieldCheck },
    { value: "50+", label: "Partner Institutions & Collabs", icon: BookOpen },
    { value: "$108k", label: "Average Graduate Starting Package", icon: Award }
  ];

  const features = [
    {
      title: "Interactive AI Roadmap",
      desc: "No static PDFs. Our system generates a dynamic node-based path where passing quizzes unlocks subsequent branches.",
      icon: Map,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Gamified Quiz Arenas",
      desc: "Test your skills against specialized multiple-choice timers. Gain XP, manage hearts, and earn level badges.",
      icon: GraduationCap,
      color: "from-indigo-500 to-purple-500"
    },
    {
      title: "Career & Salary Forecasting",
      desc: "Direct integration between study topics and high-paying jobs. Map certificates and salary bands to your learning path.",
      icon: Cpu,
      color: "from-pink-500 to-rose-500"
    }
  ];

  const reviews = [
    {
      name: "Rohit Deshmukh",
      role: "B.Tech Computer Science, NIT Nagpur",
      feedback: "NeuroLearn AI solved the 'where to start' problem. The custom DevOps roadmap took me from a basic Linux user to orchestrating Kubernetes configurations. Got placed as a Cloud Engineer last week!",
      rating: "5.0"
    },
    {
      name: "Shruti Sen",
      role: "Information Technology, AIT Pune",
      feedback: "The quiz timers and hearts system made studying feel like playing a game. Getting a score breakdown with detailed explanations taught me more than typical reference books.",
      rating: "4.9"
    },
    {
      name: "Devanshu Sharma",
      role: "Electronics & Communication, DTU",
      feedback: "The Recharts analytics gave me direct visual proof of my strength and weakness areas. I knew exactly what to review before technical placement rounds.",
      rating: "4.8"
    }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen overflow-x-hidden relative font-sans">
      {/* Grid Overlay Graphic */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Top Banner Navigation */}
      <nav className="relative max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between border-b border-slate-900 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-xl text-white">
            <Sparkles size={22} />
          </div>
          <span className="font-black text-2xl bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            NeuroLearn AI
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Platform Features</a>
          <a href="#stats" className="hover:text-white transition-colors">Campus Success</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="bg-indigo-600 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-600/30 text-white font-bold px-5 py-2.5 rounded-xl border border-indigo-500/30 transition-all text-sm cursor-pointer"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 md:px-8 pt-16 pb-20 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold mb-6 tracking-wide uppercase">
              <Sparkles size={14} className="animate-spin-slow" />
              Empowering College Engineering Curricula
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
              AI-Powered <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Personalized Learning
              </span> <br />
              for Engineers.
            </h1>
            <p className="text-slate-400 mt-6 text-base md:text-lg leading-relaxed max-w-lg">
              Unlock a personalized roadmap based on your strengths. Pass quizzes, level up, track streaks, and connect your study goals directly to salaries and certifications.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-8 py-4 rounded-xl text-base shadow-xl shadow-indigo-600/20 flex items-center gap-2 group transition-all cursor-pointer"
              >
                Go to Student Portal
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <a 
                href="#features"
                className="px-6 py-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900 hover:border-slate-700 text-slate-300 font-semibold text-sm transition-all flex items-center justify-center cursor-pointer"
              >
                Learn More
              </a>
            </div>
          </motion.div>

          {/* Right Mock Terminal Code Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-slate-900/80 border border-slate-850 rounded-2xl p-5 shadow-2xl relative"
          >
            <div className="flex items-center gap-1.5 pb-4 border-b border-slate-800">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-[10px] text-slate-500 font-mono ml-3">roadmap_generator.py</span>
            </div>
            <pre className="font-mono text-xs text-indigo-300 leading-relaxed mt-4 overflow-x-auto p-2">
              <code>{`>>> import neurolearn_ai as nl

>>> student = nl.Student(name="Aarav Singh", major="CS")
>>> student.get_active_roadmap()
[
  { "node": "fs-1", "title": "Frontend Foundations", "status": "COMPLETED" },
  { "node": "fs-2", "title": "React & Custom Hooks", "status": "IN_PROGRESS" },
  { "node": "fs-3", "title": "Node.js REST APIs",   "status": "LOCKED" }
]

>>> # Running personalization algorithm
>>> student.analyze_weakness()
"Analyzing quiz logs... Weakness found in React Lifecycle Hooks."
>>> student.recommend_resource()
"Recommended: Jack Herrington on React Render Cycles (YouTube)"
>>> `}</code>
            </pre>
            <div className="absolute -bottom-4 -right-4 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 shadow-md">
              <Terminal size={14} />
              Personalization Engine Active
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 md:px-8 py-20 border-t border-slate-900 relative">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">How NeuroLearn Works</h2>
          <p className="text-slate-400 mt-4 text-sm md:text-base">
            We replace general, boring textbook PDFs with a dynamic development setup tailored for college learners.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div key={index} className="bg-slate-900/40 border border-slate-900 hover:border-slate-800 rounded-3xl p-6 transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden">
                <div className="bg-slate-800 p-3 rounded-2xl w-fit text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mt-6">{feat.title}</h3>
                <p className="text-slate-400 text-sm mt-3 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* College Statistics */}
      <section id="stats" className="bg-slate-900/30 border-y border-slate-900 py-16 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((st, index) => {
              const Icon = st.icon;
              return (
                <div key={index} className="text-center p-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-extrabold text-white">{st.value}</h3>
                  <p className="text-slate-400 text-xs mt-2 uppercase tracking-wider">{st.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="max-w-7xl mx-auto px-4 md:px-8 py-20 relative">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Student Placement Stories</h2>
          <p className="text-slate-400 mt-4 text-sm">
            Hear from engineering students who used our modular quiz arena to level up their core coding capabilities.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, index) => (
            <div key={index} className="bg-slate-900/50 border border-slate-900 rounded-3xl p-6 shadow-md relative flex flex-col justify-between">
              <div>
                <span className="text-yellow-500 font-bold text-sm">★ {rev.rating}</span>
                <p className="text-slate-300 text-sm italic leading-relaxed mt-4">"{rev.feedback}"</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <h4 className="text-white text-sm font-bold">{rev.name}</h4>
                <span className="text-xs text-slate-500">{rev.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Action CTA */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-20 relative">
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-cyan-950 border border-indigo-900/50 rounded-3xl p-8 md:p-12 text-center shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-gradient(circle_at_center,#4f46e5_0%,transparent_70%) opacity-10 pointer-events-none" />
          <h2 className="text-3xl md:text-5xl font-black text-white">Ready to Level Up Your GPA & Placements?</h2>
          <p className="text-slate-300 mt-4 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
            Join thousands of B.Tech / BE engineering students today and build verification analytics professors can rely on.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-8 bg-white hover:bg-slate-100 text-slate-950 font-extrabold px-8 py-4 rounded-xl shadow-lg transition-all transform hover:scale-105 cursor-pointer text-sm"
          >
            Launch Student Portal
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-400" />
            <span className="font-bold text-white">NeuroLearn AI</span>
            <span>© 2026. Faculty Demo Quality. All rights reserved.</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-white transition-colors">Faculty Guidelines</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
