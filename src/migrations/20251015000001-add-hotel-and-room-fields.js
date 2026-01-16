/**
 * Migration: Add new fields to hotels and rooms tables
 * Adds yatra_id, hotel_type, manager info, dates, times, and room pricing fields
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new fields to hotels table
    await queryInterface.addColumn('hotels', 'yatra_id', {
      type: Sequelize.UUID,
      allowNull: true, // Allow null initially, then we'll make it required
      references: {
        model: 'yatra',
        key: 'id'
      },
      onDelete: 'CASCADE'
    });

    await queryInterface.addColumn('hotels', 'hotel_type', {
      type: Sequelize.STRING(10),
      allowNull: true,
      comment: 'Hotel type classification (e.g., A, B, C)'
    });

    await queryInterface.addColumn('hotels', 'manager_name', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Name of the hotel manager'
    });

    await queryInterface.addColumn('hotels', 'manager_contact', {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: 'Contact number of the hotel manager'
    });

    await queryInterface.addColumn('hotels', 'number_of_days', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Number of days for the hotel booking period'
    });

    await queryInterface.addColumn('hotels', 'start_date', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Hotel booking start date'
    });

    await queryInterface.addColumn('hotels', 'end_date', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Hotel booking end date'
    });

    await queryInterface.addColumn('hotels', 'check_in_time', {
      type: Sequelize.STRING(10),
      allowNull: true,
      comment: 'Check-in time (e.g., 14:00)'
    });

    await queryInterface.addColumn('hotels', 'check_out_time', {
      type: Sequelize.STRING(10),
      allowNull: true,
      comment: 'Check-out time (e.g., 11:00)'
    });

    await queryInterface.addColumn('hotels', 'has_elevator', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: 'Whether the hotel has an elevator'
    });

    // Add index for yatra_id
    await queryInterface.addIndex('hotels', ['yatra_id'], {
      name: 'idx_hotels_yatra'
    });

    // Add new fields to rooms table
    await queryInterface.addColumn('rooms', 'toilet_type', {
      type: Sequelize.ENUM('western', 'indian', 'both'),
      allowNull: true,
      defaultValue: 'western',
      comment: 'Type of toilet in the room'
    });

    await queryInterface.addColumn('rooms', 'number_of_beds', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Number of beds in the room'
    });

    await queryInterface.addColumn('rooms', 'charge_per_day', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
      comment: 'Daily charge for the room'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes first
    await queryInterface.removeIndex('hotels', 'idx_hotels_yatra');

    // Remove columns from hotels table
    await queryInterface.removeColumn('hotels', 'yatra_id');
    await queryInterface.removeColumn('hotels', 'hotel_type');
    await queryInterface.removeColumn('hotels', 'manager_name');
    await queryInterface.removeColumn('hotels', 'manager_contact');
    await queryInterface.removeColumn('hotels', 'number_of_days');
    await queryInterface.removeColumn('hotels', 'start_date');
    await queryInterface.removeColumn('hotels', 'end_date');
    await queryInterface.removeColumn('hotels', 'check_in_time');
    await queryInterface.removeColumn('hotels', 'check_out_time');
    await queryInterface.removeColumn('hotels', 'has_elevator');

    // Remove columns from rooms table
    await queryInterface.removeColumn('rooms', 'toilet_type');
    await queryInterface.removeColumn('rooms', 'number_of_beds');
    await queryInterface.removeColumn('rooms', 'charge_per_day');
  }
};

