import { format, formatDistance, formatRelative } from 'date-fns';

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Format date
export const formatDate = (date, formatStr = 'PP') => {
  return format(new Date(date), formatStr);
};

// Format time
export const formatTime = (date) => {
  return format(new Date(date), 'p');
};

// Format date time
export const formatDateTime = (date) => {
  return format(new Date(date), 'PPp');
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
};

// Format phone number
export const formatPhoneNumber = (phone) => {
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return phone;
};

// Calculate prep time display
export const formatPrepTime = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// Get order time status (e.g., "On time", "Delayed")
export const getOrderTimeStatus = (order) => {
  if (!order.acceptedAt || !order.prepTime) return null;
  
  const acceptedTime = new Date(order.acceptedAt).getTime();
  const expectedReadyTime = acceptedTime + (order.prepTime * 60 * 1000);
  const currentTime = Date.now();
  
  if (order.status === 'ready' || order.status === 'delivered') {
    const readyTime = new Date(order.readyAt).getTime();
    if (readyTime <= expectedReadyTime) {
      return { status: 'on-time', label: 'On Time', color: 'text-green-600' };
    } else {
      return { status: 'delayed', label: 'Delayed', color: 'text-red-600' };
    }
  }
  
  if (currentTime > expectedReadyTime) {
    return { status: 'overdue', label: 'Overdue', color: 'text-red-600' };
  }
  
  return { status: 'in-progress', label: 'In Progress', color: 'text-blue-600' };
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Generate order number
export const generateOrderNumber = () => {
  return `ORD${Date.now().toString().slice(-8)}`;
};

// Calculate order total
export const calculateOrderTotal = (items, tax = 0, deliveryFee = 0) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + tax + deliveryFee;
  return { subtotal, tax, deliveryFee, total };
};

// Validate email
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate phone
export const isValidPhone = (phone) => {
  const cleaned = ('' + phone).replace(/\D/g, '');
  return cleaned.length === 10;
};

// Download file
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};