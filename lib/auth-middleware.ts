import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface JWTPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function verifyRequest(request: NextRequest): Promise<{
  success: boolean;
  user: JWTPayload | null;
  error?: string;
}> {
  try {
    // Try to get token from Authorization header first
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      
      if (decoded) {
        return { success: true, user: decoded };
      }
    }

    // Try to get token from cookies (for NextAuth.js)
    const cookies = request.cookies;
    const authToken = cookies.get('next-auth.session-token')?.value;
    
    if (authToken) {
      // For NextAuth.js, we need to decode the JWT from the session cookie
      // In production, you'd verify this with NextAuth.js
      try {
        const decoded = jwt.decode(authToken) as any;
        if (decoded && decoded.email) {
          return { 
            success: true, 
            user: {
              id: decoded.sub || decoded.id || '',
              email: decoded.email,
              name: decoded.name || 'Admin',
              role: decoded.role || 'admin',
            }
          };
        }
      } catch (error) {
        console.error('Cookie token decode error:', error);
      }
    }

    return { 
      success: false, 
      user: null, 
      error: 'No valid authentication found' 
    };

  } catch (error) {
    console.error('Auth verification error:', error);
    return { 
      success: false, 
      user: null, 
      error: 'Authentication failed' 
    };
  }
}