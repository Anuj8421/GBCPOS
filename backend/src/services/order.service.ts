import pool from '../config/database';
import { Order } from '../types';
import { mapOrderStatus, reverseMapOrderStatus, parseJsonField } from '../utils/helpers';

export class OrderService {
  async getOrders(restaurantId: number, status?: string): Promise<any[]> {
    try {
      let query = `
        SELECT 
          order_id, order_number, fulfillment_status, customer, 
          total_amount, created_at, approved_at, ready_at, 
          dispatched_at, completed_at, cancelled_at, cancelled_by,
          cancellation_reason, notes, items, prep_time_minutes
        FROM order_management 
        WHERE restaurant_id = ?
      `;
      const params: any[] = [restaurantId];

      if (status && status !== 'all') {
        const dbStatus = reverseMapOrderStatus(status);
        query += ' AND fulfillment_status = ?';
        params.push(dbStatus);
      }

      query += ' ORDER BY created_at DESC';

      const [rows] = await pool.execute(query, params);
      const orders = rows as Order[];

      return orders.map(order => ({
        orderNumber: order.order_number,
        status: mapOrderStatus(order.fulfillment_status),
        customer: parseJsonField(order.customer),
        totalAmount: order.total_amount,
        createdAt: order.created_at,
        approvedAt: order.approved_at,
        readyAt: order.ready_at,
        dispatchedAt: order.dispatched_at,
        completedAt: order.completed_at,
        cancelledAt: order.cancelled_at,
        cancelledBy: order.cancelled_by,
        cancellationReason: order.cancellation_reason,
        notes: order.notes,
        items: parseJsonField(order.items),
        prepTimeMinutes: order.prep_time_minutes
      }));
    } catch (error) {
      console.error('Get orders error:', error);
      throw error;
    }
  }

  async getOrderDetail(restaurantId: number, orderNumber: string): Promise<any | null> {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          order_id, order_number, fulfillment_status, customer, 
          total_amount, created_at, approved_at, ready_at,
          dispatched_at, completed_at, cancelled_at, cancelled_by,
          cancellation_reason, notes, items, prep_time_minutes
        FROM order_management 
        WHERE restaurant_id = ? AND order_number = ?`,
        [restaurantId, orderNumber]
      );

      const orders = rows as Order[];

      if (orders.length === 0) {
        return null;
      }

      const order = orders[0];

      return {
        orderNumber: order.order_number,
        status: mapOrderStatus(order.fulfillment_status),
        customer: parseJsonField(order.customer),
        totalAmount: order.total_amount,
        createdAt: order.created_at,
        approvedAt: order.approved_at,
        readyAt: order.ready_at,
        dispatchedAt: order.dispatched_at,
        completedAt: order.completed_at,
        cancelledAt: order.cancelled_at,
        cancelledBy: order.cancelled_by,
        cancellationReason: order.cancellation_reason,
        notes: order.notes,
        items: parseJsonField(order.items),
        prepTimeMinutes: order.prep_time_minutes
      };
    } catch (error) {
      console.error('Get order detail error:', error);
      throw error;
    }
  }

  async updateOrderStatus(
    restaurantId: number,
    orderNumber: string,
    status: string,
    cancellationReason?: string,
    prepTimeMinutes?: number
  ): Promise<any> {
    try {
      const dbStatus = reverseMapOrderStatus(status);
      const updates: string[] = ['fulfillment_status = ?'];
      const params: any[] = [dbStatus];

      if (status === 'accepted') {
        updates.push('approved_at = NOW()');
        if (prepTimeMinutes !== undefined) {
          updates.push('prep_time_minutes = ?');
          params.push(prepTimeMinutes);
        }
      } else if (status === 'ready') {
        updates.push('ready_at = NOW()');
      } else if (status === 'dispatched') {
        updates.push('dispatched_at = NOW()');
      } else if (status === 'completed') {
        updates.push('completed_at = NOW()');
      } else if (status === 'cancelled') {
        updates.push('cancelled_at = NOW()', 'cancelled_by = ?');
        params.push('restaurant');
        if (cancellationReason) {
          updates.push('cancellation_reason = ?');
          params.push(cancellationReason);
        }
      }

      params.push(restaurantId, orderNumber);

      const query = `
        UPDATE order_management 
        SET ${updates.join(', ')}
        WHERE restaurant_id = ? AND order_number = ?
      `;

      await pool.execute(query, params);

      return await this.getOrderDetail(restaurantId, orderNumber);
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  }

  async updatePrepTime(restaurantId: number, orderNumber: string, prepTimeMinutes: number): Promise<any> {
    try {
      await pool.execute(
        'UPDATE order_management SET prep_time_minutes = ? WHERE restaurant_id = ? AND order_number = ?',
        [prepTimeMinutes, restaurantId, orderNumber]
      );

      return await this.getOrderDetail(restaurantId, orderNumber);
    } catch (error) {
      console.error('Update prep time error:', error);
      throw error;
    }
  }
}
