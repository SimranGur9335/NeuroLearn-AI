import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Global fetch interceptor to automatically attach authorization header
const originalFetch = window.fetch;
window.fetch = async function (url, options = {}) {
  let targetUrl = url;
  const apiBase = import.meta.env.VITE_API_URL || '';

  const isBackend = typeof url === 'string' && (
    url.startsWith('/api/') ||
    url.startsWith('/admin/') ||
    url.startsWith('/class/') ||
    url.startsWith('/faculty/') ||
    url.startsWith('/assignments') ||
    url.startsWith('/attendance/') ||
    url.startsWith('/marks') ||
    url.startsWith('/submissions/') ||
    url.startsWith('/announcements') ||
    url.startsWith('/predict/') ||
    url.startsWith('/quiz/') ||
    url.includes('localhost:8000') ||
    url.includes('127.0.0.1:8000')
  );

  if (isBackend) {
    if (url.includes('localhost:8000') || url.includes('127.0.0.1:8000')) {
      if (apiBase) {
        const cleanApiBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
        targetUrl = url.replace(/^https?:\/\/(localhost|127\.0\.0\.1):8000/, cleanApiBase);
      }
    } else if (url.startsWith('/')) {
      if (apiBase && (apiBase.startsWith('http://') || apiBase.startsWith('https://'))) {
        const cleanApiBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
        targetUrl = `${cleanApiBase}${url}`;
      }
    }

    options.headers = options.headers || {};
    const token = localStorage.getItem("neurolearn_access_token") || sessionStorage.getItem("neurolearn_access_token");
    if (token) {
      if (options.headers instanceof Headers) {
        options.headers.set('Authorization', `Bearer ${token}`);
      } else if (Array.isArray(options.headers)) {
        options.headers.push(['Authorization', `Bearer ${token}`]);
      } else {
        options.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await originalFetch(targetUrl, options);
      if (
        response.status === 401 &&
        !targetUrl.includes("/api/v1/auth/logout")
      ) {
        window.dispatchEvent(new Event("auth-unauthorized"));
      }
      return response;
    } catch (err) {
      throw err;
    }
  }

  return originalFetch(url, options);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRoleState] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize and validate token session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const savedRefreshToken = localStorage.getItem("neurolearn_refresh_token");
      const savedRole = localStorage.getItem("neurolearn_role");

      if (savedRefreshToken && savedRole) {
        try {
          // Attempt token refresh to verify session
          const data = await authService.refreshToken(savedRefreshToken);

          setUser(data.user);
          setRoleState(data.user.role);
          setAccessToken(data.accessToken);
          setRefreshToken(data.refreshToken || savedRefreshToken);
          setIsAuthenticated(true);

          localStorage.setItem("neurolearn_access_token", data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem("neurolearn_refresh_token", data.refreshToken);
          }
        } catch (err) {
          console.error("Session restoration failed:", err.message);
          // Wipes invalid credentials
          localStorage.removeItem("neurolearn_access_token");
          localStorage.removeItem("neurolearn_refresh_token");
          localStorage.removeItem("neurolearn_role");
        }
      }
      setLoading(false);
    };

    const handleUnauthorized = () => {
      // Don't call backend logout again.
      setUser(null);
      setRoleState(null);
      setAccessToken(null);
      setRefreshToken(null);
      setIsAuthenticated(false);

      localStorage.removeItem("neurolearn_access_token");
      localStorage.removeItem("neurolearn_refresh_token");
      localStorage.removeItem("neurolearn_role");

      sessionStorage.removeItem("neurolearn_access_token");
      sessionStorage.removeItem("neurolearn_refresh_token");
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    initializeAuth();

    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, []);


  /**
   * Login handler.
   */
  const login = async (email, password, roleSelection, institutionId, domain, rememberMe = true) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password, roleSelection, institutionId, domain);

      setUser(data.user);
      setRoleState(data.user.role);
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setIsAuthenticated(true);

      // Persistence
      if (rememberMe) {
        localStorage.setItem("neurolearn_access_token", data.accessToken);
        localStorage.setItem("neurolearn_refresh_token", data.refreshToken);
        localStorage.setItem("neurolearn_role", data.user.role);
      } else {
        sessionStorage.setItem("neurolearn_access_token", data.accessToken);
        sessionStorage.setItem("neurolearn_refresh_token", data.refreshToken);
      }

      return data.user;
    } catch (err) {
      setIsAuthenticated(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registration handler.
   */
  const register = async (userData, domain) => {
    setLoading(true);
    try {
      const data = await authService.register(userData, domain);
      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout handler.
   */
  const logout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
    } catch (err) {
      console.warn("Backend logout invalidation failed:", err);
    }
    setUser(null);
    setRoleState(null);
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);

    // Clear storage keys
    localStorage.removeItem("neurolearn_access_token");
    localStorage.removeItem("neurolearn_refresh_token");
    localStorage.removeItem("neurolearn_role");

    sessionStorage.removeItem("neurolearn_access_token");
    sessionStorage.removeItem("neurolearn_refresh_token");
  };

  /**
  /**
   * Modifies profile credentials dynamically.
   */
  const updateProfile = async (updatedFields) => {
    if (!user) return;
    try {
      const res = await fetch("/api/v1/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to update profile");
      }
      setUser(prev => ({ ...prev, ...updatedFields }));
    } catch (err) {
      console.error("Profile update failed:", err);
      throw err;
    }
  };

  /**
   * Change password logic.
   */
  const changePassword = async (oldPassword, newPassword) => {
    if (!user) throw new Error("No active session found.");
    const res = await fetch("/api/v1/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to change password. Old password might be incorrect.");
    }
    // Update local user state so ProtectedRoute is satisfied
    setUser(prev => prev ? { ...prev, mustChangePassword: false } : null);
    return { success: true };
  };

  /**
   * Update avatar logic.
   */
  const updateAvatar = async (avatarUrl) => {
    if (!user) return;
    try {
      const res = await fetch("/api/v1/profile/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_url: avatarUrl })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to update avatar");
      }
      setUser(prev => ({ ...prev, avatar: avatarUrl }));
    } catch (err) {
      console.error("Avatar update failed:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      role,
      accessToken,
      refreshToken,
      isAuthenticated,
      loading,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      updateAvatar
    }}>
      {children}
    </AuthContext.Provider>
  );
};
