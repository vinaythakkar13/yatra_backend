const mysql = require('mysql2/promise');

async function fixMigrations() {
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
        console.log('Marking problematic migrations as completed...');

        // Mark the problematic migrations as completed
        const migrationsToMark = [
            '20251014000002-add-description-to-yatra.js',
            '20251015000001-add-hotel-and-room-fields.js',
            '20251015000002-add-distance-from-bhavan-to-hotel.js',
            '20260111000001-add-id-to-admin-sessions.js'
        ];

        for (const migration of migrationsToMark) {
            await connection.execute('INSERT IGNORE INTO SequelizeMeta (name) VALUES (?)', [migration]);
            console.log(`✅ Marked ${migration} as completed`);
        }

        console.log('✅ All problematic migrations marked as completed');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

fixMigrations();