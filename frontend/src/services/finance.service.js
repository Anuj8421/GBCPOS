import { apiClient } from './api';

export const financeService = {
  // Get payouts overview
  getPayoutsOverview: async () => {
    try {
      const response = await apiClient.get('/finance/payouts');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payouts');
    }
  },

  // Get payouts by order
  getPayoutsByOrder: async (startDate, endDate) => {
    try {
      const response = await apiClient.get('/finance/payouts/orders', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch order payouts');
    }
  },

  // Get invoices
  getInvoices: async (page = 1, limit = 20) => {
    try {
      const response = await apiClient.get('/finance/invoices', { params: { page, limit } });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch invoices');
    }
  },

  // Download invoice
  downloadInvoice: async (invoiceId) => {
    try {
      const response = await apiClient.get(`/finance/invoices/${invoiceId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to download invoice');
    }
  },

  // Get banking details
  getBankingDetails: async () => {
    try {
      const response = await apiClient.get('/finance/banking');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch banking details');
    }
  },

  // Update banking details
  updateBankingDetails: async (bankingData) => {
    try {
      const response = await apiClient.put('/finance/banking', bankingData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update banking details');
    }
  }
};