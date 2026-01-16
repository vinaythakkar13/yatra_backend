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
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter, HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'mysql',
    //     host: configService.get<string>('DB_HOST') || 'localhost',
    //     port: configService.get<number>('DB_PORT') || 3306,
    //     username: configService.get<string>('DB_USER') || 'root',
    //     password: configService.get<string>('DB_PASSWORD') || '',
    //     database: configService.get<string>('DB_NAME') || 'yatra_db',
    //     entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //     synchronize: false, // Disabled: tables already exist from Sequelize migrations
    //     logging: configService.get<string>('NODE_ENV') === 'development' ? ['error', 'warn'] : false,
    //     extra: {
    //       connectionLimit: configService.get<string>('NODE_ENV') === 'production' ? 10 : 5,
    //     },
    //   }),
    //   inject: [ConfigService],
    // }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbHost = configService.get<string>('DB_HOST') || 'localhost';
        const dbPort = configService.get<number>('DB_PORT') || 3306;
        const dbUser = configService.get<string>('DB_USER') || 'root';
        const dbPassword = configService.get<string>('DB_PASSWORD') || '';
        const dbName = configService.get<string>('DB_NAME') || 'yatra_db';
        const nodeEnv = configService.get<string>('NODE_ENV');


        return {
          type: 'mysql',
          host: dbHost,
          port: dbPort,
          username: dbUser,
          password: dbPassword,
          database: dbName,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: false,
          logging: nodeEnv === 'development' ? ['error', 'warn'] : false,
          extra: {
            connectionLimit: nodeEnv === 'production' ? 10 : 5,
          },
          // ✅ REQUIRED FOR AIVEN / CLOUD MYSQL
          ssl:
            nodeEnv === 'production'
              ? { rejectUnauthorized: false }
              : undefined,
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
