// iMin Printer Service for React GBC POS App
// Complete integration with iMin Swift 2 Pro POS Device
import iminPrinterService from './iminPrinter.service';
import { receiptService } from './receipt.service';

export const printerService = {
  // Check if printer is available (iMin device)
  isPrinterAvailable: () => {
    return iminPrinterService.isPrinterAvailable();
  },

  // Initialize printer
  initialize: async () => {
    return await iminPrinterService.initialize();
  },

  // Get printer status
  getPrinterStatus: async () => {
    return await iminPrinterService.getPrinterStatus();
  },

  // Get printer info
  getPrinterInfo: async () => {
    return await iminPrinterService.getPrinterInfo();
  },

  // Print kitchen receipt using iMin SDK
  printKitchenReceipt: async (order) => {
    try {
      if (!iminPrinterService.isPrinterAvailable()) {
        // For web testing - use receipt service (downloads file)
        return await receiptService.printKitchenReceipt(order);
      }

      // Use iMin service to print kitchen receipt
      return await iminPrinterService.printKitchenReceipt(order);
      
    } catch (error) {
      console.error('Kitchen receipt print failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Print delivery receipt using EXACT format from provided image  
  printDeliverySticker: async (order) => {
    try {
      if (!iminPrinterService.isPrinterAvailable()) {
        // For web testing - use receipt service (downloads file)
        return await receiptService.printDeliveryReceipt(order);
      }

      // Use iMin service to print delivery receipt
      return await iminPrinterService.printDeliveryReceipt(order);
      
    } catch (error) {
      console.error('Delivery receipt print failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Print customer receipt
  printCustomerReceipt: async (order) => {
    try {
      if (!iminPrinterService.isPrinterAvailable()) {
        console.log('Mock: Printing customer receipt for order', order.id);
        return { success: true, mock: true };
      }

      // Use iMin service to print customer receipt
      return await iminPrinterService.printCustomerReceipt(order);
      
    } catch (error) {
      console.error('Customer receipt print failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Test print
  testPrint: async () => {
    try {
      if (!iminPrinterService.isPrinterAvailable()) {
        console.log('Mock: Test print');
        return { success: true, mock: true };
      }

      // Use iMin service to test print
      return await iminPrinterService.testPrint();
      
    } catch (error) {
      console.error('Test print failed:', error);
      return { success: false, error: error.message };
    }
  }
};