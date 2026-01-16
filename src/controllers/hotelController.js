/**
 * Hotel Controller
 * Handles CRUD flows for hotels and related room metadata.
 */

const { Hotel, Room, Yatra } = require('../models');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHelper');
const { logRequestBody } = require('../utils/requestLogger');

/**
 * Fetch hotels with pagination and optional active filter.
 */
const listHotels = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.is_active !== undefined) {
      where.is_active = req.query.is_active === 'true';
    }

    const { count, rows } = await Hotel.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        {
          model: Room,
          as: 'rooms',
          attributes: ['id', 'room_number', 'floor', 'is_occupied', 'number_of_beds', 'charge_per_day', 'toilet_type', 'hotel_id', 'assigned_to_user_id']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return paginatedResponse(
      res,
      rows,
      {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      },
      'Hotels retrieved successfully'
    );
  } catch (error) {
    console.error('Error fetching hotels:', error);
    return errorResponse(res, 'Failed to fetch hotels', 500);
  }
};

/**
 * Fetch a single hotel by primary key.
 */
const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findByPk(req.params.id, {
      include: [
        {
          model: Room,
          as: 'rooms',
          attributes: ['id', 'room_number', 'floor', 'is_occupied', 'number_of_beds', 'charge_per_day', 'toilet_type', 'hotel_id', 'assigned_to_user_id', 'created_at', 'updated_at']
        }
      ]
    });

    if (!hotel) {
      return errorResponse(res, 'Hotel not found', 404);
    }

    return successResponse(res, hotel, 'Hotel retrieved successfully');
  } catch (error) {
    console.error('Error fetching hotel:', error);
    return errorResponse(res, 'Failed to fetch hotel', 500);
  }
};

/**
 * Create a fresh hotel with the provided floor/room configuration.
 * Handles complex nested payload with floors, rooms, and pricing information.
 */
const createHotel = async (req, res) => {
  try {
    logRequestBody(req, 'Create Hotel');

    const {
      yatra,
      name,
      address,
      mapLink,
      distanceFromBhavan,
      hotelType,
      managerName,
      managerContact,
      numberOfDays,
      startDate,
      endDate,
      checkInTime,
      checkOutTime,
      hasElevator,
      totalFloors,
      floors,
      rooms
    } = req.body;

    // Validate required fields
    if (!yatra || !name || !address) {
      return errorResponse(res, 'Missing required fields: yatra, name, and address are required', 400);
    }

    // Verify yatra exists
    const yatraExists = await Yatra.findByPk(yatra);
    if (!yatraExists) {
      return errorResponse(res, 'Yatra not found', 404);
    }

    // Create hotel with all fields (support both camelCase and snake_case)
    const hotelData = {
      yatra_id: yatra,
      name,
      address,
      map_link: mapLink || req.body.map_link,
      distance_from_bhavan: distanceFromBhavan || req.body.distance_from_bhavan || req.body.distanceFromBhavan,
      hotel_type: hotelType || req.body.hotel_type,
      manager_name: managerName || req.body.manager_name,
      manager_contact: managerContact || req.body.manager_contact,
      number_of_days: numberOfDays || req.body.number_of_days,
      start_date: startDate || req.body.start_date,
      end_date: endDate || req.body.end_date,
      check_in_time: checkInTime || req.body.check_in_time,
      check_out_time: checkOutTime || req.body.check_out_time,
      has_elevator: hasElevator !== undefined ? hasElevator : (req.body.has_elevator !== undefined ? req.body.has_elevator : false),
      total_floors: totalFloors || req.body.total_floors || (floors ? floors.length : 0),
      floors: floors || [] // Store floors as JSON
    };

    const hotel = await Hotel.create(hotelData);

    // Create rooms from the nested floors structure
    // The payload has both floors[].rooms[] (with details) and a flat rooms[] array
    // We'll use the flat rooms array as the source of truth for room details
    // and match them with floor information

    const roomsToCreate = [];

    // First, create a map of room numbers to room details from the flat rooms array
    const roomsMap = new Map();
    if (rooms && Array.isArray(rooms)) {
      rooms.forEach((room) => {
        if (room.roomNumber) {
          roomsMap.set(room.roomNumber, {
            roomNumber: room.roomNumber,
            floor: room.floor,
            toiletType: room.toiletType,
            numberOfBeds: room.numberOfBeds,
            chargePerDay: room.chargePerDay,
            isOccupied: room.isOccupied || false
          });
        }
      });
    }

    // Process floors structure and match with room details
    if (floors && Array.isArray(floors)) {
      floors.forEach((floor) => {
        // Process roomNumbers array from floor
        if (floor.roomNumbers && Array.isArray(floor.roomNumbers)) {
          floor.roomNumbers.forEach((roomNumber, index) => {
            // Get room details from flat rooms array or from floor.rooms array
            let roomDetails = roomsMap.get(roomNumber);

            if (!roomDetails && floor.rooms && floor.rooms[index]) {
              // Fallback to floor.rooms array
              const floorRoom = floor.rooms[index];
              roomDetails = {
                roomNumber: roomNumber,
                floor: floor.floorNumber,
                toiletType: floorRoom.toiletType || floorRoom.toilet_type || 'western',
                numberOfBeds: floorRoom.numberOfBeds || floorRoom.number_of_beds || 1,
                chargePerDay: floorRoom.chargePerDay || floorRoom.charge_per_day || 0,
                isOccupied: false
              };
            }

            if (!roomDetails) {
              // Create default room if no details found
              roomDetails = {
                roomNumber: roomNumber,
                floor: floor.floorNumber,
                toiletType: 'western',
                numberOfBeds: 1,
                chargePerDay: 0,
                isOccupied: false
              };
            }

            roomsToCreate.push({
              hotel_id: hotel.id,
              room_number: roomDetails.roomNumber,
              floor: roomDetails.floor ? roomDetails.floor.toString() : floor.floorNumber.toString(),
              toilet_type: roomDetails.toiletType || 'western',
              number_of_beds: roomDetails.numberOfBeds || 1,
              charge_per_day: roomDetails.chargePerDay || 0,
              is_occupied: roomDetails.isOccupied || false
            });
          });
        }
      });
    }

    // If no floors structure, use flat rooms array directly
    if (roomsToCreate.length === 0 && rooms && Array.isArray(rooms)) {
      rooms.forEach((room) => {
        if (room.roomNumber) {
          roomsToCreate.push({
            hotel_id: hotel.id,
            room_number: room.roomNumber,
            floor: room.floor ? room.floor.toString() : '1',
            toilet_type: room.toiletType || 'western',
            number_of_beds: room.numberOfBeds || 1,
            charge_per_day: room.chargePerDay || 0,
            is_occupied: room.isOccupied || false
          });
        }
      });
    }

    // Bulk create all rooms
    if (roomsToCreate.length > 0) {
      await Room.bulkCreate(roomsToCreate);
    }

    // Fetch complete hotel with all relationships
    const completeHotel = await Hotel.findByPk(hotel.id, {
      include: [
        {
          model: Room,
          as: 'rooms',
          attributes: ['id', 'room_number', 'floor', 'toilet_type', 'number_of_beds', 'charge_per_day', 'is_occupied']
        },
        {
          model: Yatra,
          as: 'yatra',
          attributes: ['id', 'name', 'start_date', 'end_date']
        }
      ]
    });

    return successResponse(res, completeHotel, 'Hotel created successfully with all rooms and pricing', 201);
  } catch (error) {
    console.error('Error creating hotel:', error);
    return errorResponse(res, error.message || 'Failed to create hotel', 400);
  }
};

/**
 * Update mutable hotel fields.
 */
const updateHotel = async (req, res) => {
  try {
    logRequestBody(req, 'Update Hotel');

    const hotel = await Hotel.findByPk(req.params.id);

    if (!hotel) {
      return errorResponse(res, 'Hotel not found', 404);
    }

    await hotel.update(req.body);

    return successResponse(res, hotel, 'Hotel updated successfully');
  } catch (error) {
    console.error('Error updating hotel:', error);
    return errorResponse(res, error.message || 'Failed to update hotel', 400);
  }
};

/**
 * Remove a hotel and its associated rooms.
 */
const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByPk(req.params.id);

    if (!hotel) {
      return errorResponse(res, 'Hotel not found', 404);
    }

    await hotel.destroy();

    return successResponse(res, null, 'Hotel deleted successfully');
  } catch (error) {
    console.error('Error deleting hotel:', error);
    return errorResponse(res, 'Failed to delete hotel', 500);
  }
};

module.exports = {
  listHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel
};

