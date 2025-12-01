import { apiClient } from './api';

export const orderService = {
  // Get all orders with optional status filter
  getOrders: async (restaurantId, status = null, limit = 100) => {
    try {
      const params = {};
      if (status) params.status = status;
      // Backend gets restaurant ID from JWT token, no need to send it
      const response = await apiClient.get('/orders/list', { params });
      return { orders: response.data }; // Wrap in orders object for compatibility
    } catch (error) {
      console.error('getOrders error:', error);
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch orders');
    }
  },

  // Get order by order number
  getOrderByNumber: async (restaurantId, orderNumber) => {
    try {
      // URL encode the order number to handle special characters like #
      const encodedOrderNumber = encodeURIComponent(orderNumber);
      // Backend gets restaurant ID from JWT token
      const response = await apiClient.get(`/orders/detail/${encodedOrderNumber}`);
      return response.data;
    } catch (error) {
      console.error('getOrderByNumber error:', error);
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch order');
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
  updateOrderStatus: async (restaurantId, orderNumber, status, updatedBy = 'pos_app') => {
    try {
      // URL encode the order number to handle special characters like #
      const encodedOrderNumber = encodeURIComponent(orderNumber);
      const response = await apiClient.patch(`/orders/${encodedOrderNumber}/status`, {
        restaurant_id: restaurantId,
        status,
        updated_by: updatedBy
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update order status');
    }
  },

  // Get dashboard statistics
  getDashboardStats: async (restaurantId, startDate = null, endDate = null) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      // Backend gets restaurant ID from JWT token
      const response = await apiClient.get('/dashboard/stats', { params });
      return response.data;
    } catch (error) {
      console.error('getDashboardStats error:', error);
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch dashboard stats');
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