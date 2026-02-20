require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkColumns() {
    const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        ssl: { rejectUnauthorized: false }
    };

    console.log(`Connecting to ${config.host}:${config.port}/${config.database} as ${config.user}...`);

    try {
        const connection = await mysql.createConnection(config);
        console.log('Connected!');

        const [rows] = await connection.execute(`SHOW COLUMNS FROM hotels`);

        console.log('Columns in hotels table:');
        rows.forEach(row => {
            console.log(`- ${row.Field} (${row.Type})`);
        });

        const loginId = rows.find(r => r.Field === 'login_id');
        const passwordHash = rows.find(r => r.Field === 'password_hash');

        if (loginId && passwordHash) {
            console.log('\nSUCCESS: Both login_id and password_hash columns exist.');

            // Try running the query that failed (simplified)
            console.log('\nTesting SELECT query...');
            try {
                const [rows] = await connection.execute(
                    "SELECT `Hotel`.`id` AS `Hotel_id`, `Hotel`.`login_id` AS `Hotel_login_id` FROM `hotels` `Hotel` LIMIT 1"
                );
                console.log('SUCCESS: SELECT query works!');
                if (rows.length > 0) {
                    console.log('Sample data:', rows[0]);
                } else {
                    console.log('Query returned no rows (table empty?), but executed successfully.');
                }
            } catch (queryErr) {
                console.error('FAILURE: SELECT query failed:', queryErr);
            }

        } else {
            console.log('\nFAILURE: Missing columns!');
            if (!loginId) console.log('- login_id is MISSING');
            if (!passwordHash) console.log('- password_hash is MISSING');
        }

        await connection.end();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkColumns();
