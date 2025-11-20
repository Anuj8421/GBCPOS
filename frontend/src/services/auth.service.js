import { apiClient } from './api';

export const authService = {
  // JWT-based authentication
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Invalid credentials. Please check your email and password.');
    }
  },

  // Registration removed - handled by PHP backend/website

  // Google OAuth authentication
  googleLogin: async (googleData) => {
    try {
      // DEVELOPMENT MODE - Mock Google login
      // TODO: Replace with actual PHP backend endpoint when available
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        token: 'mock-google-token-' + Date.now(),
        user: {
          id: 'user-google-' + Date.now(),
          name: googleData.name || 'Google User',
          email: googleData.email,
          role: 'manager',
          storeName: 'Google Restaurant',
          storeId: 'store-google-001'
        }
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Google login failed');
    }
  },

  refreshToken: async () => {
    try {
      const response = await apiClient.post('/auth/refresh');
      return response.data;
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
};