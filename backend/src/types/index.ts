export interface Restaurant {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  status: 'approved' | 'pending';
  is_active: boolean;
  created_at?: Date;
}

export interface Order {
  order_id: number;
  restaurant_id: number;
  order_number: string;
  fulfillment_status: string;
  customer: any;
  total_amount: number;
  created_at: Date;
  approved_at?: Date;
  ready_at?: Date;
  dispatched_at?: Date;
  completed_at?: Date;
  cancelled_at?: Date;
  cancelled_by?: string;
  cancellation_reason?: string;
  notes?: string;
  items: any;
  prep_time_minutes?: number;
}

export interface Dish {
  dish_id: number;
  restaurant_id: number;
  name: string;
  price: number;
  description?: string;
  image_path?: string;
  is_available: boolean;
  category?: string;
  created_at?: Date;
}

export interface DashboardStats {
  totalOrders: number;
  revenue: number;
  activeOrders: number;
  completedOrders: number;
  avgPrepTime: number;
  avgRating: number;
}

export interface AuthRequest extends Request {
  restaurant?: Restaurant;
}
