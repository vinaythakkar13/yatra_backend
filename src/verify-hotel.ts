import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { Hotel } from './entities/hotel.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Manual override to ensure we load from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });

async function checkSpecificHotel() {
    console.log('Starting Specific Hotel Check (Forcing .env load)...');

    // Explicitly check what we loaded
    console.log('DB_HOST from env:', process.env.DB_HOST);
    console.log('DB_NAME from env:', process.env.DB_NAME);

    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);

    try {
        if (!dataSource.isInitialized) {
            await dataSource.initialize();
        }

        const options = dataSource.options as any;
        console.log('---------------------------------------------------');
        console.log('CONNECTED TO DATABASE:');
        console.log('Host:', options.host);
        console.log('Database:', options.database);
        console.log('Port:', options.port);
        console.log('User:', options.username);
        console.log('---------------------------------------------------');

        const targetId = "f45910e0-faab-4313-bcc0-9ff60ee06194";
        const hotelRepo = dataSource.getRepository(Hotel);

        const hotel = await hotelRepo.findOne({
            where: { id: targetId },
            relations: ['rooms']
        });

        if (hotel) {
            console.log('✅ HOTEL FOUND!');
            console.log('ID:', hotel.id);
            console.log('Name:', hotel.name);
            console.log('Total Floors (Column):', hotel.total_floors);
            console.log('Floors (JSON Column):', JSON.stringify(hotel.floors, null, 2));
            console.log('Rooms (Relation Count):', hotel.rooms.length);
            if (hotel.rooms.length > 0) {
                console.log('Sample Room:', JSON.stringify(hotel.rooms[0], null, 2));
            } else {
                console.log('⚠️ No rooms found in relation.');
            }
        } else {
            console.log('❌ HOTEL NOT FOUND with ID:', targetId);
            console.log('Listing top 5 hotels in this DB to compare IDs:');
            const hotels = await hotelRepo.find({ take: 5, select: ['id', 'name'] });
            hotels.forEach(h => console.log(`- ${h.name}: ${h.id}`));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await app.close();
        process.exit(0);
    }
}

checkSpecificHotel();
