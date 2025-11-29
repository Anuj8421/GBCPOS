import pool from '../config/database';
import { Dish } from '../types';

export class MenuService {
  async getMenuItems(restaurantId: number): Promise<any[]> {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          dish_id, name, selling_price, description, primary_image, 
          availability_status, menu_section, is_active, created_at, food_type
        FROM dishes 
        WHERE restaurant_id = ? AND is_deleted = 0
        ORDER BY menu_section, name`,
        [restaurantId]
      );

      const dishes = rows as any[];

      return dishes.map(dish => ({
        id: dish.dish_id,
        name: dish.name,
        price: parseFloat(dish.selling_price) || 0,
        description: dish.description,
        imagePath: dish.primary_image,
        isAvailable: dish.availability_status === 'available' && dish.is_active === 1,
        category: dish.menu_section,
        createdAt: dish.created_at,
        foodType: dish.food_type
      }));
    } catch (error) {
      console.error('Get menu items error:', error);
      throw error;
    }
  }

  async updateMenuItem(
    restaurantId: number,
    dishId: number,
    updates: any
  ): Promise<any> {
    try {
      const fieldMapping: Record<string, string> = {
        'name': 'name',
        'price': 'selling_price',
        'description': 'description',
        'imagePath': 'primary_image',
        'isAvailable': 'availability_status',
        'category': 'menu_section'
      };

      const updateFields: string[] = [];
      const params: any[] = [];

      Object.entries(updates).forEach(([key, value]) => {
        const dbKey = fieldMapping[key];
        if (dbKey) {
          if (key === 'isAvailable') {
            updateFields.push(`${dbKey} = ?`);
            params.push(value ? 'available' : 'unavailable');
          } else {
            updateFields.push(`${dbKey} = ?`);
            params.push(value);
          }
        }
      });

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      params.push(restaurantId, dishId);

      const query = `
        UPDATE dishes 
        SET ${updateFields.join(', ')}
        WHERE restaurant_id = ? AND dish_id = ?
      `;

      await pool.execute(query, params);

      const [rows] = await pool.execute(
        'SELECT dish_id, name, selling_price, description, primary_image, availability_status, menu_section FROM dishes WHERE restaurant_id = ? AND dish_id = ?',
        [restaurantId, dishId]
      );

      const dishes = rows as any[];
      const dish = dishes[0];

      return {
        id: dish.dish_id,
        name: dish.name,
        price: parseFloat(dish.selling_price) || 0,
        description: dish.description,
        imagePath: dish.primary_image,
        isAvailable: dish.availability_status === 'available',
        category: dish.menu_section
      };
    } catch (error) {
      console.error('Update menu item error:', error);
      throw error;
    }
  }

  async addMenuItem(restaurantId: number, item: Partial<Dish>): Promise<any> {
    try {
      const [result] = await pool.execute(
        `INSERT INTO dishes 
        (restaurant_id, name, price, description, image_path, is_available, category)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          restaurantId,
          item.name,
          item.price,
          item.description || null,
          item.image_path || null,
          false,
          item.category || null
        ]
      );

      const insertResult = result as any;
      const dishId = insertResult.insertId;

      const [rows] = await pool.execute(
        'SELECT * FROM dishes WHERE dish_id = ?',
        [dishId]
      );

      const dishes = rows as Dish[];
      const dish = dishes[0];

      return {
        id: dish.dish_id,
        name: dish.name,
        price: dish.price,
        description: dish.description,
        imagePath: dish.image_path,
        isAvailable: dish.is_available,
        category: dish.category
      };
    } catch (error) {
      console.error('Add menu item error:', error);
      throw error;
    }
  }
}
