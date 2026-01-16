/**
 * EventParticipant Model
 * Junction table for Event and User (many-to-many relationship)
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EventParticipant = sequelize.define('EventParticipant', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    event_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'events',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    registration_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    attendance_status: {
      type: DataTypes.STRING(20),
      defaultValue: 'registered',
      allowNull: false,
      validate: {
        isIn: [['registered', 'attended', 'absent', 'cancelled']]
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
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
    tableName: 'event_participants',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_event_participants_event',
        fields: ['event_id']
      },
      {
        name: 'idx_event_participants_user',
        fields: ['user_id']
      },
      {
        name: 'idx_event_participants_status',
        fields: ['attendance_status']
      },
      {
        name: 'unique_event_user',
        unique: true,
        fields: ['event_id', 'user_id']
      }
    ]
  });

  return EventParticipant;
};

