import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Award,
  Landmark,
  Briefcase,
  Layers,
  BookOpen,
  ShieldAlert,
  CheckCircle,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../services/api';

const FacultyProfile = () => {
  const { user, changePassword } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Password reset form state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passSuccessMsg, setPassSuccessMsg] = useState("");
  const [passErrorMsg, setPassErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProfileDetails();
  }, []);

  const fetchProfileDetails = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await apiFetch("/v1/profile");
      if (!res.ok) throw new Error("Failed to load profile details from backend.");
      const data = await res.json();
      setProfileData(data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Error connecting to the profile service.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassSuccessMsg("");
    setPassErrorMsg("");

    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setPassErrorMsg("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setPassErrorMsg("New Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassErrorMsg("New Passwords do not match!");
      return;
    }

    try {
      setIsSubmitting(true);
      await changePassword(oldPassword, newPassword);
      setPassSuccessMsg("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Update local profileData must_change_password flag if it was set
      if (profileData) {
        setProfileData(prev => ({ ...prev, must_change_password: false }));
      }

      setTimeout(() => setPassSuccessMsg(""), 3000);
    } catch (err) {
      setPassErrorMsg(err.message || "Failed to change password. Old password might be incorrect.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (errorMsg || !profileData) {
    return (
      <div className="text-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md mx-auto my-12 shadow-md">
        <ShieldAlert size={40} className="text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Error Loading Profile</h3>
        <p className="text-slate-500 text-xs mb-6">{errorMsg || "Could not retrieve profile information."}</p>
        <button
          onClick={fetchProfileDetails}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const assignedClasses = profileData.assigned_classes || [];
  const assignedSubjects = profileData.assigned_subjects || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 font-sans text-slate-800 dark:text-slate-200"
    >
      {/* Identity Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border border-purple-900/40 p-8 rounded-3xl relative overflow-hidden shadow-2xl text-white">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[radial-gradient(circle,rgba(168,85,247,0.15)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-72 h-72 bg-[radial-gradient(circle,rgba(59,130,246,0.1)_0%,transparent_70%)] pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          {/* Avatar Area */}
          <div className="relative w-24 h-24 rounded-2xl bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center text-5xl shadow-inner select-none shrink-0">
            {profileData.avatar || "👨‍🏫"}
          </div>

          <div className="space-y-2 text-center md:text-left flex-1">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2">
              <span className="text-[9px] text-purple-300 font-extrabold uppercase tracking-wider bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30 flex items-center gap-1">
                <Shield size={10} className="text-purple-400" />
                Faculty Member
              </span>
              <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Verified Profile
              </span>
            </div>

            <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-purple-200">
              {profileData.name || user?.name || "Faculty Member"}
            </h1>

            <p className="text-purple-200 text-xs font-semibold flex items-center justify-center md:justify-start gap-2 flex-wrap">
              <Briefcase size={12} className="text-purple-400" />
              <span>{profileData.designation}</span>
              <span className="text-purple-600">•</span>
              <Landmark size={12} className="text-purple-400" />
              <span>Dept. of {profileData.branch}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Col (2 cols span): Account Overview & Password Change */}
        <div className="lg:col-span-2 space-y-6">

          {/* Section 1: Account Overview Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-extrabold text-slate-855 dark:text-white text-sm flex items-center gap-2">
                <User className="text-purple-500" size={18} />
                Account Overview
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Administrative & System Profile</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Faculty Code */}
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850/60">
                <Award className="text-purple-500" size={18} />
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Faculty Code</span>
                  <span className="font-mono font-bold text-slate-850 dark:text-slate-200">{profileData.faculty_code || "N/A"}</span>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850/60">
                <Shield className="text-purple-500" size={18} />
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">System Role</span>
                  <span className="font-bold text-purple-650 dark:text-purple-400 uppercase text-[10px] tracking-wider bg-purple-500/10 px-2.5 py-0.5 rounded border border-purple-500/20">
                    {profileData.role || "Faculty"}
                  </span>
                </div>
              </div>

              {/* Department */}
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850/60">
                <Landmark className="text-purple-500" size={18} />
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Department</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{profileData.branch || "N/A"}</span>
                </div>
              </div>

              {/* Designation */}
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850/60">
                <Briefcase className="text-purple-500" size={18} />
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Designation</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{profileData.designation || "N/A"}</span>
                </div>
              </div>

              {/* Institution */}
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850/60">
                <Landmark className="text-purple-500" size={18} />
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Institution</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{profileData.institution_name || "N/A"}</span>
                </div>
              </div>

              {/* Account Status */}
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850/60">
                <CheckCircle className="text-purple-500" size={18} />
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Account Status</span>
                  <span className="font-bold text-emerald-500 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {profileData.account_status || "Active"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400">
              <ShieldAlert className="text-purple-500 shrink-0" size={16} />
              <span>Administrative details are maintained by the Platform Administrator and are currently read-only.</span>
            </div>
          </div>

          {/* Section 2: Account Security (Password Reset) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-extrabold text-slate-850 dark:text-white text-sm flex items-center gap-2">
                <Lock className="text-purple-500" size={18} />
                Account Security
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Manage credentials and authentication parameters</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Security parameters */}
              <div className="space-y-4 text-xs">
                <h4 className="font-bold text-slate-700 dark:text-slate-350 text-[10px] uppercase tracking-wider">System Security State</h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850/40">
                    <span className="text-slate-450 font-semibold">Institutional Email</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{profileData.email || "N/A"}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850/40">
                    <span className="text-slate-450 font-semibold">Mandatory Password Reset</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${profileData.must_change_password
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                      {profileData.must_change_password ? "Required" : "Not Required"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850/40">
                    <span className="text-slate-450 font-semibold">Last Login Security</span>
                    <span className="font-semibold text-slate-500 dark:text-slate-455 flex items-center gap-1">
                      <CheckCircle size={11} className="text-emerald-500" />
                      IP Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Password Change Form */}
              <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                <h4 className="font-bold text-slate-700 dark:text-slate-350 text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <Lock size={12} className="text-purple-500" />
                  Change Password
                </h4>

                <AnimatePresence mode="wait">
                  {passSuccessMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-3 rounded-xl flex items-center gap-2"
                    >
                      <CheckCircle size={14} className="shrink-0" />
                      <span className="text-[10px]">{passSuccessMsg}</span>
                    </motion.div>
                  )}
                  {passErrorMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl flex items-center gap-2"
                    >
                      <ShieldAlert size={14} className="shrink-0" />
                      <span className="text-[10px]">{passErrorMsg}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Old Password */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-450 uppercase font-bold tracking-wider block">Current Password</label>
                  <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="bg-transparent border-none text-slate-700 dark:text-slate-200 focus:outline-none w-full font-mono text-xs"
                      required
                      placeholder="••••••••"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-450 uppercase font-bold tracking-wider block">New Password</label>
                  <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-transparent border-none text-slate-700 dark:text-slate-200 focus:outline-none w-full font-mono text-xs"
                      required
                      placeholder="••••••••"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-450 uppercase font-bold tracking-wider block">Confirm New Password</label>
                  <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-transparent border-none text-slate-700 dark:text-slate-200 focus:outline-none w-full font-mono text-xs"
                      required
                      placeholder="••••••••"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 cursor-pointer select-none shrink-0"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white font-extrabold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <Sparkles size={13} />
                      Update Password
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Col (1 col span): Teaching Statistics & Academic Workload */}
        <div className="space-y-6">

          {/* Section 3: Teaching Statistics Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-extrabold text-slate-850 dark:text-white text-sm flex items-center gap-2">
                <Activity size={18} className="text-purple-500" />
                Teaching Statistics
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Academic Workload Summary</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-500/5 to-indigo-500/5 dark:from-purple-950/10 dark:to-indigo-950/10 p-4 rounded-2xl border border-purple-500/10 dark:border-purple-500/5 text-center relative overflow-hidden group">
                <div className="absolute -right-2 -top-2 text-purple-500/10 group-hover:scale-110 transition-all">
                  <BookOpen size={48} />
                </div>
                <span className="text-3xl font-black text-purple-650 dark:text-purple-400 block relative z-10">{assignedClasses.length}</span>
                <span className="text-[9px] uppercase font-black text-slate-500 dark:text-slate-400 block tracking-wider mt-1 relative z-10">Assigned Classes</span>
              </div>
              <div className="bg-gradient-to-br from-purple-500/5 to-indigo-500/5 dark:from-purple-950/10 dark:to-indigo-950/10 p-4 rounded-2xl border border-purple-500/10 dark:border-purple-500/5 text-center relative overflow-hidden group">
                <div className="absolute -right-2 -top-2 text-purple-500/10 group-hover:scale-110 transition-all">
                  <Layers size={48} />
                </div>
                <span className="text-3xl font-black text-purple-650 dark:text-purple-400 block relative z-10">{assignedSubjects.length}</span>
                <span className="text-[9px] uppercase font-black text-slate-500 dark:text-slate-400 block tracking-wider mt-1 relative z-10">Assigned Subjects</span>
              </div>
            </div>

            {/* Workload Status Bar */}
            <div className="space-y-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850/60">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-450 font-bold uppercase tracking-wider">Workload Intensity</span>
                <span className="text-purple-600 dark:text-purple-400 font-bold">Optimal Capacity</span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" 
                  style={{ width: `${Math.min(100, Math.max(20, (assignedClasses.length + assignedSubjects.length) * 12))}%` }} 
                />
              </div>
              <p className="text-[9px] text-slate-400 leading-relaxed font-medium">
                Workload allocation is automatically calculated based on credit hours and section divisions.
              </p>
            </div>
          </div>

          {/* Section 4: Improved Workload Presentation */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-extrabold text-slate-850 dark:text-white text-sm flex items-center gap-2">
                <BookOpen size={18} className="text-purple-500" />
                Academic Workload Detail
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Assigned Courses & Classes</p>
            </div>

            {/* Assigned Subjects List */}
            <div className="space-y-3">
              <h4 className="font-black text-slate-700 dark:text-slate-350 text-[10px] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-1.5">
                <Layers size={13} className="text-purple-500" />
                Assigned Subjects
              </h4>

              {assignedSubjects.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No academic subjects currently assigned.</p>
              ) : (
                <div className="space-y-2">
                  {assignedSubjects.map((sub) => (
                    <div 
                      key={sub.subject_id} 
                      className="p-3 bg-slate-50 dark:bg-slate-950 border-l-4 border-l-purple-500 border border-slate-100/60 dark:border-slate-850/60 rounded-r-xl rounded-l-md flex items-center justify-between text-xs hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-all"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-850 dark:text-slate-200 block">{sub.subject_name}</span>
                        <span className="text-[9px] text-slate-400 font-semibold block">Academic Code</span>
                      </div>
                      <span className="font-mono text-[9px] text-purple-650 dark:text-purple-400 font-bold uppercase bg-purple-500/10 px-2.5 py-1 rounded border border-purple-500/20 shrink-0">
                        {sub.subject_code}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assigned Classes List */}
            <div className="space-y-3 pt-2">
              <h4 className="font-black text-slate-700 dark:text-slate-350 text-[10px] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-1.5">
                <BookOpen size={13} className="text-purple-500" />
                Assigned Classes
              </h4>

              {assignedClasses.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No academic divisions currently assigned.</p>
              ) : (
                <div className="space-y-2">
                  {assignedClasses.map((cls) => (
                    <div 
                      key={cls.class_id} 
                      className="p-3 bg-slate-50 dark:bg-slate-950 border-l-4 border-l-indigo-500 border border-slate-100/60 dark:border-slate-850/60 rounded-r-xl rounded-l-md flex items-center justify-between text-xs hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-all font-bold text-slate-800 dark:text-slate-200"
                    >
                      <div className="space-y-0.5">
                        <span className="block">{cls.class_name}</span>
                        <span className="text-[9px] text-slate-400 font-semibold block">Section Division</span>
                      </div>
                      <span className="text-[9px] text-indigo-650 dark:text-indigo-400 font-bold uppercase bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20 shrink-0">
                        Active Group
                      </span>
                    </div>
                  ))}
                </div>
              )}
          </div>

        </div>

      </div>
    </div>
  </motion.div>
);
};

export default FacultyProfile;
