import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// This will be replaced with actual PHP backend URL once provided
const PHP_API_BASE = process.env.REACT_APP_PHP_API_URL || 'http://placeholder-api.local';

const apiClient = axios.create({
  baseURL: PHP_API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export { apiClient, BACKEND_URL, PHP_API_BASE };