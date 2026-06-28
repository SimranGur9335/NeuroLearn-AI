import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Map,
  Award,
  Cpu,
  ChevronRight,
  Users,
  BookOpen,
  ShieldCheck,
  GraduationCap,
  CheckCircle2,
  Lock,
  Activity,
  TrendingUp,
  User,
  Star,
  Brain
} from 'lucide-react';
import logo from "../assets/logo.jpeg";


const LandingPage = () => {
  const navigate = useNavigate();

  const stats = [
    { value: "15,000+", label: "Active B.Tech/BE Students", icon: Users },
    { value: "94%", label: "Quiz Completion Rate", icon: ShieldCheck },
    { value: "50+", label: "Partner Engineering Colleges", icon: BookOpen },
    { value: "9.2 LPA", label: "Average Graduate CTC Package", icon: Award }
  ];

  const features = [
    {
      title: "Interactive AI Roadmaps",
      desc: "Dynamically maps out core syllabus topics. Pass multiple-choice checkpoints to unlock corresponding learning nodes.",
      icon: Map,
      color: "text-indigo-650 bg-indigo-50"
    },
    {
      title: "Academic Outcomes & Predictions",
      desc: "Uses cumulative performance logs to forecast CGPA benchmarks, detect backlog risks, and suggest remedial sessions.",
      icon: TrendingUp,
      color: "text-blue-600 bg-blue-50"
    },
    {
      title: "AI Mentorship & Wellness Logs",
      desc: "Integrates conversational learning guidance, focus indicators, stress diagnostics, and custom rest schedules.",
      icon: Brain,
      color: "text-purple-600 bg-purple-50"
    }
  ];

  const reviews = [
    {
      name: "Rohit Deshmukh",
      role: "B.Tech Computer Science, NIT Nagpur",
      feedback: "NeuroLearn AI solved the learning navigation problem. The interactive Devops curriculum aligned study paths directly with recruitment requirements. Got placed as a Cloud Engineer last week!",
      rating: "5.0"
    },
    {
      name: "Shruti Sen",
      role: "Information Technology, AIT Pune",
      feedback: "The quiz timers, lives system, and achievements made studying feel like playing a game. The dashboard analytics gave me direct proof of my weak spots before exams.",
      rating: "4.9"
    },
    {
      name: "Devanshu Sharma",
      role: "Electronics & Communication, DTU",
      feedback: "The CGPA outcome predictions and wellness trackers keep me accountable. My professors use it to monitor weekly syllabus progress and suggest interventions.",
      rating: "4.8"
    }
  ];

  return (
    <div className="bg-white text-slate-800 min-h-screen overflow-x-hidden relative font-sans">

      {/* Top Navigation */}
      <nav className="relative max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between border-b border-slate-100 z-10 bg-white">
        <div className="flex items-center gap-2">

          <div className="h-10 w-10 flex items-center justify-center">
            <img
              src={logo}
              alt="NeuroLearn AI"
              className="h-10 w-10 object-contain"
            />
          </div>

          <span className="font-extrabold text-2xl text-slate-900 tracking-tight">
            NeuroLearn<span className="text-indigo-600 font-medium">.AI</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-650">
          <a href="#features" className="hover:text-indigo-600 transition-colors">Platform Features</a>
          <a href="#demo" className="hover:text-indigo-600 transition-colors">Student View</a>
          <a href="#testimonials" className="hover:text-indigo-600 transition-colors">Success Stories</a>
        </div>
        <button
          onClick={() => navigate('/select-institution')}
          className="bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/10 text-white font-bold px-5 py-2.5 rounded-xl border border-indigo-600/30 transition-all text-sm cursor-pointer"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 md:px-8 pt-16 pb-20 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-100 px-4 py-1.5 rounded-full text-xs font-bold mb-2 tracking-wide uppercase">
              <Sparkles size={13} className="text-indigo-600" />
              Institutional EdTech SaaS Platform
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
              AI-Powered <br />
              <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                Personalized Learning
              </span> <br />
              for Engineers.
            </h1>
            <p className="text-slate-500 text-base md:text-lg leading-relaxed max-w-lg">
              Unlock a personalized roadmap based on your strengths. Pass checkpoints, level up, track streaks, and connect study milestones to GPA metrics and placement forecasting.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/select-institution')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-xl text-base shadow-lg shadow-indigo-600/10 flex items-center gap-2 group transition-all cursor-pointer"
              >
                Go to Institute Portal
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#features"
                className="px-6 py-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 font-bold text-sm transition-all flex items-center justify-center cursor-pointer"
              >
                Learn More
              </a>
            </div>
          </motion.div>

          {/* Right Product Mockup UI (High-fidelity CSS dashboard) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            id="demo"
            className="bg-slate-50 border border-slate-200 p-6 rounded-3xl shadow-xl space-y-6 relative overflow-hidden"
          >
            {/* Header info */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-700 font-black text-sm">
                  AS
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Aarav Singh</h4>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">B.Tech Computer Science • Sem IV</span>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-700 text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Active Tracker
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-2xl border border-slate-200/60 text-center">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Level Badge</span>
                <span className="text-base font-black text-indigo-600">LVL 4</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-slate-200/60 text-center">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Total Experience</span>
                <span className="text-base font-black text-indigo-600">1,250 XP</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-slate-200/60 text-center">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Daily Streak</span>
                <span className="text-base font-black text-indigo-600">5 Days</span>
              </div>
            </div>

            {/* Curriculum Roadmap Node Connections Mockup */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 space-y-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 block pl-0.5">Syllabus Path Roadmap</span>
              <div className="space-y-3 relative">

                {/* Node 1: Completed */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">1. Software Engineering Basics</h5>
                      <p className="text-[9px] text-slate-500 mt-0.5">Syllabus compliance: 100%</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Passed</span>
                </div>

                {/* Node 2: Active */}
                <div className="flex items-center justify-between p-2.5 bg-indigo-50/50 border border-indigo-100 rounded-xl relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <Activity size={16} className="text-indigo-600 shrink-0 animate-pulse" />
                    <div>
                      <h5 className="text-xs font-bold text-indigo-900">2. Object-Oriented Architectures</h5>
                      <p className="text-[9px] text-indigo-700 mt-0.5">Quiz Accuracy: 84%</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded animate-pulse">In Progress</span>
                </div>

                {/* Node 3: Locked */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 opacity-60 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Lock size={16} className="text-slate-400 shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold text-slate-600">3. System Scaling & Microservices</h5>
                      <p className="text-[9px] text-slate-500 mt-0.5">Requires checkpoint clearance</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">Locked</span>
                </div>
              </div>
            </div>

            {/* Prediction Indicator Card */}
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 text-white p-2 rounded-xl">
                  <GraduationCap size={16} />
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-indigo-700 block">AI GPA Forecast</span>
                  <span className="text-sm font-black text-indigo-900">Predicted CGPA: 9.10</span>
                </div>
              </div>
              <span className="text-[9px] font-extrabold uppercase bg-indigo-600 text-white px-2.5 py-1 rounded-lg">
                High Confidence
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 md:px-8 py-20 border-t border-slate-100 bg-slate-50/50 rounded-3xl relative">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">How NeuroLearn Works</h2>
          <p className="text-slate-500 mt-4 text-sm md:text-base leading-relaxed">
            We replace boring, static textbooks with a dynamic LMS console that maps course requirements to actual placements.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div key={index} className="bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md rounded-3xl p-6 transition-all duration-300 group hover:-translate-y-1">
                <div className={`p-3.5 rounded-2xl w-fit ${feat.color}`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-6">{feat.title}</h3>
                <p className="text-slate-500 text-sm mt-3 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* College Statistics */}
      <section id="stats" className="bg-white border-y border-slate-100 py-16 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((st, index) => {
              const Icon = st.icon;
              return (
                <div key={index} className="text-center p-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-655 mb-4">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900">{st.value}</h3>
                  <p className="text-slate-500 text-xs mt-2 font-bold uppercase tracking-wider">{st.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="max-w-7xl mx-auto px-4 md:px-8 py-20 relative">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Student Placement Stories</h2>
          <p className="text-slate-500 mt-4 text-sm md:text-base leading-relaxed">
            Hear from engineering students who used our modular learning curriculum to prepare for top-tier technical rounds.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, index) => (
            <div key={index} className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <div className="space-y-4">
                <div className="flex gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm italic leading-relaxed">"{rev.feedback}"</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200">
                <h4 className="text-slate-900 text-sm font-bold">{rev.name}</h4>
                <span className="text-xs text-slate-500 font-semibold">{rev.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-20 relative">
        <div className="bg-gradient-to-r from-indigo-650 via-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center shadow-xl relative overflow-hidden text-white">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Ready to Level Up Your Campus Outcomes?</h2>
          <p className="text-slate-500 mt-4 text-sm md:text-base leading-relaxed">
            Join thousands of engineering students and faculty today to build structured learning outcomes professors can rely on.
          </p>
          <button
            onClick={() => navigate('/select-institution')}
            className="mt-8 bg-white hover:bg-slate-50 text-indigo-700 font-extrabold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] cursor-pointer text-sm"
          >
            Launch Student Portal
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-slate-50 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-600" />
            <span className="font-bold text-slate-800">NeuroLearn AI</span>
            <span>© 2026. Faculty Demo Quality. All rights reserved.</span>
          </div>
          <div className="flex gap-6 font-semibold">
            <a href="#" className="hover:text-slate-800 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-800 transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-slate-800 transition-colors">Faculty Guidelines</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
