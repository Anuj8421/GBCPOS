// Order statuses
export const ORDER_STATUS = {
  ALL: 'all',
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  CANCELLED: 'cancelled',
  READY: 'ready',
  DELIVERED: 'delivered',
  REFUNDED: 'refunded',
  SCHEDULED: 'scheduled'
};

// Order status labels
export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.ALL]: 'All Orders',
  [ORDER_STATUS.PENDING]: 'Pending',
  [ORDER_STATUS.ACCEPTED]: 'Accepted',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
  [ORDER_STATUS.READY]: 'Ready',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.REFUNDED]: 'Refunded',
  [ORDER_STATUS.SCHEDULED]: 'Scheduled'
};

// Order status colors
export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [ORDER_STATUS.ACCEPTED]: 'bg-blue-100 text-blue-800',
  [ORDER_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
  [ORDER_STATUS.READY]: 'bg-green-100 text-green-800',
  [ORDER_STATUS.DELIVERED]: 'bg-gray-100 text-gray-800',
  [ORDER_STATUS.REFUNDED]: 'bg-purple-100 text-purple-800',
  [ORDER_STATUS.SCHEDULED]: 'bg-indigo-100 text-indigo-800'
};

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  ACCOUNTANT: 'accountant'
};

// Analytics periods
export const ANALYTICS_PERIODS = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month'
};

// Device specifications
export const DEVICE_SPECS = {
  SCREEN_WIDTH: 720,
  SCREEN_HEIGHT: 1600,
  SCREEN_SIZE: 6.5, // inches
  PRINTER_PAPER_WIDTH: 58, // mm
  PRINTER_SPEED: 100 // mm/s
};