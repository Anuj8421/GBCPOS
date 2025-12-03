// Receipt generation service following EXACT formats provided
import { formatCurrency } from '@/utils/helpers';

export const receiptService = {
  
  // Generate Kitchen Receipt - EXACT format from image 2
  generateKitchenReceipt: (order, restaurant) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    let receipt = `
        GENERAL
    BILIMORIA'S
   20 CANTEEN 23
    ESTD LONDON UK




Kitchen Receipt

${restaurant?.name || 'The Curry Vault'}
${restaurant?.address || 'Restaurant Address'}

Order                    ${order.orderNumber}
Date         ${dateStr}, ${timeStr}
--------------------------------------------
Customer
Name                    ${order.customerName}
Address          ${order.deliveryAddress}
--------------------------------------------
`;

    // Add items with dish notes and bundle items
    order.items?.forEach(item => {
      receipt += `${item.name} x${item.quantity}           ${formatCurrency(item.price * item.quantity)}\n`;
      
      // Add dish notes if present (Kitchen Receipt shows these)
      if (item.notes) {
        receipt += ` (note: ${item.notes})\n`;
      }
      
      // Add bundle items if present
      if (item.bundleItems && item.bundleItems.length > 0) {
        item.bundleItems.forEach(bundleItem => {
          receipt += ` + ${bundleItem.name} x${bundleItem.quantity}\n`;
        });
      }
    });

    receipt += `--------------------------------------------
Subtotal                    ${formatCurrency(order.subtotal || order.total)}
Tax (20%)                   ${formatCurrency(order.tax || 0)}
Discount                  - ${formatCurrency(order.discount || 0)}
Total                       ${formatCurrency(order.total)}
--------------------------------------------

     Thank you for Ordering See
        you again Online!`;

    // NO ORDER NOTES on kitchen receipt (as specified in image)
    return receipt;
  },

  // Generate Delivery Receipt - EXACT format from image 1  
  generateDeliveryReceipt: (order, restaurant) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    let receipt = `
        GENERAL
    BILIMORIA'S
   20 CANTEEN 23
    ESTD LONDON UK




Delivery Receipt

${restaurant?.name || 'The Curry Vault'}
${restaurant?.address || 'Restaurant Address'}

Order                    ${order.orderNumber}
Date         ${dateStr}, ${timeStr}
--------------------------------------------
Customer
Name                    ${order.customerName}
Address          ${order.deliveryAddress}
--------------------------------------------
`;

    // Add items with bundle items (NO dish notes on delivery receipt)
    order.items?.forEach(item => {
      receipt += `${item.name} x${item.quantity}           ${formatCurrency(item.price * item.quantity)}\n`;
      
      // Add bundle items if present - EXACT format as shown
      if (item.bundleItems && item.bundleItems.length > 0) {
        item.bundleItems.forEach(bundleItem => {
          receipt += ` + ${bundleItem.name} x${bundleItem.quantity}\n`;
        });
      }
    });

    receipt += `--------------------------------------------
Subtotal                    ${formatCurrency(order.subtotal || order.total)}
Tax (20%)                   ${formatCurrency(order.tax || 0)}
Discount                  - ${formatCurrency(order.discount || 0)}
Total                       ${formatCurrency(order.total)}
--------------------------------------------`;

    // ADD ORDER NOTES only on delivery receipt (as shown in image 1)
    if (order.specialInstructions || order.notes) {
      receipt += `\nOrder note: ${order.specialInstructions || order.notes}\n--------------------------------------------`;
    }

    receipt += `

     Thank you for Ordering See
        you again Online!`;

    return receipt;
  },

  // Print Kitchen Receipt
  printKitchenReceipt: async (order) => {
    try {
      // Validate order data
      if (!order) {
        throw new Error('Order data is missing');
      }
      if (!order.orderNumber) {
        throw new Error('Order number is missing');
      }
      if (!order.items || order.items.length === 0) {
        throw new Error('Order has no items');
      }
      
      // Get restaurant data (would need to be passed or fetched)
      const restaurant = {
        name: "The Curry Vault", // This should come from order data
        address: "Restaurant Address"
      };
      
      const receipt = receiptService.generateKitchenReceipt(order, restaurant);
      
      // For web testing - show in console and create download
      console.log('=== KITCHEN RECEIPT ===');
      console.log(receipt);
      console.log('======================');
      
      // Create downloadable text file for testing
      const blob = new Blob([receipt], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kitchen-receipt-${order.orderNumber.replace('#', '')}-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Kitchen receipt generated', mock: true };
    } catch (error) {
      console.error('Kitchen receipt print error:', error);
      return { success: false, error: error.message };
    }
  },

  // Print Delivery Receipt  
  printDeliveryReceipt: async (order) => {
    try {
      // Validate order data
      if (!order) {
        throw new Error('Order data is missing');
      }
      if (!order.orderNumber) {
        throw new Error('Order number is missing');
      }
      if (!order.items || order.items.length === 0) {
        throw new Error('Order has no items');
      }
      
      // Get restaurant data
      const restaurant = {
        name: "The Curry Vault", // This should come from order data
        address: "Restaurant Address"
      };
      
      const receipt = receiptService.generateDeliveryReceipt(order, restaurant);
      
      // For web testing - show in console and create download
      console.log('DELIVERY RECEIPT:\n' + receipt);
      
      // Create downloadable text file for testing
      const blob = new Blob([receipt], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `delivery-receipt-${order.orderNumber}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Delivery receipt printed' };
    } catch (error) {
      console.error('Delivery receipt print error:', error);
      return { success: false, error: error.message };
    }
  }
};