'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Add mobile_banner_image column to yatra table
            await queryInterface.addColumn('yatra', 'mobile_banner_image', {
                type: Sequelize.STRING(500),
                allowNull: true,
                comment: 'Optional mobile banner image URL for mobile devices'
            }, { transaction });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            console.error('Error in migration 20260124000001-add-mobile-banner-image-to-yatra:', error);
            throw error;
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Remove mobile_banner_image column from yatra table
            await queryInterface.removeColumn('yatra', 'mobile_banner_image', { transaction });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            console.error('Error rolling back migration 20260124000001-add-mobile-banner-image-to-yatra:', error);
            throw error;
        }
    }
};
