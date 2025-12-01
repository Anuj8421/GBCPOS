import axios from 'axios';

// Function to get the current backend URL (supports dynamic changes via localStorage)
const getBackendUrl = () => {
  return localStorage.getItem('custom_backend_url') || process.env.REACT_APP_BACKEND_URL || '';
};

const apiClient = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token AND dynamic baseURL
apiClient.interceptors.request.use(
  (config) => {
    // CRITICAL: Set baseURL dynamically on every request
    const currentBackendUrl = getBackendUrl();
    config.baseURL = `${currentBackendUrl}/api`;
    
    // Add auth token
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

// Export both apiClient and helper function to get current URLs
export { apiClient, getBackendUrl };

// For backward compatibility, export BACKEND_URL and API_BASE as getters
export const BACKEND_URL = getBackendUrl();
export const API_BASE = `${getBackendUrl()}/api`;