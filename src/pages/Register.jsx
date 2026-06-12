import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  User, 
  Mail, 
  Phone, 
  School, 
  Lock, 
  CheckSquare, 
  Square, 
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  GraduationCap,
  Users,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [college, setCollege] = useState("COEP Technological University");
  const [dept, setDept] = useState("CS");
  const [year, setYear] = useState("3rd Year");
  const [role, setRole] = useState("student"); // 'student' | 'teacher' | 'admin'
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const roles = [
    { id: 'student', title: 'Student', icon: GraduationCap },
    { id: 'teacher', title: 'Faculty', icon: Users },
    { id: 'admin', title: 'Admin', icon: Settings }
  ];

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Validation checks
    if (!name.trim()) return setErrorMsg("Full Name is required.");
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return setErrorMsg("Please enter a valid email address.");

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(mobile)) return setErrorMsg("Mobile Number must be exactly 10 digits.");

    if (password.length < 6) return setErrorMsg("Password must be at least 6 characters long.");
    if (password !== confirmPassword) return setErrorMsg("Passwords do not match!");

    if (!agreeTerms) return setErrorMsg("You must agree to the Terms & Conditions.");

    setLoading(true);
    try {
      await register({
        name,
        email,
        mobile,
        college,
        department: dept,
        year: role === 'student' ? year : undefined,
        role,
        password
      });
      alert("Registration successful! Proceeding to Login screen.");
      navigate('/login');
    } catch (err) {
      setErrorMsg(err.message || "Registration failed. Try again.");
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
        className="max-w-xl w-full bg-slate-900/60 border border-slate-850 p-6 md:p-8 rounded-3xl shadow-2xl relative z-10 space-y-6 backdrop-blur-md"
      >
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <Sparkles size={18} />
            </div>
            <span className="font-extrabold text-xl bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              NeuroLearn AI
            </span>
          </div>
          <h2 className="text-xl font-black text-white">Join the Platform</h2>
          <p className="text-slate-400 text-xs">Access personalized curricula across campus departments.</p>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-1 rounded-2xl border border-slate-850">
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = role === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  isSelected 
                    ? 'bg-indigo-600 text-white shadow' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                }`}
              >
                <Icon size={14} />
                <span>{r.title}</span>
              </button>
            );
          })}
        </div>

        {/* Error notification */}
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

        {/* Two-Column Responsive Form */}
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">Full Name</label>
              <div className="relative flex items-center bg-slate-950/60 border border-slate-850 focus-within:ring-2 focus-within:ring-indigo-500/50 rounded-xl px-3 py-2 transition-all">
                <User size={15} className="text-slate-500 mr-2 shrink-0" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Singh"
                  className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-550 focus:outline-none w-full"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">Email Address</label>
              <div className="relative flex items-center bg-slate-950/60 border border-slate-850 focus-within:ring-2 focus-within:ring-indigo-500/50 rounded-xl px-3 py-2 transition-all">
                <Mail size={15} className="text-slate-500 mr-2 shrink-0" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. aarav@apex.edu"
                  className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-550 focus:outline-none w-full"
                  required
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">Mobile Number</label>
              <div className="relative flex items-center bg-slate-950/60 border border-slate-850 focus-within:ring-2 focus-within:ring-indigo-500/50 rounded-xl px-3 py-2 transition-all">
                <Phone size={15} className="text-slate-500 mr-2 shrink-0" />
                <input 
                  type="text" 
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="10 digit number"
                  className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-550 focus:outline-none w-full"
                  required
                />
              </div>
            </div>

            {/* College select */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">College/Institution</label>
              <div className="relative flex items-center bg-slate-950/60 border border-slate-850 focus-within:ring-2 focus-within:ring-indigo-500/50 rounded-xl px-2.5 py-2 transition-all">
                <School size={15} className="text-slate-500 mr-2 shrink-0" />
                <select
  value={college}
  onChange={(e) => setCollege(e.target.value)}
  className="bg-transparent border-none text-xs text-slate-200 focus:outline-none w-full"
>
  <option className="bg-slate-900 text-white" value="COEP Technological University">
    COEP Tech, Pune
  </option>
  <option className="bg-slate-900 text-white" value="MIT World Peace University">
    MIT-WPU, Pune
  </option>
  <option className="bg-slate-900 text-white" value="Pimpri Chinchwad College of Engineering">
    PCCOE, Pune
  </option>
  <option className="bg-slate-900 text-white" value="Vishwakarma Institute of Technology">
    VIT, Pune
  </option>
</select>
              </div>
            </div>

            {/* Department select */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">Department Branch</label>
              <div className="bg-slate-950/60 border border-slate-800 focus-within:ring-2 focus-within:ring-indigo-500/50 rounded-xl px-2.5 py-2 transition-all">
<select
  value={dept}
  onChange={(e) => setDept(e.target.value)}
  className="bg-transparent border-none text-xs text-slate-200 focus:outline-none w-full"
>
  <option className="bg-slate-900 text-white" value="CS">Computer Science (CS)</option>
  <option className="bg-slate-900 text-white" value="IT">Information Technology (IT)</option>
  <option className="bg-slate-900 text-white" value="ECE">Electronics & Telecom (ECE)</option>
  <option className="bg-slate-900 text-white" value="EEE">Electrical Engineering (EEE)</option>
  <option className="bg-slate-900 text-white" value="ME">Mechanical Engineering (ME)</option>
</select>
              </div>
            </div>

            {/* Year Select (Only for Student) */}
            {role === 'student' ? (
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">Academic Year</label>
                <div className="bg-slate-950/60 border border-slate-850 focus-within:ring-2 focus-within:ring-indigo-500/50 rounded-xl px-2.5 py-2 transition-all">
  <select
  value={year}
  onChange={(e) => setYear(e.target.value)}
  className="bg-transparent border-none text-xs text-slate-200 focus:outline-none w-full"
>
  <option className="bg-slate-900 text-white" value="1st Year">First Year (FE)</option>
  <option className="bg-slate-900 text-white" value="2nd Year">Second Year (SE)</option>
  <option className="bg-slate-900 text-white" value="3rd Year">Third Year (TE)</option>
  <option className="bg-slate-900 text-white" value="4th Year">Fourth Year (BE)</option>
</select>
                </div>
              </div>
            ) : (
              <div className="hidden md:block" /> // grid layout spacer
            )}

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">Password</label>
              <div className="relative flex items-center bg-slate-950/60 border border-slate-850 focus-within:ring-2 focus-within:ring-indigo-500/50 rounded-xl px-3 py-2 transition-all">
                <Lock size={15} className="text-slate-500 mr-2 shrink-0" />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-550 focus:outline-none w-full font-mono"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">Confirm Password</label>
              <div className="relative flex items-center bg-slate-950/60 border border-slate-850 focus-within:ring-2 focus-within:ring-indigo-500/50 rounded-xl px-3 py-2 transition-all">
                <Lock size={15} className="text-slate-500 mr-2 shrink-0" />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-550 focus:outline-none w-full font-mono"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-550 hover:text-white cursor-pointer select-none shrink-0 ml-1.5"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start pt-2">
            <button 
              type="button" 
              onClick={() => setAgreeTerms(!agreeTerms)}
              className="flex items-center gap-2 text-xs text-slate-450 hover:text-slate-200 select-none cursor-pointer"
            >
              {agreeTerms ? <CheckSquare size={16} className="text-indigo-500" /> : <Square size={16} className="text-slate-550" />}
              <span className="text-[11px]">I agree to the Terms & Conditions and campus guidelines.</span>
            </button>
          </div>

          {/* Submit */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-extrabold rounded-xl transition-all shadow-lg shadow-indigo-600/10 text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-4"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Registering Account...</span>
              </>
            ) : (
              <>
                <span>Submit Registration</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Footer redirection */}
        <div className="text-center pt-2 text-xs text-slate-400 border-t border-slate-900">
          <span>Already have a login? </span>
          <button 
            onClick={() => navigate('/login')}
            className="text-indigo-400 hover:underline font-bold cursor-pointer"
          >
            Sign In Here
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
