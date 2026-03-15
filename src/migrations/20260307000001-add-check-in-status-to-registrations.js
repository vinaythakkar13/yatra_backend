'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('yatra_registrations', 'check_in_status', {
            type: Sequelize.ENUM('not_checked_in', 'checked_in', 'checked_out'),
            defaultValue: 'not_checked_in',
            allowNull: false
        });

        await queryInterface.addColumn('yatra_registrations', 'checked_in_at', {
            type: Sequelize.DATE,
            allowNull: true,
            defaultValue: null
        });

        await queryInterface.addColumn('yatra_registrations', 'checked_out_at', {
            type: Sequelize.DATE,
            allowNull: true,
            defaultValue: null
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('yatra_registrations', 'checked_out_at');
        await queryInterface.removeColumn('yatra_registrations', 'checked_in_at');
        await queryInterface.removeColumn('yatra_registrations', 'check_in_status');
    }
};
