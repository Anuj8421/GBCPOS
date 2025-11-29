import pool from '../config/database';
import { DashboardStats } from '../types';
import { parseJsonField } from '../utils/helpers';

export class DashboardService {
  async getStats(restaurantId: number, startDate?: string, endDate?: string): Promise<DashboardStats> {
    try {
      let dateFilter = '';
      const params: any[] = [restaurantId];

      if (startDate && endDate) {
        dateFilter = ' AND created_at BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }

      const [statsRows] = await pool.execute(
        `SELECT 
          COUNT(*) as totalOrders,
          COALESCE(SUM(CASE WHEN fulfillment_status != 'cancelled' THEN total_amount ELSE 0 END), 0) as revenue,
          COUNT(CASE WHEN fulfillment_status IN ('approved', 'ready', 'dispatched') THEN 1 END) as activeOrders,
          COUNT(CASE WHEN fulfillment_status = 'completed' THEN 1 END) as completedOrders
        FROM order_management
        WHERE restaurant_id = ?${dateFilter}`,
        params
      );

      const stats = (statsRows as any[])[0];

      const [prepTimeRows] = await pool.execute(
        `SELECT AVG(prep_time_minutes) as avgPrepTime
        FROM order_management
        WHERE restaurant_id = ? AND prep_time_minutes IS NOT NULL AND fulfillment_status IN ('ready', 'dispatched', 'completed')${dateFilter}`,
        params
      );

      const prepTimeResult = (prepTimeRows as any[])[0];
      const avgPrepTime = prepTimeResult.avgPrepTime ? Math.round(prepTimeResult.avgPrepTime) : 0;

      return {
        totalOrders: parseInt(stats.totalOrders) || 0,
        revenue: parseFloat(stats.revenue) || 0,
        activeOrders: parseInt(stats.activeOrders) || 0,
        completedOrders: parseInt(stats.completedOrders) || 0,
        avgPrepTime,
        avgRating: 4.5
      };
    } catch (error) {
      console.error('Get stats error:', error);
      throw error;
    }
  }

  async getTopDishes(restaurantId: number): Promise<any[]> {
    try {
      const [rows] = await pool.execute(
        `SELECT items
        FROM order_management
        WHERE restaurant_id = ? 
          AND fulfillment_status IN ('approved', 'ready', 'dispatched', 'completed')
          AND DATE(created_at) = CURDATE()
        ORDER BY created_at DESC`,
        [restaurantId]
      );

      const orders = rows as any[];
      const dishCount: Record<string, { name: string; count: number; revenue: number }> = {};

      orders.forEach(order => {
        const items = parseJsonField(order.items);
        if (Array.isArray(items)) {
          items.forEach((item: any) => {
            const dishName = item.name || item.dish_name || 'Unknown';
            const quantity = item.quantity || 1;
            const price = item.price || 0;

            if (!dishCount[dishName]) {
              dishCount[dishName] = { name: dishName, count: 0, revenue: 0 };
            }
            dishCount[dishName].count += quantity;
            dishCount[dishName].revenue += price * quantity;
          });
        }
      });

      return Object.values(dishCount)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map((dish, index) => ({
          rank: index + 1,
          name: dish.name,
          orderCount: dish.count,
          revenue: dish.revenue
        }));
    } catch (error) {
      console.error('Get top dishes error:', error);
      throw error;
    }
  }

  async getFrequentCustomers(restaurantId: number): Promise<any[]> {
    try {
      const [rows] = await pool.execute(
        `SELECT customer, COUNT(*) as orderCount, SUM(total_amount) as totalSpent
        FROM order_management
        WHERE restaurant_id = ? 
          AND fulfillment_status IN ('completed')
          AND customer IS NOT NULL
        GROUP BY customer
        ORDER BY orderCount DESC
        LIMIT 5`,
        [restaurantId]
      );

      const customers = rows as any[];

      return customers.map((customer, index) => {
        const customerData = parseJsonField(customer.customer);
        return {
          rank: index + 1,
          name: customerData?.name || customerData?.customer_name || 'Unknown Customer',
          phone: customerData?.phone || customerData?.mobile_number || 'N/A',
          orderCount: parseInt(customer.orderCount) || 0,
          totalSpent: parseFloat(customer.totalSpent) || 0
        };
      });
    } catch (error) {
      console.error('Get frequent customers error:', error);
      throw error;
    }
  }
}
