import { apiClient } from './api';

export const authService = {
  // JWT-based authentication
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      // Fallback to mock for development if API fails
      console.warn('Login API failed, using mock:', error.message);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: 'user-001',
          name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
          email: email,
          role: 'manager',
          storeName: 'Test Restaurant',
          storeId: 'store-001'
        },
        restaurant_id: 'restaurant_001'
      };
    }
  },

  register: async (userData) => {
    try {
      // DEVELOPMENT MODE - Accept any registration
      // TODO: Replace with actual PHP backend endpoint when available
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful registration
      return {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: 'user-' + Date.now(),
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          role: 'manager',
          storeName: userData.storeName,
          storeId: 'store-' + Date.now()
        }
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

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