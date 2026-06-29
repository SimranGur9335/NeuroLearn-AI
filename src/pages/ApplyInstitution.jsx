import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Building2, 
  ArrowLeft,
  Mail, 
  Rocket, 
  Palette, 
  ShieldCheck, 
  Users, 
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import neuroLogo from '../assets/logo.jpeg';

const ApplyInstitution = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNotifySubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    
    // Simulate API registration request
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      // Save waitlist email to localStorage
      const waitlist = JSON.parse(localStorage.getItem('neurolearn_waitlist') || '[]');
      if (!waitlist.includes(email.trim())) {
        waitlist.push(email.trim());
        localStorage.setItem('neurolearn_waitlist', JSON.stringify(waitlist));
      }
    }, 1200);
  };

  return (
    <div className="bg-white text-slate-800 min-h-screen flex flex-col justify-between relative font-sans overflow-x-hidden">
      
      {/* Background Graphic Grid & Radial Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Header Bar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <button 
          onClick={() => navigate('/')} 
          className="group inline-flex items-center gap-2 text-xs font-bold text-slate-655 hover:text-slate-900 transition-all bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 px-4 py-2 rounded-xl shadow-sm cursor-pointer"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </button>
        <div className="flex items-center gap-2.5">
          <img 
            src={neuroLogo} 
            alt="Logo" 
            className="w-7 h-7 object-contain rounded-lg border border-slate-100 shadow-sm"
          />
          <span className="font-extrabold text-sm tracking-tight text-slate-900">
            NeuroLearn<span className="text-indigo-650 font-medium">.AI</span>
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="max-w-4xl w-full text-center space-y-12">
          
          {/* Animated Badge & Title */}
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-50 border border-indigo-100 text-indigo-700 uppercase tracking-widest"
            >
              <Rocket size={12} className="animate-pulse" />
              Onboarding Module • Coming Soon
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight"
            >
              Self-Serve Campus <br />
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Onboarding System
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-slate-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed"
            >
              We're building an automated, instant-provisioning tenant portal. Register your college, choose brand themes, and sync classrooms in just a few clicks.
            </motion.p>
          </div>

          {/* Waitlist Subscription Card */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-md mx-auto bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl shadow-xl relative"
          >
            {/* Visual glow indicator */}
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div 
                  key="form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-indigo-600" />
                    <h3 className="font-extrabold text-sm text-slate-900">Join the Early Access Queue</h3>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Be the first to receive invitation tokens to test the new automated white-label onboarding module.
                  </p>

                  <form onSubmit={handleNotifySubmit} className="flex flex-col sm:flex-row gap-2.5 pt-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="academic-head@college.edu"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
                        disabled={loading}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-indigo-600/5 hover:shadow-lg"
                    >
                      {loading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span>Queueing...</span>
                        </>
                      ) : (
                        <>
                          <span>Request Access</span>
                          <Sparkles size={12} />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4 space-y-4"
                >
                  <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 size={24} className="animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Queue Position Locked!</h3>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                      We've added <strong className="text-slate-800">{email}</strong> to our VIP academic waitlist. We will notify you as soon as the automation pipeline is active.
                    </p>
                  </div>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-[10px] text-indigo-600 hover:text-indigo-750 font-bold underline transition"
                  >
                    Register another representative
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Features Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-6 text-left">
            {[
              {
                icon: Palette,
                title: "Custom branding & theme",
                desc: "Upload high-res SVG logos, choose dynamic HSL colors, and style faculty and student dashboards instantly."
              },
              {
                icon: ShieldCheck,
                title: "Dedicated isolated tenant",
                desc: "Each campus runs in an isolated database environment with strict encryption boundaries to ensure absolute data privacy."
              },
              {
                icon: Users,
                title: "Instant student sync",
                desc: "Import hundreds of student records and faculty mapping relationships via spreadsheet uploads or direct REST API integrations."
              }
            ].map((feat, idx) => {
              const IconComponent = feat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
                  className="bg-slate-50/40 border border-slate-200/80 p-5 rounded-2xl space-y-3 relative hover:bg-slate-50/90 hover:border-slate-300 transition-colors"
                >
                  <div className="p-2 w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 animate-pulse">
                    <IconComponent size={18} />
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-800">{feat.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{feat.desc}</p>
                </motion.div>
              );
            })}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between text-[10px] text-slate-450 border-t border-slate-100 relative z-10">
        <span>© {new Date().getFullYear()} NeuroLearn.AI. All rights reserved.</span>
        <div className="flex items-center gap-4 mt-2 md:mt-0">
          <a href="https://neurolearn.ai/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-slate-655 transition flex items-center gap-0.5">
            Privacy Policy <ExternalLink size={8} />
          </a>
          <a href="https://neurolearn.ai/terms" target="_blank" rel="noopener noreferrer" className="hover:text-slate-655 transition flex items-center gap-0.5">
            Terms of Service <ExternalLink size={8} />
          </a>
        </div>
      </footer>
      
    </div>
  );
};

export default ApplyInstitution;
