import React, { useState } from 'react';
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
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStudent } from '../context/StudentContext';

const Profile = () => {
  const { user, updateProfile, changePassword, updateAvatar, logout } = useAuth();
  const { profile, setProfile } = useStudent();
  const [activeTab, setActiveTab] = useState("details"); // 'details' | 'security'

  // Profile Details Form States
  const [formName, setFormName] = useState(user?.name || "");
  const [formMobile, setFormMobile] = useState(user?.mobile || "");
  const [formBranch, setFormBranch] = useState(user?.branch || "B.Tech Computer Science");
  const [formCollege, setFormCollege] = useState(user?.college || "COEP Technological University");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Password Reset Form States
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passSuccessMsg, setPassSuccessMsg] = useState("");
  const [passErrorMsg, setPassErrorMsg] = useState("");

  const handleUpdateDetails = (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!formName.trim()) {
      setErrorMsg("Full Name cannot be blank.");
      return;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (formMobile && !phoneRegex.test(formMobile)) {
      setErrorMsg("Mobile Number must be exactly 10 digits.");
      return;
    }

    // Update AuthContext user
    updateProfile({
      name: formName,
      mobile: formMobile,
      branch: formBranch
    });

    // Sync back to StudentContext profile for global consistency!
    setProfile(prev => ({
      ...prev,
      name: formName,
      branch: formBranch
    }));

    setSuccessMsg("Profile details updated successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
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
      await changePassword(oldPassword, newPassword);
      setPassSuccessMsg("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPassSuccessMsg(""), 3000);
    } catch (err) {
      setPassErrorMsg(err.message || "Failed to change password. Old password might be incorrect.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      {/* Intro Header */}
      <div>
        <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">User Account</p>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Profile Management</h2>
        <p className="text-slate-500 text-xs mt-1">Configure your personal parameters, reset your credentials, and monitor session tokens.</p>
      </div>

      {/* Tabs selectors */}
      <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl shadow-sm gap-2">
        <button
          onClick={() => setActiveTab("details")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "details"
              ? 'bg-indigo-650 bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850/40'
          }`}
        >
          Account Details
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "security"
              ? 'bg-indigo-650 bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850/40'
          }`}
        >
          Security & Credentials
        </button>
      </div>

      {/* Forms Area */}
      <AnimatePresence mode="wait">
        {activeTab === "details" ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6"
          >
            {/* Success/Error Messaging */}
            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs p-3.5 rounded-2xl flex items-center gap-2">
                <CheckCircle size={16} />
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-555 text-xs p-3.5 rounded-2xl flex items-center gap-2">
                <ShieldAlert size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Avatar Section */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/85">
              <div className="relative w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-2xl select-none">
                {user?.avatar || "🚀"}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider pl-1">Choose Profile Avatar</h4>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {["🚀", "👨‍🏫", "🛡️", "💻", "🧠", "🎓", "🌟", "👾"].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={async () => {
                        try {
                          await updateAvatar(emoji);
                          // Sync back to StudentContext profile for global consistency!
                          setProfile(prev => ({ ...prev, avatar: emoji }));
                          setSuccessMsg("Avatar updated successfully!");
                          setTimeout(() => setSuccessMsg(""), 3000);
                        } catch (err) {
                          setErrorMsg("Failed to update avatar.");
                          setTimeout(() => setErrorMsg(""), 3000);
                        }
                      }}
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
                        user?.avatar === emoji 
                          ? 'border-indigo-500 bg-indigo-500/10 scale-105 shadow-sm' 
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-transparent text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateDetails} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider block">Full Name</label>
                  <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5">
                    <User size={15} className="text-slate-400 mr-2" />
                    <input 
                      type="text" 
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="bg-transparent border-none text-slate-700 dark:text-slate-200 focus:outline-none w-full"
                      required
                    />
                  </div>
                </div>

                {/* Email (Disabled) */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider block">Email Address (Locked)</label>
                  <div className="flex items-center bg-slate-100 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-850/50 rounded-xl px-3 py-2.5 opacity-60">
                    <Mail size={15} className="text-slate-400 mr-2" />
                    <input 
                      type="email" 
                      value={user?.email || ""}
                      className="bg-transparent border-none text-slate-500 cursor-not-allowed focus:outline-none w-full font-mono"
                      disabled
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider block">Mobile Number</label>
                  <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5">
                    <Phone size={15} className="text-slate-400 mr-2" />
                    <input 
                      type="text" 
                      value={formMobile}
                      onChange={(e) => setFormMobile(e.target.value)}
                      className="bg-transparent border-none text-slate-700 dark:text-slate-200 focus:outline-none w-full"
                    />
                  </div>
                </div>

                {/* College / Institution (Locked) */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-455 uppercase font-bold tracking-wider block">College Campus (Locked)</label>
                  <div className="flex items-center bg-slate-100 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-850/50 rounded-xl px-2.5 py-2.5 opacity-60">
                    <School size={15} className="text-slate-400 mr-2" />
                    <input 
                      type="text" 
                      value={formCollege}
                      className="bg-transparent border-none text-slate-500 cursor-not-allowed focus:outline-none w-full"
                      disabled
                    />
                  </div>
                </div>

                {/* Branch / Department */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider block">Branch / Division</label>
                  <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5">
                    <input 
                      type="text" 
                      value={formBranch}
                      onChange={(e) => setFormBranch(e.target.value)}
                      className="bg-transparent border-none text-slate-700 dark:text-slate-200 focus:outline-none w-full"
                    />
                  </div>
                </div>

                {/* User Role designator (read only) */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider block">Portal Access Level</label>
                  <div className="flex items-center bg-slate-100 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-850/50 rounded-xl px-3 py-2.5 opacity-60">
                    <Award size={15} className="text-slate-400 mr-2" />
                    <span className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">
                      {user?.role} Access
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-650 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl transition-all shadow-md cursor-pointer text-xs"
                >
                  Save Profile Changes
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="px-5 py-2.5 border border-red-500/25 hover:bg-red-500 hover:text-white rounded-xl text-red-500 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
                >
                  <LogOut size={14} />
                  Terminate Session
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="security"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6"
          >
            {/* Success/Error Messaging */}
            {passSuccessMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs p-3.5 rounded-2xl flex items-center gap-2">
                <CheckCircle size={16} />
                <span>{passSuccessMsg}</span>
              </div>
            )}
            {passErrorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-550 text-xs p-3.5 rounded-2xl flex items-center gap-2">
                <ShieldAlert size={16} />
                <span>{passErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              {/* Old password */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-455 uppercase font-bold tracking-wider block">Current Password</label>
                <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5">
                  <Lock size={15} className="text-slate-400 mr-2" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="bg-transparent border-none text-slate-700 dark:text-slate-200 focus:outline-none w-full font-mono"
                    required
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-455 uppercase font-bold tracking-wider block">New Password</label>
                <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5">
                  <Lock size={15} className="text-slate-400 mr-2" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-transparent border-none text-slate-700 dark:text-slate-200 focus:outline-none w-full font-mono"
                    required
                  />
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-455 uppercase font-bold tracking-wider block">Confirm New Password</label>
                <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5">
                  <Lock size={15} className="text-slate-400 mr-2" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-transparent border-none text-slate-700 dark:text-slate-200 focus:outline-none w-full font-mono"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-white cursor-pointer select-none shrink-0"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-650 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl transition-all shadow-md cursor-pointer text-xs flex items-center gap-1.5"
                >
                  <Sparkles size={14} />
                  Update Password Credentials
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Profile;
