import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  School,
  Lock,
  LogOut,
  Award,
  Sparkles,
  ShieldAlert,
  CheckCircle,
  Eye,
  EyeOff,
  Percent,
  Plus,
  Trash2,
  FileText,
  Upload,
  Calendar,
  Layers,
  GraduationCap,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStudent } from '../context/StudentContext';
import { useBranding } from '../context/BrandingContext';
import { THEME_COLOR_MAP } from '../components/StudentHubTheme';

const Profile = () => {
  const { user, updateProfile, changePassword, updateAvatar, logout } = useAuth();
  const { profile, setProfile } = useStudent();
  const { branding } = useBranding() || {};
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;
  const [activeTab, setActiveTab] = useState("details"); // 'details' | 'academic' | 'skills' | 'credentials' | 'security'

  // Loading States
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Tab Details Form States
  const [formName, setFormName] = useState(user?.name || "");
  const [formMobile, setFormMobile] = useState(user?.mobile || "");
  const [formBranch, setFormBranch] = useState(user?.branch || "B.Tech Computer Science");
  const [formCollege, setFormCollege] = useState(user?.college || user?.institution_name || branding?.institutionName || "NeuroLearn AI");

  // Academic Form States
  const [rollNo, setRollNo] = useState("");
  const [semester, setSemester] = useState(5);
  const [division, setDivision] = useState("A");

  // Skills & Resume Form States
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [resume, setResume] = useState("");

  // Certificates Form States
  const [certificates, setCertificates] = useState([]);
  const [certName, setCertName] = useState("");
  const [certIssuer, setCertIssuer] = useState("");
  const [certDate, setCertDate] = useState("");
  const [certUrl, setCertUrl] = useState("");

  // Achievements Form States
  const [achievements, setAchievements] = useState([]);
  const [achTitle, setAchTitle] = useState("");
  const [achDate, setAchDate] = useState("");
  const [achDesc, setAchDesc] = useState("");

  // Password Reset Form States
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Fetch complete profile on mount
  const fetchProfileDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/profile");
      if (res.ok) {
        const data = await res.json();
        setFormName(data.name || "");
        setFormMobile(data.mobile || "");
        setFormBranch(data.branch || "B.Tech Computer Science");
        setFormCollege(data.college || data.institution_name || branding?.institutionName || "NeuroLearn AI");
        setRollNo(data.rollNumber || "");
        setSemester(data.semester || 5);
        setDivision(data.division || "A");
        setSkills(data.skills || []);
        setResume(data.resume || "");
        setCertificates(data.certificates || []);
        setAchievements(data.achievements || []);
      }
    } catch (err) {
      console.error("Failed to load profile details", err);
      setErrorMsg("Failed to connect to backend database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileDetails();
  }, []);

  // Calculate Profile Completion Score
  const completionPercent = (() => {
    let score = 0;
    if (formName?.trim()) score += 15;
    if (formMobile?.trim()) score += 15;
    if (rollNo?.trim()) score += 15;
    if (skills.length > 0) score += 15;
    if (resume?.trim()) score += 15;
    if (certificates.length > 0) score += 15;
    if (achievements.length > 0) score += 10;
    return score;
  })();

  // Dynamic Avatar rendering (Custom Image or Emoji)
  const isImageAvatar = (avatar) => {
    return avatar && (avatar.startsWith('data:image/') || avatar.startsWith('http://') || avatar.startsWith('https://'));
  };

  // Profile Picture File Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      setErrorMsg("Image size must be less than 1.5MB");
      setTimeout(() => setErrorMsg(""), 4000);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64String = event.target.result;
      try {
        await updateAvatar(base64String);
        // Sync local StudentContext state
        setProfile(prev => ({ ...prev, avatar: base64String }));
        // Sync AuthContext user object state
        if (user) {
          user.avatar = base64String;
        }
        setSuccessMsg("Profile photo uploaded successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      } catch (err) {
        setErrorMsg("Failed to upload avatar profile image.");
      }
    };
    reader.readAsDataURL(file);
  };

  // Resume File Importer
  const handleResumeFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setResume(event.target.result);
      setSuccessMsg("Resume text parsed successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    };
    reader.readAsText(file);
  };

  // Add Skill Tag handler
  const handleAddSkill = (e) => {
    if (e) e.preventDefault();
    const cleanSkill = skillInput.trim();
    if (cleanSkill && !skills.includes(cleanSkill)) {
      setSkills(prev => [...prev, cleanSkill]);
      setSkillInput("");
    }
  };

  // Delete Skill Tag handler
  const handleRemoveSkill = (skillToRemove) => {
    setSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  // Add Certificate handler
  const handleAddCertificate = (e) => {
    e.preventDefault();
    if (!certName.trim() || !certIssuer.trim()) return;
    const newCert = {
      id: Date.now(),
      name: certName.trim(),
      issuer: certIssuer.trim(),
      date: certDate || new Date().toISOString().split('T')[0],
      url: certUrl.trim()
    };
    setCertificates(prev => [...prev, newCert]);
    setCertName("");
    setCertIssuer("");
    setCertDate("");
    setCertUrl("");
  };

  // Remove Certificate handler
  const handleRemoveCertificate = (id) => {
    setCertificates(prev => prev.filter(c => c.id !== id));
  };

  // Add Achievement handler
  const handleAddAchievement = (e) => {
    e.preventDefault();
    if (!achTitle.trim()) return;
    const newAch = {
      id: Date.now(),
      title: achTitle.trim(),
      date: achDate || new Date().toISOString().split('T')[0],
      description: achDesc.trim()
    };
    setAchievements(prev => [...prev, newAch]);
    setAchTitle("");
    setAchDate("");
    setAchDesc("");
  };

  // Remove Achievement handler
  const handleRemoveAchievement = (id) => {
    setAchievements(prev => prev.filter(a => a.id !== id));
  };

  // Main Submit Handler
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setSaveLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    if (!formName.trim()) {
      setErrorMsg("Full Name cannot be blank.");
      setSaveLoading(false);
      return;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (formMobile && !phoneRegex.test(formMobile)) {
      setErrorMsg("Mobile Number must be exactly 10 digits.");
      setSaveLoading(false);
      return;
    }

    try {
      const payload = {
        name: formName,
        mobile: formMobile,
        branch: formBranch,
        rollNumber: rollNo,
        semester: semester,
        division: division,
        skills: skills,
        resume: resume,
        certificates: certificates,
        update_type: "full_student_profile",
        achievements: achievements
      };

      await updateProfile(payload);
      setProfile(prev => ({
        ...prev,
        name: formName,
        branch: formBranch,
        rollNumber: rollNo,
        semester: semester,
        division: division
      }));

      setSuccessMsg("Academic & career profile saved successfully!");
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to save profile changes.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setErrorMsg("Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("New Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    try {
      await changePassword(oldPassword, newPassword);
      setSuccessMsg("Password credentials updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.message || "Password update failed. Confirm credentials.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
        <span className="text-slate-400 text-sm font-semibold animate-pulse">Retrieving secure student profile...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-4xl mx-auto text-slate-700 dark:text-slate-300"
    >
      {/* Page Title */}
      <div>
        <p className="text-xs text-indigo-600 dark:text-indigo-550 font-bold uppercase tracking-wider">User Administration</p>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Profile Workspace</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Redesign your academic credentials, customize your identity, build certifications, and verify placement status.</p>
      </div>

      {/* Profile Setup status progress */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-gradient-to-r ${theme.gradient} border ${theme.border} p-6 rounded-3xl relative overflow-hidden shadow-xl text-white`}>
        <div className="md:col-span-2 flex items-center gap-5">
          {/* Avatar Rendering Section */}
          <div className="relative group shrink-0 w-20 h-20 rounded-full bg-slate-950 border-2 border-white/20 overflow-hidden flex items-center justify-center text-4xl shadow-md select-none">
            {isImageAvatar(user?.avatar) ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span>{user?.avatar || "🚀"}</span>
            )}

            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[9px] cursor-pointer text-indigo-200">
              <Upload size={14} className="mb-0.5" />
              Upload
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-white bg-white/10 border border-white/20 px-2 py-0.5 rounded">
              {user?.role === 'student' ? 'Student Registry' : 'Faculty Member'}
            </span>
            <h3 className="font-extrabold text-lg text-white">{formName || "Full Name"}</h3>
            <p className="text-xs text-slate-300 font-mono">{user?.email}</p>
          </div>
        </div>

        {/* Completion Telemetry Card */}
        <div className="bg-black/20 p-4 border border-white/10 rounded-2xl flex justify-between items-center text-xs">
          <div>
            <h4 className="font-bold dark:text-white text-[10px] uppercase tracking-wider">Completion Index</h4>
            <div className="w-28 bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className={`h-full ${theme.accent} transition-all duration-500`} style={{ width: `${completionPercent}%` }} />
            </div>
            <span className="text-[9px] dark:text-slate-300 mt-1 block">Log all elements to unlock T1 guidance.</span>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-white">{completionPercent}%</span>
          </div>
        </div>
      </div>

      {/* Global Success & Error Notification boards */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-4 rounded-2xl flex items-center gap-2"
          >
            <CheckCircle size={18} />
            <span>{successMsg}</span>
          </motion.div>
        )}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-2xl flex items-center gap-2"
          >
            <ShieldAlert size={18} />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>      {/* Tabs list navigation */}
      <div className="flex flex-wrap bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-1.5 rounded-2xl shadow-sm gap-2">
        {[
          { id: "details", label: "Personal Details" },
          { id: "academic", label: "Academic Profile" },
          { id: "skills", label: "Skills & Resume" },
          { id: "credentials", label: "Certificates & Achievements" },
          { id: "security", label: "Security & Logins" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-w-[120px] border ${activeTab === tab.id
                ? `${theme.bg} ${theme.text} ${theme.border} shadow-sm`
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900/40 bg-transparent'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form tab panels mapping */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">

          {/* TAB 1: PERSONAL DETAILS */}
          {activeTab === "details" && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <h3 className="font-extrabold text-slate-800 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800/80 pb-2">
                Personal Identification details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider block">Full Name</label>
                  <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-3">
                    <User size={15} className="text-slate-450 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="bg-transparent border-none text-slate-800 dark:text-slate-200 focus:outline-none w-full text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider block">Mobile Number</label>
                  <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-3">
                    <Phone size={15} className="text-slate-450 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={formMobile}
                      onChange={(e) => setFormMobile(e.target.value)}
                      className="bg-transparent border-none text-slate-800 dark:text-slate-200 focus:outline-none w-full text-xs"
                      placeholder="e.g. 9876543210"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider block">Email Address (Locked)</label>
                  <div className="flex items-center bg-slate-100 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-850/50 rounded-xl px-3.5 py-3 opacity-60">
                    <Mail size={15} className="text-slate-450 mr-2 shrink-0" />
                    <input
                      type="email"
                      value={user?.email || ""}
                      className="bg-transparent border-none text-slate-500 cursor-not-allowed focus:outline-none w-full text-xs font-mono"
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider block">College Campus (Locked)</label>
                  <div className="flex items-center bg-slate-100 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-850/50 rounded-xl px-3.5 py-3 opacity-60">
                    <School size={15} className="text-slate-450 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={formCollege}
                      className="bg-transparent border-none text-slate-500 cursor-not-allowed focus:outline-none w-full text-xs"
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Quick Emoji Avatar Picker */}
              <div className="pt-4 border-t border-slate-150 dark:border-slate-800/80">
                <h4 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider mb-2.5">
                  Or Choose Quick Emoji Avatar
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["🚀", "👨‍🏫", "🛡️", "💻", "🧠", "🎓", "🌟", "👾", "🔥", "🌈", "🤖", "⚡"].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={async () => {
                        try {
                          await updateAvatar(emoji);
                          setProfile(prev => ({ ...prev, avatar: emoji }));
                          setSuccessMsg("Emoji avatar selected!");
                          setTimeout(() => setSuccessMsg(""), 3000);
                        } catch (err) {
                          setErrorMsg("Failed to update avatar.");
                        }
                      }}
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${user?.avatar === emoji
                          ? 'border-indigo-500 bg-indigo-500/10 scale-100 shadow'
                          : 'border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 bg-transparent'
                        }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: ACADEMIC PROFILE */}
          {activeTab === "academic" && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <h3 className="font-extrabold text-slate-800 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800/80 pb-2">
                Academic Curriculum credentials
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider block">University Roll Number</label>
                  <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-3">
                    <GraduationCap size={15} className="text-slate-450 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      placeholder="e.g. 2023CS8094"
                      className="bg-transparent border-none text-slate-800 dark:text-slate-200 focus:outline-none w-full text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider block">Branch / Discipline</label>
                  <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-3">
                    <Layers size={15} className="text-slate-450 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={formBranch}
                      onChange={(e) => setFormBranch(e.target.value)}
                      className="bg-transparent border-none text-slate-800 dark:text-slate-200 focus:outline-none w-full text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider block">Current Semester</label>
                  <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5">
                    <select
                      value={semester}
                      onChange={(e) => setSemester(parseInt(e.target.value) || 5)}
                      className="bg-transparent border-none text-slate-800 dark:text-slate-200 focus:outline-none w-full text-xs dark:bg-slate-950"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(semNum => (
                        <option key={semNum} value={semNum}>Semester {semNum}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider block">Academic Division / Batch</label>
                  <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-3">
                    <input
                      type="text"
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      placeholder="e.g. A"
                      className="bg-transparent border-none text-slate-800 dark:text-slate-200 focus:outline-none w-full text-xs"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: SKILLS & RESUME */}
          {activeTab === "skills" && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Custom Skills List Tag Input */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">
                    Developer Skill Inventory
                  </h3>
                  <span className="text-[10px] text-slate-450 font-semibold">{skills.length} skills listed</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                    placeholder="Type a developer skill (e.g. React, Docker) and press Enter..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-3 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className={`px-5 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer shrink-0 text-white font-extrabold ${theme.accent} hover:opacity-90`}
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {skills.length === 0 ? (
                    <span className="text-xs text-slate-500">No skills added yet. Define your inventory tags above.</span>
                  ) : (
                    skills.map((skill) => (
                      <span
                        key={skill}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-extrabold"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-red-400 transition-colors font-bold text-xs select-none shrink-0"
                        >
                          &times;
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Resume File Importer and Editor */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">
                      Interactive Resume Parser & Text File Editor
                    </h3>
                    <p className="text-[10px] text-slate-450 mt-0.5">Import raw text from certificates or resumes to feed AI Guidance models.</p>
                  </div>

                  <label className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl text-[10px] font-bold transition-all text-slate-400 cursor-pointer bg-transparent">
                    <FileText size={13} />
                    Import Text File
                    <input
                      type="file"
                      accept=".txt,.md"
                      onChange={handleResumeFileImport}
                      className="hidden"
                    />
                  </label>
                </div>

                <textarea
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                  rows="6"
                  placeholder="Paste your resume markdown text, CV summaries, or project details here..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-3.5 py-3 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed font-mono"
                />
              </div>
            </motion.div>
          )}

          {/* TAB 4: CERTIFICATES & ACHIEVEMENTS */}
          {activeTab === "credentials" && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              {/* Certificates segment */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-800 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800/80 pb-2">
                  Academic Certifications Directory
                </h3>

                {/* Form to append Certificate */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-950/60 p-4 border border-slate-150 dark:border-slate-850 rounded-2xl">
                  <input
                    type="text"
                    placeholder="Certificate Name (e.g. AWS Cloud Pract...)"
                    value={certName}
                    onChange={(e) => setCertName(e.target.value)}
                    className="md:col-span-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none text-slate-800 dark:text-slate-200"
                  />
                  <input
                    type="text"
                    placeholder="Issuer (e.g. Amazon Web...)"
                    value={certIssuer}
                    onChange={(e) => setCertIssuer(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none text-slate-800 dark:text-slate-200"
                  />
                  <input
                    type="date"
                    value={certDate}
                    onChange={(e) => setCertDate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none text-slate-400"
                  />
                  <input
                    type="url"
                    placeholder="Credential URL link"
                    value={certUrl}
                    onChange={(e) => setCertUrl(e.target.value)}
                    className="md:col-span-3 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none text-slate-800 dark:text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={handleAddCertificate}
                    className={`text-white font-extrabold py-2 rounded-xl text-xs transition-all cursor-pointer ${theme.accent} hover:opacity-90`}
                  >
                    Add Certificate
                  </button>
                </div>

                {/* Certificates Grid List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {certificates.length === 0 ? (
                    <span className="text-xs text-slate-500 italic md:col-span-2 text-center py-2">
                      No certifications registered. Use form above to list your credentials.
                    </span>
                  ) : (
                    certificates.map((cert) => (
                      <div key={cert.id} className="p-4 bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-850 rounded-2xl flex justify-between items-center gap-2">
                        <div className="space-y-1 overflow-hidden">
                          <h4 className="font-extrabold text-xs text-slate-800 dark:text-white truncate">{cert.name}</h4>
                          <p className="text-[10px] text-slate-450">{cert.issuer} • {cert.date}</p>
                          {cert.url && (
                            <a
                              href={cert.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5 mt-1"
                            >
                              <ExternalLink size={10} /> Verify Credential
                            </a>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCertificate(cert.id)}
                          className="p-2 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-550 rounded-xl transition-all cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Achievements segment */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <h3 className="font-extrabold text-slate-800 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800/80 pb-2">
                  Academic Honors & Achievements Log
                </h3>

                {/* Form to append Achievement */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-950/60 p-4 border border-slate-150 dark:border-slate-850 rounded-2xl">
                  <input
                    type="text"
                    placeholder="Honor Title (e.g. Hackathon Finalist, Dean's List)"
                    value={achTitle}
                    onChange={(e) => setAchTitle(e.target.value)}
                    className="md:col-span-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none text-slate-800 dark:text-slate-200"
                  />
                  <input
                    type="date"
                    value={achDate}
                    onChange={(e) => setAchDate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Short description..."
                    value={achDesc}
                    onChange={(e) => setAchDesc(e.target.value)}
                    className="md:col-span-3 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none text-slate-800 dark:text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={handleAddAchievement}
                    className={`text-white font-extrabold py-2 rounded-xl text-xs transition-all cursor-pointer ${theme.accent} hover:opacity-90`}
                  >
                    Add Honor
                  </button>
                </div>

                {/* Achievements List */}
                <div className="space-y-3">
                  {achievements.length === 0 ? (
                    <div className="text-center py-2 text-xs text-slate-500 italic">
                      No honors or achievements registered yet. Add credentials using form above.
                    </div>
                  ) : (
                    achievements.map((ach) => (
                      <div key={ach.id} className="p-4 bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-850 rounded-2xl flex justify-between items-center gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Award className="text-indigo-400 shrink-0" size={15} />
                            <h4 className="font-extrabold text-xs text-slate-800 dark:text-white">{ach.title}</h4>
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-900 text-slate-450">{ach.date}</span>
                          </div>
                          {ach.description && <p className="text-[10px] text-slate-400 pl-5 leading-normal">{ach.description}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAchievement(ach.id)}
                          className="p-2 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-550 rounded-xl transition-all cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: SECURITY */}
          {activeTab === "security" && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <h3 className="font-extrabold text-slate-800 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800/80 pb-2">
                Modify Authentication Password Credentials
              </h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider block">Current Password</label>
                  <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-3">
                    <Lock size={15} className="text-slate-455 mr-2 shrink-0" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="bg-transparent border-none text-slate-700 dark:text-slate-200 focus:outline-none w-full text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-455 uppercase font-bold tracking-wider block">New Password</label>
                  <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-3">
                    <Lock size={15} className="text-slate-455 mr-2 shrink-0" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-transparent border-none text-slate-700 dark:text-slate-200 focus:outline-none w-full text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-455 uppercase font-bold tracking-wider block">Confirm New Password</label>
                  <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-3">
                    <Lock size={15} className="text-slate-455 mr-2 shrink-0" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-transparent border-none text-slate-700 dark:text-slate-200 focus:outline-none w-full text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-450 hover:text-white cursor-pointer select-none shrink-0"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePasswordChangeSubmit}
                  className={`px-5 py-2.5 ${theme.accent} hover:opacity-90 text-white font-extrabold rounded-xl transition-all shadow-md cursor-pointer text-xs flex items-center gap-1.5`}
                >
                  <Sparkles size={14} /> Update Credentials
                </button>
              </div>
            </motion.div>
          )}

          {/* Footer Save & Session Terminate Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-5 border-t border-slate-100 dark:border-slate-800">
            {activeTab !== "security" && (
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saveLoading}
                className={`px-6 py-3 ${theme.accent} hover:opacity-90 disabled:opacity-50  font-extrabold rounded-xl transition-all shadow-md cursor-pointer text-xs flex items-center justify-center gap-2`}
              >
                {saveLoading ? (
                  <>
                    <div className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"></div>
                    Saving changes...
                  </>
                ) : (
                  <>
                    <Briefcase size={14} />
                    Save Profile Changes
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={logout}
              className="px-5 py-3 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-xl text-red-500 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer sm:ml-auto"
            >
              <LogOut size={14} />
              Terminate Active Session
            </button>
          </div>

        </form>
      </div>
    </motion.div>
  );
};

export default Profile;
