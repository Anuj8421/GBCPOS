import dotenv from 'dotenv';

dotenv.config();

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'gbc-pos-jwt-secret-key-2024',
  algorithm: 'HS256' as const,
  expiresIn: `${process.env.JWT_EXPIRATION_HOURS || 24}h`
};
