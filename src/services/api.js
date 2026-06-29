export const apiFetch = async (endpoint, options = {}) => {
    const cleanEndpoint = endpoint.startsWith('/')
        ? endpoint
        : `/${endpoint}`;

    const apiBase = "/api";
    const url = cleanEndpoint.startsWith('/api/') || cleanEndpoint === '/api'
        ? cleanEndpoint
        : `${apiBase}${cleanEndpoint}`;

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    const token =
        localStorage.getItem("neurolearn_access_token") ||
        sessionStorage.getItem("neurolearn_access_token");

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return await fetch(url, {
        ...options,
        headers
    });
};