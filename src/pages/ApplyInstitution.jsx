import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  School, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { apiFetch } from '../services/api';

const ApplyInstitution = () => {
  const navigate = useNavigate();
  
  // Form input states
  const [instName, setInstName] = useState("");
  const [instCode, setInstCode] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    // Form validation
    if (!instName.trim() || !instCode.trim() || !contactPerson.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      setErrorMsg("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    const codeRegex = /^[A-Za-z0-9]{2,10}$/;
    if (!codeRegex.test(instCode.trim())) {
      setErrorMsg("Institution code must be 2 to 10 alphanumeric characters (e.g. COEP).");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        institution_name: instName.trim(),
        institution_code: instCode.trim().toUpperCase(),
        contact_person: contactPerson.trim(),
        email: email.trim(),
        phone: phone.trim(),
        website: website.trim() || null,
        address: address.trim()
      };

      const res = await apiFetch('/v1/institution/apply', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
      } else {
        setErrorMsg(data.detail || "Onboarding application failed. Code might already be registered.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("A network error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center relative font-sans p-4 overflow-y-auto">
      {/* Grid Overlay Graphic */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl w-full bg-slate-900/60 border border-slate-850 p-6 md:p-8 rounded-3xl shadow-2xl relative z-10 space-y-6 backdrop-blur-md"
      >
        {/* Back Link */}
        <button 
          onClick={() => navigate('/')} 
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white cursor-pointer transition-colors"
        >
          <ArrowLeft size={14} /> Back to Landing Page
        </button>

        {success ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 space-y-4"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <FileCheck size={36} className="animate-bounce" />
            </div>
            <h2 className="text-2xl font-black text-white">Application Received</h2>
            <p className="text-slate-450 text-xs max-w-sm mx-auto leading-relaxed">
              Your onboarding request has been registered. The platform administrator will verify your details and generate your credentials.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl text-xs mt-6 transition-all"
            >
              Return Home
            </button>
          </motion.div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-2">
                <div className="p-2 rounded-xl text-white bg-indigo-600 shadow-md">
                  <Sparkles size={18} />
                </div>
                <span className="font-extrabold text-xl bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                  NeuroLearn AI
                </span>
              </div>
              <h2 className="text-xl font-black text-white">Request Institution Onboarding</h2>
              <p className="text-slate-400 text-xs">
                Submit an onboarding application to receive a tenant-isolated campus portal.
              </p>
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3.5 rounded-2xl flex items-start gap-2.5"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p className="leading-relaxed">{errorMsg}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Institution Name */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">Institution Name *</label>
                  <div className="relative flex items-center bg-slate-950/60 border border-slate-850 focus-within:ring-2 focus-within:ring-indigo-500/50 rounded-xl px-3 py-2 transition-all">
                    <School size={15} className="text-slate-500 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={instName}
                      onChange={(e) => setInstName(e.target.value)}
                      placeholder="e.g. College of Engineering Pune"
                      className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-550 focus:outline-none w-full"
                      required
                    />
                  </div>
                </div>

                {/* Institution Code */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">Short Code *</label>
                  <div className="relative flex items-center bg-slate-950/60 border border-slate-850 focus-within:ring-2 focus-within:ring-indigo-500/50 rounded-xl px-3 py-2 transition-all">
                    <School size={15} className="text-slate-500 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={instCode}
                      onChange={(e) => setInstCode(e.target.value)}
                      placeholder="e.g. COEP (2-10 chars)"
                      className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-550 focus:outline-none w-full uppercase font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Contact Person */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">Contact Person Name *</label>
                  <div className="relative flex items-center bg-slate-950/60 border border-slate-850 focus-within:ring-2 focus-within:ring-indigo-500/50 rounded-xl px-3 py-2 transition-all">
                    <User size={15} className="text-slate-500 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="e.g. Dr. Rajesh Patil"
                      className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-550 focus:outline-none w-full"
                      required
                    />
                  </div>
                </div>

                {/* Contact Email */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">Representative Email *</label>
                  <div className="relative flex items-center bg-slate-950/60 border border-slate-850 focus-within:ring-2 focus-within:ring-indigo-500/50 rounded-xl px-3 py-2 transition-all">
                    <Mail size={15} className="text-slate-500 mr-2 shrink-0" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. admin@coep.ac.in"
                      className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-550 focus:outline-none w-full"
                      required
                    />
                  </div>
                </div>

                {/* Contact Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">Contact Phone *</label>
                  <div className="relative flex items-center bg-slate-950/60 border border-slate-850 focus-within:ring-2 focus-within:ring-indigo-500/50 rounded-xl px-3 py-2 transition-all">
                    <Phone size={15} className="text-slate-500 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-550 focus:outline-none w-full"
                      required
                    />
                  </div>
                </div>

                {/* Website */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">Campus Website URL</label>
                  <div className="relative flex items-center bg-slate-950/60 border border-slate-850 focus-within:ring-2 focus-within:ring-indigo-500/50 rounded-xl px-3 py-2 transition-all">
                    <Globe size={15} className="text-slate-500 mr-2 shrink-0" />
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="e.g. www.coep.org.in"
                      className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-550 focus:outline-none w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">Physical Address *</label>
                <div className="relative flex items-start bg-slate-950/60 border border-slate-850 focus-within:ring-2 focus-within:ring-indigo-500/50 rounded-xl px-3 py-2 transition-all">
                  <MapPin size={15} className="text-slate-500 mr-2 mt-1 shrink-0" />
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Wellesley Rd, Shivajinagar, Pune, Maharashtra 411005"
                    className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-550 focus:outline-none w-full resize-none"
                    required
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-extrabold rounded-xl transition-all shadow-lg shadow-indigo-600/10 text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-4"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Registering Application...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Onboarding Request</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ApplyInstitution;
