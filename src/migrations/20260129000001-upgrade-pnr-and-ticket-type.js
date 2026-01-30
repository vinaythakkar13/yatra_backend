'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // 1. Upgrade PNR column length in yatra_registrations
            await queryInterface.changeColumn(
                'yatra_registrations',
                'pnr',
                {
                    type: DataTypes.STRING(12),
                    allowNull: false,
                },
                { transaction }
            );

            // 2. Upgrade PNR column length in users
            await queryInterface.changeColumn(
                'users',
                'pnr',
                {
                    type: DataTypes.STRING(12),
                    allowNull: false,
                    unique: true,
                },
                { transaction }
            );

            // 3. Add ticket_type ENUM column to yatra_registrations
            // Note: In MySQL, we can directly add the ENUM column
            await queryInterface.addColumn(
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
            console.error('Error in migration 20260129000001-upgrade-pnr-and-ticket-type:', error);
            throw error;
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // 1. Remove ticket_type column
            await queryInterface.removeColumn('yatra_registrations', 'ticket_type', { transaction });

            // 2. Revert PNR column length in users (Careful: this might truncate data if 11-12 char PNRs exist)
            await queryInterface.changeColumn(
                'users',
                'pnr',
                {
                    type: DataTypes.STRING(10),
                    allowNull: false,
                    unique: true,
                },
                { transaction }
            );

            // 3. Revert PNR column length in yatra_registrations
            await queryInterface.changeColumn(
                'yatra_registrations',
                'pnr',
                {
                    type: DataTypes.STRING(10),
                    allowNull: false,
                },
                { transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            console.error('Error reverting migration 20260129000001-upgrade-pnr-and-ticket-type:', error);
            throw error;
        }
    },
};
