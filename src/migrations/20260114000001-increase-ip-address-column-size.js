'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Increase ip_address column size to handle longer IPv6 addresses and forwarded IPs
            await queryInterface.sequelize.query(
                `ALTER TABLE \`registration_logs\` 
         MODIFY COLUMN \`ip_address\` VARCHAR(128) NULL;`,
                { transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            console.error('Error in migration 20260114000001-increase-ip-address-column-size:', error);
            throw error;
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Revert to original size
            await queryInterface.sequelize.query(
                `ALTER TABLE \`registration_logs\` 
         MODIFY COLUMN \`ip_address\` VARCHAR(45) NULL;`,
                { transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            console.error('Error reverting migration 20260114000001-increase-ip-address-column-size:', error);
            throw error;
        }
    },
};
