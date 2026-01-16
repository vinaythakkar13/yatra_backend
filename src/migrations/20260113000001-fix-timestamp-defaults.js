'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Fix created_at and updated_at defaults for yatra_registrations
            await queryInterface.sequelize.query(
                `ALTER TABLE \`yatra_registrations\` 
         MODIFY COLUMN \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
         MODIFY COLUMN \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;`,
                { transaction }
            );

            // Fix created_at and updated_at defaults for persons
            await queryInterface.sequelize.query(
                `ALTER TABLE \`persons\` 
         MODIFY COLUMN \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
         MODIFY COLUMN \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;`,
                { transaction }
            );

            // Fix created_at default for registration_logs
            await queryInterface.sequelize.query(
                `ALTER TABLE \`registration_logs\` 
         MODIFY COLUMN \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;`,
                { transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            console.error('Error in migration 20260113000001-fix-timestamp-defaults:', error);
            throw error;
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Revert yatra_registrations
            await queryInterface.sequelize.query(
                `ALTER TABLE \`yatra_registrations\` 
         MODIFY COLUMN \`created_at\` DATETIME NOT NULL,
         MODIFY COLUMN \`updated_at\` DATETIME NOT NULL;`,
                { transaction }
            );

            // Revert persons
            await queryInterface.sequelize.query(
                `ALTER TABLE \`persons\` 
         MODIFY COLUMN \`created_at\` DATETIME NOT NULL,
         MODIFY COLUMN \`updated_at\` DATETIME NOT NULL;`,
                { transaction }
            );

            // Revert registration_logs
            await queryInterface.sequelize.query(
                `ALTER TABLE \`registration_logs\` 
         MODIFY COLUMN \`created_at\` DATETIME NOT NULL;`,
                { transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            console.error('Error reverting migration 20260113000001-fix-timestamp-defaults:', error);
            throw error;
        }
    },
};
