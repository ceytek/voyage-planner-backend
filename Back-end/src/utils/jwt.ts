import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export interface JWTPayload {
  userId: string;
  email: string;
  provider: string;
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const extractTokenFromHeader = (authHeader?: string): string => {
  if (!authHeader) {
    throw new Error('No authorization header provided');
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    throw new Error('No token provided');
  }

  return token;
};
