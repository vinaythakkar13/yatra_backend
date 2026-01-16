/**
 * Database Helper Utilities
 * Helper functions for common database operations
 */

const { sequelize, Hotel, Room, User, Event, EventParticipant } = require('../models');

/**
 * Get available rooms with hotel information
 * @returns {Promise<Array>} Array of available rooms with hotel details
 */
async function getAvailableRoomsWithHotel() {
  return await Room.findAll({
    where: {
      is_occupied: false
    },
    include: [
      {
        model: Hotel,
        as: 'hotel',
        where: {
          is_active: true
        },
        attributes: ['id', 'name', 'address', 'map_link']
      }
    ],
    order: [
      ['hotel_id', 'ASC'],
      ['floor', 'ASC'],
      ['room_number', 'ASC']
    ]
  });
}

/**
 * Get users with room assignment details
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Array of users with room details
 */
async function getUsersWithRoomDetails(filters = {}) {
  const where = {};
  
  if (filters.registration_status) {
    where.registration_status = filters.registration_status;
  }
  
  if (filters.arrival_date) {
    where.arrival_date = filters.arrival_date;
  }

  return await User.findAll({
    where,
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
}

/**
 * Get event participation summary
 * @param {string} eventId - Event ID (optional)
 * @returns {Promise<Array>} Event participation statistics
 */
async function getEventParticipationSummary(eventId = null) {
  const where = eventId ? { id: eventId } : {};

  const events = await Event.findAll({
    where,
    include: [
      {
        model: EventParticipant,
        as: 'participants',
        required: false,
        attributes: []
      }
    ],
    attributes: {
      include: [
        [
          sequelize.fn('COUNT', sequelize.col('participants.id')),
          'total_registered'
        ],
        [
          sequelize.fn(
            'COUNT',
            sequelize.literal(`CASE WHEN participants.attendance_status = 'attended' THEN 1 END`)
          ),
          'total_attended'
        ]
      ]
    },
    group: ['Event.id'],
    raw: true
  });

  return events;
}

/**
 * Cleanup expired admin sessions
 * @returns {Promise<number>} Number of sessions deleted
 */
async function cleanupExpiredSessions() {
  const { AdminSession } = require('../models');
  const result = await AdminSession.destroy({
    where: {
      expires_at: {
        [sequelize.Sequelize.Op.lt]: new Date()
      }
    }
  });
  return result;
}

/**
 * Get hotel occupancy statistics
 * @param {string} hotelId - Hotel ID (optional)
 * @returns {Promise<Array>} Hotel statistics
 */
async function getHotelOccupancyStats(hotelId = null) {
  const where = hotelId ? { id: hotelId } : { is_active: true };

  return await Hotel.findAll({
    where,
    attributes: [
      'id',
      'name',
      'total_rooms',
      'occupied_rooms',
      'available_rooms',
      [
        sequelize.literal(
          '(occupied_rooms * 100.0 / NULLIF(total_rooms, 0))'
        ),
        'occupancy_percentage'
      ]
    ]
  });
}

/**
 * Update hotel room statistics
 * @param {string} hotelId - Hotel ID
 */
async function updateHotelStatistics(hotelId) {
  const [totalRooms, occupiedRooms] = await Promise.all([
    Room.count({ where: { hotel_id: hotelId } }),
    Room.count({ where: { hotel_id: hotelId, is_occupied: true } })
  ]);

  const availableRooms = totalRooms - occupiedRooms;

  await Hotel.update(
    {
      total_rooms: totalRooms,
      occupied_rooms: occupiedRooms,
      available_rooms: availableRooms
    },
    {
      where: { id: hotelId },
      hooks: false
    }
  );
}

/**
 * Check room availability for date range
 * @param {Date} arrivalDate - Arrival date
 * @param {Date} returnDate - Return date
 * @returns {Promise<Array>} Available rooms
 */
async function checkRoomAvailability(arrivalDate, returnDate) {
  // Get all rooms
  const allRooms = await Room.findAll({
    include: [
      {
        model: Hotel,
        as: 'hotel',
        where: { is_active: true }
      }
    ]
  });

  // Get users with overlapping date ranges
  const overlappingUsers = await User.findAll({
    where: {
      [sequelize.Sequelize.Op.and]: [
        {
          arrival_date: {
            [sequelize.Sequelize.Op.lte]: returnDate
          }
        },
        {
          return_date: {
            [sequelize.Sequelize.Op.gte]: arrivalDate
          }
        },
        {
          assigned_room_id: {
            [sequelize.Sequelize.Op.ne]: null
          }
        }
      ]
    },
    attributes: ['assigned_room_id']
  });

  const occupiedRoomIds = overlappingUsers.map(u => u.assigned_room_id);
  
  return allRooms.filter(room => !occupiedRoomIds.includes(room.id));
}

module.exports = {
  getAvailableRoomsWithHotel,
  getUsersWithRoomDetails,
  getEventParticipationSummary,
  cleanupExpiredSessions,
  getHotelOccupancyStats,
  updateHotelStatistics,
  checkRoomAvailability
};

