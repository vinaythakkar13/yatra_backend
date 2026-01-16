import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authenticateAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;


/**
 * JWT Authentication Middleware
 * Verifies JWT tokens for protected routes with enhanced security
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required',
      code: 'MISSING_TOKEN'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    console.log("Token verification result:", err, user);
    if (err) {
      let message = 'Invalid or expired token';
      let code = 'INVALID_TOKEN';
      
      if (err.name === 'TokenExpiredError') {
        message = 'Token has expired. Please login again.';
        code = 'TOKEN_EXPIRED';
      } else if (err.name === 'JsonWebTokenError') {
        message = 'Invalid token format';
        code = 'INVALID_TOKEN_FORMAT';
      }
      
      return res.status(403).json({ 
        success: false, 
        message,
        code,
        expiredAt: err.expiredAt || null
      });
    }
    
    // Add user info to request object
    req.user = user;
    next();
  });
};

export const requireAdmin = (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
  
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }
  
    next();
  };

