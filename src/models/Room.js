/**
 * Room Model
 * Represents individual rooms in hotels
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Room = sequelize.define('Room', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    room_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    floor: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    hotel_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'hotels',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    toilet_type: {
      type: DataTypes.ENUM('western', 'indian'),
      allowNull: true,
      defaultValue: 'western',
      comment: 'Type of toilet in the room'
    },
    number_of_beds: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1
      },
      comment: 'Number of beds in the room'
    },
    charge_per_day: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
      comment: 'Daily charge for the room'
    },
    is_occupied: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    assigned_to_user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'rooms',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_rooms_hotel',
        fields: ['hotel_id']
      },
      {
        name: 'idx_rooms_floor',
        fields: ['floor']
      },
      {
        name: 'idx_rooms_occupied',
        fields: ['is_occupied']
      },
      {
        name: 'idx_rooms_assigned_user',
        fields: ['assigned_to_user_id']
      },
      {
        name: 'idx_rooms_room_number',
        fields: ['room_number']
      },
      {
        name: 'unique_hotel_room',
        unique: true,
        fields: ['hotel_id', 'room_number']
      }
    ],
    hooks: {
      // Update hotel statistics after room changes
      afterCreate: async (room, options) => {
        await updateHotelStatistics(room.hotel_id, sequelize);
      },
      afterUpdate: async (room, options) => {
        await updateHotelStatistics(room.hotel_id, sequelize);
      },
      afterDestroy: async (room, options) => {
        await updateHotelStatistics(room.hotel_id, sequelize);
      }
    }
  });

  return Room;
};

/**
 * Helper function to update hotel statistics
 */
async function updateHotelStatistics(hotelId, sequelize) {
  try {
    const Hotel = sequelize.models.Hotel;
    const Room = sequelize.models.Room;

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
        hooks: false // Prevent infinite loop
      }
    );
  } catch (error) {
    console.error('Error updating hotel statistics:', error);
  }
}

