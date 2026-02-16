import { DataSource } from 'typeorm';
import { AdminUser } from './entities/admin-user.entity';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load .env manually
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

async function updateAdminPassword() {
    const dataSource = new DataSource({
        type: 'mysql',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [__dirname + '/entities/*.entity.ts'],
        synchronize: false,
        logging: false,
    });

    try {
        await dataSource.initialize();
        console.log('Database connected.');

        const adminRepo = dataSource.getRepository(AdminUser);
        const email = 'admin@yatra.com';
        const user = await adminRepo.findOne({ where: { email } });

        if (!user) {
            console.log(`User ${email} not found!`);
            return;
        }

        console.log(`Found user: ${user.email} (ID: ${user.id})`);

        // The entity has a BeforeUpdate hook that will hash this
        user.password_hash = 'SuperAdmin@Yatra13';

        await adminRepo.save(user);
        console.log('Password updated successfully.');

    } catch (error) {
        console.error('Error updating password:', error);
    } finally {
        await dataSource.destroy();
    }
}

updateAdminPassword();
