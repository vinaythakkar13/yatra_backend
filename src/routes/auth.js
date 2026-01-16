/**
 * Authentication Routes
 * API endpoints for admin authentication
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const {
  createSuperAdmin,
  login,
  logout,
  getCurrentAdmin,
  listAdmins
} = require('../controllers/authController');

/**
 * @swagger
 * /api/auth/create-super-admin:
 *   post:
 *     summary: Create a super admin account
 *     tags: [Authentication]
 *     description: Create a new super admin user. Only existing super admins can create new ones. For initial setup, use this endpoint without authentication if no super admin exists.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Admin email address (must be unique)
 *                 example: superadmin@yatra.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Strong password (min 8 characters, must contain uppercase, lowercase, number, and special character)
 *                 example: SuperAdmin@123
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 255
 *                 description: Full name of the admin
 *                 example: John Doe
 *               contact_number:
 *                 type: string
 *                 description: Contact number (optional, 10-15 digits)
 *                 example: "+919876543210"
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of permission strings (optional, super_admin gets all by default)
 *                 example: ["manage_users", "manage_hotels", "manage_rooms", "view_reports"]
 *     responses:
 *       201:
 *         description: Super admin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Super admin created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *                       example: super_admin
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Only super admins can create other super admins
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/create-super-admin', [
  // Validation middleware
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters')
    .matches(/^[a-zA-Z\s.'-]+$/)
    .withMessage('Name can only contain letters, spaces, dots, hyphens, and apostrophes'),
  body('contact_number')
    .optional()
    .matches(/^\+?[0-9]{10,15}$/)
    .withMessage('Contact number must be 10-15 digits'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array')
], createSuperAdmin);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Admin login
 *     tags: [Authentication]
 *     description: Authenticate admin user and get JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@yatra.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Admin@123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     admin:
 *                       $ref: '#/components/schemas/AdminUser'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Admin logout
 *     tags: [Authentication]
 *     description: Logout admin user and invalidate session
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current admin user
 *     tags: [Authentication]
 *     description: Get currently authenticated admin user details
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/AdminUser'
 *       401:
 *         description: Unauthorized
 */
router.get('/me', getCurrentAdmin);

/**
 * @swagger
 * /api/auth/admins:
 *   get:
 *     summary: List admin users
 *     tags: [Authentication]
 *     description: Returns a sanitized list of administrator accounts.
 *     responses:
 *       200:
 *         description: Admin list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AdminUser'
 *       500:
 *         description: Server error
 */
router.get('/admins', listAdmins);

module.exports = router;

