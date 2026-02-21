import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

async function runFix() {
    console.log('Starting comprehensive DB repair script...');
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);
    const queryRunner = dataSource.createQueryRunner();

    try {
        console.log('Connecting to database...');
        await queryRunner.connect();

        // 1. Repair yatra_registrations table
        console.log('Checking yatra_registrations columns...');
        const regColumns = await queryRunner.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'yatra_registrations' 
            AND COLUMN_NAME IN ('split_pnr', 'original_pnr', 'document_status', 'document_rejection_reason')
            AND TABLE_SCHEMA = DATABASE()
        `);

        const existingRegCols = regColumns.map((c: any) => c.COLUMN_NAME);

        if (!existingRegCols.includes('split_pnr')) {
            console.log('Adding split_pnr to yatra_registrations...');
            await queryRunner.query(`
                ALTER TABLE yatra_registrations 
                ADD COLUMN split_pnr VARCHAR(10) NULL COMMENT 'System-generated internal PNR for split registrations'
            `);
        }

        if (!existingRegCols.includes('original_pnr')) {
            console.log('Adding original_pnr to yatra_registrations...');
            await queryRunner.query(`
                ALTER TABLE yatra_registrations 
                ADD COLUMN original_pnr VARCHAR(12) NULL COMMENT 'Original PNR from railway booking for split registrations'
            `);
        }

        if (!existingRegCols.includes('document_status')) {
            console.log('Adding document_status to yatra_registrations...');
            await queryRunner.query(`
                ALTER TABLE yatra_registrations 
                ADD COLUMN document_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'
            `);
        }

        if (!existingRegCols.includes('document_rejection_reason')) {
            console.log('Adding document_rejection_reason to yatra_registrations...');
            await queryRunner.query(`
                ALTER TABLE yatra_registrations 
                ADD COLUMN document_rejection_reason TEXT NULL
            `);
        }

        // Add indexes for yatra_registrations
        try {
            await queryRunner.query(`CREATE INDEX idx_registration_split_pnr ON yatra_registrations(split_pnr)`);
        } catch (e: any) {
            console.log('Index split_pnr already exists or failed:', e.message);
        }

        try {
            await queryRunner.query(`CREATE INDEX idx_registration_original_pnr ON yatra_registrations(original_pnr)`);
        } catch (e: any) {
            console.log('Index original_pnr already exists or failed:', e.message);
        }

        // 2. Repair hotels table
        console.log('Checking hotels columns...');
        const hotelColumns = await queryRunner.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'hotels' 
            AND COLUMN_NAME IN ('visiting_card_image', 'advance_paid_amount', 'full_payment_paid')
            AND TABLE_SCHEMA = DATABASE()
        `);

        const existingHotelCols = hotelColumns.map((c: any) => c.COLUMN_NAME);

        if (!existingHotelCols.includes('visiting_card_image')) {
            console.log('Adding visiting_card_image to hotels...');
            await queryRunner.query(`
                ALTER TABLE hotels 
                ADD COLUMN visiting_card_image VARCHAR(500) NULL COMMENT 'URL of the visiting card image'
            `);
        }

        if (!existingHotelCols.includes('advance_paid_amount')) {
            console.log('Adding advance_paid_amount to hotels...');
            await queryRunner.query(`
                ALTER TABLE hotels 
                ADD COLUMN advance_paid_amount DECIMAL(10, 2) DEFAULT 0.00
            `);
        }

        if (!existingHotelCols.includes('full_payment_paid')) {
            console.log('Adding full_payment_paid to hotels...');
            await queryRunner.query(`
                ALTER TABLE hotels 
                ADD COLUMN full_payment_paid TINYINT(1) DEFAULT 0
            `);
        }

        // 3. Repair registration_logs table
        console.log('Checking registration_logs action enum...');
        await queryRunner.query(`
            ALTER TABLE registration_logs 
            MODIFY COLUMN action ENUM('created', 'updated', 'cancelled', 'approved', 'rejected', 'split_registration_created') NOT NULL
        `);
        console.log('SUCCESS: Updated registration_logs action enum!');

        // 4. Repair users table
        console.log('Checking users columns...');
        const userColumns = await queryRunner.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'users' 
            AND COLUMN_NAME IN ('room_assignment_status', 'is_room_assigned', 'assigned_room_id')
            AND TABLE_SCHEMA = DATABASE()
        `);

        const existingUserCols = userColumns.map((c: any) => c.COLUMN_NAME);

        if (!existingUserCols.includes('room_assignment_status')) {
            console.log('Adding room_assignment_status to users...');
            await queryRunner.query(`
                ALTER TABLE users 
                ADD COLUMN room_assignment_status ENUM('draft', 'confirmed', 'alloted') NULL
            `);
        } else {
            console.log('Updating room_assignment_status ENUM values...');
            await queryRunner.query(`
                ALTER TABLE users 
                MODIFY COLUMN room_assignment_status ENUM('draft', 'confirmed', 'alloted') NULL
            `);
        }

        if (!existingUserCols.includes('is_room_assigned')) {
            console.log('Adding is_room_assigned to users...');
            await queryRunner.query(`
                ALTER TABLE users 
                ADD COLUMN is_room_assigned TINYINT(1) DEFAULT 0
            `);
        }

        if (!existingUserCols.includes('assigned_room_id')) {
            console.log('Adding assigned_room_id to users...');
            await queryRunner.query(`
                ALTER TABLE users 
                ADD COLUMN assigned_room_id CHAR(36) NULL
            `);
            // Add foreign key if needed, skipping for now to avoid complexity in repair script
        }

        console.log('SUCCESS: Database schema repair completed!');
    } catch (error) {
        console.error('FAILED to repair database:', error);
    } finally {
        await queryRunner.release();
        await app.close();
        process.exit(0);
    }
}

runFix();
