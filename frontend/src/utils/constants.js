// Order statuses - Map to match database statuses
export const ORDER_STATUS = {
  ALL: 'all',
  PENDING: 'pending',
  ACCEPTED: 'approved', // Database uses 'approved'
  PREPARING: 'preparing',
  READY: 'ready',
  DISPATCHED: 'dispatched',
  DELIVERED: 'completed', // Database uses 'completed'
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  SCHEDULED: 'scheduled'
};

// Order status labels for display
export const ORDER_STATUS_LABELS = {
  all: 'All Orders',
  pending: 'Pending',
  approved: 'Accepted',
  preparing: 'Preparing',
  ready: 'Ready',
  dispatched: 'Dispatched',
  completed: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  scheduled: 'Scheduled'
};

// Order status colors
export const ORDER_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  preparing: 'bg-indigo-100 text-indigo-800',
  ready: 'bg-green-100 text-green-800',
  dispatched: 'bg-purple-100 text-purple-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-orange-100 text-orange-800',
  scheduled: 'bg-cyan-100 text-cyan-800'
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

// Currency configuration
export const CURRENCY_CONFIG = {
  code: 'GBP',
  symbol: '£',
  locale: 'en-GB'
};
