const mysql = require('mysql2/promise');

async function checkTables() {
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
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('Available tables:');
        console.table(tables);
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkTables();