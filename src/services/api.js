export const apiFetch = async (endpoint, options = {}) => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // Check if the endpoint starts with one of the direct proxied prefixes
    const directPrefixes = [
        '/faculty',
        '/attendance',
        '/student',
        '/remedial',
        '/class',
        '/marks',
        '/assignments',
        '/submissions',
        '/announcements'
    ];
    const isDirect = directPrefixes.some(
        prefix =>
            (cleanEndpoint === prefix ||
                cleanEndpoint.startsWith(prefix + '/')) &&
            !cleanEndpoint.startsWith('/api')
    );
    const apiBase = isDirect
        ? ''
        : (import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || '/api'));

    const url = `${apiBase}${cleanEndpoint}`;
    console.log("API URL:", url);

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