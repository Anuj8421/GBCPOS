import { apiClient } from './api';

export const orderService = {
  // Get all orders with optional status filter
  getOrders: async (status = null) => {
    try {
      const params = status ? { status } : {};
      const response = await apiClient.get('/orders', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    try {
      const response = await apiClient.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch order');
    }
  },

  // Accept order
  acceptOrder: async (orderId, prepTime) => {
    try {
      const response = await apiClient.post(`/orders/${orderId}/accept`, { prepTime });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to accept order');
    }
  },

  // Decline/Cancel order
  cancelOrder: async (orderId, reason) => {
    try {
      const response = await apiClient.post(`/orders/${orderId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cancel order');
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await apiClient.patch(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update order status');
    }
  },

  // Mark order as ready
  markReady: async (orderId) => {
    try {
      const response = await apiClient.post(`/orders/${orderId}/ready`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to mark order as ready');
    }
  },

  // Set preparation time
  setPrepTime: async (orderId, prepTime) => {
    try {
      const response = await apiClient.post(`/orders/${orderId}/prep-time`, { prepTime });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to set prep time');
    }
  }
};