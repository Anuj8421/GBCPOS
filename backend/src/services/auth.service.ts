import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { jwtConfig } from '../config/jwt';
import { Restaurant } from '../types';

export class AuthService {
  async login(username: string, password: string): Promise<{ token: string; restaurant: any } | null> {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM restaurants WHERE username = ?',
        [username]
      );

      const restaurants = rows as Restaurant[];

      if (restaurants.length === 0) {
        return null;
      }

      const restaurant = restaurants[0];

      if (restaurant.status !== 'approved' || !restaurant.is_active) {
        throw new Error('Restaurant account is not active or approved');
      }

      const isValidPassword = await bcrypt.compare(password, restaurant.password_hash);

      if (!isValidPassword) {
        return null;
      }

      const token = jwt.sign(
        { restaurant_id: restaurant.id },
        jwtConfig.secret as string,
        { expiresIn: jwtConfig.expiresIn as string }
      );

      return {
        token,
        restaurant: {
          id: restaurant.id,
          username: restaurant.username,
          email: restaurant.email,
          status: restaurant.status
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
}
