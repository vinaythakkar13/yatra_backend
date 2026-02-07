'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Add cancelled_by_admin_id column to yatra_registrations table
            await queryInterface.addColumn('yatra_registrations', 'cancelled_by_admin_id', {
                type: Sequelize.CHAR(36),
                allowNull: true,
                comment: 'Admin ID who cancelled this registration'
            }, { transaction });

            // Add index on cancelled_by_admin_id for better query performance
            await queryInterface.addIndex('yatra_registrations', ['cancelled_by_admin_id'], {
                name: 'idx_registration_cancelled_by_admin',
                transaction
            });

            await transaction.commit();
            console.log('✅ Added cancelled_by_admin_id column to yatra_registrations table');
        } catch (error) {
            await transaction.rollback();
            console.error('❌ Error adding cancelled_by_admin_id field:', error);
            throw error;
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Remove index
            await queryInterface.removeIndex('yatra_registrations', 'idx_registration_cancelled_by_admin', { transaction });

            // Remove column
            await queryInterface.removeColumn('yatra_registrations', 'cancelled_by_admin_id', { transaction });

            await transaction.commit();
            console.log('✅ Removed cancelled_by_admin_id column from yatra_registrations table');
        } catch (error) {
            await transaction.rollback();
            console.error('❌ Error removing cancelled_by_admin_id field:', error);
            throw error;
        }
    }
};
