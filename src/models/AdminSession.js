/**
 * AdminSession Model
 * Represents active admin user sessions for authentication tracking
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AdminSession = sequelize.define('AdminSession', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    admin_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'admin_users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    token_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    device_info: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
      validate: {
        isIP: true
      }
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    last_activity: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    }
  }, {
    tableName: 'admin_sessions',
    timestamps: false,
    indexes: [
      {
        name: 'idx_sessions_admin',
        fields: ['admin_id']
      },
      {
        name: 'idx_sessions_token',
        unique: true,
        fields: ['token_hash']
      },
      {
        name: 'idx_sessions_expires',
        fields: ['expires_at']
      },
      {
        name: 'idx_sessions_active',
        fields: ['is_active']
      }
    ]
  });

  // Instance method to check if session is expired
  AdminSession.prototype.isExpired = function() {
    return this.expires_at < new Date();
  };

  return AdminSession;
};

