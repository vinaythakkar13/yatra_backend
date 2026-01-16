/**
 * Auth Controller
 * Contains handlers for administrator authentication workflows.
 */

const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { AdminUser, AdminSession } = require('../models');
const { generateToken, hashToken, getExpirationDate } = require('../utils/jwtHelper');
const { successResponse, errorResponse, unauthorizedResponse } = require('../utils/responseHelper');
const { logAudit } = require('../utils/auditLogger');
const { logRequestBody, logValidationErrors } = require('../utils/requestLogger');

/**
 * Create a new super admin user.
 * Handles both first-time bootstrap and subsequent privileged creations.
 */
const createSuperAdmin = async (req, res) => {
  try {
    logRequestBody(req, 'Create Super Admin');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logValidationErrors(errors.array());
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { email, password, name, contact_number, permissions } = req.body;

    const existingSuperAdmin = await AdminUser.findOne({
      where: { role: 'super_admin', is_active: true }
    });

    if (existingSuperAdmin) {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return unauthorizedResponse(
          res,
          'Super admin already exists. Authentication required to create additional super admins.'
        );
      }

      const token = authHeader.replace('Bearer ', '');
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      } catch (error) {
        return unauthorizedResponse(res, 'Invalid or expired token');
      }

      const requestingAdmin = await AdminUser.findByPk(decoded.id);

      if (!requestingAdmin || requestingAdmin.role !== 'super_admin' || !requestingAdmin.is_active) {
        return unauthorizedResponse(res, 'Only super admins can create other super admins');
      }

      req.admin = requestingAdmin;
    }

    const existingUser = await AdminUser.findOne({ where: { email } });
    if (existingUser) {
      return errorResponse(res, 'Email already exists', 400);
    }

    const superAdmin = await AdminUser.create({
      email,
      password_hash: password, // hashed by model hook
      name,
      contact_number: contact_number || null,
      role: 'super_admin',
      permissions: permissions || [],
      is_active: true,
      email_verified: true
    });

    if (req.admin) {
      await logAudit({
        action: 'CREATE_SUPER_ADMIN',
        entityType: 'AdminUser',
        entityId: superAdmin.id,
        performedBy: req.admin.id,
        newData: {
          email: superAdmin.email,
          name: superAdmin.name,
          role: superAdmin.role
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    }

    return successResponse(
      res,
      {
        id: superAdmin.id,
        email: superAdmin.email,
        name: superAdmin.name,
        role: superAdmin.role,
        contact_number: superAdmin.contact_number,
        permissions: superAdmin.permissions,
        is_active: superAdmin.is_active,
        email_verified: superAdmin.email_verified,
        createdAt: superAdmin.created_at,
        updatedAt: superAdmin.updated_at
      },
      'Super admin created successfully',
      201
    );
  } catch (error) {
    console.error('Create super admin error:', error);
    return errorResponse(res, 'Failed to create super admin', 500);
  }
};

/**
 * Authenticate an admin and issue a JWT token + session.
 */
const login = async (req, res) => {
  try {
    logRequestBody(req, 'Admin Login');

    const { email, password } = req.body;
    const admin = await AdminUser.findOne({ where: { email } });

    if (!admin) {
      return unauthorizedResponse(res, 'Invalid email or password');
    }

    if (admin.isLocked()) {
      return unauthorizedResponse(res, 'Account is locked. Please try again later.');
    }

    if (!admin.is_active) {
      return unauthorizedResponse(res, 'Account is deactivated');
    }

    const isPasswordValid = await admin.verifyPassword(password);

    if (!isPasswordValid) {
      await admin.update({
        failed_login_attempts: admin.failed_login_attempts + 1,
        locked_until: admin.failed_login_attempts >= 4 ? new Date(Date.now() + 30 * 60 * 1000) : null
      });

      return unauthorizedResponse(res, 'Invalid email or password');
    }

    await admin.update({
      failed_login_attempts: 0,
      locked_until: null,
      last_login: new Date()
    });

    const token = generateToken(admin);
    const tokenHash = hashToken(token);

    await AdminSession.create({
      admin_id: admin.id,
      token_hash: tokenHash,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      expires_at: getExpirationDate(7),
      device_info: req.headers['user-agent']
    });

    return successResponse(
      res,
      {
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          permissions: admin.permissions
        }
      },
      'Login successful'
    );
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Login failed', 500);
  }
};

/**
 * Terminate the admin session tied to the provided token.
 */
const logout = async (req, res) => {
  try {
    logRequestBody(req, 'Admin Logout');

    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const tokenHash = hashToken(token);
      await AdminSession.destroy({
        where: { token_hash: tokenHash }
      });
    }

    return successResponse(res, null, 'Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, 'Logout failed', 500);
  }
};

/**
 * Placeholder for authenticated profile data.
 * Replace once authentication middleware is wired.
 */
const getCurrentAdmin = async (req, res) => {
  try {
    return successResponse(res, {
      message: 'Authentication middleware needed'
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return errorResponse(res, 'Failed to get user details', 500);
  }
};

/**
 * Return a sanitized list of admin users.
 * TODO: protect with auth middleware when available.
 */
const listAdmins = async (req, res) => {
  try {
    const admins = await AdminUser.findAll({
      attributes: [
        'id',
        'name',
        'email',
        'role',
        'permissions',
        'is_active',
        'email_verified',
        'last_login',
        'created_at'
      ],
      order: [['created_at', 'DESC']]
    });

    return successResponse(res, admins, 'Admin users retrieved successfully');
  } catch (error) {
    console.error('List admins error:', error);
    return errorResponse(res, 'Failed to fetch admin users', 500);
  }
};

module.exports = {
  createSuperAdmin,
  login,
  logout,
  getCurrentAdmin,
  listAdmins
};

