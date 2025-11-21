import { apiClient } from './api';

export const menuService = {
  // Get all categories
  getCategories: async (restaurantId) => {
    try {
      const response = await apiClient.get('/menu/categories', {
        params: { restaurant_id: restaurantId }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch categories');
    }
  },

  // Get all menu items
  getMenuItems: async (restaurantId, categoryId = null, search = null) => {
    try {
      const params = { restaurant_id: restaurantId };
      if (categoryId) params.category = categoryId;
      if (search) params.search = search;
      const response = await apiClient.get('/menu/items', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch menu items');
    }
  },

  // Get menu item by ID
  getMenuItem: async (itemId) => {
    try {
      const response = await apiClient.get(`/menu/items/${itemId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch menu item');
    }
  },

  // Create menu item
  createMenuItem: async (itemData) => {
    try {
      const response = await apiClient.post('/menu/items', itemData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create menu item');
    }
  },

  // Update menu item
  updateMenuItem: async (itemId, itemData) => {
    try {
      const response = await apiClient.put(`/menu/items/${itemId}`, itemData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update menu item');
    }
  },

  // Delete menu item
  deleteMenuItem: async (itemId) => {
    try {
      const response = await apiClient.delete(`/menu/items/${itemId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete menu item');
    }
  },

  // Toggle item availability (Out of Stock)
  toggleItemAvailability: async (itemId, restaurantId, available) => {
    try {
      const response = await apiClient.patch(`/menu/items/${itemId}/availability`, null, {
        params: { restaurant_id: restaurantId, available }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update availability');
    }
  },

  // Bulk update availability
  bulkUpdateAvailability: async (restaurantId, dishIds, available) => {
    try {
      const response = await apiClient.post('/menu/bulk-availability', {
        restaurant_id: restaurantId,
        dish_ids: dishIds,
        available
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to bulk update availability');
    }
  },

  // Bulk upload via CSV
  bulkUploadItems: async (csvFile) => {
    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      const response = await apiClient.post('/menu/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload CSV');
    }
  }
};