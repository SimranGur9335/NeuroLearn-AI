import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldAlert, Sparkles, Check, X, LogOut, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ChangePassword = () => {
  const { user, changePassword, logout } = useAuth();
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Simple validation checks
  const hasMinLength = newPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const matchesConfirm = newPassword && newPassword === confirmPassword;

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!hasMinLength || !hasLetter || !hasNumber) {
      setErrorMsg("New password does not meet safety criteria.");
      return;
    }

    if (!matchesConfirm) {
      setErrorMsg("New password and confirm password do not match.");
      return;
    }

    setLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      setSuccessMsg("Password changed successfully! Redirecting you...");
      
      // Navigate to dashboard after 2 seconds
      setTimeout(() => {
        if (user?.role === 'student') navigate('/dashboard');
        else if (user?.role === 'faculty') navigate('/faculty/select-class');
        else if (user?.role === 'admin') navigate('/admin/dashboard');
        else navigate('/login');
      }, 2000);

    } catch (err) {
      setErrorMsg(err.message || "Failed to update password. Please verify current password.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center relative font-sans p-4 overflow-y-auto">
      {/* Grid Overlay Graphic */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl"
      >
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl">
            <Lock size={32} />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-black uppercase tracking-wider mt-2">
            <Sparkles size={13} />
            <span>Security Enforcement</span>
          </div>
          <h2 className="text-2xl font-black text-white">Change Temporary Password</h2>
          <p className="text-slate-400 text-xs max-w-sm">
            For security reasons, you must change your initial temporary password before proceeding to your workspace.
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {/* Old password field */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Current Password</label>
            <div className="relative flex items-center bg-slate-950/60 border border-slate-850 rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
              <input
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                className="bg-transparent border-none text-white text-xs placeholder-slate-600 focus:outline-none w-full font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="text-slate-500 hover:text-slate-300 ml-2"
              >
                {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New password field */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">New Secure Password</label>
            <div className="relative flex items-center bg-slate-950/60 border border-slate-850 rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new secure password"
                className="bg-transparent border-none text-white text-xs placeholder-slate-600 focus:outline-none w-full font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="text-slate-500 hover:text-slate-300 ml-2"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm password field */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Confirm New Password</label>
            <div className="relative flex items-center bg-slate-950/60 border border-slate-850 rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new secure password"
                className="bg-transparent border-none text-white text-xs placeholder-slate-600 focus:outline-none w-full font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-slate-500 hover:text-slate-300 ml-2"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Validation Checklist */}
          <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-4 space-y-2 text-[10px]">
            <div className="text-slate-500 font-bold uppercase tracking-wider mb-1">Password Strength Checklist</div>
            <div className="flex items-center gap-2 text-slate-400">
              {hasMinLength ? <Check size={12} className="text-emerald-500 font-bold" /> : <X size={12} className="text-red-500" />}
              <span>At least 8 characters long</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              {hasLetter ? <Check size={12} className="text-emerald-500 font-bold" /> : <X size={12} className="text-red-500" />}
              <span>Contains at least one letter</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              {hasNumber ? <Check size={12} className="text-emerald-500 font-bold" /> : <X size={12} className="text-red-500" />}
              <span>Contains at least one number</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              {matchesConfirm ? <Check size={12} className="text-emerald-500 font-bold" /> : <X size={12} className="text-red-500" />}
              <span>Passwords match perfectly</span>
            </div>
          </div>

          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-[11px] text-red-400"
              >
                <ShieldAlert size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[11px] text-emerald-400"
              >
                <Check size={16} className="shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading || !hasMinLength || !hasLetter || !hasNumber || !matchesConfirm}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-black shadow-md cursor-pointer disabled:cursor-not-allowed transition-all mt-4"
          >
            <span>{loading ? "Updating Credentials..." : "Commit Secure Password"}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* User-friendly Logout Option */}
        <div className="flex justify-center border-t border-slate-850/60 mt-6 pt-4">
          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 font-bold transition-colors cursor-pointer"
          >
            <LogOut size={12} />
            <span>Cancel and Sign Out</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ChangePassword;
