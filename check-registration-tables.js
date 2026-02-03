const mysql = require('mysql2/promise');

async function checkRegistrationTables() {
    const connection = await mysql.createConnection({
        host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
        port: 4000,
        user: 'xCYoPu9NGb33H4D.root',
        password: 'tqW8ZkQBB7n1eMQG',
        database: 'test',
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Checking registration-related tables...');

        // Check if yatra_registrations table exists
        try {
            const [rows] = await connection.execute('DESCRIBE yatra_registrations');
            console.log('✅ yatra_registrations table exists');
            console.table(rows);
        } catch (error) {
            console.log('❌ yatra_registrations table does not exist');
        }

        // Check if persons table exists
        try {
            const [rows] = await connection.execute('DESCRIBE persons');
            console.log('✅ persons table exists');
        } catch (error) {
            console.log('❌ persons table does not exist');
        }

        // Check if registration_logs table exists
        try {
            const [rows] = await connection.execute('DESCRIBE registration_logs');
            console.log('✅ registration_logs table exists');
        } catch (error) {
            console.log('❌ registration_logs table does not exist');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkRegistrationTables();