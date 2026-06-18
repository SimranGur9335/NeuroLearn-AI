import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ShieldAlert, Calendar, User, Eye, Layers } from 'lucide-react';
import { apiFetch } from '../../services/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/audit-logs");
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case "CREATE":
      case "ENROLL":
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "UPDATE":
      case "TRANSFER":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "DELETE":
      case "UNENROLL":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      default:
        return "text-slate-500 bg-slate-500/10 border-slate-500/20";
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.performed_by.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.entity_id && log.entity_id.toString().includes(searchTerm));
    const matchesAction = filterAction === "" || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider">System Operations</p>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white font-sans">Administrative Audit Registry</h2>
          <p className="text-slate-500 text-xs mt-1">Review activity trails, database inserts/updates/deletions, and security modifications.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-3 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-2 rounded-xl w-full md:w-80 focus-within:ring-2 focus-within:ring-emerald-500/50">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search performed by, entity type, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-slate-700 dark:text-slate-250 placeholder-slate-400 focus:outline-none w-full text-xs"
          />
        </div>

        {/* Action filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterAction("")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterAction === "" ? "bg-emerald-600 text-white shadow-md" : "bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-500 hover:bg-slate-100"
            }`}
          >
            All Actions
          </button>
          {["CREATE", "UPDATE", "DELETE", "ENROLL", "TRANSFER", "UNENROLL"].map((action) => (
            <button
              key={action}
              onClick={() => setFilterAction(action)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterAction === action ? "bg-emerald-600 text-white shadow-md" : "bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 text-slate-500 hover:bg-slate-100"
              }`}
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            No audit records match the filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-150 dark:border-slate-850 text-slate-400 font-bold uppercase text-[9px] tracking-wider bg-slate-50/50 dark:bg-slate-950/20">
                  <th className="py-4 pl-5">Timestamp</th>
                  <th className="py-4">Action</th>
                  <th className="py-4">Entity Type</th>
                  <th className="py-4 text-center">Entity ID</th>
                  <th className="py-4 pr-5 text-right">Performed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850/80 font-mono">
                {filteredLogs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors">
                    <td className="py-3.5 pl-5 text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {log.created_at}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded font-black text-[9px] border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-700 dark:text-slate-300 font-bold">
                      <span className="flex items-center gap-1 font-sans text-xs">
                        <Layers size={12} className="text-slate-400" />
                        {log.entity_type}
                      </span>
                    </td>
                    <td className="py-3.5 text-center font-bold text-slate-500">{log.entity_id || 'N/A'}</td>
                    <td className="py-3.5 pr-5 text-right font-sans text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1 justify-end">
                        <User size={12} className="text-slate-400" />
                        {log.performed_by}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AuditLogs;
