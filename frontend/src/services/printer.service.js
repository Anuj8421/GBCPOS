// iMin Printer Service for Swift 2 Pro
// This service will interface with iMin's printer SDK

export const printerService = {
  // Check if printer is available
  isPrinterAvailable: () => {
    // Check if running on iMin device with printer SDK
    return typeof window.IminPrinter !== 'undefined';
  },

  // Initialize printer
  initPrinter: async () => {
    try {
      if (window.IminPrinter) {
        await window.IminPrinter.init();
        return { success: true };
      }
      return { success: false, error: 'Printer not available' };
    } catch (error) {
      console.error('Printer initialization failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Print kitchen receipt
  printKitchenReceipt: async (order) => {
    try {
      if (!window.IminPrinter) {
        console.log('Mock: Printing kitchen receipt for order', order.id);
        return { success: true, mock: true };
      }

      // Print header
      await window.IminPrinter.setAlignment(1); // Center
      await window.IminPrinter.setTextSize(32);
      await window.IminPrinter.printText('KITCHEN ORDER\n\n');
      
      // Print order details
      await window.IminPrinter.setAlignment(0); // Left
      await window.IminPrinter.setTextSize(24);
      await window.IminPrinter.printText(`Order #${order.id}\n`);
      await window.IminPrinter.printText(`Time: ${new Date(order.createdAt).toLocaleTimeString()}\n`);
      await window.IminPrinter.printText('------------------------\n');
      
      // Print items
      for (const item of order.items) {
        await window.IminPrinter.printText(`${item.quantity}x ${item.name}\n`);
        if (item.modifiers && item.modifiers.length > 0) {
          await window.IminPrinter.printText(`  Mods: ${item.modifiers.join(', ')}\n`);
        }
        if (item.notes) {
          await window.IminPrinter.printText(`  Notes: ${item.notes}\n`);
        }
      }
      
      await window.IminPrinter.printText('\n\n\n');
      await window.IminPrinter.feedPaper(3);
      
      return { success: true };
    } catch (error) {
      console.error('Kitchen receipt print failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Print delivery bag sticker
  printDeliverySticker: async (order) => {
    try {
      if (!window.IminPrinter) {
        console.log('Mock: Printing delivery sticker for order', order.id);
        return { success: true, mock: true };
      }

      await window.IminPrinter.setAlignment(1); // Center
      await window.IminPrinter.setTextSize(28);
      await window.IminPrinter.printText('DELIVERY ORDER\n\n');
      
      await window.IminPrinter.setAlignment(0); // Left
      await window.IminPrinter.printText(`Order #${order.id}\n`);
      await window.IminPrinter.printText(`Customer: ${order.customerName}\n`);
      await window.IminPrinter.printText(`Phone: ${order.customerPhone}\n`);
      await window.IminPrinter.printText(`\nAddress:\n${order.deliveryAddress}\n`);
      await window.IminPrinter.printText('\n------------------------\n');
      await window.IminPrinter.printText(`Items: ${order.items.length}\n`);
      await window.IminPrinter.printText(`Total: $${order.total.toFixed(2)}\n`);
      
      await window.IminPrinter.printText('\n\n\n');
      await window.IminPrinter.feedPaper(3);
      
      return { success: true };
    } catch (error) {
      console.error('Delivery sticker print failed:', error);
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