import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Search, 
  Trash2, 
  Filter, 
  Clock, 
  UserX,
  AlertOctagon,
  RefreshCw,
  SearchCode
} from 'lucide-react';

const SecurityCenter = () => {
  const [alerts, setAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL"); // ALL | LOGIN | REGISTER
  const [successMsg, setSuccessMsg] = useState("");

  // Load alerts from DB
  const loadAlerts = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/security/events");
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (err) {
      console.error("Error loading security alerts:", err);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleClearLogs = async () => {
    if (window.confirm("Are you sure you want to permanently clear the institutional security alerts logs?")) {
      try {
        const res = await fetch("http://localhost:8000/api/v1/security/events", {
          method: "DELETE"
        });
        if (res.ok) {
          setAlerts([]);
          setSuccessMsg("Security logs successfully cleared!");
          setTimeout(() => setSuccessMsg(""), 3000);
        } else {
          alert("Failed to clear security logs");
        }
      } catch (err) {
        console.error("Error clearing logs:", err);
        alert("Error connecting to server!");
      }
    }
  };


  // Filter alerts based on search term and dropdown filter
  const filteredAlerts = alerts.filter(alert => {
    const matchesEmail = alert.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === "ALL" || alert.actionType === actionFilter;
    return matchesEmail && matchesAction;
  });

  // Calculate statistics
  const totalSuspicious = alerts.filter(a => a.status === 'BLOCKED').length;
  const loginBlocks = alerts.filter(a => a.actionType === 'LOGIN' && a.status === 'BLOCKED').length;
  const registerBlocks = alerts.filter(a => a.actionType === 'REGISTER' && a.status === 'BLOCKED').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-6xl mx-auto"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-red-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert size={14} className="animate-pulse" />
            Security & Auditing
          </p>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">Security Auditing Center</h2>
          <p className="text-slate-500 text-xs mt-1">Audit unauthorized domain entry blocks and suspect registration requests.</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={loadAlerts}
            className="p-2.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition-all border border-slate-200 dark:border-slate-800 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Refresh logs"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          
          <button
            onClick={handleClearLogs}
            disabled={alerts.length === 0}
            className="px-4 py-2.5 bg-red-650 bg-red-600 hover:bg-red-500 disabled:bg-slate-200 dark:disabled:bg-slate-900 disabled:text-slate-400 dark:disabled:text-slate-600 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <Trash2 size={14} />
            Clear Security Logs
          </button>
        </div>
      </div>

      {/* Success notification */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs p-3.5 rounded-2xl flex items-center gap-2">
          <span>{successMsg}</span>
        </div>
      )}

      {/* Metrics Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric Card 1: Total Suspicious */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-550 dark:text-red-400 rounded-2xl">
            <AlertOctagon size={24} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Suspicious Activity</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white block mt-0.5">{totalSuspicious}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Total blocked connections</span>
          </div>
        </div>

        {/* Metric Card 2: Login Blocks */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-2xl">
            <UserX size={24} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Blocked Logins</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white block mt-0.5">{loginBlocks}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Domain mismatch attempts</span>
          </div>
        </div>

        {/* Metric Card 3: Register Blocks */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-550 dark:text-purple-400 rounded-2xl">
            <ShieldAlert size={24} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Blocked Registrations</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white block mt-0.5">{registerBlocks}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Illegal signup requests</span>
          </div>
        </div>
      </div>

      {/* Filter and search parameters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-3xl shadow-sm text-xs">
        {/* Search */}
        <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2">
          <Search size={15} className="text-slate-400 mr-2 shrink-0" />
          <input 
            type="text" 
            placeholder="Search alerts by email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-slate-700 dark:text-slate-200 focus:outline-none w-full text-xs"
          />
        </div>

        {/* Dropdown Filter */}
        <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2 shrink-0">
          <Filter size={15} className="text-slate-400 mr-2 shrink-0" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-transparent border-none text-slate-750 dark:text-slate-200 focus:outline-none text-xs"
          >
            <option value="ALL">All Actions</option>
            <option value="LOGIN">Blocked Logins</option>
            <option value="REGISTER">Blocked Registrations</option>
          </select>
        </div>
      </div>

      {/* Alerts Logs Database Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-850 text-[10px] text-slate-400 uppercase font-black tracking-wider">
                <th className="p-4 pl-6">Triggering Email</th>
                <th className="p-4">Blocked Timestamp</th>
                <th className="p-4 text-center">Action Type</th>
                <th className="p-4 text-center">Enforcement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              <AnimatePresence mode="wait">
                {filteredAlerts.length > 0 ? (
                  filteredAlerts.map(alert => (
                    <motion.tr
                      key={alert.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 text-slate-700 dark:text-slate-300"
                    >
                      {/* Email */}
                      <td className="p-4 pl-6 font-semibold font-mono tracking-tight text-slate-800 dark:text-slate-200">
                        {alert.email}
                      </td>
                      
                      {/* Timestamp */}
                      <td className="p-4 text-slate-500 font-mono flex items-center gap-1.5 mt-1">
                        <Clock size={12} className="text-slate-400 shrink-0" />
                        <span>{new Date(alert.timestamp).toLocaleString()}</span>
                      </td>
                      
                      {/* Action Type */}
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          alert.actionType === 'LOGIN'
                            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10'
                            : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/10'
                        }`}>
                          {alert.actionType}
                        </span>
                      </td>
                      
                      {/* Enforcement status */}
                      <td className="p-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-650 dark:text-red-400 border border-red-500/10">
                          {alert.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-450">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <SearchCode size={28} className="text-slate-500" />
                        <span className="font-bold">No security logs recorded matching current query</span>
                        <span className="text-[10px] text-slate-500 max-w-xs leading-relaxed">
                          All login and registration domain validations are operating securely.
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default SecurityCenter;
