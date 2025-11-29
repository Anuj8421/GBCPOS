import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { jwtConfig } from '../config/jwt';
import { Restaurant } from '../types';

export class AuthService {
  async login(username: string, password: string): Promise<{ token: string; user: any } | null> {
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

      const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

      if (passwordHash !== restaurant.password_hash) {
        return null;
      }

      const token = jwt.sign(
        { restaurant_id: restaurant.id },
        jwtConfig.secret
      );

      return {
        token,
        user: {
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
