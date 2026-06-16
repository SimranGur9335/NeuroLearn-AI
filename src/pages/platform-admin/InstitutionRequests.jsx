import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GitPullRequest, 
  Check, 
  X, 
  Sparkles,
  Info,
  Calendar,
  Copy,
  ExternalLink
} from "lucide-react";
import { apiFetch } from "../../services/api";

export default function InstitutionRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  
  // Credentials dialog state
  const [credentials, setCredentials] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await apiFetch("/v1/platform-admin/institution-requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      } else {
        setError("Failed to load onboarding requests.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error loading onboarding requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (requestId) => {
    setError("");
    setActionLoadingId(requestId);
    try {
      const res = await apiFetch(`/v1/platform-admin/approve/${requestId}`, {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCredentials(data);
        await fetchRequests();
      } else {
        setError(data.detail || "Approval failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to approve due to a server error.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (requestId) => {
    if (!window.confirm("Are you sure you want to reject this onboarding application?")) return;
    setError("");
    setActionLoadingId(requestId);
    try {
      const res = await apiFetch(`/v1/platform-admin/reject/${requestId}`, {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Request rejected successfully.");
        await fetchRequests();
      } else {
        setError(data.detail || "Rejection failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to reject due to a server error.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <Sparkles className="animate-spin text-indigo-500" size={32} />
          <p className="text-sm font-bold uppercase tracking-wider animate-pulse">Loading Onboarding Forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
          Onboarding Applications <GitPullRequest className="text-indigo-400" size={24} />
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Review pending and historical university application requests submitted through the portal.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-2xl">
          {error}
        </div>
      )}

      {/* Credentials Dialog */}
      <AnimatePresence>
        {credentials && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-indigo-950/60 border border-indigo-500/30 p-6 rounded-3xl space-y-4 shadow-xl shadow-indigo-950/40 relative"
          >
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-black uppercase tracking-wider">
              <Sparkles size={16} />
              <span>Tenant Setup Successful!</span>
            </div>
            <p className="text-slate-200 text-xs">
              The institution <strong>{credentials.institution}</strong> has been onboarded. Please provide these default credentials to the campus administrator:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-850">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Admin Login Username</label>
                <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 mt-1">
                  <span className="text-xs text-white font-mono">{credentials.admin_email}</span>
                  <button onClick={() => copyToClipboard(credentials.admin_email)} className="text-slate-400 hover:text-white">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Temporary Password</label>
                <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 mt-1">
                  <span className="text-xs text-white font-mono">{credentials.temporary_password}</span>
                  <button onClick={() => copyToClipboard(credentials.temporary_password)} className="text-slate-400 hover:text-white">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setCredentials(null)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                Close Notice
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Table */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-3xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-850 bg-slate-950/40">
                <th className="p-4 text-xs font-black uppercase text-slate-400">Institution Name</th>
                <th className="p-4 text-xs font-black uppercase text-slate-400">Code</th>
                <th className="p-4 text-xs font-black uppercase text-slate-400">Representative</th>
                <th className="p-4 text-xs font-black uppercase text-slate-400">Contact / Email</th>
                <th className="p-4 text-xs font-black uppercase text-slate-400">Domain / Website</th>
                <th className="p-4 text-xs font-black uppercase text-slate-400">Status</th>
                <th className="p-4 text-xs font-black uppercase text-slate-400 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                    No onboarding applications found in system registry.
                  </td>
                </tr>
              ) : (
                requests.map((r, idx) => (
                  <tr 
                    key={r.request_id}
                    className={`border-b border-slate-850/50 hover:bg-slate-900/20 transition-colors ${
                      idx % 2 === 0 ? "bg-slate-900/10" : ""
                    }`}
                  >
                    <td className="p-4">
                      <span className="text-xs font-bold text-white block">{r.institution_name}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{r.address || "No address provided"}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-bold text-indigo-400 font-mono uppercase bg-indigo-500/10 px-2 py-0.5 rounded">
                        {r.institution_code}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-semibold text-slate-200 block">{r.contact_person}</span>
                      <span className="text-[10px] text-slate-500 block">{r.phone}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs text-slate-300 font-mono block">{r.email}</span>
                    </td>
                    <td className="p-4">
                      {r.website ? (
                        <a 
                          href={r.website.startsWith('http') ? r.website : `https://${r.website}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-xs text-cyan-400 hover:underline inline-flex items-center gap-1 font-mono"
                        >
                          {r.website} <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-600">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        r.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                        r.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {r.status === 'pending' ? (
                          <>
                            <button
                              disabled={actionLoadingId !== null}
                              onClick={() => handleApprove(r.request_id)}
                              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white transition-all cursor-pointer flex items-center justify-center"
                              title="Approve Institution"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              disabled={actionLoadingId !== null}
                              onClick={() => handleReject(r.request_id)}
                              className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white transition-all cursor-pointer flex items-center justify-center"
                              title="Reject Application"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">Archived</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}