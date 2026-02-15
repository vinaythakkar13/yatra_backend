
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const { DataSource } = require('typeorm');

// Manual .env parsing
try {
    const envConfig = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
    console.log('Manually loaded .env');
} catch (e) {
    console.error('Error loading .env manually:', e);
}

async function debugRooms() {
    console.log('Connecting to DB...');

    // 1. SQL Connection
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    });

    const testUserId = '01550009-d3f7-48be-b6e3-c6b426d615db';
    let testRoomId = null;

    try {
        // Check schema and fix if needed
        const [columns] = await connection.execute('DESCRIBE users');
        const hasStatus = columns.some(c => c.Field === 'room_assignment_status');
        console.log(`\nCurrent DB (${process.env.DB_NAME}) has room_assignment_status: ${hasStatus}`);

        if (!hasStatus) {
            console.log('Adding missing column room_assignment_status...');
            await connection.execute("ALTER TABLE users ADD COLUMN room_assignment_status ENUM('draft', 'confirmed') DEFAULT NULL");
            console.log('Column added.');
        }

        // Find a room
        const [rooms] = await connection.execute('SELECT id FROM rooms LIMIT 1');
        if (rooms.length === 0) {
            console.log('No rooms found in DB to test with.');
            await connection.end();
            return;
        }
        testRoomId = rooms[0].id;

        console.log(`\nTEST: Assigning Room ${testRoomId} to User ${testUserId}...`);
        await connection.execute('UPDATE rooms SET assigned_to_user_id = ? WHERE id = ?', [testUserId, testRoomId]);

        // Also update User flag as the app does
        await connection.execute('UPDATE users SET is_room_assigned = 1, assigned_room_id = ?, room_assignment_status = ? WHERE id = ?', [testRoomId, 'draft', testUserId]);

        console.log('Assignment simulated in DB.');
        await connection.end();

    } catch (e) {
        console.error('SQL Check/Fix failed:', e);
        if (connection && !connection._closing) await connection.end();
        return;
    }

    // 2. TypeORM Check
    console.log('\nInitializing TypeORM DataSource...');
    const dataSource = new DataSource({
        type: 'mysql',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        username: process.env.DB_USER || process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [path.join(__dirname, 'dist/src/entities/*.js')],
        synchronize: false,
        logging: ['error']
    });

    try {
        await dataSource.initialize();
        console.log('DataSource initialized.');

        const userRepo = dataSource.getRepository('User');
        console.log(`Fetching User ${testUserId} with relations...`);

        const user = await userRepo.findOne({
            where: { id: testUserId },
            relations: {
                assignedRooms: {
                    hotel: true
                }
            }
        });

        if (user) {
            console.log('User found via TypeORM.');
            console.log('User Name:', user.name);
            console.log('User assignedRooms count:', user.assignedRooms ? user.assignedRooms.length : 'UNDEFINED');
            if (user.assignedRooms && user.assignedRooms.length > 0) {
                console.log('First Room:', JSON.stringify(user.assignedRooms[0], null, 2));
                console.log('SUCCESS: assignedRooms populated correctly.');
            } else {
                console.log('FAILURE: assignedRooms is empty/undefined despite SQL assignment!');
            }
        } else {
            console.log('User NOT found via TypeORM (unexpected).');
        }

    } catch (error) {
        console.error('TypeORM Error:', error);
    } finally {
        if (dataSource.isInitialized) await dataSource.destroy();

        // Cleanup
        console.log('\nCleaning up test assignment...');
        const cleanupConn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || process.env.DB_USERNAME || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: { rejectUnauthorized: false }
        });
        await cleanupConn.execute('UPDATE rooms SET assigned_to_user_id = NULL WHERE id = ?', [testRoomId]);
        await cleanupConn.execute('UPDATE users SET is_room_assigned = 0, assigned_room_id = NULL, room_assignment_status = NULL WHERE id = ?', [testUserId]);
        await cleanupConn.end();
        console.log('Cleanup done.');
    }
}

debugRooms();
