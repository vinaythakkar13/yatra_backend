/**
 * User Model
 * Represents pilgrims/travelers registering for yatra
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    contact_number: {
      type: DataTypes.STRING(15),
      allowNull: false,
      validate: {
        notEmpty: true,
        is: /^\+?[0-9]{10,15}$/i
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    gender: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        isIn: [['male', 'female', 'other']]
      }
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 120
      }
    },
    number_of_persons: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    pnr: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    boarding_state: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    boarding_city: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    boarding_point: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    arrival_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    return_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isAfterOrEqualArrival(value) {
          if (value < this.arrival_date) {
            throw new Error('Return date must be after or equal to arrival date');
          }
        }
      }
    },
    assigned_room_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'rooms',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    ticket_images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'JSON array of ticket image URLs'
    },
    registration_status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
      allowNull: false,
      validate: {
        isIn: [['pending', 'confirmed', 'checked_in', 'cancelled']]
      }
    },
    is_room_assigned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_users_pnr',
        unique: true,
        fields: ['pnr']
      },
      {
        name: 'idx_users_contact',
        fields: ['contact_number']
      },
      {
        name: 'idx_users_email',
        fields: ['email']
      },
      {
        name: 'idx_users_arrival_date',
        fields: ['arrival_date']
      },
      {
        name: 'idx_users_assigned_room',
        fields: ['assigned_room_id']
      },
      {
        name: 'idx_users_registration_status',
        fields: ['registration_status']
      }
    ]
  });

  return User;
};

