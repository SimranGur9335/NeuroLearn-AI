import React, { useEffect, useState } from "react";
import { 
  School, 
  Sparkles,
  ExternalLink,
  Mail,
  Phone,
  Calendar
} from "lucide-react";
import { apiFetch } from "../../services/api";

const THEME_ACCENTS = {
  violet: "border-violet-500/40 text-violet-400 bg-violet-500/10",
  rose: "border-rose-500/40 text-rose-400 bg-rose-500/10",
  amber: "border-amber-500/40 text-amber-400 bg-amber-500/10",
  indigo: "border-indigo-500/40 text-indigo-400 bg-indigo-500/10"
};

export default function Institutions() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const res = await apiFetch("/v1/platform-admin/institutions");
        if (res.ok) {
          const data = await res.json();
          setInstitutions(data);
        } else {
          setError("Failed to load institutions list.");
        }
      } catch (err) {
        console.error(err);
        setError("Network error loading institutions.");
      } finally {
        setLoading(false);
      }
    };
    fetchInstitutions();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <Sparkles className="animate-spin text-indigo-500" size={32} />
          <p className="text-sm font-bold uppercase tracking-wider animate-pulse">Loading Campuses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
          Onboarded Campuses <School className="text-indigo-400" size={24} />
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Catalog of institutional tenants provisioned with dedicated domains and isolated databases.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-2xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {institutions.length === 0 ? (
          <div className="col-span-full bg-slate-900/40 border border-slate-850 p-12 text-center text-slate-500 text-xs rounded-3xl">
            No institutions onboarded yet. Approve requests to populate the list.
          </div>
        ) : (
          institutions.map((inst) => {
            const themeClass = THEME_ACCENTS[inst.theme_color] || THEME_ACCENTS.indigo;
            return (
              <div 
                key={inst.institution_id}
                className="bg-slate-900/40 border border-slate-850 hover:border-slate-800 rounded-3xl p-6 transition-all duration-300 relative flex flex-col justify-between min-h-[260px] backdrop-blur-md"
              >
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      {inst.logo_url ? (
                        <img 
                          src={inst.logo_url} 
                          alt={inst.short_name} 
                          className="w-10 h-10 object-contain rounded-xl bg-slate-950 p-1 border border-slate-800 shrink-0" 
                        />
                      ) : (
                        <div className="w-10 h-10 bg-indigo-600/20 text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
                          <School size={20} />
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-black text-white leading-snug">{inst.institution_name}</h3>
                        <span className="text-[10px] text-slate-500 font-mono tracking-wide uppercase">{inst.academic_year} Term</span>
                      </div>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${themeClass}`}>
                      {inst.short_name}
                    </span>
                  </div>

                  <div className="mt-6 space-y-2.5 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-slate-500" />
                      <span className="font-mono">{inst.contact_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-slate-500" />
                      <span>{inst.contact_phone || "No phone provided"}</span>
                    </div>
                    {inst.website && (
                      <div className="flex items-center gap-2">
                        <ExternalLink size={13} className="text-slate-500" />
                        <a 
                          href={inst.website.startsWith('http') ? inst.website : `https://${inst.website}`}
                          target="_blank" 
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline font-mono"
                        >
                          {inst.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-900/60 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    Registered {new Date(inst.created_at).toLocaleDateString()}
                  </span>
                  <span className="text-indigo-400 uppercase tracking-widest font-bold">domain: {inst.domain_name}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
