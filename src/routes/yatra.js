/**
 * Yatra Routes
 * API endpoints for managing yatras (pilgrimage events)
 */

const express = require('express');
const router = express.Router();
const { getYatraController, createYatraController, deleteYatraController, getActiveYatrasController, getYatraByIdController } = require('../controllers/yatraController');
const { authenticateAdmin, requireRole } = require('../middleware/auth');

/**
 * @swagger
 * /api/yatra/get-all-yatras:
 *   get:
 *     summary: Get all yatras
 *     tags: [Yatra]
 *     description: Retrieve a list of all yatras (pilgrimage events)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of yatras retrieved successfully
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
 *                   example: Yatras fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/get-all-yatras', authenticateAdmin, requireRole(['super_admin', 'admin']), getYatraController);

/**
 * @swagger
 * /api/yatra/create-yatra:
 *   post:
 *     summary: Create a new yatra
 *     tags: [Yatra]
 *     description: Create a new yatra (pilgrimage event) with details
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - start_date
 *               - end_date
 *             properties:
 *               name:
 *                 type: string
 *                 example: 'Shri Shirdi Yatra 2025'
 *               banner_image:
 *                 type: string
 *                 format: uri
 *                 example: 'https://example.com/banner.jpg'
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: '2025-11-01'
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: '2025-11-10'
 *               registration_start_date:
 *                 type: string
 *                 format: date
 *                 example: '2025-10-01'
 *               registration_end_date:
 *                 type: string
 *                 format: date
 *                 example: '2025-10-25'
 *     responses:
 *       200:
 *         description: Yatra created successfully
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
 *                   example: Yatra created successfully
 *                 data:
 *                   type: object
 */
router.post('/create-yatra', authenticateAdmin, requireRole(['super_admin', 'admin']), createYatraController);

// delete yatra
router.delete('/delete-yatra/:id', authenticateAdmin, requireRole(['super_admin', 'admin']), deleteYatraController);

// active yatras public API
router.get('/active-yatras', getActiveYatrasController);

router.get('/get-yatra/:id', getYatraByIdController);
module.exports = router;