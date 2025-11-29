import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import pool from '../config/database';
import { Restaurant } from '../types';

export interface AuthRequest extends Request {
  restaurant?: Restaurant;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const decoded = jwt.verify(token, jwtConfig.secret) as { restaurant_id: number };

    const [rows] = await pool.execute(
      'SELECT id, username, email, status, is_active FROM restaurants WHERE id = ?',
      [decoded.restaurant_id]
    );

    const restaurants = rows as Restaurant[];

    if (restaurants.length === 0) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    req.restaurant = restaurants[0];
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};
