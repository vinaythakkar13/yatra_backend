'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Update room_assignment_status ENUM column to include 'alloted'
            await queryInterface.changeColumn(
                'users',
                'room_assignment_status',
                {
                    type: DataTypes.ENUM('draft', 'confirmed', 'alloted'),
                    allowNull: true,
                    defaultValue: null,
                },
                { transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            console.error('Error in migration 20260221000001-add-alloted-status-to-users:', error);
            throw error;
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Revert back to original ENUM (excluding 'alloted')
            await queryInterface.changeColumn(
                'users',
                'room_assignment_status',
                {
                    type: DataTypes.ENUM('draft', 'confirmed'),
                    allowNull: true,
                    defaultValue: null,
                },
                { transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            console.error('Error reverting migration 20260221000001-add-alloted-status-to-users:', error);
            throw error;
        }
    },
};
