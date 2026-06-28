import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from './AuthContext';
import neuroLogo from '../assets/logo.jpeg';

const BrandingContext = createContext();

export const useBranding = () => useContext(BrandingContext);

export const BrandingProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth() || {};
  const [branding, setBranding] = useState({
    institutionName: "NeuroLearn AI",
    logoUrl: neuroLogo,
    themeColor: "indigo",
    academicYear: "2026-2027",
    contactEmail: "contact@neurolearn.ai",
    contactPhone: "",
  });
  const [loading, setLoading] = useState(false);

  const fetchBranding = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await apiFetch("/api/v1/institution/configuration");
      if (res.ok) {
        const data = await res.json();
        setBranding({
          institutionName: data.institution_name || "NeuroLearn AI",
          logoUrl: (data.logo_url && data.logo_url !== "/assets/logo.png") ? data.logo_url : neuroLogo,
          themeColor: data.theme || "indigo",
          academicYear: data.academic_year || "2026-2027",
          contactEmail: data.contact_email || "contact@neurolearn.ai",
          contactPhone: data.contact_phone || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch branding:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBranding();
    } else {
      // Reset to default NeuroLearn branding if logged out
      setBranding({
        institutionName: "NeuroLearn AI",
        logoUrl: neuroLogo,
        themeColor: "indigo",
        academicYear: "2026-2027",
        contactEmail: "contact@neurolearn.ai",
        contactPhone: "",
      });
    }
  }, [isAuthenticated, user?.institution_id]);

  return (
    <BrandingContext.Provider value={{ branding, fetchBranding, loading }}>
      {children}
    </BrandingContext.Provider>
  );
};
