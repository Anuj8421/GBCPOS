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
      if (!window.IminPrinter) {
        // For web testing - use receipt service
        return await receiptService.printDeliveryReceipt(order);
      }

      // Get restaurant data
      const restaurant = {
        name: "The Curry Vault", // Dynamic from order data
        address: "Restaurant Address"
      };
      
      const receiptText = receiptService.generateDeliveryReceipt(order, restaurant);
      
      // Print using iMin printer
      await window.IminPrinter.setAlignment(1); // Center alignment for header
      await window.IminPrinter.setTextSize(28);
      
      // Print the formatted receipt
      const lines = receiptText.split('\n');
      for (const line of lines) {
        if (line.includes('GENERAL') || line.includes('BILIMORIA') || line.includes('Delivery Receipt')) {
          await window.IminPrinter.setAlignment(1); // Center
        } else {
          await window.IminPrinter.setAlignment(0); // Left
        }
        await window.IminPrinter.printText(line + '\n');
      }
      
      await window.IminPrinter.feedPaper(3);
      return { success: true };
      
    } catch (error) {
      console.error('Delivery receipt print failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Print customer receipt
  printCustomerReceipt: async (order) => {
    try {
      if (!window.IminPrinter) {
        console.log('Mock: Printing customer receipt for order', order.id);
        return { success: true, mock: true };
      }

      await window.IminPrinter.setAlignment(1); // Center
      await window.IminPrinter.setTextSize(32);
      await window.IminPrinter.printText('RECEIPT\n\n');
      
      await window.IminPrinter.setTextSize(24);
      await window.IminPrinter.printText(`${order.storeName}\n`);
      await window.IminPrinter.printText(`${order.storeAddress}\n\n`);
      
      await window.IminPrinter.setAlignment(0); // Left
      await window.IminPrinter.printText(`Order #${order.id}\n`);
      await window.IminPrinter.printText(`Date: ${new Date(order.createdAt).toLocaleString()}\n`);
      await window.IminPrinter.printText('------------------------\n');
      
      // Print items
      for (const item of order.items) {
        await window.IminPrinter.printText(`${item.quantity}x ${item.name}`);
        await window.IminPrinter.setAlignment(2); // Right
        await window.IminPrinter.printText(`$${(item.price * item.quantity).toFixed(2)}\n`);
        await window.IminPrinter.setAlignment(0); // Left
      }
      
      await window.IminPrinter.printText('------------------------\n');
      await window.IminPrinter.printText(`Subtotal:`);
      await window.IminPrinter.setAlignment(2);
      await window.IminPrinter.printText(`$${order.subtotal.toFixed(2)}\n`);
      await window.IminPrinter.setAlignment(0);
      await window.IminPrinter.printText(`Tax:`);
      await window.IminPrinter.setAlignment(2);
      await window.IminPrinter.printText(`$${order.tax.toFixed(2)}\n`);
      await window.IminPrinter.setAlignment(0);
      await window.IminPrinter.printText(`Delivery:`);
      await window.IminPrinter.setAlignment(2);
      await window.IminPrinter.printText(`$${order.deliveryFee.toFixed(2)}\n`);
      await window.IminPrinter.setAlignment(0);
      await window.IminPrinter.setTextSize(28);
      await window.IminPrinter.printText(`TOTAL:`);
      await window.IminPrinter.setAlignment(2);
      await window.IminPrinter.printText(`$${order.total.toFixed(2)}\n`);
      
      await window.IminPrinter.setAlignment(1);
      await window.IminPrinter.printText('\nThank you!\n');
      await window.IminPrinter.printText('\n\n\n');
      await window.IminPrinter.feedPaper(3);
      
      return { success: true };
    } catch (error) {
      console.error('Customer receipt print failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Test print
  testPrint: async () => {
    try {
      if (!window.IminPrinter) {
        console.log('Mock: Test print');
        return { success: true, mock: true };
      }

      await window.IminPrinter.setAlignment(1);
      await window.IminPrinter.setTextSize(28);
      await window.IminPrinter.printText('GBC POS Test Print\n');
      await window.IminPrinter.printText(`${new Date().toLocaleString()}\n`);
      await window.IminPrinter.printText('Printer is working!\n\n\n');
      await window.IminPrinter.feedPaper(3);
      
      return { success: true };
    } catch (error) {
      console.error('Test print failed:', error);
      return { success: false, error: error.message };
    }
  }
};