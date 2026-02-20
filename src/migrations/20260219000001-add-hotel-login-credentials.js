'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('hotels', 'login_id', {
            type: Sequelize.STRING(20),
            allowNull: true,
            // unique: true, // Removed for TiDB compatibility
            defaultValue: null,
        });

        await queryInterface.addIndex('hotels', ['login_id'], {
            unique: true,
            name: 'hotels_login_id_unique_constraint'
        });

        await queryInterface.addColumn('hotels', 'password_hash', {
            type: Sequelize.STRING(255),
            allowNull: true,
            defaultValue: null,
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('hotels', 'login_id');
        await queryInterface.removeColumn('hotels', 'password_hash');
    },
};
