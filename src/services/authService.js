// Mock Authentication service simulating Node.js/Express JWT endpoints
import { validateInstitutionalEmail } from '../utils/validation';

const API_BASE_URL = "/api/v1/auth"; // Placeholder for future backend connection

// Default mock credentials
export const DEMO_ACCOUNTS = {
  student: {
    email: "student@neurolearn.ai",
    password: "Password123",
    name: "Aarav Singh",
    role: "student",
    branch: "B.Tech Computer Science",
    year: "3rd Year",
    rollNumber: "2023CS8094",
    college: "COEP Technological University",
    avatar: "🚀"
  },
  teacher: {
    email: "teacher@neurolearn.ai",
    password: "Password123",
    name: "Dr. Alok Verma",
    role: "teacher",
    branch: "Computer Engineering",
    designation: "Professor & Head",
    college: "COEP Technological University",
    avatar: "👨‍🏫"
  },
  admin: {
    email: "admin@neurolearn.ai",
    password: "Password123",
    name: "System Administrator",
    role: "admin",
    college: "COEP Technological University",
    avatar: "🛡️"
  }
};

/**
 * Mocks access and refresh token generation (simulating JSON Web Tokens).
 */
const generateMockTokens = (user) => {
  // Simple payload coding simulation
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({
    sub: user.email,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (60 * 15) // 15 mins expiry
  }));
  const signature = "mock_signature_hash";
  
  const accessToken = `${header}.${payload}.${signature}`;
  const refreshToken = `mock_refresh_token_${btoa(user.email)}`;

  return { accessToken, refreshToken };
};

const logSecurityAlert = (email, actionType) => {
  const alerts = JSON.parse(localStorage.getItem("neurolearn_security_alerts") || "[]");
  const newAlert = {
    id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    email: email || "unknown",
    timestamp: new Date().toISOString(),
    actionType: actionType, // 'LOGIN' | 'REGISTER'
    status: 'BLOCKED'
  };
  alerts.unshift(newAlert);
  localStorage.setItem("neurolearn_security_alerts", JSON.stringify(alerts));
};

export const authService = {
  /**
   * Log in user using credentials.
   * Connects to actual backend JWT endpoint.
   */
  login: async (email, password, role, institutionId, domain) => {
    console.log(`[authService] POST ${API_BASE_URL}/login - role: ${role}, institution_id: ${institutionId}`);
    
    // Enforcement check: Only official institutional emails allowed
    if (!validateInstitutionalEmail(email, domain)) {
      throw new Error(`Unauthorized email domain detected. For this institution, please use an email ending in @${domain || 'neurolearn.ai'}.`);
    }

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, role, institution_id: institutionId })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Invalid email, password, role, or institution Selection!");
    }

    return await response.json();
  },

  /**
   * Register a new user profile.
   * Connects to backend registration endpoint.
   */
  register: async (userData, domain) => {
    console.log(`[authService] POST ${API_BASE_URL}/register`);

    const { email } = userData;

    // Enforcement check: Only official institutional emails allowed
    if (!validateInstitutionalEmail(email, domain)) {
      throw new Error(`Only official institutional emails ending with @${domain || 'neurolearn.ai'} are allowed for registration.`);
    }

    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Only official institutional emails are allowed.");
    }

    return await response.json();
  },

  /**
   * Actual JWT Token Refresh endpoint.
   */
  refreshToken: async (token) => {
    console.log(`[authService] POST ${API_BASE_URL}/refresh`);

    if (!token) {
      throw new Error("Invalid refresh token!");
    }

    const response = await fetch(`${API_BASE_URL}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh_token: token })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Invalid refresh token!");
    }

    return await response.json();
  }
};

