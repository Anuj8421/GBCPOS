/**
 * iMin Printer Service for React
 * 
 * Complete integration with iMin Swift 2 Pro POS Device
 * Based on iMin Printer SDK 2.0
 * 
 * Features:
 * - Auto-detection of iMin device
 * - Full printing capabilities (text, images, barcodes, QR codes)
 * - Receipt generation and printing
 * - Error handling and status monitoring
 * - Mock mode for browser testing
 */

class IminPrinterService {
  constructor() {
    this.printer = null;
    this.isInitialized = false;
    this.isConnected = false;
    this.deviceType = null; // 'imin' or 'browser'
    
    // Printer configuration
    this.config = {
      paperWidth: 80, // mm (80mm thermal paper)
      fontSize: 28,
      textAlignment: 0, // 0=left, 1=center, 2=right
      barCodeHeight: 162,
      barCodeWidth: 2,
      qrCodeSize: 8,
    };
    
    // Status codes
    this.STATUS = {
      NORMAL: 0,
      DOOR_OPEN: 3,
      PAPER_OUT: 7,
      PAPER_LOW: 8,
      NOT_CONNECTED: -1,
      OVERHEATED: 4,
    };
  }

  /**
   * Initialize the printer service
   * Detects iMin device or falls back to mock mode
   */
  async initialize() {
    try {
      // Check if running on iMin device
      if (window.IminPrinter) {
        console.log('[iMin Printer] Detected iMin device SDK');
        this.printer = window.IminPrinter;
        this.deviceType = 'imin';
        
        // Initialize the printer
        await this.initPrinter();
        this.isInitialized = true;
        this.isConnected = true;
        
        console.log('[iMin Printer] Initialized successfully');
        return { success: true, device: 'imin', message: 'iMin printer initialized' };
      } else {
        console.log('[iMin Printer] Running in browser mode (mock)');
        this.deviceType = 'browser';
        this.isInitialized = true;
        this.isConnected = false;
        
        return { success: true, device: 'browser', message: 'Running in mock mode' };
      }
    } catch (error) {
      console.error('[iMin Printer] Initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Initialize printer hardware
   */
  async initPrinter() {
    if (!this.printer) return;
    
    try {
      // Initialize printer parameters
      await this.printer.initPrinterParams();
      
      // Set default configuration
      await this.setTextSize(this.config.fontSize);
      await this.setAlignment(this.config.textAlignment);
      
      console.log('[iMin Printer] Hardware initialized');
    } catch (error) {
      console.error('[iMin Printer] Hardware init error:', error);
      throw error;
    }
  }

  /**
   * Check if printer is available
   */
  isPrinterAvailable() {
    return this.deviceType === 'imin' && this.isConnected;
  }

  /**
   * Get printer status
   */
  async getPrinterStatus() {
    if (!this.isPrinterAvailable()) {
      return { status: this.STATUS.NOT_CONNECTED, message: 'Printer not connected' };
    }

    try {
      const status = await this.printer.getPrinterStatus();
      const message = this.getStatusMessage(status);
      return { status, message, isReady: status === this.STATUS.NORMAL };
    } catch (error) {
      console.error('[iMin Printer] Status check error:', error);
      return { status: this.STATUS.NOT_CONNECTED, message: error.message, isReady: false };
    }
  }

  /**
   * Get status message from code
   */
  getStatusMessage(code) {
    switch (code) {
      case this.STATUS.NORMAL:
        return 'Printer is ready';
      case this.STATUS.DOOR_OPEN:
        return 'Printer door is open';
      case this.STATUS.PAPER_OUT:
        return 'Paper is out';
      case this.STATUS.PAPER_LOW:
        return 'Paper is running low';
      case this.STATUS.OVERHEATED:
        return 'Printer head is overheated';
      case this.STATUS.NOT_CONNECTED:
        return 'Printer not connected';
      default:
        return 'Unknown printer status';
    }
  }

  /**
   * Set text alignment
   * @param {number} alignment - 0=left, 1=center, 2=right
   */
  async setAlignment(alignment) {
    if (this.isPrinterAvailable()) {
      await this.printer.setCodeAlignment(alignment);
    }
  }

  /**
   * Set text size
   * @param {number} size - Font size (28 recommended)
   */
  async setTextSize(size) {
    if (this.isPrinterAvailable()) {
      await this.printer.setTextBitmapSize(size);
    }
  }

  /**
   * Set text style
   * @param {boolean} bold
   * @param {boolean} underline
   */
  async setTextStyle(bold = false, underline = false) {
    if (this.isPrinterAvailable()) {
      const style = bold ? 1 : 0; // 0=normal, 1=bold, 2=italic, 3=bold+italic
      await this.printer.setTextBitmapStyle(style);
      await this.printer.setTextBitmapUnderline(underline);
    }
  }

  /**
   * Print text
   * @param {string} text - Text to print
   */
  async printText(text) {
    if (!text) return { success: false, error: 'No text provided' };

    if (this.isPrinterAvailable()) {
      try {
        await this.printer.printTextBitmap(text);
        return { success: true };
      } catch (error) {
        console.error('[iMin Printer] Print text error:', error);
        return { success: false, error: error.message };
      }
    } else {
      // Mock mode - log to console
      console.log('[iMin Printer - Mock] Print text:', text);
      return { success: true, mock: true };
    }
  }

  /**
   * Print line feed
   * @param {number} lines - Number of lines to feed
   */
  async feedPaper(lines = 1) {
    if (this.isPrinterAvailable()) {
      try {
        for (let i = 0; i < lines; i++) {
          await this.printer.printAndLineFeed();
        }
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    } else {
      console.log(`[iMin Printer - Mock] Feed ${lines} line(s)`);
      return { success: true, mock: true };
    }
  }

  /**
   * Cut paper
   * @param {boolean} full - Full cut (true) or partial cut (false)
   */
  async cutPaper(full = false) {
    if (this.isPrinterAvailable()) {
      try {
        if (full) {
          await this.printer.fullCut();
        } else {
          await this.printer.partialCut();
        }
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    } else {
      console.log(`[iMin Printer - Mock] ${full ? 'Full' : 'Partial'} cut`);
      return { success: true, mock: true };
    }
  }

  /**
   * Print barcode
   * @param {string} data - Barcode data
   * @param {number} type - Barcode type (8=CODE128)
   */
  async printBarcode(data, type = 8) {
    if (this.isPrinterAvailable()) {
      try {
        await this.printer.setBarCodeWidth(this.config.barCodeWidth);
        await this.printer.setBarCodeHeight(this.config.barCodeHeight);
        await this.printer.printBarCode(data, type);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    } else {
      console.log('[iMin Printer - Mock] Print barcode:', data);
      return { success: true, mock: true };
    }
  }

  /**
   * Print QR code
   * @param {string} data - QR code data
   * @param {number} size - QR code size (1-10)
   */
  async printQRCode(data, size = 8) {
    if (this.isPrinterAvailable()) {
      try {
        await this.printer.setQrCodeSize(size);
        await this.printer.printQrCode(data);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    } else {
      console.log('[iMin Printer - Mock] Print QR code:', data);
      return { success: true, mock: true };
    }
  }

  /**
   * Print image from base64
   * @param {string} base64Image - Base64 encoded image
   */
  async printImage(base64Image) {
    if (this.isPrinterAvailable()) {
      try {
        // Convert base64 to bitmap
        const img = new Image();
        img.src = base64Image;
        
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        
        // Create canvas and get bitmap
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        // Print bitmap
        await this.printer.printBitmap(canvas);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    } else {
      console.log('[iMin Printer - Mock] Print image');
      return { success: true, mock: true };
    }
  }

  /**
   * Print receipt
   * Formats and prints a complete receipt
   */
  async printReceipt(receiptData) {
    try {
      const {
        restaurantName = 'The Curry Vault',
        restaurantAddress = '',
        orderNumber,
        orderDate,
        customerName,
        customerAddress,
        items = [],
        subtotal = 0,
        tax = 0,
        total = 0,
        notes = '',
        type = 'kitchen', // 'kitchen' or 'delivery'
      } = receiptData;

      // Start transaction (buffer mode)
      if (this.isPrinterAvailable()) {
        await this.printer.enterPrinterBuffer(false);
      }

      // Header
      await this.setAlignment(1); // Center
      await this.setTextSize(30);
      await this.setTextStyle(true); // Bold
      await this.printText('GENERAL BILIMORIA\'S\n');
      await this.printText('20 CANTEEN 23\n');
      await this.printText('ESTD LONDON UK\n\n');
      
      await this.setTextStyle(true);
      await this.printText(`${type === 'kitchen' ? 'Kitchen' : 'Delivery'} Receipt\n\n`);
      
      await this.setTextStyle(false);
      await this.setTextSize(26);
      await this.printText(`${restaurantName}\n`);
      if (restaurantAddress) {
        await this.printText(`${restaurantAddress}\n`);
      }
      await this.printText('\n');

      // Order info
      await this.setAlignment(0); // Left
      await this.printText(`Order                    ${orderNumber}\n`);
      await this.printText(`Date         ${orderDate}\n`);
      await this.printText('--------------------------------------------\n');

      // Customer info
      if (type === 'delivery') {
        await this.printText('Customer\n');
        await this.printText(`Name                    ${customerName}\n`);
        if (customerAddress) {
          await this.printText(`Address          ${customerAddress}\n`);
        }
        await this.printText('--------------------------------------------\n');
      }

      // Items
      for (const item of items) {
        const name = item.name || '';
        const quantity = item.quantity || 1;
        const price = item.price || 0;
        const itemTotal = quantity * price;
        
        await this.printText(`${name} x${quantity}           £${itemTotal.toFixed(2)}\n`);
        
        // Print modifiers if any
        if (item.modifiers && item.modifiers.length > 0) {
          for (const mod of item.modifiers) {
            await this.printText(`  ${mod}\n`);
          }
        }
      }

      await this.printText('--------------------------------------------\n');

      // Totals
      await this.printText(`Subtotal                    £${subtotal.toFixed(2)}\n`);
      await this.printText(`Tax (20%)                   £${tax.toFixed(2)}\n`);
      if (subtotal !== total) {
        const discount = subtotal - total;
        await this.printText(`Discount                  - £${discount.toFixed(2)}\n`);
      }
      await this.setTextStyle(true);
      await this.printText(`Total                       £${total.toFixed(2)}\n`);
      await this.setTextStyle(false);
      await this.printText('--------------------------------------------\n');

      // Notes
      if (notes) {
        await this.printText(`\nOrder note: ${notes}\n`);
        await this.printText('--------------------------------------------\n');
      }

      // Footer
      await this.printText('\n');
      await this.setAlignment(1); // Center
      await this.printText('Thank you for Ordering See\n');
      await this.printText('you again Online!\n\n');

      // Print QR code (optional)
      if (orderNumber) {
        await this.printQRCode(`ORDER:${orderNumber}`);
      }

      await this.feedPaper(2);
      await this.cutPaper(false);

      // Commit transaction
      if (this.isPrinterAvailable()) {
        await this.printer.commitPrinterBuffer();
      }

      return { success: true, mock: !this.isPrinterAvailable() };
    } catch (error) {
      console.error('[iMin Printer] Print receipt error:', error);
      
      // Exit transaction on error
      if (this.isPrinterAvailable()) {
        try {
          await this.printer.exitPrinterBuffer(false);
        } catch (e) {
          console.error('[iMin Printer] Error exiting buffer:', e);
        }
      }
      
      return { success: false, error: error.message };
    }
  }

  /**
   * Print test page
   */
  async printTestPage() {
    try {
      await this.setAlignment(1); // Center
      await this.setTextSize(32);
      await this.setTextStyle(true);
      await this.printText('GBC POS TEST PRINT\n\n');
      
      await this.setTextStyle(false);
      await this.setTextSize(28);
      await this.printText(`Date: ${new Date().toLocaleString()}\n\n`);
      
      await this.setAlignment(0); // Left
      await this.printText('Printer Status: OK\n');
      await this.printText('Device Type: iMin Swift 2 Pro\n');
      await this.printText('Paper Width: 80mm\n\n');
      
      await this.setAlignment(1);
      await this.printText('Test Successful!\n\n');
      
      await this.feedPaper(2);
      await this.cutPaper(false);
      
      return { success: true, mock: !this.isPrinterAvailable() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Print kitchen receipt (wrapper for printReceipt with kitchen type)
   */
  async printKitchenReceipt(order) {
    const receiptData = this.formatOrderForReceipt(order, 'kitchen');
    return await this.printReceipt(receiptData);
  }

  /**
   * Print delivery receipt (wrapper for printReceipt with delivery type)
   */
  async printDeliveryReceipt(order) {
    const receiptData = this.formatOrderForReceipt(order, 'delivery');
    return await this.printReceipt(receiptData);
  }

  /**
   * Print customer receipt
   */
  async printCustomerReceipt(order) {
    const receiptData = this.formatOrderForReceipt(order, 'customer');
    return await this.printReceipt(receiptData);
  }

  /**
   * Test print (alias for printTestPage)
   */
  async testPrint() {
    return await this.printTestPage();
  }

  /**
   * Format order data for receipt printing
   */
  formatOrderForReceipt(order, type = 'kitchen') {
    return {
      restaurantName: 'The Curry Vault',
      restaurantAddress: '',
      orderNumber: order.id || order.orderNumber,
      orderDate: order.createdAt ? new Date(order.createdAt).toLocaleString('en-GB') : new Date().toLocaleString('en-GB'),
      customerName: order.customerName || 'Guest',
      customerAddress: order.deliveryAddress || order.customerAddress || '',
      items: (order.items || []).map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        modifiers: item.modifiers || []
      })),
      subtotal: order.subtotal || order.total || 0,
      tax: order.tax || 0,
      total: order.total || 0,
      notes: order.specialInstructions || order.notes || '',
      type: type
    };
  }

  /**
   * Open cash drawer (if available)
   */
  async openCashDrawer() {
    if (this.isPrinterAvailable()) {
      try {
        await this.printer.openDrawer();
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    } else {
      console.log('[iMin Printer - Mock] Open cash drawer');
      return { success: true, mock: true };
    }
  }

  /**
   * Get printer information
   */
  async getPrinterInfo() {
    if (!this.isPrinterAvailable()) {
      return {
        model: 'Browser Mode (Mock)',
        serialNumber: 'N/A',
        firmwareVersion: 'N/A',
      };
    }

    try {
      const model = await this.printer.getPrinterModelName();
      const serialNumber = await this.printer.getPrinterSerialNumber();
      const firmwareVersion = await this.printer.getPrinterFirmwareVersion();
      
      return { model, serialNumber, firmwareVersion };
    } catch (error) {
      console.error('[iMin Printer] Get info error:', error);
      return {
        model: 'Unknown',
        serialNumber: 'Unknown',
        firmwareVersion: 'Unknown',
        error: error.message,
      };
    }
  }
}

// Create singleton instance
const iminPrinterService = new IminPrinterService();

// Auto-initialize when service is imported
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    iminPrinterService.initialize().then((result) => {
      console.log('[iMin Printer] Service ready:', result);
    });
  });
}

export default iminPrinterService;
