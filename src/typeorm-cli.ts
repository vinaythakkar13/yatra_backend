import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { join } from 'path';

config();

const configService = new ConfigService();
const isPreview = configService.get<string>('NODE_ENV') === 'preview';
const suffix = isPreview ? '_PREVIEW' : '';

export default new DataSource({
    type: 'mysql',
    host: configService.get<string>(`DB_HOST${suffix}`) || configService.get<string>('DB_HOST') || 'localhost',
    port: configService.get<number>(`DB_PORT${suffix}`) || configService.get<number>('DB_PORT') || 3306,
    username: configService.get<string>(`DB_USER${suffix}`) || configService.get<string>('DB_USER') || 'root',
    password: configService.get<string>(`DB_PASSWORD${suffix}`) || configService.get<string>('DB_PASSWORD') || '',
    database: configService.get<string>(`DB_NAME${suffix}`) || configService.get<string>('DB_NAME') || 'yatra_db',
    entities: [join(__dirname, '**/*.entity{.ts,.js}')],
    migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
    synchronize: false,
});
