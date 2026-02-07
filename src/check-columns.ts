import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

async function checkColumns() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);
    const queryRunner = dataSource.createQueryRunner();

    try {
        await queryRunner.connect();
        const columns = await queryRunner.query(`
            SHOW COLUMNS FROM yatra_registrations
        `);
        console.log('Columns in yatra_registrations:');
        console.table(columns);
    } catch (error) {
        console.error(error);
    } finally {
        await queryRunner.release();
        await app.close();
    }
}

checkColumns();
