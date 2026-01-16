/**
 * AuditLog Model
 * Tracks all admin actions and system changes for auditing purposes
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 50]
      }
    },
    entity_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 50]
      }
    },
    entity_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    performed_by_admin_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'admin_users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    old_data: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'JSON snapshot of data before change'
    },
    new_data: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'JSON snapshot of data after change'
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
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'audit_logs',
    timestamps: false,
    indexes: [
      {
        name: 'idx_audit_entity',
        fields: ['entity_type', 'entity_id']
      },
      {
        name: 'idx_audit_admin',
        fields: ['performed_by_admin_id']
      },
      {
        name: 'idx_audit_action',
        fields: ['action']
      },
      {
        name: 'idx_audit_created',
        fields: ['created_at']
      }
    ]
  });

  return AuditLog;
};

