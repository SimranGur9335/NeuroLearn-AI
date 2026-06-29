import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  Landmark, 
  Mail, 
  Phone, 
  Palette, 
  LayoutGrid, 
  UploadCloud, 
  X, 
  Trash2, 
  Image as ImageIcon 
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { useBranding } from '../../context/BrandingContext';
import { apiFetch } from '../../services/api';
import { uploadLogoToSupabase } from '../../utils/supabaseClient';
import defaultLogo from '../../assets/image.png';

const THEME_PREVIEW_MAP = {
  emerald: 'bg-emerald-600',
  indigo: 'bg-indigo-600',
  violet: 'bg-violet-600',
  amber: 'bg-amber-500',
  rose: 'bg-rose-600'
};

const AdminSettings = () => {
  const { setProfile } = useStudent();
  const { fetchBranding } = useBranding();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    institution_name: "",
    logo_url: "",
    academic_year: "",
    contact_email: "",
    contact_phone: "",
    theme: "indigo"
  });

  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [logoRemoved, setLogoRemoved] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/v1/institution/configuration");
      if (res.ok) {
        const data = await res.json();
        setSettings({
          institution_name: data.institution_name || "",
          logo_url: data.logo_url || "",
          academic_year: data.academic_year || "",
          contact_email: data.contact_email || "",
          contact_phone: data.contact_phone || "",
          theme: data.theme || "indigo"
        });
        setPreviewUrl(data.logo_url || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file) => {
    setValidationError("");
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'svg'];
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    const fileExt = file.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(fileExt) && !allowedMimeTypes.includes(file.type)) {
      setValidationError("Invalid format. Supported formats: PNG, JPG, JPEG, SVG.");
      return false;
    }
    if (file.size > 2 * 1024 * 1024) {
      setValidationError("Oversized image. Maximum size: 2 MB.");
      return false;
    }
    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setLogoFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setLogoRemoved(false);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setLogoFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setLogoRemoved(false);
      }
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setPreviewUrl("");
    setLogoRemoved(true);
    setValidationError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setValidationError("");
    
    // Quick validation of required fields
    if (!settings.institution_name.trim()) {
      alert("Institution Name is required");
      return;
    }
    if (!settings.academic_year.trim()) {
      alert("Academic Year is required");
      return;
    }

    try {
      setSaving(true);
      let uploadedLogoUrl = settings.logo_url;

      // Handle File Upload to Supabase Storage if a new file is chosen
      if (logoFile) {
        try {
          const fileExt = logoFile.name.split('.').pop() || 'png';
          // Find college profile/ID to segment storage path
          // Let's call the temporary/simulated path or actual path using student context profile
          const folderPath = `institution_branding/logo.${fileExt}`;
          uploadedLogoUrl = await uploadLogoToSupabase(logoFile, folderPath);
        } catch (err) {
          console.error("Logo upload failed:", err);
          setValidationError("Upload failure: Failed to upload logo to storage.");
          setSaving(false);
          return;
        }
      } else if (logoRemoved) {
        uploadedLogoUrl = "";
      }

      // Update state and save configurations
      const payload = {
        institution_name: settings.institution_name,
        logo_url: uploadedLogoUrl,
        academic_year: settings.academic_year,
        theme: settings.theme,
        contact_email: settings.contact_email,
        contact_phone: settings.contact_phone
      };

      const res = await apiFetch("/v1/institution/configuration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Institution configuration saved successfully!");
        
        // Refresh Branding Context for global reload
        await fetchBranding();
        
        // Propagate to StudentContext for local immediate rendering
        setProfile(prev => ({
          ...prev,
          college: settings.institution_name,
          logo_url: uploadedLogoUrl || defaultLogo,
          theme_color: settings.theme
        }));

        setLogoFile(null);
        setLogoRemoved(false);
      } else {
        const errorData = await res.json();
        alert(errorData.detail || "Failed to save configurations.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

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
          <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Branding & Settings</p>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white font-sans">Institutional Configuration</h2>
          <p className="text-slate-500 text-xs mt-1">Configure branding preferences, academic year defaults, contact parameters, and logo branding.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Core Settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm lg:col-span-2 space-y-6">
          <h3 className="font-extrabold text-slate-850 dark:text-white text-sm md:text-base border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <Landmark size={18} className="text-emerald-500" />
            Institutional Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Institution Name</label>
              <input
                type="text"
                value={settings.institution_name}
                onChange={(e) => setSettings({ ...settings, institution_name: e.target.value })}
                placeholder="e.g. Apex Educational Academy"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                required
              />
            </div>

            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Academic Year default</label>
              <input
                type="text"
                value={settings.academic_year}
                onChange={(e) => setSettings({ ...settings, academic_year: e.target.value })}
                placeholder="e.g. 2023-2024"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 font-mono"
                required
              />
            </div>
          </div>

          {/* Logo Upload Section */}
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-slate-400 uppercase block">Institution Logo</label>
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 transition-all duration-200 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50/50 dark:bg-slate-950/20 ${
                isDragActive 
                  ? 'border-emerald-500 bg-emerald-50/5 dark:bg-emerald-500/5' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
              }`}
            >
              {/* Left Side: Upload State or Preview Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      onError={(e) => { e.target.src = defaultLogo; }}
                      alt="Logo Preview" 
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <ImageIcon className="text-slate-400" size={24} />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-750 dark:text-white">
                    {logoFile ? logoFile.name : (previewUrl ? "Logo configured" : "No logo selected")}
                  </h4>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5">
                    {logoFile ? `${(logoFile.size / 1024).toFixed(1)} KB` : "Supports PNG, JPG, JPEG, SVG up to 2MB"}
                  </p>
                </div>
              </div>

              {/* Right Side: Action Triggers */}
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  id="logo-upload-input"
                  accept=".png,.jpg,.jpeg,.svg"
                  onChange={handleFileChange}
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('logo-upload-input').click()}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-250 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                >
                  {previewUrl ? "Replace Logo" : "Browse Files"}
                </button>
                {previewUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="p-2 bg-rose-50 dark:bg-rose-950/20 text-rose-605 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
                    title="Remove Logo"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
            {validationError && (
              <p className="text-[10px] text-rose-500 font-bold mt-1">{validationError}</p>
            )}
          </div>

          <h3 className="font-extrabold text-slate-850 dark:text-white text-sm md:text-base border-b border-slate-100 dark:border-slate-800 pt-4 pb-2 flex items-center gap-2">
            <Mail size={18} className="text-indigo-500" />
            Contact & Support Parameters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Contact Email</label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                placeholder="e.g. contact@college.edu"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Contact Phone</label>
              <input
                type="text"
                value={settings.contact_phone}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                placeholder="e.g. +1 (123) 456-7890"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Branding & Multi-College Side Panel */}
        <div className="space-y-6">
          {/* Live Branding Preview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-850 dark:text-slate-200 text-sm pb-2 border-b border-slate-100 dark:border-slate-850 flex items-center gap-2">
              <Palette size={16} className="text-emerald-500" />
              Live Branding Preview
            </h3>
            
            <div className="border border-slate-150 dark:border-slate-800 rounded-2xl p-4 bg-slate-50 dark:bg-slate-950 space-y-3">
              {/* Mini sidebar preview */}
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <img
                  src={previewUrl || defaultLogo}
                  onError={(e) => { e.target.src = defaultLogo; }}
                  alt="Preview Logo"
                  className="w-10 h-10 object-contain rounded-lg bg-slate-100 dark:bg-slate-950 p-1"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                    {settings.institution_name || "Institution Name"}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                    AY {settings.academic_year || "2026-27"}
                  </p>
                </div>
              </div>
              
              {/* Theme badge/bar */}
              <div className="flex items-center justify-between text-[10px] px-2 pt-1">
                <span className="text-slate-400 font-bold uppercase">Accent Color</span>
                <span className={`px-2.5 py-1 rounded-full text-white font-bold capitalize text-[9px] ${THEME_PREVIEW_MAP[settings.theme] || 'bg-indigo-600'}`}>
                  {settings.theme}
                </span>
              </div>
            </div>
          </div>

          {/* Branding Settings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-850 dark:text-slate-200 text-sm pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Palette size={16} className="text-emerald-500" />
              Theme & Branding
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Branding Accent Color</label>
                <select
                  value={settings.theme}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                >
                  <option value="emerald">Emerald Green</option>
                  <option value="indigo">Indigo Blue</option>
                  <option value="violet">Violet Purple</option>
                  <option value="amber">Amber Orange</option>
                  <option value="rose">Rose Red</option>
                </select>
              </div>
            </div>
          </div>

          {/* Multi-College Setup Ready */}
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-905 p-6 rounded-3xl shadow-md text-white space-y-3">
            <h3 className="font-extrabold text-sm flex items-center gap-2 text-indigo-400">
              <LayoutGrid size={16} />
              Multi-College Controller
            </h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              This node is initialized and ready for multi-institution partitioning. When activated, administrators can partition departments, users, and mappings per campus shard.
            </p>
            <span className="inline-block text-[9px] font-black uppercase text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              Future Sharding Ready
            </span>
          </div>

          {/* Save Action */}
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all cursor-pointer text-xs shadow-md shadow-emerald-600/15"
          >
            <Save size={16} />
            <span>{saving ? "Saving Configurations..." : "Save Configured Defaults"}</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AdminSettings;
