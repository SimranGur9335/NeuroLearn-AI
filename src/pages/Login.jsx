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
    accent: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold',
    text: 'text-indigo-600',
    ring: 'focus-within:ring-2 focus-within:ring-indigo-600/20 focus-within:border-indigo-600',
    shadow: 'shadow-md shadow-indigo-600/5',
    border: 'border-slate-200',
    glow: 'from-indigo-600 to-purple-600',
    bg: 'bg-slate-50 border-slate-200 text-slate-700'
  },
  rose: {
    accent: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold',
    text: 'text-indigo-600',
    ring: 'focus-within:ring-2 focus-within:ring-indigo-600/20 focus-within:border-indigo-600',
    shadow: 'shadow-md shadow-indigo-600/5',
    border: 'border-slate-200',
    glow: 'from-indigo-600 to-purple-600',
    bg: 'bg-slate-50 border-slate-200 text-slate-700'
  },
  amber: {
    accent: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold',
    text: 'text-indigo-600',
    ring: 'focus-within:ring-2 focus-within:ring-indigo-600/20 focus-within:border-indigo-600',
    shadow: 'shadow-md shadow-indigo-600/5',
    border: 'border-slate-200',
    glow: 'from-indigo-600 to-purple-600',
    bg: 'bg-slate-50 border-slate-200 text-slate-700'
  },
  indigo: {
    accent: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold',
    text: 'text-indigo-600',
    ring: 'focus-within:ring-2 focus-within:ring-indigo-600/20 focus-within:border-indigo-600',
    shadow: 'shadow-md shadow-indigo-600/5',
    border: 'border-slate-200',
    glow: 'from-indigo-600 to-purple-600',
    bg: 'bg-slate-50 border-slate-200 text-slate-700'
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
        else if (user.role === 'faculty') navigate('/faculty/select-class');
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
    <div className="bg-white text-slate-800 min-h-screen flex items-center justify-center relative font-sans p-4 overflow-y-auto">
      
      {/* Subtle Grid Overlay Graphic */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-slate-50/50 border border-slate-200/80 p-8 rounded-3xl shadow-premium-lg relative z-10 space-y-6 backdrop-blur-md"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2.5">
            {selectedInstitution?.logo_url ? (
              <img src={selectedInstitution.logo_url} alt="Logo" className="w-8 h-8 object-contain rounded-lg" />
            ) : (
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-xl text-white">
                <Sparkles size={16} />
              </div>
            )}
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">
              {selectedInstitution?.short_name || 'NeuroLearn'}<span className="text-indigo-650 font-medium">.AI</span>
            </span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-850">
            {selectedInstitution?.institution_name || 'Welcome Back'}
          </h2>
          <p className="text-slate-500 text-xs leading-relaxed max-w-[280px] mx-auto">
            {selectedInstitution ? `${selectedInstitution.short_name} LMS Login Portal` : 'Enter credentials to load your personalized curriculum.'}
          </p>
        </div>

        {/* Role Select Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/60">
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = role === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => handleQuickFill(r.id)}
                className={`py-2 px-1.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-1 cursor-pointer ${isSelected
                  ? `bg-white text-slate-900 shadow-sm border border-slate-200`
                  : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <Icon size={12} className={isSelected ? 'text-indigo-600 animate-pulse' : 'text-slate-400'} />
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
            className="bg-red-500/10 border border-red-500/20 text-red-650 text-xs p-3 rounded-2xl flex items-start gap-2.5 font-medium"
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
            <p className="leading-relaxed">{errorMsg}</p>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          
          {/* Institution Selector */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-1">Select Institution</label>
            <div className={`relative flex items-center bg-white border border-slate-200 focus-within:ring-2 ${theme.ring} rounded-2xl px-3 py-2 transition-all`}>
              <select
                value={selectedInstitutionId}
                onChange={(e) => setSelectedInstitutionId(parseInt(e.target.value))}
                className="bg-transparent border-none text-xs text-slate-800 focus:outline-none w-full cursor-pointer py-1 font-semibold"
                required
              >
                {institutions.map((inst) => (
                  <option key={inst.institution_id} value={inst.institution_id} className="bg-white text-slate-800">
                    {inst.institution_name} ({inst.short_name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-1">Email Address</label>
            <div className={`relative flex items-center bg-white border border-slate-200 focus-within:ring-2 ${theme.ring} rounded-2xl px-3 py-2.5 transition-all`}>
              <Mail size={14} className="text-slate-400 mr-2 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={selectedInstitution ? `e.g. yourname@${selectedInstitution.domain_name}` : "e.g. student@neurolearn.ai"}
                className="bg-transparent border-none text-xs text-slate-850 placeholder-slate-400 focus:outline-none w-full font-medium"
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Password</label>
              <button
                type="button"
                onClick={() => alert("Faculty Demo Mode: Click quick fill button to reset input parameters.")}
                className="text-[10px] text-indigo-600 hover:underline cursor-pointer font-bold"
              >
                Forgot Password?
              </button>
            </div>
            <div className={`relative flex items-center bg-white border border-slate-200 focus-within:ring-2 ${theme.ring} rounded-2xl px-3 py-2.5 transition-all`}>
              <Lock size={14} className="text-slate-400 mr-2 shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent border-none text-xs text-slate-850 placeholder-slate-400 focus:outline-none w-full font-mono font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer select-none shrink-0"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Remember me checkbox */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-800 select-none cursor-pointer font-semibold"
            >
              {rememberMe ? <CheckSquare size={14} className="text-indigo-600" /> : <Square size={14} className="text-slate-400" />}
              <span>Remember Me</span>
            </button>
          </div>

          {/* Primary CTA Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 ${theme.accent} disabled:bg-slate-100 disabled:text-slate-400 text-white font-extrabold rounded-2xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer mt-4 hover:translate-y-[-1px] active:translate-y-[0px] shadow-md shadow-indigo-600/10`}
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Authorizing Session...</span>
              </>
            ) : (
              <>
                <span>Enter Portal</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </form>

        {/* Footer redirection */}
        <div className="text-center pt-3 text-xs text-slate-500 border-t border-slate-200/80">
          <span>New to NeuroLearn? </span>
          <button
            onClick={() => navigate('/register')}
            className="text-indigo-600 hover:underline font-bold cursor-pointer"
          >
            Create Account
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
