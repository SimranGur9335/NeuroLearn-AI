// Mock Authentication service simulating Node.js/Express JWT endpoints

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

export const authService = {
  /**
   * Log in user using credentials.
   * Simulates Express JWT endpoint.
   */
  login: async (email, password, role) => {
    console.log(`[authService] POST ${API_BASE_URL}/login - role: ${role}`);
    
    // Simulate API network latency
    await new Promise(resolve => setTimeout(resolve, 800));

    // Check custom registrations inside localStorage
    const localUsers = JSON.parse(localStorage.getItem("neurolearn_custom_users") || "[]");
    const matchedCustom = localUsers.find(u => u.email === email && u.role === role);
    
    let user = null;
    
    if (matchedCustom) {
      if (matchedCustom.password === password) {
        user = { ...matchedCustom };
        delete user.password; // strip password
      }
    } else {
      // Check demo accounts
      const demoAccount = DEMO_ACCOUNTS[role];
      if (demoAccount && demoAccount.email === email && demoAccount.password === password) {
        user = { ...demoAccount };
        delete user.password;
      }
    }

    if (!user) {
      throw new Error("Invalid email, password, or role selection!");
    }

    const { accessToken, refreshToken } = generateMockTokens(user);

    return {
      user,
      accessToken,
      refreshToken
    };
  },

  /**
   * Register a new user profile.
   * Simulates Express registration endpoint.
   */
  register: async (userData) => {
    console.log(`[authService] POST ${API_BASE_URL}/register`);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { email, password, name, role } = userData;

    // Check if email already registered
    const demoEmails = Object.values(DEMO_ACCOUNTS).map(d => d.email);
    const localUsers = JSON.parse(localStorage.getItem("neurolearn_custom_users") || "[]");
    const emailExists = demoEmails.includes(email) || localUsers.some(u => u.email === email);

    if (emailExists) {
      throw new Error("This email is already registered inside NeuroLearn!");
    }

    // Save user in local mock DB
    const newUser = {
      ...userData,
      avatar: role === 'student' ? '🚀' : role === 'teacher' ? '👨‍🏫' : '🛡️'
    };
    localUsers.push(newUser);
    localStorage.setItem("neurolearn_custom_users", JSON.stringify(localUsers));

    // Strip password for return payload
    const userPayload = { ...newUser };
    delete userPayload.password;

    return {
      success: true,
      user: userPayload
    };
  },

  /**
   * Simulates JWT Token Refresh endpoint.
   */
  refreshToken: async (token) => {
    console.log(`[authService] POST ${API_BASE_URL}/refresh-token`);
    await new Promise(resolve => setTimeout(resolve, 200));

    if (!token || !token.startsWith("mock_refresh_token_")) {
      throw new Error("Invalid refresh token!");
    }

    // Extract email from refresh token format
    const encodedEmail = token.replace("mock_refresh_token_", "");
    const email = atob(encodedEmail);

    // Find user details
    const localUsers = JSON.parse(localStorage.getItem("neurolearn_custom_users") || "[]");
    let user = localUsers.find(u => u.email === email);
    
    if (!user) {
      // Find in demo accounts
      user = Object.values(DEMO_ACCOUNTS).find(d => d.email === email);
    }

    if (!user) {
      throw new Error("User associated with token not found!");
    }

    const userPayload = { ...user };
    delete userPayload.password;

    const tokens = generateMockTokens(userPayload);
    return {
      accessToken: tokens.accessToken,
      user: userPayload
    };
  }
};
