import logging
from typing import List, Dict, Optional
from db_mysql import get_mysql_connection

logger = logging.getLogger(__name__)

def get_menu_items(restaurant_id: int, category: Optional[str] = None, search: Optional[str] = None) -> List[Dict]:
    """
    Fetch menu items for a restaurant from MySQL dishes table
    """
    try:
        with get_mysql_connection() as conn:
            with conn.cursor() as cursor:
                # Base query
                query = """
                    SELECT 
                        dish_id as id,
                        name,
                        slug,
                        short_description as description,
                        detailed_description,
                        primary_image as image,
                        selling_price as price,
                        cost_price,
                        discount_type,
                        discount_value,
                        food_type,
                        cuisine_type,
                        spice_level,
                        availability_status,
                        is_popular,
                        is_customizable,
                        menu_section_json,
                        tier_1 as category,
                        tier_2 as subcategory,
                        tags,
                        contains_allergens,
                        customer_rating,
                        number_of_reviews,
                        mark_as,
                        is_active
                    FROM dishes
                    WHERE restaurant_id = %s
                    AND is_deleted = 0
                """
                
                params = [restaurant_id]
                
                # Add category filter if provided
                if category:
                    query += " AND tier_1 = %s"
                    params.append(category)
                
                # Add search filter if provided
                if search:
                    query += " AND (name LIKE %s OR short_description LIKE %s OR tags LIKE %s)"
                    search_term = f"%{search}%"
                    params.extend([search_term, search_term, search_term])
                
                query += " ORDER BY sort_order ASC, created_at DESC"
                
                cursor.execute(query, params)
                dishes = cursor.fetchall()
                
                # Process dishes
                processed_dishes = []
                for dish in dishes:
                    # Calculate final price with discount
                    final_price = float(dish['price'])
                    if dish['discount_type'] and dish['discount_value']:
                        if dish['discount_type'] == 'flat':
                            final_price -= float(dish['discount_value'])
                        elif dish['discount_type'] == 'percentage':
                            final_price -= final_price * (float(dish['discount_value']) / 100)
                    
                    processed_dishes.append({
                        'id': str(dish['id']),
                        'name': dish['name'],
                        'description': dish['description'] or '',
                        'detailed_description': dish['detailed_description'] or '',
                        'image': dish['image'] or '',
                        'price': float(dish['price']),
                        'final_price': round(final_price, 2),
                        'discount_type': dish['discount_type'],
                        'discount_value': float(dish['discount_value']) if dish['discount_value'] else 0,
                        'category': dish['category'] or 'Uncategorized',
                        'subcategory': dish['subcategory'] or '',
                        'food_type': dish['food_type'] or 'veg',
                        'cuisine_type': dish['cuisine_type'] or '',
                        'spice_level': dish['spice_level'],
                        'availability_status': dish['availability_status'],
                        'available': dish['availability_status'] == 'available' and dish['is_active'] == 1,
                        'is_popular': bool(dish['is_popular']),
                        'is_customizable': bool(dish['is_customizable']),
                        'rating': float(dish['customer_rating']) if dish['customer_rating'] else 0,
                        'reviews': dish['number_of_reviews'] or 0,
                        'mark_as': dish['mark_as'] or 'none',
                        'tags': dish['tags'] or []
                    })
                
                logger.info(f"Fetched {len(processed_dishes)} menu items for restaurant {restaurant_id}")
                return processed_dishes
                
    except Exception as e:
        logger.error(f"Error fetching menu items: {str(e)}")
        return []

def get_menu_categories(restaurant_id: int) -> List[Dict]:
    """
    Get unique menu categories for a restaurant
    """
    try:
        with get_mysql_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT DISTINCT tier_1 as category, COUNT(*) as count
                    FROM dishes
                    WHERE restaurant_id = %s
                    AND is_deleted = 0
                    AND is_active = 1
                    AND tier_1 IS NOT NULL
                    AND tier_1 != ''
                    GROUP BY tier_1
                    ORDER BY tier_1
                """, (restaurant_id,))
                
                categories = cursor.fetchall()
                return [
                    {
                        'name': cat['category'],
                        'count': cat['count']
                    }
                    for cat in categories
                ]
                
    except Exception as e:
        logger.error(f"Error fetching menu categories: {str(e)}")
        return []

def update_dish_availability(dish_id: int, restaurant_id: int, available: bool) -> bool:
    """
    Update dish availability status
    """
    try:
        with get_mysql_connection() as conn:
            with conn.cursor() as cursor:
                new_status = 'available' if available else 'sold_out'
                cursor.execute("""
                    UPDATE dishes
                    SET availability_status = %s, updated_at = NOW()
                    WHERE dish_id = %s AND restaurant_id = %s
                """, (new_status, dish_id, restaurant_id))
                conn.commit()
                logger.info(f"Updated dish {dish_id} availability to {new_status}")
                return True
    except Exception as e:
        logger.error(f"Error updating dish availability: {str(e)}")
        return False

def bulk_update_availability(restaurant_id: int, dish_ids: List[int], available: bool) -> bool:
    """
    Bulk update availability for multiple dishes
    """
    try:
        with get_mysql_connection() as conn:
            with conn.cursor() as cursor:
                new_status = 'available' if available else 'sold_out'
                placeholders = ','.join(['%s'] * len(dish_ids))
                cursor.execute(f"""
                    UPDATE dishes
                    SET availability_status = %s, updated_at = NOW()
                    WHERE restaurant_id = %s
                    AND dish_id IN ({placeholders})
                """, [new_status, restaurant_id] + dish_ids)
                conn.commit()
                logger.info(f"Bulk updated {len(dish_ids)} dishes to {new_status}")
                return True
    except Exception as e:
        logger.error(f"Error bulk updating availability: {str(e)}")
        return False
