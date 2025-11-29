export const mapOrderStatus = (fulfillmentStatus: string): string => {
  const statusMap: Record<string, string> = {
    'pending': 'pending',
    'approved': 'accepted',
    'ready': 'ready',
    'dispatched': 'dispatched',
    'completed': 'completed',
    'cancelled': 'cancelled'
  };
  return statusMap[fulfillmentStatus.toLowerCase()] || fulfillmentStatus;
};

export const reverseMapOrderStatus = (status: string): string => {
  const reverseMap: Record<string, string> = {
    'pending': 'pending',
    'accepted': 'approved',
    'ready': 'ready',
    'dispatched': 'dispatched',
    'completed': 'completed',
    'cancelled': 'cancelled'
  };
  return reverseMap[status.toLowerCase()] || status;
};

export const parseJsonField = (field: any): any => {
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch {
      return field;
    }
  }
  return field;
};
