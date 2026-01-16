/**
 * Authentication Middleware
 * Verifies JWT tokens and checks user permissions
 */

const jwt = require('jsonwebtoken');
const { AdminUser, AdminSession } = require('../models');
const { hashToken } = require('../utils/jwtHelper');
const { unauthorizedResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Middleware to verify JWT token and authenticate admin user
 * Attaches authenticated admin to req.admin
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    console.log('authHeader', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorizedResponse(res, 'No token provided');
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return unauthorizedResponse(res, 'Token has expired');
      }
      return unauthorizedResponse(res, 'Invalid token');
    }

    // Check if session exists and is active
    const tokenHash = hashToken(token);
    const session = await AdminSession.findOne({
      where: { 
        token_hash: tokenHash,
        is_active: true
      }
    });

    if (!session) {
      return unauthorizedResponse(res, 'Session not found or expired');
    }

    // Check if session has expired
    if (new Date() > new Date(session.expires_at)) {
      await session.update({ is_active: false });
      return unauthorizedResponse(res, 'Session has expired');
    }

    // Find admin user
    const admin = await AdminUser.findByPk(decoded.id);

    if (!admin) {
      return unauthorizedResponse(res, 'Admin user not found');
    }

    // Check if admin is active
    if (!admin.is_active) {
      return unauthorizedResponse(res, 'Admin account is deactivated');
    }

    // Check if account is locked
    if (admin.isLocked()) {
      return unauthorizedResponse(res, 'Account is locked');
    }

    // Update last activity
    await session.update({ last_activity: new Date() });

    // Attach admin to request object
    req.admin = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      permissions: admin.permissions
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return errorResponse(res, 'Authentication failed', 500);
  }
};

/**
 * Middleware to check if admin has required role
 * @param {Array} allowedRoles - Array of allowed roles (e.g., ['super_admin', 'admin'])
 */
const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.admin) {
      return unauthorizedResponse(res, 'Authentication required');
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return unauthorizedResponse(res, 'Insufficient permissions');
    }

    next();
  };
};

/**
 * Middleware to check if admin has specific permission
 * @param {String} permission - Required permission string
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return unauthorizedResponse(res, 'Authentication required');
    }

    // Super admin has all permissions
    if (req.admin.role === 'super_admin') {
      return next();
    }

    // Check if admin has the required permission
    if (!req.admin.permissions || !req.admin.permissions.includes(permission)) {
      return unauthorizedResponse(res, 'Insufficient permissions');
    }

    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for endpoints that work differently for authenticated users
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const admin = await AdminUser.findByPk(decoded.id);
    if (admin && admin.is_active) {
      req.admin = {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions
      };
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticateAdmin,
  requireRole,
  requirePermission,
  optionalAuth
};

