/**
 * Migration - Add description column to yatra table
 * Yatra Event Management System
 * Date: October 14, 2025
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('yatra', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'registration_end_date'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('yatra', 'description');
  }
};

