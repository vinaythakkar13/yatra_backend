
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Room } from './entities/room.entity';
import { YatraRegistration } from './entities/yatra-registration.entity';
import { Hotel } from './entities/hotel.entity';
import { Person } from './entities/person.entity';
import { Yatra } from './entities/yatra.entity';
import { RegistrationLog } from './entities/registration-log.entity';
import { EventParticipant } from './entities/event-participant.entity';
import { AdminUser } from './entities/admin-user.entity';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Manual .env parsing
try {
    const envConfig = fs.readFileSync(__dirname + '/../.env', 'utf8');
    const loadedKeys: string[] = [];
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
            loadedKeys.push(key.trim());
        }
    });
    console.log('Manually loaded .env keys:', loadedKeys.join(', '));
} catch (e) {
    console.error('Error loading .env manually:', e);
}

console.log('DB Config:', {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER || process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD ? '***' : 'MISSING',
    database: process.env.DB_NAME,
});

async function debugRooms() {
    const dataSource = new DataSource({
        type: 'mysql',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        username: process.env.DB_USER || process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [__dirname + '/entities/*.entity.ts'],
        synchronize: false,
    });

    try {
        await dataSource.initialize();
        console.log('Database connected');

        const userId = '73c74015-b3f4-4281-9280-4cbfca9145f6';

        // 1. Fetch User directly
        console.log(`Fetching User ${userId}...`);
        const user = await dataSource.getRepository(User).findOne({
            where: { id: userId },
            relations: {
                assignedRooms: {
                    hotel: true
                }
            }
        });

        console.log('User found:', user ? 'Yes' : 'No');
        if (user) {
            console.log('User Name:', user.name);
            console.log('User is_room_assigned:', user.is_room_assigned);
            console.log('User assigned_room_id (legacy):', user.assigned_room_id);
            console.log('User assignedRooms count:', user.assignedRooms?.length);
            console.log('User assignedRooms:', JSON.stringify(user.assignedRooms, null, 2));
        }

        // 2. Fetch Rooms directly by assigned_to_user_id
        console.log('\nFetching Rooms directly where assigned_to_user_id =', userId);
        const rooms = await dataSource.getRepository(Room).find({
            where: { assigned_to_user_id: userId },
            relations: { hotel: true }
        });
        console.log('Rooms found via direct query:', rooms.length);
        console.log('Rooms:', JSON.stringify(rooms, null, 2));

        // 3. Fetch Registration
        console.log('\nFetching Registration for user...');
        const registration = await dataSource.getRepository(YatraRegistration).findOne({
            where: { user_id: userId },
            relations: {
                user: {
                    assignedRooms: {
                        hotel: true
                    }
                }
            }
        });
        console.log('Registration found:', registration ? 'Yes' : 'No');
        if (registration && registration.user) {
            console.log('Registration User assignedRooms count:', registration.user.assignedRooms?.length);
        }

    } catch (error) {
        console.error('Error during debug:', error);
    } finally {
        await dataSource.destroy();
    }
}

debugRooms();
