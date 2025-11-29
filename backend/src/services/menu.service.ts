import pool from '../config/database';
import { Dish } from '../types';

export class MenuService {
  async getMenuItems(restaurantId: number): Promise<any[]> {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          dish_id, name, price, description, image_path, 
          is_available, category, created_at
        FROM dishes 
        WHERE restaurant_id = ?
        ORDER BY category, name`,
        [restaurantId]
      );

      const dishes = rows as Dish[];

      return dishes.map(dish => ({
        id: dish.dish_id,
        name: dish.name,
        price: dish.price,
        description: dish.description,
        imagePath: dish.image_path,
        isAvailable: dish.is_available,
        category: dish.category,
        createdAt: dish.created_at
      }));
    } catch (error) {
      console.error('Get menu items error:', error);
      throw error;
    }
  }

  async updateMenuItem(
    restaurantId: number,
    dishId: number,
    updates: Partial<Dish>
  ): Promise<any> {
    try {
      const allowedFields = ['name', 'price', 'description', 'image_path', 'is_available', 'category'];
      const updateFields: string[] = [];
      const params: any[] = [];

      Object.entries(updates).forEach(([key, value]) => {
        const dbKey = key === 'imagePath' ? 'image_path' : 
                      key === 'isAvailable' ? 'is_available' : key;
        if (allowedFields.includes(dbKey)) {
          updateFields.push(`${dbKey} = ?`);
          params.push(value);
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
        'SELECT * FROM dishes WHERE restaurant_id = ? AND dish_id = ?',
        [restaurantId, dishId]
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
