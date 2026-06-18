import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Activity, 
  Terminal, 
  Zap, 
  RefreshCw
} from 'lucide-react';
import { apiFetch } from '../../services/api';
import { SYSTEM_METRICS } from '../../data/academicData';

const SystemMonitoring = () => {
  const [status, setStatus] = useState({
    database_status: 'Checking...',
    api_status: 'Checking...',
    storage_status: 'Coming Soon',
    active_users: 0
  });

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await apiFetch("/v1/admin/monitoring/status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      } else {
        setStatus(prev => ({
          ...prev,
          database_status: "Error",
          api_status: "Error"
        }));
      }
    } catch (err) {
      console.error("Error fetching system status:", err);
      setStatus(prev => ({
        ...prev,
        database_status: "Down",
        api_status: "Offline"
      }));
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await apiFetch("/audit-logs");
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map(log => {
          let timeStr = "00:00:00";
          try {
            const dateObj = new Date(log.created_at);
            timeStr = dateObj.toTimeString().split(' ')[0];
          } catch(e) {
            const parts = log.created_at.split(' ');
            if (parts.length > 1) {
              timeStr = parts[1].split('.')[0];
            } else {
              timeStr = log.created_at.split('T')[1]?.split('.')[0] || "00:00:00";
            }
          }
          return {
            text: `${log.performed_by} performed ${log.action} on ${log.entity_type} (ID: ${log.entity_id})`,
            time: timeStr,
            type: log.action === "DELETE" ? "error" : (log.action === "CREATE" || log.action === "ENROLL" ? "success" : "info")
          };
        });
        setLogs(formatted.slice(0, 15));
      }
    } catch (err) {
      console.error("Error fetching audit logs for console:", err);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchLogs();
    const statusInterval = setInterval(fetchStatus, 10000);
    const logsInterval = setInterval(fetchLogs, 15000);
    return () => {
      clearInterval(statusInterval);
      clearInterval(logsInterval);
    };
  }, []);

  const handleClearConsole = () => {
    setLogs([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Platform Telemetry</p>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">Hardware Health & Sessions Monitoring</h2>
          <p className="text-slate-500 text-xs mt-1">
            Real-time visual records mapping system memory constraints, CPU workloads, and telemetry connection logs.
          </p>
        </div>
      </div>

      {/* Grid of hardware parameters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Database Engine */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Server size={22} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Database Engine</span>
            <span className={`text-lg font-extrabold ${status.database_status === 'Operational' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
              {status.database_status}
            </span>
          </div>
        </div>

        {/* API Gateway */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <Activity size={22} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase">API Gateway</span>
            <span className={`text-lg font-extrabold ${status.api_status === 'Operational' ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-500'}`}>
              {status.api_status}
            </span>
          </div>
        </div>

        {/* Object Storage */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <HardDrive size={22} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Object Storage</span>
            <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
              {status.storage_status}
            </span>
          </div>
        </div>

        {/* Platform Active Sessions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <Zap size={22} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Active Users (24h)</span>
            <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
              {status.active_users !== undefined ? `${status.active_users} User(s)` : 'Loading...'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area charts memory limits */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm lg:col-span-2 relative overflow-hidden">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-4 flex items-center gap-2">
            <Server size={18} className="text-emerald-500" />
            LMS Cluster Memory Consumption Profile (GB)
          </h3>
          <div className="h-64 relative">
            {/* Glassmorphic Coming Soon Overlay */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center border border-slate-800/20 z-10">
              <Cpu size={32} className="text-indigo-400 mb-2 animate-pulse" />
              <span className="text-sm font-extrabold text-white">Cluster Performance Telemetry</span>
              <span className="text-[10px] text-indigo-200 mt-1">Coming Soon</span>
            </div>
            
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SYSTEM_METRICS.memoryUsage}>
                <defs>
                  <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis domain={[3.0, 8.0]} stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '11px' }} />
                <Area type="monotone" dataKey="size" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorMemory)" name="RAM Allocation (GB)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live console console monitor */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm flex items-center gap-2">
              <Terminal size={16} className="text-emerald-500 animate-pulse" />
              Live Telemetry Console Logs
            </h3>
            <button 
              onClick={handleClearConsole}
              className="text-[10px] text-indigo-500 font-bold flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              <RefreshCw size={10} />
              Clear Console
            </button>
          </div>

          <div className="bg-slate-950 font-mono text-[10px] text-indigo-300 p-4 rounded-2xl flex-1 overflow-y-auto space-y-2 max-h-[220px] leading-relaxed shadow-inner">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className="flex gap-2.5">
                  <span className="text-slate-500">[{log.time}]</span>
                  <span className={log.type === "success" ? "text-emerald-400" : (log.type === "error" ? "text-rose-400" : "text-indigo-300")}>
                    {log.text}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-slate-500 text-center py-4">No telemetry activity logs available</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SystemMonitoring;
