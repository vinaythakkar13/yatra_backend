/**
 * AdminUser Model
 * Represents admin/staff users who manage the yatra system
 */

const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  const AdminUser = sequelize.define('AdminUser', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true
      }
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
      allowNull: true,
      validate: {
        is: /^\+?[0-9]{10,15}$/i
      }
    },
    role: {
      type: DataTypes.STRING(20),
      defaultValue: 'admin',
      allowNull: false,
      validate: {
        isIn: [['super_admin', 'admin', 'staff']]
      }
    },
    permissions: {
      type: DataTypes.JSON,
      defaultValue: [],
      allowNull: false,
      comment: 'JSON array of permission strings'
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    failed_login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    locked_until: {
      type: DataTypes.DATE,
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
    tableName: 'admin_users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_admin_email',
        unique: true,
        fields: ['email']
      },
      {
        name: 'idx_admin_role',
        fields: ['role']
      },
      {
        name: 'idx_admin_active',
        fields: ['is_active']
      }
    ],
    hooks: {
      // Hash password before creating admin user
      beforeCreate: async (admin) => {
        if (admin.password_hash && !admin.password_hash.startsWith('$2b$')) {
          admin.password_hash = await bcrypt.hash(admin.password_hash, 10);
        }
      },
      // Hash password before updating if changed
      beforeUpdate: async (admin) => {
        if (admin.changed('password_hash') && !admin.password_hash.startsWith('$2b$')) {
          admin.password_hash = await bcrypt.hash(admin.password_hash, 10);
        }
      }
    }
  });

  // Instance method to verify password
  AdminUser.prototype.verifyPassword = async function(password) {
    return await bcrypt.compare(password, this.password_hash);
  };

  // Instance method to check if account is locked
  AdminUser.prototype.isLocked = function() {
    return this.locked_until && this.locked_until > new Date();
  };

  return AdminUser;
};

