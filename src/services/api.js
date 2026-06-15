export const apiFetch = async (endpoint, options = {}) => {
    // In development mode, route requests relatively through Vite's dev proxy (/api).
    // This protects local development from polluted system environment variables (like VITE_API_URL=localhost:5000).
    const apiBase = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || '/api');
    
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${apiBase}${cleanEndpoint}`;

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    const token = localStorage.getItem("neurolearn_access_token") || sessionStorage.getItem("neurolearn_access_token");
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return await fetch(url, {
        ...options,
        headers
    });
};