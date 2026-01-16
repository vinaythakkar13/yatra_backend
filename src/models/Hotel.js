/**
 * Hotel Model
 * Represents hotels/accommodation for pilgrims
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Hotel = sequelize.define('Hotel', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    map_link: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    distance_from_bhavan: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Distance from bhavan (e.g., "2.5 km", "5 miles")'
    },
    yatra_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'yatra',
        key: 'id'
      },
      onDelete: 'CASCADE',
      comment: 'Foreign key to yatra table'
    },
    hotel_type: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Hotel type classification (e.g., A, B, C)'
    },
    manager_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Name of the hotel manager'
    },
    manager_contact: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Contact number of the hotel manager'
    },
    number_of_days: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1
      },
      comment: 'Number of days for the hotel booking period'
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Hotel booking start date'
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Hotel booking end date'
    },
    check_in_time: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Check-in time (e.g., 14:00)'
    },
    check_out_time: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Check-out time (e.g., 11:00)'
    },
    has_elevator: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: 'Whether the hotel has an elevator'
    },
    total_floors: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 100
      }
    },
    floors: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      comment: 'JSON array containing floor information with room numbers'
    },
    total_rooms: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    occupied_rooms: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    available_rooms: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
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
    tableName: 'hotels',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_hotels_name',
        fields: ['name']
      },
      {
        name: 'idx_hotels_active',
        fields: ['is_active']
      }
    ],
    hooks: {
      // Hook to update hotel statistics when rooms change
      afterUpdate: async (hotel, options) => {
        // This will be triggered by Room model changes
      }
    }
  });

  return Hotel;
};

