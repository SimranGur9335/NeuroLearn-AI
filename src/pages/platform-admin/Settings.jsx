import React, { useState } from "react";
import { 
  Settings, 
  Sparkles,
  Save,
  Server,
  ShieldCheck,
  Globe
} from "lucide-react";

export default function PlatformSettings() {
  const [allowApplications, setAllowApplications] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowedDomains, setAllowedDomains] = useState("*.edu, *.ac.in, *.org");
  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("Platform settings saved successfully!");
    }, 800);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
          Global Configurations <Settings className="text-indigo-400" size={24} />
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Adjust global operational toggles, domain restrictions, and maintenance settings.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-6 md:p-8 space-y-6 backdrop-blur-md">
          {/* Section 1: Tenant Controls */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-850 pb-2">
              <Globe size={16} className="text-indigo-400" /> Onboarding Parameters
            </h3>
            
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/40 border border-slate-850">
              <div>
                <label className="text-xs font-bold text-white block">Allow Public Onboarding Requests</label>
                <span className="text-[10px] text-slate-500 block mt-0.5">Controls availability of the /apply-institution page.</span>
              </div>
              <button
                type="button"
                onClick={() => setAllowApplications(!allowApplications)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  allowApplications ? "bg-indigo-600" : "bg-slate-800"
                }`}
              >
                <span 
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                    allowApplications ? "left-6" : "left-1"
                  }`} 
                />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">Permitted Onboarding Email Domains</label>
              <div className="relative flex items-center bg-slate-950/60 border border-slate-850 focus-within:ring-2 focus-within:ring-indigo-500/50 rounded-xl px-3 py-2 transition-all">
                <input 
                  type="text" 
                  value={allowedDomains}
                  onChange={(e) => setAllowedDomains(e.target.value)}
                  className="bg-transparent border-none text-xs text-slate-200 focus:outline-none w-full"
                />
              </div>
              <span className="text-[9px] text-slate-550 pl-1">Separate domains using commas. Restricts email suffix on request submission.</span>
            </div>
          </div>

          {/* Section 2: Platform Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-850 pb-2">
              <Server size={16} className="text-indigo-400" /> Maintenance & Availability
            </h3>
            
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/40 border border-slate-850">
              <div>
                <label className="text-xs font-bold text-white block">Global Maintenance Mode</label>
                <span className="text-[10px] text-slate-500 block mt-0.5">Restricts access to active student/faculty logins with a downtime warning.</span>
              </div>
              <button
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  maintenanceMode ? "bg-amber-600" : "bg-slate-800"
                }`}
              >
                <span 
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                    maintenanceMode ? "left-6" : "left-1"
                  }`} 
                />
              </button>
            </div>
          </div>

          {/* Section 3: Platform Admin Security */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-850 pb-2">
              <ShieldCheck size={16} className="text-indigo-400" /> Security Policies
            </h3>
            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-900/30 text-xs text-slate-300 leading-relaxed">
              <p className="flex items-center gap-1.5 font-bold text-indigo-400 mb-1">
                <Sparkles size={14} /> Owner Authorization Policy
              </p>
              Only registered owner accounts matching <strong>*@neurolearn.ai</strong> with a verified `super_admin` role assignment can make alterations on this console page.
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-extrabold px-6 py-3 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-900/20 cursor-pointer"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Saving settings...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save Platform Configurations</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
