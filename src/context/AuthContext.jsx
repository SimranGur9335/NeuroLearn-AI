import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

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
          setRefreshToken(savedRefreshToken);
          setIsAuthenticated(true);
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

    initializeAuth();
  }, []);

  /**
   * Login handler.
   */
  const login = async (email, password, roleSelection, rememberMe = true) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password, roleSelection);
      
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
  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await authService.register(userData);
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
  const logout = () => {
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
   * Modifies profile credentials dynamically.
   */
  const updateProfile = (updatedFields) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser);

    // Update in custom registrations registry (including demo overrides)
    const localUsers = JSON.parse(localStorage.getItem("neurolearn_custom_users") || "[]");
    const userIndex = localUsers.findIndex(u => u.email === user.email && u.role === user.role);

    if (userIndex !== -1) {
      localUsers[userIndex] = { ...localUsers[userIndex], ...updatedFields };
    } else {
      // Create custom entry override for this demo account
      const customUserOverride = {
        ...user,
        ...updatedFields
      };
      localUsers.push(customUserOverride);
    }
    localStorage.setItem("neurolearn_custom_users", JSON.stringify(localUsers));

    // Re-generate and save new mock access token to match updated state immediately
    // to prevent mismatch if code reads details from token storage
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({
      sub: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      exp: Math.floor(Date.now() / 1000) + (60 * 15)
    }));
    const signature = "mock_signature_hash";
    const newAccessToken = `${header}.${payload}.${signature}`;
    
    setAccessToken(newAccessToken);
    if (localStorage.getItem("neurolearn_access_token")) {
      localStorage.setItem("neurolearn_access_token", newAccessToken);
    } else if (sessionStorage.getItem("neurolearn_access_token")) {
      sessionStorage.setItem("neurolearn_access_token", newAccessToken);
    }
  };

  /**
   * Change password logic.
   */
  const changePassword = async (oldPassword, newPassword) => {
    if (!user) throw new Error("No active session found.");
    
    // Fetch custom users registry
    const localUsers = JSON.parse(localStorage.getItem("neurolearn_custom_users") || "[]");
    const userIndex = localUsers.findIndex(u => u.email === user.email && u.role === user.role);
    
    if (userIndex !== -1) {
      if (localUsers[userIndex].password !== oldPassword) {
        throw new Error("The old password you entered is incorrect!");
      }
      localUsers[userIndex].password = newPassword;
      localStorage.setItem("neurolearn_custom_users", JSON.stringify(localUsers));
      return { success: true };
    } else {
      // Demo accounts have standard "Password123" fixed values.
      // We will allow password shifting for demo testing by initializing a custom registry override:
      if (oldPassword !== "Password123") {
        throw new Error("The old password you entered is incorrect!");
      }
      // Pushes override record to localUsers
      const customUserOverride = {
        email: user.email,
        password: newPassword,
        name: user.name,
        role: user.role,
        branch: user.branch || "",
        year: user.year || "",
        rollNumber: user.rollNumber || "",
        college: user.college || "",
        avatar: user.avatar || "🚀"
      };
      localUsers.push(customUserOverride);
      localStorage.setItem("neurolearn_custom_users", JSON.stringify(localUsers));
      return { success: true };
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
      changePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};
