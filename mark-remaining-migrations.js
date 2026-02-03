const mysql = require('mysql2/promise');

async function markRemainingMigrations() {
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
        console.log('Marking remaining migrations as completed...');

        // Mark the remaining migrations as completed
        const migrationsToMark = [
            '20260124000001-add-mobile-banner-image-to-yatra.js',
            '20260129000001-upgrade-pnr-and-ticket-type.js',
            '20260130000001-add-tbs-to-ticket-type.js',
            '20260131000001-add-split-pnr-fields.js'
        ];

        for (const migration of migrationsToMark) {
            await connection.execute('INSERT IGNORE INTO SequelizeMeta (name) VALUES (?)', [migration]);
            console.log(`✅ Marked ${migration} as completed`);
        }

        console.log('✅ All remaining migrations marked as completed');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

markRemainingMigrations();