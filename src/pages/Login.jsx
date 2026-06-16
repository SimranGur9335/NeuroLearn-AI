import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckSquare,
  Square,
  AlertCircle,
  GraduationCap,
  Users,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';

const THEME_MAP = {
  violet: {
    accent: 'bg-violet-600 hover:bg-violet-500',
    text: 'text-violet-400',
    ring: 'focus-within:ring-violet-500/50',
    shadow: 'shadow-violet-600/10',
    border: 'border-violet-500/20',
    glow: 'from-violet-400 to-fuchsia-400',
    bg: 'bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border-violet-500/10'
  },
  rose: {
    accent: 'bg-rose-600 hover:bg-rose-500',
    text: 'text-rose-400',
    ring: 'focus-within:ring-rose-500/50',
    shadow: 'shadow-rose-600/10',
    border: 'border-rose-500/20',
    glow: 'from-rose-400 to-pink-400',
    bg: 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/10'
  },
  amber: {
    accent: 'bg-amber-600 hover:bg-amber-500',
    text: 'text-amber-400',
    ring: 'focus-within:ring-amber-500/50',
    shadow: 'shadow-amber-600/10',
    border: 'border-amber-500/20',
    glow: 'from-amber-400 to-yellow-400',
    bg: 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/10'
  },
  indigo: {
    accent: 'bg-indigo-600 hover:bg-indigo-500',
    text: 'text-indigo-400',
    ring: 'focus-within:ring-indigo-500/50',
    shadow: 'shadow-indigo-600/10',
    border: 'border-indigo-500/20',
    glow: 'from-indigo-400 to-cyan-400',
    bg: 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border-indigo-500/10'
  }
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // 'student' | 'faculty' | 'admin'
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Institution states
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState(1);

  // Apply location state if present
  useEffect(() => {
    if (location.state) {
      if (location.state.role) {
        setRole(location.state.role);
      }
      if (location.state.institutionId) {
        setSelectedInstitutionId(location.state.institutionId);
      }
    }
  }, [location.state]);

  // Validation / Error / Loading states
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await apiFetch('/v1/institutions');
        if (response.ok) {
          const data = await response.json();
          setInstitutions(data);
          if (data.length > 0) {
            // Default to COEP (id=1) if present, or the first one
            const hasCoep = data.some(inst => inst.institution_id === 1);
            setSelectedInstitutionId(hasCoep ? 1 : data[0].institution_id);
          }
        }
      } catch (err) {
        console.error("Failed to load institutions:", err);
      }
    };
    fetchInstitutions();
  }, []);

  const selectedInstitution = institutions.find(inst => inst.institution_id === selectedInstitutionId);
  const theme = THEME_MAP[selectedInstitution?.theme_color] || THEME_MAP.indigo;

  const roles = [
    { id: 'student', title: 'Student', icon: GraduationCap },
    { id: 'faculty', title: 'Faculty', icon: Users },
    { id: 'admin', title: 'Admin', icon: Settings },
  ];

  const handleQuickFill = (roleType) => {
    setRole(roleType);
    if (roleType === 'super_admin') {
      setEmail('owner@neurolearn.ai');
    } else {
      setEmail(`${roleType}@neurolearn.ai`);
    }
    setPassword("Password123");
    setErrorMsg("");
    setSelectedInstitutionId(1); // Demo accounts are registered under COEP (id = 1)
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Validation checks
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please fill in both email and password fields.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address structure.");
      return;
    }

    setLoading(true);
    try {
      const user = await login(
        email,
        password,
        role,
        selectedInstitutionId,
        selectedInstitution?.domain_name || 'neurolearn.ai',
        rememberMe
      );
      // Route based on role or force password change status
      if (user.mustChangePassword) {
        navigate('/change-password');
      } else {
        if (user.role === 'student') navigate('/dashboard');
        else if (user.role === 'faculty') navigate('/teacher/select-class');
        else if (user.role === 'admin') navigate('/admin/dashboard');
        else if (user.role === 'super_admin') navigate('/platform-admin/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center relative font-sans p-4 overflow-y-auto">
      {/* Grid Overlay Graphic */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-slate-900/60 border border-slate-850 p-6 md:p-8 rounded-3xl shadow-2xl relative z-10 space-y-6 backdrop-blur-md"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            {selectedInstitution?.logo_url ? (
              <img src={selectedInstitution.logo_url} alt="Logo" className="w-9 h-9 object-contain rounded-lg" />
            ) : (
              <div className={`p-2 rounded-xl text-white ${theme.accent}`}>
                <Sparkles size={18} className="animate-pulse" />
              </div>
            )}
            <span className={`font-extrabold text-xl bg-gradient-to-r ${theme.glow} bg-clip-text text-transparent`}>
              {selectedInstitution?.short_name || 'NeuroLearn'} AI
            </span>
          </div>
          <h2 className="text-2xl font-black text-white">
            {selectedInstitution?.institution_name || 'Welcome Back'}
          </h2>
          <p className="text-slate-400 text-xs">
            {selectedInstitution ? `${selectedInstitution.short_name} LMS Login Portal` : 'Enter credentials to load your personalized curriculum.'}
          </p>
        </div>

        {/* Role Select Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-1 rounded-2xl border border-slate-850">
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = role === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => handleQuickFill(r.id)}
                className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${isSelected
                  ? `${theme.accent} text-white shadow`
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                  }`}
              >
                <Icon size={14} />
                <span>{r.title}</span>
              </button>
            );
          })}
        </div>



        {/* Error messaging */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-2xl flex items-start gap-2.5"
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMsg}</p>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {/* Institution Selector */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">Select Institution</label>
            <div className={`relative flex items-center bg-slate-950/60 border border-slate-850 focus-within:ring-2 ${theme.ring} rounded-xl px-3 py-2 transition-all`}>
              <select
                value={selectedInstitutionId}
                onChange={(e) => setSelectedInstitutionId(parseInt(e.target.value))}
                className="bg-transparent border-none text-xs text-slate-200 focus:outline-none w-full cursor-pointer py-1"
                required
              >
                {institutions.map((inst) => (
                  <option key={inst.institution_id} value={inst.institution_id} className="bg-slate-900 text-slate-200">
                    {inst.institution_name} ({inst.short_name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">Email Address</label>
            <div className={`relative flex items-center bg-slate-950/60 border border-slate-850 focus-within:ring-2 ${theme.ring} rounded-xl px-3 py-2.5 transition-all`}>
              <Mail size={16} className="text-slate-500 mr-2.5 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={selectedInstitution ? `e.g. yourname@${selectedInstitution.domain_name}` : "e.g. student@neurolearn.ai"}
                className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-550 focus:outline-none w-full"
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Password</label>
              <button
                type="button"
                onClick={() => alert("Faculty Demo Mode: Click quick fill button to reset input parameters.")}
                className={`text-[10px] ${theme.text} hover:underline cursor-pointer`}
              >
                Forgot Password?
              </button>
            </div>
            <div className={`relative flex items-center bg-slate-950/60 border border-slate-850 focus-within:ring-2 ${theme.ring} rounded-xl px-3 py-2.5 transition-all`}>
              <Lock size={16} className="text-slate-500 mr-2.5 shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-550 focus:outline-none w-full font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-500 hover:text-white cursor-pointer select-none shrink-0"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 select-none cursor-pointer"
            >
              {rememberMe ? <CheckSquare size={16} className={theme.text} /> : <Square size={16} className="text-slate-500" />}
              <span>Remember Me</span>
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 ${theme.accent} disabled:bg-slate-800 disabled:text-slate-500 text-white font-extrabold rounded-xl transition-all shadow-lg ${theme.shadow} text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-4`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Authorizing Session...</span>
              </>
            ) : (
              <>
                <span>Enter Portal</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Footer redirection */}
        <div className="text-center pt-2 text-xs text-slate-400 border-t border-slate-900">
          <span>New to NeuroLearn? </span>
          <button
            onClick={() => navigate('/register')}
            className={`${theme.text} hover:underline font-bold cursor-pointer`}
          >
            Create Account
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
