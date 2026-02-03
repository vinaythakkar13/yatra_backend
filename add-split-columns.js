const mysql = require('mysql2/promise');

async function addSplitColumns() {
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
        console.log('Adding split_pnr and original_pnr columns...');

        // Add split_pnr column
        try {
            await connection.execute('ALTER TABLE yatra_registrations ADD COLUMN split_pnr VARCHAR(10) NULL COMMENT "System-generated internal PNR for split registrations"');
            console.log('✅ Added split_pnr column');
        } catch (error) {
            if (error.message.includes('Duplicate column name')) {
                console.log('✅ split_pnr column already exists');
            } else {
                throw error;
            }
        }

        // Add original_pnr column
        try {
            await connection.execute('ALTER TABLE yatra_registrations ADD COLUMN original_pnr VARCHAR(12) NULL COMMENT "Original PNR from railway booking for split registrations"');
            console.log('✅ Added original_pnr column');
        } catch (error) {
            if (error.message.includes('Duplicate column name')) {
                console.log('✅ original_pnr column already exists');
            } else {
                throw error;
            }
        }

        // Add indexes
        try {
            await connection.execute('CREATE INDEX idx_registration_split_pnr ON yatra_registrations (split_pnr)');
            console.log('✅ Added index on split_pnr');
        } catch (error) {
            if (error.message.includes('Duplicate key name')) {
                console.log('✅ Index on split_pnr already exists');
            } else {
                throw error;
            }
        }

        try {
            await connection.execute('CREATE INDEX idx_registration_original_pnr ON yatra_registrations (original_pnr)');
            console.log('✅ Added index on original_pnr');
        } catch (error) {
            if (error.message.includes('Duplicate key name')) {
                console.log('✅ Index on original_pnr already exists');
            } else {
                throw error;
            }
        }

        // Verify the columns were added
        const [rows] = await connection.execute('DESCRIBE yatra_registrations');
        console.log('\nUpdated yatra_registrations table structure:');
        console.table(rows.filter(row => row.Field.includes('pnr')));

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

addSplitColumns();