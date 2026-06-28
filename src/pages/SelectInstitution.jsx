import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Sparkles,
  Building2,
  ArrowRight
} from 'lucide-react';
import { apiFetch } from '../services/api';
import neuroLogo from '../assets/logo.jpeg';

const SelectInstitution = () => {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const res = await apiFetch('/v1/institutions');
        if (res.ok) {
          const data = await res.json();
          setInstitutions(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInstitutions();
  }, []);

  const handleSelect = (inst) => {
    localStorage.setItem('selected_institution_id', inst.institution_id.toString());
    navigate('/login');
  };

  const filteredInstitutions = institutions.filter(inst =>
    inst.institution_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.short_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inst.address && inst.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-500">
        <Sparkles size={40} className="text-indigo-650 animate-spin" />
        <p className="text-[10px] uppercase font-black tracking-widest text-slate-450 mt-6 animate-pulse">
          Loading Campus Registry...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white text-slate-800 min-h-screen flex items-center justify-center relative font-sans p-6 overflow-y-auto">
      {/* Subtle Grid Overlay Graphic matching Landing Page */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none" />

      <div className="max-w-4xl w-full relative z-10 space-y-8 py-8">
        
        {/* NeuroLearn AI Header Branding */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <img 
              src={neuroLogo} 
              alt="NeuroLearn AI Logo" 
              className="w-10 h-10 object-contain rounded-xl shadow-md border border-slate-200"
            />
            <span className="font-extrabold text-2xl text-slate-900 tracking-tight">
              NeuroLearn<span className="text-indigo-600 font-medium">.AI</span>
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight pt-2">
            Select Your Institution
          </h1>
          <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
            Choose your institution to continue.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by college name, code or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
          />
        </div>

        {/* Campus Cards Grid Container */}
        <div className="bg-slate-50/50 border border-slate-200/80 p-6 rounded-3xl space-y-6 backdrop-blur-md">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Available Tenancies ({filteredInstitutions.length})
            </span>
            <button 
              onClick={() => navigate('/apply-institution')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              Onboard your college <ArrowRight size={14} />
            </button>
          </div>

          {filteredInstitutions.length === 0 ? (
            <div className="p-12 text-center text-slate-450 text-sm bg-white rounded-2xl border border-slate-200/60">
              No matching institutions found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredInstitutions.map((inst) => (
                <InstitutionCard 
                  key={inst.institution_id} 
                  inst={inst} 
                  onSelect={handleSelect} 
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// Subcomponent to handle local image error fallback gracefully
const InstitutionCard = ({ inst, onSelect }) => {
  const initialLogo = (inst.logo_url && inst.logo_url !== '/assets/logo.png') ? inst.logo_url : neuroLogo;
  const [imgSrc, setImgSrc] = useState(initialLogo);

  // Update src if inst.logo_url changes
  useEffect(() => {
    setImgSrc((inst.logo_url && inst.logo_url !== '/assets/logo.png') ? inst.logo_url : neuroLogo);
  }, [inst.logo_url]);

  return (
    <motion.div
      whileHover={{ 
        y: -6,
        borderColor: "rgba(99, 102, 241, 0.45)",
        boxShadow: "0 12px 30px -10px rgba(99, 102, 241, 0.15)"
      }}
      transition={{ type: "spring", stiffness: 350, damping: 18 }}
      onClick={() => onSelect(inst)}
      className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50/30 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[175px] relative overflow-hidden group shadow-sm"
    >
      {/* Decorative gradient radial glow on card hover */}
      <div className="absolute -right-10 -top-10 w-28 h-28 bg-radial-gradient(circle,rgba(99,102,241,0.04)_0%,transparent_70%) pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex justify-between items-start gap-4">
        <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-100 shrink-0">
          <img 
            src={imgSrc} 
            onError={() => setImgSrc(neuroLogo)} 
            alt={inst.short_name} 
            className="w-10 h-10 object-contain rounded-lg"
          />
        </div>
        <span className="text-[9px] font-black tracking-widest uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
          {inst.short_name}
        </span>
      </div>
      
      <div className="mt-5 space-y-2">
        <h3 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-relaxed">
          {inst.institution_name}
        </h3>
        {inst.address && (
          <div className="flex items-center gap-1.5 text-slate-400">
            <MapPin size={11} className="shrink-0" />
            <span className="text-[10px] truncate max-w-[200px]">{inst.address}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SelectInstitution;
