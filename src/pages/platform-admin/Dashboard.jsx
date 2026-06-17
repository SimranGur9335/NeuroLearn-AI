import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GitPullRequest, 
  School, 
  Users, 
  CheckCircle,
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { apiFetch } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const PlatformDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingRequests: 0,
    approvedRequests: 0,
    totalInstitutions: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiFetch('/v1/platform-admin/dashboard-stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          setError("Failed to load dashboard metrics");
        }
      } catch (err) {
        console.error(err);
        setError("Network error loading dashboard metrics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const kpis = [
    { 
      title: "Pending Onboarding Requests", 
      value: stats.pendingRequests, 
      icon: GitPullRequest, 
      color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400",
      link: "/platform-admin/requests"
    },
    { 
      title: "Approved Institutions", 
      value: stats.totalInstitutions, 
      icon: School, 
      color: "from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-400",
      link: "/platform-admin/institutions"
    },
    { 
      title: "Total Registered Users", 
      value: stats.totalUsers, 
      icon: Users, 
      color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400",
      link: "/platform-admin/users"
    },
    { 
      title: "Processed Applications", 
      value: stats.approvedRequests, 
      icon: CheckCircle, 
      color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400",
      link: "/platform-admin/requests"
    }
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <Sparkles className="animate-spin text-indigo-500" size={32} />
          <p className="text-sm font-bold uppercase tracking-wider animate-pulse">Loading Platform Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Platform Operations Hub <Sparkles className="text-indigo-400" size={24} />
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Global administrative controls for all institution tenants, users, and onboarding workflows.
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2 text-xs font-bold text-slate-300 flex items-center gap-2">
          <TrendingUp size={16} className="text-indigo-400" />
          SaaS Dashboard Active
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-2xl">
          {error}
        </div>
      )}

      {/* KPI grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              onClick={() => navigate(kpi.link)}
              className={`bg-gradient-to-br ${kpi.color} border p-6 rounded-3xl cursor-pointer hover:-translate-y-1 transition-all flex flex-col justify-between h-44 shadow-lg`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold uppercase tracking-wider opacity-80">{kpi.title}</span>
                <div className="p-2 rounded-xl bg-slate-950/40 text-inherit">
                  <Icon size={20} />
                </div>
              </div>
              <div className="flex justify-between items-end mt-4">
                <span className="text-4xl font-extrabold text-white">{kpi.value}</span>
                <span className="text-xs font-bold flex items-center gap-1 opacity-70 group-hover:opacity-100">
                  Manage <ArrowRight size={12} />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Platform Activity Feed Mock/Placeholder */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md">
        <h2 className="text-lg font-bold text-white mb-4">Core Operational Guidelines</h2>
        <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/40 border border-slate-850">
            <span className="bg-indigo-600/20 text-indigo-400 px-2 py-0.5 rounded font-bold uppercase text-[9px] shrink-0 mt-0.5">Tenant Isolation</span>
            <p>Every database model is protected by `institution_id` scopes. Cross-institution table records must never leak credentials or grades.</p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/40 border border-slate-850">
            <span className="bg-amber-600/20 text-amber-400 px-2 py-0.5 rounded font-bold uppercase text-[9px] shrink-0 mt-0.5">Approval Flow</span>
            <p>Approving an onboarding request creates the official institution tenant record and generates the default administrator credentials automatically.</p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/40 border border-slate-850">
            <span className="bg-cyan-600/20 text-cyan-400 px-2 py-0.5 rounded font-bold uppercase text-[9px] shrink-0 mt-0.5">Security Auditing</span>
            <p>Critical database adjustments, user creation events, password swaps, and role shifts are recorded into the centralized audit logs.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformDashboard;
