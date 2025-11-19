import { apiClient } from './api';

export const storeService = {
  // Get store information
  getStoreInfo: async () => {
    try {
      const response = await apiClient.get('/store/info');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch store info');
    }
  },

  // Update store information
  updateStoreInfo: async (storeData) => {
    try {
      const response = await apiClient.put('/store/info', storeData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update store info');
    }
  },

  // Get store status
  getStoreStatus: async () => {
    try {
      const response = await apiClient.get('/store/status');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch store status');
    }
  },

  // Toggle store status (open/closed)
  toggleStoreStatus: async (status) => {
    try {
      const response = await apiClient.post('/store/status', { status });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update store status');
    }
  },

  // Get store hours
  getStoreHours: async () => {
    try {
      const response = await apiClient.get('/store/hours');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch store hours');
    }
  },

  // Update store hours
  updateStoreHours: async (hours) => {
    try {
      const response = await apiClient.put('/store/hours', hours);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update store hours');
    }
  },

  // Get preparation time settings
  getPrepTimeSettings: async () => {
    try {
      const response = await apiClient.get('/store/prep-time');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch prep time settings');
    }
  },

  // Update preparation time settings
  updatePrepTimeSettings: async (prepTime) => {
    try {
      const response = await apiClient.put('/store/prep-time', prepTime);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update prep time');
    }
  }
};