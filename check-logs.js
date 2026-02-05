const { Sequelize } = require('sequelize');
const config = require('./src/config/database').production;

async function checkLogColumns() {
    const sequelize = new Sequelize(config.database, config.username, config.password, {
        host: config.host,
        port: config.port,
        dialect: config.dialect,
        dialectOptions: config.dialectOptions
    });

    try {
        const [results] = await sequelize.query("SHOW COLUMNS FROM registration_logs LIKE 'action'");
        console.log('Action column info:');
        results.forEach(col => console.log(`- Type: ${col.Type}`));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkLogColumns();
