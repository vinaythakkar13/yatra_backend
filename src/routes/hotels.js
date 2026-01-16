/**
 * Hotel Routes
 * API endpoints for hotel management
 */

const express = require('express');
const router = express.Router();

const {
  listHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel
} = require('../controllers/hotelController');

/**
 * @swagger
 * /api/hotels:
 *   get:
 *     summary: Get all hotels
 *     tags: [Hotels]
 *     description: Retrieve a list of all hotels with pagination
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
 *         description: Number of items per page
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of hotels
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/', listHotels);

/**
 * @swagger
 * /api/hotels/{id}:
 *   get:
 *     summary: Get hotel by ID
 *     tags: [Hotels]
 *     description: Retrieve a specific hotel by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hotel ID
 *     responses:
 *       200:
 *         description: Hotel details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Hotel not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', getHotelById);

/**
 * @swagger
 * /api/hotels:
 *   post:
 *     summary: Create a new hotel
 *     tags: [Hotels]
 *     description: Create a new hotel with room configuration
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
 *               - address
 *               - total_floors
 *               - floors
 *             properties:
 *               name:
 *                 type: string
 *                 example: Grand Yatra Palace
 *               address:
 *                 type: string
 *                 example: 123 Temple Road, Holy City
 *               map_link:
 *                 type: string
 *                 example: https://maps.google.com/?q=grand+yatra+palace
 *               distanceFromBhavan:
 *                 type: string
 *                 example: "2.5 km"
 *                 description: Distance from bhavan (optional)
 *               hotelType:
 *                 type: string
 *                 example: "A"
 *                 description: Hotel type classification (optional)
 *               managerName:
 *                 type: string
 *                 example: "John Doe"
 *                 description: Hotel manager name (optional)
 *               managerContact:
 *                 type: string
 *                 example: "+919876543210"
 *                 description: Manager contact number (optional)
 *               numberOfDays:
 *                 type: integer
 *                 example: 3
 *                 description: Number of days for booking period (optional)
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-03-23T18:30:00.000Z"
 *                 description: Hotel booking start date (optional)
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-03-25T18:30:00.000Z"
 *                 description: Hotel booking end date (optional)
 *               checkInTime:
 *                 type: string
 *                 example: "14:00"
 *                 description: Check-in time (optional)
 *               checkOutTime:
 *                 type: string
 *                 example: "11:00"
 *                 description: Check-out time (optional)
 *               hasElevator:
 *                 type: boolean
 *                 example: true
 *                 description: Whether hotel has elevator (optional)
 *               total_floors:
 *                 type: integer
 *                 example: 3
 *               floors:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     floorNumber:
 *                       type: string
 *                     numberOfRooms:
 *                       type: integer
 *                     roomNumbers:
 *                       type: array
 *                       items:
 *                         type: string
 *     responses:
 *       201:
 *         description: Hotel created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', createHotel);

/**
 * @swagger
 * /api/hotels/{id}:
 *   put:
 *     summary: Update hotel
 *     tags: [Hotels]
 *     description: Update hotel information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hotel ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               map_link:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Hotel updated successfully
 *       404:
 *         description: Hotel not found
 */
router.put('/:id', updateHotel);

/**
 * @swagger
 * /api/hotels/{id}:
 *   delete:
 *     summary: Delete hotel
 *     tags: [Hotels]
 *     description: Delete a hotel and all its rooms
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hotel ID
 *     responses:
 *       200:
 *         description: Hotel deleted successfully
 *       404:
 *         description: Hotel not found
 */
router.delete('/:id', deleteHotel);

module.exports = router;

