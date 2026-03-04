'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('hotels', 'strict_rule', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('hotels', 'strict_rule');
    }
};
