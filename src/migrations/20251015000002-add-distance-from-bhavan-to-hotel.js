/**
 * Migration: Add distance_from_bhavan column to hotels table
 */

'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('hotels', 'distance_from_bhavan', {
            type: Sequelize.STRING(50),
            allowNull: true,
            comment: 'Distance from bhavan (e.g., "2.5 km", "5 miles")'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('hotels', 'distance_from_bhavan');
    }
};
