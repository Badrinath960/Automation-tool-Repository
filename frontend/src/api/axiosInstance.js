import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer token from localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('atr_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle unauthorized access (401)
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data; // Return data directly for convenience
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('atr_token');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
