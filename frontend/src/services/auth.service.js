import { apiClient } from './api';

export const authService = {
  // JWT-based authentication
  login: async (email, password) => {
    try {
      // TODO: Replace with actual PHP backend endpoint
      const response = await apiClient.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  register: async (userData) => {
    try {
      // TODO: Replace with actual PHP backend endpoint
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Google OAuth authentication
  googleLogin: async (googleData) => {
    try {
      // TODO: Replace with actual PHP backend endpoint
      const response = await apiClient.post('/auth/google', googleData);
      return response.data;
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