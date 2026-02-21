import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { HotelsModule } from './hotels/hotels.module';
import { UsersModule } from './users/users.module';
import { YatraModule } from './yatra/yatra.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter, HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.preview', '.env'], // Load preview first, then fallback to .env
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isPreview = configService.get<string>('NODE_ENV') === 'preview';
        const suffix = isPreview ? '_PREVIEW' : '';

        return {
          type: 'mysql',
          host: configService.get<string>(`DB_HOST${suffix}`) || configService.get<string>('DB_HOST') || 'localhost',
          port: configService.get<number>(`DB_PORT${suffix}`) || configService.get<number>('DB_PORT') || 3306,
          username: configService.get<string>(`DB_USER${suffix}`) || configService.get<string>('DB_USER') || 'root',
          password: configService.get<string>(`DB_PASSWORD${suffix}`) || configService.get<string>('DB_PASSWORD') || '',
          database: configService.get<string>(`DB_NAME${suffix}`) || configService.get<string>('DB_NAME') || 'yatra_db',
          autoLoadEntities: true,
          synchronize: false, // Disabled: tables already exist from Sequelize migrations
          logging: configService.get<string>('NODE_ENV') === 'development' ? ['error', 'warn'] : false,
          timezone: 'Z', // Force UTC timezone
          ssl: {
            rejectUnauthorized: false, // For cloud databases that require SSL
          },
          extra: {
            connectionLimit: configService.get<string>('NODE_ENV') === 'production' ? 10 : 5,
            waitForConnections: true,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
            idleTimeout: 30000,
            maxIdle: 5,
            connectTimeout: 0, // No timeout
            acquireTimeout: 0, // No timeout
          },
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    HotelsModule,
    UsersModule,
    YatraModule,
    CloudinaryModule,
    RegistrationsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule { }
