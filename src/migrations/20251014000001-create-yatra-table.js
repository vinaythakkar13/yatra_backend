/**
 * Migration - Create Yatra Table
 * Yatra Event Management System
 * Date: October 14, 2025
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('yatra', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [1, 255]
        }
      },
      banner_image: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      registration_start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      registration_end_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create indexes for yatra
    await queryInterface.addIndex('yatra', ['name'], { name: 'idx_yatra_name' });
    await queryInterface.addIndex('yatra', ['start_date'], { name: 'idx_yatra_active' });
    await queryInterface.addIndex('yatra', ['end_date'], { name: 'idx_yatra_end_date' });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('yatra');
  }
};

