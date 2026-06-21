import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <div className="relative">
          <Sparkles size={40} className="text-indigo-500 animate-spin" />
          <span className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping" />
        </div>
        <p className="text-[10px] uppercase font-black tracking-widest text-slate-550 mt-6 animate-pulse">
          Calibrating Security Tokens...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Not logged in: route to Login Arena
    return <Navigate to="/login" replace />;
  }

  if (user?.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }


  if (allowedRoles && !allowedRoles.includes(role)) {
    // Authenticated but wrong credentials: route to authorized workspace
    console.warn(`[ProtectedRoute] Access denied for role: ${role}. Expected: ${allowedRoles}`);
    if (role === 'student') return <Navigate to="/dashboard" replace />;
    if (role === 'faculty') return <Navigate to="/faculty/dashboard" replace />;
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
