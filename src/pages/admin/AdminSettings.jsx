import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Settings, Landmark, Mail, Phone, Palette, HelpCircle, LayoutGrid } from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { apiFetch } from '../../services/api';

const AdminSettings = () => {
  const { setProfile } = useStudent();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    institution_name: "",
    institution_logo: "",
    academic_year: "",
    contact_email: "",
    contact_phone: "",
    branding_color: "emerald",
    theme_preference: "dark"
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/admin/settings");
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await apiFetch("/admin/settings", {
        method: "POST",
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert("System settings saved successfully!");
        setProfile(prev => ({
          ...prev,
          college: settings.institution_name,
          logo_url: settings.institution_logo,
          theme_color: settings.branding_color
        }));
      } else {
        alert("Failed to save settings.");
      }
    } catch (err) {
      console.error(err);
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
          <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider">System Control</p>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white font-sans">Institutional Configuration</h2>
          <p className="text-slate-500 text-xs mt-1">Configure branding preferences, academic year defaults, contact parameters, and college metadata.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Core Settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-880 p-6 rounded-3xl shadow-sm lg:col-span-2 space-y-6">
          <h3 className="font-extrabold text-slate-850 dark:text-white text-sm md:text-base border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-2">
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
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                required
              />
            </div>

            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Institution Logo URL</label>
              <input
                type="text"
                value={settings.institution_logo}
                onChange={(e) => setSettings({ ...settings, institution_logo: e.target.value })}
                placeholder="e.g. http://logo-path.png"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Academic Year default</label>
              <input
                type="text"
                value={settings.academic_year}
                onChange={(e) => setSettings({ ...settings, academic_year: e.target.value })}
                placeholder="e.g. 2023-2024"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 font-mono"
                required
              />
            </div>
          </div>

          <h3 className="font-extrabold text-slate-850 dark:text-white text-sm md:text-base border-b border-slate-100 dark:border-slate-855 pt-4 pb-2 flex items-center gap-2">
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
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Contact Phone</label>
              <input
                type="text"
                value={settings.contact_phone}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                placeholder="e.g. +1 (123) 456-7890"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Branding & Multi-College Side Panel */}
        <div className="space-y-6">
          {/* Branding Settings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-850 dark:text-slate-200 text-sm pb-2 border-b border-slate-100 dark:border-slate-850 flex items-center gap-2">
              <Palette size={16} className="text-emerald-500" />
              Theme & Branding
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Branding Accent Color</label>
                <select
                  value={settings.branding_color}
                  onChange={(e) => setSettings({ ...settings, branding_color: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                >
                  <option value="emerald">Emerald Green</option>
                  <option value="indigo">Indigo Blue</option>
                  <option value="violet">Violet Purple</option>
                  <option value="amber">Amber Orange</option>
                  <option value="rose">Rose Red</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Theme Preference</label>
                <select
                  value={settings.theme_preference}
                  onChange={(e) => setSettings({ ...settings, theme_preference: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                >
                  <option value="dark">Dark Theme</option>
                  <option value="light">Light Theme</option>
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
