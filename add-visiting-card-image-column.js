const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '.env.preview' });

const sequelize = new Sequelize(
    process.env.DB_NAME_PREVIEW,
    process.env.DB_USER_PREVIEW,
    process.env.DB_PASSWORD_PREVIEW,
    {
        host: process.env.DB_HOST_PREVIEW,
        port: process.env.DB_PORT_PREVIEW,
        dialect: 'mysql',
        dialectOptions: {
            ssl: {
                rejectUnauthorized: false
            }
        }
    }
);

async function addVisitingCardImageColumn() {
    try {
        console.log('Adding visiting_card_image column to hotels table...');

        // Add visiting_card_image column
        await sequelize.query(`
            ALTER TABLE hotels 
            ADD COLUMN visiting_card_image VARCHAR(500) NULL
            COMMENT 'URL of the visiting card image'
        `);
        console.log('✅ Added visiting_card_image column');

        // Verify the column was added
        const [results] = await sequelize.query("DESCRIBE hotels");
        const hasColumn = results.some(col => col.Field === 'visiting_card_image');
        console.log(`✅ Column exists: ${hasColumn}`);

        console.log('\n🎉 Successfully added visiting_card_image column to hotels table!');

    } catch (error) {
        console.error('❌ Error adding column:', error.message);
    } finally {
        await sequelize.close();
    }
}

addVisitingCardImageColumn();