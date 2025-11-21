import logging
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from db_mysql import get_mysql_connection

logger = logging.getLogger(__name__)

def get_orders(restaurant_id: int, status: Optional[str] = None, limit: int = 100) -> List[Dict]:
    """
    Fetch orders for a restaurant from MySQL order_management table
    """
    try:
        with get_mysql_connection() as conn:
            with conn.cursor() as cursor:
                query = """
                    SELECT 
                        order_id,
                        order_number,
                        customer,
                        customer_email,
                        customer_phone,
                        customer_address,
                        total_amount,
                        payment_status,
                        payment_method,
                        fulfillment_status,
                        delivery_method,
                        order_date,
                        created_at,
                        updated_at,
                        item_count,
                        product_details,
                        kitchen_notes,
                        approved_at,
                        ready_at,
                        dispatched_at,
                        cancelled_at,
                        cancel_reason,
                        delivery_date
                    FROM order_management
                    WHERE restaurant_id = %s
                """
                
                params = [restaurant_id]
                
                if status:
                    query += " AND fulfillment_status = %s"
                    params.append(status)
                
                query += " ORDER BY created_at DESC LIMIT %s"
                params.append(limit)
                
                cursor.execute(query, params)
                orders = cursor.fetchall()
                
                # Process orders
                processed_orders = []
                for order in orders:
                    processed_orders.append({
                        'id': str(order['order_id']),
                        'orderNumber': order['order_number'] or f"ORD{order['order_id']}",
                        'customer': {
                            'name': order['customer'] or 'Guest',
                            'email': order['customer_email'] or '',
                            'phone': order['customer_phone'] or '',
                            'address': order['customer_address'] or ''
                        },
                        'amount': float(order['total_amount']) if order['total_amount'] else 0,
                        'status': order['fulfillment_status'],
                        'paymentStatus': order['payment_status'],
                        'paymentMethod': order['payment_method'] or 'Unknown',
                        'deliveryMethod': order['delivery_method'] or 'delivery',
                        'itemCount': order['item_count'] or 0,
                        'items': order['product_details'] or '',
                        'notes': order['kitchen_notes'] or '',
                        'orderDate': order['order_date'].isoformat() if order['order_date'] else '',
                        'createdAt': order['created_at'].isoformat() if order['created_at'] else '',
                        'approvedAt': order['approved_at'].isoformat() if order['approved_at'] else None,
                        'readyAt': order['ready_at'].isoformat() if order['ready_at'] else None,
                        'dispatchedAt': order['dispatched_at'].isoformat() if order['dispatched_at'] else None,
                        'cancelledAt': order['cancelled_at'].isoformat() if order['cancelled_at'] else None,
                        'cancelReason': order['cancel_reason'] or '',
                        'deliveryDate': order['delivery_date'].isoformat() if order['delivery_date'] else None
                    })
                
                logger.info(f"Fetched {len(processed_orders)} orders for restaurant {restaurant_id}")
                return processed_orders
                
    except Exception as e:
        logger.error(f"Error fetching orders: {str(e)}")
        return []

def get_order_by_number(restaurant_id: int, order_number: str) -> Optional[Dict]:
    """
    Get a single order by order number
    """
    try:
        with get_mysql_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT * FROM order_management
                    WHERE restaurant_id = %s AND order_number = %s
                    LIMIT 1
                """, (restaurant_id, order_number))
                
                order = cursor.fetchone()
                if not order:
                    return None
                
                # Return full order details
                return {
                    'id': str(order['order_id']),
                    'orderNumber': order['order_number'],
                    'customer': {
                        'name': order['customer'] or 'Guest',
                        'email': order['customer_email'] or '',
                        'phone': order['customer_phone'] or '',
                        'address': order['customer_address'] or ''
                    },
                    'amount': float(order['total_amount']) if order['total_amount'] else 0,
                    'status': order['fulfillment_status'],
                    'paymentStatus': order['payment_status'],
                    'paymentMethod': order['payment_method'] or 'Unknown',
                    'deliveryMethod': order['delivery_method'] or 'delivery',
                    'itemCount': order['item_count'] or 0,
                    'items': order['product_details'] or '',
                    'notes': order['kitchen_notes'] or '',
                    'orderDate': order['order_date'].isoformat() if order['order_date'] else '',
                    'fullDetails': order
                }
                
    except Exception as e:
        logger.error(f"Error fetching order: {str(e)}")
        return None

def update_order_status(restaurant_id: int, order_number: str, new_status: str, updated_by: str = 'system') -> bool:
    """
    Update order fulfillment status
    """
    try:
        with get_mysql_connection() as conn:
            with conn.cursor() as cursor:
                # Prepare timestamp field based on status
                timestamp_field = None
                timestamp_by_field = None
                
                if new_status == 'approved':
                    timestamp_field = 'approved_at'
                    timestamp_by_field = 'approved_by'
                elif new_status == 'ready':
                    timestamp_field = 'ready_at'
                    timestamp_by_field = 'ready_by'
                elif new_status == 'dispatched':
                    timestamp_field = 'dispatched_at'
                    timestamp_by_field = 'dispatched_by'
                elif new_status == 'cancelled':
                    timestamp_field = 'cancelled_at'
                
                # Build update query
                update_parts = ['fulfillment_status = %s', 'updated_at = NOW()']
                params = [new_status]
                
                if timestamp_field:
                    update_parts.append(f'{timestamp_field} = NOW()')
                
                if timestamp_by_field:
                    update_parts.append(f'{timestamp_by_field} = %s')
                    params.append(updated_by)
                
                query = f"""
                    UPDATE order_management
                    SET {', '.join(update_parts)}
                    WHERE restaurant_id = %s AND order_number = %s
                """
                params.extend([restaurant_id, order_number])
                
                cursor.execute(query, params)
                conn.commit()
                
                logger.info(f"Updated order {order_number} to status {new_status}")
                return True
                
    except Exception as e:
        logger.error(f"Error updating order status: {str(e)}")
        return False

def get_dashboard_stats(restaurant_id: int, start_date: Optional[str] = None, end_date: Optional[str] = None) -> Dict:
    """
    Get dashboard statistics for a restaurant
    """
    try:
        with get_mysql_connection() as conn:
            with conn.cursor() as cursor:
                # Default to today if no dates provided
                if not start_date:
                    start_date = datetime.now().strftime('%Y-%m-%d 00:00:00')
                if not end_date:
                    end_date = datetime.now().strftime('%Y-%m-%d 23:59:59')
                
                # Total orders and revenue
                cursor.execute("""
                    SELECT 
                        COUNT(*) as total_orders,
                        COALESCE(SUM(CAST(total_amount AS DECIMAL(10,2))), 0) as total_revenue,
                        COUNT(CASE WHEN fulfillment_status = 'pending' THEN 1 END) as pending_orders,
                        COUNT(CASE WHEN fulfillment_status = 'approved' THEN 1 END) as approved_orders,
                        COUNT(CASE WHEN fulfillment_status = 'preparing' THEN 1 END) as preparing_orders,
                        COUNT(CASE WHEN fulfillment_status = 'ready' THEN 1 END) as ready_orders,
                        COUNT(CASE WHEN fulfillment_status = 'completed' THEN 1 END) as completed_orders,
                        COUNT(CASE WHEN fulfillment_status = 'cancelled' THEN 1 END) as cancelled_orders
                    FROM order_management
                    WHERE restaurant_id = %s
                    AND created_at BETWEEN %s AND %s
                """, (restaurant_id, start_date, end_date))
                
                stats = cursor.fetchone()
                
                return {
                    'totalOrders': stats['total_orders'] or 0,
                    'totalRevenue': float(stats['total_revenue'] or 0),
                    'pendingOrders': stats['pending_orders'] or 0,
                    'approvedOrders': stats['approved_orders'] or 0,
                    'preparingOrders': stats['preparing_orders'] or 0,
                    'readyOrders': stats['ready_orders'] or 0,
                    'completedOrders': stats['completed_orders'] or 0,
                    'cancelledOrders': stats['cancelled_orders'] or 0,
                    'period': {
                        'start': start_date,
                        'end': end_date
                    }
                }
                
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {str(e)}")
        return {
            'totalOrders': 0,
            'totalRevenue': 0,
            'pendingOrders': 0,
            'approvedOrders': 0,
            'preparingOrders': 0,
            'readyOrders': 0,
            'completedOrders': 0,
            'cancelledOrders': 0
        }

def get_top_dishes(restaurant_id: int, limit: int = 5, start_date: Optional[str] = None, end_date: Optional[str] = None) -> List[Dict]:
    """
    Get top selling dishes for a restaurant
    """
    try:
        with get_mysql_connection() as conn:
            with conn.cursor() as cursor:
                # Default to today if no dates provided
                if not start_date:
                    start_date = datetime.now().strftime('%Y-%m-%d 00:00:00')
                if not end_date:
                    end_date = datetime.now().strftime('%Y-%m-%d 23:59:59')
                
                # Parse product_details JSON to count dishes
                cursor.execute("""
                    SELECT 
                        product_details,
                        total_amount
                    FROM order_management
                    WHERE restaurant_id = %s
                    AND created_at BETWEEN %s AND %s
                    AND fulfillment_status NOT IN ('cancelled', 'refunded')
                """, (restaurant_id, start_date, end_date))
                
                orders = cursor.fetchall()
                
                # Aggregate dish data
                dish_stats = {}
                for order in orders:
                    if order['product_details']:
                        try:
                            import json
                            items = json.loads(order['product_details'])
                            for item in items:
                                dish_name = item.get('dish_name', 'Unknown')
                                dish_image = item.get('dish_image', '')
                                quantity = int(item.get('quantity', 1))
                                price = float(item.get('unit_price', 0)) * quantity
                                
                                if dish_name not in dish_stats:
                                    dish_stats[dish_name] = {
                                        'name': dish_name,
                                        'image': dish_image,
                                        'orders': 0,
                                        'revenue': 0
                                    }
                                
                                dish_stats[dish_name]['orders'] += quantity
                                dish_stats[dish_name]['revenue'] += price
                        except Exception as e:
                            logger.error(f"Error parsing product_details: {e}")
                            continue
                
                # Sort by orders and return top N
                top_dishes = sorted(dish_stats.values(), key=lambda x: x['orders'], reverse=True)[:limit]
                return top_dishes
                
    except Exception as e:
        logger.error(f"Error fetching top dishes: {str(e)}")
        return []

def get_frequent_customers(restaurant_id: int, limit: int = 5, start_date: Optional[str] = None, end_date: Optional[str] = None) -> List[Dict]:
    """
    Get most frequent customers for a restaurant
    """
    try:
        with get_mysql_connection() as conn:
            with conn.cursor() as cursor:
                # Default to last 30 days if no dates provided
                if not start_date:
                    start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d 00:00:00')
                if not end_date:
                    end_date = datetime.now().strftime('%Y-%m-%d 23:59:59')
                
                cursor.execute("""
                    SELECT 
                        customer,
                        customer_email,
                        customer_phone,
                        COUNT(*) as orders,
                        COALESCE(SUM(CAST(total_amount AS DECIMAL(10,2))), 0) as total_spent
                    FROM order_management
                    WHERE restaurant_id = %s
                    AND created_at BETWEEN %s AND %s
                    AND fulfillment_status NOT IN ('cancelled', 'refunded')
                    AND customer IS NOT NULL
                    AND customer != ''
                    GROUP BY customer, customer_email, customer_phone
                    ORDER BY orders DESC, total_spent DESC
                    LIMIT %s
                """, (restaurant_id, start_date, end_date, limit))
                
                customers = cursor.fetchall()
                
                return [
                    {
                        'name': c['customer'],
                        'email': c['customer_email'] or '',
                        'phone': c['customer_phone'] or '',
                        'orders': c['orders'],
                        'totalSpent': float(c['total_spent'])
                    }
                    for c in customers
                ]
                
    except Exception as e:
        logger.error(f"Error fetching frequent customers: {str(e)}")
        return []

