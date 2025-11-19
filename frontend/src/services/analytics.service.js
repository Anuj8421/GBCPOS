import { apiClient } from './api';

export const analyticsService = {
  // Get dashboard summary
  getDashboardSummary: async (date = null) => {
    try {
      const params = date ? { date } : {};
      const response = await apiClient.get('/analytics/dashboard', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard summary');
    }
  },

  // Get sales analytics
  getSalesAnalytics: async (period = 'day') => {
    try {
      const response = await apiClient.get('/analytics/sales', { params: { period } });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch sales analytics');
    }
  },

  // Get operations metrics
  getOperationsMetrics: async (period = 'day') => {
    try {
      const response = await apiClient.get('/analytics/operations', { params: { period } });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch operations metrics');
    }
  },

  // Get customer reviews
  getReviews: async (page = 1, limit = 20) => {
    try {
      const response = await apiClient.get('/analytics/reviews', { params: { page, limit } });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch reviews');
    }
  },

  // Reply to review
  replyToReview: async (reviewId, reply) => {
    try {
      const response = await apiClient.post(`/analytics/reviews/${reviewId}/reply`, { reply });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to post reply');
    }
  }
};