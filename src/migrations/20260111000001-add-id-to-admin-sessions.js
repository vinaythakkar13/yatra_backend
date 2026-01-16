'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the id column already exists
    const [results] = await queryInterface.sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'admin_sessions' 
      AND COLUMN_NAME = 'id'
    `);

    // If id column doesn't exist, add it
    if (results.length === 0) {
      // Check if table has any data
      const [countResults] = await queryInterface.sequelize.query(`
        SELECT COUNT(*) as count FROM \`admin_sessions\`
      `);
      const rowCount = countResults[0].count;

      // First, check if there's a primary key constraint
      const [pkResults] = await queryInterface.sequelize.query(`
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'admin_sessions' 
        AND CONSTRAINT_TYPE = 'PRIMARY KEY'
      `);

      // If there's an existing primary key, we need to drop it first
      if (pkResults.length > 0) {
        await queryInterface.sequelize.query(`
          ALTER TABLE \`admin_sessions\` DROP PRIMARY KEY
        `);
      }

      if (rowCount === 0) {
        // Table is empty, safe to add NOT NULL column
        await queryInterface.addColumn('admin_sessions', 'id', {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
          first: true,
        });
      } else {
        // Table has data, add column as nullable first, then populate, then make it NOT NULL
        await queryInterface.addColumn('admin_sessions', 'id', {
          type: Sequelize.UUID,
          allowNull: true,
          first: true,
        });

        // Generate UUIDs for existing rows
        await queryInterface.sequelize.query(`
          UPDATE \`admin_sessions\` 
          SET \`id\` = UUID()
          WHERE \`id\` IS NULL
        `);

        // Make it NOT NULL and set as primary key
        await queryInterface.sequelize.query(`
          ALTER TABLE \`admin_sessions\` 
          MODIFY COLUMN \`id\` CHAR(36) BINARY NOT NULL,
          ADD PRIMARY KEY (\`id\`)
        `);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the primary key first, then the column
    await queryInterface.sequelize.query(`
      ALTER TABLE \`admin_sessions\` DROP PRIMARY KEY
    `);
    await queryInterface.removeColumn('admin_sessions', 'id');
  }
};
