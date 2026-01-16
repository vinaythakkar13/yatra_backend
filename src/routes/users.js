/**
 * User/Pilgrim Routes
 * API endpoints for pilgrim registration and management
 */

const express = require('express');
const router = express.Router();

const {
  loginWithPnr,
  listUsers,
  getUserByPnr,
  registerUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: User login with PNR only
 *     tags: [Users]
 *     description: Login for pilgrims using only PNR number. Returns complete registration details including passenger information, ticket images, and hotel assignment details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pnr
 *             properties:
 *               pnr:
 *                 type: string
 *                 example: PNR1234567
 *                 description: Passenger Name Record number
 *     responses:
 *       200:
 *         description: Login successful - Complete registration details with hotel assignment
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
 *                     pnr:
 *                       type: string
 *                       example: PNR1234567
 *                     number_of_passengers:
 *                       type: integer
 *                       example: 2
 *                       description: Total number of passengers registered under this PNR
 *                     registration_status:
 *                       type: string
 *                       enum: [pending, confirmed, checked_in, cancelled]
 *                       example: confirmed
 *                     passenger_details:
 *                       type: array
 *                       description: Array of passenger details. Primary passenger has full info, additional passengers show as placeholders.
 *                       items:
 *                         type: object
 *                         properties:
 *                           passenger_number:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: John Doe
 *                           contact_number:
 *                             type: string
 *                             example: "+919876543210"
 *                           email:
 *                             type: string
 *                             example: john@example.com
 *                           gender:
 *                             type: string
 *                             example: male
 *                           age:
 *                             type: integer
 *                             example: 35
 *                           is_primary:
 *                             type: boolean
 *                             example: true
 *                           note:
 *                             type: string
 *                             example: Individual details to be added by admin
 *                     boarding_details:
 *                       type: object
 *                       properties:
 *                         state:
 *                           type: string
 *                           example: Maharashtra
 *                         city:
 *                           type: string
 *                           example: Mumbai
 *                         boarding_point:
 *                           type: string
 *                           example: Dadar Station
 *                     travel_dates:
 *                       type: object
 *                       properties:
 *                         arrival_date:
 *                           type: string
 *                           format: date
 *                           example: "2025-11-01"
 *                         return_date:
 *                           type: string
 *                           format: date
 *                           example: "2025-11-10"
 *                     ticket_images:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["https://example.com/ticket1.jpg", "https://example.com/ticket2.jpg"]
 *                       description: URLs of uploaded ticket/PNR images
 *                     hotel_assignment:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: assigned
 *                           description: Assignment status (assigned/not_assigned)
 *                         hotel_name:
 *                           type: string
 *                           example: Yatra Niwas
 *                         hotel_address:
 *                           type: string
 *                           example: Main Street, Pilgrimage City, State - 123456
 *                         hotel_map_link:
 *                           type: string
 *                           example: https://maps.google.com/?q=yatra+niwas
 *                         room_number:
 *                           type: string
 *                           example: "101"
 *                         floor:
 *                           type: string
 *                           example: "1"
 *                         room_id:
 *                           type: string
 *                           format: uuid
 *                         hotel_id:
 *                           type: string
 *                           format: uuid
 *       404:
 *         description: PNR not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', loginWithPnr);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     description: Retrieve a paginated list of all registered pilgrims
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: registration_status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, checked_in, cancelled]
 *         description: Filter by registration status
 *       - in: query
 *         name: is_room_assigned
 *         schema:
 *           type: boolean
 *         description: Filter by room assignment status
 *       - in: query
 *         name: arrival_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by arrival date
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/', listUsers);

/**
 * @swagger
 * /api/users/{pnr}:
 *   get:
 *     summary: Get user by PNR
 *     tags: [Users]
 *     description: Retrieve a specific user by their PNR number
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pnr
 *         required: true
 *         schema:
 *           type: string
 *         description: Passenger Name Record number
 *         example: PNR1234567
 *     responses:
 *       200:
 *         description: User details with hotel assignment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: User not found
 */
router.get('/:pnr', getUserByPnr);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Register new pilgrim
 *     tags: [Users]
 *     description: Register a new pilgrim for the yatra
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - contact_number
 *               - gender
 *               - number_of_persons
 *               - pnr
 *               - boarding_state
 *               - boarding_city
 *               - boarding_point
 *               - arrival_date
 *               - return_date
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               contact_number:
 *                 type: string
 *                 example: "+919876543210"
 *                 pattern: '^\+?[0-9]{10,15}$'
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: male
 *               age:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 120
 *                 example: 35
 *               number_of_persons:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *               pnr:
 *                 type: string
 *                 example: PNR1234567
 *               boarding_state:
 *                 type: string
 *                 example: Maharashtra
 *               boarding_city:
 *                 type: string
 *                 example: Mumbai
 *               boarding_point:
 *                 type: string
 *                 example: Dadar Station
 *               arrival_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-11-01"
 *               return_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-11-10"
 *               ticket_images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://example.com/ticket1.jpg"]
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid input or PNR already exists
 */
router.post('/', registerUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user details
 *     tags: [Users]
 *     description: Update user/pilgrim information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               registration_status:
 *                 type: string
 *                 enum: [pending, confirmed, checked_in, cancelled]
 *               ticket_images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.put('/:id', updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     description: Delete a user registration
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete('/:id', deleteUser);

module.exports = router;

