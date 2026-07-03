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
  import neuroLogo from '../assets/logo.jpeg';
import { authService } from '../services/authService';

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
      accent: 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-extrabold',
      text: 'text-rose-600',
      ring: 'focus-within:ring-2 focus-within:ring-rose-600/20 focus-within:border-rose-600',
      shadow: 'shadow-md shadow-rose-600/5',
      border: 'border-slate-200',
      glow: 'from-rose-600 to-pink-600',
      bg: 'bg-slate-50 border-slate-200 text-slate-700'
    },
    amber: {
      accent: 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-extrabold',
      text: 'text-amber-655',
      ring: 'focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500',
      shadow: 'shadow-md shadow-amber-600/5',
      border: 'border-slate-200',
      glow: 'from-amber-600 to-yellow-600',
      bg: 'bg-slate-50 border-slate-200 text-slate-700'
    },
    indigo: {
      accent: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold',
      text: 'text-indigo-605',
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
    
    // Forgot Password States
    const [isForgotActive, setIsForgotActive] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [recoveryPwd, setRecoveryPwd] = useState("");
    const [forgotLoading, setForgotLoading] = useState(false);

    // Institution states
    const [institutions, setInstitutions] = useState([]);
    const [selectedInstitutionId, setSelectedInstitutionId] = useState(null);

    // Read selected institution from localStorage on load
    useEffect(() => {
      const storedId = localStorage.getItem('selected_institution_id');
      if (storedId) {
        setSelectedInstitutionId(parseInt(storedId));
      } else if (location.state && location.state.institutionId) {
        setSelectedInstitutionId(location.state.institutionId);
        localStorage.setItem('selected_institution_id', location.state.institutionId.toString());
      } else {
        // Redirect to Select Institution page if none has been selected yet
        navigate('/select-institution');
      }

      if (location.state && location.state.role) {
        setRole(location.state.role);
      }
    }, [location.state, navigate]);

    // Validation / Error / Loading states
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);

    // Fetch active institutions
    useEffect(() => {
      const fetchInstitutions = async () => {
        try {
          const response = await apiFetch('/v1/institutions');
          if (response.ok) {
            const data = await response.json();
            setInstitutions(data);
          }
        } catch (err) {
          console.error("Failed to load institutions:", err);
        }
      };
      fetchInstitutions();
    }, []);

    // Redirect if institutions loaded but current selection isn't active/found in registry
    useEffect(() => {
      if (institutions.length > 0 && selectedInstitutionId !== null) {
        const exists = institutions.some(inst => inst.institution_id === selectedInstitutionId);
        if (!exists) {
          navigate('/select-institution');
        }
      }
    }, [institutions, selectedInstitutionId, navigate]);

    const selectedInstitution = institutions.find(inst => inst.institution_id === selectedInstitutionId);
    
    // Theme color styling comes from selected institution (or falls back to indigo)
    const theme = THEME_MAP[selectedInstitution?.theme_color] || THEME_MAP.indigo;

    const roles = [
      { id: 'student', title: 'Student', icon: GraduationCap },
      { id: 'faculty', title: 'Faculty', icon: Users },
      { id: 'admin', title: 'Admin', icon: Settings },
    ];

    const handleRoleTabClick = (roleType) => {
      setRole(roleType);
      setErrorMsg("");
      
      // Only auto-fill demo credentials if we are on COEP (id=1)
      if (selectedInstitutionId === 1) {
        if (roleType === 'super_admin') {
          setEmail('owner@neurolearn.ai');
        } else {
          setEmail(`${roleType}@neurolearn.ai`);
        }
        setPassword("Password123");
      } else {
        // Clear inputs for other institutions to let users type their own credentials
        setEmail("");
        setPassword("");
      }
    };

    const handleLoginSubmit = async (e) => {
      e.preventDefault();
      setErrorMsg("");

      if (!selectedInstitutionId) {
        setErrorMsg("Please select an institution first.");
        return;
      }

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

    const handleForgotSubmit = async (e) => {
      e.preventDefault();
      setErrorMsg("");
      setRecoveryPwd("");
      setForgotLoading(true);

      try {
        const res = await authService.forgotPassword(forgotEmail);
        if (res.success) {
          setRecoveryPwd(res.temp_password);
          setPassword(res.temp_password);
          setEmail(forgotEmail);
        }
      } catch (err) {
        setErrorMsg(err.message || "Failed to reset password. Please verify the email address.");
      } finally {
        setForgotLoading(false);
      }
    };

    // State to handle local image errors elegantly for the logo
    const initialLogo = (selectedInstitution?.logo_url && selectedInstitution?.logo_url !== '/assets/logo.png') 
      ? selectedInstitution.logo_url 
      : neuroLogo;
    const [logoSrc, setLogoSrc] = useState(initialLogo);

    // Update logo source whenever selectedInstitution changes
    useEffect(() => {
      setLogoSrc((selectedInstitution?.logo_url && selectedInstitution?.logo_url !== '/assets/logo.png') 
        ? selectedInstitution.logo_url 
        : neuroLogo
      );
    }, [selectedInstitution]);

    return (
      <div className="bg-blue-50 text-slate-800 min-h-screen flex items-center justify-center relative font-sans p-4 overflow-y-auto">
        
        {/* Hyperlink to Landing Page in top right */}
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={() => navigate('/')}
            className="text-[11px] font-extrabold text-indigo-650 hover:text-indigo-800 transition-colors flex items-center gap-1 bg-white/95 border border-slate-200/80 px-3.5 py-2 rounded-xl shadow-sm hover:shadow active:scale-95 cursor-pointer"
          >
            Go to Landing Page
            <ArrowRight size={12} />
          </button>
        </div>

        {/* Subtle Grid Overlay Graphic */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-md w-full bg-slate-50/50 border border-slate-200/80 p-8 rounded-3xl shadow-premium-lg relative z-10 space-y-6 backdrop-blur-md"
        >
          {/* Selected Institution Header */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2.5">
              <img 
                src={logoSrc} 
                onError={() => setLogoSrc(neuroLogo)}
                alt="Institution Logo" 
                className="w-10 h-10 object-contain rounded-xl bg-white p-1 border border-slate-200" 
              />
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">
                {selectedInstitution?.short_name || 'NeuroLearn'}<span className="text-indigo-600 font-medium">.AI</span>
              </span>
            </div>
            
            <div className="space-y-1">
              <h2 className="text-md font-extrabold text-slate-850 tracking-tight px-2">
                {selectedInstitution?.institution_name || 'Loading Institution...'}
              </h2>
              <button
                onClick={() => navigate('/select-institution')}
                type="button"
                className="text-[10px] text-indigo-600 hover:text-indigo-750 hover:underline font-extrabold cursor-pointer transition-colors"
              >
                Change Institution
              </button>
            </div>
            
            <p className="text-slate-500 text-xs leading-relaxed max-w-[280px] mx-auto">
              {selectedInstitution ? `${selectedInstitution.short_name} LMS Login Portal` : 'Authorizing login configuration...'}
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
                  onClick={() => handleRoleTabClick(r.id)}
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
          {!isForgotActive ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
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
                    onClick={() => {
                      setForgotEmail(email);
                      setIsForgotActive(true);
                      setErrorMsg("");
                      setRecoveryPwd("");
                    }}
                    className="text-[10px] text-indigo-650 hover:underline cursor-pointer font-bold"
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
                    className="bg-transparent border-none text-xs text-slate-855 placeholder-slate-400 focus:outline-none w-full font-mono font-medium"
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
                  className="flex items-center gap-2 text-xs text-slate-505 hover:text-slate-800 select-none cursor-pointer font-semibold"
                >
                  {rememberMe ? <CheckSquare size={14} className="text-indigo-650" /> : <Square size={14} className="text-slate-400" />}
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
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="text-center space-y-1 pb-2">
                <h3 className="text-sm font-bold text-slate-800">Reset Portal Password</h3>
                <p className="text-slate-500 text-[11px] leading-relaxed max-w-[280px] mx-auto">
                  Please enter your registered institutional email to generate a temporary secure password.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-1">Email Address</label>
                <div className={`relative flex items-center bg-white border border-slate-200 focus-within:ring-2 ${theme.ring} rounded-2xl px-3 py-2.5 transition-all`}>
                  <Mail size={14} className="text-slate-400 mr-2 shrink-0" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder={selectedInstitution ? `e.g. yourname@${selectedInstitution.domain_name}` : "yourname@domain.edu"}
                    className="bg-transparent border-none text-xs text-slate-855 placeholder-slate-400 focus:outline-none w-full font-medium"
                    required
                  />
                </div>
              </div>

              {recoveryPwd && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs p-4 rounded-2xl space-y-2.5 font-medium"
                >
                  <div className="flex items-center gap-2">
                    <CheckSquare size={16} className="text-emerald-500" />
                    <span className="font-extrabold text-emerald-800">Reset Successful!</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-700">
                    A temporary password has been successfully configured for your account:
                  </p>
                  <div className="flex items-center justify-between bg-white border border-emerald-500/25 px-3 py-2 rounded-xl font-mono text-[13px] font-bold text-emerald-850 tracking-wider">
                    <span>{recoveryPwd}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(recoveryPwd);
                        alert("Temporary password copied to clipboard!");
                      }}
                      className="text-[10px] bg-emerald-650 hover:bg-emerald-700 text-white font-extrabold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-[10px] text-emerald-600 leading-normal">
                    Use this temporary credential to sign in. You will be prompted to change it immediately.
                  </p>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={forgotLoading}
                className={`w-full py-3.5 ${theme.accent} disabled:bg-slate-100 disabled:text-slate-400 text-white font-extrabold rounded-2xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/10`}
              >
                {forgotLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Requesting Reset...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Password</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsForgotActive(false);
                  setErrorMsg("");
                }}
                className="w-full text-center py-2 text-xs text-slate-505 hover:text-slate-800 hover:underline font-bold transition-all cursor-pointer"
              >
                Back to Sign In
              </button>
            </form>
          )}

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
