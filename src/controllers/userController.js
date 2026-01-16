/**
 * User Controller
 * Manages pilgrim authentication and CRUD operations.
 */

const { User, Room, Hotel } = require('../models');
const {
  successResponse,
  errorResponse,
  notFoundResponse,
  paginatedResponse
} = require('../utils/responseHelper');
const { logRequestBody } = require('../utils/requestLogger');

/**
 * Allow pilgrims to log in using only their PNR value.
 */
const loginWithPnr = async (req, res) => {
  try {
    logRequestBody(req, 'User/Pilgrim Login (PNR)');

    const { pnr } = req.body;

    if (!pnr) {
      return errorResponse(res, 'PNR is required', 400);
    }

    const user = await User.findOne({
      where: { pnr },
      include: [
        {
          model: Room,
          as: 'assignedRoom',
          required: false,
          include: [
            {
              model: Hotel,
              as: 'hotel'
            }
          ]
        }
      ]
    });

    if (!user) {
      return notFoundResponse(res, 'No registration found with this PNR');
    }

    let hotelAssignment = null;
    if (user.assignedRoom && user.assignedRoom.hotel) {
      hotelAssignment = {
        status: 'assigned',
        hotel_id: user.assignedRoom.hotel.id,
        hotel_name: user.assignedRoom.hotel.name,
        hotel_address: user.assignedRoom.hotel.address,
        hotel_map_link: user.assignedRoom.hotel.map_link,
        room_id: user.assignedRoom.id,
        room_number: user.assignedRoom.room_number,
        floor: user.assignedRoom.floor,
        total_floors: user.assignedRoom.hotel.total_floors,
        hotel_contact: user.assignedRoom.hotel.contact_number || null,
        is_occupied: user.assignedRoom.is_occupied
      };
    } else {
      hotelAssignment = {
        status: 'not_assigned',
        message: 'Room not yet assigned. Please check back later or contact admin.'
      };
    }

    const passengerDetailsArray = [
      {
        passenger_number: 1,
        name: user.name,
        contact_number: user.contact_number,
        email: user.email,
        gender: user.gender,
        age: user.age,
        is_primary: true
      }
    ];

    for (let i = 2; i <= user.number_of_persons; i += 1) {
      passengerDetailsArray.push({
        passenger_number: i,
        name: `Passenger ${i}`,
        is_primary: false,
        note: 'Individual details to be added by admin'
      });
    }

    const responseData = {
      pnr: user.pnr,
      number_of_passengers: user.number_of_persons,
      registration_status: user.registration_status,
      passenger_details: passengerDetailsArray,
      boarding_details: {
        state: user.boarding_state,
        city: user.boarding_city,
        boarding_point: user.boarding_point
      },
      travel_dates: {
        arrival_date: user.arrival_date,
        return_date: user.return_date
      },
      ticket_images: user.ticket_images || [],
      hotel_assignment: hotelAssignment,
      registered_at: user.created_at,
      last_updated: user.updated_at
    };

    return successResponse(res, responseData, 'Login successful');
  } catch (error) {
    console.error('User login error:', error);
    return errorResponse(res, 'Login failed', 500);
  }
};

/**
 * Paginated list of registered users with helpful filters.
 */
const listUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const where = {};

    if (req.query.registration_status) {
      where.registration_status = req.query.registration_status;
    }

    if (req.query.is_room_assigned !== undefined) {
      where.is_room_assigned = req.query.is_room_assigned === 'true';
    }

    if (req.query.arrival_date) {
      where.arrival_date = req.query.arrival_date;
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        {
          model: Room,
          as: 'assignedRoom',
          required: false,
          include: [
            {
              model: Hotel,
              as: 'hotel',
              attributes: ['id', 'name', 'address']
            }
          ]
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
      'Users retrieved successfully'
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    return errorResponse(res, 'Failed to fetch users', 500);
  }
};

/**
 * Retrieve a single user by the provided PNR.
 */
const getUserByPnr = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { pnr: req.params.pnr },
      include: [
        {
          model: Room,
          as: 'assignedRoom',
          required: false,
          include: [
            {
              model: Hotel,
              as: 'hotel',
              attributes: ['id', 'name', 'address', 'map_link']
            }
          ]
        }
      ]
    });

    if (!user) {
      return notFoundResponse(res, 'User not found');
    }

    return successResponse(res, user, 'User retrieved successfully');
  } catch (error) {
    console.error('Error fetching user:', error);
    return errorResponse(res, 'Failed to fetch user', 500);
  }
};

/**
 * Register a new pilgrim.
 */
const registerUser = async (req, res) => {
  try {
    logRequestBody(req, 'Register New Pilgrim');

    const {
      name,
      contact_number,
      email,
      gender,
      age,
      number_of_persons,
      pnr,
      boarding_state,
      boarding_city,
      boarding_point,
      arrival_date,
      return_date,
      ticket_images
    } = req.body;

    const existingUser = await User.findOne({ where: { pnr } });
    if (existingUser) {
      return errorResponse(res, 'PNR already registered', 400);
    }

    const user = await User.create({
      name,
      contact_number,
      email,
      gender,
      age,
      number_of_persons,
      pnr,
      boarding_state,
      boarding_city,
      boarding_point,
      arrival_date,
      return_date,
      ticket_images: ticket_images || [],
      registration_status: 'pending'
    });

    return successResponse(res, user, 'User registered successfully', 201);
  } catch (error) {
    console.error('Error creating user:', error);
    return errorResponse(res, error.message || 'Failed to register user', 400);
  }
};

/**
 * Update user metadata.
 */
const updateUser = async (req, res) => {
  try {
    logRequestBody(req, 'Update User/Pilgrim');

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return notFoundResponse(res, 'User not found');
    }

    await user.update(req.body);

    return successResponse(res, user, 'User updated successfully');
  } catch (error) {
    console.error('Error updating user:', error);
    return errorResponse(res, error.message || 'Failed to update user', 400);
  }
};

/**
 * Permanently delete a user registration.
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return notFoundResponse(res, 'User not found');
    }

    await user.destroy();

    return successResponse(res, null, 'User deleted successfully');
  } catch (error) {
    console.error('Error deleting user:', error);
    return errorResponse(res, 'Failed to delete user', 500);
  }
};

module.exports = {
  loginWithPnr,
  listUsers,
  getUserByPnr,
  registerUser,
  updateUser,
  deleteUser
};

