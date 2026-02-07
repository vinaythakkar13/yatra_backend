import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import * as path from 'path';

async function fixPreview() {
    console.log('Starting emergency Preview DB fix...');

    // Load .env.preview
    dotenv.config({ path: path.join(__dirname, '../.env.preview') });

    const config = {
        host: process.env.DB_HOST_PREVIEW,
        port: parseInt(process.env.DB_PORT_PREVIEW || '4000'),
        user: process.env.DB_USER_PREVIEW,
        password: process.env.DB_PASSWORD_PREVIEW,
        database: process.env.DB_NAME_PREVIEW,
        ssl: {
            rejectUnauthorized: false,
        },
    };

    console.log(`Connecting to ${config.database} at ${config.host}...`);

    try {
        const connection = await mysql.createConnection(config);
        console.log('Connected!');

        const [columns]: any = await connection.query('SHOW COLUMNS FROM yatra_registrations');
        const columnNames = columns.map((c: any) => c.Field);

        if (!columnNames.includes('document_status')) {
            console.log('Adding document_status...');
            await connection.query("ALTER TABLE yatra_registrations ADD COLUMN document_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'");
        } else {
            console.log('document_status already exists.');
        }

        if (!columnNames.includes('document_rejection_reason')) {
            console.log('Adding document_rejection_reason...');
            await connection.query("ALTER TABLE yatra_registrations ADD COLUMN document_rejection_reason TEXT NULL");
        } else {
            console.log('document_rejection_reason already exists.');
        }

        console.log('Preview DB fix complete!');
        await connection.end();
    } catch (error) {
        console.error('Error fixing Preview DB:', error);
    }
}

fixPreview();
