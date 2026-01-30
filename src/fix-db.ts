import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

async function runFix() {
    console.log('Starting DB fix script...');
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);
    const queryRunner = dataSource.createQueryRunner();

    try {
        console.log('Connecting to database...');
        await queryRunner.connect();

        console.log('Modifying ticket_type column...');
        await queryRunner.query(`
            ALTER TABLE yatra_registrations 
            MODIFY COLUMN ticket_type ENUM(
                'FLIGHT', 
                'BUS', 
                'FIRST_AC', 
                'SECOND_AC', 
                'THIRD_AC', 
                'SLEEPER', 
                'GENERAL', 
                'TBS', 
                'WL', 
                'RAC'
            ) DEFAULT NULL
        `);

        console.log('SUCCESS: ticket_type column updated successfully!');
    } catch (error) {
        console.error('FAILED to update column:', error);
    } finally {
        await queryRunner.release();
        await app.close();
        process.exit(0);
    }
}

runFix();
