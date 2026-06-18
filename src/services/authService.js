// Mock Authentication service simulating Node.js/Express JWT endpoints
import { validateInstitutionalEmail } from '../utils/validation';

const API_BASE_URL = "/api/v1/auth"; // Placeholder for future backend connection




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

