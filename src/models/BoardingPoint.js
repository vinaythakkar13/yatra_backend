/**
 * BoardingPoint Model
 * Represents boarding/pickup points for pilgrims
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BoardingPoint = sequelize.define('BoardingPoint', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    point_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    contact_person: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    contact_number: {
      type: DataTypes.STRING(15),
      allowNull: true,
      validate: {
        is: /^\+?[0-9]{10,15}$/i
      }
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
      validate: {
        min: -90,
        max: 90
      }
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      validate: {
        min: -180,
        max: 180
      }
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
    tableName: 'boarding_points',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_boarding_state',
        fields: ['state']
      },
      {
        name: 'idx_boarding_city',
        fields: ['city']
      },
      {
        name: 'idx_boarding_active',
        fields: ['is_active']
      },
      {
        name: 'unique_state_city_point',
        unique: true,
        fields: ['state', 'city', 'point_name']
      }
    ]
  });

  return BoardingPoint;
};

