import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL || '/api/';

// Robust URL formatting
if (API_URL.startsWith('http')) {
    // If it's a full URL, ensure it ends with /api/
    if (!API_URL.endsWith('/')) API_URL += '/';
    if (!API_URL.includes('/api/')) API_URL += 'api/';
} else if (API_URL !== '/api/') {
    // If it's just a hostname (like production-backend.onrender.com)
    API_URL = `https://${API_URL}/api/`;
}

console.log('📡 API Base URL:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add JWT token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor to handle token refresh (simplified)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                const response = await axios.post(`${API_URL}token/refresh/`, { refresh: refreshToken });
                localStorage.setItem('access_token', response.data.access);
                api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
                return api(originalRequest);
            } catch (err) {
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

export const authService = {
    login: async (username, password) => {
        const response = await api.post('login/', { username, password });
        if (response.data.access) {
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
        }
        return response.data;
    },
    register: async (username, email, password) => {
        return api.post('register/', { username, email, password });
    },
    logout: () => {
        localStorage.clear();
        window.location.href = '/login';
    },
};

export const predictionService = {
    getPrediction: async () => {
        const response = await api.get('predict/');
        return response.data;
    },
};

export default api;
