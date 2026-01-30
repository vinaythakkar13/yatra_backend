'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Update ticket_type ENUM column to include 'TBS', 'WL', 'RAC' if missing
            await queryInterface.changeColumn(
                'yatra_registrations',
                'ticket_type',
                {
                    type: DataTypes.ENUM(
                        'FLIGHT',
                        'BUS',
                        'FIRST_AC',
                        'SECOND_AC',
                        'THIRD_AC',
                        'SLEEPER',
                        'GENERAL',
                        'TBS',
                        'WL',
                        'RAC'
                    ),
                    allowNull: true,
                    defaultValue: null,
                },
                { transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            console.error('Error in migration 20260130000001-add-tbs-to-ticket-type:', error);
            throw error;
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Revert back to original ENUM (excluding newer values if necessary)
            // Note: Be careful as this might fail if 'TBS' records already exist
            await queryInterface.changeColumn(
                'yatra_registrations',
                'ticket_type',
                {
                    type: DataTypes.ENUM(
                        'FLIGHT',
                        'BUS',
                        'FIRST_AC',
                        'SECOND_AC',
                        'THIRD_AC',
                        'SLEEPER',
                        'GENERAL'
                    ),
                    allowNull: true,
                    defaultValue: null,
                },
                { transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            console.error('Error reverting migration 20260130000001-add-tbs-to-ticket-type:', error);
            throw error;
        }
    },
};
