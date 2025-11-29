import { apiClient } from './api';

export const authService = {
  // JWT-based authentication
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { username: email, password });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.response?.data?.detail || 'Invalid credentials. Please check your email and password.');
    }
  },

  // Registration removed - handled by PHP backend/website

  // Google OAuth authentication
  googleLogin: async (googleData) => {
    try {
      const response = await apiClient.post('/auth/google', googleData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Google login failed. Please try again.');
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