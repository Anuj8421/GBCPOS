// Audio notification for new orders
let notificationSound = null;

// Initialize notification sound
export const initNotificationSound = () => {
  if (!notificationSound) {
    // Create a simple beep sound using Web Audio API
    notificationSound = new Audio();
    // Using a data URL for a simple notification beep
    notificationSound.src = 'data:audio/wav;base64,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';
  }
  return notificationSound;
};

// Play notification sound
export const playNewOrderSound = () => {
  try {
    const sound = initNotificationSound();
    sound.play().catch(err => {
      console.log('Could not play notification sound:', err);
    });
  } catch (error) {
    console.error('Error playing notification:', error);
  }
};

// Browser notification
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

// Show browser notification
export const showBrowserNotification = (title, options) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/gbc-logo.png',
      badge: '/gbc-logo.png',
      ...options
    });
    
    // Auto close after 5 seconds
    setTimeout(() => notification.close(), 5000);
    
    return notification;
  }
};

// Show new order notification with sound
export const notifyNewOrder = (orderNumber, customerName, amount) => {
  // Play sound
  playNewOrderSound();
  
  // Show browser notification
  showBrowserNotification('New Order Received!', {
    body: `Order ${orderNumber} from ${customerName}\nAmount: £${amount.toFixed(2)}`,
    tag: `order-${orderNumber}`,
    requireInteraction: true
  });
};
