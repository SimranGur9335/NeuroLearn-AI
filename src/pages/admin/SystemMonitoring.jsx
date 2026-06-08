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
  RefreshCw,
  BellRing
} from 'lucide-react';
import { SYSTEM_METRICS } from '../../data/academicData';

const SystemMonitoring = () => {
  const [logs, setLogs] = useState([
    { text: "LMS Server connection established on port 5173", time: "10:01:22", type: "info" },
    { text: "Seeded local context database with 520 Student entries successfully", time: "10:01:23", type: "success" },
    { text: "Synchronized active courses lists from academicData registry", time: "10:01:24", type: "info" },
    { text: "CPU temperature at 42°C. Fan speeds nominal", time: "10:01:30", type: "info" }
  ]);

  const [memoryMetric, setMemoryMetric] = useState(5.9);
  const [loadMetric, setLoadMetric] = useState(65);

  // Periodically add some fake system logs to make the monitoring look alive!
  useEffect(() => {
    const interval = setInterval(() => {
      const randomLogs = [
        { text: "GET /api/student-profile - Status 200 OK (22ms)", type: "info" },
        { text: "PUT /api/roadmap-node - State update completed", type: "success" },
        { text: "Server telemetry load checked. Nominal load", type: "info" },
        { text: "Synchronized LocalStorage credentials block successfully", type: "info" },
        { text: "Memory cleanup: released 120MB cache space", type: "success" }
      ];

      const chosenLog = randomLogs[Math.floor(Math.random() * randomLogs.length)];
      const now = new Date().toTimeString().split(' ')[0];
      
      setLogs(prev => [
        { text: chosenLog.text, time: now, type: chosenLog.type },
        ...prev.slice(0, 15) // keep last 15 logs
      ]);

      // slightly fluctuate memory and load metrics
      setMemoryMetric(parseFloat((5.7 + Math.random() * 0.5).toFixed(1)));
      setLoadMetric(Math.floor(55 + Math.random() * 20));
    }, 4500);

    return () => clearInterval(interval);
  }, []);

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
          <p className="text-xs text-emerald-505 font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Platform Telemetry</p>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">Hardware Health & Sessions Monitoring</h2>
          <p className="text-slate-500 text-xs mt-1">
            Real-time visual records mapping system memory constraints, CPU workloads, and telemetry connection logs.
          </p>
        </div>
      </div>

      {/* Grid of hardware parameters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* CPU Workload */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Cpu size={22} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase">CPU Core Workload</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-white">{loadMetric}%</span>
          </div>
        </div>

        {/* Memory Allocation */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <HardDrive size={22} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Memory Usage</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-white">{memoryMetric} GB</span>
          </div>
        </div>

        {/* Latency Index */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 text-yellow-600 dark:text-yellow-450 rounded-xl">
            <Zap size={22} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Endpoint Latency</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-white">18 ms</span>
          </div>
        </div>

        {/* Platform Active Sessions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <Activity size={22} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Active Connections</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-white">495 Clients</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area charts memory limits */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm lg:col-span-2">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base mb-4 flex items-center gap-2">
            <Server size={18} className="text-emerald-500" />
            LMS Cluster Memory Consumption Profile (GB)
          </h3>
          <div className="h-64">
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
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-850">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm flex items-center gap-2">
              <Terminal size={16} className="text-emerald-500 animate-pulse" />
              Live Telemetry Console Logs
            </h3>
            <button className="text-[10px] text-indigo-500 font-bold flex items-center gap-1.5 hover:underline cursor-pointer">
              <RefreshCw size={10} className="animate-spin-slow" />
              Clear Console
            </button>
          </div>

          <div className="bg-slate-950 font-mono text-[10px] text-indigo-300 p-4 rounded-2xl flex-1 overflow-y-auto space-y-2 max-h-[200px] leading-relaxed shadow-inner">
            {logs.map((log, index) => (
              <div key={index} className="flex gap-2.5">
                <span className="text-slate-500">[{log.time}]</span>
                <span className={log.type === "success" ? "text-emerald-400" : "text-indigo-300"}>
                  {log.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SystemMonitoring;
