// create a model for yatra table.

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const yatra = sequelize.define('Yatra', {
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
    banner_image: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    registration_start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    registration_end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'yatra',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_yatra_name',
        fields: ['name']
      },
      {
        name: 'idx_yatra_active',
        fields: ['start_date']
      },
      {
        name: 'idx_yatra_end_date',
        fields: ['end_date']
      }
    ]
  });

  return yatra;
};