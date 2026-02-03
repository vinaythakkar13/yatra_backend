'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Add split_pnr column to yatra_registrations table
            await queryInterface.addColumn('yatra_registrations', 'split_pnr', {
                type: Sequelize.STRING(10),
                allowNull: true,
                comment: 'System-generated internal PNR for split registrations'
            }, { transaction });

            // Add original_pnr column to yatra_registrations table
            await queryInterface.addColumn('yatra_registrations', 'original_pnr', {
                type: Sequelize.STRING(12),
                allowNull: true,
                comment: 'Original PNR from railway booking for split registrations'
            }, { transaction });

            // Add index on split_pnr for better query performance
            await queryInterface.addIndex('yatra_registrations', ['split_pnr'], {
                name: 'idx_registration_split_pnr',
                transaction
            });

            // Add index on original_pnr for better query performance
            await queryInterface.addIndex('yatra_registrations', ['original_pnr'], {
                name: 'idx_registration_original_pnr',
                transaction
            });

            await transaction.commit();
            console.log('✅ Added split_pnr and original_pnr columns to yatra_registrations table');
        } catch (error) {
            await transaction.rollback();
            console.error('❌ Error adding split PNR fields:', error);
            throw error;
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Remove indexes
            await queryInterface.removeIndex('yatra_registrations', 'idx_registration_split_pnr', { transaction });
            await queryInterface.removeIndex('yatra_registrations', 'idx_registration_original_pnr', { transaction });

            // Remove columns
            await queryInterface.removeColumn('yatra_registrations', 'split_pnr', { transaction });
            await queryInterface.removeColumn('yatra_registrations', 'original_pnr', { transaction });

            await transaction.commit();
            console.log('✅ Removed split_pnr and original_pnr columns from yatra_registrations table');
        } catch (error) {
            await transaction.rollback();
            console.error('❌ Error removing split PNR fields:', error);
            throw error;
        }
    }
};